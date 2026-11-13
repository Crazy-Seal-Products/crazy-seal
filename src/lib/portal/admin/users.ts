import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { recentAccess, type AccessLogRow } from './access-log'
import { envAdminList, type StaffRow } from './auth'
import { memo } from './cache'
import { getPortalAccounts, type PortalAccountRow } from './dealers'
import { normalizeRole, TOP_ROLE, type AdminRole } from './sections'

/**
 * Every account that can sign in anywhere on crazyseal.com, for the Users &
 * roles page:
 *
 * - Supabase Auth logins (the admin's staff accounts), joined with `staff`
 *   for role and active state. A login with no staff row can't open the
 *   admin; it's listed so it can be given access or left alone.
 * - Backup logins from PORTAL_ADMIN_USERS (always the top role).
 * - Pro Hub dealers (`pro_users`): their own password or email-link sign-in,
 *   separate from Supabase Auth.
 */

export type AccountType = 'staff' | 'backup' | 'login' | 'dealer'

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  staff: 'Admin staff',
  backup: 'Backup login',
  login: 'Login only',
  dealer: 'Pro Hub dealer',
}

/** active / idle: signed in within 30 days or not. never: has access, no sign-in yet. off: no access. */
export type UserStatus = 'active' | 'idle' | 'never' | 'off'

export const USER_STATUS: Record<UserStatus, { label: string; tone: 'good' | 'info' | 'warn' | 'neutral' }> = {
  active: { label: 'Active', tone: 'good' },
  idle: { label: 'Idle 30d+', tone: 'info' },
  never: { label: 'Never signed in', tone: 'warn' },
  off: { label: 'No access', tone: 'neutral' },
}

export interface AdminUserRow {
  /** staff:<id> | auth:<id> | env:<email> | pro:<id> */
  key: string
  type: AccountType
  name: string
  email: string
  business: string | null
  /** Admin role, for staff and backup logins. */
  role: AdminRole | null
  status: UserStatus
  createdAt: string | null
  lastSignInAt: string | null
  signIn: string
  staffId: string | null
  authUserId: string | null
  proUserId: string | null
  /** Also has a backup (env) login, which signs in as the top role. */
  backup: boolean
  /** Pro Hub only: the dealer's account row. */
  dealer: PortalAccountRow | null
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

function statusFor(lastSignInAt: string | null): UserStatus {
  if (!lastSignInAt) return 'never'
  return Date.now() - Date.parse(lastSignInAt) < MONTH_MS ? 'active' : 'idle'
}

function latest(...dates: (string | null | undefined)[]): string | null {
  return dates.filter((d): d is string => Boolean(d)).sort().at(-1) ?? null
}

/** All Supabase Auth users, 1,000 a page. */
export function listAuthUsers(): Promise<User[]> {
  return memo('auth-users', 30_000, async () => {
    const db = createAdminClient()
    const users: User[] = []
    for (let page = 1; page <= 50; page++) {
      const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) throw new Error(error.message)
      users.push(...data.users)
      if (data.users.length < 1000) break
    }
    return users
  })
}

export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const wanted = email.toLowerCase()
  return (await listAuthUsers()).find((u) => u.email?.toLowerCase() === wanted)?.id ?? null
}

async function staffRows(): Promise<StaffRow[]> {
  const { data, error } = await createAdminClient().from('staff').select('*').order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as StaffRow[]
}

/** Latest logged admin sign-in per email (backup logins leave no other trace). */
async function loggedSignIns(): Promise<Map<string, string>> {
  const { data } = await createAdminClient()
    .from('admin_access_log')
    .select('actor_email, created_at')
    .eq('action', 'sign_in')
    .order('created_at', { ascending: false })
    .limit(2000)
  const map = new Map<string, string>()
  for (const r of (data ?? []) as { actor_email: string; created_at: string }[]) {
    if (!map.has(r.actor_email)) map.set(r.actor_email, r.created_at)
  }
  return map
}

export function signedInWithin(rows: AdminUserRow[], days: number): number {
  const since = Date.now() - days * 86_400_000
  return rows.filter((r) => r.lastSignInAt && Date.parse(r.lastSignInAt) > since).length
}

const TYPE_ORDER: Record<AccountType, number> = { staff: 0, backup: 1, login: 2, dealer: 3 }

