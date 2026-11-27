import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'
import { QuoteError, updateBuyerInfo } from '@/lib/quotes/create'
import { getQuoteByToken } from '@/lib/quotes/data'
import { cleanShipTo } from '@/lib/quotes/public'

/** The buyer fills in what the quote still needs before checkout (phone, ship-to address). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (rateLimited(request, 'quote-info', 20, 10 * 60_000)) return NextResponse.json({ error: 'Too many tries. Wait a few minutes.' }, { status: 429 })
  const quote = await getQuoteByToken((await params).token)
  if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return NextResponse.json({ error: 'Bad request.' }, { status: 400 })

  const phone = typeof body.phone === 'string' ? body.phone.trim().slice(0, 40) : undefined
  if (phone && phone.replace(/\D/g, '').length < 10) return NextResponse.json({ error: 'Check the phone number.' }, { status: 400 })
  const shipTo = 'shipTo' in body ? cleanShipTo(body.shipTo) : undefined
  if (shipTo?.zip && !/^\d{5}(-\d{4})?$/.test(shipTo.zip)) return NextResponse.json({ error: 'The ZIP needs 5 digits.' }, { status: 400 })

  try {
    const next = await updateBuyerInfo(quote, { phone, shipTo }, quote.name)
    return NextResponse.json({ ok: true, missing: next.missing, handoff: next.handoff })
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: 409 })
    console.error('[api/quotes/info]', err)
    return NextResponse.json({ error: 'Couldn’t save that. Try again.' }, { status: 500 })
  }
}
