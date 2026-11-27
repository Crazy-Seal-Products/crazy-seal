import { createAdminClient } from '@/lib/supabase/admin'
import { decideHandoff, missingInfo, offerExpiresAt, priceQuote, roofSummary, type PriceResult } from '@/lib/pricing/engine'
import { loadPricing, type PricingContext } from '@/lib/pricing/load'
import { contractorOrderCount } from '@/lib/pricing/order-count'
import { getPricingSettings } from '@/lib/pricing/settings'
import { discountLabel, HANDOFF_LABEL, usd, type RoofInputs, type ShipTo } from '@/lib/pricing/types'
import { discardDraft, NO_DRAFT } from './checkout'
import { addQuoteEvent } from './events'
import { toQuote } from './data'
import { newQuoteToken } from './token'
import { isActive, type QuoteAudience, type QuoteRow, type QuoteSource } from './types'

/**
 * Creating and repricing quotes. Every price comes from the engine
 * (src/lib/pricing/engine.ts) run on the server with the price list's costs
 * and, for a contractor, their order count. A quote's price is a live offer:
 * it holds pricing_settings.offer_hours (72) from priced_at
 * (expires_at = priced_at + offer_hours). Once it expires it can be
 * refreshed: repricing makes a new revision (revision + 1, priced_at now, a
 * new offer window) at the current price list, costs and discounts.
 */

export class QuoteError extends Error {}

export interface QuoteContractor {
  id: string
  pricing_tier_id: string | null
  payment_terms: 'card' | 'terms'
  rep_id: string | null
  /** For counting the contractor's orders (with its team members' accounts). */
  shopify_customer_ids?: string[] | null
}

export interface NewQuote {
  audience: QuoteAudience
  source: QuoteSource
  inputs: RoofInputs
  buyer: {
    name: string
    email: string
    phone?: string | null
    company?: string | null
    buyerRole?: string | null
    timeline?: string | null
    zip?: string | null
    shipTo?: ShipTo | null
  }
  contractor?: QuoteContractor | null
  projectId?: string | null
  leadId?: string | null
  repId?: string | null
  createdByProUser?: string | null
  createdByStaff?: string | null
  notes?: string | null
}

function price(
  ctx: PricingContext,
  q: { audience: QuoteAudience; inputs: RoofInputs; phone?: string | null; shipTo?: ShipTo | null; contractor?: QuoteContractor | null; orderCount?: number | null; override?: QuoteRow['price_override'] },
): PriceResult {
  return priceQuote({
    inputs: q.inputs,
    catalog: ctx.catalog,
    prices: ctx.prices,
    priceList: ctx.settings.price_list,
    settings: ctx.settings,
    tiers: ctx.tiers,
    audience: q.audience,
    contractorTierId: q.contractor?.pricing_tier_id ?? null,
    orderCount: q.orderCount ?? null,
    paymentTerms: q.contractor?.payment_terms ?? null,
    buyer: { phone: q.phone, shipTo: q.shipTo },
    override: q.override ? { discountPct: q.override.discountPct, freight: q.override.freight } : null,
  })
}

/** Settings, tiers, price book and catalog, and the contractor's order count, or a QuoteError. */
async function pricingFor(contractor: QuoteContractor | null | undefined): Promise<{ ctx: PricingContext; orderCount: number | null }> {
  try {
    const [ctx, orderCount] = await Promise.all([
      loadPricing(),
      contractor ? contractorOrderCount({ id: contractor.id, shopify_customer_ids: contractor.shopify_customer_ids ?? [] }) : Promise.resolve(null),
    ])
    return { ctx, orderCount }
  } catch (err) {
    console.error('[quotes] pricing load failed', err)
    throw new QuoteError('Prices aren’t available right now. Try again in a minute.')
  }
}

const discountText = (q: Pick<QuoteRow, 'tier_name' | 'discount_pct'>) => (q.discount_pct > 0 ? discountLabel(q.tier_name, q.discount_pct) : 'full price')

function priced(r: PriceResult) {
  return {
    lines: r.lines,
    cost_total: r.cost_total,
    subtotal_full: r.subtotal_full,
    discount_pct: r.discount_pct,
    discount_total: r.discount_total,
    tier_id: r.tier_id,
    tier_name: r.tier_name,
    shipping: r.shipping,
    shipping_total: r.shipping_total,
    total: r.total,
    missing: r.missing,
    handoff: r.handoff,
  }
}

const clip = (v: string | null | undefined, max: number) => (v ?? '').trim().slice(0, max) || null

const SHIP_TO_KEYS = ['name', 'company', 'street', 'street2', 'city', 'state', 'zip', 'phone'] as const

/** Same address, field by field (jsonb doesn't keep key order, so JSON text can't be compared). */
function sameShipTo(a: ShipTo | null | undefined, b: ShipTo | null | undefined): boolean {
  if (!a || !b) return !a && !b
  return SHIP_TO_KEYS.every((k) => (a[k] ?? null) === (b[k] ?? null))
}

