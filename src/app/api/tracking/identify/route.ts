import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorId, sessionId, email, firstName, lastName, phone } = body

    if (!visitorId || !email) {
      return NextResponse.json({ error: 'visitorId and email are required' }, { status: 400 })
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: visitor, error: visitorError } = await supabase
      .from('visitors')
      .select('*')
      .eq('fingerprint', visitorId)
      .single()

    if (visitorError || !visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 })
    }

    if (sessionId) {
      await supabase
        .from('sessions')
        .update({
          converted: true,
          conversion_type: 'email',
          conversion_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Tracking] Identify API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
