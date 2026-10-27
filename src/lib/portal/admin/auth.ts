import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyPassword } from '@/lib/pro/password'

/**
 * Crazy Seal Admin sign-in (the owner side of the portal at /portal/admin).
 *
 * Admin users live in env, not the database:
 *   PORTAL_ADMIN_USERS=email|Display Name|salt:hash[,email|Name|salt:hash…]
 *   PORTAL_SESSION_SECRET=<32+ random characters>
 * Hashes use the same scrypt format as Pro Hub passwords — generate one with
 * `node scripts/portal-admin-hash.mjs "<password>"`. With either variable
 * missing, admin sign-in is off (fails closed).
 */

export const ADMIN_COOKIE = 'cs_portal_admin'
const SESSION_SECONDS = 60 * 60 * 24 * 7
const MAX_FAILURES = 8
const LOCKOUT_MS = 15 * 60 * 1000

export interface PortalAdmin {
  email: string
  name: string
}

interface AdminEntry extends PortalAdmin {
  hash: string
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
  return { email: entry.email, name: entry.name }
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
}

export async function getPortalAdmin(): Promise<PortalAdmin | null> {
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
    return entry ? { email: entry.email, name: entry.name } : null
  } catch {
    return null
  }
}

export async function requirePortalAdmin(): Promise<PortalAdmin> {
  const admin = await getPortalAdmin()
  if (!admin) redirect('/portal/login/')
  return admin
}
