import { createAdminClient } from '@/lib/supabase/admin'
import { contactName, type AdminContractor, type ContractorRow, type PublicContractor } from './types'

/**
 * Contractor reads for the public pages and the admin. Server only (service
 * role). Public reads select only the public columns and listed rows.
 */

const PUBLIC_COLUMNS =
  'id, slug, segment, company, first_name, goes_by, last_name, phone, email, city, state, zip, service_states, service_mode, theme, color_primary, color_accent, logo_url, tagline'

type PublicRow = Pick<
  ContractorRow,
  | 'id'
  | 'slug'
  | 'segment'
  | 'company'
  | 'first_name'
  | 'goes_by'
  | 'last_name'
  | 'phone'
  | 'email'
  | 'city'
  | 'state'
  | 'zip'
  | 'service_states'
  | 'service_mode'
  | 'theme'
  | 'color_primary'
  | 'color_accent'
  | 'logo_url'
  | 'tagline'
>

export interface ZipPoint {
  zip: string
  lat: number
  lng: number
}

/** ZIP centers for these ZIPs, falling back to the 3-digit prefix's center. */
async function pointsFor(zips: (string | null)[]): Promise<(zip: string | null) => ZipPoint | null> {
  const wanted = new Set<string>()
  for (const z of zips) if (z) wanted.add(z).add(z.slice(0, 3))
  if (!wanted.size) return () => null
  const { data, error } = await createAdminClient().from('zip_centroids').select('zip, lat, lng').in('zip', [...wanted])
  if (error) throw new Error(`zip_centroids: ${error.message}`)
  const at = new Map((data as ZipPoint[]).map((p) => [p.zip, p]))
  return (zip) => (zip ? at.get(zip) ?? at.get(zip.slice(0, 3)) ?? null : null)
}

/** The center of a 5-digit ZIP (or its prefix), for searches. */
export async function zipPoint(zip: string): Promise<ZipPoint | null> {
  if (!/^\d{5}$/.test(zip)) return null
  const point = (await pointsFor([zip]))(zip)
  return point ? { zip, lat: point.lat, lng: point.lng } : null
}

function toPublic(r: PublicRow, point: ZipPoint | null): PublicContractor {
  const contact = contactName(r)
  return {
    id: r.id,
    slug: r.slug,
    name: r.company || contact || 'Crazy Seal contractor',
    contact: r.company ? contact || null : null,
    segment: r.segment,
    phone: r.phone,
    email: r.email,
    city: r.city,
    state: r.state,
    serviceStates: r.service_states ?? [],
    serviceMode: r.service_mode,
    lat: point?.lat ?? null,
    lng: point?.lng ?? null,
    brand: { theme: r.theme, primary: r.color_primary, accent: r.color_accent, logoUrl: r.logo_url, tagline: r.tagline },
  }
}

function toAdmin(r: ContractorRow, point: ZipPoint | null): AdminContractor {
  return {
    ...toPublic(r, point),
    firstName: r.first_name,
    goesBy: r.goes_by,
    lastName: r.last_name,
    company: r.company,
    phoneAlt: r.phone_alt,
    street: r.street,
    zip: r.zip,
    notes: r.notes,
    isListed: r.is_listed,
    updatedAt: r.updated_at,
  }
}

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

/** Every listed contractor, for the public finder and its map. */
export async function listPublicContractors(): Promise<PublicContractor[]> {
  const { data, error } = await createAdminClient().from('contractors').select(PUBLIC_COLUMNS).eq('is_listed', true).limit(5000)
  if (error) throw new Error(`contractors: ${error.message}`)
  const rows = data as PublicRow[]
  const point = await pointsFor(rows.map((r) => r.zip))
  return rows.map((r) => toPublic(r, point(r.zip))).sort(byName)
}

/** One listed contractor's page, or null. */
export async function getPublicContractor(slug: string): Promise<PublicContractor | null> {
  const { data, error } = await createAdminClient()
    .from('contractors')
    .select(PUBLIC_COLUMNS)
    .eq('slug', slug)
    .eq('is_listed', true)
    .maybeSingle<PublicRow>()
  if (error) throw new Error(`contractors: ${error.message}`)
  if (!data) return null
  return toPublic(data, (await pointsFor([data.zip]))(data.zip))
}

/**
 * The current address of the listed contractor who used to have `slug`, or null. Their old page
 * address keeps leading to them after an admin renames it.
 */
export async function currentAddressFor(slug: string): Promise<string | null> {
  const db = createAdminClient()
  const { data: moved } = await db.from('contractor_redirects').select('contractor_id').eq('slug', slug).maybeSingle<{ contractor_id: string }>()
  if (!moved) return null
  const { data } = await db.from('contractors').select('slug').eq('id', moved.contractor_id).eq('is_listed', true).maybeSingle<{ slug: string }>()
  return data?.slug ?? null
}

export async function listContractorSlugs(): Promise<string[]> {
  const { data, error } = await createAdminClient().from('contractors').select('slug').eq('is_listed', true).limit(5000)
  if (error) throw new Error(`contractors: ${error.message}`)
  return (data as { slug: string }[]).map((r) => r.slug)
}

/** Every contractor, listed or not, with the private fields. */
export async function listAdminContractors(): Promise<AdminContractor[]> {
  const { data, error } = await createAdminClient().from('contractors').select('*').limit(5000)
  if (error) throw new Error(`contractors: ${error.message}`)
  const rows = data as ContractorRow[]
  const point = await pointsFor(rows.map((r) => r.zip))
  return rows.map((r) => toAdmin(r, point(r.zip))).sort(byName)
}

export async function getAdminContractor(id: string): Promise<AdminContractor | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data, error } = await createAdminClient().from('contractors').select('*').eq('id', id).maybeSingle<ContractorRow>()
  if (error) throw new Error(`contractors: ${error.message}`)
  if (!data) return null
  return toAdmin(data, (await pointsFor([data.zip]))(data.zip))
}

export interface ContractorLead {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  location: string | null
  rv_length: string | null
  square_footage: string | null
  status: string | null
  contractor_notified_at: string | null
  quote_team_notified_at: string | null
}

/** Quote requests sent from one contractor's page, newest first. */
export async function listContractorLeads(contractorId: string, limit = 50): Promise<ContractorLead[]> {
  const { data, error } = await createAdminClient()
    .from('leads')
    .select('id, created_at, name, email, phone, location, rv_length, square_footage, status, contractor_notified_at, quote_team_notified_at')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`leads: ${error.message}`)
  return data as ContractorLead[]
}
