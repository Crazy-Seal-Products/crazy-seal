import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, destroySession, requestOrigin } from '@/lib/pro/auth'
import { endViewAs, hasViewAsCookie } from '@/lib/pro/view-as'

// With a View as cookie in this browser, "sign out" is "Exit admin view": it
// ends the view (even one that no longer counts, so it can't come back) and
// leaves any real Pro Hub session in this browser alone.

export async function POST() {
  if (await hasViewAsCookie()) {
    await endViewAs()
    return NextResponse.json({ success: true, viewAsEnded: true })
  }
  await destroySession()
  const response = NextResponse.json({ success: true })
  return clearSessionCookie(response)
}

export async function GET(request: NextRequest) {
  if (await hasViewAsCookie()) {
    await endViewAs()
    return NextResponse.redirect(`${requestOrigin(request)}/portal/admin/dealers/view-as/`)
  }
  await destroySession()
  const response = NextResponse.redirect(`${requestOrigin(request)}/pro/login/`)
  return clearSessionCookie(response)
}
