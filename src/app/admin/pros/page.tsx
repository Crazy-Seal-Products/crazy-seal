'use client'

import { useCallback, useEffect, useState } from 'react'
import { Container, Heading, Text } from '@/lib/design-system'
import { Loader2 } from 'lucide-react'

type Tab = 'dealers' | 'volume' | 'members'

interface ShopifyRow {
  id?: string
  email?: string | null
  displayName?: string
  tags?: string[]
  numberOfOrders?: number
  amountSpent?: string | null
  hub?: { last_login_at: string | null; invited_at: string | null; status_override: string | null } | null
}

interface MemberRow {
  id: string
  email: string
  display_name: string | null
  business_name: string | null
  status_override: string | null
  last_login_at: string | null
  invited_at: string | null
  created_at: string
}

export default function AdminProsPage() {
  const [tab, setTab] = useState<Tab>('dealers')
  const [rows, setRows] = useState<(ShopifyRow | MemberRow)[]>([])
  const [shopifyError, setShopifyError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteStatus, setInviteStatus] = useState('pro')
  const [message, setMessage] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setShopifyError(null)
    try {
      const res = await fetch(`/api/admin/pros/customers/?tab=${tab}`)
      const json = await res.json()
      if (res.status === 401) {
        setShopifyError('Sign in as staff to view this page.')
        setRows([])
        return
      }
      setRows(json.customers || [])
      if (json.shopifyError) setShopifyError(json.shopifyError)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  async function invite(email: string, displayName?: string, status = inviteStatus) {
    setSending(true)
    setMessage(null)
    try {
      const res = await fetch('/api/admin/pros/invite/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, display_name: displayName, status_override: status }),
      })
      const json = await res.json()
      setMessage(json.message || json.error)
      if (res.ok) {
        setInviteEmail('')
        load()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Customers / Pros</Heading>
        <Text className="text-gray-500 mb-6">
          Shopify dealers, high-volume buyers, and who already has a Pro Hub login. Invite sends a magic link.
        </Text>

        <form
          className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
          onSubmit={(e) => { e.preventDefault(); invite(inviteEmail) }}
        >
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Invite email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="dealer@shop.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Pin status</label>
            <select
              value={inviteStatus}
              onChange={(e) => setInviteStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="pro">Pro</option>
              <option value="commercial">Commercial</option>
              <option value="high_volume">High Volume</option>
              <option value="member">Member</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={sending}
            className="px-4 py-2 bg-[#003365] text-white text-sm font-semibold rounded-lg disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send invite'}
          </button>
        </form>

        {message && <p className="mb-4 text-sm bg-blue-50 text-[#003365] px-4 py-2 rounded-lg">{message}</p>}
        {shopifyError && <p className="mb-4 text-sm bg-amber-50 text-amber-800 px-4 py-3 rounded-xl">{shopifyError}</p>}

        <div className="flex gap-2 mb-4">
          {([
            ['dealers', 'Tagged dealer'],
            ['volume', 'High volume'],
            ['members', 'Hub members'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                tab === id ? 'bg-[#003365] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </p>
        )}

        {!loading && tab !== 'members' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Orders</th>
                  <th className="px-4 py-2">Tags</th>
                  <th className="px-4 py-2">Hub</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rows as ShopifyRow[]).map((c) => (
                  <tr key={c.id || c.email}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{c.displayName}</p>
                      <p className="text-xs text-gray-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-3">{c.numberOfOrders ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{(c.tags || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.hub?.last_login_at
                        ? `Signed in ${new Date(c.hub.last_login_at).toLocaleDateString()}`
                        : c.hub?.invited_at
                          ? 'Invited'
                          : 'Not in hub'}
                    </td>
                    <td className="px-4 py-3">
                      {c.email && (
                        <button
                          type="button"
                          onClick={() => invite(c.email!, c.displayName, 'pro')}
                          className="text-xs font-semibold text-[#003365] hover:underline"
                        >
                          Invite
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="px-4 py-6 text-sm text-gray-400">No customers in this list.</p>}
          </div>
        )}

        {!loading && tab === 'members' && (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500">
                <tr>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Status pin</th>
                  <th className="px-4 py-2">Last login</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(rows as MemberRow[]).map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">{m.email}</td>
                    <td className="px-4 py-3">{m.display_name || m.business_name || '—'}</td>
                    <td className="px-4 py-3">{m.status_override || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {m.last_login_at ? new Date(m.last_login_at).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => invite(m.email, m.display_name || undefined, m.status_override || 'pro')}
                        className="text-xs font-semibold text-[#003365] hover:underline"
                      >
                        Re-invite
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="px-4 py-6 text-sm text-gray-400">Nobody has a Pro Hub login yet.</p>}
          </div>
        )}
      </Container>
    </div>
  )
}
