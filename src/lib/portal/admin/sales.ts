import { createAdminClient } from '@/lib/supabase/admin'
import { fetchAllRows, memo } from './cache'
import { dayKey, monthKey } from './format'

/**
 * Sales data for the Crazy Seal Admin, read from the Supabase copy of Shopify
 * (shopify_orders / shopify_order_line_items / shopify_customers). The copy
 * keeps every order it has ever seen, so history keeps growing past the 60
 * days Shopify's API exposes without the read_all_orders scope.
 *
 * "Sales" = order total after refunds and edits (Shopify's current total,
 * including tax and shipping), excluding test and cancelled orders.
 */

// ─── Orders ───────────────────────────────────────────────────────────────

export interface OrderLite {
  shopify_id: string
  legacy_resource_id: string | null
  name: string
  email: string | null
  customer_shopify_id: string | null
  customer_display_name: string | null
  financial_status: string | null
  fulfillment_status: string | null
  cancelled_at: string | null
  total_price: number | null
  current_total_price: number | null
  subtotal_price: number | null
  total_tax: number | null
  total_discounts: number | null
  total_shipping: number | null
  total_refunded: number | null
  source_name: string | null
  province: string | null
  city: string | null
  discount_codes: string[]
  /** Order tags. Sales reps tag dealer orders "Dealer" plus their own name. */
  tags: string[]
  shopify_created_at: string
}

const ORDER_LITE_COLS =
  'shopify_id, legacy_resource_id, name, email, customer_shopify_id, customer_display_name, financial_status, fulfillment_status, cancelled_at, total_price, current_total_price, subtotal_price, total_tax, total_discounts, total_shipping, total_refunded, source_name, province:shipping_address->>provinceCode, city:shipping_address->>city, discount_codes, tags, shopify_created_at'

export function orderSales(o: Pick<OrderLite, 'cancelled_at' | 'current_total_price' | 'total_price'>): number {
  if (o.cancelled_at) return 0
  return Number(o.current_total_price ?? o.total_price ?? 0)
}

export function allOrders(): Promise<OrderLite[]> {
  return memo('orders', 60_000, async () => {
    const supabase = createAdminClient()
    const rows = await fetchAllRows<OrderLite>((from, to) =>
      supabase
        .from('shopify_orders')
        .select(ORDER_LITE_COLS)
        .is('deleted_at', null)
        .eq('test', false)
        .not('shopify_created_at', 'is', null)
        .order('shopify_created_at', { ascending: false })
        .order('id')
        .range(from, to)
        .returns<OrderLite[]>(),
    )
    return rows.map((o) => ({ ...o, discount_codes: o.discount_codes ?? [], tags: o.tags ?? [] }))
  })
}

export interface LineItemLite {
  order_shopify_id: string
  product_shopify_id: string | null
  variant_shopify_id: string | null
  product_title: string | null
  title: string | null
  variant_title: string | null
  sku: string | null
  quantity: number | null
  current_quantity: number | null
  discounted_total: number | null
}

export function allLineItems(): Promise<LineItemLite[]> {
  return memo('line-items', 60_000, async () => {
    const supabase = createAdminClient()
    return fetchAllRows<LineItemLite>((from, to) =>
      supabase
        .from('shopify_order_line_items')
        .select('order_shopify_id, product_shopify_id, variant_shopify_id, product_title, title, variant_title, sku, quantity, current_quantity, discounted_total')
        .order('id')
        .range(from, to)
        .returns<LineItemLite[]>(),
    )
  })
}

/** Units still on the order after refunds/edits. */
export function lineUnits(li: LineItemLite): number {
  return Number(li.current_quantity ?? li.quantity ?? 0)
}

/** Line revenue scaled down when units were refunded off the order. */
export function lineSales(li: LineItemLite): number {
  const total = Number(li.discounted_total ?? 0)
  const q = Number(li.quantity ?? 0)
  if (!q) return 0
  return (total * lineUnits(li)) / q
}

export const CHANNEL_LABELS: Record<string, string> = {
  web: 'Online store',
  shopify_draft_order: 'Draft orders (phone & specialists)',
  pos: 'Point of sale',
}

