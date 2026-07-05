import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createZohoLead } from '@/lib/zoho/client'
import { sendTechLeadNotification, sendTechLeadAutoReply } from '@/lib/email/gmail'
import { sendMetaCapiEvent } from '@/lib/tracking/meta-capi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      first_name, last_name, email, phone,
      street_address, city, state, zip_code,
      experience,
      visitor_id, session_id,
      event_id,
    } = body

    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const name = `${first_name} ${last_name}`.trim()

    const { data: lead, error: leadError } = await supabase
      .from('tech_leads')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        street_address: street_address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        experience: experience || null,
      })
      .select()
      .single()

    if (leadError) {
      console.error('[TechLeads] Insert error:', leadError)
      return NextResponse.json({ error: 'Failed to save application.' }, { status: 500 })
    }

    // Fire-and-forget: Meta Conversions API (server-side Schedule, mirrors WP plugin)
    if (event_id) {
      const userAgent = request.headers.get('user-agent') || null
      const forwardedFor = request.headers.get('x-forwarded-for')
      const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || null

      sendMetaCapiEvent({
        eventName: 'Schedule',
        eventId: event_id,
        eventSourceUrl: request.headers.get('referer') || 'https://rv-armor.com/techs',
        userData: {
          email,
          phone,
          firstName: first_name,
          lastName: last_name,
          city,
          state,
          zip: zip_code,
          country: 'us',
          fbc: request.cookies.get('_fbc')?.value || null,
          fbp: request.cookies.get('_fbp')?.value || null,
          clientIpAddress: userIp,
          clientUserAgent: userAgent,
        },
        customData: { content_name: 'tech_lead_form' },
      }).catch((err) => console.error('[Meta CAPI] Schedule error:', err))
    }

    createZohoLead({
      First_Name: first_name,
      Last_Name: last_name,
      Email: email.toLowerCase(),
      Phone: phone || undefined,
      Street: street_address || undefined,
      City: city || undefined,
      State: state || undefined,
      Zip_Code: zip_code || undefined,
      Lead_Form_Comments: experience || undefined,
      Lead_Source: 'Website Lead form',
      Lead_Status: 'Tech Leads',
      Owner: process.env.ZOHO_TECH_LEAD_OWNER_ID || undefined,
    }).then(async (zohoResult) => {
      if (zohoResult) {
        await supabase
          .from('tech_leads')
          .update({ zoho_lead_id: zohoResult.id, zoho_synced_at: new Date().toISOString() })
          .eq('id', lead.id)
      }
    }).catch(err => console.error('[Zoho] Tech lead push error:', err))

    // Fire-and-forget: email notifications
    sendTechLeadNotification({
      first_name, last_name, email,
      phone, street_address, city, state, zip_code,
      experience,
    }).catch(err => console.error('[Gmail] Tech lead notification error:', err))

    sendTechLeadAutoReply({
      first_name, last_name, email,
      phone, street_address, city, state, zip_code,
      experience,
    }).catch(err => console.error('[Gmail] Tech lead auto-reply error:', err))

    return NextResponse.json({ success: true, lead_id: lead.id })
  } catch (err) {
    console.error('[TechLeads] API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
