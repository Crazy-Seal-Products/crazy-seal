import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { needsClassification } from '@/lib/warranty/classification'
import { fetchAllRows, memo } from './cache'
import { allCustomers, allOrders } from './sales'

/**
 * Warranty registrations, claims and transfers (the same tables the site
 * admin's warranty page edits). Registrations are reviewed for marketing:
 * each gets an image type and a "reviews for marketing" classification.
 */

export const REGISTRATION_STATUSES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'approved', label: 'Approved' },
  { key: 'flagged', label: 'Flagged' },
] as const
export const CLAIM_STATUSES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'in_review', label: 'In review' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'denied', label: 'Denied' },
] as const
export const TRANSFER_STATUSES = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'processed', label: 'Processed' },
  { key: 'denied', label: 'Denied' },
] as const

/** Classifications that should end up with edited (retouched) photos. */
const EDIT_CLASSIFICATIONS = new Set(['Use For Marketing/Website', 'Good Photos & Review', 'Good Photos'])

export interface Registration {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  customer_details: string | null
  order_number: string | null
  install_type: string | null
  installer_name: string | null
  installer_phone: string | null
  installer_email: string | null
  photo_urls: string[] | null
  before_photo_urls: string[] | null
  after_photo_urls: string[] | null
  favorite_photo_urls: string[] | null
  edited_photo_urls: string[] | null
  rating: number | null
  experience_notes: string | null
  contractor_notes: string | null
  photo_display_consent: boolean | null
  status: string
  image_type: string | null
  reviews_for_marketing: string | null
  lucid_link: string | null
  gf_entry_id: number | null
  source: string | null
  filed_by_pro_user_id: string | null
}

const REG_COLS =
  'id, created_at, name, email, phone, customer_details, order_number, install_type, installer_name, installer_phone, installer_email, photo_urls, before_photo_urls, after_photo_urls, favorite_photo_urls, edited_photo_urls, rating, experience_notes, contractor_notes, photo_display_consent, status, image_type, reviews_for_marketing, lucid_link, gf_entry_id, source, filed_by_pro_user_id'

export interface Claim {
  id: string
  created_at: string
  name: string
  email: string
  phone: string | null
  order_number: string | null
  failure_description: string | null
  photo_urls: string[] | null
  status: string
  resolution_notes: string | null
}

export interface Transfer {
  id: string
  created_at: string
  new_owner_name: string
  new_owner_email: string
  new_owner_phone: string | null
  original_owner_email: string | null
  order_number: string | null
  transfer_notes: string | null
  status: string
}

export const REVIEW_FILTERS = [
  { key: 'needs_review', label: 'Needs review' },
  { key: 'classified', label: 'Classified' },
  { key: 'needs_edits', label: 'Needs edited photos' },
  { key: 'marketing', label: 'Marketing-ready' },
  { key: 'all', label: 'All' },
] as const
export type ReviewFilter = (typeof REVIEW_FILTERS)[number]['key']

export function photosOf(r: Pick<Registration, 'before_photo_urls' | 'after_photo_urls' | 'photo_urls'>): string[] {
  return [...(r.before_photo_urls ?? []), ...(r.after_photo_urls ?? []), ...(r.photo_urls ?? [])].filter((u, i, all) => u && all.indexOf(u) === i)
}

export function needsEditedPhotos(r: Registration): boolean {
  return !!r.reviews_for_marketing && EDIT_CLASSIFICATIONS.has(r.reviews_for_marketing) && !(r.edited_photo_urls?.length)
}

function matchesReview(r: Registration, f: ReviewFilter): boolean {
  if (f === 'needs_review') return needsClassification(r)
  if (f === 'classified') return !needsClassification(r)
  if (f === 'needs_edits') return needsEditedPhotos(r)
  if (f === 'marketing') return r.reviews_for_marketing === 'Use For Marketing/Website'
  return true
}

/** Columns the list filters and table need; long text is loaded only for the rows on screen. */
const LIST_COLS =
  'id, created_at, name, email, phone, order_number, install_type, installer_name, installer_email, photo_urls, before_photo_urls, after_photo_urls, edited_photo_urls, rating, status, image_type, reviews_for_marketing, gf_entry_id, source'