export function channelLabel(source: string | null): string {
  if (!source) return 'Other'
  return CHANNEL_LABELS[source] ?? (/^\d+$/.test(source) ? 'Sales channel app' : source)
}

// ─── Date ranges ──────────────────────────────────────────────────────────

export const RANGES = [
  { key: '7d', label: '7 days', days: 7 },
  { key: '30d', label: '30 days', days: 30 },
  { key: '90d', label: '90 days', days: 90 },
  { key: 'ytd', label: 'Year to date', days: null },
  { key: 'all', label: 'All history', days: null },
] as const

export type RangeKey = (typeof RANGES)[number]['key']

export function parseRange(raw: string | string[] | undefined, fallback: RangeKey = '30d'): RangeKey {
  const v = Array.isArray(raw) ? raw[0] : raw
  return RANGES.some((r) => r.key === v) ? (v as RangeKey) : fallback
}

interface Window {
  from: string // YYYY-MM-DD inclusive
  to: string // YYYY-MM-DD inclusive
  days: number
}

function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number)
  const [y2, m2, d2] = b.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}

function windowFor(range: RangeKey, firstDay: string | null): Window {
  const to = dayKey(new Date())
  const preset = RANGES.find((r) => r.key === range)
  let from: string
  if (preset?.days) from = shiftDay(to, -(preset.days - 1))
  else if (range === 'ytd') from = `${to.slice(0, 4)}-01-01`
  else from = firstDay ?? to
  return { from, to, days: daysBetween(from, to) + 1 }
}

function inWindow(iso: string, w: { from: string; to: string }) {
  const k = dayKey(iso)
  return k >= w.from && k <= w.to
}

// ─── Overview ─────────────────────────────────────────────────────────────

export interface Totals {
  sales: number
  orders: number
  aov: number
  units: number
  refunds: number
  discounts: number
  shipping: number
  tax: number
  buyers: number
}

export interface SeriesPoint {
  key: string
  start: string
  sales: number
  orders: number
}

export interface Breakdown {
  key: string
  label: string
  sales: number
  orders: number
  units?: number
  href?: string
}

function totalsFor(orders: OrderLite[], itemsByOrder: Map<string, LineItemLite[]>): Totals {
  let sales = 0
  let units = 0
  let refunds = 0
  let discounts = 0
  let shipping = 0
  let tax = 0
  let counted = 0
  const buyers = new Set<string>()
  for (const o of orders) {
    if (o.cancelled_at) continue
    counted++
    sales += orderSales(o)
    refunds += Number(o.total_refunded ?? 0)
    discounts += Number(o.total_discounts ?? 0)
    shipping += Number(o.total_shipping ?? 0)
    tax += Number(o.total_tax ?? 0)
    buyers.add(o.customer_shopify_id ?? o.email ?? o.shopify_id)
    for (const li of itemsByOrder.get(o.shopify_id) ?? []) units += lineUnits(li)
  }
  return { sales, orders: counted, aov: counted ? sales / counted : 0, units, refunds, discounts, shipping, tax, buyers: buyers.size }
}

function groupItems(items: LineItemLite[]) {
  const map = new Map<string, LineItemLite[]>()
  for (const li of items) {
    const list = map.get(li.order_shopify_id)
    if (list) list.push(li)
    else map.set(li.order_shopify_id, [li])
  }
  return map
}

export type Bucket = 'day' | 'week' | 'month'

function bucketKey(day: string, bucket: Bucket): string {
  if (bucket === 'day') return day
  if (bucket === 'month') return day.slice(0, 7)
  const [y, m, d] = day.split('-').map(Number)
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7 // Monday = 0
  return shiftDay(day, -dow)
}

function buildSeries(orders: OrderLite[], w: Window, bucket: Bucket): SeriesPoint[] {
  const points = new Map<string, SeriesPoint>()
  // zero-fill every bucket in the window
  for (let day = w.from; day <= w.to; day = shiftDay(day, 1)) {
    const k = bucketKey(day, bucket)
    if (!points.has(k)) points.set(k, { key: k, start: bucket === 'month' ? `${k}-01` : k, sales: 0, orders: 0 })
  }
  for (const o of orders) {
    if (o.cancelled_at) continue
    const p = points.get(bucketKey(dayKey(o.shopify_created_at), bucket))
    if (!p) continue
    p.sales += orderSales(o)
    p.orders += 1
  }
  return [...points.values()].sort((a, b) => a.key.localeCompare(b.key))
}

