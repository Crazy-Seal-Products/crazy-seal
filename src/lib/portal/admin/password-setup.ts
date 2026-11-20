import { createHash, randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendStaffPasswordLink } from '@/lib/email/gmail'
import { logAccess } from './access-log'

/**
 * Set-your-own-password links (table staff_password_setups). Two things make
 * them: the "Forgot your password?" form on the admin sign-in (requestPasswordLink,
 * links last an hour), which is also how new staff set their first password,
 * and scripts/send-password-setup.mjs (links last 7 days). Only the token's
 * SHA-256 is stored. A link works once, and only while the login has an active
 * staff row. Looking a link up never uses it; saving a password does.
 */

const TABLE = 'staff_password_setups'
/** How long a link from the "Forgot your password?" form works. */
const REQUEST_VALID_MINUTES = 60
/** Links the form may make per login per hour, so nobody can flood a staff inbox. */
const REQUESTS_PER_HOUR = 3
export const MIN_PASSWORD = 8
/** Supabase (bcrypt) ignores anything past 72 bytes, so refuse longer ones rather than truncate silently. */
const MAX_PASSWORD_BYTES = 72

export interface PasswordSetup {
  id: string
  authUserId: string
  email: string
  name: string | null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function looksLikeToken(token: string | null | undefined): token is string {
  return typeof token === 'string' && /^[A-Za-z0-9_-]{32,128}$/.test(token)
}

async function activeStaff(authUserId: string): Promise<{ name: string | null; email: string } | null> {
  const { data } = await createAdminClient()
    .from('staff')
    .select('name, email')
    .eq('auth_user_id', authUserId)
    .eq('is_active', true)
    .maybeSingle()
  return (data as { name: string | null; email: string } | null) ?? null
}

/** The unused, unexpired link for this token, or null. Doesn't use it up. */
export async function findPasswordSetup(token: string | null | undefined): Promise<PasswordSetup | null> {
  if (!looksLikeToken(token)) return null
  const { data } = await createAdminClient()
    .from(TABLE)
    .select('id, auth_user_id, email')
    .eq('token_hash', hashToken(token))
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()
  if (!data) return null
  const staff = await activeStaff(data.auth_user_id)
  if (!staff) return null
  return { id: data.id, authUserId: data.auth_user_id, email: data.email, name: staff.name }
}

/**
 * "Forgot your password?" for staff. When the email belongs to an active staff
 * login, it voids that login's earlier unused links and emails a new one from
 * the site's Gmail sender (the one that sent the first set-password emails).
 * It never says whether it did, so the form can't be used to find staff
 * emails, and the current password keeps working until a link is used, so
 * asking for links can't lock anyone out.
 */
export async function requestPasswordLink(rawEmail: string, origin: string): Promise<void> {
  const email = rawEmail.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

  const db = createAdminClient()
  const { data: staff } = await db
    .from('staff')
    .select('name, email, auth_user_id')
    .ilike('email', email.replace(/[\\%_]/g, '\\$&'))
    .eq('is_active', true)
    .not('auth_user_id', 'is', null)
    .limit(1)
    .maybeSingle<{ name: string | null; email: string; auth_user_id: string }>()
  if (!staff) return

  const hourAgo = new Date(Date.now() - 3_600_000).toISOString()
  const { count } = await db.from(TABLE).select('id', { count: 'exact', head: true }).eq('auth_user_id', staff.auth_user_id).gt('created_at', hourAgo)
  if ((count ?? 0) >= REQUESTS_PER_HOUR) return

  const now = new Date()
  await db.from(TABLE).update({ used_at: now.toISOString() }).eq('auth_user_id', staff.auth_user_id).is('used_at', null)
  const token = randomBytes(32).toString('base64url')
  const { error } = await db.from(TABLE).insert({
    auth_user_id: staff.auth_user_id,
    email,
    token_hash: hashToken(token),
    expires_at: new Date(now.getTime() + REQUEST_VALID_MINUTES * 60_000).toISOString(),
    created_by: 'forgot-password form',
  })
  if (error) {
    console.error('[password-setup] could not store a link:', error.message)
    return
  }
  try {
    await sendStaffPasswordLink(email, staff.name, `${origin}/portal/set-password/?t=${token}`, REQUEST_VALID_MINUTES)
  } catch (err) {
    console.error('[password-setup] could not email a link:', err)
    return
  }
  await logAccess({ email, name: staff.name }, 'password_setup_sent', email, { by: 'forgot-password form', validMinutes: REQUEST_VALID_MINUTES })
}

export function passwordProblem(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES) return 'Use a shorter password (72 characters at most).'
  if (password !== confirm) return 'The two passwords don’t match.'
  if (/^companyeng/i.test(password)) return 'Pick a password of your own, not the CompanyEng one from before.'
  return null
}

/** Signs a login out everywhere: Supabase's admin API signs out by access token, so mint one first. */
async function revokeAllSessions(email: string): Promise<void> {
  const admin = createAdminClient()
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
  const tokenHash = link?.properties?.hashed_token
  if (linkError || !tokenHash) throw new Error(linkError?.message || 'no token')
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  const { data: verified, error: verifyError } = await anon.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash })
  const accessToken = verified?.session?.access_token
  if (verifyError || !accessToken) throw new Error(verifyError?.message || 'no session')
  const { error } = await admin.auth.admin.signOut(accessToken, 'global')
  if (error) throw new Error(error.message)
}

/**
 * Uses the link and sets the password. The link is claimed first (one request
 * wins if two race) and released again if Supabase rejects the password, so
 * they can try another.
 */
export async function completePasswordSetup(
  token: string,
  password: string,
  confirm: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string; expired?: boolean }> {
  const problem = passwordProblem(password, confirm)
  if (problem) return { ok: false, error: problem }
  if (!looksLikeToken(token)) return { ok: false, error: 'This link isn’t valid.', expired: true }

  const db = createAdminClient()
  const now = new Date().toISOString()
  const { data: claimed } = await db
    .from(TABLE)
    .update({ used_at: now })
    .eq('token_hash', hashToken(token))
    .is('used_at', null)
    .gt('expires_at', now)
    .select('id, auth_user_id, email')
    .maybeSingle()
  if (!claimed) return { ok: false, error: 'This link has expired or was already used. Use “Forgot your password?” on the sign-in page to get a new one.', expired: true }

  const release = () => db.from(TABLE).update({ used_at: null }).eq('id', claimed.id)
  const staff = await activeStaff(claimed.auth_user_id)
  if (!staff) return { ok: false, error: 'This login no longer has admin access.', expired: true }

  const { error } = await db.auth.admin.updateUserById(claimed.auth_user_id, { password, email_confirm: true })
  if (error) {
    await release()
    return { ok: false, error: error.message || 'Could not save that password. Try another.' }
  }

  // Anyone still signed in with the old password is signed out.
  let signedOut = true
  try {
    await revokeAllSessions(claimed.email)
  } catch (err) {
    signedOut = false
    console.error('[password-setup] sign-out failed:', err)
  }
  await logAccess({ email: claimed.email.toLowerCase(), name: staff.name }, 'password_set_link', claimed.email.toLowerCase(), { signedOut })
  return { ok: true, email: claimed.email }
}
