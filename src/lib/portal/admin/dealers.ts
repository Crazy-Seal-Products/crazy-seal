import { createAdminClient } from '@/lib/supabase/admin'
import { deriveStatuses } from '@/lib/pro/status'
import { PRO_STATUS_LABEL } from '@/lib/pro/config'
import { memo } from './cache'
import { allCustomers, allOrders, customerName, orderSales, type CustomerLite, type OrderLite } from './sales'

/**
 * Dealer data for the Crazy Seal Admin:
 * - Dealers: Shopify customers tagged dealer/pro/professional, plus anyone
 *   who has an order tagged "Dealer". Sales reps build dealer orders as draft
 *   orders and tag the order (not always the customer) "Dealer" and their own
 *   name, so the order tag is the more reliable signal.
 * - Portal accounts: everyone with a login to the live Pro Hub (/pro), which
 *   is the dealer portal partners use today.
 * - Applications: "Become a dealer" form submissions (leads.lead_type = business).
 */

/** Rep-name tags the sales team puts on orders (seen in Shopify, Oct 2026). */
export const SALES_REPS = ['Amber', 'Mike', 'Tina', 'Stephen', 'Vernon']

const isDealerOrder = (o: OrderLite) => o.tags.some((t) => t.trim().toLowerCase() === 'dealer')
const repsOf = (tags: string[]) => SALES_REPS.filter((r) => tags.some((t) => t.trim().toLowerCase() === r.toLowerCase()))

export type PortalState = 'active' | 'idle' | 'invited' | 'none'

export interface ProUserRow {
  id: string
  email: string
  display_name: string | null
  business_name: string | null
  phone: string | null
  shopify_customer_id: string | null
  status_override: string | null
  last_login_at: string | null
  invited_at: string | null
  created_at: string
  has_password: boolean
}

function proUsers(): Promise<ProUserRow[]> {
  return memo('pro-users', 60_000, async () => {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pro_users')
      .select('id, email, display_name, business_name, phone, shopify_customer_id, status_override, last_login_at, invited_at, created_at, password_hash')
      .order('last_login_at', { ascending: false, nullsFirst: false })
      .limit(5000)
    if (error) throw new Error(error.message)
    return (data ?? []).map(({ password_hash, ...u }) => ({ ...u, has_password: Boolean(password_hash) }))
  })
}

function warrantyCounts(): Promise<Map<string, number>> {
  return memo('warranty-installers', 5 * 60_000, async () => {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('warranty_registrations')
      .select('installer_email, filed_by_pro_user_id')
      .or('installer_email.not.is.null,filed_by_pro_user_id.not.is.null')
      .limit(10_000)
    const map = new Map<string, number>()
    for (const r of data ?? []) {
      for (const key of new Set([r.installer_email?.toLowerCase(), r.filed_by_pro_user_id].filter(Boolean) as string[])) {
        map.set(key, (map.get(key) ?? 0) + 1)
      }
    }
    return map
  })
}

export function portalState(u: ProUserRow | undefined): PortalState {
  if (!u) return 'none'
  if (!u.last_login_at) return 'invited'
  return Date.now() - new Date(u.last_login_at).getTime() < 30 * 86_400_000 ? 'active' : 'idle'
}

export interface DealerRow {
  key: string
  customer: CustomerLite | null
  name: string
  company: string | null
  email: string | null
  phone: string | null
  location: string
  tags: string[]
  orders: number
  spent: number
  recentSales: number
  recentOrders: number
  lastOrderAt: string | null
  statuses: string[]
  portal: PortalState
  lastLoginAt: string | null
  warranties: number
  /** How we know they're a dealer: a customer tag, Dealer-tagged orders, or both. */
  source: 'tag' | 'orders' | 'both'
  /** Dealer-tagged orders in the order history kept here. */
  dealerOrders: number
  dealerSales: number
  /** Sales reps on their dealer orders, most orders first. */
  reps: string[]
}

const RECENT_DAYS = 90