export async function createQuote(input: NewQuote, actor: string): Promise<QuoteRow> {
  const { ctx, orderCount } = await pricingFor(input.contractor)
  const r = price(ctx, { audience: input.audience, inputs: input.inputs, phone: input.buyer.phone, shipTo: input.buyer.shipTo, contractor: input.contractor, orderCount })
  if (!r.lines.length) throw new QuoteError('We couldn’t price materials for this roof. Call us and we’ll quote it.')

  const now = new Date()
  const { data, error } = await createAdminClient()
    .from('quotes')
    .insert({
      token: newQuoteToken(),
      audience: input.audience,
      source: input.source,
      contractor_id: input.contractor?.id ?? null,
      project_id: input.projectId ?? null,
      lead_id: input.leadId ?? null,
      rep_id: input.repId ?? input.contractor?.rep_id ?? null,
      created_by_pro_user: input.createdByProUser ?? null,
      created_by_staff: input.createdByStaff ?? null,
      name: clip(input.buyer.name, 120) ?? 'Customer',
      email: input.buyer.email.trim().toLowerCase().slice(0, 160),
      phone: clip(input.buyer.phone, 40),
      company: clip(input.buyer.company, 160),
      buyer_role: clip(input.buyer.buyerRole, 60),
      timeline: clip(input.buyer.timeline, 60),
      zip: clip(input.buyer.zip ?? input.buyer.shipTo?.zip, 10),
      ship_to: input.buyer.shipTo ?? null,
      inputs: input.inputs,
      revision: 1,
      ...priced(r),
      priced_at: now.toISOString(),
      expires_at: new Date(offerExpiresAt(now.getTime(), ctx.settings.offer_hours)).toISOString(),
      notes: clip(input.notes, 3000),
      status: 'open',
    })
    .select('*')
    .single()
  if (error) {
    console.error('[quotes] insert failed', error)
    throw new QuoteError('The quote couldn’t be saved. Try again.')
  }
  const quote = toQuote(data as Record<string, unknown>)
  await addQuoteEvent(quote.id, 'created', `${quote.number} created: ${roofSummary(quote.inputs)}, ${usd(quote.total)} (${discountText(quote)}, ${r.basis.label.toLowerCase()}), offer good ${ctx.settings.offer_hours} hours`, {
    actor,
    data: { total: quote.total, tier: quote.tier_name, discount: r.discount_kind, basis: r.basis.label, orders: orderCount, source: quote.source },
  })
  if (r.unavailable.length) await addQuoteEvent(quote.id, 'handoff', `The store had nothing to price for: ${r.unavailable.join(', ')}`, { actor: 'Quote builder', data: { unavailable: r.unavailable } })
  else if (quote.handoff) await addQuoteEvent(quote.id, 'handoff', `Goes to staff: ${HANDOFF_LABEL[quote.handoff]}`, { actor: 'Quote builder', data: { handoff: quote.handoff } })
  return quote
}

async function contractorFor(q: Pick<QuoteRow, 'contractor_id'>): Promise<QuoteContractor | null> {
  if (!q.contractor_id) return null
  const { data } = await createAdminClient().from('contractors').select('id, pricing_tier_id, payment_terms, rep_id, shopify_customer_ids').eq('id', q.contractor_id).maybeSingle()
  return data
    ? {
        id: String(data.id),
        pricing_tier_id: data.pricing_tier_id ?? null,
        payment_terms: data.payment_terms === 'terms' ? 'terms' : 'card',
        rep_id: data.rep_id ?? null,
        shopify_customer_ids: Array.isArray(data.shopify_customer_ids) ? (data.shopify_customer_ids as string[]) : [],
      }
    : null
}

/**
 * Prices the quote again from today's price list, costs, discounts (the
 * contractor's order count as of now) and settings: revision + 1, priced_at
 * now, and a new live offer of offer_hours. Keeps any staff override. A quote
 * at checkout goes back to open, and its draft order (for the old revision)
 * is closed: its columns cleared in the same update and the draft deleted in
 * Shopify.
 */
