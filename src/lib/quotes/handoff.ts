import { createAdminClient } from '@/lib/supabase/admin'
import { toQuote } from './data'
import { emailStaff } from './emails'
import { addQuoteEvent } from './events'
import { isActive, type QuoteRow } from './types'

/**
 * Handing a quote to Crazy Seal staff on request. The rules that send a
 * quote to staff on their own (freight, terms, missing details, a material
 * the store couldn't price) are decideHandoff in src/lib/pricing/engine.ts;
 * a failed checkout is in ./checkout.ts. Here:
 *   specialist: the buyer pressed "Talk to a specialist". The quote is marked
 *     for staff (keeping its handoff reason, or 'incomplete' when it had none).
 *   terms_order: a contractor on payment terms asked to order. Crazy Seal
 *     invoices them, so staff build the order.
 * Staff get one email per request (repeats within 30 minutes are only logged).
 */

export type HandoffRequest = 'specialist' | 'terms_order'

const SUMMARY: Record<HandoffRequest, string> = {
  specialist: 'Asked to talk to a roofing specialist',
  terms_order: 'Asked to order on payment terms: invoice them',
}

export async function requestHandoff(quote: QuoteRow, kind: HandoffRequest, opts: { actor: string; message?: string | null }): Promise<QuoteRow> {
  if (!isActive(quote)) return quote
  const db = createAdminClient()
  const since = new Date(Date.now() - 30 * 60_000).toISOString()
  const { data: recent } = await db.from('quote_events').select('id, data').eq('quote_id', quote.id).eq('kind', 'handoff').gte('at', since)
  const repeat = (recent ?? []).some((e) => (e.data as { request?: string } | null)?.request === kind)

  let next = quote
  if (!quote.handoff) {
    const { data } = await db.from('quotes').update({ handoff: 'incomplete', updated_at: new Date().toISOString() }).eq('id', quote.id).is('handoff', null).select('*').maybeSingle()
    if (data) next = toQuote(data as Record<string, unknown>)
  }
  const message = opts.message?.trim().slice(0, 2000) || null
  await addQuoteEvent(quote.id, 'handoff', message ? `${SUMMARY[kind]}: “${message}”` : SUMMARY[kind], { actor: opts.actor, data: { request: kind } })
  if (!repeat) await emailStaff(next, kind === 'specialist' ? 'A buyer wants to talk to a specialist' : 'Order on terms: invoice this contractor', message ?? undefined)
  return next
}
