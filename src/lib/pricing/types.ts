// Pricing records and the roof questions (supabase/migrations/031_pricing.sql
// and 036_price_list.sql). Plain module: safe to import from client components.

import type { JobDiscount, PriceList } from './price-list-2027'

export const APPLICATIONS = [
  { key: 'rv', label: 'RV' },
  { key: 'commercial', label: 'Commercial flat roof' },
  { key: 'residential', label: 'Residential flat roof' },
] as const
export type Application = (typeof APPLICATIONS)[number]['key']

export const INSTALL_METHODS = [
  { key: 'over-existing', label: 'Over an existing roof' },
  { key: 'direct-to-deck', label: 'Direct to bare deck' },
] as const
export type InstallMethod = (typeof INSTALL_METHODS)[number]['key']

export const ROOF_COLORS = ['White', 'Gray', 'Tan'] as const
export type RoofColor = (typeof ROOF_COLORS)[number]

/** The builder's answers about the roof (quotes.inputs). */
export interface RoofInputs {
  application: Application
  installMethod: InstallMethod
  /** Flat roofs: the roof's area. RVs: worked out from rvLengthFt. */
  sqft: number | null
  /** RVs only: the roof's length in feet. */
  rvLengthFt: number | null
  /** Linear feet of seams to patch. */
  seamsFt: number
  color: RoofColor
  /** The contractor project's roof type, when the quote came from one. */
  roofType?: string | null
}

/** pricing_settings.coverage: how much roof each unit of material covers. */
export interface Coverage {
  coats: number
  caulkSqftPerTube: number
  patchFtPerGallon: number
  cleanSqftPerGallon: number
  sealSqftPerGallonPerCoat: Record<InstallMethod, number>
}

export const DEFAULT_COVERAGE: Coverage = {
  coats: 2,
  caulkSqftPerTube: 400,
  patchFtPerGallon: 70,
  cleanSqftPerGallon: 1000,
  sealSqftPerGallonPerCoat: { 'over-existing': 100, 'direct-to-deck': 75 },
}

/** The one pricing_settings row. */
export interface PricingSettings {
  /** No longer used for prices (the price list sets them); kept for the record. */
  default_markup: number
  /** The live offer: this percent off the full price, for everyone. */
  offer_discount_pct: number
  /** How long a quote's price (the live offer) holds: expires_at = priced_at + offer_hours. */
  offer_hours: number
  /** Freight (staff quote it) at or over this discounted total. */
  free_shipping_under: number
  /** Free shipping from this discounted total (036; below it the buyer pays shipping at checkout). */
  free_shipping_over: number
  /** Retail and project prices, totes and costs (036). */
  price_list: PriceList
  /** Contractor discounts by order count (036); they replace the live offer, never stack. */
  job_discounts: JobDiscount[]
  /** Whether the row has 036's columns (price_list, job_discounts, free_shipping_over). */
  has_price_list: boolean
  capture_phone_at: number
  capture_address_at: number
  reminder_hours: number
  auto_reoffer: boolean
  public_builder_live: boolean
  coverage: Coverage
  updated_by: string | null
  updated_at: string | null
}


export interface PriceBookRow {
  variant_id: string
  product_handle: string
  title: string
  material_cost: number | null
  markup: number | null
  active: boolean
  updated_by: string | null
  updated_at: string | null
}

export const TIER_AUDIENCES = [
  { key: 'public', label: 'Public volume' },
  { key: 'contractor', label: 'Contractor' },
] as const
export type TierAudience = (typeof TIER_AUDIENCES)[number]['key']

export interface PricingTier {
  id: string
  name: string
  audience: TierAudience
  discount_pct: number
  min_subtotal: number | null
  active: boolean
  sort: number
  created_at: string
  updated_at: string
}

/** What the engine needs from a tier (also what the browser gets). */
export type TierLite = Pick<PricingTier, 'id' | 'name' | 'audience' | 'discount_pct' | 'min_subtotal' | 'active' | 'sort'>

export type PricingLogSubject = 'settings' | 'cost' | 'tier'

export interface PricingLogRow {
  id: number
  at: string
  actor_email: string | null
  actor_name: string | null
  subject: PricingLogSubject
  subject_id: string | null
  summary: string
  changes: Record<string, [unknown, unknown]> | null
}

/** Where the materials ship (quotes.ship_to; a project's site has the same address fields). */
export interface ShipTo {
  name?: string | null
  company?: string | null
  street?: string | null
  street2?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  phone?: string | null
}

export const HANDOFFS = ['freight', 'terms', 'no_access', 'incomplete'] as const
export type Handoff = (typeof HANDOFFS)[number]

export const HANDOFF_LABEL: Record<Handoff, string> = {
  freight: 'Ships freight',
  terms: 'Invoiced on terms',
  no_access: 'Checkout needs staff',
  incomplete: 'Needs details',
}

/** What the buyer still has to give before checkout (quotes.missing). */
export const MISSING_KEYS = ['phone', 'ship_to'] as const
export type MissingKey = (typeof MISSING_KEYS)[number]

export const MISSING_LABEL: Record<MissingKey, string> = {
  phone: 'Phone number',
  ship_to: 'Ship-to address',
}

/** A priced material on a quote (quotes.lines). unit_cost is for staff only: strip it before it leaves the server. */
export interface QuoteLine {
  variant_id: string
  product_handle: string
  product_title: string
  variant_title: string
  image: string | null
  quantity: number
  /** The full price from the price list (retail or the roof's project band; a price-book override wins). */
  unit_full: number
  /** After the quote's discount (live offer, order-count discount, tier or staff price). */
  unit_price: number
  line_total: number
  unit_cost: number | null
  /** Why this many, e.g. "40 gallons: 2 coats at 100 sq ft per gallon". */
  detail: string
}

export type PublicQuoteLine = Omit<QuoteLine, 'unit_cost'>

export function stripCosts(lines: QuoteLine[]): PublicQuoteLine[] {
  return lines.map((l) => ({
    variant_id: l.variant_id,
    product_handle: l.product_handle,
    product_title: l.product_title,
    variant_title: l.variant_title,
    image: l.image,
    quantity: l.quantity,
    unit_full: l.unit_full,
    unit_price: l.unit_price,
    line_total: l.line_total,
    detail: l.detail,
  }))
}

export function usd(n: number | null | undefined, cents = true): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })
}

const pctText = (pct: number) => `${Number(pct).toLocaleString('en-US', { maximumFractionDigits: 2 })}%`

/** The discount line's name: "Live offer 10%", "Contractor 51+ orders 30%", "Military 20%". */
export function discountLabel(name: string | null | undefined, pct: number): string {
  const p = pctText(pct)
  const n = (name ?? '').trim() || 'Discount'
  return n.includes(p) ? n : `${n} ${p}`
}
