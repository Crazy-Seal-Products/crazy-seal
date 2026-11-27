// Crazy Seal's 2027 price list: the built-in defaults for
// pricing_settings.price_list, job_discounts and free_shipping_over
// (supabase/migrations/036_price_list.sql). Quotes read the database row; this
// is what they use until 036 is applied, and for any field the row lacks.
// Plain module: safe to import from client components. It holds the PRICES
// only; Crazy Seal's material costs (and the full price list with costs) live
// in costs-2027.ts, which only server code imports, so costs never reach a
// browser bundle.
//
// The 2027 sheet:
//   Retail (small projects): Crazy Seal and Crazy Patch $225/gallon (1, 3 and
//     5 gallon pails), Crazy Caulk $25/tube. The sheet gives no retail price
//     for Crazy Clean or Crazy Tape, so retail quotes use their project price.
//   Project (by roof size): 1,500-5,000 sq ft $145/gallon, 5,001-10,000
//     $135/gallon, 10,001+ $120/gallon; 275-gallon totes of Crazy Seal
//     $100/gallon ($27,500); Crazy Caulk $12/tube, Crazy Clean $30/gallon,
//     Crazy Tape $48 per 25 ft roll.
//   Cost (Thermo's 2027 price to Crazy Seal): Seal and Patch $60/gallon,
//     totes $50/gallon ($13,750), Caulk $6/tube, Clean $15/gallon, Tape $28
//     per roll.
//   Discounts: 10% for everyone (the live offer, pricing_settings
//     .offer_discount_pct); contractors with 26+ orders 20%, 51+ orders 30%.
//   Free shipping on direct orders over $750 (and under the freight line).

import { FREE_SHIPPING_OVER } from '@/lib/shipping'

/** The products on the price list. A tote is Crazy Seal in a 275-gallon tote. */
export const PRODUCT_KEYS = ['seal', 'patch', 'caulk', 'clean', 'tape', 'tote'] as const
export type ProductKey = (typeof PRODUCT_KEYS)[number]

export const PRODUCT_INFO: Record<ProductKey, { name: string; unit: string; units: string }> = {
  seal: { name: 'Crazy Seal', unit: 'gallon', units: 'gallons' },
  patch: { name: 'Crazy Patch', unit: 'gallon', units: 'gallons' },
  caulk: { name: 'Crazy Caulk', unit: 'tube', units: 'tubes' },
  clean: { name: 'Crazy Clean', unit: 'gallon', units: 'gallons' },
  tape: { name: 'Crazy Tape', unit: '25 ft roll', units: 'rolls' },
  tote: { name: 'Crazy Seal tote', unit: 'gallon', units: 'gallons' },
}

/** Feet in one roll of Crazy Tape (the unit tape is priced in). */
export const TAPE_ROLL_FT = 25

/** A project price band: Crazy Seal and Crazy Patch per gallon for roofs from minSqft to maxSqft (null: no top). */
export interface ProjectBand {
  minSqft: number
  maxSqft: number | null
  perGallon: number
}

export interface PriceList {
  /** Small projects (under the first band, and every RV roof), per unit. Null: use the project price. */
  retail: { seal: number; patch: number; caulk: number; clean: number | null; tape: number | null }
  /** Larger projects, by roof size: Crazy Seal and Crazy Patch per gallon. */
  bands: ProjectBand[]
  /** Totes of Crazy Seal: once a job needs `gallons`, whole totes at perGallon and pails for the rest. */
  tote: { gallons: number; perGallon: number }
  /** Per unit on project-priced quotes (and retail quotes with no retail price). */
  project: { caulk: number; clean: number; tape: number }
  /** Crazy Seal's material cost per unit (gallon, tube, roll; a tote per gallon). Staff only. */
  costs: Record<ProductKey, number>
}

/** What the browser gets: the price list without costs. */
export type ClientPriceList = Omit<PriceList, 'costs'>

/** A contractor discount by how many Crazy Seal orders they've placed. */
export interface JobDiscount {
  minOrders: number
  pct: number
}

/** The 2027 sheet's prices (no costs: see costs-2027.ts). */
export const PRICES_2027: ClientPriceList = {
  retail: { seal: 225, patch: 225, caulk: 25, clean: null, tape: null },
  bands: [
    { minSqft: 1500, maxSqft: 5000, perGallon: 145 },
    { minSqft: 5001, maxSqft: 10000, perGallon: 135 },
    { minSqft: 10001, maxSqft: null, perGallon: 120 },
  ],
  tote: { gallons: 275, perGallon: 100 },
  project: { caulk: 12, clean: 30, tape: 48 },
}

export const JOB_DISCOUNTS_2027: JobDiscount[] = [
  { minOrders: 26, pct: 20 },
  { minOrders: 51, pct: 30 },
]

/** Free shipping from this discounted total (the site-wide constant, $750 for 2027). */
export const FREE_SHIPPING_OVER_2027 = FREE_SHIPPING_OVER

// ─── Reading the database's copy ─────────────────────────────────────────

export const money = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})

/** Bands sorted by their minimum, each well formed. Falls back to the 2027 bands when none are. */
export function normalizeBands(raw: unknown, fallback: ProjectBand[] = PRICES_2027.bands): ProjectBand[] {
  if (!Array.isArray(raw)) return fallback.map((b) => ({ ...b }))
  const bands: ProjectBand[] = []
  for (const b of raw) {
    const r = obj(b)
    const minSqft = money(r.minSqft)
    const perGallon = money(r.perGallon)
    const max = r.maxSqft === null || r.maxSqft === undefined || r.maxSqft === '' ? null : money(r.maxSqft)
    if (minSqft === undefined || perGallon === undefined || max === undefined) continue
    bands.push({ minSqft: Math.round(minSqft), maxSqft: max === null ? null : Math.round(max), perGallon })
  }
  return bands.length ? bands.sort((a, b) => a.minSqft - b.minSqft) : fallback.map((b) => ({ ...b }))
}

/** pricing_settings.job_discounts, lowest level first; the 2027 levels when the column is missing (an empty list means none). */
export function normalizeJobDiscounts(raw: unknown): JobDiscount[] {
  if (!Array.isArray(raw)) return JOB_DISCOUNTS_2027.map((j) => ({ ...j }))
  const out: JobDiscount[] = []
  for (const j of raw) {
    const r = obj(j)
    const minOrders = money(r.minOrders)
    const pct = money(r.pct)
    if (minOrders === undefined || pct === undefined || pct >= 100) continue
    out.push({ minOrders: Math.max(1, Math.round(minOrders)), pct })
  }
  return out.sort((a, b) => a.minOrders - b.minOrders)
}

/** The price list without costs, for the browser. */
export function clientPriceList(p: PriceList): ClientPriceList {
  return { retail: { ...p.retail }, bands: p.bands.map((b) => ({ ...b })), tote: { ...p.tote }, project: { ...p.project } }
}

/** "1,500–5,000 sq ft", "10,001+ sq ft". */
export function bandLabel(b: Pick<ProjectBand, 'minSqft' | 'maxSqft'>): string {
  const f = (n: number) => n.toLocaleString('en-US')
  return b.maxSqft == null ? `${f(b.minSqft)}+ sq ft` : `${f(b.minSqft)}–${f(b.maxSqft)} sq ft`
}
