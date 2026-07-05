import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyNotification, sendWarrantyAutoReply } from '@/lib/email/gmail'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name, email, phone,
      customer_details,
      order_number,
      project_type, rv_length, square_footage,
      install_type, installer_name, installer_phone, installer_email,
      photo_urls,
      experience_notes, contractor_notes,
      warranty_consent, photo_display_consent,
      visitor_id, session_id,
      turnstile_token,
      website,
    } = body

    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !order_number) {
      return NextResponse.json({ error: 'Name, email, and order number are required.' }, { status: 400 })
    }

    if (!photo_urls?.length) {
      return NextResponse.json({ error: 'Before and after photos are required.' }, { status: 400 })
    }

    if (!warranty_consent) {
      return NextResponse.json({ error: 'Warranty consent is required.' }, { status: 400 })
    }

    const turnstileOk = await verifyTurnstile(turnstile_token, request)
    if (!turnstileOk) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Resolve tracking ids (fingerprint -> uuid)
    let actualVisitorId: string | null = null
    if (visitor_id) {
      const { data: visitor } = await supabase
        .from('visitors')
        .select('id')
        .eq('fingerprint', visitor_id)
        .single()
      actualVisitorId = visitor?.id ?? null
    }

    const { data: registration, error } = await supabase
      .from('warranty_registrations')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        customer_details: [
          customer_details,
          project_type ? `Project type: ${project_type}` : null,
          rv_length ? `RV length: ${rv_length} ft` : null,
          square_footage ? `Square footage: ${square_footage}` : null,
        ].filter(Boolean).join('\n') || null,
        order_number,
        install_type: install_type || null,
        installer_name: installer_name || null,
        installer_phone: installer_phone || null,
        installer_email: installer_email || null,
        photo_urls: photo_urls,
        experience_notes: experience_notes || null,
        contractor_notes: contractor_notes || null,
        warranty_consent: true,
        photo_display_consent: photo_display_consent ?? true,
        visitor_id: actualVisitorId,
        session_id: session_id || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Warranty registration insert error:', error)
      return NextResponse.json({ error: 'Failed to save registration.' }, { status: 500 })
    }

    const emailFields = {
      Phone: phone,
      'Order Number': order_number,
      'Project Type': project_type,
      'RV Length': rv_length ? `${rv_length} ft` : undefined,
      'Square Footage': square_footage,
      'Customer Details': customer_details,
      'Install Type': install_type,
      "Installer's Name": installer_name,
      "Installer's Phone": installer_phone,
      "Installer's Email": installer_email,
      'Experience Notes': experience_notes,
      'Contractor Notes': contractor_notes,
      'Photo Display Consent': photo_display_consent ? 'Yes' : 'No',
    }

    sendWarrantyNotification({
      kind: 'registration',
      name, email,
      fields: emailFields,
      photo_urls,
    }).catch(err => console.error('[Gmail] Warranty notification error:', err))

    sendWarrantyAutoReply({
      kind: 'registration',
      name, email,
      fields: {},
    }).catch(err => console.error('[Gmail] Warranty auto-reply error:', err))

    return NextResponse.json({ success: true, id: registration.id })
  } catch (err) {
    console.error('Warranty registration API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
