'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import { createClient } from '@/lib/supabase/client'
import {
  Search, ChevronDown, ChevronUp, Phone, Mail,
  RefreshCw, X, ShieldCheck, ArrowLeftRight, AlertTriangle,
} from 'lucide-react'

type Tab = 'registrations' | 'transfers' | 'claims'

interface Registration {
  id: string
  name: string
  email: string
  phone: string | null
  customer_details: string | null
  order_number: string | null
  install_type: string | null
  installer_name: string | null
  installer_phone: string | null
  installer_email: string | null
  photo_urls: string[] | null
  experience_notes: string | null
  contractor_notes: string | null
  photo_display_consent: boolean | null
  status: string
  created_at: string
}

interface Transfer {
  id: string
  new_owner_name: string
  new_owner_email: string
  new_owner_phone: string | null
  original_owner_email: string | null
  order_number: string | null
  transfer_notes: string | null
  status: string
  created_at: string
}

interface Claim {
  id: string
  name: string
  email: string
  phone: string | null
  order_number: string | null
  failure_description: string | null
  photo_urls: string[] | null
  status: string
  resolution_notes: string | null
  created_at: string
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'registrations', label: 'Registrations', icon: ShieldCheck },
  { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
  { id: 'claims', label: 'Claims', icon: AlertTriangle },
]

const STATUS_OPTIONS: Record<Tab, string[]> = {
  registrations: ['submitted', 'approved', 'flagged'],
  transfers: ['submitted', 'processed', 'denied'],
  claims: ['submitted', 'in_review', 'resolved', 'denied'],
}

const TABLES: Record<Tab, string> = {
  registrations: 'warranty_registrations',
  transfers: 'warranty_transfers',
  claims: 'warranty_claims',
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    submitted: 'bg-blue-100 text-[#003365]',
    approved: 'bg-green-100 text-green-700',
    processed: 'bg-green-100 text-green-700',
    resolved: 'bg-green-100 text-green-700',
    in_review: 'bg-yellow-100 text-yellow-700',
    flagged: 'bg-red-100 text-red-700',
    denied: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function PhotoLinks({ urls }: { urls: string[] | null }) {
  if (!urls?.length) return null
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {urls.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#003365] transition-all"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
        </a>
      ))}
    </div>
  )
}

export default function AdminWarrantyPage() {
  const [tab, setTab] = useState<Tab>('registrations')
  const [rows, setRows] = useState<(Registration | Transfer | Claim)[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from(TABLES[tab])
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (!error && data) setRows(data)
    else setRows([])
    setLoading(false)
  }, [tab])

  useEffect(() => { fetchRows() }, [fetchRows])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from(TABLES[tab])
      .update({ status })
      .eq('id', id)
    if (!error) {
      setRows(prev => prev.map(r => (r.id === id ? { ...r, status } : r)))
    }
  }

  const filtered = rows.filter((row) => {
    if (!search) return true
    const q = search.toLowerCase()
    const name = 'name' in row ? row.name : (row as Transfer).new_owner_name
    const email = 'email' in row ? row.email : (row as Transfer).new_owner_email
    return (
      name.toLowerCase().includes(q) ||
      email.toLowerCase().includes(q) ||
      (row.order_number || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Warranty</Heading>
              <Text className="text-gray-500 !mb-0">{filtered.length} {tab}</Text>
            </div>
            <button
              onClick={fetchRows}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setExpandedId(null) }}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  tab === t.id
                    ? 'bg-[#003365] text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {loading && rows.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
              <Text className="text-gray-400">Loading...</Text>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Text className="text-gray-400">No {tab} found.</Text>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((row) => {
                const isOpen = expandedId === row.id
                const name = 'name' in row ? row.name : (row as Transfer).new_owner_name
                const email = 'email' in row ? row.email : (row as Transfer).new_owner_email
                const phone = 'phone' in row ? row.phone : (row as Transfer).new_owner_phone

                return (
                  <Card key={row.id} className="!p-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : row.id)}
                      className="w-full text-left px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{name}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadge(row.status)}`}>
                            {row.status}
                          </span>
                          {row.order_number && (
                            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              #{row.order_number}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{email}</span>
                          {phone && <span>{phone}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(row.created_at)}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5 bg-gray-50/50 text-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`mailto:${email}`} className="hover:text-[#003365]">{email}</a>
                            </div>
                            {phone && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`tel:${phone}`} className="hover:text-[#003365]">{phone}</a>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</p>
                            <select
                              value={row.status}
                              onChange={(e) => updateStatus(row.id, e.target.value)}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none cursor-pointer"
                            >
                              {STATUS_OPTIONS[tab].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {tab === 'registrations' && (() => {
                          const reg = row as Registration
                          return (
                            <>
                              {reg.customer_details && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Details:</strong> {reg.customer_details}</p>
                              )}
                              {reg.install_type && (
                                <p className="text-gray-700">
                                  <strong>Installed:</strong>{' '}
                                  {reg.install_type === 'diy' ? 'Self installed (DIY)' : 'Dealer / contractor'}
                                  {reg.installer_name && ` — ${reg.installer_name} ${reg.installer_phone || ''} ${reg.installer_email || ''}`}
                                </p>
                              )}
                              {reg.experience_notes && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Experience:</strong> {reg.experience_notes}</p>
                              )}
                              {reg.contractor_notes && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Contractor notes:</strong> {reg.contractor_notes}</p>
                              )}
                              <p className="text-gray-500 text-xs">
                                Photo display consent: {reg.photo_display_consent ? 'Yes' : 'No'}
                              </p>
                              <PhotoLinks urls={reg.photo_urls} />
                            </>
                          )
                        })()}

                        {tab === 'transfers' && (() => {
                          const tr = row as Transfer
                          return (
                            <>
                              {tr.original_owner_email && (
                                <p className="text-gray-700"><strong>Original owner:</strong> {tr.original_owner_email}</p>
                              )}
                              {tr.transfer_notes && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Notes:</strong> {tr.transfer_notes}</p>
                              )}
                            </>
                          )
                        })()}

                        {tab === 'claims' && (() => {
                          const cl = row as Claim
                          return (
                            <>
                              {cl.failure_description && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Issue:</strong> {cl.failure_description}</p>
                              )}
                              {cl.resolution_notes && (
                                <p className="text-gray-700 whitespace-pre-wrap"><strong>Resolution:</strong> {cl.resolution_notes}</p>
                              )}
                              <PhotoLinks urls={cl.photo_urls} />
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </Stack>
      </Container>
    </div>
  )
}
