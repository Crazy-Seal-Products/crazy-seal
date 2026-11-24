import { NextResponse, type NextRequest } from 'next/server'
import { rateLimited } from '@/lib/ai/guard'

/**
 * Extra bot screening for the Pro Hub forms that can create an account and email any address:
 * sign-up, "Email me a sign-in link" and Forgot password (which makes a contractor's owner account,
 * src/lib/contractor/invite.ts). Their routes check Turnstile first (passesTurnstile); a bot
 * used sign-up to mail strangers from Oct 27, 2026 (see signup-flags.ts). This adds:
 * - Honeypot: a hidden "website" field people never see. When it is filled, act as if it worked
 *   and do nothing, so the bot learns nothing.
 * - Per IP, five tries in ten minutes (per server instance, like the site chat; enough to stop a loop).
 * Returns the response to send instead, or null to carry on.
 */
export function screenProEmailForm(
  request: NextRequest,
  body: Record<string, unknown> | null,
  bucket: 'pro-signup' | 'pro-link' | 'pro-forgot',
  pretendItWorked: () => NextResponse,
): NextResponse | null {
  if (typeof body?.website === 'string' && body.website.trim()) {
    console.warn(`[${bucket}] honeypot filled; nothing sent`)
    return pretendItWorked()
  }
  if (clientIp(request) && rateLimited(request, bucket, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many tries from here. Wait a few minutes and try again.' }, { status: 429 })
  }
  return null
}

export function clientIp(request: NextRequest): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null
}

export function clientUserAgent(request: NextRequest): string | null {
  return request.headers.get('user-agent')
}
