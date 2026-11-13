import { createAdminClient } from '@/lib/supabase/admin'
import { deriveStatuses } from '@/lib/pro/status'
import { PRO_STATUS_LABEL } from '@/lib/pro/config'
import { listAdminContractors } from '@/lib/contractors/data'
import { isDealerOrderTags, planShopifySync } from '@/lib/contractors/shopify-match'
import { placeLabel, type AdminContractor } from '@/lib/contractors/types'
import { memo } from './cache'
import { legacyId as legacyIdOf } from './format'
import { getRepRoster, repsOnTags } from './reps'
import { allCustomers, allOrders, customerName, orderSales, type CustomerLite, type OrderLite } from './sales'

/**
 * Dealer data for the Crazy Seal Admin:
 * - Contractors: the contractors table (the dealer list, contractors added by
 *   hand, and the Shopify dealer roster consolidated into it by the Shopify
 *   sync: customers tagged dealer/pro/professional, plus anyone with an order
 *   tagged "Dealer"), each with the Shopify customers linked to them. Sales
 *   reps build dealer orders as draft orders and tag the order (not always the
 *   customer) "Dealer" and their own name, so the order tag is the more
 *   reliable signal.
 * - Portal accounts: everyone with a login to the live Pro Hub (/pro), which
 *   is the dealer portal partners use today.
 * - Applications: "Become a dealer" form submissions (leads.lead_type = business).
 */

const isDealerOrder = (o: OrderLite) => isDealerOrderTags(o.tags)

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

