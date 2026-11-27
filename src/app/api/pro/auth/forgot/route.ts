import { NextRequest, NextResponse } from 'next/server'
import { passesTurnstile } from '@/lib/turnstile'
import { createMagicLink, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProPasswordReset } from '@/lib/email/gmail'
import { activateContractorOwner } from '@/lib/contractor/invite'
import { safePortalNext } from '@/lib/contractor/next-path'
import { screenProEmailForm } from '@/lib/pro/signup-guard'

// No `*` or `%`: they are wildcards in database pattern matches (PostgREST reads `*` as one
// whatever the escaping), and this route looks the email up on contractor records.
const EMAIL_RE = /^[^\s@*%]+@[^\s@*%]+\.[^\s@*%]+$/

// The same answer whether or not the email has an account, so it can't be used to find out.
const sent = () =>
  NextResponse.json({
    success: true,
    message: 'If that email has a Pro Hub account, we sent a reset link.',
  })

// Forgot password can make an account (a contractor's owner, activateContractorOwner) and emails
// the address, so bots are screened like sign-up: Turnstile, then the honeypot and per-IP limit
// (signup-guard).
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

    const blocked = screenProEmailForm(request, body, 'pro-forgot', sent)
    if (blocked) return blocked

    // A contractor portal page to land on after the new password is set.
    const next = safePortalNext(body?.next)
    // A contractor whose team has no owner yet activates their portal here: when no account has
    // this email but their contractor record does, this makes the account (their portal's owner,
    // invited) so the link below goes out. Says nothing either way, like the rest of this route.
    const activated = await activateContractorOwner(email)

    const { token } = await createMagicLink(email, { createIfMissing: false })
    if (token) {
      const after = activated ? '&welcome=1&next=/portal/' : next ? `&next=${encodeURIComponent(next)}` : ''
      const url = `${requestOrigin(request)}/pro/reset/?token=${encodeURIComponent(token)}${after}`
      await sendProPasswordReset(email, url)
    }

    return sent()
  } catch (err) {
    console.error('[pro/auth/forgot]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not send the reset email. Try again.' }, { status: 500 })
  }
}
