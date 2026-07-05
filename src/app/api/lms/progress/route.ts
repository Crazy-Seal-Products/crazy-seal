import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { technician_id, lesson_id, status } = await request.json()

    if (!technician_id || !lesson_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['not_started', 'in_progress', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const updateData: Record<string, unknown> = { status }
    if (status === 'in_progress' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString()
    }
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('technician_lesson_progress')
      .upsert(
        {
          technician_id,
          lesson_id,
          ...updateData,
        },
        { onConflict: 'technician_id,lesson_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ progress: data })
  } catch {
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
