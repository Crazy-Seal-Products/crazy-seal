import React from 'react'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { money0, num } from '@/lib/portal/admin/format'
import { DIVIDE, Empty } from './ui'

export interface BarRow {
  key: string
  label: string
  value: number
  meta?: string
  href?: string
}

/**
 * Ranked horizontal bars: label and value in text colors, a thin bar in the
 * series color underneath. Values are always printed, so no tooltip needed.
 */
export function BarList({
  rows,
  format = 'money',
  color = 'var(--adm-chart-blue)',
  limit = 8,
  empty = 'Nothing in this range.',
  className,
}: {
  rows: BarRow[]
  format?: 'money' | 'int'
  color?: string
  limit?: number
  empty?: string
  className?: string
}) {
  const shown = rows.slice(0, limit)
  const max = Math.max(1, ...shown.map((r) => r.value))
  if (!shown.length) return <Empty>{empty}</Empty>

  return (
    <ol className={twMerge('divide-y', DIVIDE, className)}>
      {shown.map((r, i) => {
        const label = r.href ? (
          <Link href={r.href} className="truncate font-medium text-adm-ink hover:text-adm-blue-bright hover:underline">
            {r.label}
          </Link>
        ) : (
          <span className="truncate font-medium text-adm-ink">{r.label}</span>
        )
        return (
          <li key={r.key} className="px-3 py-1.5 transition-colors hover:bg-adm-ink/[0.03]">
            <div className="flex items-baseline gap-2 text-[12.5px]">
              <span className="w-4 shrink-0 text-right text-[10.5px] tabular-nums text-adm-faint">{i + 1}</span>
              <span className="flex min-w-0 flex-1 items-baseline gap-1.5">
                {label}
                {r.meta && <span className="shrink-0 truncate text-[11px] text-adm-muted">{r.meta}</span>}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-adm-ink">{format === 'money' ? money0(r.value) : num(r.value)}</span>
            </div>
            <div className="ml-6 mt-1 h-1 overflow-hidden rounded-full bg-adm-ink/[0.06]">
              <div className="h-full rounded-full" style={{ width: `${Math.max(1.5, (r.value / max) * 100)}%`, background: color }} />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
