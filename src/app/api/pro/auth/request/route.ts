import { NextRequest, NextResponse } from 'next/server'
import { createMagicLink, isMissingRelation, requestOrigin } from '@/lib/pro/auth'
import { sendProMagicLink } from '@/lib/email/gmail'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }

    const { token, cooldown } = await createMagicLink(email)
    if (cooldown) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists for that email, we already sent a link. Check your inbox in a minute.',
      })
    }

    const url = `${requestOrigin(request)}/api/pro/auth/callback/?token=${encodeURIComponent(token)}`
    await sendProMagicLink(email, url)

    return NextResponse.json({
      success: true,
      message: 'Check your email for a sign-in link. It expires in 20 minutes.',
    })
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
