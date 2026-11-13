'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BORDER, hrefWith } from './ui'

function shift(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

const step =
  'grid h-[26px] w-[26px] shrink-0 place-items-center rounded text-adm-soft transition hover:bg-adm-ink/[0.06] hover:text-adm-ink aria-disabled:pointer-events-none aria-disabled:opacity-35'

/**
 * Picks the day for a Daily range: previous / next day, a date field, and a
 * jump back to today. Sets one search param (default `day`), keeping the
 * rest; today leaves the param off so a saved link always opens on today.
 */
export function DayPicker({
  day,
  today,
  min,
  base,
  params,
  param = 'day',
  className,
}: {
  /** The day shown, YYYY-MM-DD in store time. */
  day: string
  /** Today in store time (from the server, so the client's clock and zone don't matter). */
  today: string
  /** First day with data, if earlier days are empty. */
  min?: string | null
  base: string
  params: Record<string, string | undefined>
  param?: string
  className?: string
}) {
  const router = useRouter()
  const href = (d: string) => hrefWith(base, params, { [param]: d >= today ? undefined : d, page: undefined })
  const prev = shift(day, -1)
  const next = shift(day, 1)
  const atStart = Boolean(min && day <= min)
  const atEnd = day >= today

  return (
    <div className={twMerge('flex items-center gap-0.5 rounded-md border bg-adm-input p-0.5', BORDER, className)}>
      <Link href={href(prev)} scroll={false} aria-label="Previous day" aria-disabled={atStart || undefined} tabIndex={atStart ? -1 : undefined} className={step}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </Link>
      <input
        type="date"
        aria-label="Day"
        value={day}
        max={today}
        min={min ?? undefined}
        onChange={(e) => {
          const v = e.target.value
          if (/^\d{4}-\d{2}-\d{2}$/.test(v)) router.push(href(v > today ? today : v), { scroll: false })
        }}
        className="h-[26px] rounded bg-transparent px-1 text-[12px] font-medium tabular-nums text-adm-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-adm-blue-bright/40"
      />
      <Link href={href(next)} scroll={false} aria-label="Next day" aria-disabled={atEnd || undefined} tabIndex={atEnd ? -1 : undefined} className={step}>
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
      {!atEnd && (
        <Link
          href={href(today)}
          scroll={false}
          className="rounded px-2 py-1 text-[12px] font-medium text-adm-soft transition hover:bg-adm-ink/[0.06] hover:text-adm-ink"
        >
          Today
        </Link>
      )}
    </div>
  )
}
