import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      visitorId, sessionId, isNewVisitor, isNewSession,
      landingPage, referrer, utm, clickIds, adClickData, urlParams, device
    } = body

    if (!visitorId || !sessionId) {
      return NextResponse.json({ error: 'visitorId and sessionId are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (isNewVisitor) {
      const { error: visitorError } = await supabase
        .from('visitors')
        .insert({
          id: visitorId,
          fingerprint: visitorId,
          first_landing_page: landingPage,
          first_referrer: referrer,
          first_utm_source: utm?.utm_source || null,
          first_utm_medium: utm?.utm_medium || null,
          first_utm_campaign: utm?.utm_campaign || null,
          first_utm_term: utm?.utm_term || null,
          first_utm_content: utm?.utm_content || null,
          first_gclid: clickIds?.gclid || null,
          first_fbclid: clickIds?.fbclid || null,
          first_msclkid: clickIds?.msclkid || null,
          first_ttclid: clickIds?.ttclid || null,
          first_url_params: urlParams && Object.keys(urlParams).length > 0 ? urlParams : {},
          last_landing_page: landingPage,
          last_utm_source: utm?.utm_source || null,
          last_utm_medium: utm?.utm_medium || null,
          last_utm_campaign: utm?.utm_campaign || null,
          first_seen_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          session_count: 1,
          total_pageviews: 0
        })

      if (visitorError && !visitorError.message.includes('duplicate')) {
        console.error('[Tracking] Visitor insert error:', visitorError)
      }
    } else {
      const { error: visitorUpdateError } = await supabase
        .from('visitors')
        .update({
          last_seen_at: new Date().toISOString(),
          last_landing_page: landingPage,
          last_utm_source: utm?.utm_source || null,
          last_utm_medium: utm?.utm_medium || null,
          last_utm_campaign: utm?.utm_campaign || null,
          updated_at: new Date().toISOString()
        })
        .eq('fingerprint', visitorId)

      if (visitorUpdateError) {
        console.error('[Tracking] Visitor update error:', visitorUpdateError)
      }
    }

    if (isNewSession) {
      const { data: visitor } = await supabase
        .from('visitors')
        .select('id')
        .eq('fingerprint', visitorId)
        .single()

      const actualVisitorId = visitor?.id || visitorId

      const adClickDataClean: Record<string, string> = {}
      if (adClickData && typeof adClickData === 'object') {
        for (const [key, value] of Object.entries(adClickData)) {
          if (value && typeof value === 'string' && value.trim() !== '') {
            adClickDataClean[key] = value
          }
        }
      }

      const { error: sessionError } = await supabase
        .from('sessions')
        .insert({
          id: sessionId,
          visitor_id: actualVisitorId,
          landing_page: landingPage,
          referrer: referrer,
          utm_source: utm?.utm_source || null,
          utm_medium: utm?.utm_medium || null,
          utm_campaign: utm?.utm_campaign || null,
          utm_term: utm?.utm_term || null,
          utm_content: utm?.utm_content || null,
          gclid: clickIds?.gclid || null,
          fbclid: clickIds?.fbclid || null,
          msclkid: clickIds?.msclkid || null,
          ttclid: clickIds?.ttclid || null,
          li_fat_id: clickIds?.li_fat_id || null,
          gbraid: clickIds?.gbraid || null,
          wbraid: clickIds?.wbraid || null,
          ad_click_data: Object.keys(adClickDataClean).length > 0 ? adClickDataClean : null,
          url_params: urlParams && Object.keys(urlParams).length > 0 ? urlParams : {},
          device_type: device?.type || null,
          browser: device?.browser || null,
          os: device?.os || null,
          started_at: new Date().toISOString(),
          last_activity_at: new Date().toISOString(),
          pageview_count: 0,
          converted: false
        })

      if (sessionError && !sessionError.message.includes('duplicate')) {
        console.error('[Tracking] Session insert error:', sessionError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Tracking] Session API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
