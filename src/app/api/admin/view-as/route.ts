import { NextRequest, NextResponse } from 'next/server'
import { adminCan, getPortalAdmin } from '@/lib/portal/admin/auth'
import { startViewAs } from '@/lib/pro/view-as'
import { logContractorActivity } from '@/lib/contractor/activity'

/**
 * Admin-only: open the contractor portal as a dealer (read-only). Posted from a "View
 * as" button in the admin, which opens it in a new tab. Takes a Pro Hub
 * account (pro_user_id) or a roster dealer's Shopify customer (customer_id),
 * which opens their account if they have one and the base view if not; or a
 * contractor (contractor_id), which opens their contractor portal.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const admin = await getPortalAdmin()
  if (!admin) return NextResponse.redirect(new URL('/portal/login/', url), 303)
  if (!(await adminCan('view_as'))) return NextResponse.json({ error: 'Your role can’t use View as' }, { status: 403 })

  const form = await request.formData()
  const proUserId = String(form.get('pro_user_id') ?? '')
  const customerId = String(form.get('customer_id') ?? '')
  const contractorId = String(form.get('contractor_id') ?? '')
  if (contractorId) {
    const user = await startViewAs(admin, { contractorId })
    if (!user) return NextResponse.json({ error: 'Contractor not found' }, { status: 404 })
    await logContractorActivity(contractorId, {
      actorId: null,
      actorName: `${admin.name?.split(' ')[0] || admin.email} (Crazy Seal)`,
      actorRole: 'crazy_seal',
      entity: 'session',
      entityId: null,
      action: 'view_as',
      summary: `${admin.name?.split(' ')[0] || 'Someone'} from Crazy Seal opened the portal to help`,
    })
    return NextResponse.redirect(new URL('/portal/', url), 303)
  }
  const user = await startViewAs(admin, proUserId ? { proUserId } : { customerId })
  if (!user) {
    const error = proUserId ? 'Pro Hub account not found' : 'Dealer not found, or there’s no email on their Shopify record'
    return NextResponse.json({ error }, { status: 404 })
  }
  // Pro Hub is the contractor portal now: an account opens as its contractor's portal, or its personal one.
  return NextResponse.redirect(new URL('/portal/', url), 303)
}
