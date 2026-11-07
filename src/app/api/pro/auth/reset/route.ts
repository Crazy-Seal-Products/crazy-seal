import { NextRequest, NextResponse } from 'next/server'
import {
  applySessionCookie,
  consumeMagicLink,
  createSession,
  endAllSessions,
  isMissingRelation,
  setPasswordHash,
} from '@/lib/pro/auth'
import { hashPassword, passwordError } from '@/lib/pro/password'

// Sets the password from an emailed link: a reset from /pro/forgot/, or the link sign-up sends.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const token = typeof body?.token === 'string' ? body.token : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const confirm = typeof body?.confirm === 'string' ? body.confirm : undefined
    const invalid = passwordError(password, confirm)
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }

    const user = await consumeMagicLink(token)
    if (!user) {
      return NextResponse.json({ error: 'That link expired or was already used. Request a new one.' }, { status: 400 })
    }

    // New password first, so the old one can't start new sessions, then sign out everywhere else.
    await setPasswordHash(user.id, await hashPassword(password))
    await endAllSessions(user.id)
    const sessionToken = await createSession(user.id)
    const response = NextResponse.json({ success: true })
    return applySessionCookie(response, sessionToken)
  } catch (err) {
    console.error('[pro/auth/reset]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({ error: 'Pro Hub tables are not in the database yet.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not reset the password. Try again.' }, { status: 500 })
  }
}