export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const [auth, staff, portal, signIns] = await Promise.all([listAuthUsers(), staffRows(), getPortalAccounts(), loggedSignIns()])
  const authById = new Map(auth.map((u) => [u.id, u]))
  const env = new Map(envAdminList().map((e) => [e.email, e]))
  const rows: AdminUserRow[] = []
  const linkedAuth = new Set<string>()
  const staffEmails = new Set<string>()

  for (const s of staff) {
    const email = s.email.toLowerCase()
    const u = s.auth_user_id ? authById.get(s.auth_user_id) : undefined
    if (u) linkedAuth.add(u.id)
    staffEmails.add(email)
    const lastSignInAt = latest(u?.last_sign_in_at, signIns.get(email))
    const backup = env.has(email)
    rows.push({
      key: `staff:${s.id}`,
      type: 'staff',
      name: s.name?.trim() || (u?.user_metadata?.name as string | undefined) || email,
      email,
      business: null,
      role: normalizeRole(s.role),
      status: s.is_active && (u || backup) ? statusFor(lastSignInAt) : 'off',
      createdAt: s.created_at ?? u?.created_at ?? null,
      lastSignInAt,
      signIn: [u ? 'Password' : null, backup ? 'Backup login' : null].filter(Boolean).join(' · ') || 'No login yet',
      staffId: s.id,
      authUserId: u?.id ?? null,
      proUserId: null,
      backup,
      dealer: null,
    })
  }

  for (const u of auth) {
    if (linkedAuth.has(u.id)) continue
    const email = (u.email ?? '').toLowerCase()
    rows.push({
      key: `auth:${u.id}`,
      type: 'login',
      name: (u.user_metadata?.name as string | undefined) || email || u.id,
      email,
      business: null,
      role: null,
      status: 'off',
      createdAt: u.created_at ?? null,
      lastSignInAt: u.last_sign_in_at ?? null,
      signIn: 'Password (no admin access)',
      staffId: null,
      authUserId: u.id,
      proUserId: null,
      backup: false,
      dealer: null,
    })
  }

  for (const e of env.values()) {
    if (staffEmails.has(e.email)) continue
    const lastSignInAt = signIns.get(e.email) ?? null
    rows.push({
      key: `env:${e.email}`,
      type: 'backup',
      name: e.name,
      email: e.email,
      business: null,
      role: TOP_ROLE,
      status: statusFor(lastSignInAt),
      createdAt: null,
      lastSignInAt,
      signIn: 'Backup login',
      staffId: null,
      authUserId: null,
      proUserId: null,
      backup: true,
      dealer: null,
    })
  }

  for (const d of portal.rows) {
    rows.push({
      key: `pro:${d.id}`,
      type: 'dealer',
      name: d.name,
      email: d.email.toLowerCase(),
      business: d.business_name,
      role: null,
      status: statusFor(d.last_login_at),
      createdAt: d.created_at,
      lastSignInAt: d.last_login_at,
      signIn: d.has_password ? 'Password' : 'Email link',
      staffId: null,
      authUserId: null,
      proUserId: d.id,
      backup: false,
      dealer: d,
    })
  }

  return rows.sort(
    (a, b) =>
      TYPE_ORDER[a.type] - TYPE_ORDER[b.type] ||
      (b.lastSignInAt ?? '').localeCompare(a.lastSignInAt ?? '') ||
      a.name.localeCompare(b.name),
  )
}

// ─── Detail panel ──────────────────────────────────────────────────────────

export interface ActivityItem {
  at: string
  text: string
  href?: string
}

export interface UserDetail {
  auth: { confirmedAt: string | null; providers: string[]; factors: number; bannedUntil: string | null } | null
  /** Other accounts with the same email (a staff member who is also a dealer, say). */
  linked: AdminUserRow[]
  activity: ActivityItem[]
  /** Changes to this person's access, and changes they made (admins only; sign-ins are in `activity`). */
  access: AccessLogRow[]
}

const ACCESS_TEXT: Record<string, string> = {
  sign_in: 'Signed in to the admin',
  role_change: 'Role changed',
  access_on: 'Admin access turned on',
  access_off: 'Admin access turned off',
  staff_added: 'Added to staff',
  password_reset: 'Temporary password set',
  permissions: 'Permission matrix changed',
  password_changed: 'Changed their own password',
  profile_updated: 'Changed their own name',
  password_setup_sent: 'Emailed a set-password link',
  password_set_link: 'Set their password from the emailed link',
  sales_rep_link: 'Sales rep link changed',
}

