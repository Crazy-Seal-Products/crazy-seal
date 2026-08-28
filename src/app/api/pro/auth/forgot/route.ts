import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProPasswordReset } from '@/lib/email/gmail'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const { token } = await createMagicLink(email, { createIfMissing: false })
    if (token) {
      const url = `${requestOrigin(request)}/pro/reset/?token=${encodeURIComponent(token)}`
      await sendProPasswordReset(email, url)
    }

    return NextResponse.json({
      success: true,
      message: 'If that email has a Pro Hub account, we sent a reset link.',
    })
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