function productBreakdown(orders: OrderLite[], itemsByOrder: Map<string, LineItemLite[]>): Breakdown[] {
  const map = new Map<string, Breakdown & { orderIds: Set<string> }>()
  for (const o of orders) {
    if (o.cancelled_at) continue
    for (const li of itemsByOrder.get(o.shopify_id) ?? []) {
      const key = li.product_shopify_id ?? `title:${li.title ?? 'Custom item'}`
      const row = map.get(key) ?? {
        key,
        label: li.product_title ?? li.title ?? 'Custom item',
        sales: 0,
        orders: 0,
        units: 0,
        orderIds: new Set<string>(),
        href: li.product_shopify_id ? `/portal/admin/products/${li.product_shopify_id.split('/').pop()}/` : undefined,
      }
      row.sales += lineSales(li)
      row.units = (row.units ?? 0) + lineUnits(li)
      row.orderIds.add(o.shopify_id)
      map.set(key, row)
    }
  }
  return [...map.values()]
    .map(({ orderIds, ...r }) => ({ ...r, orders: orderIds.size }))
    .sort((a, b) => b.sales - a.sales)
}

function breakdownBy(orders: OrderLite[], keyOf: (o: OrderLite) => string, labelOf: (k: string) => string): Breakdown[] {
  const map = new Map<string, Breakdown>()
  for (const o of orders) {
    if (o.cancelled_at) continue
    const key = keyOf(o)
    const row = map.get(key) ?? { key, label: labelOf(key), sales: 0, orders: 0 }
    row.sales += orderSales(o)
    row.orders += 1
    map.set(key, row)
  }
  return [...map.values()].sort((a, b) => b.sales - a.sales)
}

export const OPEN_FULFILLMENT = ['UNFULFILLED', 'PARTIALLY_FULFILLED', 'ON_HOLD', 'IN_PROGRESS', 'SCHEDULED', 'PENDING_FULFILLMENT', 'OPEN']
export const UNPAID_FINANCIAL = ['PENDING', 'AUTHORIZED', 'PARTIALLY_PAID', 'EXPIRED']

export function isOpenOrder(o: OrderLite) {
  return !o.cancelled_at && OPEN_FULFILLMENT.includes(o.fulfillment_status ?? '')
}

export interface Coverage {
  first: string | null
  last: string | null
  orders: number
}

export async function getCoverage(): Promise<Coverage> {
  const orders = await allOrders()
  return {
    first: orders.at(-1)?.shopify_created_at ?? null,
    last: orders[0]?.shopify_created_at ?? null,
    orders: orders.length,
  }
}

export async function getSalesOverview(range: RangeKey) {
  const [orders, items] = await Promise.all([allOrders(), allLineItems()])
  const itemsByOrder = groupItems(items)
  const firstDay = orders.length ? dayKey(orders[orders.length - 1].shopify_created_at) : null
  const w = windowFor(range, firstDay)
  const current = orders.filter((o) => inWindow(o.shopify_created_at, w))

  // Same-length window right before this one, only when the copy covers it.
  const prevW = { from: shiftDay(w.from, -w.days), to: shiftDay(w.from, -1), days: w.days }
  const comparable = range !== 'all' && firstDay != null && firstDay <= prevW.from
  const previous = comparable ? totalsFor(orders.filter((o) => inWindow(o.shopify_created_at, prevW)), itemsByOrder) : null

  const bucket: Bucket = w.days <= 92 ? 'day' : w.days <= 400 ? 'week' : 'month'
  const open = orders.filter(isOpenOrder)

  return {
    window: w,
    bucket,
    coverage: { first: orders.at(-1)?.shopify_created_at ?? null, last: orders[0]?.shopify_created_at ?? null, orders: orders.length },
    totals: totalsFor(current, itemsByOrder),
    previous,
    series: buildSeries(current, w, bucket),
    products: productBreakdown(current, itemsByOrder),
    channels: breakdownBy(current, (o) => o.source_name ?? 'other', (k) => channelLabel(k === 'other' ? null : k)),
    states: breakdownBy(current, (o) => o.province ?? '—', (k) => k),
    discountCodes: breakdownBy(
      current.filter((o) => o.discount_codes.length),
      (o) => o.discount_codes[0].toUpperCase(),
      (k) => k,
    ),
    recent: orders.slice(0, 8).map((o) => ({ ...o, items: itemSummary(itemsByOrder.get(o.shopify_id) ?? []) })),
    open: open.slice(0, 6).map((o) => ({ ...o, items: itemSummary(itemsByOrder.get(o.shopify_id) ?? []) })),
    openCount: open.length,
  }
}

