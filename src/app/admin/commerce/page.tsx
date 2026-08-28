'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import { Container, Heading, Text } from '@/lib/design-system'
import { ChevronDown, ChevronUp, Loader2, RefreshCw, Search } from 'lucide-react'

type Tab = 'customers' | 'orders'

interface SyncState {
  resource: string
  records_synced: number
  last_completed_at: string | null
  last_error: string | null
  updated_at: string
}

interface CustomerRow {
  shopify_id: string
  email: string | null
  phone: string | null
  display_name: string | null
  tags: string[] | null
  state: string | null
  number_of_orders: number
  amount_spent: number | string | null
  amount_spent_currency: string | null
  is_dealer: boolean
  is_commercial: boolean
  email_marketing_state: string | null
  default_address: { city?: string | null; provinceCode?: string | null } | null
  shopify_created_at: string | null
  note: string | null
}

interface OrderRow {
  shopify_id: string
  name: string
  email: string | null
  customer_display_name: string | null
  financial_status: string | null
  fulfillment_status: string | null
  currency: string | null
  total_price: number | string | null
  tags: string[] | null
  source_name: string | null
  shopify_created_at: string | null
  shipping_address: { city?: string | null; provinceCode?: string | null } | null
  discount_codes: string[] | null
  shopify_order_line_items?: Array<{
    title: string | null
    sku: string | null
    quantity: number | null
    variant_title: string | null
    discounted_total: number | string | null
  }>
}

function money(amount: number | string | null | undefined, currency?: string | null) {
  if (amount == null || amount === '') return '—'
  const n = Number(amount)
  if (!Number.isFinite(n)) return String(amount)
  return `${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ''}`
}

