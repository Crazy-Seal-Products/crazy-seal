import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAccess } from './access-log'

/**
 * Set-your-own-password links (table staff_password_setups, made by
 * scripts/send-password-setup.mjs). Only the token's SHA-256 is stored. A link
 * works once, for 7 days, and only while the login has an active staff row.
 * Looking a link up never uses it; saving a password does.
 */

const TABLE = 'staff_password_setups'
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
  if (!claimed) return { ok: false, error: 'This link has expired or was already used. Ask an admin for a new one.', expired: true }

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
