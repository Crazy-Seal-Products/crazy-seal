import { after, NextRequest, NextResponse } from 'next/server'
import { cleanQuote, notifyQuote, recordQuote } from '@/lib/contractors/quote'

/**
 * A quote request from a contractor's page (/contractor/<slug>). Checked with
 * Cloudflare Turnstile like the site's other forms, saved as a lead, then
 * emailed to the contractor after the response (lib/contractors/quote).
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  // Honeypot: bots fill the hidden "website" field. Look successful, save nothing.
  if (body.website) return NextResponse.json({ ok: true })

  const quote = cleanQuote(body)
  if ('error' in quote) return NextResponse.json({ error: quote.error }, { status: 400 })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
  const token = typeof body.turnstile_token === 'string' ? body.turnstile_token : ''
  if (!token) return NextResponse.json({ error: 'Please complete the verification check.' }, { status: 400 })
  const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  })
    .then((r) => r.json() as Promise<{ success?: boolean }>)
    .catch(() => ({ success: false }))
  if (!check.success) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })

  try {
    const recorded = await recordQuote(quote, {
      visitorFingerprint: typeof body.visitor_id === 'string' ? body.visitor_id : null,
      sessionId: typeof body.session_id === 'string' ? body.session_id : null,
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      ip,
    })
    if (!recorded) return NextResponse.json({ error: 'This contractor isn’t taking requests here right now.' }, { status: 404 })
    after(() => notifyQuote(recorded))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[contractor quote]', err)
    return NextResponse.json({ error: 'Something went wrong. Please call or email them instead.' }, { status: 500 })
  }
}
