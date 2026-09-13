import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyAutoReply, sendWarrantyNotification } from '@/lib/email/gmail'
import { getProUser } from '@/lib/pro/auth'
import { loadProContext } from '@/lib/pro/context'
import { normalizeOrderNumber, orderNumberVariants } from '@/lib/pro/status'
import { certificateUrl } from '@/lib/warranty/certificate'

export async function POST(request: NextRequest) {
  try {
    const user = await getProUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      name, email, phone,
      customer_details,
      order_number,
      project_type, rv_length, square_footage,
      installer_name, installer_phone, installer_email,
      before_photo_urls, after_photo_urls,
      rating,
      experience_notes, contractor_notes,
      warranty_consent, photo_display_consent,
    } = body

    if (!name || !email || !order_number) {
      return NextResponse.json({ error: 'Owner name, email, and order number are required.' }, { status: 400 })
    }

    const beforeUrls = Array.isArray(before_photo_urls) ? before_photo_urls.filter(Boolean) : []
    const afterUrls = Array.isArray(after_photo_urls) ? after_photo_urls.filter(Boolean) : []
    if (!beforeUrls.length || !afterUrls.length) {
      return NextResponse.json({ error: 'Before and after photos are required.' }, { status: 400 })
    }
    if (!warranty_consent) {
      return NextResponse.json({ error: 'Warranty consent is required.' }, { status: 400 })
    }

    const ctx = await loadProContext(user)
    if (ctx.orders.length) {
      const allowed = new Set(ctx.orders.flatMap((o) => orderNumberVariants(o.name).map((v) => v.toLowerCase())))
      if (!allowed.has(String(order_number).trim().toLowerCase()) && !allowed.has(normalizeOrderNumber(order_number).toLowerCase())) {
        return NextResponse.json({ error: 'That order number is not on this account.' }, { status: 403 })
      }
    }

    const supabase = createAdminClient()
    const { data: registration, error } = await supabase
      .from('warranty_registrations')
      .insert({
        name,
        email: String(email).toLowerCase(),
        phone: phone || null,
        customer_details: [
          customer_details,
          project_type ? `Project type: ${project_type}` : null,
          rv_length ? `RV length: ${rv_length} ft` : null,
          square_footage ? `Square footage: ${square_footage}` : null,
        ].filter(Boolean).join('\n') || null,
        order_number,
        install_type: 'contractor',
        installer_name: installer_name || user.display_name || null,
        installer_phone: installer_phone || user.phone || null,
        installer_email: installer_email || user.email,
        photo_urls: [...beforeUrls, ...afterUrls],
        before_photo_urls: beforeUrls,
        after_photo_urls: afterUrls,
        rating: Number.isInteger(rating) && rating >= 1 && rating <= 5 ? rating : null,
        experience_notes: experience_notes || null,
        contractor_notes: contractor_notes || null,
        warranty_consent: true,
        photo_display_consent: photo_display_consent ?? true,
        filed_by_pro_user_id: user.id,
        source: 'pro_hub',
      })
      .select()
      .single()

    if (error) {
      console.error('[pro/warranty] insert', error)
      return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 })
    }

    const certificate_url = certificateUrl(registration.id)

    sendWarrantyNotification({
      kind: 'registration',
      name,
      email,
      fields: {
        'Filed via': 'Pro Hub',
        'Filed by': user.email,
        Phone: phone,
        'Order Number': order_number,
        'Project Type': project_type,
        'RV Length': rv_length ? `${rv_length} ft` : undefined,
        'Square Footage': square_footage,
        'Customer Details': customer_details,
        "Installer's Name": installer_name,
        "Installer's Phone": installer_phone,
        "Installer's Email": installer_email || user.email,
        'Experience Rating': rating ? `${rating} / 5` : undefined,
        'Experience Notes': experience_notes,
        Certificate: certificate_url,
      },
      photo_urls: [...beforeUrls, ...afterUrls],
      before_photo_urls: beforeUrls,
      after_photo_urls: afterUrls,
    }).catch((err) => console.error('[Gmail] Pro warranty notification error:', err))

    sendWarrantyAutoReply({
      kind: 'registration',
      name,
      email,
      fields: {},
      certificate_url,
    }).catch((err) => console.error('[Gmail] Pro warranty auto-reply error:', err))

    return NextResponse.json({ success: true, id: registration.id, certificate_url })
  } catch (err) {
    console.error('[pro/warranty]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
