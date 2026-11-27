import { after, NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyAutoReply, sendWarrantyNotification } from '@/lib/email/gmail'
import { logActivity } from '@/lib/contractor/activity'
import { accountAction } from '@/lib/contractor/guard'
import { linkWarrantyMedia } from '@/lib/contractor/media'
import { contractorProject, photoUrls, projectRegistration } from '@/lib/contractor/warranties'
import { orderNumberVariants } from '@/lib/pro/status'

/**
 * Contractor portal: file a warranty claim for a job, on behalf of its owner.
 * Filed for the contractor and, when given, one of their projects; it's tied
 * to that project's registration, or else to a registration with the same
 * order number (as the public claim form does). Refused in View as.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(request: NextRequest) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  if (origin && origin !== url.origin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const g = await accountAction('warranties.edit')
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: 403 })
  // viewer: the contractor team member, or null for an account on no team (filing for its own orders).
  const { account, viewer } = g

  try {
    const body = await request.json().catch(() => null)
    const name = str(body?.name, 120)
    const email = str(body?.email, 160).toLowerCase()
    const phone = str(body?.phone, 40)
    const orderNumber = str(body?.order_number, 40)
    const description = str(body?.failure_description, 4000)
    const photos = photoUrls(body?.photo_urls)

    if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Add the owner’s name and a valid email.' }, { status: 400 })
    if (!description) return NextResponse.json({ error: 'Describe the problem.' }, { status: 400 })

    const project = body?.project_id && viewer ? await contractorProject(viewer.contractor.id, body.project_id) : null
    if (body?.project_id && !project) return NextResponse.json({ error: 'That project isn’t one of yours. Refresh the page.' }, { status: 400 })

    const db = createAdminClient()
    let registrationId = project ? ((await projectRegistration(project.id))?.id ?? null) : null
    if (!registrationId && orderNumber) {
      const { data } = await db
        .from('warranty_registrations')
        .select('id')
        .in('order_number', orderNumberVariants(orderNumber))
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ id: string }>()
      registrationId = data?.id ?? null
    }

    const { data: claim, error } = await db
      .from('warranty_claims')
      .insert({
        name,
        email,
        phone: phone || null,
        order_number: orderNumber || null,
        failure_description: description,
        photo_urls: photos,
        warranty_registration_id: registrationId,
        project_id: project?.id ?? null,
        contractor_id: viewer?.contractor.id ?? null,
        filed_by_pro_user_id: account.hasAccount ? account.proUserId : null,
        source: 'portal',
      })
      .select('id')
      .single<{ id: string }>()
    if (error) {
      console.error('[portal/warranty/claim] insert', error)
      return NextResponse.json({ error: 'Could not save the claim. Try again.' }, { status: 500 })
    }
    // The project's gallery claim photos that went with it now belong to this claim.
    if (project && viewer) await linkWarrantyMedia({ contractorId: viewer.contractor.id, projectId: project.id, urls: photos, claimId: claim.id })

    if (viewer) await logActivity(viewer, {
      entity: project ? 'projects' : 'warranties',
      entityId: project?.id ?? claim.id,
      action: 'create',
      summary: `${account.firstName} filed a warranty claim for ${name}${project ? ` (${project.name})` : ''}`,
    })
    revalidatePath('/portal/warranties/')
    if (project) revalidatePath(`/portal/projects/${project.id}/`)

    after(async () => {
      try {
        await Promise.all([
          sendWarrantyNotification({
            kind: 'claim',
            name,
            email,
            fields: {
              'Filed via': 'Contractor portal',
              Contractor: viewer?.contractorName,
              'Filed by': account.email || account.name,
              Project: project?.name,
              Phone: phone,
              'Order Number': orderNumber,
              'Issue Description': description,
              'Matched Registration': registrationId ? 'Yes' : 'No match found',
            },
            photo_urls: photos,
          }),
          sendWarrantyAutoReply({ kind: 'claim', name, email, fields: {} }),
        ])
      } catch (err) {
        console.error('[portal/warranty/claim] email', err)
      }
    })

    return NextResponse.json({ success: true, id: claim.id })
  } catch (err) {
    console.error('[portal/warranty/claim]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
