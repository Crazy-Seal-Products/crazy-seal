import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createZohoLead } from '@/lib/zoho/client'
import { sendLeadNotification, sendLeadAutoReply } from '@/lib/email/gmail'
import { sendMetaCapiEvent, fbcFromFbclid } from '@/lib/tracking/meta-capi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name, email, phone,
      street_address, city, state, zip_code,
      rv_year, rv_make, rv_model, rv_length,
      roof_type, has_roof_damage,
      how_heard,
      texting_consent, photo_url, photo_urls,
      message, source_page,
      visitor_id, session_id,
      turnstile_token,
      website,
      event_id,
    } = body

    if (website) {
      return NextResponse.json({ success: true, lead_id: 'ok' })
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    // Verify Cloudflare Turnstile token
    if (!turnstile_token) {
      return NextResponse.json({ error: 'Verification required.' }, { status: 400 })
    }

    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstile_token,
        remoteip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      }),
    })

    const turnstileData = await turnstileRes.json()

    if (!turnstileData.success) {
      console.error('Turnstile verification failed:', turnstileData)
      return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 403 })
    }

    const supabase = createAdminClient()

    const userAgent = request.headers.get('user-agent') || null
    const forwardedFor = request.headers.get('x-forwarded-for')
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip') || null

    // Waterfall: fetch visitor first-touch attribution
    let firstTouch: Record<string, string | null> = {}
    let actualVisitorId: string | null = null
    if (visitor_id) {
      const { data: visitor } = await supabase
        .from('visitors')
        .select('*')
        .eq('fingerprint', visitor_id)
        .single()

      if (visitor) {
        actualVisitorId = visitor.id
        firstTouch = {
          first_utm_source: visitor.first_utm_source,
          first_utm_medium: visitor.first_utm_medium,
          first_utm_campaign: visitor.first_utm_campaign,
          first_gclid: visitor.first_gclid,
          first_fbclid: visitor.first_fbclid,
          first_landing_page: visitor.first_landing_page,
          first_referrer: visitor.first_referrer,
          first_seen_at: visitor.first_seen_at,
        }
      }
    }

    // Fetch converting session last-touch
    let lastTouch: Record<string, string | null> = {}
    let validSessionId: string | null = null
    if (session_id) {
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .single()

      if (session) {
        validSessionId = session.id
        lastTouch = {
          converting_utm_source: session.utm_source,
          converting_utm_medium: session.utm_medium,
          converting_landing_page: session.landing_page,
        }

        await supabase
          .from('sessions')
          .update({ converted: true, conversion_type: 'lead' })
          .eq('id', session_id)
      }
    }

    // Insert lead with full attribution + all RV-specific fields
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name,
        email: email.toLowerCase(),
        phone,
        street_address: street_address || null,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        rv_year,
        rv_make,
        rv_model,
        rv_length,
        roof_type: roof_type || null,
        has_roof_damage: has_roof_damage ?? null,
        how_heard: how_heard || null,
        texting_consent: texting_consent ?? false,
        photo_url: photo_url || null,
        photo_urls: photo_urls?.length ? photo_urls : null,
        message,
        source_page,
        source_url: request.headers.get('referer') || null,
        user_agent: userAgent,
        user_ip: userIp,
        visitor_id: actualVisitorId || null,
        session_id: validSessionId,
        ...firstTouch,
        ...lastTouch,
      })
      .select()
      .single()

    if (leadError) {
      console.error('Lead insert error:', leadError)
      return NextResponse.json({ error: 'Failed to save lead.' }, { status: 500 })
    }

    // Fire journey event
    if (actualVisitorId) {
      await supabase.from('journey_events').insert({
        visitor_id: actualVisitorId,
        session_id: session_id || null,
        lead_id: lead.id,
        event_type: 'lead_created',
        event_data: { email, source_page, name },
      })
    }

    // Fire-and-forget: Zoho CRM push
    const nameParts = name.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || name

    // Fire-and-forget: Meta Conversions API (server-side Lead, mirrors WP plugin)
    const fbpCookie = request.cookies.get('_fbp')?.value || null
    const fbcCookie =
      request.cookies.get('_fbc')?.value ||
      fbcFromFbclid(firstTouch.first_fbclid as string | null | undefined)

    if (event_id) {
      sendMetaCapiEvent({
        eventName: 'Lead',
        eventId: event_id,
        eventSourceUrl: request.headers.get('referer') || `https://rv-armor.com${source_page || ''}`,
        userData: {
          email,
          phone,
          firstName,
          lastName,
          city,
          state,
          zip: zip_code,
          country: 'us',
          fbc: fbcCookie,
          fbp: fbpCookie,
          clientIpAddress: userIp,
          clientUserAgent: userAgent,
        },
        customData: { content_name: source_page || 'contact_form' },
      }).catch((err) => console.error('[Meta CAPI] Lead error:', err))
    }

    createZohoLead({
      First_Name: firstName,
      Last_Name: lastName,
      Email: email.toLowerCase(),
      Phone: phone || undefined,
      Street: street_address || undefined,
      City: city || undefined,
      State: state || undefined,
      Zip_Code: zip_code || undefined,
      Lead_Source: 'Website Lead form',
      How_did_you_hear_about_us: how_heard || undefined,
      What_type_of_RV_roof_do_you_have: roof_type || undefined,
      Lead_Form_Comments: message || undefined,
      How_old_is_your_roof: rv_year || undefined,
      RV_Make: rv_make || undefined,
      RV_Model: rv_model || undefined,
      How_long_is_your_RV: rv_length || undefined,
      Do_you_have_roof_damage_or_an_existing_roof_leak: has_roof_damage ? 'Yes' : has_roof_damage === false ? 'No' : undefined,
      Photo_URLS: photo_urls?.length ? (photo_urls as string[]).join('\n') : undefined,
      UTM_Source: (firstTouch.first_utm_source as string) || undefined,
      UTM_Medium: (firstTouch.first_utm_medium as string) || undefined,
      UTM_Campaign: (firstTouch.first_utm_campaign as string) || undefined,
      Landing_Page: (firstTouch.first_landing_page as string) || undefined,
      Referrer: (firstTouch.first_referrer as string) || undefined,
    }).then(async (zohoResult) => {
      if (zohoResult) {
        await supabase
          .from('leads')
          .update({ zoho_lead_id: zohoResult.id, zoho_synced_at: new Date().toISOString() })
          .eq('id', lead.id)
      }
    }).catch(err => console.error('[Zoho] Background push error:', err))

    // Fire-and-forget: email notifications
    sendLeadNotification({
      name, email, phone,
      street_address, city, state, zip_code,
      rv_year, rv_make, rv_model, rv_length,
      roof_type, has_roof_damage,
      photo_urls, texting_consent,
      message, source_page,
    }).catch(err => console.error('[Gmail] Lead notification error:', err))

    sendLeadAutoReply({
      name, email, phone,
      street_address, city, state, zip_code,
      rv_year, rv_make, rv_model, rv_length,
      roof_type, has_roof_damage,
      message,
    }).catch(err => console.error('[Gmail] Auto-reply error:', err))

    return NextResponse.json({ success: true, lead_id: lead.id })
  } catch (err) {
    console.error('Lead API error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