export async function getDealers() {
  const [customers, users, orders, warranties] = await Promise.all([allCustomers(), proUsers(), allOrders(), warrantyCounts()])
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString()

  const userByCustomer = new Map(users.filter((u) => u.shopify_customer_id).map((u) => [u.shopify_customer_id!, u]))
  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]))
  const recent = new Map<string, { sales: number; orders: number; last: string }>()
  const dealerBuys = new Map<string, { orders: number; sales: number; reps: Map<string, number> }>()
  const repTotals = new Map<string, { orders: number; sales: number }>()
  let historySales = 0
  let dealerHistorySales = 0
  let dealerHistoryOrders = 0
  for (const o of orders) {
    if (o.cancelled_at) continue
    historySales += orderSales(o)
    if (isDealerOrder(o)) {
      dealerHistorySales += orderSales(o)
      dealerHistoryOrders += 1
      const reps = repsOf(o.tags)
      for (const rep of reps.length ? reps : ['No rep tag']) {
        const t = repTotals.get(rep) ?? { orders: 0, sales: 0 }
        t.orders += 1
        t.sales += orderSales(o)
        repTotals.set(rep, t)
      }
    }
    if (!o.customer_shopify_id) continue
    const r = recent.get(o.customer_shopify_id) ?? { sales: 0, orders: 0, last: o.shopify_created_at }
    if (o.shopify_created_at >= since) {
      r.sales += orderSales(o)
      r.orders += 1
    }
    if (o.shopify_created_at > r.last) r.last = o.shopify_created_at
    recent.set(o.customer_shopify_id, r)
    if (isDealerOrder(o)) {
      const b = dealerBuys.get(o.customer_shopify_id) ?? { orders: 0, sales: 0, reps: new Map<string, number>() }
      b.orders += 1
      b.sales += orderSales(o)
      for (const rep of repsOf(o.tags)) b.reps.set(rep, (b.reps.get(rep) ?? 0) + 1)
      dealerBuys.set(o.customer_shopify_id, b)
    }
  }

  const dealers: DealerRow[] = customers
    .filter((c) => c.is_dealer || dealerBuys.has(c.shopify_id))
    .map((c) => {
      const user = userByCustomer.get(c.shopify_id) ?? (c.email ? userByEmail.get(c.email.toLowerCase()) : undefined)
      const r = recent.get(c.shopify_id)
      const b = dealerBuys.get(c.shopify_id)
      const statuses = deriveStatuses({ tags: c.tags, orderCount: c.number_of_orders, statusOverride: user?.status_override })
      return {
        key: c.shopify_id,
        customer: c,
        name: customerName(c),
        company: c.company,
        email: c.email,
        phone: c.phone,
        location: [c.city, c.province].filter(Boolean).join(', ') || '—',
        tags: c.tags.filter((t) => !['dealer', 'pro', 'professional'].includes(t.toLowerCase())),
        orders: c.number_of_orders,
        spent: c.amount_spent ?? 0,
        recentSales: r?.sales ?? 0,
        recentOrders: r?.orders ?? 0,
        lastOrderAt: c.last_order_at ?? r?.last ?? null,
        statuses: statuses.map((s) => PRO_STATUS_LABEL[s]),
        portal: portalState(user),
        lastLoginAt: user?.last_login_at ?? null,
        warranties: (c.email ? warranties.get(c.email.toLowerCase()) ?? 0 : 0) + (user ? warranties.get(user.id) ?? 0 : 0),
        source: c.is_dealer && b ? 'both' : c.is_dealer ? 'tag' : 'orders',
        dealerOrders: b?.orders ?? 0,
        dealerSales: b?.sales ?? 0,
        reps: b ? [...b.reps].sort((x, y) => y[1] - x[1]).map(([rep]) => rep) : repsOf(c.tags),
      } satisfies DealerRow
    })
    .sort((a, b) => b.dealerSales - a.dealerSales || b.spent - a.spent)

  const allSpent = customers.reduce((n, c) => n + (c.amount_spent ?? 0), 0)
  const dealerSpent = dealers.reduce((n, d) => n + d.spent, 0)
  const recentAll = orders.filter((o) => !o.cancelled_at && o.shopify_created_at >= since).reduce((n, o) => n + orderSales(o), 0)
  const recentDealer = dealers.reduce((n, d) => n + d.recentSales, 0)

  return {
    dealers,
    summary: {
      count: dealers.length,
      tagged: dealers.filter((d) => d.source !== 'orders').length,
      fromOrdersOnly: dealers.filter((d) => d.source === 'orders').length,
      spent: dealerSpent,
      share: allSpent ? dealerSpent / allSpent : 0,
      recentSales: recentDealer,
      recentShare: recentAll ? recentDealer / recentAll : 0,
      dealerOrders: dealerHistoryOrders,
      dealerOrderSales: dealerHistorySales,
      dealerOrderShare: historySales ? dealerHistorySales / historySales : 0,
      orderedRecently: dealers.filter((d) => d.recentOrders > 0).length,
      onPortal: dealers.filter((d) => d.portal !== 'none').length,
    },
    reps: [...repTotals].map(([rep, t]) => ({ key: rep, label: rep, ...t })).sort((a, b) => b.sales - a.sales),
    recentDays: RECENT_DAYS,
  }
}

