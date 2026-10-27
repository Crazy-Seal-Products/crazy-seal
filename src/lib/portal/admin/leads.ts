import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAllRows } from './cache'
import { allCustomers } from './sales'

/**
 * Website leads (the `leads` table): purchase quotes, dealer / partner
 * inquiries and general contact messages. Every lead is also pushed to Zoho
 * CRM when it is submitted; the status here is the site's own follow-up flag.
 */

export const LEAD_STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'closed', label: 'Closed' },
  { key: 'spam', label: 'Spam' },
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]['key']

export const LEAD_TYPES = [
  { key: 'all', label: 'All leads' },
  { key: 'quote', label: 'Purchase quotes' },
  { key: 'business', label: 'Dealer / partner' },
  { key: 'contact', label: 'Contact' },
] as const
export type LeadTypeFilter = (typeof LEAD_TYPES)[number]['key']

export const LEAD_STATUS_FILTERS = [{ key: 'open', label: 'Open' }, { key: 'all', label: 'Any status' }, ...LEAD_STATUSES] as const
export type LeadStatusFilter = (typeof LEAD_STATUS_FILTERS)[number]['key']

export interface LeadRow {
  id: string
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
  lead_type: string | null
  status: string | null
  source_page: string | null
  location: string | null
  message: string | null
  project_type: string | null
  square_footage: string | null
  rv_year: string | null
  rv_make: string | null
  rv_model: string | null
  rv_length: string | null
  business_name: string | null
  business_type: string | null
  how_heard: string | null
  website: string | null
  photo_urls: string[] | null
  first_utm_source: string | null
  first_utm_medium: string | null
  first_utm_campaign: string | null
  first_landing_page: string | null
  first_referrer: string | null
  texting_consent: boolean | null
  zoho_lead_id: string | null
  zoho_synced_at: string | null
}

const LEAD_COLS =
  'id, created_at, name, email, phone, lead_type, status, source_page, location, message, project_type, square_footage, rv_year, rv_make, rv_model, rv_length, business_name, business_type, how_heard, website, photo_urls, first_utm_source, first_utm_medium, first_utm_campaign, first_landing_page, first_referrer, texting_consent, zoho_lead_id, zoho_synced_at'

export function leadType(r: Pick<LeadRow, 'lead_type'>): 'quote' | 'business' | 'contact' {
  return r.lead_type === 'business' ? 'business' : r.lead_type === 'quote' ? 'quote' : 'contact'
}

export function leadStatus(r: Pick<LeadRow, 'status'>): LeadStatus {
  return (LEAD_STATUSES.find((s) => s.key === r.status)?.key ?? 'new') as LeadStatus
}

/** What the person asked about, in a few words. */
export function leadInterest(r: LeadRow): string {
  if (leadType(r) === 'business') return [r.business_name, r.business_type].filter(Boolean).join(' · ') || 'Dealer inquiry'
  const rv = [r.rv_year, r.rv_make, r.rv_model].filter(Boolean).join(' ')
  if (rv) return `${rv}${r.rv_length ? ` · ${r.rv_length} ft` : ''}`
  return [r.project_type, r.square_footage ? `${r.square_footage} sq ft` : null].filter(Boolean).join(' · ') || '—'
}

async function allLeads(): Promise<LeadRow[]> {
  const supabase = createAdminClient()
  return fetchAllRows<LeadRow>((from, to) =>
    supabase.from('leads').select(LEAD_COLS).order('created_at', { ascending: false }).range(from, to).returns<LeadRow[]>(),
  )
}

const PAGE_SIZE = 50

export async function getLeads(opts: { type: LeadTypeFilter; status: LeadStatusFilter; q?: string; page: number }) {
  const rows = await allLeads()
  const q = opts.q?.toLowerCase()
  const searched = q
    ? rows.filter((r) => [r.name, r.email, r.phone, r.location, r.business_name, r.message, r.rv_make, r.project_type].some((v) => v?.toLowerCase().includes(q)))
    : rows
  const byType = (t: LeadTypeFilter) => (r: LeadRow) => t === 'all' || leadType(r) === t
  const byStatus = (s: LeadStatusFilter) => (r: LeadRow) =>
    s === 'all' ? true : s === 'open' ? ['new', 'contacted', 'qualified'].includes(leadStatus(r)) : leadStatus(r) === s
  const typed = searched.filter(byType(opts.type))
  const filtered = typed.filter(byStatus(opts.status))
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()

  return {
    rows: filtered.slice((opts.page - 1) * PAGE_SIZE, opts.page * PAGE_SIZE),
    total: filtered.length,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    typeCounts: Object.fromEntries(LEAD_TYPES.map((t) => [t.key, searched.filter(byType(t.key)).filter(byStatus(opts.status)).length])) as Record<LeadTypeFilter, number>,
    statusCounts: Object.fromEntries(LEAD_STATUS_FILTERS.map((s) => [s.key, typed.filter(byStatus(s.key)).length])) as Record<LeadStatusFilter, number>,
    summary: {
      total: rows.length,
      last30: rows.filter((r) => r.created_at >= since30).length,
      untouched: rows.filter((r) => leadStatus(r) === 'new').length,
      quotes: rows.filter((r) => leadType(r) === 'quote').length,
      business: rows.filter((r) => leadType(r) === 'business').length,
      inZoho: rows.filter((r) => r.zoho_lead_id).length,
    },
  }
}

export const getLead = cache(async (id: string) => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const supabase = createAdminClient()
  const { data } = await supabase.from('leads').select(LEAD_COLS).eq('id', id).maybeSingle<LeadRow>()
  if (!data) return null
  const email = data.email?.toLowerCase()
  const customer = email ? (await allCustomers()).find((c) => c.email?.toLowerCase() === email) ?? null : null
  return { lead: data, customer }
})
