import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWarrantyNotification, sendWarrantyAutoReply } from '@/lib/email/gmail'
import { verifyTurnstile } from '@/lib/turnstile'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      new_owner_name, new_owner_email, new_owner_phone,
      original_owner_email,
      order_number,
      transfer_notes,
      turnstile_token,
      website,
    } = body

    if (website) {
      return NextResponse.json({ success: true })
    }

    if (!new_owner_name || !new_owner_email || !order_number || !original_owner_email) {
      return NextResponse.json(
        { error: 'Name, email, order number, and original owner email are required.' },
        { status: 400 }
      )
    }

    const turnstileOk = await verifyTurnstile(turnstile_token, request)
    if (!turnstileOk) {
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })
    }

    const supabase = createAdminClient()

    // Link to an existing registration when the order number matches
    const { data: existing } = await supabase
      .from('warranty_registrations')
      .select('id')
      .eq('order_number', order_number)
      .limit(1)
      .maybeSingle()

    const { data: transfer, error } = await supabase
      .from('warranty_transfers')
      .insert({
        new_owner_name,
        new_owner_email: new_owner_email.toLowerCase(),
        new_owner_phone: new_owner_phone || null,
        original_owner_email: original_owner_email.toLowerCase(),
        order_number,
        transfer_notes: transfer_notes || null,
        warranty_registration_id: existing?.id ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Warranty transfer insert error:', error)
      return NextResponse.json({ error: 'Failed to save transfer request.' }, { status: 500 })
    }

    sendWarrantyNotification({
      kind: 'transfer',
      name: new_owner_name,
      email: new_owner_email,
      fields: {
        Phone: new_owner_phone,
        'Order Number': order_number,
        'Original Owner Email': original_owner_email,
        'Transfer Notes': transfer_notes,
        'Matched Registration': existing?.id ? 'Yes' : 'No match found',
      },
    }).catch(err => console.error('[Gmail] Transfer notification error:', err))

    sendWarrantyAutoReply({
      kind: 'transfer',
      name: new_owner_name,
      email: new_owner_email,
      fields: {},
    }).catch(err => console.error('[Gmail] Transfer auto-reply error:', err))

    return NextResponse.json({ success: true, id: transfer.id })
  } catch (err) {
    console.error('Warranty transfer API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
