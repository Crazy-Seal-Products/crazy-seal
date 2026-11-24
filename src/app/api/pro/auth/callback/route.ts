import { NextRequest, NextResponse } from 'next/server'
import { applySessionCookie, consumeMagicLink, createSession, requestOrigin } from '@/lib/pro/auth'
import { pageAfterSignIn } from '@/lib/contractor/next-path'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || ''
  const user = await consumeMagicLink(token)
  const origin = requestOrigin(request)

  if (!user) {
    return NextResponse.redirect(`${origin}/pro/login/?error=expired`)
  }

  const sessionToken = await createSession(user.id)
  // Into the portal (the Pro Hub now lives there), or the safe /portal/ page the link carries.
  const response = NextResponse.redirect(`${origin}${pageAfterSignIn(request.nextUrl.searchParams.get('next'))}`)
  return applySessionCookie(response, sessionToken)
}
