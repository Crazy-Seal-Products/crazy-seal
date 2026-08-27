'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, AlertTriangle, ArrowLeftRight } from 'lucide-react'

type Tab = 'registrations' | 'claims' | 'transfers'

interface Registration {
  id: string
  name: string
  email: string
  order_number: string | null
  status: string
  created_at: string
  certificatePath: string
}

interface Claim {
  id: string
  name: string
  order_number: string | null
  status: string
  failure_description: string | null
  created_at: string
}

interface Transfer {
  id: string
  new_owner_name: string
  order_number: string | null
  status: string
  created_at: string
}

export default function ProJobsPage() {
  const [tab, setTab] = useState<Tab>('registrations')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/pro/jobs/')
      .then(async (res) => {
        const json = await res.json()
        setRegistrations(json.registrations || [])
        setClaims(json.claims || [])
        setTransfers(json.transfers || [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-[#003365]">Jobs &amp; warranties</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">Your filing cabinet — certificates you can resend to the owner.</p>

      <div className="flex gap-2 mb-5">
        {(
          [
            ['registrations', 'Registrations', ShieldCheck],
            ['claims', 'Claims', AlertTriangle],
            ['transfers', 'Transfers', ArrowLeftRight],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              tab === id ? 'bg-[#003365] text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-400">Loading…</p>}

      {tab === 'registrations' && !loading && (
        <div className="space-y-3">
          {registrations.length === 0 && (
            <p className="text-sm text-gray-500">
              No warranties on file yet.{' '}
              <Link href="/pro/warranty/" className="text-[#5BA411] font-semibold">File one from an order</Link>.
            </p>
          )}
          {registrations.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-[#003365]">{r.name}</p>
                <p className="text-xs text-gray-500">
                  {r.order_number || 'No order #'} · {r.status} · {new Date(r.created_at).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-400">{r.email}</p>
              </div>
              <a
                href={r.certificatePath}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-lg bg-[#003365] text-white text-xs font-semibold text-center"
              >
                View / resend certificate
              </a>
            </div>
          ))}
        </div>
      )}

      {tab === 'claims' && !loading && (
        <div className="space-y-3">
          {claims.length === 0 && <p className="text-sm text-gray-500">No claims on this account.</p>}
          {claims.map((c) => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="font-semibold text-[#003365]">{c.name} · {c.order_number || '—'}</p>
              <p className="text-xs text-gray-500">{c.status} · {new Date(c.created_at).toLocaleDateString()}</p>
              {c.failure_description && <p className="text-sm text-gray-600 mt-2">{c.failure_description}</p>}
            </div>
          ))}
        </div>
      )}

      {tab === 'transfers' && !loading && (
        <div className="space-y-3">
          {transfers.length === 0 && <p className="text-sm text-gray-500">No transfers on this account.</p>}
          {transfers.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-2xl p-4">
              <p className="font-semibold text-[#003365]">{t.new_owner_name} · {t.order_number || '—'}</p>
              <p className="text-xs text-gray-500">{t.status} · {new Date(t.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
