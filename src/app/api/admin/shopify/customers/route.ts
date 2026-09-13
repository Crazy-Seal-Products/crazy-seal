import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { createAdminClient } from '@/lib/supabase/admin'

function searchTerm(raw: string | null) {
  return (raw ?? '').replace(/[%_,()]/g, ' ').trim().slice(0, 80)
}

export async function GET(request: NextRequest) {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const q = searchTerm(request.nextUrl.searchParams.get('q'))
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 100, 250)
  const supabase = createAdminClient()

  let query = supabase
    .from('shopify_customers')
    .select('shopify_id, email, phone, first_name, last_name, display_name, tags, state, number_of_orders, amount_spent, amount_spent_currency, is_dealer, is_commercial, email_marketing_state, default_address, shopify_created_at, shopify_updated_at, synced_at, note')
    .is('deleted_at', null)
    .order('number_of_orders', { ascending: false })
    .limit(limit)

  if (q) {
    query = query.or(`email.ilike.%${q}%,display_name.ilike.%${q}%,phone.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message, customers: [] }, { status: 500 })
  return NextResponse.json({ customers: data ?? [] })
}
