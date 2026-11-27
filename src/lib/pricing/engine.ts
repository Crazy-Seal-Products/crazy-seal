// The quote engine: a roof in, priced materials out. PURE (no I/O, no clock),
// so the browser runs it for the live preview and the server runs it again,
// with costs, when a quote is saved. docs/pricing/engine-check.mjs checks it.
//
//   1. Materials from the roof and pricing_settings.coverage (the kit
//      builder's formulas, with the rates from settings):
//        sealant gallons = ceil(sqft / rate for the install method) x coats
//        patch gallons   = ceil(seams ft / patchFtPerGallon)
//        caulk tubes     = ceil(sqft / caulkSqftPerTube)
//        cleaner gallons = ceil(sqft / cleanSqftPerGallon)
//      An RV's roof is its length x RV_ROOF_WIDTH_FT.
//   2. Containers: each product's sizes for the colour, fewest first (5 / 3
//      / 1 gallon pails). From price_list.tote.gallons (275) of Crazy Seal,
//      whole totes and pails for the rest.
//   3. Prices (pricing_settings.price_list, the 2027 sheet by default): an
//      RV roof, or a roof under the first project band (1,500 sq ft), is
//      priced at retail; a bigger roof at its band. Seal and Patch per gallon
//      (retail $225, or the band's), totes per gallon, Caulk/Clean/Tape per
//      unit (project prices; retail Caulk $25, and Clean and Tape, which have
//      no retail price, at the project price). A price_book row can turn a
//      variant off, override its cost, or with a markup fix its price at
//      cost x markup.
//   4. The discount: the single best of the live offer (offer_discount_pct,
//      everyone), a contractor's order-count discount (job_discounts: 26+
//      orders 20%, 51+ 30%), the contractor's assigned tier and any public
//      volume tier the full subtotal reaches. A staff price replaces them
//      all. Money is rounded to cents per unit and per line.
//   5. Shipping, missing details and the handoff (see each function below).
//      Free shipping from free_shipping_over ($750) up to free_shipping_under
//      ($3,500), freight at or over that, shipping at checkout below $750.
//   6. The price is a live offer: it holds offer_hours (72) from pricing.

import { FREE_SHIPPING_OVER } from '@/lib/shipping'
import type { KitBuilderCatalog, KitProduct, KitVariant } from '@/lib/store/kit-builder'
import { bandLabel, PRODUCT_INFO, PRODUCT_KEYS, TAPE_ROLL_FT, type ClientPriceList, type JobDiscount, type PriceList, type ProductKey, type ProjectBand } from './price-list-2027'
import {
  APPLICATIONS,
  INSTALL_METHODS,
  ROOF_COLORS,
  type Coverage,
  type Handoff,
  type MissingKey,
  type PriceBookRow,
  type PricingSettings,
  type QuoteLine,
  type RoofInputs,
  type ShipTo,
  type TierLite,
} from './types'

/** The Shopify product for each product on the price list. */
export const QUOTE_PRODUCTS: Record<ProductKey, string> = {
  seal: 'crazy-seal',
  patch: 'crazy-patch',
  caulk: 'crazy-caulk',
  clean: 'crazy-clean',
  tape: 'crazy-tape',
  tote: 'crazy-seal-tote',
}
export const QUOTE_HANDLES: readonly string[] = PRODUCT_KEYS.map((k) => QUOTE_PRODUCTS[k])

/** Usable roof width of an RV, in feet. */
export const RV_ROOF_WIDTH_FT = 8

/** The discount names quotes show (quotes.tier_name). */
export const OFFER_NAME = 'Live offer'
export const STAFF_TIER_NAME = 'Staff price'
export const jobDiscountName = (j: Pick<JobDiscount, 'minOrders'>) => `Contractor ${j.minOrders}+ orders`

const HOUR = 3_600_000

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

// ─── Inputs ──────────────────────────────────────────────────────────────

