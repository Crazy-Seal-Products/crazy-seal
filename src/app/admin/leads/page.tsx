'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import { createClient } from '@/lib/supabase/client'
import {
  Search, ChevronDown, ChevronUp, ExternalLink, Phone, Mail,
  MapPin, Truck, RefreshCw, Filter, X, Users, Handshake, Layers,
} from 'lucide-react'

type Tab = 'all' | 'quote' | 'business'

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  location: string | null
  project_type: string | null
  rv_length: string | null
  square_footage: string | null
  business_name: string | null
  business_type: string | null
  website: string | null
  lead_type: string | null
  how_heard: string | null
  photo_urls: string[] | null
  message: string | null
  source_page: string | null
  source_url: string | null
  texting_consent: boolean | null
  status: string
  zoho_lead_id: string | null
  zoho_synced_at: string | null
  first_utm_source: string | null
  first_utm_medium: string | null
  first_utm_campaign: string | null
  first_landing_page: string | null
  first_referrer: string | null
  converting_utm_source: string | null
  converting_utm_medium: string | null
  converting_landing_page: string | null
  created_at: string
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'quote', label: 'Purchase', icon: Users },
  { id: 'business', label: 'Dealer / Partner', icon: Handshake },
]

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'closed', 'spam']

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    new: 'bg-blue-100 text-[#003365]',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-600',
    spam: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-600'
}

function leadTypeLabel(type: string | null) {
  if (type === 'business') return 'Dealer / Partner'
  if (type === 'quote') return 'Purchase'
  return type || 'Lead'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

function leadComment(lead: Lead): string {
  return (lead.message || '').trim()
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

export default function AdminLeadsPage() {
  const [tab, setTab] = useState<Tab>('all')
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (tab !== 'all') query = query.eq('lead_type', tab)

    const { data, error } = await query
    if (!error && data) setLeads(data as Lead[])
    else setLeads([])
    setLoading(false)
  }, [tab])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function updateStatus(id: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => (l.id === id ? { ...l, status } : l)))
    }
  }

  const sources = Array.from(new Set(leads.map((l) => l.source_page).filter(Boolean))) as string[]

  const filtered = leads.filter((lead) => {
    const q = search.toLowerCase()
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.location && lead.location.toLowerCase().includes(q)) ||
      (lead.business_name && lead.business_name.toLowerCase().includes(q)) ||
      (lead.message && lead.message.toLowerCase().includes(q))

    const matchesSource = sourceFilter === 'all' || lead.source_page === sourceFilter
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesSource && matchesStatus
  })

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Leads</Heading>
              <Text className="text-gray-500 !mb-0">
                Live form submissions — {filtered.length} of {leads.length}
              </Text>
            </div>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setExpandedId(null); setSourceFilter('all') }}
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, city, message..."
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
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none appearance-none cursor-pointer min-w-[160px]"
              >
                <option value="all">All Sources</option>
                {sources.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none cursor-pointer min-w-[140px]"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {loading && leads.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
              <Text className="text-gray-400">Loading leads...</Text>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Text className="text-gray-400">No leads found.</Text>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((lead) => {
                const isOpen = expandedId === lead.id
                const status = lead.status || 'new'
                return (
                  <Card key={lead.id} className="!p-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : lead.id)}
                      className="w-full text-left px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{lead.name}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusBadge(status)}`}>
                            {status}
                          </span>
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {leadTypeLabel(lead.lead_type)}
                          </span>
                          {lead.zoho_lead_id && (
                            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Zoho</span>
                          )}
                          {lead.source_page && (
                            <span className="text-[10px] font-medium bg-blue-100 text-[#003365] px-1.5 py-0.5 rounded">{lead.source_page}</span>
                          )}
                          {lead.texting_consent && (
                            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">SMS OK</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{lead.email}</span>
                          {lead.phone && <span>{lead.phone}</span>}
                          {lead.location && <span>{lead.location}</span>}
                          {lead.project_type && <span>{lead.project_type}</span>}
                        </div>
                        {leadComment(lead) ? (
                          <p className="mt-1.5 text-sm text-gray-700 line-clamp-2">{leadComment(lead)}</p>
                        ) : (
                          <p className="mt-1.5 text-xs text-gray-400 italic">No comment</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(lead.created_at)}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5 bg-gray-50/50 text-sm space-y-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Comments</p>
                          {leadComment(lead) ? (
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">{leadComment(lead)}</p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">No comment submitted</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`mailto:${lead.email}`} className="hover:text-[#003365]">{lead.email}</a>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`tel:${lead.phone}`} className="hover:text-[#003365]">{lead.phone}</a>
                              </div>
                            )}
                            {lead.location && (
                              <div className="flex items-start gap-2 text-gray-700">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                <span>{lead.location}</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-500">
                              Texting consent: {lead.texting_consent ? 'Yes' : 'No'}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Project</p>
                            {lead.project_type && <p className="text-gray-700">{lead.project_type}</p>}
                            {lead.rv_length && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Truck className="w-3.5 h-3.5 text-gray-400" />
                                <span>{lead.rv_length} ft RV</span>
                              </div>
                            )}
                            {lead.square_footage && <p className="text-gray-700">Size: {lead.square_footage}</p>}
                            {lead.business_name && (
                              <p className="text-gray-700">
                                Business: {lead.business_name}{lead.business_type ? ` (${lead.business_type})` : ''}
                              </p>
                            )}
                            {lead.website && (
                              <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[#003365] hover:underline break-all">
                                {lead.website}
                              </a>
                            )}
                            {lead.how_heard && <p className="text-gray-700">How heard: {lead.how_heard}</p>}
                            <PhotoLinks urls={lead.photo_urls} />
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</p>
                            <select
                              value={status}
                              onChange={(e) => updateStatus(lead.id, e.target.value)}
                              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none cursor-pointer"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            {lead.source_page && <p className="text-gray-700">Form: {lead.source_page}</p>}
                            <p className="text-gray-500 text-xs">{formatDate(lead.created_at)}</p>
                            {lead.zoho_lead_id && (
                              <a
                                href={`https://crm.zoho.com/crm/org/tab/Leads/${lead.zoho_lead_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-[#003365] hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> View in Zoho
                              </a>
                            )}
                          </div>
                        </div>

                        {(lead.first_utm_source || lead.first_landing_page || lead.first_referrer) && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Attribution</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-600">
                              {lead.first_utm_source && (
                                <p>First touch: {[lead.first_utm_source, lead.first_utm_medium, lead.first_utm_campaign].filter(Boolean).join(' / ')}</p>
                              )}
                              {lead.converting_utm_source && (
                                <p>Last touch: {[lead.converting_utm_source, lead.converting_utm_medium].filter(Boolean).join(' / ')}</p>
                              )}
                              {lead.first_landing_page && <p>Landing: {lead.first_landing_page}</p>}
                              {lead.converting_landing_page && <p>Converting page: {lead.converting_landing_page}</p>}
                              {lead.first_referrer && <p className="sm:col-span-2 break-all">Referrer: {lead.first_referrer}</p>}
                            </div>
                          </div>
                        )}
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