export function accessText(row: AccessLogRow): string {
  const base = ACCESS_TEXT[row.action] ?? row.action
  const d = row.detail ?? {}
  if (row.action === 'role_change' && d.from && d.to) return `${base}: ${d.from} → ${d.to}`
  if (row.action === 'staff_added' && d.role) return `${base} as ${d.role}`
  if (row.action === 'sign_in' && d.via === 'env') return `${base} (backup login)`
  if (row.action === 'sales_rep_link' && d.rep) return d.linked ? `Linked to sales rep ${d.rep}` : `Unlinked from sales rep ${d.rep}`
  return base
}

export async function getUserDetail(row: AdminUserRow, all: AdminUserRow[]): Promise<UserDetail> {
  const db = createAdminClient()
  const linked = all.filter((r) => r.key !== row.key && r.email && r.email === row.email)
  const activity: ActivityItem[] = []

  if (row.type === 'dealer' && row.proUserId) {
    const [sessions, links, warranties, views] = await Promise.all([
      db.from('pro_sessions').select('created_at').eq('pro_user_id', row.proUserId).order('created_at', { ascending: false }).limit(10),
      db.from('pro_magic_links').select('created_at, used_at').eq('email', row.email).order('created_at', { ascending: false }).limit(5),
      db
        .from('warranty_registrations')
        .select('id, created_at, name, status')
        .eq('filed_by_pro_user_id', row.proUserId)
        .order('created_at', { ascending: false })
        .limit(5),
      db.from('admin_view_as_log').select('admin_name, admin_email, action, created_at').eq('pro_user_id', row.proUserId).order('created_at', { ascending: false }).limit(10),
    ])
    for (const s of sessions.data ?? []) activity.push({ at: s.created_at, text: 'Signed in to the Pro Hub' })
    for (const l of links.data ?? []) activity.push({ at: l.created_at, text: l.used_at ? 'Asked for a sign-in link (used)' : 'Asked for a sign-in link' })
    for (const w of warranties.data ?? [])
      activity.push({ at: w.created_at, text: `Filed a warranty for ${w.name || 'a customer'}`, href: `/portal/admin/warranties/${w.id}/` })
    for (const v of views.data ?? [])
      activity.push({ at: v.created_at, text: `${v.admin_name || v.admin_email} ${v.action === 'exit' ? 'left View as' : 'opened View as'}` })
    if (row.dealer?.invited_at) activity.push({ at: row.dealer.invited_at, text: 'Invited to the Pro Hub' })
    if (row.createdAt) activity.push({ at: row.createdAt, text: 'Pro Hub account created' })
  }

  let auth: UserDetail['auth'] = null
  let access: AccessLogRow[] = []
  if (row.type !== 'dealer') {
    const [user, log, views] = await Promise.all([
      row.authUserId ? db.auth.admin.getUserById(row.authUserId) : null,
      recentAccess({ email: row.email, limit: 25 }),
      db.from('admin_view_as_log').select('pro_user_email, action, created_at').eq('admin_email', row.email).order('created_at', { ascending: false }).limit(10),
    ])
    const u = user?.data?.user
    const signIns = log.filter((l) => l.action === 'sign_in' && l.actor_email === row.email)
    for (const l of signIns) activity.push({ at: l.created_at, text: accessText(l) })
    if (u) {
      auth = {
        confirmedAt: u.email_confirmed_at ?? null,
        providers: ((u.app_metadata?.providers as string[] | undefined) ?? [u.app_metadata?.provider as string]).filter(Boolean),
        factors: u.factors?.length ?? 0,
        bannedUntil: (u as User & { banned_until?: string }).banned_until ?? null,
      }
      // Supabase's own last sign-in, unless the log already has that one.
      const last = u.last_sign_in_at
      if (last && !signIns.some((l) => Math.abs(Date.parse(l.created_at) - Date.parse(last)) < 60_000))
        activity.push({ at: last, text: 'Signed in (password)' })
      activity.push({ at: u.created_at, text: 'Login created' })
    }
    access = log.filter((l) => l.action !== 'sign_in')
    for (const v of views.data ?? [])
      activity.push({ at: v.created_at, text: `${v.action === 'exit' ? 'Left' : 'Opened'} View as for ${v.pro_user_email}` })
  }

  activity.sort((a, b) => b.at.localeCompare(a.at))
  return { auth, linked, activity: activity.slice(0, 20), access }
}
