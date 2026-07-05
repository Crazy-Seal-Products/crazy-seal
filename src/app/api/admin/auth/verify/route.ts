import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { auth_user_id } = await request.json()

    console.log('[admin/verify] auth_user_id:', auth_user_id)

    if (!auth_user_id) {
      console.log('[admin/verify] No auth_user_id provided')
      return NextResponse.json({ staff: null })
    }

    const supabase = createAdminClient()

    const { data: staffRecord, error } = await supabase
      .from('staff')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .eq('is_active', true)
      .single()

    console.log('[admin/verify] query result:', { staffRecord, error: error?.message, code: error?.code })

    if (error || !staffRecord) {
      return NextResponse.json({ staff: null })
    }

    return NextResponse.json({
      staff: {
        id: staffRecord.id,
        full_name: staffRecord.full_name || staffRecord.name,
        email: staffRecord.email,
        role: staffRecord.role,
        is_active: staffRecord.is_active,
      },
    })
  } catch (err) {
    console.error('[admin/verify] catch error:', err)
    return NextResponse.json({ staff: null })
  }
}
