import { NextRequest, NextResponse } from 'next/server'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { startViewAs } from '@/lib/pro/view-as'

/**
 * Admin-only: open the Pro Hub as a dealer (read-only). Posted from a "View
 * as" button in the admin, which opens it in a new tab.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await getPortalAdmin()
  if (!admin) return NextResponse.redirect(new URL('/portal/login/', url), 303)

  const form = await request.formData()
  const user = await startViewAs(admin, String(form.get('pro_user_id') ?? ''))
  if (!user) return NextResponse.json({ error: 'Pro Hub account not found' }, { status: 404 })
  return NextResponse.redirect(new URL('/pro/', url), 303)
}
