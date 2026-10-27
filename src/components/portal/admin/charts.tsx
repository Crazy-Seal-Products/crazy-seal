'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { money, money0, num, numShort } from '@/lib/portal/admin/format'
import { SERIES } from './series'

/**
 * Admin charts. Colors were checked with the dataviz palette validator
 * against the panel surface: revenue = blue, volume = gold. Text never takes
 * the series color; every chart has a hover/focus readout and a table view.
 */


export type ValueFormat = 'money' | 'int'

function fmt(v: number, f: ValueFormat) {
  return f === 'money' ? money0(v) : num(v)
}

function fmtAxis(v: number, f: ValueFormat) {
  return f === 'money' ? `$${numShort(v)}` : numShort(v)
}

function niceMax(v: number) {
  if (v <= 0) return 1
  const exp = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / exp
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10
  return step * exp
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

export interface ColumnDatum {
  key: string
  label: string
  value: number
  detail?: string
}

/** Columns from one baseline, 4px rounded tops, ≤24px wide, 2px gaps. */
export function ColumnChart({
  data,
  format = 'money',
  color = SERIES.revenue,
  height = 190,
  valueLabel,
  className,
}: {
  data: ColumnDatum[]
  format?: ValueFormat
  color?: string
  height?: number
  valueLabel: string
  className?: string
}) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const id = useId()
  const gid = `chart${id.replace(/[^a-zA-Z0-9]/g, '')}`

  const m = { top: 10, right: 6, bottom: 20, left: 46 }
  const innerW = Math.max(0, width - m.left - m.right)
  const innerH = height - m.top - m.bottom
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)))
  const ticks = [0, max / 2, max]
  const slot = data.length ? innerW / data.length : 0
  const bar = Math.max(1, Math.min(24, slot - 2))
  const every = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(innerW / 64))))

  const a = active != null ? data[active] : null
  const tipLeft = active != null ? m.left + slot * active + slot / 2 : 0

  return (
    <div className={twMerge('relative', className)}>
      <div ref={ref} className="relative" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={`${valueLabel} chart`}
            tabIndex={0}
            className="block outline-none focus-visible:ring-2 focus-visible:ring-adm-blue-bright/50"
            onKeyDown={(e) => {
              if (!data.length) return
              if (e.key === 'ArrowRight') setActive((i) => Math.min(data.length - 1, (i ?? -1) + 1))
              if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, (i ?? data.length) - 1))
              if (e.key === 'Escape') setActive(null)
            }}
            onBlur={() => setActive(null)}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              {/* Columns fade toward the baseline; the one under the pointer turns gold. */}
              <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: color }} />
                <stop offset="1" style={{ stopColor: color, stopOpacity: 0.45 }} />
              </linearGradient>
              <linearGradient id={`${gid}-on`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FFD95A" />
                <stop offset="1" stopColor="#F5C542" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            {/* recessive grid + y ticks */}
            {ticks.map((t) => {
              const y = m.top + innerH - (t / max) * innerH
              return (
                <g key={t}>
                  <line x1={m.left} x2={width - m.right} y1={y} y2={y} className="stroke-adm-line-soft" strokeWidth={1} shapeRendering="crispEdges" />
                  <text x={m.left - 6} y={y} dy="0.32em" textAnchor="end" className="fill-adm-muted text-[10px] tabular-nums">
                    {fmtAxis(t, format)}
                  </text>
                </g>
              )
            })}

            {data.map((d, i) => {
              const h = Math.max(d.value > 0 ? 1 : 0, (d.value / max) * innerH)
              const x = m.left + slot * i + (slot - bar) / 2
              const y = m.top + innerH - h
              const r = Math.min(4, bar / 2, h)
              const path = h
                ? `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + bar - r}Q${x + bar},${y} ${x + bar},${y + r}V${y + h}Z`
                : ''
              const on = active === i
              return (
                <g key={d.key}>
                  {path && <path d={path} fill={`url(#${on ? `${gid}-on` : `${gid}-fill`})`} opacity={active == null || on ? 1 : 0.55} />}
                  {/* hit target: the whole slot, taller than the mark */}
                  <rect
                    x={m.left + slot * i}
                    y={m.top}
                    width={slot}
                    height={innerH}
                    fill="transparent"
                    onPointerEnter={() => setActive(i)}
                    onPointerDown={() => setActive(i)}
                  />
                  {i % every === 0 && (
                    <text x={m.left + slot * i + slot / 2} y={height - 5} textAnchor="middle" className="fill-adm-muted text-[10px]">
                      {d.label}
                    </text>
                  )}
                </g>
              )
            })}
            <line
              x1={m.left}
              x2={width - m.right}
              y1={m.top + innerH}
              y2={m.top + innerH}
              className="stroke-adm-line"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          </svg>
        )}

        {a && (
          <div
            role="status"
            className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-adm-line bg-adm-bg/95 px-2 py-1.5 text-[11.5px] shadow-xl backdrop-blur"
            style={{ left: Math.min(Math.max(tipLeft, 70), width - 70) }}
          >
            <p className="flex items-center gap-1.5 font-semibold text-adm-ink">
              <span aria-hidden="true" className="h-0.5 w-2.5 rounded-full" style={{ background: color }} />
              {format === 'money' ? money(a.value) : num(a.value)}
            </p>
            <p className="text-adm-muted">
              {a.label}
              {a.detail ? ` · ${a.detail}` : ''}
            </p>
          </div>
        )}
      </div>

      <details className="group border-t border-adm-line-soft text-[11.5px]">
        <summary className="cursor-pointer list-none px-3 py-1 text-adm-muted hover:text-adm-ink [&::-webkit-details-marker]:hidden">
          <span className="group-open:hidden">Show data table</span>
          <span className="hidden group-open:inline">Hide data table</span>
        </summary>
        <div className="max-h-56 overflow-auto">
          <table className="w-full text-left" aria-labelledby={id}>
            <caption id={id} className="sr-only">
              {valueLabel}
            </caption>
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-adm-muted">
                <th className="px-3 py-1 font-semibold">Period</th>
                <th className="px-3 py-1 text-right font-semibold">{valueLabel}</th>
                <th className="px-3 py-1 text-right font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-adm-line-soft">
              {data.map((d) => (
                <tr key={d.key}>
                  <td className="px-3 py-1 text-adm-soft">{d.label}</td>
                  <td className="px-3 py-1 text-right tabular-nums text-adm-ink">{fmt(d.value, format)}</td>
                  <td className="px-3 py-1 text-right text-adm-muted">{d.detail ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  )
}
