import type { ContractorBrand } from './theme'

export type Segment = 'rv' | 'commercial'
export type ServiceMode = 'shop' | 'mobile' | 'both'
/** Where a contractor came from: the dealer-list import, an admin, or the Shopify dealer roster (the Shopify sync). */
export type ContractorSource = 'list' | 'admin' | 'shopify'

export const SEGMENT_LABEL: Record<Segment, string> = { rv: 'RV', commercial: 'Commercial' }

export const SERVICE_MODE_LABEL: Record<ServiceMode, string> = {
  shop: 'Shop location',
  mobile: 'Mobile: comes to you',
  both: 'Shop and mobile',
}

/** A row of the contractors table (supabase/migrations/021_contractors.sql). */
export interface ContractorRow {
  id: string
  slug: string
  segment: Segment
  company: string | null
  first_name: string | null
  goes_by: string | null
  last_name: string | null
  phone: string | null
  phone_alt: string | null
  email: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  service_states: string[]
  service_mode: ServiceMode | null
  notes: string | null
  theme: string
  color_primary: string | null
  color_accent: string | null
  logo_url: string | null
  tagline: string | null
  is_listed: boolean
  import_key: string | null
  /** The Shopify customers who are this contractor (supabase/migrations/026_contractor_shopify_links.sql). */
  shopify_customer_ids: string[]
  /** Customers an admin unlinked: the Shopify sync leaves them off this contractor. */
  unlinked_customer_ids: string[]
  source: ContractorSource
  created_at: string
  updated_at: string
}

/**
 * What public pages and the public map get. Never the street address, notes
 * or import details; the pin is the ZIP's center.
 */
export interface PublicContractor {
  id: string
  slug: string
  /** Their company, or their name when they have none. */
  name: string
  /** The person to ask for, when `name` is a company. */
  contact: string | null
  segment: Segment
  phone: string | null
  email: string | null
  city: string | null
  state: string | null
  serviceStates: string[]
  serviceMode: ServiceMode | null
  lat: number | null
  lng: number | null
  brand: ContractorBrand
}

/** Everything the admin sees: the public view plus the private fields. */
export interface AdminContractor extends PublicContractor {
  firstName: string | null
  goesBy: string | null
  lastName: string | null
  company: string | null
  phoneAlt: string | null
  street: string | null
  zip: string | null
  notes: string | null
  isListed: boolean
  createdAt: string
  updatedAt: string
  shopifyCustomerIds: string[]
  unlinkedCustomerIds: string[]
  /** On the dealer list (it has an import key), else where an admin or the sync added them from. */
  origin: ContractorSource
}

export function contactName(c: Pick<ContractorRow, 'first_name' | 'goes_by' | 'last_name'>): string {
  return [c.goes_by || c.first_name, c.last_name].filter(Boolean).join(' ')
}

export function placeLabel(c: Pick<PublicContractor, 'city' | 'state'>): string {
  return [c.city, c.state].filter(Boolean).join(', ')
}

export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}
