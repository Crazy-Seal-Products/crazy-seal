import { after, NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyAutoReply, sendWarrantyNotification } from '@/lib/email/gmail'
import { logActivity } from '@/lib/contractor/activity'
import { accountAction } from '@/lib/contractor/guard'
import { linkWarrantyMedia } from '@/lib/contractor/media'
import { loadPortalOrders } from '@/lib/contractor/orders'
import { contractorProject, orderNumberSet, photoUrls, projectRegistration } from '@/lib/contractor/warranties'
import { normalizeOrderNumber } from '@/lib/pro/status'
import { certificateUrl } from '@/lib/warranty/certificate'

/**
 * Contractor portal: register the 50 year warranty for a job, on behalf of
 * the roof or RV owner (the certificate goes to them). Filed for the
 * contractor and, when given, one of their projects: a project has at most
 * one registration (a unique index on warranty_registrations.project_id).
 * Same checks as the Pro Hub's form (/api/pro/warranty/register): before and
 * after photos, consent, and an order number that's one of the company's
 * orders when they have any on record. Refused in View as.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

const ALREADY = 'This project already has a warranty registration. Open it from Warranties.'

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
    const projectType = str(body?.project_type, 40)
    const rvLength = str(body?.rv_length, 10)
    const squareFootage = str(body?.square_footage, 20)
    const customerDetails = str(body?.customer_details, 500)
    const installerName = str(body?.installer_name, 120) || account.name
    const installerPhone = str(body?.installer_phone, 40) || viewer?.contractor.phone || account.user.phone || ''
    const installerEmail = str(body?.installer_email, 160) || account.email
    const experienceNotes = str(body?.experience_notes, 4000)
    const contractorNotes = str(body?.contractor_notes, 4000)
    const rating = Number(body?.rating)
    const beforeUrls = photoUrls(body?.before_photo_urls)
    const afterUrls = photoUrls(body?.after_photo_urls)

    if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Add the owner’s name and a valid email.' }, { status: 400 })
    if (!orderNumber) return NextResponse.json({ error: 'Add the order number for this job’s Crazy Seal.' }, { status: 400 })
    if (!beforeUrls.length || !afterUrls.length) return NextResponse.json({ error: 'Before and after photos are required.' }, { status: 400 })
    if (body?.warranty_consent !== true) return NextResponse.json({ error: 'Warranty consent is required.' }, { status: 400 })

    const project = body?.project_id && viewer ? await contractorProject(viewer.contractor.id, body.project_id) : null
    if (body?.project_id && !project) return NextResponse.json({ error: 'That project isn’t one of yours. Refresh the page.' }, { status: 400 })
    if (project && (await projectRegistration(project.id))) return NextResponse.json({ error: ALREADY }, { status: 409 })

    // When the company (or this account) has orders on record, the job's order must be one of them.
    const { orders } = await loadPortalOrders(account.user, viewer?.contractor ?? null)
    if (orders.length) {
      const allowed = new Set(orderNumberSet(orders.map((o) => o.name)).map((n) => n.toLowerCase()))
      if (!allowed.has(orderNumber.toLowerCase()) && !allowed.has(normalizeOrderNumber(orderNumber).toLowerCase())) {
        return NextResponse.json({ error: 'That order number isn’t one of your company’s orders.' }, { status: 400 })
      }
    }

    const { data: registration, error } = await createAdminClient()
      .from('warranty_registrations')
      .insert({
        name,
        email,
        phone: phone || null,
        customer_details:
          [customerDetails, projectType ? `Project type: ${projectType}` : null, squareFootage ? `Square footage: ${squareFootage}` : null]
            .filter(Boolean)
            .join('\n') || null,
        order_number: orderNumber,
        install_type: 'contractor',
        installer_name: installerName || null,
        installer_phone: installerPhone || null,
        installer_email: installerEmail || null,
        photo_urls: [...beforeUrls, ...afterUrls],
        before_photo_urls: beforeUrls,
        after_photo_urls: afterUrls,
        rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
        experience_notes: experienceNotes || null,
        contractor_notes: contractorNotes || null,
        warranty_consent: true,
        photo_display_consent: body?.photo_display_consent !== false,
        project_id: project?.id ?? null,
        contractor_id: viewer?.contractor.id ?? null,
        filed_by_pro_user_id: account.hasAccount ? account.proUserId : null,
        source: 'portal',
      })
      .select('id')
      .single<{ id: string }>()

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: ALREADY }, { status: 409 })
      console.error('[portal/warranty/register] insert', error)
      return NextResponse.json({ error: 'Could not save the registration. Try again.' }, { status: 500 })
    }

    const certificate_url = certificateUrl(registration.id)
    // The project's gallery photos that went with it now belong to this registration.
    if (project && viewer) await linkWarrantyMedia({ contractorId: viewer.contractor.id, projectId: project.id, urls: [...beforeUrls, ...afterUrls], registrationId: registration.id })
    if (viewer) await logActivity(viewer, {
      entity: project ? 'projects' : 'warranties',
      entityId: project?.id ?? registration.id,
      action: 'create',
      summary: `${account.firstName} registered the 50 year warranty for ${name}${project ? ` (${project.name})` : ''}, order ${orderNumber}`,
    })
    revalidatePath('/portal/warranties/')
    if (project) revalidatePath(`/portal/projects/${project.id}/`)

    after(async () => {
      try {
        await Promise.all([
          sendWarrantyNotification({
            kind: 'registration',
            name,
            email,
            fields: {
              'Filed via': viewer ? 'Contractor portal' : 'Pro portal',
              Contractor: viewer?.contractorName,
              'Filed by': account.email || account.name,
              Project: project?.name,
              Phone: phone,
              'Order Number': orderNumber,
              'Project Type': projectType,
              'RV Length': rvLength ? `${rvLength} ft` : undefined,
              'Square Footage': squareFootage,
              'Customer Details': customerDetails,
              "Installer's Name": installerName,
              "Installer's Phone": installerPhone,
              "Installer's Email": installerEmail,
              'Experience Rating': Number.isInteger(rating) && rating >= 1 ? `${rating} / 5` : undefined,
              'Experience Notes': experienceNotes,
              Certificate: certificate_url,
            },
            photo_urls: [...beforeUrls, ...afterUrls],
            before_photo_urls: beforeUrls,
            after_photo_urls: afterUrls,
          }),
          sendWarrantyAutoReply({ kind: 'registration', name, email, fields: {}, certificate_url }),
        ])
      } catch (err) {
        console.error('[portal/warranty/register] email', err)
      }
    })

    return NextResponse.json({ success: true, id: registration.id, certificate_url })
  } catch (err) {
    console.error('[portal/warranty/register]', err)
    return NextResponse.json({ error: 'Something went wrong. Try again.' }, { status: 500 })
  }
}
