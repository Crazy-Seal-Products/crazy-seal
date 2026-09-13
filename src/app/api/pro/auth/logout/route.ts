import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, destroySession, requestOrigin } from '@/lib/pro/auth'

export async function POST() {
  await destroySession()
  const response = NextResponse.json({ success: true })
  return clearSessionCookie(response)
}

export async function GET(request: NextRequest) {
  await destroySession()
  const response = NextResponse.redirect(`${requestOrigin(request)}/pro/login/`)
  return clearSessionCookie(response)
}
