import { NextRequest, NextResponse } from 'next/server'
import { passesTurnstile } from '@/lib/turnstile'
import { createMagicLink, getProUserByEmail, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProMagicLink } from '@/lib/email/gmail'
import { clientIp, clientUserAgent, screenProEmailForm } from '@/lib/pro/signup-guard'
import { recordSignup } from '@/lib/pro/signup-flags'
import { safePortalNext } from '@/lib/contractor/next-path'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const sent = () =>
  NextResponse.json({
    success: true,
    message: 'Check your email for a sign-in link. It expires in 20 minutes.',
  })

// "Email me a sign-in link". For an email with no account this creates one, so it is screened like
// sign-up, and a new account is recorded and flagged the same way (signup-guard, signup-flags).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!(await passesTurnstile(body?.turnstileToken, request))) {
      return NextResponse.json({ error: 'Please complete the verification and try again.', verify: true }, { status: 403 })
    }
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const blocked = screenProEmailForm(request, body, 'pro-link', sent)
    if (blocked) return blocked

    const existing = await getProUserByEmail(email)
    const { token, cooldown } = await createMagicLink(email)
    if (!existing) await recordSignup(email, { ip: clientIp(request), userAgent: clientUserAgent(request) })
    if (cooldown) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for that email, we already sent a link. Check your inbox in a minute.',
      })
    }

    // A contractor portal page to open after signing in (only /portal/ pages); the callback checks it again.
    const next = safePortalNext(body?.next)
    const url = `${requestOrigin(request)}/api/pro/auth/callback/?token=${encodeURIComponent(token)}${next ? `&next=${encodeURIComponent(next)}` : ''}`
    await sendProMagicLink(email, url)

    return sent()
  } catch (err) {
    console.error('[pro/auth/request]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet. Run supabase/migrations/013_pro_hub.sql.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not send sign-in link. Try again.' }, { status: 500 })
  }
}
