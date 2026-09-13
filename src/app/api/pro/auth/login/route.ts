import { NextRequest, NextResponse } from 'next/server'
import { applySessionCookie, createSession, getProUserByEmail, isMissingRelation, touchLogin } from '@/lib/pro/auth'
import { verifyPassword } from '@/lib/pro/password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WRONG = 'Email or password is wrong.'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    if (!EMAIL_RE.test(email) || !password) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 })
    }

    const user = await getProUserByEmail(email)
    if (!user?.password_hash) {
      return NextResponse.json({
        error: user
          ? 'This account does not have a password yet. Use Forgot password to set one, or email yourself a sign-in link.'
          : WRONG,
      }, { status: 401 })
    }

    const ok = await verifyPassword(password, user.password_hash)
    if (!ok) {
      return NextResponse.json({ error: WRONG }, { status: 401 })
    }

    await touchLogin(user.id)
    const sessionToken = await createSession(user.id)
    const response = NextResponse.json({ success: true })
    return applySessionCookie(response, sessionToken)
  } catch (err) {
    console.error('[pro/auth/login]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet. Run supabase/migrations/013_pro_hub.sql.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not sign in. Try again.' }, { status: 500 })
  }
}
