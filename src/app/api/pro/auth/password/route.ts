import { NextRequest, NextResponse } from 'next/server'
import { getProUser, isMissingRelation, setPasswordHash } from '@/lib/pro/auth'
import { hashPassword, passwordError, verifyPassword } from '@/lib/pro/password'

export async function POST(request: NextRequest) {
  try {
    const user = await getProUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const current = typeof body?.current === 'string' ? body.current : ''
    const password = typeof body?.password === 'string' ? body.password : ''
    const confirm = typeof body?.confirm === 'string' ? body.confirm : undefined
    const invalid = passwordError(password, confirm)
    if (invalid) {
      return NextResponse.json({ error: invalid }, { status: 400 })
    }

    if (user.password_hash) {
      const ok = await verifyPassword(current, user.password_hash)
      if (!ok) {
        return NextResponse.json({ error: 'Current password is wrong.' }, { status: 401 })
      }
    }

    await setPasswordHash(user.id, await hashPassword(password))
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[pro/auth/password]', err)
    if (isMissingRelation(err)) {
      return NextResponse.json({ error: 'Pro Hub tables are not in the database yet.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Could not update the password. Try again.' }, { status: 500 })
  }
}
