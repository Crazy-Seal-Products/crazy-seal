import { createAdminClient } from '@/lib/supabase/admin'
import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { shipToComplete } from '@/lib/pricing/engine'
import { HANDOFF_LABEL, MISSING_LABEL } from '@/lib/pricing/types'
import { getQuote, toQuote } from './data'
import { emailStaff } from './emails'
import { addQuoteEvent } from './events'
import { isActive, isExpired, type QuoteRow } from './types'

/**
 * Checkout for a quote: a Shopify draft order at the quote's own prices, whose
 * invoice link is where the buyer pays. The draft carries the custom
 * attribute cs_quote = <quote id>, so when the order arrives the
 * link_quote_order trigger (033_quotes.sql) marks the quote ordered and links
 * its project. One draft per revision: asking again for the same revision
 * reuses it. When Shopify fails, the quote goes to staff (handoff no_access)
 * and the lead inbox hears about it.
 *
 * Two clicks at once can't make two drafts: before asking Shopify, the quote
 * is claimed with a conditional update (status 'checkout' and checkout_at set,
 * no draft yet, only where nobody else holds it). The other click waits a few
 * seconds for that draft and reuses it, or is told checkout is already
 * opening. The draft is saved only if nothing changed the quote meanwhile;
 * otherwise it is deleted again.
 *
 * A draft is closed (discardDraft: deleted in Shopify, its columns cleared,
 * and a quote_events line) whenever the quote it was made from stops being
 * what the buyer would pay for: a new revision, cancelled or lost, or new
 * buyer details. A draft that has already become an order is never deleted.
 */

const DRAFT_ORDER_CREATE = /* GraphQL */ `
  mutation QuoteDraftOrder($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        invoiceUrl
      }
      userErrors {
        field
        message
      }
    }
  }
`

