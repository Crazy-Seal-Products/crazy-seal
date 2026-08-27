import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { createAdminClient } from '@/lib/supabase/admin'
import { listHighVolumeCustomers, listTaggedDealers, shopifyErrorMessage } from '@/lib/pro/shopify'
import { listLocalDealers, listLocalHighVolume } from '@/lib/shopify/commerce'

export async function GET(request: NextRequest) {
  const staff = await requireStaff()
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tab = request.nextUrl.searchParams.get('tab') || 'dealers'
  const supabase = createAdminClient()
  const { data: members } = await supabase
    .from('pro_users')
    .select('id, email, display_name, business_name, shopify_customer_id, status_override, last_login_at, invited_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const hubByEmail = new Map((members ?? []).map((m) => [m.email.toLowerCase(), m]))
  const hubByShopify = new Map(
    (members ?? []).filter((m) => m.shopify_customer_id).map((m) => [m.shopify_customer_id as string, m]),
  )

  try {
    if (tab === 'members') {
      return NextResponse.json({ customers: members ?? [], shopifyError: null })
    }

    const local = tab === 'volume'
      ? await listLocalHighVolume(80)
      : await listLocalDealers(80)
    const shopifyCustomers = local.length
      ? local
      : tab === 'volume'
        ? await listHighVolumeCustomers(80)
        : await listTaggedDealers(80)

    const customers = shopifyCustomers.map((c) => {
      const hub = (c.email && hubByEmail.get(c.email.toLowerCase())) || hubByShopify.get(c.id) || null
      return {
        ...c,
        hub: hub
          ? {
              id: hub.id,
              last_login_at: hub.last_login_at,
              invited_at: hub.invited_at,
              status_override: hub.status_override,
            }
          : null,
      }
    })

    return NextResponse.json({ customers, shopifyError: null })
  } catch (err) {
    console.error('[admin/pros/customers]', err)
    return NextResponse.json({
      customers: tab === 'members' ? (members ?? []) : [],
      shopifyError: shopifyErrorMessage(err),
    })
  }
}
