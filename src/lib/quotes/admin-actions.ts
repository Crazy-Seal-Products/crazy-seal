'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import { getRepRoster, repForAdmin } from '@/lib/portal/admin/reps'
import { usd } from '@/lib/pricing/types'
import { createCheckout, discardDraft, NO_DRAFT } from './checkout'
import { QuoteError, repriceQuote } from './create'
import { getQuote } from './data'
import { emailQuoteToBuyer } from './emails'
import { addQuoteEvent } from './events'
import { isActive, type PriceOverride, type QuoteRow } from './types'

/**
 * Staff writes to a quote (Admin > Quotes > a quote). Every one takes the
 * Quotes section; a Sales rep only reaches quotes whose rep is them
 * (sales_reps.staff_email = their login). Each leaves a quote_events line.
 */

type Found = { ok: true; admin: PortalAdmin; quote: QuoteRow } | { ok: false; error: string }

async function staffQuote(id: string): Promise<Found> {
  const admin = await requirePortalAdmin('quotes')
  const quote = await getQuote(id)
  if (!quote) return { ok: false, error: 'Quote not found' }
  if (admin.role === 'sales_rep') {
    const me = repForAdmin(admin, await getRepRoster())
    if (!me?.id || quote.rep_id !== me.id) return { ok: false, error: 'This quote belongs to another rep.' }
  }
  return { ok: true, admin, quote }
}

const actorOf = (a: PortalAdmin) => `${a.name} (Crazy Seal)`

function done(id: string, message?: string): ActionResult {
  revalidatePath(`/portal/admin/quotes/${id}`)
  revalidatePath('/portal/admin/quotes')
  return { ok: true, message }
}

export async function addQuoteNote(id: string, _prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  const text = String(form.get('note') ?? '').trim().slice(0, 4000)
  if (!text) return { ok: false, error: 'Write a note first.' }
  await addQuoteEvent(id, 'note', text, { actor: actorOf(f.admin) })
  return done(id, 'Note added')
}

export interface OverrideInput {
  /** Percent off the full price, '' to keep the tier. */
  discountPct: string
  /** Freight amount in dollars, '' for none. */
  freight: string
  reason: string
}

export async function overrideQuotePrice(id: string, input: OverrideInput): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  const { admin, quote } = f
  if (!isActive(quote)) return { ok: false, error: `This quote is ${quote.status}.` }
  const parse = (v: string, max: number) => {
    const s = String(v ?? '').replace(/[$,%\s]/g, '')
    if (!s) return null
    const n = Number(s)
    return Number.isFinite(n) && n >= 0 && n <= max ? n : NaN
  }
  const discountPct = parse(input?.discountPct, 99.99)
  const freight = parse(input?.freight, 1_000_000)
  if (Number.isNaN(discountPct)) return { ok: false, error: 'The discount is a percent from 0 to 99.' }
  if (Number.isNaN(freight)) return { ok: false, error: 'Freight is a dollar amount.' }
  if (discountPct == null && freight == null) return { ok: false, error: 'Enter a discount, a freight amount, or both.' }
  const reason = String(input?.reason ?? '').trim().slice(0, 500)
  if (!reason) return { ok: false, error: 'Say why (the buyer won’t see it).' }

  const override: PriceOverride = { discountPct, freight, reason, by: admin.email, at: new Date().toISOString() }
  const db = createAdminClient()
  const { error } = await db.from('quotes').update({ price_override: override }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  try {
    const next = await repriceQuote({ ...quote, price_override: override }, {
      actor: actorOf(admin),
      reason: `Staff price${discountPct != null ? `: ${discountPct}% off` : ''}${freight != null ? `${discountPct != null ? ',' : ':'} freight ${usd(freight)}` : ''}. ${reason}`,
    })
    return done(id, `Repriced: ${usd(next.total)}`)
  } catch (err) {
    await db.from('quotes').update({ price_override: quote.price_override }).eq('id', id)
    return { ok: false, error: err instanceof QuoteError ? err.message : 'Couldn’t reprice.' }
  }
}