/** Cleans the builder's answers, or says what's wrong. */
export function parseRoofInputs(raw: unknown): RoofInputs | { error: string } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const application = APPLICATIONS.find((a) => a.key === r.application)?.key
  if (!application) return { error: 'Choose what you’re sealing.' }
  const installMethod = INSTALL_METHODS.find((m) => m.key === r.installMethod)?.key
  if (!installMethod) return { error: 'Choose what it goes over.' }
  const color = ROOF_COLORS.find((c) => c.toLowerCase() === String(r.color ?? '').toLowerCase())
  if (!color) return { error: 'Choose a color.' }
  const num = (v: unknown) => (v === '' || v == null ? NaN : Number(String(v).replace(/,/g, '')))
  const seams = r.seamsFt === '' || r.seamsFt == null ? 0 : num(r.seamsFt)
  if (!Number.isFinite(seams) || seams < 0 || seams > 100_000) return { error: 'Enter the seams in feet (0 if none).' }
  const roofType = typeof r.roofType === 'string' && r.roofType.trim() ? r.roofType.trim().slice(0, 60) : null

  if (application === 'rv') {
    const len = num(r.rvLengthFt)
    if (!Number.isFinite(len) || len < 5 || len > 60) return { error: 'Enter the RV’s length in feet (5 to 60).' }
    return { application, installMethod, color, sqft: null, rvLengthFt: Math.round(len), seamsFt: Math.round(seams), roofType }
  }
  const sqft = num(r.sqft)
  if (!Number.isFinite(sqft) || sqft < 10 || sqft > 2_000_000) return { error: 'Enter the roof size in square feet.' }
  return { application, installMethod, color, sqft: Math.round(sqft), rvLengthFt: null, seamsFt: Math.round(seams), roofType }
}

export function roofSqft(inputs: RoofInputs): number {
  if (inputs.application === 'rv') return Math.ceil((inputs.rvLengthFt ?? 0) * RV_ROOF_WIDTH_FT)
  return Math.max(0, Math.round(inputs.sqft ?? 0))
}

export function roofSummary(inputs: RoofInputs): string {
  const size = inputs.application === 'rv' ? `${inputs.rvLengthFt} ft RV (${roofSqft(inputs).toLocaleString('en-US')} sq ft)` : `${roofSqft(inputs).toLocaleString('en-US')} sq ft`
  const method = inputs.installMethod === 'direct-to-deck' ? 'direct to deck' : 'over existing roof'
  const seams = inputs.seamsFt ? `, ${inputs.seamsFt.toLocaleString('en-US')} ft of seams` : ''
  return `${size}, ${method}, ${inputs.color}${seams}`
}

// ─── Materials ───────────────────────────────────────────────────────────

export interface Materials {
  sqft: number
  sealGallons: number
  patchGallons: number
  caulkTubes: number
  cleanGallons: number
}

export function materialsFor(inputs: RoofInputs, coverage: Coverage): Materials {
  const sqft = roofSqft(inputs)
  const rate = coverage.sealSqftPerGallonPerCoat[inputs.installMethod] || 100
  const coats = Math.max(1, Math.round(coverage.coats || 2))
  return {
    sqft,
    sealGallons: sqft > 0 ? Math.ceil(sqft / rate) * coats : 0,
    patchGallons: inputs.seamsFt > 0 ? Math.ceil(inputs.seamsFt / (coverage.patchFtPerGallon || 70)) : 0,
    caulkTubes: sqft > 0 ? Math.ceil(sqft / (coverage.caulkSqftPerTube || 400)) : 0,
    cleanGallons: sqft > 0 ? Math.ceil(sqft / (coverage.cleanSqftPerGallon || 1000)) : 0,
  }
}

// ─── Retail or project pricing ───────────────────────────────────────────

export type PriceBasis = { kind: 'retail'; band: null; label: string } | { kind: 'project'; band: ProjectBand; label: string }

/**
 * Retail for an RV roof or a roof under the first band's minimum; otherwise
 * the band the roof falls in (min <= sq ft <= max). A size in a gap between
 * bands takes the band below it.
 */
