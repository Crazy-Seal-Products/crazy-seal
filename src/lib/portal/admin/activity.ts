import { createAdminClient } from '@/lib/supabase/admin'
import { memo } from './cache'
import { allOrders, isOpenOrder, orderSales } from './sales'
import { countNewApplications } from './dealers'
import { lastRefreshError, lastSyncedAt } from './refresh'
import { ago, money } from './format'

/**
 * Data for the admin's right-hand activity rail. Relative times are
 * formatted here, once, so server and browser render the same text.
 */

export interface Activity {
  toShip: { count: number; oldest: string | null }
  latest: { key: string; legacyId: string | null; name: string; customer: string; total: string; when: string }[]
  applications: { count: number; latest: { id: string; label: string; when: string }[] }
  sync: { lastSyncedAt: string | null; when: string; error: string | null; ordersInHistory: number }
}

function latestApplications(): Promise<{ id: string; created_at: string; name: string | null; business_name: string | null }[]> {
  return memo('applications-latest', 60_000, async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('leads')
      .select('id, created_at, name, business_name')
      .eq('lead_type', 'business')
      .order('created_at', { ascending: false })
      .limit(3)
    return data ?? []
  })
}

export async function getActivity(): Promise<Activity> {
  const [orders, newApplications, applications, synced] = await Promise.all([
    allOrders().catch(() => []),
    countNewApplications().catch(() => 0),
    latestApplications().catch(() => []),
    lastSyncedAt().catch(() => null),
  ])
  const now = Date.now()
  const open = orders.filter(isOpenOrder)
  const oldest = open.reduce<string | null>((min, o) => (!min || o.shopify_created_at < min ? o.shopify_created_at : min), null)

  return {
    toShip: { count: open.length, oldest: oldest ? ago(oldest, now).replace(' ago', ' old') : null },
    latest: orders.slice(0, 5).map((o) => ({
      key: o.shopify_id,
      legacyId: o.legacy_resource_id,
      name: o.name,
      customer: o.customer_display_name ?? o.email ?? 'Guest',
      total: money(o.cancelled_at ? 0 : orderSales(o)),
      when: ago(o.shopify_created_at, now),
    })),
    applications: {
      count: newApplications,
      latest: applications.map((a) => ({ id: a.id, label: a.business_name || a.name || 'Unnamed', when: ago(a.created_at, now) })),
    },
    sync: { lastSyncedAt: synced, when: ago(synced, now), error: lastRefreshError(), ordersInHistory: orders.length },
  }
}
