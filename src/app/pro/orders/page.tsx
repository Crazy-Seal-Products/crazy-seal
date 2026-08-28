'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

interface OrderRow {
  id: string
  name: string
  createdAt: string
  fulfillmentStatus: string | null
  total: string | null
  currency: string | null
  lineItems: Array<{ title: string; quantity: number; variantId: string | null }>
  hasWarranty: boolean
  certificatePath: string | null
}

export default function ProOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/pro/orders/')
      .then(async (res) => {
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || json.shopifyError || 'Failed to load orders')
        setOrders(json.orders || [])
        if (json.shopifyError) setError(json.shopifyError)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function reorder(order: OrderRow) {
    const items = order.lineItems
      .filter((li) => li.variantId)
      .map((li) => ({ variantId: li.variantId as string, quantity: li.quantity }))
    if (!items.length) return
    setReordering(order.id)
    try {
      const res = await fetch('/api/store/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else setError('Could not start checkout for that kit.')
    } finally {
      setReordering(null)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#003365]">Your orders</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">Shopify orders for this account. File a warranty without retyping the order number.</p>

      {error && <p className="mb-4 text-sm bg-amber-50 text-amber-800 px-4 py-3 rounded-xl">{error}</p>}
      {loading && <p className="text-sm text-gray-400">Loading orders…</p>}

      {!loading && orders.length === 0 && !error && (
        <p className="text-sm text-gray-500">No orders found for this email yet.</p>
      )}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-[#003365]">{o.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString()}
                  {o.fulfillmentStatus ? ` · ${o.fulfillmentStatus}` : ''}
                  {o.total ? ` · $${Number(o.total).toFixed(2)} ${o.currency || ''}` : ''}
                </p>
                <ul className="mt-2 text-sm text-gray-700 space-y-0.5">
                  {o.lineItems.slice(0, 4).map((li, i) => (
                    <li key={i}>{li.quantity}× {li.title}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                {o.hasWarranty ? (
                  o.certificatePath && (
                    <a
                      href={o.certificatePath}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-lg border border-[#003365] text-[#003365] text-xs font-semibold"
                    >
                      View certificate
                    </a>
                  )
                ) : (
                  <Link
                    href={`/pro/warranty/?order=${encodeURIComponent(o.name)}`}
                    className="px-3 py-2 rounded-lg bg-[#5BA411] text-white text-xs font-semibold"
                  >
                    File warranty
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => reorder(o)}
                  disabled={!o.lineItems.some((li) => li.variantId) || reordering === o.id}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 disabled:opacity-40"
                >
                  {reordering === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reorder'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