export function priceBasisFor(sqft: number, opts: { rv?: boolean; bands: ProjectBand[] }): PriceBasis {
  const bands = [...opts.bands].sort((a, b) => a.minSqft - b.minSqft)
  if (opts.rv) return { kind: 'retail', band: null, label: 'Retail pricing (RV roof)' }
  if (!bands.length || sqft < bands[0].minSqft) {
    return { kind: 'retail', band: null, label: bands.length ? `Retail pricing (under ${bands[0].minSqft.toLocaleString('en-US')} sq ft)` : 'Retail pricing' }
  }
  const band = bands.find((b) => sqft >= b.minSqft && (b.maxSqft == null || sqft <= b.maxSqft)) ?? [...bands].reverse().find((b) => b.minSqft <= sqft)!
  return { kind: 'project', band, label: `Project pricing: ${bandLabel(band)}` }
}

export function priceBasis(inputs: RoofInputs, bands: ProjectBand[]): PriceBasis {
  return priceBasisFor(roofSqft(inputs), { rv: inputs.application === 'rv', bands })
}

/** The price list's price for one unit (gallon, tube, 25 ft roll) of a product on this basis. */
export function listUnitPrice(product: ProductKey, basis: Pick<PriceBasis, 'kind' | 'band'>, list: ClientPriceList): number {
  switch (product) {
    case 'seal':
    case 'patch':
      return basis.kind === 'project' && basis.band ? basis.band.perGallon : list.retail[product]
    case 'tote':
      return list.tote.perGallon
    case 'caulk':
      return basis.kind === 'project' ? list.project.caulk : list.retail.caulk
    case 'clean':
    case 'tape':
      return basis.kind === 'project' ? list.project[product] : (list.retail[product] ?? list.project[product])
  }
}

// ─── Variants ────────────────────────────────────────────────────────────

export interface VariantPrice {
  product: ProductKey
  /** Units in one container: gallons (seal, patch, clean, tote), tubes (caulk), 25 ft rolls (tape). */
  units: number
  /** A price_book markup's fixed price (cost x markup), replacing the price list; null: the price list. */
  fixedFull: number | null
  /** Crazy Seal's cost for one container: the price book's, or the price list's per unit x units. Null for the browser. */
  cost: number | null
}

/** variant id -> what the engine needs to price it, for every variant quotes may use (inactive price-book rows left out). */
export type PriceMap = Record<string, VariantPrice>

const SIZE_OPTION = /size|length|container/i
const COLOR_OPTION = /colou?r/i

function sizeValue(v: KitVariant): string {
  return v.selectedOptions.find((o) => SIZE_OPTION.test(o.name))?.value ?? v.title
}

