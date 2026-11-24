import { createAdminClient } from '@/lib/supabase/admin'
import { contactName } from '@/lib/contractors/types'
import { clientPricing, loadPricing, type ClientPricing, type PricingContext } from '@/lib/pricing/load'
import { contractorOrderCount } from '@/lib/pricing/order-count'
import type { ShipTo } from '@/lib/pricing/types'
import type { RepRoster } from '@/lib/portal/admin/reps'
import type { QuoteContractor } from './create'
import { contractorPriceLabel } from './portal'

/**
 * Reads for the admin's new quote (Admin > Quotes > New quote): the
 * contractors staff can quote for, and one contractor's pricing (their tier,
 * order count and payment terms) for the live preview. Server only; the page
 * and the actions in ./admin-create check the admin first.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** One row of the contractor picker. */
export interface QuoteContractorOption {
  id: string
  /** Their company, or their name when they have none. */
  name: string
  /** The person, when `name` is a company. */
  contact: string | null
  email: string | null
  city: string | null
  state: string | null
  /** Assigned to the signed-in rep (contractors.rep_id). */
  mine: boolean
}

/** A contractor's open project, to link the quote to (same shape as the portal builder's). */
export interface AdminQuoteProject {
  id: string
  name: string
  stage: string
  roof_type: string | null
  sqft: number | null
  seams: number | null
  color: string | null
  site: ShipTo | null
}

/** The contractor a quote is for, with what the builder fills in and shows. */
export interface AdminQuoteContractor {
  id: string
  name: string
  contact: string | null
  company: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip: string | null
  paymentTerms: 'card' | 'terms'
  repName: string | null
  /** Their Crazy Seal orders (the order-count discount), null when they couldn't be counted. */
  orderCount: number | null
  /** "Contractor 26+ orders 20% off", "full price". */
  priceLabel: string
  projects: AdminQuoteProject[]
}

export interface AdminQuoteContractorContext {
  contractor: AdminQuoteContractor
  /** Their pricing for the browser; costs only for roles that can open Pricing. */
  pricing: ClientPricing
}

type ContractorRecord = {
  id: string
  company: string | null
  first_name: string | null
  goes_by: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip: string | null
  rep_id: string | null
  pricing_tier_id: string | null
  payment_terms: string | null
  shopify_customer_ids: string[] | null
}

const CONTRACTOR_COLUMNS = 'id, company, first_name, goes_by, last_name, email, phone, city, state, zip, rep_id, pricing_tier_id, payment_terms, shopify_customer_ids'

const displayName = (c: Pick<ContractorRecord, 'company' | 'first_name' | 'goes_by' | 'last_name' | 'email'>) => c.company?.trim() || contactName(c) || c.email || 'Contractor'

/**
 * The browser's pricing for this buyer (clientPricing: no costs), with the
 * price book's costs put back for roles that can open Pricing so the preview
 * can show cost and margin. Never for a sales rep.
 */
export function adminClientPricing(ctx: PricingContext, buyer: Parameters<typeof clientPricing>[1], showCost: boolean): ClientPricing {
  const pricing = clientPricing(ctx, buyer)
  return showCost ? { ...pricing, prices: ctx.prices } : pricing
}

/** Every contractor, the signed-in rep's own first. */
export async function quoteContractorOptions(myRepId: string | null): Promise<QuoteContractorOption[]> {
  const { data, error } = await createAdminClient()
    .from('contractors')
    .select('id, company, first_name, goes_by, last_name, email, city, state, rep_id')
    .order('company', { ascending: true, nullsFirst: false })
    .limit(5000)
  if (error) throw new Error(`contractors: ${error.message}`)
  return ((data ?? []) as Pick<ContractorRecord, 'id' | 'company' | 'first_name' | 'goes_by' | 'last_name' | 'email' | 'city' | 'state' | 'rep_id'>[])
    .map((c) => {
      const name = displayName(c)
      const contact = contactName(c) || null
      return { id: c.id, name, contact: contact && contact !== name ? contact : null, email: c.email, city: c.city, state: c.state, mine: Boolean(myRepId && c.rep_id === myRepId) }
    })
    .sort((a, b) => Number(b.mine) - Number(a.mine) || a.name.localeCompare(b.name))
}

