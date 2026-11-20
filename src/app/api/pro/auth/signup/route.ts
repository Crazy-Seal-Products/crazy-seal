import { NextRequest, NextResponse } from 'next/server'
import { passesTurnstile } from '@/lib/turnstile'
import { createMagicLink, getProUserByEmail, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProSignupLink } from '@/lib/email/gmail'
import { clientIp, clientUserAgent, screenProEmailForm } from '@/lib/pro/signup-guard'
import { recordSignup } from '@/lib/pro/signup-flags'

// No % in sign-up emails: it is a wildcard in database pattern matches.
const EMAIL_RE = /^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/

// Sign-up can't tell who is asking, so it never sets a password or signs anyone in. It emails a
// link to the address; whoever can read that inbox chooses the password on /pro/reset/, which
// uses the link once (see consumeMagicLink). Bots are screened first (Turnstile, then signup-guard),
// and a new account that still looks odd is flagged for staff (signup-flags).
const sent = () =>
  NextResponse.json({
    success: true,
    message: 'Check your email for a link to choose your password. It expires in 20 minutes.',
  })

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

    const blocked = screenProEmailForm(request, body, 'pro-signup', sent)
    if (blocked) return blocked

    const existing = await getProUserByEmail(email)
    if (existing?.password_hash) {
      return NextResponse.json({ error: 'That email already has an account. Sign in instead.' }, { status: 409 })
    }

    const { token } = await createMagicLink(email)
    if (!existing) await recordSignup(email, { ip: clientIp(request), userAgent: clientUserAgent(request) })
    if (token) {
      const url = `${requestOrigin(request)}/pro/reset/?token=${encodeURIComponent(token)}&welcome=1`
      await sendProSignupLink(email, url)
    }

    return sent()
  } catch (err) {
    console.error('[pro/auth/signup]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet. Run supabase/migrations/014_pro_passwords.sql.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not send the sign-up email. Try again.' }, { status: 500 })
  }
}
