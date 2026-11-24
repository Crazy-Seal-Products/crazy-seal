import type { KitBuilderCatalog } from '@/lib/store/kit-builder'
import { buildPriceMap, QUOTE_HANDLES, withoutCosts, type EngineSettings, type PriceMap } from './engine'
import { getPriceBook, getQuoteCatalog } from './price-book'
import { clientPriceList, type ClientPriceList } from './price-list-2027'
import { getPricingSettings } from './settings'
import { listTiers, tierLite } from './tiers'
import type { PriceBookRow, PricingSettings, PricingTier, TierLite } from './types'

/**
 * Everything the engine needs, read once: settings (with the price list),
 * tiers, the price book and the live catalog, with each usable variant's
 * size and cost. Server only.
 */
export interface PricingContext {
  settings: PricingSettings
  tiers: PricingTier[]
  priceBook: PriceBookRow[]
  catalog: KitBuilderCatalog
  prices: PriceMap
}

export async function loadPricing(): Promise<PricingContext> {
  const [settings, tiers, priceBook, catalog] = await Promise.all([getPricingSettings(), listTiers(), getPriceBook(), getQuoteCatalog()])
  return { settings, tiers, priceBook, catalog, prices: buildPriceMap(catalog, priceBook, settings.price_list) }
}

/**
 * What the browser gets to run the engine for the live preview: no costs
 * (the price list without its costs, the variants without theirs), only the
 * variants it may use (without their long descriptions) and only the tiers
 * that can apply to this buyer.
 */
export interface ClientPricing {
  catalog: KitBuilderCatalog
  prices: PriceMap
  priceList: ClientPriceList
  tiers: TierLite[]
  settings: EngineSettings & Pick<PricingSettings, 'offer_hours'>
  audience: 'public' | 'contractor'
  contractorTierId: string | null
  /** The contractor's Crazy Seal orders, for the order-count discount; null for the public or when unknown. */
  orderCount: number | null
  paymentTerms: 'card' | 'terms' | null
}

export function clientPricing(
  ctx: PricingContext,
  buyer: { audience: 'public' | 'contractor'; contractorTierId?: string | null; paymentTerms?: 'card' | 'terms' | null; orderCount?: number | null },
): ClientPricing {
  const catalog: KitBuilderCatalog = {}
  for (const h of QUOTE_HANDLES) {
    const p = ctx.catalog[h]
    if (!p) continue
    catalog[h] = { ...p, variants: p.variants.filter((v) => ctx.prices[v.id]).map((v) => ({ ...v, descriptionHtml: null })) }
  }
  const tiers = ctx.tiers
    .filter((t) => t.active && (t.audience === 'public' || (buyer.audience === 'contractor' && t.id === buyer.contractorTierId)))
    .map(tierLite)
  const s = ctx.settings
  return {
    catalog,
    prices: withoutCosts(ctx.prices),
    priceList: clientPriceList(s.price_list),
    tiers,
    settings: {
      free_shipping_under: s.free_shipping_under,
      free_shipping_over: s.free_shipping_over,
      capture_phone_at: s.capture_phone_at,
      capture_address_at: s.capture_address_at,
      coverage: s.coverage,
      offer_discount_pct: s.offer_discount_pct,
      offer_hours: s.offer_hours,
      job_discounts: s.job_discounts,
    },
    audience: buyer.audience,
    contractorTierId: buyer.contractorTierId ?? null,
    orderCount: buyer.audience === 'contractor' ? (buyer.orderCount ?? null) : null,
    paymentTerms: buyer.paymentTerms ?? null,
  }
}
