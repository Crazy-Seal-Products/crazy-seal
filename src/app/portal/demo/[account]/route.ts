import { NextResponse, type NextRequest } from 'next/server'
import { getPortalAccount } from '@/lib/portal/accounts'
import { isPortalDemoEnabled, PORTAL_COOKIE, PORTAL_COOKIE_MAX_AGE } from '@/lib/portal/session'

/**
 * One-click demo entry: /portal/demo/summit/ signs in as the demo dealer and
 * lands on the dashboard (or a `next` portal path). Used by the "Take the
 * tour" buttons on the public Professionals page and the admin's Dealers
 * section.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ account: string }> }) {
  const { account: id } = await params
  const account = getPortalAccount(id)
  if (!isPortalDemoEnabled() || !account) {
    return NextResponse.redirect(new URL('/portal/login/', request.url))
  }

  const next = request.nextUrl.searchParams.get('next')
  const target = next && /^\/portal\/[a-z0-9\-/]*(\?lesson=[a-z0-9-]+)?$/i.test(next) && !next.startsWith('/portal/admin')
    ? next
    : '/portal/?welcome=1'
  const response = NextResponse.redirect(new URL(target, request.url))
  response.cookies.set(PORTAL_COOKIE, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: PORTAL_COOKIE_MAX_AGE,
  })
  return response
}
