import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { auth_user_id } = await request.json()

    if (!auth_user_id) {
      return NextResponse.json({ technician: null })
    }

    const supabase = createAdminClient()

    // Check technicians table first
    const { data: techRecord } = await supabase
      .from('technicians')
      .select('id, full_name, email, role, is_active')
      .eq('auth_user_id', auth_user_id)
      .eq('is_active', true)
      .single()

    if (techRecord) {
      return NextResponse.json({ technician: techRecord })
    }

    // Fall back to staff table — staff members get super_admin access
    const { data: staffRecord } = await supabase
      .from('staff')
      .select('*')
      .eq('auth_user_id', auth_user_id)
      .eq('is_active', true)
      .single()

    if (staffRecord) {
      return NextResponse.json({
        technician: {
          id: staffRecord.id,
          full_name: staffRecord.full_name || staffRecord.name,
          email: staffRecord.email,
          role: 'super_admin',
          is_active: true,
        },
      })
    }

    return NextResponse.json({ technician: null })
  } catch {
    return NextResponse.json({ technician: null })
  }
}