/** The contractor as createQuote prices them, or null when there's no such contractor. */
export async function quoteContractorRecord(id: string): Promise<{ record: ContractorRecord; contractor: QuoteContractor } | null> {
  if (!UUID_RE.test(id)) return null
  const { data, error } = await createAdminClient().from('contractors').select(CONTRACTOR_COLUMNS).eq('id', id).maybeSingle<ContractorRecord>()
  if (error) throw new Error(`contractors: ${error.message}`)
  if (!data) return null
  return {
    record: data,
    contractor: {
      id: data.id,
      pricing_tier_id: data.pricing_tier_id ?? null,
      payment_terms: data.payment_terms === 'terms' ? 'terms' : 'card',
      rep_id: data.rep_id ?? null,
      shopify_customer_ids: Array.isArray(data.shopify_customer_ids) ? data.shopify_customer_ids : [],
    },
  }
}

/** The contractor's open projects (not complete or lost), newest first. */
async function openProjects(contractorId: string): Promise<AdminQuoteProject[]> {
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('id, name, stage, roof_type, sqft, seams, color, site')
    .eq('contractor_id', contractorId)
    .not('stage', 'in', '(complete,lost)')
    .order('updated_at', { ascending: false })
    .limit(300)
  if (error) {
    console.error('[admin quotes] contractor_projects', error.message)
    return []
  }
  return (data ?? []).map((p) => ({
    id: String(p.id),
    name: String(p.name),
    stage: String(p.stage),
    roof_type: p.roof_type ?? null,
    sqft: p.sqft == null ? null : Number(p.sqft),
    seams: p.seams == null ? null : Number(p.seams),
    color: p.color ?? null,
    site: (p.site as ShipTo | null) ?? null,
  }))
}

/**
 * One contractor for the builder: their details, projects and pricing (their
 * tier, their order count for the 20% / 30% order-count levels, the live
 * offer, whichever is best). Null when there's no such contractor. Throws
 * when prices can't be loaded.
 */
export async function adminQuoteContractorContext(
  id: string,
  opts: { ctx?: PricingContext | null; showCost: boolean; roster: RepRoster },
): Promise<AdminQuoteContractorContext | null> {
  const found = await quoteContractorRecord(id)
  if (!found) return null
  const { record: c, contractor } = found
  const [ctx, orderCount, projects] = await Promise.all([
    opts.ctx ?? loadPricing(),
    // Only the preview's discount depends on it; createQuote counts again when the quote is saved.
    contractorOrderCount({ id: c.id, shopify_customer_ids: contractor.shopify_customer_ids ?? [] }).catch((err) => {
      console.error('[admin quotes] order count failed', err)
      return null
    }),
    openProjects(c.id),
  ])
  const name = displayName(c)
  return {
    contractor: {
      id: c.id,
      name,
      contact: contactName(c) || null,
      company: c.company?.trim() || null,
      email: c.email,
      phone: c.phone,
      city: c.city,
      state: c.state,
      zip: c.zip,
      paymentTerms: contractor.payment_terms,
      repName: c.rep_id ? (opts.roster.reps.find((r) => r.id === c.rep_id)?.name ?? null) : null,
      orderCount,
      priceLabel: contractorPriceLabel(contractor, ctx.tiers, ctx.settings, orderCount),
      projects,
    },
    pricing: adminClientPricing(ctx, { audience: 'contractor', contractorTierId: contractor.pricing_tier_id, paymentTerms: contractor.payment_terms, orderCount }, opts.showCost),
  }
}
