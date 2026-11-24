import { createAdminClient } from '@/lib/supabase/admin'
import { seesRecord } from '@/lib/contractor/roles'
import type { ContractorViewer } from '@/lib/contractor/viewer'
import { pickDiscount } from '@/lib/pricing/engine'
import { tierLite } from '@/lib/pricing/tiers'
import { discountLabel, type PricingSettings, type PricingTier, type ShipTo } from '@/lib/pricing/types'
import { getQuote } from './data'
import type { QuoteRow } from './types'

/** Reads for the contractor portal's quote pages, scoped to the viewer. Server only. */

/** The quote, when it's the viewer's contractor's and their role may see it. */
export async function getPortalQuote(viewer: ContractorViewer, id: string): Promise<QuoteRow | null> {
  const quote = await getQuote(id)
  if (!quote || quote.contractor_id !== viewer.contractor.id) return null
  // Roles that see the whole company (including operations, who order) see every quote; a sales rep, their own.
  return seesRecord(viewer, [quote.created_by_pro_user]) ? quote : null
}

export interface QuoteProject {
  id: string
  name: string
  stage: string
  roof_type: string | null
  sqft: number | null
  seams: number | null
  color: string | null
  site: ShipTo | null
}

/** Projects the viewer can quote: their contractor's open ones (a sales rep's own). */
export async function quotableProjects(viewer: ContractorViewer): Promise<QuoteProject[]> {
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('id, name, stage, roof_type, sqft, seams, color, site, assigned_to, created_by, ops_lead_id, updated_at')
    .eq('contractor_id', viewer.contractor.id)
    .not('stage', 'in', '(complete,lost)')
    .order('updated_at', { ascending: false })
    .limit(300)
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  return (data ?? [])
    .filter((p) => seesRecord(viewer, [p.assigned_to, p.created_by, p.ops_lead_id]))
    .map((p) => ({ id: p.id, name: p.name, stage: p.stage, roof_type: p.roof_type, sqft: p.sqft, seams: p.seams, color: p.color, site: (p.site as ShipTo | null) ?? null }))
}

export async function projectNames(contractorId: string, ids: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(ids.filter(Boolean))]
  if (!unique.length) return new Map()
  const { data } = await createAdminClient().from('contractor_projects').select('id, name').eq('contractor_id', contractorId).in('id', unique)
  return new Map((data ?? []).map((p) => [p.id as string, p.name as string]))
}

/**
 * The contractor's standing discount (before any volume tier a big quote may
 * reach): "Contractor 26+ orders 20% off", "Military 20% off", "Live offer
 * 10% off", or "full price".
 */
export function contractorPriceLabel(
  c: { pricing_tier_id: string | null },
  tiers: PricingTier[],
  settings: Pick<PricingSettings, 'offer_discount_pct' | 'job_discounts'>,
  orderCount: number | null,
): string {
  const d = pickDiscount({
    offerPct: settings.offer_discount_pct,
    jobDiscounts: settings.job_discounts,
    tiers: tiers.map(tierLite),
    audience: 'contractor',
    contractorTierId: c.pricing_tier_id,
    orderCount,
    subtotalFull: 0,
  })
  return d ? `${discountLabel(d.name, d.pct)} off` : 'full price'
}