export function proUsers(): Promise<ProUserRow[]> {
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

export interface ContractorListRow extends AdminContractor {
  /** Their Pro Hub account, when they have one. */
  proUserId: string | null
  portal: PortalState
  lastLoginAt: string | null
  statuses: string[]
  /** Linked Shopify customer records. */
  customerCount: number
  /** The linked customer View as and the customer link use: one with an email, most spent first. */
  primaryCustomerId: string | null
  primaryCustomerLegacyId: string | null
  /** Their email, which a View as base view needs. */
  primaryCustomerEmail: string | null
  /** Shopify's lifetime spend and order count across their records (back to 2019). */
  lifetime: number
  lifetimeOrders: number
  /** Orders in the history kept here (see getCoverage). */
  historySales: number
  historyOrders: number
  recentSales: number
  recentOrders: number
  /** Their orders the sales team tagged "Dealer". */
  dealerSales: number
  dealerOrders: number
  lastOrderAt: string | null
  /** Sales reps on their dealer orders, most orders first. */
  reps: string[]
  warranties: number
}

const RECENT_DAYS = 90

/** Shopify ids of the dealer roster: customers tagged Dealer, Pro or Professional, or with an order tagged Dealer. */
function rosterIds(customers: CustomerLite[], orders: OrderLite[]): Set<string> {
  const ids = new Set(customers.filter((c) => c.is_dealer).map((c) => c.shopify_id))
  for (const o of orders) if (!o.cancelled_at && o.customer_shopify_id && isDealerOrder(o)) ids.add(o.customer_shopify_id)
  return ids
}

/**
 * Contractors: every row of the contractors table (the dealer list,
 * contractors added by hand, and the Shopify dealers the sync added), with
 * their linked Shopify customers' spending and their Pro Hub account. Also
 * what the Shopify sync would do now, so the page can offer it.
 */
export async function getContractorList() {
  const [records, customers, users, orders, warranties, repRoster] = await Promise.all([
    listAdminContractors(),
    allCustomers(),
    proUsers(),
    allOrders(),
    warrantyCounts(),
    getRepRoster(),
  ])
  // Rep-name tags the sales team puts on orders (the Sales reps roster).
  const repNames = repRoster.reps.map((r) => r.name)
  const repsOf = (tags: string[]) => repsOnTags(tags, repNames)
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000).toISOString()
  const customerById = new Map(customers.map((c) => [c.shopify_id, c]))
  const ordersBy = new Map<string, OrderLite[]>()
  for (const o of orders) if (!o.cancelled_at && o.customer_shopify_id) ordersBy.set(o.customer_shopify_id, [...(ordersBy.get(o.customer_shopify_id) ?? []), o])

  const contractors: ContractorListRow[] = records.map((d) => {
    const linked = d.shopifyCustomerIds.map((id) => customerById.get(id)).filter((c): c is CustomerLite => Boolean(c))
    const ids = new Set(linked.map((c) => c.shopify_id))
    const emails = new Set([d.email, ...linked.map((c) => c.email)].filter(Boolean).map((e) => e!.toLowerCase()))
    // users are newest sign-in first, so the account in use wins.
    const user = users.find((u) => (u.shopify_customer_id && ids.has(u.shopify_customer_id)) || emails.has(u.email.toLowerCase()))
    const theirs = linked.flatMap((c) => ordersBy.get(c.shopify_id) ?? [])
    const recent = theirs.filter((o) => o.shopify_created_at >= since)
    const dealerOrders = theirs.filter(isDealerOrder)
    const repCount = new Map<string, number>()
    for (const o of dealerOrders) for (const rep of repsOf(o.tags)) repCount.set(rep, (repCount.get(rep) ?? 0) + 1)
    const primary = [...linked].sort((a, b) => Number(Boolean(b.email)) - Number(Boolean(a.email)) || (b.amount_spent ?? 0) - (a.amount_spent ?? 0))[0]
    const lastOrderAt = [...linked.map((c) => c.last_order_at), ...theirs.map((o) => o.shopify_created_at)].filter(Boolean).sort().at(-1) ?? null
    const statuses = deriveStatuses({
      tags: linked.flatMap((c) => c.tags),
      orderCount: linked.reduce((n, c) => n + c.number_of_orders, 0),
      statusOverride: user?.status_override,
    })
    return {
      ...d,
      proUserId: user?.id ?? null,
      portal: portalState(user),
      lastLoginAt: user?.last_login_at ?? null,
      statuses: statuses.map((s) => PRO_STATUS_LABEL[s]),
      customerCount: linked.length,
      primaryCustomerId: primary?.shopify_id ?? null,
      primaryCustomerLegacyId: primary ? primary.legacy_resource_id ?? legacyIdOf(primary.shopify_id) : null,
      primaryCustomerEmail: primary?.email ?? null,
      lifetime: linked.reduce((n, c) => n + (c.amount_spent ?? 0), 0),
      lifetimeOrders: linked.reduce((n, c) => n + c.number_of_orders, 0),
      historySales: theirs.reduce((n, o) => n + orderSales(o), 0),
      historyOrders: theirs.length,
      recentSales: recent.reduce((n, o) => n + orderSales(o), 0),
      recentOrders: recent.length,
      dealerSales: dealerOrders.reduce((n, o) => n + orderSales(o), 0),
      dealerOrders: dealerOrders.length,
      lastOrderAt,
      reps: repCount.size ? [...repCount].sort((a, b) => b[1] - a[1]).map(([rep]) => rep) : repsOf(linked.flatMap((c) => c.tags)),
      warranties: [...emails].reduce((n, e) => n + (warranties.get(e) ?? 0), 0) + (user ? warranties.get(user.id) ?? 0 : 0),
    } satisfies ContractorListRow
  })

  // Every order tagged Dealer counts toward the rep totals, linked to a contractor or not.
  const repTotals = new Map<string, { orders: number; sales: number }>()
  let dealerOrderSales = 0
  let dealerOrderCount = 0
  let allHistory = 0
  let allRecent = 0
  for (const o of orders) {
    if (o.cancelled_at) continue
    allHistory += orderSales(o)
    if (o.shopify_created_at >= since) allRecent += orderSales(o)
    if (!isDealerOrder(o)) continue
    dealerOrderSales += orderSales(o)
    dealerOrderCount += 1
    const reps = repsOf(o.tags)
    for (const rep of reps.length ? reps : ['No rep tag']) {
      const t = repTotals.get(rep) ?? { orders: 0, sales: 0 }
      t.orders += 1
      t.sales += orderSales(o)
      repTotals.set(rep, t)
    }
  }

  const plan = planShopifySync({
    contractors: records.map((d) => ({
      id: d.id,
      email: d.email,
      phone: d.phone,
      company: d.company,
      first_name: d.firstName,
      goes_by: d.goesBy,
      last_name: d.lastName,
      state: d.state,
      service_states: d.serviceStates,
      shopify_customer_ids: d.shopifyCustomerIds,
      unlinked_customer_ids: d.unlinkedCustomerIds,
      created_at: d.createdAt,
    })),
    customers,
    accounts: users,
    roster: rosterIds(customers, orders),
  })
  const contractorById = new Map(contractors.map((d) => [d.id, d]))

  const sum = (pick: (d: ContractorListRow) => number) => contractors.reduce((n, d) => n + pick(d), 0)
  const allLifetime = customers.reduce((n, c) => n + (c.amount_spent ?? 0), 0)
  const lifetime = sum((d) => d.lifetime)
  const historySales = sum((d) => d.historySales)
  const recentSales = sum((d) => d.recentSales)

  return {
    contractors,
    summary: {
      count: contractors.length,
      listed: contractors.filter((d) => d.isListed).length,
      fromShopify: contractors.filter((d) => d.origin === 'shopify').length,
      onPortal: contractors.filter((d) => d.portal !== 'none').length,
      noAccount: contractors.filter((d) => d.portal === 'none').length,
      withShopify: contractors.filter((d) => d.customerCount > 0).length,
      orderedRecently: contractors.filter((d) => d.recentOrders > 0).length,
      lifetime,
      allLifetime,
      lifetimeShare: allLifetime ? lifetime / allLifetime : 0,
      historySales,
      allHistory,
      historyShare: allHistory ? historySales / allHistory : 0,
      recentSales,
      allRecent,
      recentShare: allRecent ? recentSales / allRecent : 0,
      dealerOrders: dealerOrderCount,
      dealerOrderSales,
      dealerOrderShare: allHistory ? dealerOrderSales / allHistory : 0,
    },
    reps: [...repTotals].map(([rep, t]) => ({ key: rep, label: rep, ...t })).sort((a, b) => b.sales - a.sales),
    pending: {
      adds: plan.adds.length,
      links: plan.links.length,
      ambiguous: plan.ambiguous.map((a) => ({
        customer: customerById.get(a.customerId)!,
        contractors: a.contractorIds.map((id) => contractorById.get(id)).filter((d): d is ContractorListRow => Boolean(d)),
      })),
    },
    recentDays: RECENT_DAYS,
  }
}

