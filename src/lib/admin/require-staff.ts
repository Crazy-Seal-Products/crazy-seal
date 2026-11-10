import { createAdminClient } from '@/lib/supabase/admin'
import { getAdminSections, getPortalAdmin } from '@/lib/portal/admin/auth'
import type { AdminSection } from '@/lib/portal/admin/sections'

export interface StaffRecord {
  /** Empty for an env-only admin with no row in `staff`. */
  id: string
  auth_user_id: string | null
  name: string | null
  full_name?: string | null
  email: string
  role: string | null
  is_active: boolean
}

/**
 * Guard for the staff APIs under /api/admin. Accepts anyone signed in to the
 * Crazy Seal Admin, by staff account or env user (see lib/portal/admin/auth),
 * whose role can open `section` (or any one of a list). Null means answer 401.
 */
export async function requireStaff(section: AdminSection | AdminSection[]): Promise<StaffRecord | null> {
  const admin = await getPortalAdmin()
  if (!admin) return null
  const allowed = await getAdminSections()
  if (!(Array.isArray(section) ? section : [section]).some((s) => allowed.includes(s))) return null

  const { data } = await createAdminClient()
    .from('staff')
    .select('*')
    .eq('email', admin.email)
    .eq('is_active', true)
    .maybeSingle()

  return (
    (data as StaffRecord | null) ?? {
      id: '',
      auth_user_id: null,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: true,
    }
  )
}
