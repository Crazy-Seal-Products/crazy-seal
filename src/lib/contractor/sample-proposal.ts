import { dateLong } from '@/lib/portal/admin/format'
import { parseRoofInputs, priceQuote, roofSummary, round2 } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { stripCosts, type PublicQuoteLine } from '@/lib/pricing/types'
import type { Segment } from '@/lib/contractors/types'

/** The markup a new proposal starts with (ProposalEditor's default). */
export const SAMPLE_MARKUP_PCT = 25

/** The totals a proposal sheet shows (QuoteTotals in src/components/quotes/QuoteLines.tsx). */
export interface SampleTotals {
  subtotal_full: number
  discount_pct: number
  discount_total: number
  tier_name: string | null
  shipping: 'free' | 'freight'
  shipping_total: number | null
  total: number
}

export interface SampleProposal {
  lines: PublicQuoteLine[]
  totals: SampleTotals
  subtitle: string
  markupPct: number
  date: string
}

/**
 * The Customer view's sample proposal: a typical roof for the contractor's
 * segment (a 30 ft RV, or a 5,000 sq ft commercial roof), priced by the quote
 * engine at their prices, then marked up the way a proposal shows materials
 * to their customer: no discount line and no Crazy Seal prices. Null when
 * there are no prices to work with. Pure: runs on the browser's pricing
 * (no costs).
 */
export function sampleProposal(segment: Segment, pricing: ClientPricing | null, now: Date = new Date()): SampleProposal | null {
  if (!pricing) return null
  const inputs = parseRoofInputs(
    segment === 'rv'
      ? { application: 'rv', installMethod: 'over-existing', color: 'White', rvLengthFt: 30, seamsFt: 60 }
      : { application: 'commercial', installMethod: 'over-existing', color: 'White', sqft: 5000, seamsFt: 400 },
  )
  if ('error' in inputs) return null
  const result = priceQuote({
    inputs,
    catalog: pricing.catalog,
    prices: pricing.prices,
    priceList: pricing.priceList,
    settings: pricing.settings,
    tiers: pricing.tiers,
    audience: 'contractor',
    contractorTierId: pricing.contractorTierId,
    orderCount: pricing.orderCount,
    paymentTerms: pricing.paymentTerms,
  })
  if (!result.lines.length) return null
  const lines: PublicQuoteLine[] = stripCosts(result.lines).map((l) => {
    const unit = round2(l.unit_price * (1 + SAMPLE_MARKUP_PCT / 100))
    return { ...l, unit_full: unit, unit_price: unit, line_total: round2(unit * l.quantity) }
  })
  const subtotal = round2(lines.reduce((sum, l) => sum + l.line_total, 0))
  return {
    lines,
    totals: {
      subtotal_full: subtotal,
      discount_pct: 0,
      discount_total: 0,
      tier_name: null,
      shipping: result.shipping,
      shipping_total: result.shipping_total,
      total: round2(subtotal + (result.shipping_total ?? 0)),
    },
    subtitle: roofSummary(inputs),
    markupPct: SAMPLE_MARKUP_PCT,
    date: dateLong(now.toISOString()),
  }
}
