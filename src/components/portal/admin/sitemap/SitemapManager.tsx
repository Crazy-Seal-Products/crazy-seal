'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, ArrowRight, ExternalLink, Loader2, RefreshCw, Search } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { SitemapEntry, SitemapSource, SitemapStatus } from '@/lib/sitemap-data'
import { num } from '@/lib/portal/admin/format'
import { Badge, Empty, Panel, Stat, StatGrid, Table, TBody, Td, Th, THead, Toolbar, Tr } from '@/components/portal/admin/ui'
import { BUTTON, inputCls } from '@/components/portal/admin/styles'

/**
 * Every route on the new site plus every legacy WordPress URL and where it
 * goes (GET /api/admin/sitemap), with a health check that requests the URLs
 * in the current view in batches (POST /api/admin/sitemap/health).
 */

interface HealthResult {
  status: number
  redirected: boolean
  finalUrl: string | null
}

type SourceFilter = 'all' | SitemapSource
type StatusFilter = 'all' | SitemapStatus
type HealthFilter = 'all' | 'ok' | 'problem' | 'unchecked'

const API = '/api/admin/sitemap/'
const HEALTH_API = '/api/admin/sitemap/health/'
/** The health route accepts at most 30 paths per request. */
const BATCH = 30

const SOURCE_LABELS: Record<SitemapSource, string> = {
  page: 'Page',
  project: 'Project',
  store: 'Store',
  admin: 'Admin',
  legacy: 'WordPress',
}
const SOURCES: SourceFilter[] = ['all', 'page', 'project', 'store', 'admin', 'legacy']
const STATUSES: StatusFilter[] = ['all', 'live', 'redirected', 'missing']
const STATUS_TONE = { live: 'good', redirected: 'info', missing: 'bad' } as const

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const messageOf = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong')

function healthKind(h: HealthResult | undefined): Exclude<HealthFilter, 'all'> {
  if (!h) return 'unchecked'
  return h.status >= 200 && h.status < 300 ? 'ok' : 'problem'
}

async function fetchEntries(): Promise<SitemapEntry[]> {
  const res = await fetch(API, { cache: 'no-store' })
  const body = await res.json().catch(() => null)
  if (res.status === 401) throw new Error('Your admin session ended. Reload the page and sign in again.')
  if (!res.ok || !Array.isArray(body?.entries)) throw new Error(body?.error ?? `HTTP ${res.status}`)
  return body.entries
}

