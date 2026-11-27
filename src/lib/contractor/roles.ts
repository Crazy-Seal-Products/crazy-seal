// Who can do what in a contractor's portal. Ported from Thermo's partner
// portal (thermo-materials src/lib/platform/roles.ts, the dealer roles) and
// adapted to Crazy Seal: a contractor is the company, and each Pro Hub account
// on its team (contractor_members) has one of these roles.
//
//   owner          Runs the contracting company: team, brand, sales, operations.
//   admin          Office lead. Same access as the owner, but can't make or
//                  change owners.
//   sales_manager  The whole sales team's projects, customers and quotes.
//   sales_rep      Their own customers, projects and quotes.
//   operations     Installs, orders and warranties across the company.
//
// The same matrix drives the portal's navigation, its pages and every write
// (src/lib/contractor/guard.ts), so a role can never do more through the
// server than the screen shows. Crazy Seal staff opening a portal with View as
// see what the owner sees, read-only.

export const CONTRACTOR_ROLES = ['owner', 'admin', 'sales_manager', 'sales_rep', 'operations'] as const
export type ContractorRole = (typeof CONTRACTOR_ROLES)[number]

export const MEMBER_STATUSES = ['active', 'invited', 'disabled'] as const
export type MemberStatus = (typeof MEMBER_STATUSES)[number]

export const ROLE_INFO: Record<ContractorRole, { label: string; summary: string }> = {
  owner: { label: 'Owner', summary: 'Runs the company: team, brand, sales, operations and ordering.' },
  admin: { label: 'Admin', summary: 'Office lead. Same access as the owner, except making or changing owners.' },
  sales_manager: { label: 'Sales manager', summary: "The whole sales team's projects, customers and quotes." },
  sales_rep: { label: 'Sales rep', summary: 'Their own customers, projects and quotes.' },
  operations: { label: 'Operations', summary: 'Installs, orders and warranties across the company.' },
}

export type Capability =
  | 'dashboard.view'
  | 'projects.view'
  | 'projects.edit'
  | 'customers.view'
  | 'customers.edit'
  | 'quotes.view'
  | 'quotes.create'
  | 'orders.view'
  | 'orders.create'
  | 'warranties.view'
  | 'warranties.edit'
  | 'training.view'
  | 'resources.view'
  /** Thermo's roof-asset platform: facilities, roof records, inspections, estimates, plans, documents. */
  | 'roofs.view'
  | 'roofs.edit'
  /** Products: catalog with this company's prices, roof systems, the customer view. */
  | 'catalog.view'
  | 'team.view'
  | 'team.manage'
  | 'brand.manage'
  | 'activity.view'
  /** Sees every record in the company, not just their own assignments. */
  | 'sales.view_all'

const EVERYTHING: Capability[] = [
  'dashboard.view',
  'projects.view',
  'projects.edit',
  'customers.view',
  'customers.edit',
  'quotes.view',
  'quotes.create',
  'orders.view',
  'orders.create',
  'warranties.view',
  'warranties.edit',
  'training.view',
  'resources.view',
  'roofs.view',
  'roofs.edit',
  'catalog.view',
  'team.view',
  'team.manage',
  'brand.manage',
  'activity.view',
  'sales.view_all',
]

export const CAPABILITIES: Record<ContractorRole, readonly Capability[]> = {
  owner: EVERYTHING,
  admin: EVERYTHING,
  sales_manager: [
    'dashboard.view',
    'projects.view',
    'projects.edit',
    'customers.view',
    'customers.edit',
    'quotes.view',
    'quotes.create',
    'training.view',
    'resources.view',
    'roofs.view',
    'roofs.edit',
    'catalog.view',
    'team.view',
    'activity.view',
    'sales.view_all',
  ],
  sales_rep: [
    'dashboard.view',
    'projects.view',
    'projects.edit',
    'customers.view',
    'customers.edit',
    'quotes.view',
    'quotes.create',
    'training.view',
    'resources.view',
    'roofs.view',
    'roofs.edit',
    'catalog.view',
  ],
  operations: [
    'dashboard.view',
    'projects.view',
    'projects.edit',
    'customers.view',
    'orders.view',
    'orders.create',
    'warranties.view',
    'warranties.edit',
    'training.view',
    'resources.view',
    'roofs.view',
    'roofs.edit',
    'catalog.view',
    'sales.view_all',
  ],
}

export function isContractorRole(value: unknown): value is ContractorRole {
  return typeof value === 'string' && (CONTRACTOR_ROLES as readonly string[]).includes(value)
}

export function can(role: ContractorRole | null | undefined, capability: Capability): boolean {
  if (!role) return false
  return CAPABILITIES[role].includes(capability)
}

/** Roles this role may give someone on its team (invite, or change to). */
export function assignableRoles(role: ContractorRole | null | undefined): ContractorRole[] {
  if (role === 'owner') return [...CONTRACTOR_ROLES]
  if (role === 'admin') return CONTRACTOR_ROLES.filter((r) => r !== 'owner')
  return []
}

/**
 * Whether `actor` may change `target`'s role or status. Owners manage anyone
 * but themselves; admins manage everyone except owners. Nobody changes their
 * own role, so a company can't lock itself out by accident.
 */
export function canManageMember(
  actor: { proUserId: string; role: ContractorRole },
  target: { proUserId: string; role: ContractorRole },
): boolean {
  if (actor.proUserId === target.proUserId) return false
  if (!can(actor.role, 'team.manage')) return false
  if (actor.role === 'admin' && target.role === 'owner') return false
  return true
}

/** Whether a record assigned to / created by `owners` is visible to this member. */
export function seesRecord(
  member: { proUserId: string; role: ContractorRole },
  owners: Array<string | null | undefined>,
): boolean {
  if (can(member.role, 'sales.view_all')) return true
  return owners.some((id) => id && id === member.proUserId)
}