/** One contractor with their linked Shopify customers and their orders in the history kept here, newest first. */
export async function getContractorDetail(id: string) {
  const [{ contractors }, customers, orders] = await Promise.all([getContractorList(), allCustomers(), allOrders()])
  const contractor = contractors.find((d) => d.id === id)
  if (!contractor) return null
  const ids = new Set(contractor.shopifyCustomerIds)
  return {
    contractor,
    customers: customers.filter((c) => ids.has(c.shopify_id)).sort((a, b) => (b.amount_spent ?? 0) - (a.amount_spent ?? 0)),
    orders: orders.filter((o) => o.customer_shopify_id && ids.has(o.customer_shopify_id)),
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

export interface ViewAsRow {
  key: string
  name: string
  /** The contact when `name` is their company. */
  contact: string | null
  email: string | null
  location: string
  /** Shopify customer id, for contractors with no account (the base view). */
  customerId: string | null
  customerLegacyId: string | null
  proUserId: string | null
  portal: PortalState
  lastLoginAt: string | null
  statuses: string[]
  spent: number
}

const PORTAL_RANK: Record<PortalState, number> = { active: 0, idle: 1, invited: 2, none: 3 }

/**
 * Everyone an admin can view the Pro Hub as: every contractor with a Pro Hub
 * account or a linked Shopify customer with an email (no account opens the
 * base view from that customer), plus Pro Hub accounts that aren't a
 * contractor's.
 * Accounts in use first.
 */
export async function getViewAsTargets(): Promise<ViewAsRow[]> {
  const [{ contractors }, { rows: accounts }] = await Promise.all([getContractorList(), getPortalAccounts()])
  const ofContractors = new Set(contractors.map((d) => d.proUserId))
  const rows: ViewAsRow[] = [
    ...contractors
      .filter((d) => d.proUserId || d.primaryCustomerEmail)
      .map((d) => ({
        key: d.id,
        name: d.name,
        contact: d.contact,
        email: d.email ?? d.primaryCustomerEmail,
        location: placeLabel(d) || '—',
        customerId: d.primaryCustomerId,
        customerLegacyId: d.primaryCustomerLegacyId,
        proUserId: d.proUserId,
        portal: d.portal,
        lastLoginAt: d.lastLoginAt,
        statuses: d.statuses,
        spent: d.lifetime,
      })),
    ...accounts
      .filter((a) => !ofContractors.has(a.id))
      .map((a) => ({
        key: a.id,
        name: a.business_name || a.name,
        contact: a.business_name && a.name !== a.email ? a.name : null,
        email: a.email,
        location: a.location,
        customerId: null,
        customerLegacyId: a.customerLegacyId,
        proUserId: a.id,
        portal: a.state,
        lastLoginAt: a.last_login_at,
        statuses: a.statuses,
        spent: a.spent,
      })),
  ]
  return rows.sort(
    (a, b) => PORTAL_RANK[a.portal] - PORTAL_RANK[b.portal] || (b.lastLoginAt ?? '').localeCompare(a.lastLoginAt ?? '') || b.spent - a.spent,
  )
}

export interface ViewAsLogRow {
  admin_name: string | null
  admin_email: string
  pro_user_email: string
  pro_user_id: string | null
  created_at: string
}

/** Recent View as starts, and how many in the last 30 days. */
export async function getViewAsLog(limit = 8): Promise<{ recent: ViewAsLogRow[]; last30: number }> {
  const db = createAdminClient()
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
  const [recent, count] = await Promise.all([
    db
      .from('admin_view_as_log')
      .select('admin_name, admin_email, pro_user_email, pro_user_id, created_at')
      .eq('action', 'start')
      .order('created_at', { ascending: false })
      .limit(limit),
    db.from('admin_view_as_log').select('id', { count: 'exact', head: true }).eq('action', 'start').gte('created_at', since),
  ])
  return { recent: (recent.data ?? []) as ViewAsLogRow[], last30: count.count ?? 0 }
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
