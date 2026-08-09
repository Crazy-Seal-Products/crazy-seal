'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Container, Heading, Text, Card, Stack } from '@/lib/design-system'
import { createClient } from '@/lib/supabase/client'
import {
  Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  RefreshCw, X, FileText, Paperclip,
} from 'lucide-react'

const PAGE_SIZE = 50

interface LegacyEntry {
  id: string
  gf_entry_id: number
  gf_form_id: number
  form_title: string | null
  entry_data: Record<string, string>
  file_urls: string[] | null
  submitted_at: string | null
  imported_at: string
}

interface FormOption {
  gf_form_id: number
  form_title: string
  count: number
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

/** Columns from the GF export that are metadata rather than answers */
const META_KEYS = /^(entry id|entry date|date created|user ip|source url|user agent|payment|transaction|created by)/i

function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|heic|bmp)(\?|$)/i.test(url)
}

function entryName(entry: LegacyEntry): string {
  const d = entry.entry_data
  const first = d['Name (First)'] || d['First'] || d['First Name'] || ''
  const last = d['Name (Last)'] || d['Last'] || d['Last Name'] || ''
  const combined = `${first} ${last}`.trim()
  if (combined) return combined
  const nameKey = Object.keys(d).find((k) => /name/i.test(k) && d[k])
  return (nameKey && d[nameKey]) || d['Email'] || `Entry #${entry.gf_entry_id}`
}

function entryEmail(entry: LegacyEntry): string | null {
  const d = entry.entry_data
  if (d['Email']) return d['Email']
  const key = Object.keys(d).find((k) => /email/i.test(k) && d[k]?.includes('@'))
  return key ? d[key] : null
}

export default function AdminEntriesPage() {
  const [forms, setForms] = useState<FormOption[]>([])
  const [formId, setFormId] = useState<number | 'all'>('all')
  const [rows, setRows] = useState<LegacyEntry[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  // Build the form filter list once (dedupe client-side; archive is bounded)
  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('legacy_gf_entries')
        .select('gf_form_id, form_title')
        .limit(50000)
      if (!data) return
      const map = new Map<number, FormOption>()
      for (const row of data) {
        const existing = map.get(row.gf_form_id)
        if (existing) existing.count++
        else map.set(row.gf_form_id, { gf_form_id: row.gf_form_id, form_title: row.form_title || `Form ${row.gf_form_id}`, count: 1 })
      }
      setForms([...map.values()].sort((a, b) => a.gf_form_id - b.gf_form_id))
    })()
  }, [])

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from('legacy_gf_entries')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false, nullsFirst: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (formId !== 'all') query = query.eq('gf_form_id', formId)

    const { data, count, error } = await query
    if (!error && data) {
      setRows(data as LegacyEntry[])
      setTotal(count || 0)
    } else {
      setRows([])
      setTotal(0)
    }
    setLoading(false)
  }, [formId, page])

  useEffect(() => {
    const t = setTimeout(fetchRows, 0)
    return () => clearTimeout(t)
  }, [fetchRows])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((row) =>
      Object.values(row.entry_data).some((v) => typeof v === 'string' && v.toLowerCase().includes(q))
      || String(row.gf_entry_id).includes(q)
    )
  }, [rows, search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <Container size="xl">
        <Stack gap="md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <Heading level={1} className="text-2xl font-bold text-gray-900 mb-1">Form Entries</Heading>
              <Text className="text-gray-500 !mb-0">
                Legacy Gravity Forms archive — {total.toLocaleString()} entries
                {formId !== 'all' && forms.find(f => f.gf_form_id === formId) ? ` in ${forms.find(f => f.gf_form_id === formId)!.form_title}` : ''}
              </Text>
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

          {/* Form filter + search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={formId}
              onChange={(e) => { setFormId(e.target.value === 'all' ? 'all' : Number(e.target.value)); setPage(0); setExpandedId(null) }}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365] outline-none cursor-pointer sm:w-72"
            >
              <option value="all">All forms</option>
              {forms.map((f) => (
                <option key={f.gf_form_id} value={f.gf_form_id}>
                  {f.form_title} ({f.count.toLocaleString()})
                </option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search within this page..."
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
          </div>

          {loading && rows.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-3" />
              <Text className="text-gray-400">Loading...</Text>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <Text className="text-gray-400">No entries found.</Text>
              {total === 0 && formId === 'all' && (
                <Text className="text-gray-400 text-sm mt-1">
                  Run <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">scripts/import-legacy-gf.mjs</code> to import Gravity Forms exports.
                </Text>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((row) => {
                const isOpen = expandedId === row.id
                const email = entryEmail(row)
                const fileCount = row.file_urls?.length || 0

                return (
                  <Card key={row.id} className="!p-0 overflow-hidden">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : row.id)}
                      className="w-full text-left px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 text-sm">{entryName(row)}</span>
                          <span className="text-[10px] font-medium bg-blue-100 text-[#003365] px-1.5 py-0.5 rounded">
                            {row.form_title || `Form ${row.gf_form_id}`}
                          </span>
                          <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            #{row.gf_entry_id}
                          </span>
                          {fileCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              <Paperclip className="w-2.5 h-2.5" />{fileCount}
                            </span>
                          )}
                        </div>
                        {email && <div className="mt-1 text-xs text-gray-500">{email}</div>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-400 hidden sm:block">{formatDate(row.submitted_at)}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-gray-100 px-4 py-4 sm:px-5 sm:py-5 bg-gray-50/50 text-sm space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          {Object.entries(row.entry_data)
                            .filter(([k, v]) => v && String(v).trim() && !META_KEYS.test(k))
                            .map(([k, v]) => (
                              <div key={k} className={String(v).length > 120 ? 'sm:col-span-2' : ''}>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{k}</p>
                                <p className="text-gray-800 whitespace-pre-wrap break-words">{String(v)}</p>
                              </div>
                            ))}
                        </div>

                        {row.file_urls && row.file_urls.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Files</p>
                            <div className="flex flex-wrap gap-2">
                              {row.file_urls.map((url, i) => (
                                <a
                                  key={url}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-[#003365] transition-all"
                                >
                                  {isImageUrl(url) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={url} alt={`File ${i + 1}`} className="w-20 h-20 object-cover" loading="lazy" />
                                  ) : (
                                    <span className="flex flex-col items-center justify-center w-20 h-20 bg-white text-gray-500 text-[10px] gap-1 px-1 text-center">
                                      <Paperclip className="w-4 h-4" />
                                      {url.split('/').pop()?.slice(0, 18)}
                                    </span>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-gray-400">
                          Submitted {formatDate(row.submitted_at)} · Imported {formatDate(row.imported_at)}
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setPage(p => Math.max(0, p - 1)); setExpandedId(null) }}
                disabled={page === 0 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <span className="text-xs text-gray-500">Page {page + 1} of {totalPages}</span>
              <button
                onClick={() => { setPage(p => Math.min(totalPages - 1, p + 1)); setExpandedId(null) }}
                disabled={page >= totalPages - 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </Stack>
      </Container>
    </div>
  )
}
