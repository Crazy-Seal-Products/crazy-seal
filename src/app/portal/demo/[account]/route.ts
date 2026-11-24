import { NextResponse, type NextRequest } from 'next/server'

/**
 * The old Pro Portal demo (/portal/demo/summit/) is gone: the contractor
 * portal is live for real contractors. Old tour links land on the portal's
 * tour on the Professionals page instead.
 */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/professionals/#pro-portal', request.url), 308)
}
