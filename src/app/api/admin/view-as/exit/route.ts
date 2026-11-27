import { NextRequest, NextResponse } from 'next/server'
import { endViewAs } from '@/lib/pro/view-as'

/** Leaves the admin view of a dealer's Pro Hub and returns to the admin. */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const form = await request.formData().catch(() => null)
  const back = String(form?.get('back') ?? '')
  await endViewAs()
  // The contractor portal sends people back to the contractor they were looking at.
  const to = /^\/portal\/admin\/[a-z0-9/_-]*$/i.test(back) ? back : '/portal/admin/dealers/view-as/'
  return NextResponse.redirect(new URL(to, url), 303)
}
