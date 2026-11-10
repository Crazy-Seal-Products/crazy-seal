/**
 * Admin roles and the sections they can be given, for the Crazy Seal Admin.
 * Plain module (no server imports) so the sidebar can use it too. The
 * server-side checks live in ./permissions.
 *
 * Roles are the `staff.role` values. The top role always has every section,
 * so nobody can lock everyone out of the admin.
 */

export const ADMIN_ROLES = [
  { key: 'super_admin', label: 'Super admin', description: 'Everything, including roles and the permission matrix.' },
  { key: 'admin', label: 'Admin', description: 'The sections ticked below. Can manage Staff-role users.' },
  { key: 'staff', label: 'Staff', description: 'The sections ticked below. Can’t manage other users.' },
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]['key']

export const TOP_ROLE: AdminRole = 'super_admin'

/** Roles the matrix can change (the top role is fixed to everything). */
export const EDITABLE_ROLES = ADMIN_ROLES.filter((r) => r.key !== TOP_ROLE).map((r) => r.key)

const RANK: Record<AdminRole, number> = { super_admin: 3, admin: 2, staff: 1 }

export function roleLabel(role: string | null | undefined): string {
  return ADMIN_ROLES.find((r) => r.key === role)?.label ?? 'Staff'
}

/**
 * `staff.role` as one of the known roles. Empty means the old default
 * (every staff row used to be a full admin); anything unrecognised gets the
 * least access.
 */
export function normalizeRole(raw: string | null | undefined): AdminRole {
  const value = (raw ?? '').trim().toLowerCase()
  if (!value) return 'admin'
  return ADMIN_ROLES.some((r) => r.key === value) ? (value as AdminRole) : 'staff'
}

/** Who may change whom: the top role manages everyone, Admins manage Staff, Staff manage nobody. */
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
  { key: 'products', label: 'Products', group: 'Sales', href: '/portal/admin/products/' },
  { key: 'history', label: 'Sales history', group: 'Sales', href: '/portal/admin/history/' },
  { key: 'discounts', label: 'Discounts', group: 'Sales', href: '/portal/admin/discounts/' },
  { key: 'abandoned', label: 'Abandoned carts', group: 'Sales', href: '/portal/admin/abandoned/' },
  { key: 'marketing', label: 'Performance', group: 'Marketing', href: '/portal/admin/marketing/' },
  { key: 'dealers', label: 'Dealer roster', group: 'Dealers', href: '/portal/admin/dealers/' },
  { key: 'contractors', label: 'Contractors', group: 'Dealers', href: '/portal/admin/dealers/contractors/' },
  { key: 'portal_accounts', label: 'Portal accounts', group: 'Dealers', href: '/portal/admin/dealers/portal/' },
  { key: 'view_as', label: 'View as', group: 'Dealers', href: '/portal/admin/dealers/view-as/' },
  { key: 'applications', label: 'Applications', group: 'Dealers', href: '/portal/admin/dealers/applications/' },
  { key: 'accelerator', label: 'Accelerator Program', group: 'Dealers', href: '/portal/admin/dealers/accelerator/' },
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

/**
 * The support queue and AI review start with Super admins only (they own
 * the queue); a Super admin can open them to other roles on Users & roles.
 */
const SUPER_ADMIN_ONLY: readonly AdminSection[] = ['support', 'ai_review']

/** Out of the box: Admins get everything else, Staff everything else but Users & roles. */
export const DEFAULT_PERMISSIONS: Record<AdminRole, readonly AdminSection[]> = {
  super_admin: SECTION_KEYS,
  admin: SECTION_KEYS.filter((s) => !SUPER_ADMIN_ONLY.includes(s)),
  staff: SECTION_KEYS.filter((s) => s !== 'users' && !SUPER_ADMIN_ONLY.includes(s)),
}
