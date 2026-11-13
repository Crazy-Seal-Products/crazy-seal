import { createAdminClient } from '@/lib/supabase/admin'
import { memo } from './cache'
import { dayKey, dayStartIso } from './format'
import { isMissingTable } from './permissions'
import {
  allCustomers,
  allLineItems,
  allOrders,
  breakdownBy,
  bucketFor,
  customerName,
  groupItems,
  inWindow,
  isOpenOrder,
  itemSummary,
  lineUnits,
  orderSales,
  previousWindow,
  productBreakdown,
  seriesFor,
  UNPAID_FINANCIAL,
  windowFor,
  type CustomerLite,
  type OrderLite,
  type PeriodKey,
} from './sales'

/**
 * Sales reps for the Crazy Seal Admin. A rep's sales are the Shopify orders
 * tagged with their name: reps build dealer orders as draft orders and tag
 * them "Dealer" plus their own name (often "Commercial", "Residential" or
 * "Warranty" too). An order tagged with two reps counts for both; the team
 * total counts it once.
 *
 * The roster lives in `sales_reps` (migration 025), which also links each
 * rep to their admin login and holds an optional monthly goal. Until that
 * migration runs, the built-in list below applies.
 */

/** The rep tags on orders before the roster table (seen in Shopify, Oct 2026). */
export const DEFAULT_REP_NAMES = ['Amber', 'Mike', 'Tina', 'Stephen', 'Vernon']

export interface SalesRep {
  id: string | null
  /** The tag on their orders. */
  name: string
  /** Their admin login, lowercased. */
  staffEmail: string | null
  monthlyGoal: number | null
  active: boolean
}

export interface RepRoster {
  reps: SalesRep[]
  /** False until migration 025 adds the table; the built-in list applies meanwhile. */
  stored: boolean
}

export const ROSTER_CACHE_KEY = 'sales-reps'

export function getRepRoster(): Promise<RepRoster> {
  return memo(ROSTER_CACHE_KEY, 60_000, async () => {
    const { data, error } = await createAdminClient()
      .from('sales_reps')
      .select('id, name, staff_email, monthly_goal, is_active')
      .order('name')
    if (error && isMissingTable(error)) {
      return { stored: false, reps: DEFAULT_REP_NAMES.map((name) => ({ id: null, name, staffEmail: null, monthlyGoal: null, active: true })) }
    }
    if (error) throw new Error(`sales_reps: ${error.message}`)
    return {
      stored: true,
      reps: (data ?? []).map((r) => ({
        id: r.id as string,
        name: String(r.name).trim(),
        staffEmail: r.staff_email ? String(r.staff_email).toLowerCase() : null,
        monthlyGoal: r.monthly_goal == null ? null : Number(r.monthly_goal),
        active: Boolean(r.is_active),
      })),
    }
  })
}

/** The reps whose name is one of these order tags (any case). */
export function repsOnTags(tags: string[], names: readonly string[]): string[] {
  const set = new Set(tags.map((t) => t.trim().toLowerCase()))
  return names.filter((n) => set.has(n.toLowerCase()))
}

/**
 * The rep an admin login belongs to: the rep linked to their email. Before
 * migration 025 (no links yet), a rep whose name is the login's first name,
 * when only one is.
 */
export function repForAdmin(admin: { email: string; name: string }, roster: RepRoster): SalesRep | null {
  const email = admin.email.toLowerCase()
  const linked = roster.reps.find((r) => r.staffEmail === email)
  if (linked || roster.stored) return linked ?? null
  const first = admin.name.trim().split(/\s+/)[0]?.toLowerCase()
  const hits = first ? roster.reps.filter((r) => r.name.toLowerCase() === first) : []
  return hits.length === 1 ? hits[0] : null
}

