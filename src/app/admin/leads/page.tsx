'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import { createClient } from '@/lib/supabase/client'
import {
  Search, ChevronDown, ChevronUp, ExternalLink, Phone, Mail,
  MapPin, Truck, Calendar, RefreshCw, Filter, X,
} from 'lucide-react'

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
  zoho_lead_id: string | null
  zoho_synced_at: string | null
  created_at: string
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<string>('all')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (!error && data) setLeads(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const sources = Array.from(new Set(leads.map((l) => l.source_page).filter(Boolean))) as string[]

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone && lead.phone.includes(search)) ||
      (lead.location && lead.location.toLowerCase().includes(search.toLowerCase())) ||
      (lead.business_name && lead.business_name.toLowerCase().includes(search.toLowerCase()))

    const matchesSource = sourceFilter === 'all' || lead.source_page === sourceFilter

    return matchesSearch && matchesSource
  })

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Leads</Heading>
              <Text className="text-gray-500 !mb-0">{filtered.length} of {leads.length} leads</Text>
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

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, city, state..."
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
                return (
                  <Card key={lead.id} className="!p-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : lead.id)}
                      className="w-full text-left px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{lead.name}</span>
                          {lead.zoho_lead_id && (
                            <span className="text-[10px] font-medium bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Zoho</span>
                          )}
                          {lead.source_page && (
                            <span className="text-[10px] font-medium bg-blue-100 text-[#003365] px-1.5 py-0.5 rounded">{lead.source_page}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{lead.email}</span>
                          {lead.phone && <span>{lead.phone}</span>}
                          {lead.location && <span>{lead.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(lead.created_at)}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5 bg-gray-50/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Contact</p>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              <a href={`mailto:${lead.email}`} className="hover:text-[#003365] transition-colors">{lead.email}</a>
                            </div>
                            {lead.phone && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Phone className="w-3.5 h-3.5 text-gray-400" />
                                <a href={`tel:${lead.phone}`} className="hover:text-[#003365] transition-colors">{lead.phone}</a>
                              </div>
                            )}
                            {lead.location && (
                              <div className="flex items-start gap-2 text-gray-700">
                                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                                <span>{lead.location}</span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Project Details</p>
                            {lead.project_type && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <span>{lead.project_type}</span>
                              </div>
                            )}
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
                            {lead.photo_urls && lead.photo_urls.length > 0 && (
                              <p className="text-gray-700">
                                Photos:{' '}
                                {lead.photo_urls.map((url, i) => (
                                  <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-[#003365] hover:underline mr-2">
                                    {i + 1}
                                  </a>
                                ))}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Source</p>
                            {lead.source_page && <p className="text-gray-700">Page: {lead.source_page}</p>}
                            {lead.how_heard && <p className="text-gray-700">How heard: {lead.how_heard}</p>}
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

                        {lead.message && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Message</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.message}</p>
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
