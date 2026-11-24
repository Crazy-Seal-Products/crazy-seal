'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calculator,
  ChevronDown,
  Eye,
  FolderKanban,
  GraduationCap,
  History,
  Inbox,
  LogIn,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Users,
  UsersRound,
  Warehouse,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { FeedItem } from '@/lib/contractor/dashboard'
import { INSTALL_STEP_LABEL, PROJECT_STAGE_LABEL, type InstallStep, type ProjectStage } from '@/lib/contractor/types'
import { ago, dateTime, humanize, money } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { ChevronSelect, OPTION_STYLE, SearchPill } from './projects/kit'

/**
 * The contractor's activity log, newest first, on Thermo's activity feed: who
 * did it (and their role), what they did in plain words, when, and the fields
 * that changed (tap to expand). Used on the dashboard, the Activity page and
 * each project and customer.
 */

const ENTITY_ICON: Record<string, LucideIcon> = {
  projects: FolderKanban,
  customers: Users,
  quotes: Calculator,
  orders: ShoppingBag,
  warranties: ShieldCheck,
  team: UsersRound,
  members: UsersRound,
  session: LogIn,
  brand: Palette,
  training: GraduationCap,
  view_as: Eye,
  roofs: Warehouse,
}

/** Each kind of activity's color, for its icon tile. */
const ENTITY_COLOR: Record<string, string> = {
  projects: 'var(--p-primary, #6DC015)',
  customers: '#4CC3FF',
  quotes: 'var(--p-accent, #F9EA1C)',
  orders: '#B794F6',
  warranties: '#2DD4BF',
  team: '#FF9F45',
  members: '#FF9F45',
  brand: '#F472B6',
  training: '#4CC3FF',
  view_as: 'var(--p-accent, #F9EA1C)',
  roofs: '#60A5FA',
}

