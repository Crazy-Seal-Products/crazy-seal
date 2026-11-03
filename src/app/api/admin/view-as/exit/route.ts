import { NextRequest, NextResponse } from 'next/server'
import { endViewAs } from '@/lib/pro/view-as'

/** Leaves the admin view of a dealer's Pro Hub and returns to the admin. */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await endViewAs()
  return NextResponse.redirect(new URL('/portal/admin/dealers/portal/', url), 303)
}