export function itemSummary(items: LineItemLite[]): string {
  if (!items.length) return '—'
  const first = items[0].product_title ?? items[0].title ?? 'Item'
  const more = items.length - 1
  return more > 0 ? `${first} +${more}` : first
}

// ─── Monthly history ──────────────────────────────────────────────────────

export async function getMonthlyHistory() {
  const [orders, items] = await Promise.all([allOrders(), allLineItems()])
  const itemsByOrder = groupItems(items)
  const months = new Map<string, { key: string; sales: number; orders: number; units: number; buyers: Set<string>; refunds: number; discounts: number }>()
  for (const o of orders) {
    if (o.cancelled_at) continue
    const k = monthKey(o.shopify_created_at)
    const m = months.get(k) ?? { key: k, sales: 0, orders: 0, units: 0, buyers: new Set<string>(), refunds: 0, discounts: 0 }
    m.sales += orderSales(o)
    m.orders += 1
    m.refunds += Number(o.total_refunded ?? 0)
    m.discounts += Number(o.total_discounts ?? 0)
    m.buyers.add(o.customer_shopify_id ?? o.email ?? o.shopify_id)
    for (const li of itemsByOrder.get(o.shopify_id) ?? []) m.units += lineUnits(li)
    months.set(k, m)
  }
  return [...months.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map(({ buyers, ...m }) => ({ ...m, buyers: buyers.size, aov: m.orders ? m.sales / m.orders : 0 }))
}

// ─── Orders list ──────────────────────────────────────────────────────────

export const ORDER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Unfulfilled' },
  { key: 'unpaid', label: 'Unpaid' },
  { key: 'refunded', label: 'Refunded' },
  { key: 'draft', label: 'Draft orders' },
  { key: 'web', label: 'Online store' },
] as const

export type OrderTab = (typeof ORDER_TABS)[number]['key']

function matchesTab(o: OrderLite, tab: OrderTab) {
  switch (tab) {
    case 'open':
      return isOpenOrder(o)
    case 'unpaid':
      return !o.cancelled_at && UNPAID_FINANCIAL.includes(o.financial_status ?? '')
    case 'refunded':
      return Number(o.total_refunded ?? 0) > 0
    case 'draft':
      return o.source_name === 'shopify_draft_order'
    case 'web':
      return o.source_name === 'web'
    default:
      return true
  }
}

export const PAGE_SIZE = 50

