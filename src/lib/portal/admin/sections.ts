/**
 * Admin roles and the sections they can be given, for the Crazy Seal Admin.
 * Plain module (no server imports) so the sidebar can use it too. The
 * server-side checks live in ./permissions.
 *
 * Roles are the `staff.role` values. The top role (Developer) always has
 * every section, so nobody can lock everyone out of the admin.
 */

export const ADMIN_ROLES = [
  { key: 'developer', label: 'Developer', description: 'Everything, including roles and the permission matrix.' },
  { key: 'admin', label: 'Admin', description: 'The sections ticked below. Can manage Staff and Sales reps.' },
  { key: 'staff', label: 'Staff', description: 'The sections ticked below. Can’t manage other users.' },
  { key: 'sales_rep', label: 'Sales rep', description: 'Their own numbers on Sales reps, plus the sales sections ticked below. Can’t manage other users.' },
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]['key']

export const TOP_ROLE: AdminRole = 'developer'

/**
 * Old `staff.role` values still read as their new role, so rows written
 * before 028_developer_role.sql ran keep their access.
 */
const LEGACY_ROLES: Record<string, AdminRole> = { super_admin: 'developer' }

/** Every `staff.role` value that means the top role, for queries that count it. */
export const TOP_ROLE_VALUES: string[] = [TOP_ROLE, ...Object.keys(LEGACY_ROLES).filter((k) => LEGACY_ROLES[k] === TOP_ROLE)]

/** Roles the matrix can change (the top role is fixed to everything). */
export const EDITABLE_ROLES = ADMIN_ROLES.filter((r) => r.key !== TOP_ROLE).map((r) => r.key)

const RANK: Record<AdminRole, number> = { developer: 3, admin: 2, staff: 1, sales_rep: 1 }

export function roleLabel(role: string | null | undefined): string {
  const key = LEGACY_ROLES[(role ?? '').trim().toLowerCase()] ?? role
  return ADMIN_ROLES.find((r) => r.key === key)?.label ?? 'Staff'
}

/**
 * `staff.role` as one of the known roles. Empty means the old default
 * (every staff row used to be a full admin); anything unrecognised gets the
 * least access.
 */
export function normalizeRole(raw: string | null | undefined): AdminRole {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) return 'admin'
  if (LEGACY_ROLES[value]) return LEGACY_ROLES[value]
  return ADMIN_ROLES.some((r) => r.key === value) ? (value as AdminRole) : 'staff'
}

/** Who may change whom: the top role manages everyone, Admins manage Staff and Sales reps, they manage nobody. */
export function canManageRole(actor: AdminRole, target: AdminRole): boolean {
  if (actor === TOP_ROLE) return true
  return actor === 'admin' && RANK[target] < RANK.admin
}

/** Roles the actor can hand out. */
export function assignableRoles(actor: AdminRole): AdminRole[] {
  return ADMIN_ROLES.map((r) => r.key).filter((r) => canManageRole(actor, r))
}

export function canEditPermissions(actor: AdminRole): boolean {
  return actor === TOP_ROLE
}

export const ADMIN_SECTIONS = [
  { key: 'overview', label: 'Overview', group: 'General', href: '/portal/admin/' },
  { key: 'orders', label: 'Orders', group: 'Sales', href: '/portal/admin/orders/' },
  { key: 'customers', label: 'Customers', group: 'Sales', href: '/portal/admin/customers/' },
  { key: 'leads', label: 'Leads', group: 'Sales', href: '/portal/admin/leads/' },
  { key: 'sales_reps', label: 'Sales reps', group: 'Sales', href: '/portal/admin/reps/' },
  { key: 'products', label: 'Products', group: 'Sales', href: '/portal/admin/products/' },
  { key: 'history', label: 'Sales history', group: 'Sales', href: '/portal/admin/history/' },
  { key: 'discounts', label: 'Discounts', group: 'Sales', href: '/portal/admin/discounts/' },
  { key: 'abandoned', label: 'Abandoned carts', group: 'Sales', href: '/portal/admin/abandoned/' },
  { key: 'marketing', label: 'Performance', group: 'Marketing', href: '/portal/admin/marketing/' },
  { key: 'contractors', label: 'Contractors', group: 'Contractors', href: '/portal/admin/dealers/contractors/' },
  { key: 'portal_accounts', label: 'Portal accounts', group: 'Contractors', href: '/portal/admin/dealers/portal/' },
  { key: 'view_as', label: 'View as', group: 'Contractors', href: '/portal/admin/dealers/view-as/' },
  { key: 'applications', label: 'Applications', group: 'Contractors', href: '/portal/admin/dealers/applications/' },
  { key: 'accelerator', label: 'Accelerator Program', group: 'Contractors', href: '/portal/admin/dealers/accelerator/' },
  { key: 'warranties', label: 'Warranties', group: 'Site', href: '/portal/admin/warranties/' },
  { key: 'projects', label: 'Projects', group: 'Site', href: '/portal/admin/projects/' },
  { key: 'assets', label: 'Site assets', group: 'Site', href: '/portal/admin/assets/' },
  { key: 'redirects', label: 'Redirects', group: 'Site', href: '/portal/admin/redirects/' },
  { key: 'sitemap', label: 'Sitemap', group: 'Site', href: '/portal/admin/sitemap/' },
  { key: 'archive', label: 'Form archive', group: 'Site', href: '/portal/admin/archive/' },
  { key: 'support', label: 'Support inbox', group: 'Support', href: '/portal/admin/support/' },
  { key: 'ai_review', label: 'AI review', group: 'Support', href: '/portal/admin/ai/' },
  { key: 'assistant', label: 'Assistant', group: 'Support', href: '/portal/admin/assistant/' },
  { key: 'users', label: 'Users & roles', group: 'Access', href: '/portal/admin/users/' },
] as const

export type AdminSection = (typeof ADMIN_SECTIONS)[number]['key']

export const SECTION_KEYS: readonly AdminSection[] = ADMIN_SECTIONS.map((s) => s.key)

export function isSection(value: string): value is AdminSection {
  return (SECTION_KEYS as readonly string[]).includes(value)
}

/** The Sales group: what a Sales rep starts with. */
const SALES_SECTIONS: readonly AdminSection[] = ADMIN_SECTIONS.filter((s) => s.group === 'Sales').map((s) => s.key)

/**
 * Out of the box: Developers and Admins get every section (Developers
 * always; a Developer can narrow Admins on Users & roles), Staff everything
 * but Users & roles and the support queue, and Sales reps the Sales group.
 */
export const DEFAULT_PERMISSIONS: Record<AdminRole, readonly AdminSection[]> = {
  developer: SECTION_KEYS,
  admin: SECTION_KEYS,
  staff: SECTION_KEYS.filter((s) => s !== 'users' && s !== 'support' && s !== 'ai_review'),
  sales_rep: SALES_SECTIONS,
}
