'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { REDIRECTS } from '@/lib/redirects'
import {
  Plus, Loader2, Trash2, X, Save, Pencil, ArrowRight,
  Lock, ToggleLeft, ToggleRight, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ManagedRedirect {
  id: string
  source: string
  destination: string
  permanent: boolean
  enabled: boolean
  notes: string | null
  created_at: string
}

interface Draft {
  id?: string
  source: string
  destination: string
  permanent: boolean
  notes: string
}

const EMPTY_DRAFT: Draft = { source: '', destination: '', permanent: true, notes: '' }

function validateDraft(draft: Draft): string | null {
  const src = draft.source.trim()
  const dest = draft.destination.trim()
  if (!src || !dest) return 'Source and destination are required.'
  if (!src.startsWith('/') || src.startsWith('//')) return 'Source must be a path starting with / (e.g. /old-page).'
  if (src.includes(' ') || src.includes('?') || src.includes('#')) return 'Source cannot contain spaces, query strings, or fragments.'
  if (!dest.startsWith('/') && !dest.startsWith('https://') && !dest.startsWith('http://')) {
    return 'Destination must be a path starting with / or a full URL.'
  }
  if (src.replace(/\/+$/, '') === dest.split('?')[0].replace(/\/+$/, '')) return 'Source and destination cannot be the same.'
  return null
}

export default function AdminRedirectsPage() {
  const [rows, setRows] = useState<ManagedRedirect[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCode, setShowCode] = useState(false)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('managed_redirects')
      .select('*')
      .order('created_at', { ascending: false })
    setRows((data as ManagedRedirect[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  const saveDraft = async () => {
    if (!draft) return
    const validationError = validateDraft(draft)
    if (validationError) {
      setError(validationError)
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const payload = {
      source: draft.source.trim().replace(/(.)\/+$/, '$1'),
      destination: draft.destination.trim(),
      permanent: draft.permanent,
      notes: draft.notes.trim() || null,
      updated_at: new Date().toISOString(),
    }
    const { error: dbError } = draft.id
      ? await supabase.from('managed_redirects').update(payload).eq('id', draft.id)
      : await supabase.from('managed_redirects').insert(payload)
    setSaving(false)
    if (dbError) {
      setError(dbError.code === '23505' ? 'A redirect for that source path already exists.' : dbError.message)
      return
    }
    setDraft(null)
    fetchRows()
  }

  const toggleEnabled = async (row: ManagedRedirect) => {
    const supabase = createClient()
    await supabase
      .from('managed_redirects')
      .update({ enabled: !row.enabled, updated_at: new Date().toISOString() })
      .eq('id', row.id)
    fetchRows()
  }

  const deleteRow = async (row: ManagedRedirect) => {
    if (!confirm(`Delete redirect ${row.source} -> ${row.destination}?`)) return
    const supabase = createClient()
    await supabase.from('managed_redirects').delete().eq('id', row.id)
    fetchRows()
  }

  const q = search.trim().toLowerCase()
  const filteredManaged = rows.filter((r) =>
    !q || r.source.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q),
  )
  const filteredCode = REDIRECTS.filter((r) =>
    !q || r.source.toLowerCase().includes(q) || r.destination.toLowerCase().includes(q),
  )

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Redirects</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Redirects added here go live within a minute — no deploy needed.
          </p>
        </div>
        <button
          onClick={() => { setDraft({ ...EMPTY_DRAFT }); setError(null) }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#003365] rounded-lg hover:bg-[#00274d] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Redirect
        </button>
      </div>

      <div className="relative max-w-sm mb-4">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search redirects…"
          className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
        />
      </div>

      {/* Draft editor */}
      {draft && (
        <div className="mb-5 bg-white border border-[#003365]/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">
              {draft.id ? 'Edit Redirect' : 'New Redirect'}
            </h2>
            <button onClick={() => setDraft(null)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Source path
              </label>
              <input
                value={draft.source}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                placeholder="/old-page"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Destination
              </label>
              <input
                value={draft.destination}
                onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
                placeholder="/new-page or https://…"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Notes (optional)
              </label>
              <input
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Why this redirect exists"
                className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft.permanent}
                  onChange={(e) => setDraft({ ...draft, permanent: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Permanent (301) — uncheck for temporary (302)
              </label>
            </div>
          </div>
          {error && (
            <div className="mb-3 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}
          <button
            onClick={saveDraft}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#003365] rounded-lg hover:bg-[#00274d] transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {draft.id ? 'Save Changes' : 'Create Redirect'}
          </button>
        </div>
      )}

      {/* Managed redirects */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Managed Redirects ({filteredManaged.length})
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : filteredManaged.length === 0 ? (
          <div className="px-4 py-10 text-center text-xs text-gray-400">
            No managed redirects yet. Use “Add Redirect” to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredManaged.map((row) => (
              <div key={row.id} className={cn('px-4 py-3 flex items-center gap-3', !row.enabled && 'opacity-50')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
                    <span className="break-all">{row.source}</span>
                    <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                    <span className="break-all text-blue-700">{row.destination}</span>
                    <span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                      {row.permanent ? '301' : '302'}
                    </span>
                  </div>
                  {row.notes && <div className="text-[10px] text-gray-400 mt-0.5">{row.notes}</div>}
                </div>
                <button
                  onClick={() => toggleEnabled(row)}
                  className="p-1 text-gray-400 hover:text-[#003365] transition-colors"
                  title={row.enabled ? 'Disable' : 'Enable'}
                >
                  {row.enabled ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => {
                    setDraft({
                      id: row.id,
                      source: row.source,
                      destination: row.destination,
                      permanent: row.permanent,
                      notes: row.notes || '',
                    })
                    setError(null)
                  }}
                  className="p-1 text-gray-400 hover:text-[#003365] transition-colors"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteRow(row)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Code-defined redirects (read-only) */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowCode(!showCode)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            <Lock className="w-3 h-3" />
            Code-Defined Redirects ({filteredCode.length})
          </span>
          <span className="text-[10px] text-gray-400">{showCode ? 'Hide' : 'Show'}</span>
        </button>
        {showCode && (
          <div className="divide-y divide-gray-50 border-t border-gray-100">
            {filteredCode.map((r) => (
              <div key={r.source} className="px-4 py-2.5 flex items-center gap-2 text-xs">
                <span className="break-all font-medium text-gray-700">{r.source}</span>
                <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />
                <span className="break-all text-blue-700">{r.destination}</span>
                <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-semibold text-gray-500">
                  {r.permanent ? '301' : '302'}
                </span>
              </div>
            ))}
            <div className="px-4 py-2.5 text-[10px] text-gray-400">
              These live in <code className="bg-gray-100 px-1 rounded">src/lib/redirects.ts</code> and require a deploy to change.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
