// The contractor portal's navigation, in order. Adapted from Thermo's partner
// portal (Dashboard; Sell; Operate; Company) with Crazy Seal's Grow group for
// training, resources, rewards and the contractor's own page, and what Pro Hub
// had (orders, warranties, rewards, support, account). Each item shows only to
// roles with its capability; items marked `personal` also show to Pro Hub
// accounts that aren't on a contractor's team yet. Plain module: the client
// frame maps icon names.

import { can, type Capability, type ContractorRole } from './roles'

export type NavIcon =
  | 'dashboard'
  | 'projects'
  | 'customers'
  | 'quotes'
  | 'catalog'
  | 'orders'
  | 'warranties'
  | 'training'
  | 'resources'
  | 'brand'
  | 'team'
  | 'activity'
  | 'rewards'
  | 'support'
  | 'account'
  | 'portfolio'
  | 'roofs'
  | 'inspections'
  | 'estimates'
  | 'planning'
  | 'documents'
  | 'jobs'
  | 'systems'
  | 'customerview'

export interface NavItem {
  href: string
  label: string
  icon: NavIcon
  needs: Capability
  /** Also shown to accounts with no contractor (the personal portal). */
  personal?: boolean
}

export interface NavGroup {
  label: string | null
  items: NavItem[]
}

/** The training program's name in the portal (the Accelerator Program's modules). */
export const TRAINING_LABEL = 'Training'

export const NAV_GROUPS: NavGroup[] = [
  { label: null, items: [{ href: '/portal/', label: 'Dashboard', icon: 'dashboard', needs: 'dashboard.view', personal: true }] },
  {
    label: 'Roofs',
    items: [
      { href: '/portal/roofs/portfolio/', label: 'Portfolio', icon: 'portfolio', needs: 'roofs.view' },
      { href: '/portal/roofs/', label: 'Roof assets', icon: 'roofs', needs: 'roofs.view' },
      { href: '/portal/roofs/inspections/', label: 'Inspections', icon: 'inspections', needs: 'roofs.view' },
      { href: '/portal/roofs/estimates/', label: 'Estimates', icon: 'estimates', needs: 'roofs.view' },
      { href: '/portal/roofs/planning/', label: 'Budget & planning', icon: 'planning', needs: 'roofs.view' },
      { href: '/portal/roofs/documents/', label: 'Documents', icon: 'documents', needs: 'roofs.view' },
    ],
  },
  {
    label: 'Sell',
    items: [
      { href: '/portal/projects/', label: 'Pipeline', icon: 'projects', needs: 'projects.view' },
      { href: '/portal/customers/', label: 'Customers', icon: 'customers', needs: 'customers.view' },
      { href: '/portal/quotes/', label: 'Quote builder', icon: 'quotes', needs: 'quotes.view' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { href: '/portal/jobs/', label: 'Jobs', icon: 'jobs', needs: 'projects.view' },
      { href: '/portal/orders/', label: 'Orders', icon: 'orders', needs: 'orders.view', personal: true },
      { href: '/portal/warranties/', label: 'Warranties', icon: 'warranties', needs: 'warranties.view', personal: true },
    ],
  },
  {
    label: 'Products',
    items: [
      { href: '/portal/catalog/', label: 'Catalog', icon: 'catalog', needs: 'catalog.view' },
      { href: '/portal/systems/', label: 'Systems', icon: 'systems', needs: 'catalog.view' },
      { href: '/portal/customer-view/', label: 'Customer view', icon: 'customerview', needs: 'catalog.view' },
    ],
  },
  {
    label: 'Grow',
    items: [
      { href: '/portal/training/', label: TRAINING_LABEL, icon: 'training', needs: 'training.view', personal: true },
      { href: '/portal/resources/', label: 'Resources', icon: 'resources', needs: 'resources.view', personal: true },
      { href: '/portal/rewards/', label: 'Rewards', icon: 'rewards', needs: 'dashboard.view', personal: true },
      { href: '/portal/brand/', label: 'Brand studio', icon: 'brand', needs: 'brand.manage' },
    ],
  },
  {
    label: 'Company',
    items: [
      { href: '/portal/team/', label: 'Team', icon: 'team', needs: 'team.view' },
      { href: '/portal/activity/', label: 'Activity', icon: 'activity', needs: 'activity.view' },
    ],
  },
  {
    label: 'Help',
    items: [
      { href: '/portal/support/', label: 'Support', icon: 'support', needs: 'dashboard.view', personal: true },
      { href: '/portal/account/', label: 'Account', icon: 'account', needs: 'dashboard.view', personal: true },
    ],
  },
]

export function navFor(role: ContractorRole): NavGroup[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => can(role, i.needs)) })).filter((g) => g.items.length)
}

/** The personal portal: a Pro Hub account that isn't on a contractor's team yet. */
export function navForPersonal(): NavGroup[] {
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.personal) })).filter((g) => g.items.length)
}
