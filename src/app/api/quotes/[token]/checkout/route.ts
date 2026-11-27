import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'
import { createCheckout } from '@/lib/quotes/checkout'
import { getQuoteByToken } from '@/lib/quotes/data'

/** The buyer's "Check out": a Shopify draft order for the quote, and its invoice link to pay at. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (rateLimited(request, 'quote-checkout', 10, 10 * 60_000)) return NextResponse.json({ error: 'Too many tries. Wait a few minutes.' }, { status: 429 })
  const quote = await getQuoteByToken((await params).token)
  if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
  // A contractor's quote is ordered from their portal, which checks the orders.create permission;
  // its link (resent or forwarded) must not be a way around that.
  if (quote.audience === 'contractor') return NextResponse.json({ error: 'Contractor quotes are ordered from the contractor portal.' }, { status: 403 })
  const result = await createCheckout(quote, { actor: quote.name })
  if (result.ok) return NextResponse.json({ ok: true, url: result.url })
  return NextResponse.json({ error: result.error, handedOff: Boolean(result.handedOff), busy: Boolean(result.busy) }, { status: result.handedOff ? 502 : 409 })
}
