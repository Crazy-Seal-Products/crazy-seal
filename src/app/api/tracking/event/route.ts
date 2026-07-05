import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_EVENT_TYPES = [
  'lead_created',
  'email_captured',
  'form_started',
  'form_submitted',
  'video_played',
  'gallery_viewed',
  'faq_expanded',
  'phone_clicked',
  'email_clicked',
  'quote_requested',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, sessionId, eventType, eventData, pagePath } = body

    if (!visitorId || !eventType) {
      return NextResponse.json({ error: 'visitorId and eventType are required' }, { status: 400 })
    }

    if (!VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: visitor } = await supabase
      .from('visitors')
      .select('id')
      .eq('fingerprint', visitorId)
      .single()

    if (!visitor) {
      return NextResponse.json({ success: true, warning: 'visitor_not_found' })
    }

    let validSessionId: string | null = null
    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .single()
      validSessionId = session?.id || null
    }

    const { error: eventError } = await supabase
      .from('journey_events')
      .insert({
        visitor_id: visitor.id,
        session_id: validSessionId,
        event_type: eventType,
        event_data: eventData || {},
        page_path: pagePath || null,
        created_at: new Date().toISOString()
      })

    if (eventError) {
      console.error('[Tracking] Event insert error:', eventError)
      return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
    }

    const conversionEvents = ['email_captured', 'form_submitted', 'lead_created']
    if (conversionEvents.includes(eventType) && validSessionId) {
      await supabase
        .from('sessions')
        .update({
          converted: true,
          conversion_type: eventType,
          conversion_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', validSessionId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Tracking] Event API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
