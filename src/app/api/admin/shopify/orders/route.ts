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
  const customer = request.nextUrl.searchParams.get('customer')
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 100, 250)
  const supabase = createAdminClient()

  let query = supabase
    .from('shopify_orders')
    .select('shopify_id, name, number, email, phone, customer_shopify_id, customer_display_name, financial_status, fulfillment_status, return_status, currency, total_price, current_total_price, total_tax, total_discounts, total_shipping, tags, note, source_name, po_number, test, shipping_address, billing_address, discount_codes, payment_gateway_names, shopify_created_at, shopify_updated_at, synced_at, cancelled_at, shopify_order_line_items(title, sku, quantity, variant_title, discounted_total)')
    .is('deleted_at', null)
    .order('shopify_created_at', { ascending: false })
    .limit(limit)

  if (customer) query = query.eq('customer_shopify_id', customer)
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,customer_display_name.ilike.%${q}%,customer_email.ilike.%${q}%,po_number.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message, orders: [] }, { status: 500 })
  return NextResponse.json({ orders: data ?? [] })
}
