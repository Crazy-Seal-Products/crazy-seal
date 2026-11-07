import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink, getProUserByEmail, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProSignupLink } from '@/lib/email/gmail'

// No % in sign-up emails: it is a wildcard in database pattern matches.
const EMAIL_RE = /^[^\s@%]+@[^\s@%]+\.[^\s@%]+$/

// Sign-up can't tell who is asking, so it never sets a password or signs anyone in. It emails a
// link to the address; whoever can read that inbox chooses the password on /pro/reset/, which
// uses the link once (see consumeMagicLink).
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const existing = await getProUserByEmail(email)
    if (existing?.password_hash) {
      return NextResponse.json({ error: 'That email already has an account. Sign in instead.' }, { status: 409 })
    }

    const { token } = await createMagicLink(email)
    if (token) {
      const url = `${requestOrigin(request)}/pro/reset/?token=${encodeURIComponent(token)}&welcome=1`
      await sendProSignupLink(email, url)
    }

    return NextResponse.json({
      success: true,
      message: 'Check your email for a link to choose your password. It expires in 20 minutes.',
    })
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