const FIELD_LABEL: Record<string, string> = {
  assigned_to: 'Assigned to',
  ops_lead_id: 'Operations lead',
  customer_id: 'Customer',
  expected_close: 'Expected close',
  roof_type: 'Roof type',
  sqft: 'Roof area (sq ft)',
  seams: 'Seams (ft)',
  install_step: 'Install step',
  start_date: 'Start date',
  completed_on: 'Completed',
  contact_name: 'Contact',
  zip: 'ZIP',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function formatValue(field: string, value: unknown, people: Record<string, string>): string {
  if (value === null || value === undefined || value === '') return '—'
  if (field === 'stage' && typeof value === 'string') return PROJECT_STAGE_LABEL[value as ProjectStage] ?? humanize(value)
  if (field === 'install_step' && typeof value === 'string') return INSTALL_STEP_LABEL[value as InstallStep] ?? humanize(value)
  if (field === 'value' && typeof value === 'number') return money(value)
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return value.toLocaleString('en-US')
  if (typeof value === 'string') {
    if (people[value]) return people[value]
    if (UUID_RE.test(value)) return 'another record'
    return value.length > 120 ? `${value.slice(0, 117)}…` : value
  }
  if (Array.isArray(value)) return value.map((v) => formatValue(field, v, people)).join(', ')
  if (typeof value === 'object') {
    const parts = Object.values(value as Record<string, unknown>).filter((v) => v !== null && v !== undefined && v !== '')
    return parts.length ? parts.map(String).join(', ') : '—'
  }
  return String(value)
}

function Changes({ changes, people }: { changes: NonNullable<FeedItem['changes']>; people: Record<string, string> }) {
  return (
    <dl className="mt-2.5 space-y-1.5 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.06))] bg-black/15 p-3 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      {Object.entries(changes).map(([field, pair]) => {
        const [before, after] = Array.isArray(pair) ? pair : [null, pair]
        return (
          <div key={field} className="grid grid-cols-[minmax(90px,auto)_1fr] gap-2">
            <dt className="text-[var(--p-muted,#9DA3AB)]">{FIELD_LABEL[field] ?? humanize(field)}</dt>
            <dd className="min-w-0 break-words text-[var(--p-ink,#fff)]">
              <span className="text-[var(--p-muted,#9DA3AB)] line-through decoration-white/20">{formatValue(field, before, people)}</span>
              <span className="mx-1.5 text-[var(--p-primary,#6DC015)]">→</span>
              {formatValue(field, after, people)}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

function FeedRow({ item, people, index }: { item: FeedItem; people: Record<string, string>; index: number }) {
  const [open, setOpen] = useState(false)
  const request = item.action === 'request'
  const Icon = request ? Inbox : (ENTITY_ICON[item.entity] ?? History)
  const color = request ? 'var(--p-accent, #F9EA1C)' : ENTITY_COLOR[item.entity]
  const changeCount = item.changes ? Object.keys(item.changes).length : 0
  return (
    <motion.li
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.03, 0.5) }}
      className="group flex items-start gap-3 py-3.5"
    >
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 transition-transform duration-300 group-hover:scale-105"
        style={
          color
            ? {
                background: `color-mix(in oklab, ${color} 14%, transparent)`,
                color: `color-mix(in oklab, ${color} 85%, white)`,
                ['--tw-ring-color' as string]: `color-mix(in oklab, ${color} 28%, transparent)`,
              }
            : { background: 'rgba(255,255,255,0.05)', color: 'var(--p-muted, #9DA3AB)', ['--tw-ring-color' as string]: 'rgba(255,255,255,0.08)' }
        }
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--p-ink,#fff)]">{item.summary}</p>
        <p className="mt-0.5 text-xs text-[var(--p-muted,#9DA3AB)]">
          {item.actor_name}
          {item.role_label ? ` · ${item.role_label}` : ''}
          {changeCount > 0 && (
            <>
              {' · '}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="inline-flex items-center gap-0.5 font-semibold text-[var(--p-accent,#F9EA1C)] underline-offset-2 hover:underline"
              >
                changed {changeCount} field{changeCount === 1 ? '' : 's'}
                <ChevronDown className={twMerge('h-3 w-3 transition-transform duration-300', open && 'rotate-180')} />
              </button>
            </>
          )}
        </p>
        <AnimatePresence initial={false}>
          {open && item.changes && (
            <motion.div
              key="changes"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
              className="overflow-hidden"
            >
              <Changes changes={item.changes} people={people} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <time
        dateTime={item.at}
        title={dateTime(item.at)}
        suppressHydrationWarning
        className="shrink-0 pt-0.5 text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]"
      >
        {ago(item.at)}
      </time>
    </motion.li>
  )
}

/** A kind-of-activity filter that loads `basePath?param=key` (the Activity page filters on the server). */
export interface ActivityFilter {
  options: { key: string; label: string }[]
  active: string
  basePath: string
  param?: string
}

export function ActivityFeed({
  items,
  people = {},
  searchable = false,
  filter,
  emptyText = 'No activity yet.',
  className,
}: {
  items: FeedItem[]
  /** Team member ids to names, for "Assigned to" changes. */
  people?: Record<string, string>
  searchable?: boolean
  filter?: ActivityFilter
  emptyText?: string
  className?: string
}) {
  const router = useRouter()
  const [loading, startLoading] = useTransition()
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((e) => `${e.summary} ${e.actor_name}`.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div className={className}>
      {(searchable || filter) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {searchable && <SearchPill value={query} onChange={setQuery} label="Search activity" placeholder="Search activity" className="w-full py-1.5 text-xs sm:w-60" />}
          {filter && (
            <ChevronSelect
              aria-label="Filter by type"
              value={filter.active}
              disabled={loading}
              onChange={(e) => {
                const key = e.target.value
                const param = filter.param ?? 'entity'
                startLoading(() => router.push(key ? `${filter.basePath}?${param}=${encodeURIComponent(key)}` : filter.basePath, { scroll: false }))
              }}
              wrapperClassName="w-auto"
              className="!w-auto !rounded-full !py-1.5 !pl-3.5 !text-xs font-semibold"
            >
              {filter.options.map((o) => (
                <option key={o.key || 'all'} value={o.key} style={OPTION_STYLE}>
                  {o.label}
                </option>
              ))}
            </ChevronSelect>
          )}
          <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
            {filtered.length === items.length ? `${items.length} event${items.length === 1 ? '' : 's'}` : `${filtered.length} of ${items.length} events`}
          </span>
        </div>
      )}
      <div className={twMerge('transition-opacity duration-300', loading && 'opacity-50')} aria-busy={loading || undefined}>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.1))] px-4 py-8 text-center text-sm text-[var(--p-muted,#9DA3AB)]">
            {query ? 'No activity matches.' : emptyText}
          </p>
        ) : (
          <ol className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
            {filtered.map((item, i) => (
              <FeedRow key={item.id} item={item} people={people} index={i} />
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