function when(iso: string | null | undefined) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function AdminCommercePage() {
  const [tab, setTab] = useState<Tab>('customers')
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [counts, setCounts] = useState({ customers: 0, orders: 0 })
  const [state, setState] = useState<SyncState[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const loadStatus = useCallback(async () => {
    const res = await fetch('/api/admin/shopify/sync/')
    const json = await res.json()
    if (json.counts) setCounts(json.counts)
    if (json.state) setState(json.state)
    return json
  }, [])

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const path = tab === 'customers'
        ? `/api/admin/shopify/customers/?q=${encodeURIComponent(applied)}`
        : `/api/admin/shopify/orders/?q=${encodeURIComponent(applied)}`
      const res = await fetch(path)
      const json = await res.json()
      if (!res.ok) setError(json.error || 'Failed to load')
      if (tab === 'customers') setCustomers(json.customers || [])
      else setOrders(json.orders || [])
    } finally {
      setLoading(false)
    }
  }, [tab, applied])

  useEffect(() => {
    const timer = setTimeout(() => setApplied(q), 400)
    return () => clearTimeout(timer)
  }, [q])

  useEffect(() => { loadStatus() }, [loadStatus])
  useEffect(() => { loadRows() }, [loadRows])

  async function runSync(reset: boolean) {
    setSyncing(true)
    setMessage(null)
    setError(null)
    try {
      let hasMore = true
      let loops = 0
      while (hasMore && loops < 40) {
        const res = await fetch('/api/admin/shopify/sync/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resource: 'all', reset: reset && loops === 0, maxPages: 12 }),
        })
        const json = await res.json()
        if (!res.ok) {
          setError(json.error || 'Sync failed')
          break
        }
        if (json.counts) setCounts(json.counts)
        if (json.state) setState(json.state)
        hasMore = Boolean(json.hasMore)
        const upserted = (json.resources || []).map((r: { resource: string; upserted: number; pages: number; error?: string | null }) =>
          `${r.resource}: ${r.upserted} rows${r.error ? ` (${r.error})` : ''}`,
        ).join(' · ')
        setMessage(hasMore ? `Syncing… ${upserted}` : `Caught up. ${upserted}`)
        if ((json.resources || []).some((r: { error?: string | null }) => r.error)) break
        loops += 1
      }
      await loadRows()
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Shopify customers &amp; orders</Heading>
        <Text className="text-gray-500 mb-6">
          Local copy of Shopify customer and order data. Sync pulls the full Admin GraphQL record into these tables.
        </Text>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">{counts.customers}</span> customers
              {' · '}
              <span className="font-semibold text-gray-900">{counts.orders}</span> orders
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {state.length
                ? state.map((s) => (
                  `${s.resource}: ${s.last_completed_at ? `done ${when(s.last_completed_at)}` : s.last_error ? s.last_error : 'in progress'} (${s.records_synced} synced)`
                )).join(' · ')
                : 'No sync yet'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={syncing}
              onClick={() => runSync(false)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#003365] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {syncing ? 'Syncing…' : 'Sync from Shopify'}
            </button>
            <button
              type="button"
              disabled={syncing}
              onClick={() => runSync(true)}
              className="px-4 py-2 border border-gray-200 text-sm font-semibold rounded-lg text-gray-700 disabled:opacity-50"
            >
              Full re-sync
            </button>
          </div>
        </div>

        {message && <p className="mb-4 text-sm bg-blue-50 text-[#003365] px-4 py-2 rounded-lg">{message}</p>}
        {error && <p className="mb-4 text-sm bg-amber-50 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex gap-2">
            {([
              ['customers', `Customers (${counts.customers})`],
              ['orders', `Orders (${counts.orders})`],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => { setTab(id); setExpanded(null); setLoading(true) }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  tab === id ? 'bg-[#003365] text-white' : 'bg-white border border-gray-200 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={tab === 'customers' ? 'Search name, email, phone' : 'Search order #, email, PO'}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {loading && (
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        )}

        {!loading && tab === 'customers' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Orders</th>
                  <th className="px-4 py-2">Spent</th>
                  <th className="px-4 py-2">Tags</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <Fragment key={c.shopify_id}>
                    <tr className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{c.display_name || '—'}</p>
                        <p className="text-xs text-gray-500">{c.email || 'No email'}</p>
                        {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
                      </td>
                      <td className="px-4 py-3">{c.number_of_orders}</td>
                      <td className="px-4 py-3">{money(c.amount_spent, c.amount_spent_currency)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {(c.is_dealer || c.is_commercial) && (
                          <span className="mr-1 text-[#003365] font-semibold">
                            {[c.is_dealer && 'Pro', c.is_commercial && 'Commercial'].filter(Boolean).join(' · ')}
                          </span>
                        )}
                        {(c.tags || []).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {[c.default_address?.city, c.default_address?.provinceCode].filter(Boolean).join(', ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === c.shopify_id ? null : c.shopify_id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          {expanded === c.shopify_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expanded === c.shopify_id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50 text-xs text-gray-600">
                          <p>State: {c.state || '—'} · Marketing: {c.email_marketing_state || '—'} · Created {when(c.shopify_created_at)}</p>
                          {c.note && <p className="mt-1">Note: {c.note}</p>}
                          <p className="mt-1 font-mono text-[10px] text-gray-400">{c.shopify_id}</p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {!customers.length && <p className="px-4 py-6 text-sm text-gray-400">No customers yet. Run a Shopify sync.</p>}
          </div>
        )}

        {!loading && tab === 'orders' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Order</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Payment</th>
                  <th className="px-4 py-2">Fulfillment</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => (
                  <Fragment key={o.shopify_id}>
                    <tr className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{o.name}</p>
                        <p className="text-xs text-gray-400">{when(o.shopify_created_at)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p>{o.customer_display_name || '—'}</p>
                        <p className="text-xs text-gray-500">{o.email}</p>
                      </td>
                      <td className="px-4 py-3">{money(o.total_price, o.currency)}</td>
                      <td className="px-4 py-3 text-xs">{o.financial_status || '—'}</td>
                      <td className="px-4 py-3 text-xs">{o.fulfillment_status || '—'}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === o.shopify_id ? null : o.shopify_id)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          {expanded === o.shopify_id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                    {expanded === o.shopify_id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50 text-xs text-gray-600">
                          <p>
                            {[o.shipping_address?.city, o.shipping_address?.provinceCode].filter(Boolean).join(', ') || 'No shipping address'}
                            {o.source_name ? ` · ${o.source_name}` : ''}
                            {(o.discount_codes || []).length ? ` · Codes: ${o.discount_codes?.join(', ')}` : ''}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {(o.shopify_order_line_items || []).map((li, i) => (
                              <li key={`${o.shopify_id}-${i}`}>
                                {li.quantity}× {li.title}{li.variant_title ? ` (${li.variant_title})` : ''}
                                {li.sku ? ` · ${li.sku}` : ''}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-1 font-mono text-[10px] text-gray-400">{o.shopify_id}</p>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            {!orders.length && <p className="px-4 py-6 text-sm text-gray-400">No orders yet. Run a Shopify sync.</p>}
          </div>
        )}
      </Container>
    </div>
  )
}
