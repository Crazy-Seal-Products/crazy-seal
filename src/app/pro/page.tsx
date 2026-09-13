'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileCheck, Package, Phone, RefreshCw, ShoppingCart, ShieldCheck } from 'lucide-react'
import { StatusPills } from '@/components/pro-hub/StatusPills'
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, type ProStatus } from '@/lib/pro/config'
import { firstNameFrom } from '@/lib/pro/status'

interface Dashboard {
  user: {
    email: string
    displayName: string | null
    businessName: string | null
    statuses: ProStatus[]
  }
  stats: {
    orderCount: number
    orderCountThisYear: number
    warrantiesFiled: number
    warrantiesMissing: number
  }
  rebate: { current: number; next: number; remaining: number } | null
  recentOrders: Array<{
    name: string
    createdAt: string
    hasWarranty: boolean
    lineItems: Array<{ title: string; quantity: number }>
  }>
  shopifyError: string | null
}

export default function ProHomePage() {
  const [data, setData] = useState<Dashboard | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/pro/dashboard/')
      .then(async (res) => {
        if (res.status === 401) return
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to load')
        setData(json)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return <div className="p-6 text-sm text-red-600">{error}</div>
  }
  if (!data) {
    return <div className="p-8 text-sm text-gray-400">Loading your shop…</div>
  }

  const first = firstNameFrom(data.user.displayName, data.user.email)
  const rebatePct = data.rebate && data.rebate.next
    ? Math.min(100, Math.round((data.rebate.current / data.rebate.next) * 100))
    : 100
  const isMemberOnly = data.user.statuses.length === 1 && data.user.statuses[0] === 'member'

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-[#5BA411] mb-1">Your shop at a glance</p>
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <h1 className="text-2xl md:text-3xl font-bold text-[#003365]">
          Hey {first}{data.user.businessName ? ` — ${data.user.businessName}` : ''}
        </h1>
        <StatusPills statuses={data.user.statuses} />
      </div>
      <p className="text-sm text-gray-500 mb-6">Crazy Seal knows who you are. File jobs from your orders — no hunting around crazyseal.com.</p>

      {data.shopifyError && (
        <p className="mb-4 text-sm bg-amber-50 text-amber-800 px-4 py-3 rounded-xl">{data.shopifyError}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard label="Orders this year" value={data.stats.orderCountThisYear} hint={`${data.stats.orderCount} all time`} icon={Package} />
        <StatCard label="Warranties filed" value={data.stats.warrantiesFiled} icon={ShieldCheck} />
        <StatCard
          label="Jobs missing a warranty"
          value={data.stats.warrantiesMissing}
          hint={data.stats.warrantiesMissing ? 'File these from Orders' : 'You are caught up'}
          icon={FileCheck}
          alert={data.stats.warrantiesMissing > 0}
        />
      </div>

      {data.rebate && data.rebate.remaining > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-[#003365] mb-2">
            {data.rebate.remaining} more kit {data.rebate.remaining === 1 ? 'order' : 'orders'} until the next rebate conversation
          </p>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full bg-[#5BA411] rounded-full" style={{ width: `${rebatePct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">{data.rebate.current} / {data.rebate.next} lifetime orders</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/pro/warranty/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#5BA411] hover:bg-[#4A870E] text-white text-sm font-semibold">
          <FileCheck className="w-4 h-4" /> File a warranty
        </Link>
        <Link href="/pro/orders/" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#003365] hover:bg-[#002A54] text-white text-sm font-semibold">
          <ShoppingCart className="w-4 h-4" /> Reorder last kit
        </Link>
        <a href={`tel:${SUPPORT_PHONE_TEL}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#003365]">
          <Phone className="w-4 h-4" /> Call Crazy Seal
        </a>
      </div>

      {isMemberOnly && (
        <Link href="/professionals/#start-a-conversation" className="block bg-[#003365] text-white rounded-2xl p-5 mb-8">
          <p className="text-[11px] uppercase tracking-widest text-[#F9EA1C] font-bold mb-1">Become a Pro</p>
          <p className="font-semibold">Install for customers and unlock filing on their behalf, tools, and volume perks.</p>
          <p className="text-sm text-white/70 mt-1">No franchise fees. No inventory. Tell us about your shop.</p>
        </Link>
      )}

      {data.recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Recent orders</h2>
            <Link href="/pro/orders/" className="text-xs font-semibold text-[#003365]">View all</Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
            {data.recentOrders.map((o) => (
              <div key={o.name} className="px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#003365]">{o.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.lineItems[0]?.title || 'Kit'}
                  </p>
                </div>
                {o.hasWarranty ? (
                  <span className="text-[11px] font-bold text-[#5BA411]">Warranty filed</span>
                ) : (
                  <Link href={`/pro/warranty/?order=${encodeURIComponent(o.name)}`} className="text-[11px] font-bold text-[#003365] hover:underline">
                    File warranty
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.stats.orderCount === 0 && !data.shopifyError && (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center">
          <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-800">No Shopify orders on this email yet</p>
          <p className="text-sm text-gray-500 mt-1">Shop a kit or ask staff to invite the email you check out with.</p>
          <Link href="/kit-builder/" className="inline-block mt-4 text-sm font-semibold text-[#5BA411]">Build a kit</Link>
        </div>
      )}
    </div>
  )
}

function StatCard({
  label, value, hint, icon: Icon, alert,
}: {
  label: string
  value: number
  hint?: string
  icon: typeof Package
  alert?: boolean
}) {
  return (
    <div className={`bg-white border rounded-2xl p-4 ${alert ? 'border-[#5BA411]' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500">{label}</p>
        <Icon className={`w-4 h-4 ${alert ? 'text-[#5BA411]' : 'text-gray-400'}`} />
      </div>
      <p className="text-3xl font-bold text-[#003365] mt-1">{value}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
