'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calculator, ChevronRight, CircleCheck, DollarSign, FileText } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'
import { StatTile, StatusPill } from '@/components/portal/ui'
import { usd } from '@/lib/pricing/types'

/**
 * Client pieces of the contractor portal's quote pages (Thermo's "All quotes"
 * table, the number tiles and the quote's history timeline). The server
 * pages hand them plain rows.
 */

export interface QuoteListRow {
  id: string
  number: string
  roof: string
  project: { id: string; name: string } | null
  total: number
  pill: string
  label: string
  created: string
  /** Saved in the last few minutes: the row flashes in, like Thermo's newly saved quote. */
  fresh: boolean
}

export function QuoteStats({ open, openValue, ordered, orderedValue }: { open: number; openValue: number; ordered: number; orderedValue: number }) {
  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatTile label="Open quotes" value={open} icon={FileText} hint="Open or at checkout" />
      <StatTile label="Open value" value={Math.round(openValue)} prefix="$" icon={DollarSign} hint="Materials waiting to be ordered" delay={0.05} />
      <StatTile label="Ordered" value={ordered} icon={CircleCheck} hint={`${usd(orderedValue, false)} ordered from quotes`} delay={0.1} />
    </div>
  )
}

const HEAD = 'px-3 pb-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)]'

export function PortalQuotesTable({ rows, empty }: { rows: QuoteListRow[]; empty?: React.ReactNode }) {
  const router = useRouter()
  if (!rows.length) return <>{empty}</>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm text-[var(--p-ink)]">
        <thead>
          <tr className="border-b border-[var(--p-line)]">
            <th scope="col" className={twMerge(HEAD, 'pl-5')}>
              Quote
            </th>
            <th scope="col" className={HEAD}>
              Project
            </th>
            <th scope="col" className={twMerge(HEAD, 'hidden sm:table-cell')}>
              Created
            </th>
            <th scope="col" className={twMerge(HEAD, 'text-right')}>
              Total
            </th>
            <th scope="col" className={twMerge(HEAD, 'text-right')}>
              Status
            </th>
            <th scope="col" className={twMerge(HEAD, 'w-10 pr-5')}>
              <span className="sr-only">Open</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q, i) => (
            <motion.tr
              key={q.id}
              initial={q.fresh ? { opacity: 0, backgroundColor: 'rgba(109,192,21,0.28)' } : { opacity: 0, y: 8 }}
              animate={q.fresh ? { opacity: 1, backgroundColor: 'rgba(109,192,21,0)' } : { opacity: 1, y: 0 }}
              transition={q.fresh ? { duration: 1.6 } : { duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(i, 12) * 0.035 }}
              onClick={() => router.push(`/portal/quotes/${q.id}/`)}
              className="group cursor-pointer border-t border-white/[0.05] transition-colors first:border-t-0 hover:bg-white/[0.04]"
            >
              <td className="py-3.5 pl-5 pr-3">
                <Link href={`/portal/quotes/${q.id}/`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs font-semibold text-[var(--p-ink)] hover:text-[var(--p-primary)]">
                  {q.number}
                </Link>
                <span className="mt-0.5 block max-w-[20rem] truncate text-xs text-[var(--p-muted)]">{q.roof}</span>
              </td>
              <td className="max-w-[14rem] truncate px-3 py-3.5">
                {q.project ? (
                  <Link href={`/portal/projects/${q.project.id}/`} onClick={(e) => e.stopPropagation()} className="font-medium hover:text-[var(--p-primary)]">
                    {q.project.name}
                  </Link>
                ) : (
                  <span className="text-[var(--p-muted)] opacity-60">—</span>
                )}
              </td>
              <td className="hidden whitespace-nowrap px-3 py-3.5 text-[var(--p-muted)] sm:table-cell">{q.created}</td>
              <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold tabular-nums">{usd(q.total)}</td>
              <td className="px-3 py-3.5 text-right">
                <StatusPill status={q.pill} label={q.label} />
              </td>
              <td className="py-3.5 pr-5 text-right">
                <ChevronRight className="ml-auto h-4 w-4 text-[var(--p-muted)] opacity-0 transition duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function QuotesEmpty({ canCreate, children }: { canCreate: boolean; children?: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden px-6 py-16 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--p-primary)] opacity-20 blur-3xl" />
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)]"
      >
        <Calculator className="h-6 w-6" />
      </motion.span>
      <p className="relative mt-4 text-base font-semibold text-[var(--p-ink)]">No quotes yet</p>
      <p className="relative mx-auto mt-1 max-w-sm text-sm text-[var(--p-muted)]">
        {canCreate ? 'Spec a roof, see Crazy Seal’s price at your tier, and order the materials straight from the quote.' : 'Quotes your team makes show here.'}
      </p>
      {children && <div className="relative mt-5 flex justify-center">{children}</div>}
    </div>
  )
}

export interface TimelineEvent {
  id: number
  summary: string
  when: string
  actor: string | null
  kind: string
}

const DONE_KINDS = new Set(['ordered'])
const LOST_KINDS = new Set(['lost', 'cancelled'])

/** The quote's history, newest first, on a glowing rail. */
export function QuoteTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events.length) return <p className="text-sm text-[var(--p-muted)]">Nothing yet.</p>
  return (
    <ol className="relative space-y-4 pl-6">
      <motion.span
        aria-hidden="true"
        className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-[var(--p-primary)] via-[var(--p-line)] to-transparent"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.2 }}
      />
      {events.map((e, i) => (
        <motion.li
          key={e.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: 0.25 + Math.min(i, 10) * 0.06 }}
          className="relative text-sm"
        >
          <span
            aria-hidden="true"
            className={twMerge(
              'absolute -left-6 top-1 grid h-[15px] w-[15px] place-items-center rounded-full ring-4 ring-[var(--p-surface)]',
              i === 0 || DONE_KINDS.has(e.kind)
                ? 'bg-[var(--p-primary)] shadow-[0_0_12px_-1px_var(--p-primary)]'
                : LOST_KINDS.has(e.kind)
                  ? 'bg-[#ff8a66]'
                  : 'bg-white/20',
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
          </span>
          <p className="font-medium leading-snug text-[var(--p-ink)]">{e.summary}</p>
          <p className="mt-0.5 text-xs text-[var(--p-muted)]">
            {e.when}
            {e.actor ? ` · ${e.actor}` : ''}
          </p>
        </motion.li>
      ))}
    </ol>
  )
}
