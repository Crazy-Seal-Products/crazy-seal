import { NextRequest, NextResponse } from 'next/server'
import { applySessionCookie, consumeMagicLink, createSession, requestOrigin } from '@/lib/pro/auth'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const user = await consumeMagicLink(token)
  const origin = requestOrigin(request)

  if (!user) {
    return NextResponse.redirect(`${origin}/pro/login/?error=expired`)
  }

  const sessionToken = await createSession(user.id)
  const response = NextResponse.redirect(`${origin}/pro/`)
  return applySessionCookie(response, sessionToken)
}