/** Active admin logins a rep can be linked to. */
export async function staffLogins(): Promise<{ email: string; name: string; role: string | null }[]> {
  const { data, error } = await createAdminClient().from('staff').select('name, email, role').eq('is_active', true).order('name')
  if (error) throw new Error(`staff: ${error.message}`)
  return (data ?? []).map((s) => ({ email: String(s.email).toLowerCase(), name: (s.name as string | null)?.trim() || String(s.email), role: s.role as string | null }))
}

// ─── Filters ──────────────────────────────────────────────────────────────

export const REP_RANGES = [
  { key: 'day', label: 'Daily' },
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: 'mtd', label: 'This month' },
  { key: '90d', label: '90 days' },
  { key: 'ytd', label: 'Year to date' },
  { key: 'all', label: 'All history' },
] as const satisfies readonly { key: PeriodKey; label: string }[]

/** The order tags reps use for the kind of sale. */
export const ORDER_TYPES = [
  { key: 'all', label: 'All orders' },
  { key: 'dealer', label: 'Dealer' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'residential', label: 'Residential' },
  { key: 'warranty', label: 'Warranty' },
] as const

export type OrderType = (typeof ORDER_TYPES)[number]['key']

const hasTag = (o: Pick<OrderLite, 'tags'>, tag: string) => o.tags.some((t) => t.trim().toLowerCase() === tag)

function matchesType(o: OrderLite, type: OrderType) {
  return type === 'all' || hasTag(o, type)
}

/** The kind-of-sale tags on an order, for display. */
export function orderTypes(o: Pick<OrderLite, 'tags'>): string[] {
  return ORDER_TYPES.filter((t) => t.key !== 'all' && hasTag(o, t.key)).map((t) => t.label)
}

// ─── Report ───────────────────────────────────────────────────────────────

/** Days into the month before the month-end estimate shows (earlier it swings too much). */
const PACE_MIN_DAYS = 3
/** An account the rep sold to with no order since then (from anyone) for this long needs a call. */
export const FOLLOW_UP_DAYS = 45
export const REP_PAGE_SIZE = 25

export interface RepStanding {
  name: string
  rank: number
  sales: number
  orders: number
  aov: number
  accounts: number
  newAccounts: number
  dealerSales: number
  /** Sales on orders still waiting for payment. */
  unpaid: number
  prevSales: number | null
  /** Of the team's sales in the period. */
  share: number
  month: { sales: number; projected: number | null; goal: number | null }
  active: boolean
}

interface Tally {
  sales: number
  orders: number
  accounts: Set<string>
  newAccounts: Set<string>
  dealerSales: number
  unpaid: number
}

const blank = (): Tally => ({ sales: 0, orders: 0, accounts: new Set(), newAccounts: new Set(), dealerSales: 0, unpaid: 0 })

const accountKey = (o: OrderLite) => o.customer_shopify_id ?? o.email?.toLowerCase() ?? o.shopify_id

export interface RepAccount {
  key: string
  customerId: string | null
  /** Their company when known, else their name. */
  name: string
  /** The person, when `name` is their company. */
  contact: string | null
  email: string | null
  phone: string | null
  location: string
  isDealer: boolean
  orders: number
  sales: number
  lastOrderAt: string
  isNew: boolean
}

export interface FollowUp {
  key: string
  customerId: string | null
  name: string
  contact: string | null
  email: string | null
  phone: string | null
  location: string
  /** All-time sales through this rep, in the history kept here. */
  repSales: number
  repOrders: number
  /** Their latest order with anyone. */
  lastOrderAt: string
}

