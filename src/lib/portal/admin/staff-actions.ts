'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin, type StaffRow } from './auth'
import { clearAdminCache } from './cache'
import { findAuthUserIdByEmail } from './staff'

export type AddStaffState = { ok: true; message: string; tempPassword?: string } | { ok: false; error: string } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function tempPassword() {
  return `CS-${randomBytes(9).toString('base64url')}`
}

async function staffById(id: string): Promise<StaffRow | null> {
  const { data } = await createAdminClient().from('staff').select('*').eq('id', id).maybeSingle()
  return (data as StaffRow | null) ?? null
}

/**
 * Adds someone to the staff list. An existing Supabase login (for example
 * from the old site admin) is reused with its password; otherwise a login is
 * created with a temporary password shown once to the admin adding them.
 */
export async function addStaff(_prev: AddStaffState, formData: FormData): Promise<AddStaffState> {
  await requirePortalAdmin()
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!name) return { ok: false, error: 'Add their name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'That email doesn’t look right.' }

  const db = createAdminClient()
  const { data: existing } = await db.from('staff').select('*').eq('email', email).maybeSingle()
  const row = existing as StaffRow | null
  if (row?.is_active) return { ok: false, error: `${email} is already on the staff list.` }

  let authUserId = row?.auth_user_id ?? (await findAuthUserIdByEmail(email))
  let password: string | undefined
  if (!authUserId) {
    password = tempPassword()
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })
    if (error || !data.user) return { ok: false, error: 'Could not create their login.' }
    authUserId = data.user.id
  }

  const { error } = row
    ? await db.from('staff').update({ name, auth_user_id: authUserId, is_active: true }).eq('id', row.id)
    : await db.from('staff').insert({ name, email, auth_user_id: authUserId, role: 'admin', is_active: true })
  if (error) return { ok: false, error: 'Could not save the staff record.' }

  revalidatePath('/portal/admin/staff/')
  return password
    ? { ok: true, message: `${name} can sign in at /portal/login/ with this temporary password:`, tempPassword: password }
    : { ok: true, message: `${name} already had a login, so they sign in with their existing password (or use “Forgot your password?”).` }
}

export async function setStaffActive(id: string, active: boolean): Promise<ActionResult> {
  const admin = await requirePortalAdmin()
  const row = await staffById(id)
  if (!row) return { ok: false, error: 'Not found' }

  if (!active) {
    if (row.email.toLowerCase() === admin.email) return { ok: false, error: 'You can’t deactivate yourself.' }
    const { count } = await createAdminClient()
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
    if ((count ?? 0) <= 1) return { ok: false, error: 'Keep at least one active admin.' }
  }

  const { error } = await createAdminClient().from('staff').update({ is_active: active }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  clearAdminCache()
  revalidatePath('/portal/admin/staff/')
  return { ok: true, message: active ? 'Reactivated' : 'Access removed' }
}

export async function resetStaffPassword(id: string): Promise<ActionResult> {
  await requirePortalAdmin()
  const row = await staffById(id)
  if (!row?.auth_user_id) return { ok: false, error: 'No login to reset' }
  const password = tempPassword()
  const { error } = await createAdminClient().auth.admin.updateUserById(row.auth_user_id, { password })
  if (error) return { ok: false, error: 'Could not reset' }
  return { ok: true, message: `Temporary password: ${password}` }
}
