import { NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'
import { getQuoteByToken } from '@/lib/quotes/data'
import { requestHandoff } from '@/lib/quotes/handoff'

/** "Talk to a specialist": hands the quote to Crazy Seal staff and tells the lead inbox. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (rateLimited(request, 'quote-specialist', 5, 10 * 60_000)) return NextResponse.json({ error: 'Too many tries. Wait a few minutes.' }, { status: 429 })
  const quote = await getQuoteByToken((await params).token)
  if (!quote) return NextResponse.json({ error: 'Quote not found.' }, { status: 404 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
  await requestHandoff(quote, 'specialist', { actor: quote.name, message: typeof body.message === 'string' ? body.message : null })
  return NextResponse.json({ ok: true })
}