export async function repriceQuote(quote: QuoteRow, opts: { actor: string; reason?: string }): Promise<QuoteRow> {
  if (!isActive(quote)) throw new QuoteError(`This quote is ${quote.status}; it can’t be repriced.`)
  const contractor = await contractorFor(quote)
  const { ctx, orderCount } = await pricingFor(contractor)
  const now = Date.now()
  const r = price(ctx, { audience: quote.audience, inputs: quote.inputs, phone: quote.phone, shipTo: quote.ship_to, contractor, orderCount, override: quote.price_override })
  if (!r.lines.length) throw new QuoteError('Nothing on this quote can be priced right now.')

  const expires = offerExpiresAt(now, ctx.settings.offer_hours)
  const revision = quote.revision + 1
  let update = createAdminClient()
    .from('quotes')
    .update({
      ...priced(r),
      ...NO_DRAFT,
      revision,
      priced_at: new Date(now).toISOString(),
      expires_at: new Date(expires).toISOString(),
      status: 'open',
      updated_at: new Date(now).toISOString(),
    })
    .eq('id', quote.id)
    .eq('revision', quote.revision)
    .in('status', ['open', 'checkout'])
  // Only the draft read here is closed below; one made since then means the quote changed.
  update = quote.shopify_draft_order_id ? update.eq('shopify_draft_order_id', quote.shopify_draft_order_id) : update.is('shopify_draft_order_id', null)
  const { data, error } = await update.select('*').maybeSingle()
  if (error) throw new QuoteError(error.message)
  if (!data) throw new QuoteError('This quote changed while you were working. Reload and try again.')
  const next = toQuote(data as Record<string, unknown>)
  await discardDraft(quote, { actor: opts.actor, reason: `repriced as revision ${revision}` })
  const change = next.total === quote.total ? 'unchanged' : `${usd(quote.total)} → ${usd(next.total)}`
  await addQuoteEvent(
    next.id,
    'priced',
    `Repriced as revision ${revision}: ${usd(next.total)} (${change}; ${discountText(next)}), offer good ${ctx.settings.offer_hours} hours${opts.reason ? `. ${opts.reason}` : ''}`,
    {
      actor: opts.actor,
      data: { revision, total: next.total, previous_total: quote.total, discount_pct: next.discount_pct, tier: next.tier_name, discount: r.discount_kind, basis: r.basis.label, orders: orderCount, expires_at: next.expires_at },
    },
  )
  if (r.unavailable.length) await addQuoteEvent(next.id, 'handoff', `The store had nothing to price for: ${r.unavailable.join(', ')}`, { actor: 'Quote builder', data: { unavailable: r.unavailable } })
  return next
}

/**
 * The buyer filled in details (phone, ship-to address, name): saves them and
 * works out again what's missing and whether the quote still goes to staff.
 * Prices don't change. A no_access handoff (checkout failed) stays until staff
 * or a reprice clears it. When the details change, an open checkout (its
 * draft carries the old ones) is closed and the quote goes back to open.
 */
export async function updateBuyerInfo(
  quote: QuoteRow,
  info: { name?: string | null; phone?: string | null; company?: string | null; shipTo?: ShipTo | null },
  actor: string,
): Promise<QuoteRow> {
  if (!isActive(quote)) throw new QuoteError(`This quote is ${quote.status}.`)
  const settings = await getPricingSettings()
  const phone = info.phone !== undefined ? clip(info.phone, 40) : quote.phone
  const shipTo = info.shipTo !== undefined ? info.shipTo : quote.ship_to
  const missing = missingInfo(quote.total, { phone, shipTo }, settings)
  const contractor = await contractorFor(quote)
  const handoff =
    quote.handoff === 'no_access'
      ? 'no_access'
      : decideHandoff({ shipping: quote.shipping, audience: quote.audience, paymentTerms: contractor?.payment_terms ?? null, missing })
  const patch: Record<string, unknown> = { phone, ship_to: shipTo, missing, handoff, updated_at: new Date().toISOString() }
  if (info.name?.trim()) patch.name = clip(info.name, 120)
  if (info.company !== undefined) patch.company = clip(info.company, 160)
  if (shipTo?.zip) patch.zip = clip(shipTo.zip, 10)
  const detailsChanged =
    phone !== quote.phone ||
    !sameShipTo(shipTo, quote.ship_to) ||
    ('name' in patch && patch.name !== quote.name) ||
    ('company' in patch && patch.company !== quote.company)
  // New details close the draft read here (it carries the old ones); one made since then means the quote changed.
  const closeDraft = detailsChanged ? { ...NO_DRAFT, ...(quote.status === 'checkout' && quote.shopify_draft_order_id ? { status: 'open' } : {}) } : {}
  let update = createAdminClient()
    .from('quotes')
    .update({ ...patch, ...closeDraft })
    .eq('id', quote.id)
    .in('status', ['open', 'checkout'])
  if (detailsChanged) update = quote.shopify_draft_order_id ? update.eq('shopify_draft_order_id', quote.shopify_draft_order_id) : update.is('shopify_draft_order_id', null)
  const { data, error } = await update.select('*').maybeSingle()
  if (error) throw new QuoteError(error.message)
  if (!data) throw new QuoteError('This quote changed while you were working. Reload and try again.')
  const next = toQuote(data as Record<string, unknown>)
  if (detailsChanged) await discardDraft(quote, { actor, reason: 'the buyer’s details changed' })
  const filled = [phone !== quote.phone && phone ? 'phone' : null, !sameShipTo(shipTo, quote.ship_to) && shipTo ? 'ship-to address' : null].filter(Boolean)
  if (filled.length) await addQuoteEvent(next.id, 'note', `Added ${filled.join(' and ')}`, { actor })
  return next
}
