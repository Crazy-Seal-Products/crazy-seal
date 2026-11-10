import { createAdminClient } from '@/lib/supabase/admin'
import { memo } from './cache'
import {
  ADMIN_ROLES,
  ADMIN_SECTIONS,
  DEFAULT_PERMISSIONS,
  EDITABLE_ROLES,
  SECTION_KEYS,
  TOP_ROLE,
  isSection,
  type AdminRole,
  type AdminSection,
} from './sections'

/**
 * Which admin sections each role can open. The code defaults in ./sections
 * apply until a Super admin changes a box on the Users & roles page; each
 * change is a row in `admin_role_permissions`. The top role is never read
 * from the table.
 */

export type PermissionMatrix = Record<AdminRole, AdminSection[]>

interface PermissionRow {
  role: string
  section: string
  allowed: boolean
}

/** The migration hasn't run yet (Postgres and PostgREST codes for a missing table). */
export function isMissingTable(error: { code?: string } | null): boolean {
  return error?.code === '42P01' || error?.code === 'PGRST205'
}

export function getPermissionMatrix(): Promise<PermissionMatrix> {
  return memo('admin-permissions', 60_000, async () => {
    const sets = new Map(ADMIN_ROLES.map((r) => [r.key, new Set<AdminSection>(DEFAULT_PERMISSIONS[r.key])]))
    const { data, error } = await createAdminClient().from('admin_role_permissions').select('role, section, allowed')
    // Any other error fails closed (the page errors) rather than falling back to the defaults.
    if (error && !isMissingTable(error)) throw new Error(`admin_role_permissions: ${error.message}`)
    for (const row of (data ?? []) as PermissionRow[]) {
      if (!(EDITABLE_ROLES as string[]).includes(row.role) || !isSection(row.section)) continue
      const set = sets.get(row.role as AdminRole)!
      if (row.allowed) set.add(row.section)
      else set.delete(row.section)
    }
    sets.set(TOP_ROLE, new Set(SECTION_KEYS))
    return Object.fromEntries(
      ADMIN_ROLES.map((r) => [r.key, SECTION_KEYS.filter((s) => sets.get(r.key)!.has(s))]),
    ) as PermissionMatrix
  })
}

export async function sectionsForRole(role: AdminRole): Promise<AdminSection[]> {
  if (role === TOP_ROLE) return [...SECTION_KEYS]
  return (await getPermissionMatrix())[role]
}

/** Where someone lands when they open a section they can't: their first allowed section. */
export function homeFor(sections: readonly AdminSection[]): string {
  return ADMIN_SECTIONS.find((s) => sections.includes(s.key))?.href ?? '/portal/admin/no-access/'
}
