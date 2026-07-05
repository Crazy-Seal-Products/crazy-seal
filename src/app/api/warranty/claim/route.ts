import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyNotification, sendWarrantyAutoReply } from '@/lib/email/gmail'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name, email, phone,
      order_number,
      failure_description,
      photo_urls,
      turnstile_token,
      website,
    } = body

    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!name || !email || !failure_description) {
      return NextResponse.json(
        { error: 'Name, email, and a description of the issue are required.' },
        { status: 400 }
      )
    }

    const turnstileOk = await verifyTurnstile(turnstile_token, request)
    if (!turnstileOk) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })
    }

    const supabase = createAdminClient()

    let registrationId: string | null = null
    if (order_number) {
      const { data: existing } = await supabase
        .from('warranty_registrations')
        .select('id')
        .eq('order_number', order_number)
        .limit(1)
        .maybeSingle()
      registrationId = existing?.id ?? null
    }

    const { data: claim, error } = await supabase
      .from('warranty_claims')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        order_number: order_number || null,
        failure_description,
        photo_urls: photo_urls?.length ? photo_urls : [],
        warranty_registration_id: registrationId,
      })
      .select()
      .single()

    if (error) {
      console.error('Warranty claim insert error:', error)
      return NextResponse.json({ error: 'Failed to save claim.' }, { status: 500 })
    }

    sendWarrantyNotification({
      kind: 'claim',
      name, email,
      fields: {
        Phone: phone,
        'Order Number': order_number,
        'Issue Description': failure_description,
        'Matched Registration': registrationId ? 'Yes' : 'No match found',
      },
      photo_urls,
    }).catch(err => console.error('[Gmail] Claim notification error:', err))

    sendWarrantyAutoReply({
      kind: 'claim',
      name, email,
      fields: {},
    }).catch(err => console.error('[Gmail] Claim auto-reply error:', err))

    return NextResponse.json({ success: true, id: claim.id })
  } catch (err) {
    console.error('Warranty claim API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