export async function getOrdersPage(opts: { q?: string; tab?: OrderTab; range?: RangeKey; page?: number }) {
  const [orders, items] = await Promise.all([allOrders(), allLineItems()])
  const itemsByOrder = groupItems(items)
  const firstDay = orders.length ? dayKey(orders[orders.length - 1].shopify_created_at) : null
  const w = windowFor(opts.range ?? 'all', firstDay)
  const q = (opts.q ?? '').trim().toLowerCase().replace(/^#/, '')

  const inRange = orders.filter((o) => inWindow(o.shopify_created_at, w))
  const searched = q
    ? inRange.filter((o) =>
        [o.name.replace('#', ''), o.email, o.customer_display_name, o.city, o.province, ...(itemsByOrder.get(o.shopify_id) ?? []).map((li) => li.title)]
          .some((v) => v?.toLowerCase().includes(q)),
      )
    : inRange

  const counts = Object.fromEntries(ORDER_TABS.map((t) => [t.key, searched.filter((o) => matchesTab(o, t.key)).length])) as Record<OrderTab, number>
  const filtered = searched.filter((o) => matchesTab(o, opts.tab ?? 'all'))
  const page = Math.max(1, opts.page ?? 1)
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((o) => {
    const lis = itemsByOrder.get(o.shopify_id) ?? []
    return { ...o, items: itemSummary(lis), units: lis.reduce((n, li) => n + lineUnits(li), 0) }
  })

  return {
    rows,
    total: filtered.length,
    counts,
    page,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    sum: filtered.reduce((n, o) => n + orderSales(o), 0),
  }
}

// ─── Customers ────────────────────────────────────────────────────────────

export interface CustomerLite {
  shopify_id: string
  legacy_resource_id: string | null
  display_name: string | null
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  number_of_orders: number
  amount_spent: number | null
  is_dealer: boolean
  is_commercial: boolean
  tags: string[]
  email_marketing_state: string | null
  province: string | null
  city: string | null
  company: string | null
  last_order_at: string | null
  shopify_created_at: string | null
  shopify_updated_at: string | null
}

export function allCustomers(): Promise<CustomerLite[]> {
  return memo('customers', 5 * 60_000, async () => {
    const supabase = createAdminClient()
    const rows = await fetchAllRows<CustomerLite>((from, to) =>
      supabase
        .from('shopify_customers')
        .select(
          'shopify_id, legacy_resource_id, display_name, first_name, last_name, email, phone, number_of_orders, amount_spent, is_dealer, is_commercial, tags, email_marketing_state, province:default_address->>provinceCode, city:default_address->>city, company:default_address->>company, last_order_at:payload->lastOrder->>createdAt, shopify_created_at, shopify_updated_at',
        )
        .is('deleted_at', null)
        .order('id')
        .range(from, to)
        .returns<CustomerLite[]>(),
    )
    return rows.map((c) => ({ ...c, tags: c.tags ?? [], amount_spent: c.amount_spent == null ? null : Number(c.amount_spent) }))
  })
}

export function customerName(c: Pick<CustomerLite, 'display_name' | 'email' | 'first_name' | 'last_name'>): string {
  const full = [c.first_name, c.last_name].filter(Boolean).join(' ')
  return c.display_name?.trim() || full || c.email || 'Unnamed customer'
}

export const CUSTOMER_SEGMENTS = [
  { key: 'all', label: 'All' },
  { key: 'buyers', label: 'Purchased' },
  { key: 'repeat', label: 'Repeat' },
  { key: 'dealers', label: 'Dealers' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'subscribed', label: 'Email subscribers' },
  { key: 'new', label: 'New (30 days)' },
] as const

export type CustomerSegment = (typeof CUSTOMER_SEGMENTS)[number]['key']

export const CUSTOMER_SORTS = [
  { key: 'spent', label: 'Lifetime spend' },
  { key: 'orders', label: 'Orders' },
  { key: 'recent', label: 'Last order' },
  { key: 'newest', label: 'Newest' },
] as const

export type CustomerSort = (typeof CUSTOMER_SORTS)[number]['key']

function inSegment(c: CustomerLite, seg: CustomerSegment, since30: string) {
  switch (seg) {
    case 'buyers':
      return c.number_of_orders > 0
    case 'repeat':
      return c.number_of_orders > 1
    case 'dealers':
      return c.is_dealer
    case 'commercial':
      return c.is_commercial
    case 'subscribed':
      return c.email_marketing_state === 'SUBSCRIBED'
    case 'new':
      return (c.shopify_created_at ?? '') >= since30
    default:
      return true
  }
}

export async function getCustomersPage(opts: { q?: string; segment?: CustomerSegment; sort?: CustomerSort; page?: number }) {
  const customers = await allCustomers()
  const q = (opts.q ?? '').trim().toLowerCase()
  const since30 = new Date(Date.now() - 30 * 86_400_000).toISOString()

  const searched = q
    ? customers.filter((c) =>
        [customerName(c), c.email, c.phone, c.company, c.city, c.province, ...c.tags].some((v) => v?.toLowerCase().includes(q)),
      )
    : customers

  const counts = Object.fromEntries(
    CUSTOMER_SEGMENTS.map((s) => [s.key, searched.filter((c) => inSegment(c, s.key, since30)).length]),
  ) as Record<CustomerSegment, number>
  const filtered = searched.filter((c) => inSegment(c, opts.segment ?? 'all', since30))

  const sort = opts.sort ?? 'spent'
  filtered.sort((a, b) => {
    if (sort === 'orders') return b.number_of_orders - a.number_of_orders || (b.amount_spent ?? 0) - (a.amount_spent ?? 0)
    if (sort === 'recent') return (b.last_order_at ?? '').localeCompare(a.last_order_at ?? '')
    if (sort === 'newest') return (b.shopify_created_at ?? '').localeCompare(a.shopify_created_at ?? '')
    return (b.amount_spent ?? 0) - (a.amount_spent ?? 0)
  })

  const page = Math.max(1, opts.page ?? 1)
  return {
    rows: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    counts,
    page,
    pages: Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    spent: filtered.reduce((n, c) => n + (c.amount_spent ?? 0), 0),
  }
}

export async function getCustomerInsights() {
  const customers = await allCustomers()
  const buyers = customers.filter((c) => c.number_of_orders > 0)
  const repeat = buyers.filter((c) => c.number_of_orders > 1)
  const lifetime = buyers.reduce((n, c) => n + (c.amount_spent ?? 0), 0)
  const now = new Date()

  // New customer accounts per month, last 24 months (complete history from Shopify)
  const months: { key: string; customers: number; buyers: number }[] = []
  for (let i = 23; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 15))
    months.push({ key: d.toISOString().slice(0, 7), customers: 0, buyers: 0 })
  }
  const byMonth = new Map(months.map((m) => [m.key, m]))
  const byYear = new Map<string, { key: string; customers: number; buyers: number; spent: number }>()
  for (const c of customers) {
    if (!c.shopify_created_at) continue
    const k = monthKey(c.shopify_created_at)
    const m = byMonth.get(k)
    if (m) {
      m.customers += 1
      if (c.number_of_orders > 0) m.buyers += 1
    }
    const y = k.slice(0, 4)
    const yr = byYear.get(y) ?? { key: y, customers: 0, buyers: 0, spent: 0 }
    yr.customers += 1
    if (c.number_of_orders > 0) yr.buyers += 1
    yr.spent += c.amount_spent ?? 0
    byYear.set(y, yr)
  }

  const LTV_BUCKETS = [
    { label: 'Under $250', max: 250 },
    { label: '$250 – $1K', max: 1000 },
    { label: '$1K – $2.5K', max: 2500 },
    { label: '$2.5K – $5K', max: 5000 },
    { label: '$5K – $10K', max: 10000 },
    { label: '$10K+', max: Infinity },
  ]
  const ltv = LTV_BUCKETS.map((b) => ({ key: b.label, label: b.label, customers: 0, spent: 0 }))
  for (const c of buyers) {
    const v = c.amount_spent ?? 0
    const i = LTV_BUCKETS.findIndex((b) => v < b.max)
    ltv[i].customers += 1
    ltv[i].spent += v
  }

  const states = new Map<string, { key: string; label: string; customers: number; spent: number }>()
  for (const c of buyers) {
    const k = c.province ?? '—'
    const s = states.get(k) ?? { key: k, label: k, customers: 0, spent: 0 }
    s.customers += 1
    s.spent += c.amount_spent ?? 0
    states.set(k, s)
  }

  return {
    total: customers.length,
    buyers: buyers.length,
    repeat: repeat.length,
    repeatRate: buyers.length ? repeat.length / buyers.length : 0,
    lifetime,
    avgLtv: buyers.length ? lifetime / buyers.length : 0,
    subscribed: customers.filter((c) => c.email_marketing_state === 'SUBSCRIBED').length,
    dealers: customers.filter((c) => c.is_dealer).length,
    acquisition: months,
    years: [...byYear.values()].sort((a, b) => a.key.localeCompare(b.key)),
    ltv,
    states: [...states.values()].sort((a, b) => b.spent - a.spent),
    top: [...buyers].sort((a, b) => (b.amount_spent ?? 0) - (a.amount_spent ?? 0)).slice(0, 10),
  }
}