/** How many units one of this variant holds, or null when it isn't a size quotes use (e.g. a quart). */
export function variantUnits(product: ProductKey, v: KitVariant, toteGallons: number): number | null {
  if (product === 'tote') return toteGallons
  const text = product === 'tape' ? `${sizeValue(v)} ${v.title}` : sizeValue(v)
  const m =
    product === 'caulk'
      ? text.match(/(\d+)\s*tubes?/i)
      : product === 'tape'
        ? text.match(/(\d+(?:\.\d+)?)\s*(?:ft|foot|feet|')/i)
        : text.match(/(\d+(?:\.\d+)?)\s*(?:gal|gallon)/i)
  const n = m ? Number(m[1]) : NaN
  if (!Number.isFinite(n) || n <= 0) return null
  return product === 'tape' ? n / TAPE_ROLL_FT : n
}

export function buildPriceMap(catalog: KitBuilderCatalog, priceBook: Pick<PriceBookRow, 'variant_id' | 'material_cost' | 'markup' | 'active'>[], list: PriceList): PriceMap {
  const book = new Map(priceBook.map((r) => [r.variant_id, r]))
  const map: PriceMap = {}
  for (const product of PRODUCT_KEYS) {
    for (const v of catalog[QUOTE_PRODUCTS[product]]?.variants ?? []) {
      const row = book.get(v.id)
      if (row && !row.active) continue
      const units = variantUnits(product, v, list.tote.gallons)
      if (!units) continue
      const cost = row?.material_cost != null ? round2(row.material_cost) : round2(list.costs[product] * units)
      map[v.id] = { product, units, cost, fixedFull: row?.markup != null ? round2(cost * row.markup) : null }
    }
  }
  return map
}

/** The same map with costs removed, for the browser (a fixed price stays: it's a price, not a cost). */
export function withoutCosts(map: PriceMap): PriceMap {
  return Object.fromEntries(Object.entries(map).map(([id, p]) => [id, { ...p, cost: null }]))
}

/** One container's full price on this basis. */
export function variantFull(p: VariantPrice, basis: Pick<PriceBasis, 'kind' | 'band'>, list: ClientPriceList): number {
  return p.fixedFull ?? round2(listUnitPrice(p.product, basis, list) * p.units)
}

// ─── Containers and quantities ───────────────────────────────────────────

/** The product's container sizes for this colour, largest first: e.g. [{5 gal}, {3 gal}, {1 gal}]. */
function containers(product: KitProduct | undefined, color: string | null, prices: PriceMap): Array<{ size: number; variant: KitVariant }> {
  if (!product) return []
  const hasColor = product.options.some((o) => COLOR_OPTION.test(o.name))
  const bySize = new Map<number, KitVariant>()
  for (const v of product.variants) {
    const p = prices[v.id]
    if (!p) continue
    if (hasColor && color) {
      const c = v.selectedOptions.find((o) => COLOR_OPTION.test(o.name))?.value
      if (c && c.toLowerCase() !== color.toLowerCase()) continue
    }
    if (!bySize.has(p.units)) bySize.set(p.units, v)
  }
  return [...bySize.entries()].map(([size, variant]) => ({ size, variant })).sort((a, b) => b.size - a.size)
}

/**
 * Fewest containers for `need` units: as many of each size as fit, largest
 * first, and the smallest size rounds up. With 5/3/1 gallons this is the kit
 * builder's split (9 gallons = 5 + 3 + 1).
 */
export function splitContainers<T>(need: number, sizes: Array<{ size: number; variant: T }>): Array<{ size: number; variant: T; count: number }> {
  const out: Array<{ size: number; variant: T; count: number }> = []
  let rest = need
  sizes.forEach((s, i) => {
    if (rest <= 0) return
    const count = i === sizes.length - 1 ? Math.ceil(rest / s.size) : Math.floor(rest / s.size)
    if (count > 0) {
      out.push({ ...s, count })
      rest -= count * s.size
    }
  })
  return out
}

/** Whole totes once a job needs a tote's worth of Crazy Seal, pails for the rest. */
export function splitTotes(gallons: number, toteGallons: number): { totes: number; pailGallons: number } {
  const totes = toteGallons > 0 ? Math.floor(gallons / toteGallons) : 0
  return { totes, pailGallons: gallons - totes * toteGallons }
}

interface MaterialPick {
  product: KitProduct
  variant: KitVariant
  quantity: number
  detail: string
}

const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`

function pickMaterials(inputs: RoofInputs, coverage: Coverage, catalog: KitBuilderCatalog, prices: PriceMap, m: Materials) {
  const picks: MaterialPick[] = []
  const unavailable: string[] = []
  const coats = Math.max(1, Math.round(coverage.coats || 2))
  const rate = coverage.sealSqftPerGallonPerCoat[inputs.installMethod] || 100
  const coatsText = `${plural(coats, 'coat')} at ${rate} sq ft per gallon`
  const sealDetail = `${plural(m.sealGallons, 'gallon')}: ${coatsText}`

  // Crazy Seal: whole totes from a tote's worth (when the store has one in this colour), pails for the rest.
  let sealNeed = m.sealGallons
  const tote = containers(catalog[QUOTE_PRODUCTS.tote], inputs.color, prices)[0]
  if (tote && sealNeed >= tote.size) {
    const { totes, pailGallons } = splitTotes(sealNeed, tote.size)
    picks.push({
      product: catalog[QUOTE_PRODUCTS.tote],
      variant: tote.variant,
      quantity: totes,
      detail: `${(totes * tote.size).toLocaleString('en-US')} of ${plural(m.sealGallons, 'gallon')} in ${plural(totes, `${tote.size}-gallon tote`)} (${coatsText})`,
    })
    sealNeed = pailGallons
  }

  const want: Array<{ product: ProductKey; need: number; color: string | null; detail: string }> = [
    { product: 'seal', need: sealNeed, color: inputs.color, detail: sealNeed === m.sealGallons ? sealDetail : `The other ${plural(sealNeed, 'gallon')}, in pails` },
    { product: 'patch', need: m.patchGallons, color: inputs.color, detail: `${plural(m.patchGallons, 'gallon')} for ${inputs.seamsFt.toLocaleString('en-US')} ft of seams` },
    { product: 'caulk', need: m.caulkTubes, color: inputs.color, detail: 'For penetrations and attachment points' },
    { product: 'clean', need: m.cleanGallons, color: null, detail: 'Preps the roof so the membrane bonds' },
  ]
  for (const w of want) {
    if (w.need <= 0) continue
    const product = catalog[QUOTE_PRODUCTS[w.product]]
    const sizes = containers(product, w.color, prices)
    const name = product?.title || PRODUCT_INFO[w.product].name
    if (!product || !sizes.length) {
      unavailable.push(w.color ? `${name} (${w.color})` : name)
      continue
    }
    for (const part of splitContainers(w.need, sizes)) picks.push({ product, variant: part.variant, quantity: part.count, detail: w.detail })
  }
  return { picks, unavailable }
}

// ─── The discount ────────────────────────────────────────────────────────

export type DiscountKind = 'offer' | 'jobs' | 'tier' | 'volume' | 'staff'

export interface Discount {
  kind: DiscountKind
  pct: number
  /** What the quote shows (quotes.tier_name): "Live offer", "Contractor 51+ orders", the tier's name. */
  name: string
  /** pricing_tiers.id for a tier or volume discount. */
  tierId: string | null
}

/** The highest order-count level a contractor with `orders` orders reaches, or null. */
export function jobDiscountFor(orders: number | null | undefined, levels: JobDiscount[]): JobDiscount | null {
  if (orders == null || !Number.isFinite(orders)) return null
  return [...levels].filter((l) => orders >= l.minOrders).sort((a, b) => b.minOrders - a.minOrders)[0] ?? null
}

/** The next level up (to show "N more orders to 30% off"), or null at the top. */
export function nextJobDiscount(orders: number | null | undefined, levels: JobDiscount[]): JobDiscount | null {
  const n = orders ?? 0
  return [...levels].filter((l) => l.minOrders > n).sort((a, b) => a.minOrders - b.minOrders)[0] ?? null
}

/** Ties go to the more specific discount: an assigned tier, then order count, then a volume tier, then the live offer. */
const PRIORITY: Record<DiscountKind, number> = { staff: 5, tier: 4, jobs: 3, volume: 2, offer: 1 }

/**
 * The single best discount (they never stack): the live offer for everyone;
 * for a contractor, their order-count level and their assigned tier
 * (contractors.pricing_tier_id, an active contractor tier); for anyone, the
 * best active public volume tier the full subtotal reaches. Null when none
 * is above 0%.
 */
export function pickDiscount(opts: {
  offerPct: number
  jobDiscounts: JobDiscount[]
  tiers: TierLite[]
  audience: 'public' | 'contractor'
  contractorTierId?: string | null
  orderCount?: number | null
  subtotalFull: number
}): Discount | null {
  const candidates: Discount[] = []
  if (opts.offerPct > 0) candidates.push({ kind: 'offer', pct: opts.offerPct, name: OFFER_NAME, tierId: null })
  if (opts.audience === 'contractor') {
    const job = jobDiscountFor(opts.orderCount, opts.jobDiscounts)
    if (job) candidates.push({ kind: 'jobs', pct: job.pct, name: jobDiscountName(job), tierId: null })
    const own = opts.contractorTierId ? opts.tiers.find((t) => t.id === opts.contractorTierId && t.active && t.audience === 'contractor') : null
    if (own) candidates.push({ kind: 'tier', pct: Number(own.discount_pct), name: own.name, tierId: own.id })
  }
  const volume = opts.tiers
    .filter((t) => t.active && t.audience === 'public' && (t.min_subtotal ?? 0) <= opts.subtotalFull)
    .sort((a, b) => b.discount_pct - a.discount_pct || a.sort - b.sort)[0]
  if (volume) candidates.push({ kind: 'volume', pct: Number(volume.discount_pct), name: volume.name, tierId: volume.id })
  const best = candidates.filter((c) => c.pct > 0).sort((a, b) => b.pct - a.pct || PRIORITY[b.kind] - PRIORITY[a.kind])[0]
  return best ?? null
}

// ─── Shipping, missing details, handoff, the offer's window ─────────────

/**
 * Shipping on the discounted materials total:
 *   at or over free_shipping_under ($3,500): freight, which staff quote (no
 *     amount until they set one);
 *   from free_shipping_over ($750): free, $0;
 *   below that: no amount, the buyer pays shipping at checkout.
 */
export function shippingFor(merchandise: number, freeShippingUnder: number, freeShippingOver = FREE_SHIPPING_OVER, freight: number | null = null): { shipping: 'free' | 'freight'; shipping_total: number | null } {
  if (merchandise > 0 && merchandise >= freeShippingUnder) return { shipping: 'freight', shipping_total: freight != null ? round2(freight) : null }
  return { shipping: 'free', shipping_total: merchandise >= freeShippingOver ? 0 : null }
}

export function shipToComplete(s: ShipTo | null | undefined): boolean {
  return Boolean(s?.street?.trim() && s.city?.trim() && s.state?.trim() && s.zip?.trim())
}

/** Phone from capture_phone_at and a full ship-to address from capture_address_at (on the quote total). */
export function missingInfo(total: number, buyer: { phone?: string | null; shipTo?: ShipTo | null }, settings: Pick<PricingSettings, 'capture_phone_at' | 'capture_address_at'>): MissingKey[] {
  const out: MissingKey[] = []
  if (total >= settings.capture_phone_at && !buyer.phone?.trim()) out.push('phone')
  if (total >= settings.capture_address_at && !shipToComplete(buyer.shipTo)) out.push('ship_to')
  return out
}

/**
 * Why a quote goes to staff instead of straight to checkout, first match:
 * freight shipping; a contractor on payment terms (Crazy Seal invoices them);
 * a material the store couldn't price (no_access); details still missing
 * (incomplete). Null: the buyer can check out.
 */
export function decideHandoff(q: { shipping: 'free' | 'freight'; audience: 'public' | 'contractor'; paymentTerms?: 'card' | 'terms' | null; missing: MissingKey[]; unavailable?: string[] }): Handoff | null {
  if (q.shipping === 'freight') return 'freight'
  if (q.audience === 'contractor' && q.paymentTerms === 'terms') return 'terms'
  if (q.unavailable?.length) return 'no_access'
  if (q.missing.length) return 'incomplete'
  return null
}

/** When a price made at `pricedAt` (ms) stops: offer_hours later. */
export function offerExpiresAt(pricedAt: number, offerHours: number): number {
  return pricedAt + Math.max(1, Math.round(offerHours || 72)) * HOUR
}

// ─── The quote ───────────────────────────────────────────────────────────

export type EngineSettings = Pick<
  PricingSettings,
  'free_shipping_under' | 'free_shipping_over' | 'capture_phone_at' | 'capture_address_at' | 'coverage' | 'offer_discount_pct' | 'job_discounts'
>

export interface PriceRequest {
  inputs: RoofInputs
  catalog: KitBuilderCatalog
  prices: PriceMap
  priceList: ClientPriceList
  settings: EngineSettings
  tiers: TierLite[]
  audience: 'public' | 'contractor'
  contractorTierId?: string | null
  /** The contractor's Crazy Seal orders (not cancelled), for the order-count discount. */
  orderCount?: number | null
  paymentTerms?: 'card' | 'terms' | null
  buyer?: { phone?: string | null; shipTo?: ShipTo | null }
  /** A staff price: a discount that replaces every other, and/or the freight amount. */
  override?: { discountPct?: number | null; freight?: number | null } | null
}

export interface PriceResult {
  materials: Materials
  /** Retail or the roof's project band. */
  basis: PriceBasis
  lines: QuoteLine[]
  /** Materials the store had no variant for (the quote goes to staff). */
  unavailable: string[]
  subtotal_full: number
  discount_pct: number
  discount_total: number
  discount_kind: DiscountKind | null
  tier_id: string | null
  tier_name: string | null
  shipping: 'free' | 'freight'
  shipping_total: number | null
  total: number
  /** Null unless every line has a cost (the browser never has costs). */
  cost_total: number | null
  missing: MissingKey[]
  handoff: Handoff | null
}

export function priceQuote(req: PriceRequest): PriceResult {
  const materials = materialsFor(req.inputs, req.settings.coverage)
  const basis = priceBasis(req.inputs, req.priceList.bands)
  const { picks, unavailable } = pickMaterials(req.inputs, req.settings.coverage, req.catalog, req.prices, materials)
  const fullOf = (variantId: string) => variantFull(req.prices[variantId], basis, req.priceList)

  const subtotalFull = round2(picks.reduce((s, p) => s + round2(fullOf(p.variant.id) * p.quantity), 0))

  let discount: Discount | null
  const staffPct = req.override?.discountPct
  if (staffPct != null && Number.isFinite(staffPct)) {
    discount = { kind: 'staff', pct: staffPct, name: STAFF_TIER_NAME, tierId: null }
  } else {
    discount = pickDiscount({
      offerPct: req.settings.offer_discount_pct,
      jobDiscounts: req.settings.job_discounts,
      tiers: req.tiers,
      audience: req.audience,
      contractorTierId: req.contractorTierId,
      orderCount: req.orderCount,
      subtotalFull,
    })
  }
  const discountPct = Math.min(99.99, Math.max(0, round2(discount?.pct ?? 0)))

  const lines: QuoteLine[] = picks.map((p) => {
    const full = fullOf(p.variant.id)
    const unitPrice = round2(full * (1 - discountPct / 100))
    return {
      variant_id: p.variant.id,
      product_handle: p.product.handle,
      product_title: p.product.title,
      variant_title: p.variant.title,
      image: p.variant.image ?? p.product.featuredImage ?? null,
      quantity: p.quantity,
      unit_full: full,
      unit_price: unitPrice,
      line_total: round2(unitPrice * p.quantity),
      unit_cost: req.prices[p.variant.id].cost,
      detail: p.detail,
    }
  })

  const merchandise = round2(lines.reduce((s, l) => s + l.line_total, 0))
  const discountTotal = round2(subtotalFull - merchandise)
  const ship = shippingFor(merchandise, req.settings.free_shipping_under, req.settings.free_shipping_over ?? FREE_SHIPPING_OVER, req.override?.freight ?? null)
  const total = round2(merchandise + (ship.shipping_total ?? 0))
  const costTotal = lines.length && lines.every((l) => l.unit_cost != null) ? round2(lines.reduce((s, l) => s + round2((l.unit_cost ?? 0) * l.quantity), 0)) : null
  const missing = missingInfo(total, req.buyer ?? {}, req.settings)
  const applied = discountPct > 0 ? discount : null

  return {
    materials,
    basis,
    lines,
    unavailable,
    subtotal_full: subtotalFull,
    discount_pct: discountPct,
    discount_total: discountTotal,
    discount_kind: applied?.kind ?? null,
    tier_id: applied?.tierId ?? null,
    tier_name: applied?.name ?? null,
    shipping: ship.shipping,
    shipping_total: ship.shipping_total,
    total,
    cost_total: costTotal,
    missing,
    handoff: decideHandoff({ shipping: ship.shipping, audience: req.audience, paymentTerms: req.paymentTerms, missing, unavailable }),
  }
}

/** "Shipping calculated at checkout" and friends, for any quote-like record. */
export function shippingCopy(q: { shipping: 'free' | 'freight'; shipping_total: number | null }): string {
  if (q.shipping === 'freight') return q.shipping_total != null ? 'Freight' : 'Freight: Crazy Seal will quote it'
  if (q.shipping_total === 0) return 'Free shipping'
  return 'Shipping calculated at checkout'
}