export function allRegistrations(): Promise<Registration[]> {
  return memo('warranty-registrations', 60_000, () => {
    const supabase = createAdminClient()
    return fetchAllRows<Registration>((from, to) =>
      supabase.from('warranty_registrations').select(LIST_COLS).order('created_at', { ascending: false }).order('id').range(from, to).returns<Registration[]>(),
    )
  })
}

async function withDetails(rows: Registration[]): Promise<Registration[]> {
  if (!rows.length) return rows
  const { data } = await createAdminClient().from('warranty_registrations').select(REG_COLS).in('id', rows.map((r) => r.id)).returns<Registration[]>()
  const full = new Map((data ?? []).map((r) => [r.id, r]))
  return rows.map((r) => full.get(r.id) ?? r)
}

const PAGE_SIZE = 50

export async function getRegistrations(opts: { review: ReviewFilter; status: string; install: string; q?: string; page: number }) {
  const rows = await allRegistrations()
  const q = opts.q?.toLowerCase().replace(/^#/, '')
  const searched = q
    ? rows.filter((r) =>
        [r.name, r.email, r.phone, r.order_number?.replace(/^#/, ''), r.installer_name, r.installer_email, r.customer_details].some((v) => v?.toLowerCase().includes(q)),
      )
    : rows
  const byStatus = (r: Registration) => opts.status === 'all' || r.status === opts.status
  const byInstall = (r: Registration) => opts.install === 'all' || (opts.install === 'contractor' ? r.install_type === 'contractor' : r.install_type !== 'contractor')
  const base = searched.filter((r) => byStatus(r) && byInstall(r))
  const filtered = base.filter((r) => matchesReview(r, opts.review))
  const rated = rows.filter((r) => r.rating != null)
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()

  return {
    rows: await withDetails(filtered.slice((opts.page - 1) * PAGE_SIZE, opts.page * PAGE_SIZE)),
    total: filtered.length,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    reviewCounts: Object.fromEntries(REVIEW_FILTERS.map((f) => [f.key, base.filter((r) => matchesReview(r, f.key)).length])) as Record<ReviewFilter, number>,
    summary: {
      total: rows.length,
      last30: rows.filter((r) => r.created_at >= since30).length,
      needsReview: rows.filter((r) => needsClassification(r)).length,
      marketing: rows.filter((r) => r.reviews_for_marketing === 'Use For Marketing/Website').length,
      needsEdits: rows.filter(needsEditedPhotos).length,
      avgRating: rated.length ? rated.reduce((n, r) => n + (r.rating ?? 0), 0) / rated.length : null,
      contractorShare: rows.length ? rows.filter((r) => r.install_type === 'contractor').length / rows.length : 0,
      submitted: rows.filter((r) => r.status === 'submitted').length,
    },
  }
}

export async function getClaims(): Promise<Claim[]> {
  const { data } = await createAdminClient()
    .from('warranty_claims')
    .select('id, created_at, name, email, phone, order_number, failure_description, photo_urls, status, resolution_notes')
    .order('created_at', { ascending: false })
    .limit(500)
  return (data ?? []) as Claim[]
}

export async function getTransfers(): Promise<Transfer[]> {
  const { data } = await createAdminClient()
    .from('warranty_transfers')
    .select('id, created_at, new_owner_name, new_owner_email, new_owner_phone, original_owner_email, order_number, transfer_notes, status')
    .order('created_at', { ascending: false })
    .limit(500)
  return (data ?? []) as Transfer[]
}

/** Order (in the order history kept here) whose name matches a warranty's order number. */
export async function orderLinkFor(orderNumber: string | null): Promise<{ legacyId: string; name: string } | null> {
  const n = orderNumber?.trim().replace(/^#/, '')
  if (!n || !/^\d+$/.test(n)) return null
  const o = (await allOrders()).find((x) => x.name.replace(/^#/, '') === n)
  return o?.legacy_resource_id ? { legacyId: o.legacy_resource_id, name: o.name } : null
}

export const getRegistration = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await createAdminClient().from('warranty_registrations').select(REG_COLS).eq('id', id).maybeSingle<Registration>()
  if (!data) return null
  const email = data.email?.toLowerCase()
  const [order, customers] = await Promise.all([orderLinkFor(data.order_number), allCustomers()])
  const customer = email ? customers.find((c) => c.email?.toLowerCase() === email) ?? null : null
  return { reg: data, order, customer }
})
