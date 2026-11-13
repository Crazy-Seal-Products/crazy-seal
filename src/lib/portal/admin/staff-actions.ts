'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { logAccess } from './access-log'
import { requirePortalAdmin, type PortalAdmin, type StaffRow } from './auth'
import { clearAdminCache } from './cache'
import { getPermissionMatrix, isMissingTable } from './permissions'
import {
  ADMIN_SECTIONS,
  assignableRoles,
  canEditPermissions,
  canManageRole,
  EDITABLE_ROLES,
  normalizeRole,
  roleLabel,
  TOP_ROLE,
  TOP_ROLE_VALUES,
  type AdminRole,
} from './sections'
import { findAuthUserIdByEmail } from './users'

/**
 * Staff access, from the Users & roles page. Who may do what (see
 * ./sections): the top role manages everyone and edits the permission
 * matrix; Admins manage Staff and Sales reps only; nobody changes their own
 * role or switches off their own access; and there's always one active
 * Developer left.
 */

export type AddStaffState = { ok: true; message: string; tempPassword?: string } | { ok: false; error: string } | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERS_PATH = '/portal/admin/users/'

function tempPassword() {
  return `CS-${randomBytes(9).toString('base64url')}`
}

async function staffById(id: string): Promise<StaffRow | null> {
  const { data } = await createAdminClient().from('staff').select('*').eq('id', id).maybeSingle()
  return (data as StaffRow | null) ?? null
}

function done(message: string): ActionResult {
  clearAdminCache()
  revalidatePath(USERS_PATH)
  return { ok: true, message }
}

/** Null when the actor may change this staff member; otherwise why not. */
function cantManage(actor: PortalAdmin, row: StaffRow): string | null {
  if (row.email.toLowerCase() === actor.email) return 'You can’t change your own access. Ask another Developer.'
  if (!canManageRole(actor.role, normalizeRole(row.role))) return `${roleLabel(actor.role)}s can’t change a ${roleLabel(row.role)}.`
  return null
}

async function activeTopRoleCount(): Promise<number> {
  const { count } = await createAdminClient()
    .from('staff')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .in('role', TOP_ROLE_VALUES)
  return count ?? 0
}

/**
 * Adds someone to the staff list. An existing Supabase login (for example
 * from the old site admin) is reused with its password; otherwise a login is
 * created with a temporary password shown once to the admin adding them.
 */
