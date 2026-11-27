import { pickDiscount, type Discount } from '@/lib/pricing/engine'
import { clientPricing, loadPricing, type ClientPricing } from '@/lib/pricing/load'
import { contractorOrderCount } from '@/lib/pricing/order-count'
import { clientPriceList, type ClientPriceList } from '@/lib/pricing/price-list-2027'
import { getPricingSettings } from '@/lib/pricing/settings'
import { listTiers, tierLite } from '@/lib/pricing/tiers'
import type { Coverage, PricingSettings, PricingTier } from '@/lib/pricing/types'
import type { ContractorViewer } from './viewer'

/**
 * Crazy Seal's prices for one contractor, read once for the Catalog, Systems
 * and Customer view pages: the price list and coverage, the contractor's
 * discount (the single best of the live offer, their order-count level and
 * their assigned tier, as quotes pick it) and, when the store can be read,
 * the live catalog priced for the browser (no costs). Server only.
 */
export interface ContractorPricing {
  /** For server components only: it holds Crazy Seal's costs. */
  settings: PricingSettings
  tiers: PricingTier[]
  /** The contractor's Crazy Seal orders; null when they couldn't be counted. */
  orderCount: number | null
  discount: Discount | null
  /** Safe for the browser. */
  priceList: ClientPriceList
  coverage: Coverage
  /** The engine's inputs for the browser (no costs); null when the live catalog couldn't be read. */
  pricing: ClientPricing | null
}

export async function loadContractorPricing(viewer: ContractorViewer): Promise<ContractorPricing> {
  const c = viewer.contractor
  const [ctx, orderCount] = await Promise.all([
    loadPricing().catch((err) => {
      console.error('[portal products] pricing load failed', err)
      return null
    }),
    contractorOrderCount(c).catch((err) => {
      console.error('[portal products] order count failed', err)
      return null
    }),
  ])
  // Without the live catalog the prices still come from the database (an error there is the page's error, as on quotes).
  const [settings, tiers] = ctx ? [ctx.settings, ctx.tiers] : await Promise.all([getPricingSettings(), listTiers()])
  const discount = pickDiscount({
    offerPct: settings.offer_discount_pct,
    jobDiscounts: settings.job_discounts,
    tiers: tiers.map(tierLite),
    audience: 'contractor',
    contractorTierId: c.pricing_tier_id,
    orderCount,
    subtotalFull: 0,
  })
  return {
    settings,
    tiers,
    orderCount,
    discount,
    priceList: clientPriceList(settings.price_list),
    coverage: settings.coverage,
    pricing: ctx ? clientPricing(ctx, { audience: 'contractor', contractorTierId: c.pricing_tier_id, paymentTerms: c.payment_terms, orderCount }) : null,
  }
}
