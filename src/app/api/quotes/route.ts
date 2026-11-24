import { after, NextRequest, NextResponse } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { getPricingSettings } from '@/lib/pricing/settings'
import { clientIp } from '@/lib/pro/signup-guard'
import { QuoteError } from '@/lib/quotes/create'
import { emailQuoteToBuyer, emailStaff } from '@/lib/quotes/emails'
import { cleanPublicQuote, createPublicQuote, pushQuoteLeadToZoho } from '@/lib/quotes/public'
import { passesTurnstile } from '@/lib/turnstile'

/**
 * Saves a quote from the public roof-only builder (/quote/): honeypot,
 * per-IP limit and Turnstile like the site's other forms, then a lead and the
 * quote, priced again here from the price book. The buyer is emailed their
 * link and the lead inbox a copy after the response. Only while the builder
 * is live (pricing_settings.public_builder_live), or for signed-in staff
 * previewing it.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Bad request.' }, { status: 400 })
  // Honeypot: bots fill the hidden "website" field. Look successful, save nothing.
  if (typeof body.website === 'string' && body.website.trim()) return NextResponse.json({ ok: true })

  const settings = await getPricingSettings().catch(() => null)
  const staff = settings?.public_builder_live ? null : await getPortalAdmin()
  if (!settings || (!settings.public_builder_live && !staff)) return NextResponse.json({ error: 'The quote builder isn’t open yet.' }, { status: 404 })

  if (clientIp(request) && rateLimited(request, 'quote-create', 6, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many quotes from here. Wait a few minutes and try again.' }, { status: 429 })
  }

  const req = cleanPublicQuote(body)
  if ('error' in req) return NextResponse.json({ error: req.error }, { status: 400 })
  if (!(await passesTurnstile(body.turnstile_token, request))) return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })

  try {
    const quote = await createPublicQuote(req, {
      visitorFingerprint: typeof body.visitor_id === 'string' ? body.visitor_id : null,
      sessionId: typeof body.session_id === 'string' ? body.session_id : null,
      referer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      ip: clientIp(request),
    })
    after(async () => {
      await emailQuoteToBuyer(quote)
      await emailStaff(quote, staff ? `Preview quote from the builder (by ${staff.email})` : 'New quote from the builder')
      if (!staff) await pushQuoteLeadToZoho(quote)
    })
    return NextResponse.json({ ok: true, token: quote.token, url: `/quote/${quote.token}/` })
  } catch (err) {
    if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: 422 })
    console.error('[api/quotes]', err)
    return NextResponse.json({ error: 'Something went wrong. Please call us and we’ll quote it.' }, { status: 500 })
  }
}