interface DraftOrderCreateResult {
  draftOrderCreate: {
    draftOrder: { id: string; name: string; invoiceUrl: string | null } | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

const DRAFT_ORDER_STATUS = /* GraphQL */ `
  query QuoteDraftOrderStatus($id: ID!) {
    draftOrder(id: $id) {
      id
      name
      status
      order {
        id
        name
      }
    }
  }
`

interface DraftOrderStatusResult {
  draftOrder: { id: string; name: string; status: string; order: { id: string; name: string } | null } | null
}

const DRAFT_ORDER_DELETE = /* GraphQL */ `
  mutation QuoteDraftOrderDelete($input: DraftOrderDeleteInput!) {
    draftOrderDelete(input: $input) {
      deletedId
      userErrors {
        field
        message
      }
    }
  }
`

interface DraftOrderDeleteResult {
  draftOrderDelete: { deletedId: string | null; userErrors: Array<{ field: string[] | null; message: string }> }
}

export type CheckoutResult = { ok: true; url: string; reused: boolean } | { ok: false; error: string; handedOff?: boolean; busy?: boolean }

/** The quote columns that point at its draft order, emptied when the draft is closed. */
export const NO_DRAFT = { shopify_draft_order_id: null, invoice_url: null, draft_revision: null } as const

/**
 * Deletes a quote's Shopify draft order once the quote no longer matches it
 * (best effort: a failure is logged and recorded for staff, never thrown) and
 * records a quote_events line. Callers clear the quote's draft columns
 * (NO_DRAFT) in the same update that changed the quote, then call this with
 * the quote as it was. A draft that has already become an order is kept.
 */
export async function discardDraft(
  quote: Pick<QuoteRow, 'id' | 'number' | 'shopify_draft_order_id' | 'draft_revision'>,
  opts: { actor: string; reason: string },
): Promise<void> {
  const draftId = quote.shopify_draft_order_id
  if (!draftId) return
  const data = { draft_order_id: draftId, revision: quote.draft_revision, reason: opts.reason }
  try {
    const found = await shopifyAdminGraphql<DraftOrderStatusResult>(DRAFT_ORDER_STATUS, { id: draftId })
    const draft = found.draftOrder
    if (!draft) {
      await addQuoteEvent(quote.id, 'checkout', `Checkout closed (${opts.reason}). Its Shopify draft was already gone.`, { actor: opts.actor, data })
      return
    }
    if (draft.order || draft.status === 'COMPLETED') {
      await addQuoteEvent(
        quote.id,
        'checkout',
        `Checkout closed (${opts.reason}), but Shopify draft ${draft.name} was already paid${draft.order ? ` as ${draft.order.name}` : ''}, so it was kept.`,
        { actor: opts.actor, data: { ...data, order_id: draft.order?.id ?? null } },
      )
      return
    }
    const result = await shopifyAdminGraphql<DraftOrderDeleteResult>(DRAFT_ORDER_DELETE, { input: { id: draftId } })
    const errors = result.draftOrderDelete.userErrors
    if (errors.length) throw new Error(errors.map((e) => e.message).join('; '))
    await addQuoteEvent(quote.id, 'checkout', `Checkout closed (${opts.reason}): Shopify draft ${draft.name} deleted, so the old invoice link no longer works.`, { actor: opts.actor, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[quotes] deleting draft ${draftId} for ${quote.number} failed`, message)
    await addQuoteEvent(
      quote.id,
      'checkout',
      `Checkout closed (${opts.reason}), but its Shopify draft couldn’t be deleted (${message.slice(0, 300)}). Delete draft ${draftId} in Shopify so the old invoice can’t be paid.`,
      { actor: opts.actor, data: { ...data, error: message.slice(0, 500) } },
    )
  }
}

const money = (n: number) => ({ amount: n.toFixed(2), currencyCode: 'USD' })

function draftInput(q: QuoteRow): Record<string, unknown> {
  const [firstName, ...rest] = (q.ship_to?.name || q.name).trim().split(/\s+/)
  const input: Record<string, unknown> = {
    email: q.email,
    note: `Crazy Seal quote ${q.number} (revision ${q.revision})`,
    tags: ['quote', q.number],
    customAttributes: [{ key: 'cs_quote', value: q.id }],
    lineItems: q.lines.map((l) => ({ variantId: l.variant_id, quantity: l.quantity, priceOverride: money(l.unit_price) })),
  }
  if (shipToComplete(q.ship_to)) {
    const s = q.ship_to!
    const state = (s.state ?? '').trim().toUpperCase()
    input.shippingAddress = {
      firstName: firstName || undefined,
      lastName: rest.join(' ') || undefined,
      company: s.company || q.company || undefined,
      address1: s.street,
      address2: s.street2 || undefined,
      city: s.city,
      ...(/^[A-Z]{2}$/.test(state) ? { provinceCode: state } : {}),
      zip: s.zip,
      countryCode: 'US',
    }
  }
  if (q.shipping_total === 0) input.shippingLine = { title: 'Free shipping', priceWithCurrency: money(0) }
  else if (q.shipping === 'freight' && q.shipping_total != null) input.shippingLine = { title: 'Freight', priceWithCurrency: money(q.shipping_total) }
  return input
}

/** Why this quote can't go to checkout yet, or null when it can. Staff may check out a handed-off quote. */
export function checkoutBlocker(q: QuoteRow, opts: { staff?: boolean } = {}, now = Date.now()): string | null {
  if (!isActive(q)) return `This quote is ${q.status}.`
  if (!q.lines.length) return 'This quote has no materials.'
  if (isExpired(q, now)) return 'These prices have expired. Refresh them first.'
  if (q.missing.length) return `Add your ${q.missing.map((m) => MISSING_LABEL[m].toLowerCase()).join(' and ')} first.`
  if (q.handoff && !opts.staff) {
    if (q.handoff === 'freight') return 'This order ships freight, so a Crazy Seal specialist will quote the freight and send your invoice.'
    if (q.handoff === 'terms') return 'Crazy Seal will invoice you for this order.'
    return 'A Crazy Seal specialist is finishing this quote and will send your invoice.'
  }
  if (opts.staff && q.shipping === 'freight' && q.shipping_total == null) return 'Add the freight amount first (Price override).'
  return null
}

/** How long an unfinished claim holds a quote before another checkout may take it over. */
const CLAIM_MS = 2 * 60_000
/** A click that finds checkout already opening looks again this many times, this far apart. */
const CLAIM_TRIES = 8
const CLAIM_WAIT_MS = 750

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** The invoice link of a draft made from the quote's current revision, if it has one. */
function currentInvoice(q: QuoteRow): string | null {
  return q.shopify_draft_order_id && q.invoice_url && q.draft_revision === q.revision ? q.invoice_url : null
}

/** Another request is making this quote's draft right now (claimed, no draft yet, not stale). */
function claimHeld(q: QuoteRow, now = Date.now()): boolean {
  return q.status === 'checkout' && !q.shopify_draft_order_id && Boolean(q.checkout_at) && Date.parse(q.checkout_at!) > now - CLAIM_MS
}

/** Closes a draft that can't be reused (an older revision's). Returns the quote without it, or null when the quote changed meanwhile. */
async function closeOldDraft(q: QuoteRow, actor: string): Promise<QuoteRow | null> {
  const { data } = await createAdminClient()
    .from('quotes')
    .update({ ...NO_DRAFT, status: 'open', updated_at: new Date().toISOString() })
    .eq('id', q.id)
    .eq('shopify_draft_order_id', q.shopify_draft_order_id!)
    .in('status', ['open', 'checkout'])
    .select('*')
    .maybeSingle()
  if (!data) return null
  const reason = q.draft_revision !== q.revision ? `it was for revision ${q.draft_revision ?? '?'}; the quote is now revision ${q.revision}` : 'it had no invoice link'
  await discardDraft(q, { actor, reason })
  return toQuote(data as Record<string, unknown>)
}

/**
 * Claims the quote for making its draft: status 'checkout', checkout_at and
 * updated_at = the claim time, only while it is still this revision, has no
 * draft, and nobody else holds a fresh claim. Returns the claimed quote, or
 * null when another request got there first.
 */
async function claimForCheckout(q: QuoteRow): Promise<QuoteRow | null> {
  const claimAt = new Date().toISOString()
  const stale = new Date(Date.now() - CLAIM_MS).toISOString()
  const { data, error } = await createAdminClient()
    .from('quotes')
    .update({ status: 'checkout', checkout_at: claimAt, updated_at: claimAt })
    .eq('id', q.id)
    .eq('revision', q.revision)
    .in('status', ['open', 'checkout'])
    .is('shopify_draft_order_id', null)
    .or(`status.eq.open,checkout_at.is.null,checkout_at.lt."${stale}"`)
    .select('*')
    .maybeSingle()
  if (error) throw new Error(`quotes claim: ${error.message}`)
  return data ? toQuote(data as Record<string, unknown>) : null
}

/** Gives the claim back (checkout_at as it was before) when no draft came of it. */
async function releaseClaim(claimed: QuoteRow, before: QuoteRow, extra: Record<string, unknown> = {}): Promise<QuoteRow | null> {
  const { data } = await createAdminClient()
    .from('quotes')
    .update({ status: 'open', checkout_at: before.checkout_at, ...extra, updated_at: new Date().toISOString() })
    .eq('id', claimed.id)
    .eq('status', 'checkout')
    .eq('checkout_at', claimed.checkout_at!)
    .is('shopify_draft_order_id', null)
    .select('*')
    .maybeSingle()
  return data ? toQuote(data as Record<string, unknown>) : null
}

export async function createCheckout(quote: QuoteRow, opts: { actor: string; staff?: boolean }): Promise<CheckoutResult> {
  const db = createAdminClient()
  let current: QuoteRow = quote
  let claimed: QuoteRow | null = null
  for (let attempt = 0; attempt < CLAIM_TRIES && !claimed; attempt++) {
    if (attempt) {
      await sleep(CLAIM_WAIT_MS)
      const fresh = await getQuote(quote.id)
      if (!fresh) return { ok: false, error: 'Quote not found.' }
      current = fresh
    }
    const blocked = checkoutBlocker(current, { staff: opts.staff })
    if (blocked) return { ok: false, error: blocked }

    const invoice = currentInvoice(current)
    if (invoice) {
      if (current.status !== 'checkout') {
        await db.from('quotes').update({ status: 'checkout', checkout_at: current.checkout_at ?? new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', current.id).eq('status', 'open')
      }
      return { ok: true, url: invoice, reused: true }
    }
    if (current.shopify_draft_order_id) {
      const closed = await closeOldDraft(current, opts.actor)
      if (!closed) continue
      current = closed
    }
    if (claimHeld(current)) continue
    try {
      claimed = await claimForCheckout(current)
    } catch (err) {
      console.error(`[quotes] checkout claim for ${current.number} failed`, err)
      return { ok: false, error: 'We couldn’t open checkout just now. Try again.' }
    }
  }
  if (!claimed) {
    return { ok: false, busy: true, error: 'Checkout is already being opened for this quote. Wait a few seconds, then try again.' }
  }
  const before = current

  let draft: { id: string; name: string; invoiceUrl: string | null } | null = null
  let failure: string | null = null
  try {
    const data = await shopifyAdminGraphql<DraftOrderCreateResult>(DRAFT_ORDER_CREATE, { input: draftInput(claimed) })
    const errors = data.draftOrderCreate.userErrors
    if (errors.length) failure = errors.map((e) => e.message).join('; ')
    else draft = data.draftOrderCreate.draftOrder
    if (!failure && !draft?.invoiceUrl) failure = 'Shopify returned no invoice link.'
  } catch (err) {
    failure = err instanceof Error ? err.message : String(err)
  }

  if (failure || !draft?.invoiceUrl) {
    console.error(`[quotes] checkout for ${claimed.number} failed`, failure)
    // A draft Shopify made without an invoice link isn't usable: don't leave it behind.
    if (draft?.id) await discardDraft({ ...claimed, shopify_draft_order_id: draft.id, draft_revision: claimed.revision }, { actor: opts.actor, reason: 'Shopify gave it no invoice link' })
    const released = await releaseClaim(claimed, before, { handoff: 'no_access' })
    let handed = released
    if (!handed) {
      const { data } = await db
        .from('quotes')
        .update({ handoff: 'no_access', updated_at: new Date().toISOString() })
        .eq('id', claimed.id)
        .in('status', ['open', 'checkout'])
        .select('*')
        .maybeSingle()
      handed = data ? toQuote(data as Record<string, unknown>) : { ...claimed, handoff: 'no_access' as const }
    }
    await addQuoteEvent(claimed.id, 'handoff', `Checkout couldn’t be opened in Shopify, so the quote went to staff (${HANDOFF_LABEL.no_access}).`, {
      actor: opts.actor,
      data: { error: (failure ?? '').slice(0, 500) },
    })
    await emailStaff(handed, 'Checkout failed: send this buyer an invoice', `Shopify said: ${failure ?? 'no response'}. Create the checkout from the admin, or invoice them in Shopify.`)
    return {
      ok: false,
      handedOff: true,
      error: opts.staff ? `Shopify refused the draft order: ${failure}` : 'We couldn’t open checkout just now. A Crazy Seal specialist has your quote and will send your invoice shortly.',
    }
  }

  // Saved only while this request still holds the claim and nothing else changed the quote
  // (a reprice, new buyer details, cancelling it); otherwise the draft is stale and goes.
  const now = new Date().toISOString()
  const { data: saved, error } = await db
    .from('quotes')
    .update({
      shopify_draft_order_id: draft.id,
      invoice_url: draft.invoiceUrl,
      draft_revision: claimed.revision,
      status: 'checkout',
      checkout_at: now,
      updated_at: now,
    })
    .eq('id', claimed.id)
    .eq('revision', claimed.revision)
    .eq('status', 'checkout')
    .eq('checkout_at', claimed.checkout_at!)
    .eq('updated_at', claimed.updated_at)
    .is('shopify_draft_order_id', null)
    .select('id')
  if (error || !saved?.length) {
    if (error) console.error(`[quotes] saving draft ${draft.id} on ${claimed.number} failed`, error.message)
    await discardDraft({ ...claimed, shopify_draft_order_id: draft.id, draft_revision: claimed.revision }, {
      actor: opts.actor,
      reason: error ? 'it couldn’t be saved on the quote' : 'the quote changed while checkout was opening',
    })
    await releaseClaim(claimed, before)
    return { ok: false, error: error ? 'We couldn’t open checkout just now. Try again.' : 'This quote changed while checkout was opening. Reload the page and try again.' }
  }
  await addQuoteEvent(claimed.id, 'checkout', `Checkout opened: Shopify draft ${draft.name} for revision ${claimed.revision}`, {
    actor: opts.actor,
    data: { draft_order_id: draft.id, draft_name: draft.name, revision: claimed.revision },
  })
  return { ok: true, url: draft.invoiceUrl, reused: false }
}