export function SitemapManager() {
  const [entries, setEntries] = useState<SitemapEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState<SourceFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [healthFilter, setHealthFilter] = useState<HealthFilter>('all')
  const [health, setHealth] = useState<Record<string, HealthResult>>({})
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [checkError, setCheckError] = useState<string | null>(null)

  const load = useCallback(
    () =>
      fetchEntries()
        .then((list) => {
          setEntries(list)
          setError(null)
        })
        .catch((e: unknown) => setError(messageOf(e)))
        .finally(() => setLoading(false)),
    [],
  )

  useEffect(() => {
    load()
  }, [load])

  const refresh = () => {
    setLoading(true)
    load()
  }

  const counts = useMemo(
    () => ({
      live: entries.filter((e) => e.status === 'live').length,
      redirected: entries.filter((e) => e.status === 'redirected').length,
      missing: entries.filter((e) => e.status === 'missing').length,
      legacy: entries.filter((e) => e.source === 'legacy').length,
    }),
    [entries],
  )

  // Search, then source and status (what the health check runs on), then the health filter (display only).
  const searched = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return entries
    return entries.filter((e) => [e.path, e.title, e.redirectTo].some((v) => v?.toLowerCase().includes(q)))
  }, [entries, search])
  const bySource = (s: SourceFilter) => (e: SitemapEntry) => s === 'all' || e.source === s
  const byStatus = (s: StatusFilter) => (e: SitemapEntry) => s === 'all' || e.status === s
  const filtered = searched.filter(bySource(source)).filter(byStatus(status))
  const shown = healthFilter === 'all' ? filtered : filtered.filter((e) => healthKind(health[e.path]) === healthFilter)
  // Admin pages redirect to sign-in, so their status would mislead; the check skips them.
  const checkable = filtered.filter((e) => e.source !== 'admin').map((e) => e.path)

  const checked = Object.values(health)
  const healthCounts = {
    ok: filtered.filter((e) => healthKind(health[e.path]) === 'ok').length,
    problem: filtered.filter((e) => healthKind(health[e.path]) === 'problem').length,
    unchecked: filtered.filter((e) => healthKind(health[e.path]) === 'unchecked').length,
  }

  async function runHealthCheck() {
    const paths = checkable
    if (!paths.length) return
    setChecking(true)
    setProgress(0)
    setHealth({})
    setCheckError(null)
    const results: Record<string, HealthResult> = {}
    let failed = 0
    let lastError = ''
    for (let i = 0; i < paths.length; i += BATCH) {
      const batch = paths.slice(i, i + BATCH)
      try {
        const res = await fetch(HEALTH_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paths: batch }),
        })
        const body = await res.json().catch(() => null)
        if (!res.ok || !Array.isArray(body?.results)) throw new Error(res.status === 401 ? 'signed out' : body?.error ?? `HTTP ${res.status}`)
        for (const r of body.results as (HealthResult & { path: string })[]) {
          results[r.path] = { status: r.status, redirected: r.redirected, finalUrl: r.finalUrl }
        }
      } catch (e) {
        for (const p of batch) results[p] = { status: 0, redirected: false, finalUrl: null }
        failed += batch.length
        lastError = messageOf(e)
      }
      setHealth({ ...results })
      setProgress(Math.min(i + BATCH, paths.length) / paths.length)
    }
    if (failed) setCheckError(`${num(failed)} URLs couldn't be checked (${lastError}). They show as ERR.`)
    setChecking(false)
  }

  // '…' while the first load runs, '—' if it failed, otherwise the number.
  const value = (n: number) => (entries.length ? num(n) : loading ? '…' : error ? '—' : num(n))
  const has = entries.length > 0

  return (
    <div className="grid gap-2">
      <StatGrid className="md:grid-cols-4 xl:grid-cols-4">
        <Stat hero label="Total URLs" value={value(entries.length)} sub={has ? `${num(counts.legacy)} from WordPress` : undefined} />
        <Stat label="Live" value={value(counts.live)} sub="on the new site" />
        <Stat label="Redirected" value={value(counts.redirected)} sub="old URLs that redirect" tone="info" />
        <Stat
          label="Missing"
          value={<span className={counts.missing > 0 ? 'text-adm-red' : undefined}>{value(counts.missing)}</span>}
          sub={!has ? undefined : counts.missing > 0 ? 'old URLs that go nowhere' : 'every old URL resolves'}
          tone="dealers"
        />
      </StatGrid>

      <Toolbar>
        <label className="relative min-w-[12rem] flex-1 sm:max-w-xs">
          <span className="sr-only">Search URLs</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-faint" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search URLs, titles, redirects…" className={twMerge(inputCls, 'pl-8')} />
        </label>
        <Choice
          label="Source"
          value={source}
          onChange={setSource}
          options={SOURCES.map((s) => ({
            key: s,
            label: s === 'all' ? 'All sources' : SOURCE_LABELS[s],
            count: searched.filter(bySource(s)).filter(byStatus(status)).length,
          }))}
        />
        <Choice
          label="Status"
          value={status}
          onChange={setStatus}
          options={STATUSES.map((s) => ({
            key: s,
            label: s === 'all' ? 'All statuses' : cap(s),
            count: searched.filter(bySource(source)).filter(byStatus(s)).length,
          }))}
        />
        {checked.length > 0 && (
          <Choice
            label="Health"
            value={healthFilter}
            onChange={setHealthFilter}
            options={[
              { key: 'all', label: 'Any health' },
              { key: 'ok', label: 'OK', count: healthCounts.ok },
              { key: 'problem', label: 'Problems', count: healthCounts.problem },
              { key: 'unchecked', label: 'Not checked', count: healthCounts.unchecked },
            ]}
          />
        )}
      </Toolbar>

      {error && (
        <p role="alert" className="rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-[12px] text-adm-red">
          Couldn&apos;t load the sitemap: {error}
        </p>
      )}

      <Panel
        title={`${num(shown.length)} of ${num(entries.length)} URLs`}
        meta={
          // Narrow panels drop this so the title isn't cut; the Health filter shows the same counts.
          checking || checked.length ? (
            <span className="hidden @xl:inline">
              {checking
                ? `checking ${num(checkable.length)} URLs…`
                : `${num(checked.filter((h) => healthKind(h) === 'ok').length)} OK · ${num(checked.filter((h) => healthKind(h) === 'problem').length)} problems of ${num(checked.length)} checked`}
            </span>
          ) : undefined
        }
        actions={
          <>
            <button type="button" onClick={refresh} disabled={loading} aria-label="Refresh" className={twMerge(BUTTON.default, 'h-7 px-2')}>
              <RefreshCw className={twMerge('h-3.5 w-3.5', loading && 'animate-spin')} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={runHealthCheck}
              disabled={checking || loading || !checkable.length}
              title={`Requests the ${num(checkable.length)} URLs in this view (admin pages are skipped) and records the final status after redirects`}
              className={twMerge(BUTTON.gold, 'h-7 px-2.5')}
            >
              {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
              {checking ? `Checking… ${Math.round(progress * 100)}%` : 'Run health check'}
            </button>
          </>
        }
      >
        {checking && (
          <div aria-hidden="true" className="h-0.5 bg-adm-ink/[0.06]">
            <div className="h-full bg-adm-gold transition-[width] duration-300" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
        {checkError && (
          <p role="alert" className="border-b border-adm-line px-3 py-2 text-[12px] text-adm-red">
            {checkError}
          </p>
        )}
        {loading && !entries.length ? (
          <div className="flex justify-center py-16 text-adm-muted">
            <Loader2 aria-label="Loading" className="h-5 w-5 animate-spin" />
          </div>
        ) : shown.length ? (
          <Table>
            <THead>
              <Th>URL</Th>
              <Th className="hidden @2xl:table-cell">Source</Th>
              <Th className="hidden @2xl:table-cell">Status</Th>
              <Th className="hidden @2xl:table-cell">Health</Th>
              <Th className="w-0">
                <span className="sr-only">Open</span>
              </Th>
            </THead>
            <TBody>
              {shown.map((e) => {
                const h = health[e.path]
                return (
                  <Tr key={`${e.source}:${e.path}`}>
                    <Td className="min-w-0 whitespace-normal">
                      <span className="block break-all font-medium text-adm-ink">{e.path}</span>
                      {e.title && <span className="mt-0.5 block text-[11px] text-adm-muted">{e.title}</span>}
                      {e.redirectTo && (
                        <span className="mt-0.5 flex items-start gap-1 text-[11px] text-adm-blue-bright">
                          <ArrowRight aria-label="Redirects to" className="mt-px h-3 w-3 shrink-0" />
                          <span className="break-all">{e.redirectTo}</span>
                        </span>
                      )}
                      <span className="mt-1 flex flex-wrap items-center gap-1 @2xl:hidden">
                        <SourceTags entry={e} />
                        <Badge tone={STATUS_TONE[e.status]}>{cap(e.status)}</Badge>
                        {h && <HealthCell result={h} />}
                      </span>
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <span className="flex items-center gap-1">
                        <SourceTags entry={e} />
                      </span>
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <Badge tone={STATUS_TONE[e.status]}>{cap(e.status)}</Badge>
                    </Td>
                    <Td className="hidden @2xl:table-cell">{h ? <HealthCell result={h} /> : <span className="text-adm-faint">—</span>}</Td>
                    <Td className="w-0 pl-0">
                      <a
                        href={e.status === 'redirected' && e.redirectTo ? e.redirectTo : e.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${e.path} in a new tab`}
                        title="Open in new tab"
                        className="grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-blue-bright"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          !error && <Empty>{entries.length ? 'No URLs match the current filters.' : 'No URLs found.'}</Empty>
        )}
      </Panel>
    </div>
  )
}

function SourceTags({ entry: e }: { entry: SitemapEntry }) {
  return (
    <>
      <Badge tone={e.source === 'legacy' ? 'gold' : 'neutral'} dot={false}>
        {SOURCE_LABELS[e.source]}
        {e.legacyType && e.legacyType !== 'page' ? ` · ${e.legacyType}` : ''}
      </Badge>
      {e.wasWordPress && (
        <span title="This URL also existed on the WordPress site">
          <Badge tone="info" dot={false}>
            WP
          </Badge>
        </span>
      )}
    </>
  )
}

function HealthCell({ result: h }: { result: HealthResult }) {
  const kind = healthKind(h)
  return (
    <span
      title={h.finalUrl ? `Final URL: ${h.finalUrl}` : h.status === 0 ? 'The request failed or timed out' : undefined}
      className={twMerge(
        'inline-flex items-center gap-1 text-[11.5px] font-semibold tabular-nums',
        kind === 'ok' ? 'text-adm-green' : h.status === 0 ? 'text-adm-warn' : 'text-adm-red',
      )}
    >
      {h.status === 0 ? 'ERR' : h.status}
      {h.redirected && <span className="font-normal text-adm-muted">(redirect)</span>}
    </span>
  )
}

/** Client-side twin of ui.tsx's Segmented (that one sets URL params through links). */
function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: readonly { key: T; label: React.ReactNode; count?: number }[]
}) {
  return (
    <div role="group" aria-label={label} className="flex max-w-full flex-wrap rounded-md border border-adm-line bg-adm-input p-0.5">
      {options.map((o) => {
        const active = o.key === value
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.key)}
            className={twMerge(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[12px] font-medium transition',
              active
                ? 'bg-gradient-to-b from-adm-gold-bright to-adm-gold font-semibold text-adm-gold-ink shadow-[0_1px_8px_-2px_rgb(245_197_66/0.5)]'
                : 'text-adm-soft hover:text-adm-ink',
            )}
          >
            {o.label}
            {o.count != null && (
              <span className={twMerge('rounded px-1 text-[10.5px] tabular-nums', active ? 'bg-adm-gold-ink/15 text-adm-gold-ink' : 'bg-adm-ink/[0.06] text-adm-muted')}>
                {o.count.toLocaleString()}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
