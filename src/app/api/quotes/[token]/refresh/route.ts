import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'
import { QuoteError, repriceQuote } from '@/lib/quotes/create'
import { getQuoteByToken } from '@/lib/quotes/data'
import { isExpired } from '@/lib/quotes/types'

/**
 * "Refresh my price": once a quote's live offer has ended, prices it again at
 * today's price list, costs and discounts (a new revision with a new
 * pricing_settings.offer_hours window). While the offer is live it does nothing.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (rateLimited(request, 'quote-refresh', 5, 10 * 60_000)) return NextResponse.json({ error: 'Too many tries. Wait a few minutes.' }, { status: 429 })
  const quote = await getQuoteByToken((await params).token)
  if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
  if (!isExpired(quote)) return NextResponse.json({ ok: true })
  try {
    await repriceQuote(quote, { actor: quote.name, reason: 'The buyer refreshed expired prices.' })
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: 409 })
    console.error('[api/quotes/refresh]', err)
    return NextResponse.json({ error: 'Couldn’t refresh prices. Try again.' }, { status: 500 })
  }
}