export async function getRepReport(opts: { range: PeriodKey; day?: string; type: OrderType; rep: string | null; page: number }) {
  const [orders, items, customers, roster] = await Promise.all([allOrders(), allLineItems(), allCustomers(), getRepRoster()])
  const itemsByOrder = groupItems(items)
  const customerById = new Map(customers.map((c) => [c.shopify_id, c]))
  const names = roster.reps.map((r) => r.name)
  const repsOf = new Map(orders.map((o) => [o.shopify_id, repsOnTags(o.tags, names)]))

  const firstDay = orders.length ? dayKey(orders[orders.length - 1].shopify_created_at) : null
  const w = windowFor(opts.range, firstDay, opts.day)
  const prevW = previousWindow(opts.range, w)
  const comparable = opts.range !== 'all' && firstDay != null && firstDay <= prevW.from
  const monthW = windowFor('mtd', firstDay)

  const live = orders.filter((o) => !o.cancelled_at)
  const typed = live.filter((o) => matchesType(o, opts.type))
  const isNewAccount = (o: OrderLite) => {
    const created = o.customer_shopify_id ? customerById.get(o.customer_shopify_id)?.shopify_created_at : null
    return Boolean(created && inWindow(created, w))
  }

  // One pass for the period, the one before it and the month so far.
  const now = new Map<string, Tally>()
  const before = new Map<string, number>()
  const month = new Map<string, number>()
  let teamSales = 0
  let teamOrders = 0
  let untaggedOrders = 0
  let untaggedSales = 0
  for (const o of typed) {
    const reps = repsOf.get(o.shopify_id)!
    const sale = orderSales(o)
    if (inWindow(o.shopify_created_at, monthW)) for (const r of reps) month.set(r, (month.get(r) ?? 0) + sale)
    if (comparable && inWindow(o.shopify_created_at, prevW)) for (const r of reps) before.set(r, (before.get(r) ?? 0) + sale)
    if (!inWindow(o.shopify_created_at, w)) continue
    if (!reps.length) {
      // Draft orders are the ones a rep builds; web orders are customers checking out themselves.
      if (o.source_name === 'shopify_draft_order') {
        untaggedOrders += 1
        untaggedSales += sale
      }
      continue
    }
    teamSales += sale
    teamOrders += 1
    for (const r of reps) {
      const t = now.get(r) ?? blank()
      t.sales += sale
      t.orders += 1
      t.accounts.add(accountKey(o))
      if (isNewAccount(o)) t.newAccounts.add(accountKey(o))
      if (hasTag(o, 'dealer')) t.dealerSales += sale
      if (UNPAID_FINANCIAL.includes(o.financial_status ?? '')) t.unpaid += sale
      now.set(r, t)
    }
  }

  // Month-end estimate: the month's sales so far at the same daily pace.
  const [my, mm] = monthW.from.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(my, mm, 0)).getUTCDate()
  const elapsed = (Date.now() - Date.parse(dayStartIso(monthW.from))) / 86_400_000
  const project = (sales: number) => (elapsed >= PACE_MIN_DAYS ? (sales / elapsed) * daysInMonth : null)

  const standings: RepStanding[] = roster.reps
    .filter((r) => r.active || now.has(r.name))
    .map((r) => {
      const t = now.get(r.name) ?? blank()
      const mtd = month.get(r.name) ?? 0
      return {
        name: r.name,
        rank: 0,
        sales: t.sales,
        orders: t.orders,
        aov: t.orders ? t.sales / t.orders : 0,
        accounts: t.accounts.size,
        newAccounts: t.newAccounts.size,
        dealerSales: t.dealerSales,
        unpaid: t.unpaid,
        prevSales: comparable ? before.get(r.name) ?? 0 : null,
        share: teamSales ? t.sales / teamSales : 0,
        month: { sales: mtd, projected: project(mtd), goal: r.monthlyGoal },
        active: r.active,
      }
    })
    .sort((a, b) => b.sales - a.sales || b.orders - a.orders || a.name.localeCompare(b.name))
  standings.forEach((s, i) => (s.rank = i + 1))

  const teamMonth = typed.filter((o) => inWindow(o.shopify_created_at, monthW) && repsOf.get(o.shopify_id)!.length).reduce((n, o) => n + orderSales(o), 0)
  const teamGoal = roster.reps.filter((r) => r.active && r.monthlyGoal).reduce((n, r) => n + (r.monthlyGoal ?? 0), 0)

  // Order counts per kind of sale, for the filter (the selected rep's, or the team's).
  const repName = opts.rep ? roster.reps.find((r) => r.name.toLowerCase() === opts.rep!.toLowerCase())?.name ?? null : null
  const scoped = live.filter((o) => inWindow(o.shopify_created_at, w) && (repName ? repsOf.get(o.shopify_id)!.includes(repName) : repsOf.get(o.shopify_id)!.length > 0))
  const typeCounts = Object.fromEntries(ORDER_TYPES.map((t) => [t.key, scoped.filter((o) => matchesType(o, t.key)).length])) as Record<OrderType, number>

  const teamOrdersInWindow = typed.filter((o) => inWindow(o.shopify_created_at, w) && repsOf.get(o.shopify_id)!.length)

  return {
    window: w,
    previousWindow: comparable ? prevW : null,
    month: { from: monthW.from, daysInMonth, elapsed, paceShown: elapsed >= PACE_MIN_DAYS },
    firstDay,
    stored: roster.stored,
    roster: roster.reps,
    standings,
    team: {
      sales: teamSales,
      orders: teamOrders,
      aov: teamOrders ? teamSales / teamOrders : 0,
      prevSales: comparable ? sumPrev(typed, repsOf, prevW) : null,
      month: { sales: teamMonth, projected: project(teamMonth), goal: teamGoal || null },
      untagged: { orders: untaggedOrders, sales: untaggedSales },
      series: seriesFor(teamOrdersInWindow, w, bucketFor(w.days)),
      products: productBreakdown(teamOrdersInWindow, itemsByOrder).slice(0, 8),
    },
    typeCounts,
    bucket: bucketFor(w.days),
    rep: repName ? repDetail(repName) : null,
  }

  function repDetail(name: string) {
    const mine = typed.filter((o) => repsOf.get(o.shopify_id)!.includes(name))
    const current = mine.filter((o) => inWindow(o.shopify_created_at, w))
    const previous = comparable ? mine.filter((o) => inWindow(o.shopify_created_at, prevW)) : null
    const standing = standings.find((s) => s.name === name) ?? null
    const i = standing ? standings.indexOf(standing) : -1

    let units = 0
    for (const o of current) for (const li of itemsByOrder.get(o.shopify_id) ?? []) units += lineUnits(li)

    // Accounts in the period, biggest first.
    const accounts = new Map<string, RepAccount>()
    for (const o of current) {
      const key = accountKey(o)
      const c = o.customer_shopify_id ? customerById.get(o.customer_shopify_id) ?? null : null
      const a = accounts.get(key) ?? accountRow(key, o, c, isNewAccount(o))
      a.orders += 1
      a.sales += orderSales(o)
      if (o.shopify_created_at > a.lastOrderAt) a.lastOrderAt = o.shopify_created_at
      accounts.set(key, a)
    }

    // Everyone they've sold to (any kind of sale) who hasn't ordered since.
    const cutoff = new Date(Date.now() - FOLLOW_UP_DAYS * 86_400_000).toISOString()
    const lastAny = new Map<string, string>()
    for (const o of live) {
      const k = accountKey(o)
      if ((lastAny.get(k) ?? '') < o.shopify_created_at) lastAny.set(k, o.shopify_created_at)
    }
    const theirs = new Map<string, FollowUp>()
    for (const o of live) {
      if (!repsOf.get(o.shopify_id)!.includes(name)) continue
      const key = accountKey(o)
      const c = o.customer_shopify_id ? customerById.get(o.customer_shopify_id) ?? null : null
      const f = theirs.get(key) ?? {
        key,
        customerId: o.customer_shopify_id,
        name: c ? c.company || customerName(c) : o.customer_display_name ?? o.email ?? 'Unknown customer',
        contact: c?.company ? customerName(c) : null,
        email: c?.email ?? o.email,
        phone: c?.phone ?? null,
        location: [o.city, o.province].filter(Boolean).join(', ') || '—',
        repSales: 0,
        repOrders: 0,
        lastOrderAt: [lastAny.get(key) ?? '', c?.last_order_at ?? ''].sort().at(-1)!,
      }
      f.repSales += orderSales(o)
      f.repOrders += 1
      theirs.set(key, f)
    }
    const followUps = [...theirs.values()].filter((f) => f.lastOrderAt && f.lastOrderAt < cutoff).sort((a, b) => b.repSales - a.repSales)

    const page = Math.max(1, opts.page)
    const sum = (list: OrderLite[]) => list.reduce((n, o) => n + orderSales(o), 0)
    const prevSales = previous ? sum(previous) : null
    const sales = sum(current)

    return {
      name,
      standing,
      above: i > 0 ? standings[i - 1] : null,
      below: i >= 0 && i < standings.length - 1 ? standings[i + 1] : null,
      totals: {
        sales,
        orders: current.length,
        aov: current.length ? sales / current.length : 0,
        units,
        accounts: accounts.size,
        newAccounts: [...accounts.values()].filter((a) => a.isNew).length,
        unpaid: current.filter((o) => UNPAID_FINANCIAL.includes(o.financial_status ?? '')).reduce((n, o) => n + orderSales(o), 0),
        unpaidOrders: current.filter((o) => UNPAID_FINANCIAL.includes(o.financial_status ?? '')).length,
        toShip: current.filter(isOpenOrder).length,
        dealerSales: current.filter((o) => hasTag(o, 'dealer')).reduce((n, o) => n + orderSales(o), 0),
      },
      previous: previous
        ? {
            sales: prevSales!,
            orders: previous.length,
            aov: previous.length ? prevSales! / previous.length : 0,
            accounts: new Set(previous.map(accountKey)).size,
          }
        : null,
      series: seriesFor(current, w, bucketFor(w.days)),
      products: productBreakdown(current, itemsByOrder).slice(0, 8),
      states: breakdownBy(current, (o) => o.province ?? '—', (k) => k).slice(0, 8),
      accounts: [...accounts.values()].sort((a, b) => b.sales - a.sales),
      followUps: followUps.slice(0, 12),
      followUpCount: followUps.length,
      orders: {
        rows: current.slice((page - 1) * REP_PAGE_SIZE, page * REP_PAGE_SIZE).map((o) => {
          const lis = itemsByOrder.get(o.shopify_id) ?? []
          return { ...o, items: itemSummary(lis), units: lis.reduce((n, li) => n + lineUnits(li), 0), types: orderTypes(o) }
        }),
        total: current.length,
        page,
        pages: Math.max(1, Math.ceil(current.length / REP_PAGE_SIZE)),
      },
    }
  }
}

function sumPrev(orders: OrderLite[], repsOf: Map<string, string[]>, w: { from: string; to: string }) {
  return orders.filter((o) => repsOf.get(o.shopify_id)!.length && inWindow(o.shopify_created_at, w)).reduce((n, o) => n + orderSales(o), 0)
}

function accountRow(key: string, o: OrderLite, c: CustomerLite | null, isNew: boolean): RepAccount {
  return {
    key,
    customerId: o.customer_shopify_id,
    name: c ? c.company || customerName(c) : o.customer_display_name ?? o.email ?? 'Unknown customer',
    contact: c?.company ? customerName(c) : null,
    email: c?.email ?? o.email,
    phone: c?.phone ?? null,
    location: c ? [c.city, c.province].filter(Boolean).join(', ') || '—' : [o.city, o.province].filter(Boolean).join(', ') || '—',
    isDealer: Boolean(c?.is_dealer) || hasTag(o, 'dealer'),
    orders: 0,
    sales: 0,
    lastOrderAt: o.shopify_created_at,
    isNew,
  }
}

export type RepReport = Awaited<ReturnType<typeof getRepReport>>
