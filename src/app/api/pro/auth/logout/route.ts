import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie, destroySession, requestOrigin } from '@/lib/pro/auth'
import { endViewAs, isViewingAs } from '@/lib/pro/view-as'

// In an admin view, "sign out" ends the view and leaves any real Pro Hub
// session in this browser alone.

export async function POST() {
  if (await isViewingAs()) {
    await endViewAs()
    return NextResponse.json({ success: true, viewAsEnded: true })
  }
  await destroySession()
  const response = NextResponse.json({ success: true })
  return clearSessionCookie(response)
}

export async function GET(request: NextRequest) {
  if (await isViewingAs()) {
    await endViewAs()
    return NextResponse.redirect(`${requestOrigin(request)}/portal/admin/dealers/portal/`)
  }
  await destroySession()
  const response = NextResponse.redirect(`${requestOrigin(request)}/pro/login/`)
  return clearSessionCookie(response)
}
