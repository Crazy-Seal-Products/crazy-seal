import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, visitorId, pagePath, pageTitle, pageUrl, viewOrder } = body

    if (!sessionId || !visitorId || !pagePath) {
      return NextResponse.json({ error: 'sessionId, visitorId, and pagePath are required' }, { status: 400 })
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

    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ success: true, warning: 'session_not_found' })
    }

    const { error: pageViewError } = await supabase
      .from('page_views')
      .insert({
        session_id: sessionId,
        visitor_id: visitor.id,
        page_path: pagePath,
        page_title: pageTitle || null,
        page_url: pageUrl || null,
        view_order: viewOrder || 1,
        viewed_at: new Date().toISOString()
      })

    if (pageViewError) {
      console.error('[Tracking] PageView insert error:', pageViewError)
      return NextResponse.json({ error: 'Failed to track page view' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Tracking] PageView API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