export async function clearQuoteOverride(id: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  if (!f.quote.price_override) return { ok: true, message: 'No override' }
  if (!isActive(f.quote)) return { ok: false, error: `This quote is ${f.quote.status}.` }
  const db = createAdminClient()
  const { error } = await db.from('quotes').update({ price_override: null }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  try {
    const next = await repriceQuote({ ...f.quote, price_override: null }, { actor: actorOf(f.admin), reason: 'Staff price removed.' })
    return done(id, `Back to list pricing: ${usd(next.total)}`)
  } catch (err) {
    await db.from('quotes').update({ price_override: f.quote.price_override }).eq('id', id)
    return { ok: false, error: err instanceof QuoteError ? err.message : 'Couldn’t reprice.' }
  }
}

export async function repriceQuoteAsStaff(id: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  try {
    const next = await repriceQuote(f.quote, { actor: actorOf(f.admin), reason: 'Repriced by staff.' })
    return done(id, `Repriced: ${usd(next.total)}`)
  } catch (err) {
    return { ok: false, error: err instanceof QuoteError ? err.message : 'Couldn’t reprice.' }
  }
}

async function close(id: string, status: 'lost' | 'cancelled', reason: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  if (!isActive(f.quote)) return { ok: false, error: `This quote is already ${f.quote.status}.` }
  const why = reason.trim().slice(0, 500)
  if (status === 'lost' && !why) return { ok: false, error: 'Say why it was lost.' }
  // Its checkout closes with it: the draft read here is cleared in the same update and deleted
  // in Shopify, so the invoice link can't be paid; one made since then means the quote changed.
  let update = createAdminClient()
    .from('quotes')
    .update({ status, lost_reason: status === 'lost' ? why : f.quote.lost_reason, ...NO_DRAFT, updated_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['open', 'checkout'])
  update = f.quote.shopify_draft_order_id ? update.eq('shopify_draft_order_id', f.quote.shopify_draft_order_id) : update.is('shopify_draft_order_id', null)
  const { data, error } = await update.select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'This quote changed. Reload and try again.' }
  await addQuoteEvent(id, status, status === 'lost' ? `Marked lost: ${why}` : `Cancelled${why ? `: ${why}` : ''}`, { actor: actorOf(f.admin) })
  await discardDraft(f.quote, { actor: actorOf(f.admin), reason: status === 'lost' ? 'marked lost' : 'cancelled' })
  return done(id, status === 'lost' ? 'Marked lost' : 'Cancelled')
}

export async function markQuoteLost(id: string, reason: string): Promise<ActionResult> {
  return close(id, 'lost', String(reason ?? ''))
}

export async function cancelQuote(id: string, reason: string): Promise<ActionResult> {
  return close(id, 'cancelled', String(reason ?? ''))
}

export async function reopenQuote(id: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  if (f.quote.status !== 'lost' && f.quote.status !== 'cancelled') return { ok: false, error: 'Only a lost or cancelled quote can be reopened.' }
  const { error } = await createAdminClient().from('quotes').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await addQuoteEvent(id, 'note', `Reopened (was ${f.quote.status})`, { actor: actorOf(f.admin) })
  return done(id, 'Reopened')
}

export async function resendQuoteLink(id: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  const sent = await emailQuoteToBuyer(f.quote)
  if (!sent) return { ok: false, error: 'The email didn’t send. Try again.' }
  await addQuoteEvent(id, 'reminder', `Quote link emailed again to ${f.quote.email}`, { actor: actorOf(f.admin), data: { manual: true } })
  return done(id, `Sent to ${f.quote.email}`)
}

/** Staff open checkout for a quote that went to them (freight, terms, a failed checkout, missing details filled by phone). */
export async function createQuoteCheckout(id: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  const result = await createCheckout(f.quote, { actor: actorOf(f.admin), staff: true })
  if (!result.ok) return { ok: false, error: result.error }
  revalidatePath(`/portal/admin/quotes/${id}`)
  return { ok: true, message: result.reused ? 'Checkout already open for this revision' : 'Checkout created. Send the buyer the invoice link.' }
}

/** Links a Shopify order to the quote by hand (e.g. it was placed without the quote's checkout). */
export async function linkQuoteOrder(id: string, orderRef: string): Promise<ActionResult> {
  const f = await staffQuote(id)
  if (!f.ok) return f
  const { admin, quote } = f
  if (quote.shopify_order_id) return { ok: false, error: 'This quote already has an order.' }
  const ref = String(orderRef ?? '').trim()
  if (!ref) return { ok: false, error: 'Enter the order number, e.g. #1234.' }

  const db = createAdminClient()
  const digits = ref.replace(/^#/, '')
  type Order = { shopify_id: string; name: string; total_price: number | null; shopify_created_at: string | null }
  const cols = 'shopify_id, name, total_price, shopify_created_at'
  let order: Order | null = null
  for (const [col, value] of [
    ['name', `#${digits}`],
    ['name', ref],
    ['legacy_resource_id', digits],
    ['shopify_id', ref.startsWith('gid://') ? ref : `gid://shopify/Order/${digits}`],
  ] as const) {
    const { data } = await db.from('shopify_orders').select(cols).eq(col, value).is('deleted_at', null).limit(1).maybeSingle<Order>()
    if (data) {
      order = data
      break
    }
  }
  if (!order) return { ok: false, error: `No Shopify order ${ref} in the store copy yet. Refresh orders and try again.` }
  const { data: other } = await db.from('quotes').select('number').eq('shopify_order_id', order.shopify_id).maybeSingle()
  if (other) return { ok: false, error: `Order ${order.name} is already linked to ${other.number}.` }

  const { data: updated, error } = await db
    .from('quotes')
    .update({ status: 'ordered', shopify_order_id: order.shopify_id, ordered_at: order.shopify_created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .is('shopify_order_id', null)
    .select('id')
  if (error) return { ok: false, error: error.message }
  if (!updated?.length) return { ok: false, error: 'This quote changed. Reload and try again.' }
  await addQuoteEvent(id, 'ordered', `Linked by hand to ${order.name}${order.total_price != null ? ` (${usd(Number(order.total_price))})` : ''}`, {
    actor: actorOf(admin),
    data: { shopify_order_id: order.shopify_id, name: order.name, total: order.total_price, manual: true },
  })
  if (quote.project_id) {
    await db.from('contractor_project_orders').upsert({ project_id: quote.project_id, shopify_order_id: order.shopify_id, linked_by: admin.email }, { onConflict: 'project_id,shopify_order_id', ignoreDuplicates: true })
    await db.from('contractor_projects').update({ stage: 'ordered', updated_at: new Date().toISOString() }).eq('id', quote.project_id).in('stage', ['lead', 'quoted', 'won'])
  }
  return done(id, `Linked to ${order.name}`)
}
