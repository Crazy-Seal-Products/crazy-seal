'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { saveCost, type CostInput } from '@/lib/pricing/pricing-actions'
import type { PriceBookEditorRow } from '@/lib/pricing/price-book'
import { usd } from '@/lib/pricing/types'
import { BUTTON, inputCls } from '../styles'

/**
 * The price book: optional overrides for each Shopify variant quotes use.
 * Prices come from the price list; a row here can turn a variant off (never
 * quoted), give it its own material cost (for costs and margins), or with a
 * markup fix its price at cost x markup on every quote in place of the price
 * list. Empty fields: the price list.
 */

const cell = 'px-2 py-1.5 align-middle'
const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

function BookRow({ row }: { row: PriceBookEditorRow }) {
  const router = useRouter()
  const initial: CostInput = { cost: row.material_cost != null ? String(row.material_cost) : '', markup: row.markup != null ? String(row.markup) : '', active: row.active }
  const [v, setV] = useState<CostInput>(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const set = (patch: Partial<CostInput>) => {
    setV((x) => ({ ...x, ...patch }))
    setSaved(false)
    setError(null)
  }

  const typedCost = v.cost.trim() ? Number(v.cost.replace(/[$,\s]/g, '')) : null
  const cost = typedCost != null && Number.isFinite(typedCost) ? typedCost : row.sheet_cost
  const markup = v.markup.trim() ? Number(v.markup.replace(/[x×,\s]/gi, '')) : null
  const fixed = markup != null && Number.isFinite(markup) && cost != null ? round2(cost * markup) : null
  const full = fixed ?? row.retail_price
  const margin = cost != null && full != null && full > 0 ? (full - cost) / full : null
  const unused = row.units == null

  return (
    <tr className={twMerge('border-t border-adm-line-soft', (!v.active || unused) && 'opacity-55')}>
      <td className={twMerge(cell, 'max-w-[16rem]')}>
        <span className="block truncate font-medium text-adm-ink">{row.product_title}</span>
        <span className="block truncate text-[11px] text-adm-muted">
          {row.variant_title}
          {unused && ' · not a size quotes use'}
        </span>
      </td>
      <td className={twMerge(cell, 'text-right tabular-nums text-adm-muted')}>{usd(row.shopify_price)}</td>
      <td className={twMerge(cell, 'text-right tabular-nums')}>{row.retail_price != null ? usd(row.retail_price) : '—'}</td>
      <td className={cell}>
        <input className={twMerge(inputCls, 'w-24 text-right tabular-nums')} aria-label={`Material cost for ${row.variant_title}`} inputMode="decimal" placeholder={row.sheet_cost != null ? usd(row.sheet_cost) : 'Cost'} value={v.cost} onChange={(e) => set({ cost: e.target.value })} />
      </td>
      <td className={cell}>
        <input className={twMerge(inputCls, 'w-20 text-right tabular-nums')} aria-label={`Markup for ${row.variant_title}`} inputMode="decimal" placeholder="List" value={v.markup} onChange={(e) => set({ markup: e.target.value })} />
      </td>
      <td className={twMerge(cell, 'text-right tabular-nums')}>
        <span className="font-semibold text-adm-ink">{full != null ? usd(full) : '—'}</span>
        <span className={twMerge('block text-[10.5px]', fixed != null ? 'text-adm-warn' : 'text-adm-faint')}>{fixed != null ? 'fixed on every quote' : 'retail; bands lower it'}</span>
      </td>
      <td className={twMerge(cell, 'text-right tabular-nums')}>{margin != null ? `${Math.round(margin * 1000) / 10}%` : '—'}</td>
      <td className={twMerge(cell, 'text-center')}>
        <input type="checkbox" aria-label="Use in quotes" checked={v.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[var(--adm-chart-gold)]" />
      </td>
      <td className={twMerge(cell, 'whitespace-nowrap')}>
        <span className="inline-flex items-center gap-1.5">
          <button
            type="button"
            disabled={pending || !dirty}
            className={BUTTON.default}
            onClick={() =>
              start(async () => {
                const r = await saveCost(row.variant_id, v)
                if (!r.ok) return setError(r.error)
                setSaved(true)
                router.refresh()
              })
            }
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save
          </button>
          {saved && !dirty && <Check aria-label="Saved" className="h-3.5 w-3.5 text-adm-green" />}
          {error && <span className="text-[11px] text-adm-red">{error}</span>}
        </span>
      </td>
    </tr>
  )
}

export function PriceBookEditor({ rows }: { rows: PriceBookEditorRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12.5px] text-adm-text">
        <thead>
          <tr className="border-b border-adm-line bg-adm-head text-[10.5px] uppercase tracking-[0.08em] text-adm-muted">
            <th className="px-2 py-1.5 font-semibold">Variant</th>
            <th className="px-2 py-1.5 text-right font-semibold">Shopify</th>
            <th className="px-2 py-1.5 text-right font-semibold">Price list</th>
            <th className="px-2 py-1.5 font-semibold">Cost override</th>
            <th className="px-2 py-1.5 font-semibold">Fixed markup</th>
            <th className="px-2 py-1.5 text-right font-semibold">Quoted at</th>
            <th className="px-2 py-1.5 text-right font-semibold">Margin</th>
            <th className="px-2 py-1.5 text-center font-semibold">Use</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <BookRow key={`${r.variant_id}:${r.updated_at ?? ''}`} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
