'use server'

import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin, type StaffRow } from './auth'

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

  const { error: updateError } = await createAdminClient().auth.admin.updateUserById(staff.auth_user_id, { password: next })
  if (updateError) return { ok: false, error: updateError.message || 'Could not change your password.' }
  return {
    ok: true,
    message:
      admin.via === 'env'
        ? 'Staff password changed. Your backup login (set in Vercel) keeps its own password.'
        : 'Password changed. Use the new one next time you sign in.',
  }
}
