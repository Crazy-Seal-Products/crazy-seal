import { NextRequest, NextResponse } from 'next/server'
import {
  applySessionCookie,
  createSession,
  getProUserByEmail,
  isMissingRelation,
  setPasswordHash,
  upsertProUser,
} from '@/lib/pro/auth'
import { hashPassword, passwordError } from '@/lib/pro/password'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const confirm = typeof body?.confirm === 'string' ? body.confirm : undefined
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
    }
    const invalid = passwordError(password, confirm)
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }

    const existing = await getProUserByEmail(email)
    if (existing?.password_hash) {
      return NextResponse.json({ error: 'That email already has an account. Sign in instead.' }, { status: 409 })
    }

    const user = existing ?? await upsertProUser(email)
    await setPasswordHash(user.id, await hashPassword(password))
    const sessionToken = await createSession(user.id)
    const response = NextResponse.json({ success: true })
    return applySessionCookie(response, sessionToken)
  } catch (err) {
    console.error('[pro/auth/signup]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({
        error: 'Pro Hub tables are not in the database yet. Run supabase/migrations/014_pro_passwords.sql.',
      }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not create the account. Try again.' }, { status: 500 })
  }
}