export async function addStaff(_prev: AddStaffState, formData: FormData): Promise<AddStaffState> {
  const admin = await requirePortalAdmin('users')
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const role = normalizeRole(String(formData.get('role') ?? 'staff'))
  if (!name) return { ok: false, error: 'Add their name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'That email doesn’t look right.' }
  if (!assignableRoles(admin.role).includes(role)) return { ok: false, error: `${roleLabel(admin.role)}s can’t add a ${roleLabel(role)}.` }

  const db = createAdminClient()
  const { data: existing } = await db.from('staff').select('*').eq('email', email).maybeSingle()
  const row = existing as StaffRow | null
  if (row?.is_active) return { ok: false, error: `${email} is already on the staff list.` }
  if (row && !canManageRole(admin.role, normalizeRole(row.role))) return { ok: false, error: `${email} was a ${roleLabel(row.role)}; ask a Developer to bring them back.` }

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
    ? await db.from('staff').update({ name, auth_user_id: authUserId, role, is_active: true }).eq('id', row.id)
    : await db.from('staff').insert({ name, email, auth_user_id: authUserId, role, is_active: true })
  if (error) return { ok: false, error: 'Could not save the staff record.' }

  await logAccess(admin, 'staff_added', email, { role: roleLabel(role), newLogin: Boolean(password) })
  clearAdminCache()
  revalidatePath(USERS_PATH)
  return password
    ? { ok: true, message: `${name} can sign in at /portal/login/ with this temporary password:`, tempPassword: password }
    : { ok: true, message: `${name} already had a login, so they sign in with their existing password (or use “Forgot your password?”).` }
}

export async function setStaffActive(id: string, active: boolean): Promise<ActionResult> {
  const admin = await requirePortalAdmin('users')
  const row = await staffById(id)
  if (!row) return { ok: false, error: 'Not found' }
  const blocked = cantManage(admin, row)
  if (blocked) return { ok: false, error: blocked }

  if (!active && row.is_active) {
    const { count } = await createAdminClient()
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
    if ((count ?? 0) <= 1) return { ok: false, error: 'Keep at least one active admin.' }
    if (normalizeRole(row.role) === TOP_ROLE && (await activeTopRoleCount()) <= 1) return { ok: false, error: 'Keep at least one active Developer.' }
  }

  const { error } = await createAdminClient().from('staff').update({ is_active: active }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  await logAccess(admin, active ? 'access_on' : 'access_off', row.email.toLowerCase())
  return done(active ? 'Access turned on' : 'Access removed')
}

export async function setStaffRole(id: string, next: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('users')
  const row = await staffById(id)
  if (!row) return { ok: false, error: 'Not found' }
  const blocked = cantManage(admin, row)
  if (blocked) return { ok: false, error: blocked }

  const from = normalizeRole(row.role)
  const to = normalizeRole(next)
  if (to !== next) return { ok: false, error: 'Unknown role' }
  if (from === to) return { ok: true }
  if (!assignableRoles(admin.role).includes(to)) return { ok: false, error: `${roleLabel(admin.role)}s can’t make someone a ${roleLabel(to)}.` }
  if (from === TOP_ROLE && row.is_active && (await activeTopRoleCount()) <= 1) return { ok: false, error: 'Keep at least one active Developer.' }

  const { error } = await createAdminClient().from('staff').update({ role: to }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  await logAccess(admin, 'role_change', row.email.toLowerCase(), { from: roleLabel(from), to: roleLabel(to) })
  return done(`Now ${roleLabel(to)}`)
}

export async function resetStaffPassword(id: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('users')
  const row = await staffById(id)
  if (!row?.auth_user_id) return { ok: false, error: 'No login to reset' }
  const blocked = cantManage(admin, row)
  if (blocked) return { ok: false, error: blocked }
  const password = tempPassword()
  const { error } = await createAdminClient().auth.admin.updateUserById(row.auth_user_id, { password })
  if (error) return { ok: false, error: 'Could not reset' }
  await logAccess(admin, 'password_reset', row.email.toLowerCase())
  return { ok: true, message: `Temporary password: ${password}` }
}

/**
 * Saves the roles × sections matrix. Each box is a `perm:<role>:<section>`
 * checkbox; every editable role's full row is stored, so later changes to
 * the code defaults don't move anything that was set here.
 */
export async function saveRolePermissions(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await requirePortalAdmin('users')
  if (!canEditPermissions(admin.role)) return { ok: false, error: 'Only a Developer can change permissions.' }

  const before = await getPermissionMatrix()
  const rows: { role: AdminRole; section: string; allowed: boolean; updated_by: string; updated_at: string }[] = []
  const changes: string[] = []
  const at = new Date().toISOString()
  for (const role of EDITABLE_ROLES) {
    for (const s of ADMIN_SECTIONS) {
      const allowed = form.get(`perm:${role}:${s.key}`) === 'on'
      rows.push({ role, section: s.key, allowed, updated_by: admin.email, updated_at: at })
      if (allowed !== before[role].includes(s.key)) changes.push(`${roleLabel(role)} ${allowed ? '+' : '−'} ${s.label}`)
    }
  }
  if (!changes.length) return { ok: true, message: 'No changes' }

  const { error } = await createAdminClient().from('admin_role_permissions').upsert(rows, { onConflict: 'role,section' })
  if (error) return { ok: false, error: isMissingTable(error) ? 'Run the 018_admin_roles migration first.' : 'Could not save' }
  await logAccess(admin, 'permissions', null, { changes })
  return done(`Saved ${changes.length} change${changes.length === 1 ? '' : 's'}`)
}
