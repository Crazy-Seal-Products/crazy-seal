'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createSessionClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/components/portal/admin/controls'
import { logAccess } from './access-log'
import { requirePortalAdmin, type StaffRow } from './auth'
import { clearAdminCache } from './cache'

const MAX_NAME = 80

/** What the signed-in admin sees in their account pop-up. */
export interface MyAccount {
  name: string
  email: string
  role: string
  via: 'staff' | 'env'
  /** They have a staff (Supabase) login whose password can be changed here. */
  hasStaffLogin: boolean
  lastSignInAt: string | null
  staffSince: string | null
}

async function myStaffRow(email: string): Promise<StaffRow | null> {
  const { data } = await createAdminClient().from('staff').select('*').eq('email', email).eq('is_active', true).maybeSingle()
  return (data as StaffRow | null) ?? null
}

export async function getMyAccount(): Promise<MyAccount> {
  const admin = await requirePortalAdmin()
  const staff = await myStaffRow(admin.email)
  let lastSignInAt: string | null = null
  if (staff?.auth_user_id) {
    const { data } = await createAdminClient().auth.admin.getUserById(staff.auth_user_id)
    lastSignInAt = data?.user?.last_sign_in_at ?? null
  }
  return {
    name: admin.name,
    email: admin.email,
    role: admin.role,
    via: admin.via,
    hasStaffLogin: Boolean(staff?.auth_user_id),
    lastSignInAt,
    staffSince: staff?.created_at ?? null,
  }
}

/**
 * Changes the signed-in admin's staff password after checking the current
 * one. The check runs on a throwaway client so the browser's session is left
 * alone, and that check session is closed again straight after.
 *
 * Signed in with a staff login, the password changes through this browser's
 * own Supabase session, which Supabase keeps signed in. If Supabase asks for
 * a fresh sign-in first (its secure password change setting), or the admin is
 * on the backup login, it changes through the admin API instead, which ends
 * every Supabase session for the login. Either way the reply says whether this
 * browser is still signed in, from Supabase rather than assumed.
 */
export async function changeMyPassword(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await requirePortalAdmin()
  const current = String(form.get('current') ?? '')
  const next = String(form.get('next') ?? '')
  const confirm = String(form.get('confirm') ?? '')
  if (!current) return { ok: false, error: 'Enter your current password.' }
  if (next.length < 8) return { ok: false, error: 'Use at least 8 characters for the new password.' }
  if (next !== confirm) return { ok: false, error: 'The new passwords don’t match.' }
  if (next === current) return { ok: false, error: 'Pick a new password that’s different from the current one.' }

  const staff = await myStaffRow(admin.email)
  if (!staff?.auth_user_id) {
    return { ok: false, error: 'You signed in with the backup login, whose password is set in Vercel. Ask an admin to add you on the Staff page.' }
  }

  const check = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await check.auth.signInWithPassword({ email: staff.email, password: current })
  if (error || data.user?.id !== staff.auth_user_id) return { ok: false, error: 'Your current password isn’t right.' }
  await check.auth.signOut({ scope: 'local' })

  let via: 'session' | 'admin' = 'admin'
  if (admin.via === 'staff') {
    const { error: userError } = await (await createSessionClient()).auth.updateUser({ password: next })
    if (!userError) via = 'session'
    else if (userError.code === 'same_password') return { ok: false, error: 'Pick a new password that’s different from the current one.' }
    else if (userError.code === 'weak_password') return { ok: false, error: userError.message || 'That password is too weak.' }
    else if (userError.code !== 'reauthentication_needed' && userError.code !== 'reauthentication_not_valid') {
      return { ok: false, error: userError.message || 'Could not change your password.' }
    }
  }
  if (via === 'admin') {
    const { error: updateError } = await createAdminClient().auth.admin.updateUserById(staff.auth_user_id, { password: next })
    if (updateError) return { ok: false, error: updateError.message || 'Could not change your password.' }
  }

  // A backup login's own cookie isn't a Supabase session, so it stays signed in either way.
  let signedOutHere = false
  if (admin.via === 'staff') {
    const { data: still, error: stillError } = await (await createSessionClient()).auth.getUser()
    signedOutHere = Boolean(stillError) || still.user?.id !== staff.auth_user_id
  }
  await logAccess(admin, 'password_changed', staff.email.toLowerCase(), { via, signedOutHere })
  if (admin.via === 'env') return { ok: true, message: 'Staff password changed. Your backup login (set in Vercel) keeps its own password.' }
  return {
    ok: true,
    message: signedOutHere
      ? 'Password changed. Sign in again with your new password.'
      : 'Password changed. You’re still signed in here; use the new one next time you sign in.',
  }
}

/** Changes the signed-in admin's own display name (their staff row; a backup login's name is set in Vercel). */
export async function updateMyName(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await requirePortalAdmin()
  const name = String(form.get('name') ?? '').trim().replace(/\s+/g, ' ')
  if (!name) return { ok: false, error: 'Add your name.' }
  if (name.length > MAX_NAME) return { ok: false, error: `Keep your name under ${MAX_NAME} characters.` }

  const staff = await myStaffRow(admin.email)
  if (!staff) return { ok: false, error: 'You signed in with the backup login, whose name is set in Vercel.' }
  if ((staff.name ?? '') === name) return { ok: true, message: 'No changes' }

  const db = createAdminClient()
  // Only the caller's own row: found from their session's email, never from the form.
  const { error } = await db.from('staff').update({ name }).eq('id', staff.id)
  if (error) return { ok: false, error: 'Could not save your name.' }
  if (staff.auth_user_id) await db.auth.admin.updateUserById(staff.auth_user_id, { user_metadata: { name } })

  await logAccess(admin, 'profile_updated', staff.email.toLowerCase(), { from: staff.name, to: name })
  clearAdminCache()
  revalidatePath('/portal/admin', 'layout')
  return { ok: true, message: 'Name saved.' }
}
