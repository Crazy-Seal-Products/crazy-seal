// Quotes and their history (supabase/migrations/033_quotes.sql).
// Plain module: safe to import from client components.

import type { Handoff, MissingKey, QuoteLine, RoofInputs, ShipTo } from '@/lib/pricing/types'

export const QUOTE_STATUSES = ['open', 'checkout', 'ordered', 'lost', 'cancelled'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  open: 'Open',
  checkout: 'At checkout',
  ordered: 'Ordered',
  lost: 'Lost',
  cancelled: 'Cancelled',
}

export type QuoteAudience = 'public' | 'contractor'
export type QuoteSource = 'builder' | 'portal' | 'admin'

export const QUOTE_EVENT_KINDS = ['created', 'priced', 'viewed', 'checkout', 'handoff', 'reminder', 'offer', 'ordered', 'lost', 'cancelled', 'note', 'duplicate_order'] as const
export type QuoteEventKind = (typeof QUOTE_EVENT_KINDS)[number]

/** quotes.price_override: a staff price and why. */
export interface PriceOverride {
  /** Replaces the tier's discount. */
  discountPct: number | null
  /** The freight amount staff quoted. */
  freight: number | null
  reason: string
  by: string
  at: string
}

/** quotes.proposal: the contractor's proposal to their own customer. */
export interface QuoteProposal {
  customerName?: string | null
  labor: number
  materialMarkupPct: number
  total: number
  notes: string | null
  updatedAt: string
}

export interface QuoteRow {
  id: string
  number: string
  token: string
  audience: QuoteAudience
  source: QuoteSource
  contractor_id: string | null
  project_id: string | null
  lead_id: string | null
  rep_id: string | null
  created_by_pro_user: string | null
  created_by_staff: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  buyer_role: string | null
  timeline: string | null
  zip: string | null
  ship_to: ShipTo | null
  inputs: RoofInputs
  revision: number
  lines: QuoteLine[]
  cost_total: number | null
  subtotal_full: number
  discount_pct: number
  discount_total: number
  tier_id: string | null
  tier_name: string | null
  shipping: 'free' | 'freight'
  shipping_total: number | null
  total: number
  priced_at: string
  expires_at: string
  price_override: PriceOverride | null
  proposal: QuoteProposal | null
  notes: string | null
  status: QuoteStatus
  checkout_at: string | null
  handoff: Handoff | null
  shopify_draft_order_id: string | null
  invoice_url: string | null
  draft_revision: number | null
  shopify_order_id: string | null
  ordered_at: string | null
  reminder_sent_at: string | null
  reoffered_at: string | null
  viewed_at: string | null
  lost_reason: string | null
  created_at: string
  updated_at: string
  missing: MissingKey[]
}

export interface QuoteEventRow {
  id: number
  quote_id: string
  at: string
  kind: QuoteEventKind | string
  actor: string | null
  summary: string
  data: Record<string, unknown> | null
}

/**
 * "2d 14h 03m" (a day or more) or "14h 03m 09s", for the time left on a
 * live offer; "0h 00m 00s" once it's over.
 */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const d = Math.floor(total / 86_400)
  const h = Math.floor((total % 86_400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const p2 = (n: number) => String(n).padStart(2, '0')
  return d > 0 ? `${d}d ${h}h ${p2(m)}m` : `${h}h ${p2(m)}m ${p2(s)}s`
}

/** The price is a live offer until expires_at (priced_at + pricing_settings.offer_hours); then it can be refreshed. */
export function isExpired(q: Pick<QuoteRow, 'expires_at'>, now = Date.now()): boolean {
  return Date.parse(q.expires_at) <= now
}

/** Open or at checkout: the buyer can still act on it. */
export function isActive(q: Pick<QuoteRow, 'status'>): boolean {
  return q.status === 'open' || q.status === 'checkout'
}

export const BUYER_ROLES = ['Homeowner', 'RV owner', 'Business owner', 'Property manager', 'Contractor', 'Other'] as const

export const TIMELINES = ['As soon as possible', 'Within a month', '1 to 3 months', 'Just pricing it out'] as const
