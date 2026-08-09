'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search, Loader2, ExternalLink, RefreshCw, Activity,
  CheckCircle2, AlertTriangle, ArrowRight, Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SitemapEntry {
  path: string
  source: 'page' | 'project' | 'store' | 'admin' | 'legacy'
  status: 'live' | 'redirected' | 'missing'
  title?: string
  legacyType?: string
  redirectTo?: string
  wasWordPress?: boolean
}

interface HealthResult {
  status: number
  redirected: boolean
  finalUrl: string | null
}

const SOURCE_LABELS: Record<SitemapEntry['source'], string> = {
  page: 'Page',
  project: 'Project',
  store: 'Store',
  admin: 'Admin',
  legacy: 'WordPress',
}

const SOURCE_FILTERS = ['all', 'page', 'project', 'store', 'admin', 'legacy'] as const
const STATUS_FILTERS = ['all', 'live', 'redirected', 'missing'] as const

export default function AdminSitemapPage() {
  const [entries, setEntries] = useState<SitemapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<(typeof SOURCE_FILTERS)[number]>('all')
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all')
  const [health, setHealth] = useState<Record<string, HealthResult>>({})
  const [checking, setChecking] = useState(false)
  const [checkProgress, setCheckProgress] = useState(0)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/sitemap')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const { entries } = await res.json()
      setEntries(entries)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sitemap')
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchEntries() }, [fetchEntries])

  const counts = useMemo(() => ({
    total: entries.length,
    live: entries.filter((e) => e.status === 'live').length,
    redirected: entries.filter((e) => e.status === 'redirected').length,
    missing: entries.filter((e) => e.status === 'missing').length,
  }), [entries])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entries.filter((e) => {
      if (sourceFilter !== 'all' && e.source !== sourceFilter) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      if (q && !e.path.toLowerCase().includes(q) && !(e.title || '').toLowerCase().includes(q)) return false
      return true
    })
  }, [entries, search, sourceFilter, statusFilter])

  const runHealthCheck = async () => {
    setChecking(true)
    setCheckProgress(0)
    setHealth({})
    // Check live/redirect targets on this deployment; admin pages excluded
    // (they client-redirect to login and would report misleading statuses).
    const paths = filtered
      .filter((e) => e.source !== 'admin')
      .map((e) => e.path)
    const results: Record<string, HealthResult> = {}
    for (let i = 0; i < paths.length; i += 30) {
      const batch = paths.slice(i, i + 30)
      try {
        const res = await fetch('/api/admin/sitemap/health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: batch }),
        })
        const { results: batchResults } = await res.json()
        for (const r of batchResults) {
          results[r.path] = { status: r.status, redirected: r.redirected, finalUrl: r.finalUrl }
        }
      } catch {
        for (const p of batch) results[p] = { status: 0, redirected: false, finalUrl: null }
      }
      setHealth({ ...results })
      setCheckProgress(Math.min(i + 30, paths.length) / paths.length)
    }
    setChecking(false)
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sitemap</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Every route on the new site plus every legacy WordPress URL and where it goes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEntries}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={runHealthCheck}
            disabled={checking || loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-[#003365] rounded-lg hover:bg-[#00274d] transition-colors disabled:opacity-60"
          >
            {checking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Checking… {Math.round(checkProgress * 100)}%
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5" />
                Run Health Check
              </>
            )}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <SummaryCard label="Total URLs" value={counts.total} icon={Globe} tone="neutral" />
        <SummaryCard label="Live" value={counts.live} icon={CheckCircle2} tone="green" />
        <SummaryCard label="Redirected" value={counts.redirected} icon={ArrowRight} tone="blue" />
        <SummaryCard label="Missing" value={counts.missing} icon={AlertTriangle} tone={counts.missing > 0 ? 'red' : 'green'} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search URLs…"
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
          />
        </div>
        <div className="flex items-center gap-1">
          {SOURCE_FILTERS.map((f) => (
            <FilterChip key={f} active={sourceFilter === f} onClick={() => setSourceFilter(f)}>
              {f === 'all' ? 'All Sources' : SOURCE_LABELS[f]}
            </FilterChip>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <FilterChip key={f} active={statusFilter === f} onClick={() => setStatusFilter(f)}>
              {f === 'all' ? 'All Statuses' : f.charAt(0).toUpperCase() + f.slice(1)}
            </FilterChip>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 text-[11px] text-gray-400">
          {filtered.length} of {entries.length} URLs
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-4 py-2 font-semibold">URL</th>
                  <th className="px-4 py-2 font-semibold">Source</th>
                  <th className="px-4 py-2 font-semibold">Status</th>
                  <th className="px-4 py-2 font-semibold">Health</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const h = health[e.path]
                  return (
                    <tr key={e.path} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2">
                        <div className="font-medium text-gray-800 break-all">{e.path}</div>
                        {e.title && <div className="text-[10px] text-gray-400 mt-0.5">{e.title}</div>}
                        {e.redirectTo && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-600 mt-0.5">
                            <ArrowRight className="w-3 h-3 shrink-0" />
                            <span className="break-all">{e.redirectTo}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold',
                          e.source === 'legacy' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600',
                        )}>
                          {SOURCE_LABELS[e.source]}
                          {e.legacyType && e.legacyType !== 'page' ? ` · ${e.legacyType}` : ''}
                        </span>
                        {e.wasWordPress && (
                          <span className="ml-1 inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600" title="This URL also existed on the WordPress site">
                            WP
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <StatusBadge status={e.status} />
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {h ? (
                          <span className={cn(
                            'inline-flex items-center gap-1 text-[10px] font-semibold',
                            h.status >= 200 && h.status < 300 ? 'text-green-600' : h.status === 0 ? 'text-gray-400' : 'text-red-600',
                          )}>
                            {h.status === 0 ? 'ERR' : h.status}
                            {h.redirected && <span className="text-gray-400 font-normal">(redirect)</span>}
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <a
                          href={e.status === 'redirected' && e.redirectTo ? e.redirectTo : e.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex p-1.5 text-gray-300 hover:text-[#003365] transition-colors"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                      No URLs match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, icon: Icon, tone }: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  tone: 'neutral' | 'green' | 'blue' | 'red'
}) {
  const tones = {
    neutral: 'text-gray-500 bg-gray-100',
    green: 'text-green-600 bg-green-50',
    blue: 'text-blue-600 bg-blue-50',
    red: 'text-red-600 bg-red-50',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', tones[tone])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-lg font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mt-1">{label}</div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: SitemapEntry['status'] }) {
  const styles = {
    live: 'bg-green-50 text-green-700',
    redirected: 'bg-blue-50 text-blue-700',
    missing: 'bg-red-50 text-red-700',
  }
  return (
    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase', styles[status])}>
      {status}
    </span>
  )
}

function FilterChip({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 text-[11px] font-medium rounded-lg border transition-colors',
        active
          ? 'bg-[#003365] text-white border-[#003365]'
          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50',
      )}
    >
      {children}
    </button>
  )
}
