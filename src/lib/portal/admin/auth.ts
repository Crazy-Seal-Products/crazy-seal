import { createHmac, timingSafeEqual } from 'node:crypto'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyPassword } from '@/lib/pro/password'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { memo } from './cache'

/**
 * Crazy Seal Admin sign-in (the owner side of the portal at /portal/admin).
 *
 * Two ways in, checked in this order:
 *
 * 1. Staff accounts: the Supabase logins in the `staff` table (active rows
 *    only) that the old site admin used. Adding or removing someone is a row
 *    in that table, managed from the admin's Staff page.
 * 2. Env users, a fallback that works even if Supabase auth is down:
 *      PORTAL_ADMIN_USERS=email|Display Name|salt:hash[,email|Name|salt:hash…]
 *      PORTAL_SESSION_SECRET=<32+ random characters>
 *    Hashes use the same scrypt format as Pro Hub passwords — generate one
 *    with `node scripts/portal-admin-hash.mjs "<password>"`. With either
 *    variable missing, this path is off (fails closed).
 */

export const ADMIN_COOKIE = 'cs_portal_admin'
const SESSION_SECONDS = 60 * 60 * 24 * 7
const MAX_FAILURES = 8
const LOCKOUT_MS = 15 * 60 * 1000

export interface PortalAdmin {
  email: string
  name: string
  role: string
  /** How they signed in: their staff account, or the env backup login. */
  via: 'staff' | 'env'
}

interface AdminEntry {
  email: string
  name: string
  hash: string
}

function envAdmin(entry: AdminEntry): PortalAdmin {
  return { email: entry.email, name: entry.name, role: 'admin', via: 'env' }
}

function adminEntries(): Map<string, AdminEntry> {
  const map = new Map<string, AdminEntry>()
  for (const raw of (process.env.PORTAL_ADMIN_USERS ?? '').split(',')) {
    const [email, name, hash] = raw.split('|').map((p) => p?.trim() ?? '')
    if (!email || !hash) continue
    const key = email.toLowerCase()
    map.set(key, { email: key, name: name || key.split('@')[0], hash })
  }
  return map
}

function sessionSecret(): string | null {
  const secret = process.env.PORTAL_SESSION_SECRET ?? ''
  return secret.length >= 32 ? secret : null
}

export function isAdminEmail(email: string): boolean {
  return adminEntries().has(email.trim().toLowerCase())
}

// In-memory brute-force guard. Per server instance only, which is enough to
// slow guessing; a shared limiter can replace it if this goes multi-region.
const failures = new Map<string, { count: number; until: number }>()

export function isLockedOut(email: string): boolean {
  const entry = failures.get(email.toLowerCase())
  return Boolean(entry && entry.count >= MAX_FAILURES && Date.now() < entry.until)
}

export async function verifyAdminCredentials(email: string, password: string): Promise<PortalAdmin | null> {
  const key = email.trim().toLowerCase()
  const entry = adminEntries().get(key)
  if (!entry || !sessionSecret()) return null

  const ok = await verifyPassword(password, entry.hash)
  if (!ok) {
    const prev = failures.get(key)
    const count = prev && Date.now() < prev.until ? prev.count + 1 : 1
    failures.set(key, { count, until: Date.now() + LOCKOUT_MS })
    return null
  }
  failures.delete(key)
  return envAdmin(entry)
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export async function startAdminSession(admin: PortalAdmin) {
  const secret = sessionSecret()
  if (!secret) throw new Error('PORTAL_SESSION_SECRET is not set')
  const payload = Buffer.from(
    JSON.stringify({ e: admin.email, x: Math.floor(Date.now() / 1000) + SESSION_SECONDS }),
  ).toString('base64url')
  const store = await cookies()
  store.set(ADMIN_COOKIE, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_SECONDS,
  })
}

export async function endAdminSession() {
  const store = await cookies()
  store.delete(ADMIN_COOKIE)
  await (await createClient()).auth.signOut()
}

// ─── Staff accounts (Supabase auth + the `staff` table) ───

export interface StaffRow {
  id: string
  auth_user_id: string | null
  name: string | null
  email: string
  role: string | null
  is_active: boolean
  created_at?: string
}

async function activeStaff(column: 'email' | 'auth_user_id', value: string): Promise<StaffRow | null> {
  const { data } = await createAdminClient()
    .from('staff')
    .select('*')
    .eq(column, value)
    .eq('is_active', true)
    .maybeSingle()
  return (data as StaffRow | null) ?? null
}

function staffAdmin(row: StaffRow): PortalAdmin {
  const email = row.email.toLowerCase()
  return { email, name: row.name?.trim() || email.split('@')[0], role: row.role || 'admin', via: 'staff' }
}

export async function isStaffEmail(email: string): Promise<boolean> {
  return Boolean(await activeStaff('email', email.trim().toLowerCase()))
}

/** Signs in with the staff member's Supabase password (sets the Supabase session cookies). */
export async function verifyStaffCredentials(email: string, password: string): Promise<PortalAdmin | null> {
  const key = email.trim().toLowerCase()
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email: key, password })
  const staff = !error && data.user ? await activeStaff('auth_user_id', data.user.id) : null
  if (!staff) {
    if (data?.user) await supabase.auth.signOut()
    const prev = failures.get(key)
    const count = prev && Date.now() < prev.until ? prev.count + 1 : 1
    failures.set(key, { count, until: Date.now() + LOCKOUT_MS })
    return null
  }
  failures.delete(key)
  return staffAdmin(staff)
}

async function getStaffAdmin(): Promise<PortalAdmin | null> {
  const supabase = await createClient()
  // Checked against the project's signing keys locally, so admin pages skip a
  // round trip to Supabase Auth. src/proxy.ts refreshes the session cookies.
  // A cookie it can't read counts as signed out.
  const { data } = await supabase.auth.getClaims().catch(() => ({ data: null }))
  const userId = data?.claims.sub
  if (!userId) return null
  // Deactivating someone takes effect within a minute.
  const staff = await memo(`staff:${userId}`, 60_000, () => activeStaff('auth_user_id', userId))
  return staff ? staffAdmin(staff) : null
}

/** The signed-in admin from either path. Cached per request. */
export const getPortalAdmin = cache(async (): Promise<PortalAdmin | null> => {
  return (await getEnvAdmin()) ?? (await getStaffAdmin())
})

async function getEnvAdmin(): Promise<PortalAdmin | null> {
  const secret = sessionSecret()
  if (!secret) return null
  const token = (await cookies()).get(ADMIN_COOKIE)?.value
  if (!token) return null

  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = Buffer.from(sign(payload, secret))
  const given = Buffer.from(sig)
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null

  try {
    const { e, x } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { e?: string; x?: number }
    if (!e || !x || x * 1000 < Date.now()) return null
    // Removing someone from PORTAL_ADMIN_USERS ends their session too.
    const entry = adminEntries().get(e)
    return entry ? envAdmin(entry) : null
  } catch {
    return null
  }
}

export async function requirePortalAdmin(): Promise<PortalAdmin> {
  const admin = await getPortalAdmin()
  if (!admin) redirect('/portal/login/')
  return admin
}