export interface PortalAccountRow extends ProUserRow {
  name: string
  customerLegacyId: string | null
  orders: number
  spent: number
  statuses: string[]
  state: PortalState
  location: string
  warranties: number
}

export async function getPortalAccounts() {
  const [customers, users, warranties] = await Promise.all([allCustomers(), proUsers(), warrantyCounts()])
  const byId = new Map(customers.map((c) => [c.shopify_id, c]))
  const byEmail = new Map(customers.filter((c) => c.email).map((c) => [c.email!.toLowerCase(), c]))

  const rows: PortalAccountRow[] = users.map((u) => {
    const c = (u.shopify_customer_id && byId.get(u.shopify_customer_id)) || byEmail.get(u.email.toLowerCase()) || null
    const statuses = deriveStatuses({ tags: c?.tags ?? [], orderCount: c?.number_of_orders ?? 0, statusOverride: u.status_override })
    return {
      ...u,
      name: u.display_name || (c ? customerName(c) : u.email),
      customerLegacyId: c?.legacy_resource_id ?? null,
      orders: c?.number_of_orders ?? 0,
      spent: c?.amount_spent ?? 0,
      statuses: statuses.map((s) => PRO_STATUS_LABEL[s]),
      state: portalState(u),
      location: c ? [c.city, c.province].filter(Boolean).join(', ') || '—' : '—',
      warranties: (warranties.get(u.id) ?? 0) + (warranties.get(u.email.toLowerCase()) ?? 0),
    }
  })

  const day = 86_400_000
  return {
    rows,
    summary: {
      total: rows.length,
      active30: rows.filter((r) => r.last_login_at && Date.now() - new Date(r.last_login_at).getTime() < 30 * day).length,
      active7: rows.filter((r) => r.last_login_at && Date.now() - new Date(r.last_login_at).getTime() < 7 * day).length,
      neverSignedIn: rows.filter((r) => !r.last_login_at).length,
      linked: rows.filter((r) => r.customerLegacyId).length,
      pros: rows.filter((r) => r.statuses.some((s) => s !== 'Member')).length,
      warranties: rows.reduce((n, r) => n + r.warranties, 0),
    },
  }
}

export interface ApplicationRow {
  id: string
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
  business_name: string | null
  business_type: string | null
  website: string | null
  location: string | null
  how_heard: string | null
  message: string | null
  status: string | null
  first_utm_source: string | null
}

export async function getApplications() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('leads')
    .select('id, created_at, name, email, phone, business_name, business_type, website, location, how_heard, message, status, first_utm_source')
    .eq('lead_type', 'business')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as ApplicationRow[]

  const types = new Map<string, number>()
  for (const r of rows) types.set(r.business_type || 'Not given', (types.get(r.business_type || 'Not given') ?? 0) + 1)
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()

  return {
    rows,
    summary: {
      total: rows.length,
      last30: rows.filter((r) => r.created_at >= since30).length,
      open: rows.filter((r) => !r.status || r.status === 'new').length,
    },
    types: [...types].map(([label, count]) => ({ key: label, label, count })).sort((a, b) => b.count - a.count),
  }
}

export function countNewApplications(): Promise<number> {
  return memo('applications-new', 60_000, async () => {
    const supabase = createAdminClient()
    const { count } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('lead_type', 'business')
      .or('status.is.null,status.eq.new')
    return count ?? 0
  })
}
