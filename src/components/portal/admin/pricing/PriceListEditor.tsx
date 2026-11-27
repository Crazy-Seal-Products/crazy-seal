'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, Trash2, TriangleAlert } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { savePriceList, type PriceListInput } from '@/lib/pricing/pricing-actions'
import { bandLabel, PRODUCT_INFO, PRODUCT_KEYS, type JobDiscount, type PriceList, type ProductKey } from '@/lib/pricing/price-list-2027'
import { usd } from '@/lib/pricing/types'
import { BUTTON, inputCls } from '../styles'

/**
 * Admin > Pricing > Price list: the 2027 sheet as quotes use it
 * (pricing_settings.price_list and job_discounts, from 036): retail prices,
 * project bands by roof size, totes, project prices for Caulk/Clean/Tape,
 * Crazy Seal's costs and the contractor order-count discounts. The margin
 * preview under it recomputes as you type: each price against its cost, at
 * full price, the live offer and each order-count level.
 */

const str = (n: number | null | undefined) => (n == null ? '' : String(n))
const num = (s: string): number | null => {
  const t = s.replace(/[$,%\s]/g, '')
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

function toInput(list: PriceList, jobs: JobDiscount[]): PriceListInput {
  return {
    retail: { seal: str(list.retail.seal), patch: str(list.retail.patch), caulk: str(list.retail.caulk), clean: str(list.retail.clean), tape: str(list.retail.tape) },
    bands: list.bands.map((b) => ({ minSqft: str(b.minSqft), maxSqft: str(b.maxSqft), perGallon: str(b.perGallon) })),
    tote: { gallons: str(list.tote.gallons), perGallon: str(list.tote.perGallon) },
    project: { caulk: str(list.project.caulk), clean: str(list.project.clean), tape: str(list.project.tape) },
    costs: Object.fromEntries(PRODUCT_KEYS.map((k) => [k, str(list.costs[k])])) as Record<ProductKey, string>,
    jobDiscounts: jobs.map((j) => ({ minOrders: str(j.minOrders), pct: str(j.pct) })),
  }
}

function Money({ label, value, onChange, unit, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; unit: string; placeholder?: string; hint?: string }) {
  return (
    <label className="block space-y-1 text-[11px] font-medium text-adm-muted">
      <span>{label}</span>
      <span className="flex items-center gap-1.5">
        <span className="text-adm-faint">$</span>
        <input className={twMerge(inputCls, 'tabular-nums')} inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
        <span className="shrink-0 text-[11px] text-adm-faint">/{unit}</span>
      </span>
      {hint && <span className="block text-[10.5px] font-normal text-adm-faint">{hint}</span>}
    </label>
  )
}

const Section = ({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-adm-muted">
      {title}
      {hint && <span className="ml-2 font-normal normal-case tracking-normal text-adm-faint">{hint}</span>}
    </p>
    {children}
  </div>
)

const cell = 'px-2 py-1 text-right tabular-nums'

export function PriceListEditor({ priceList, jobDiscounts, offerPct, saved }: { priceList: PriceList; jobDiscounts: JobDiscount[]; offerPct: number; saved: boolean }) {
  const router = useRouter()
  const initial = useMemo(() => toInput(priceList, jobDiscounts), [priceList, jobDiscounts])
  const [v, setV] = useState<PriceListInput>(initial)
  const [pending, start] = useTransition()
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const set = (fn: (x: PriceListInput) => PriceListInput) => {
    setV(fn)
    setStatus(null)
  }

  // The margin preview: per unit, at full price and each discount quotes can get.
  const discounts = [
    { label: 'Full', pct: 0 },
    ...(offerPct > 0 ? [{ label: `Offer ${offerPct}%`, pct: offerPct }] : []),
    ...v.jobDiscounts.map((j) => ({ minOrders: num(j.minOrders), pct: num(j.pct) })).filter((j): j is { minOrders: number; pct: number } => j.minOrders != null && j.pct != null).map((j) => ({ label: `${j.minOrders}+ orders ${j.pct}%`, pct: j.pct })),
  ]
  const cost = (k: ProductKey) => num(v.costs[k])
  const rows: Array<{ name: string; basis: string; price: number | null; cost: number | null; unit: string }> = []
  rows.push({ name: 'Crazy Seal', basis: 'Retail', price: num(v.retail.seal), cost: cost('seal'), unit: 'gal' })
  rows.push({ name: 'Crazy Patch', basis: 'Retail', price: num(v.retail.patch), cost: cost('patch'), unit: 'gal' })
  for (const b of v.bands) {
    const min = num(b.minSqft)
    const label = min != null ? bandLabel({ minSqft: min, maxSqft: num(b.maxSqft) }) : 'Band'
    rows.push({ name: 'Seal / Patch', basis: label, price: num(b.perGallon), cost: cost('seal'), unit: 'gal' })
  }
  rows.push({ name: 'Crazy Seal tote', basis: `${v.tote.gallons || '?'} gal tote`, price: num(v.tote.perGallon), cost: cost('tote'), unit: 'gal' })
  rows.push({ name: 'Crazy Caulk', basis: 'Retail', price: num(v.retail.caulk), cost: cost('caulk'), unit: 'tube' })
  rows.push({ name: 'Crazy Caulk', basis: 'Project', price: num(v.project.caulk), cost: cost('caulk'), unit: 'tube' })
  rows.push({ name: 'Crazy Clean', basis: num(v.retail.clean) != null ? 'Retail' : 'Retail and project', price: num(v.retail.clean) ?? num(v.project.clean), cost: cost('clean'), unit: 'gal' })
  if (num(v.retail.clean) != null) rows.push({ name: 'Crazy Clean', basis: 'Project', price: num(v.project.clean), cost: cost('clean'), unit: 'gal' })
  rows.push({ name: 'Crazy Tape', basis: num(v.retail.tape) != null ? 'Retail' : 'Retail and project', price: num(v.retail.tape) ?? num(v.project.tape), cost: cost('tape'), unit: 'roll' })
  if (num(v.retail.tape) != null) rows.push({ name: 'Crazy Tape', basis: 'Project', price: num(v.project.tape), cost: cost('tape'), unit: 'roll' })
  const toteGal = num(v.tote.gallons)
  const totePrice = num(v.tote.perGallon)

  return (
    <div className="grid gap-4 p-3">
      {!saved && (
        <p className="flex gap-2 rounded-md border border-adm-warn/40 bg-adm-warn/10 px-3 py-2 text-[12px] text-adm-text">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-adm-warn" />
          <span>
            Migration 036 isn’t applied yet, so quotes use the built-in 2027 price list shown here and it can’t be saved. Apply{' '}
            <code className="text-adm-ink">supabase/migrations/036_price_list.sql</code> to the database with psql to edit it.
          </span>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Retail" hint="RV roofs and roofs under the first band">
          <div className="grid gap-2 sm:grid-cols-3">
            <Money label="Crazy Seal" unit="gal" value={v.retail.seal} onChange={(seal) => set((x) => ({ ...x, retail: { ...x.retail, seal } }))} hint="1, 3 and 5 gallon pails" />
            <Money label="Crazy Patch" unit="gal" value={v.retail.patch} onChange={(patch) => set((x) => ({ ...x, retail: { ...x.retail, patch } }))} />
            <Money label="Crazy Caulk" unit="tube" value={v.retail.caulk} onChange={(caulk) => set((x) => ({ ...x, retail: { ...x.retail, caulk } }))} />
            <Money label="Crazy Clean" unit="gal" value={v.retail.clean} placeholder="Project price" onChange={(clean) => set((x) => ({ ...x, retail: { ...x.retail, clean } }))} hint="Empty: the project price" />
            <Money label="Crazy Tape" unit="roll" value={v.retail.tape} placeholder="Project price" onChange={(tape) => set((x) => ({ ...x, retail: { ...x.retail, tape } }))} hint="Empty: the project price" />
          </div>
        </Section>

        <Section title="Project prices" hint="Caulk, Clean and Tape on project-priced quotes">
          <div className="grid gap-2 sm:grid-cols-3">
            <Money label="Crazy Caulk" unit="tube" value={v.project.caulk} onChange={(caulk) => set((x) => ({ ...x, project: { ...x.project, caulk } }))} />
            <Money label="Crazy Clean" unit="gal" value={v.project.clean} onChange={(clean) => set((x) => ({ ...x, project: { ...x.project, clean } }))} />
            <Money label="Crazy Tape" unit="25 ft roll" value={v.project.tape} onChange={(tape) => set((x) => ({ ...x, project: { ...x.project, tape } }))} />
          </div>
        </Section>

        <Section title="Project bands" hint="Crazy Seal and Crazy Patch per gallon, by roof size">
          <div className="space-y-1.5">
            {v.bands.map((b, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 text-[12px] text-adm-muted">
                <input className={twMerge(inputCls, 'w-24 tabular-nums')} aria-label={`Band ${i + 1} from sq ft`} inputMode="numeric" value={b.minSqft} onChange={(e) => set((x) => ({ ...x, bands: x.bands.map((y, j) => (j === i ? { ...y, minSqft: e.target.value } : y)) }))} />
                <span>to</span>
                <input className={twMerge(inputCls, 'w-24 tabular-nums')} aria-label={`Band ${i + 1} to sq ft`} inputMode="numeric" placeholder="No top" value={b.maxSqft} onChange={(e) => set((x) => ({ ...x, bands: x.bands.map((y, j) => (j === i ? { ...y, maxSqft: e.target.value } : y)) }))} />
                <span>sq ft at $</span>
                <input className={twMerge(inputCls, 'w-20 tabular-nums')} aria-label={`Band ${i + 1} price per gallon`} inputMode="decimal" value={b.perGallon} onChange={(e) => set((x) => ({ ...x, bands: x.bands.map((y, j) => (j === i ? { ...y, perGallon: e.target.value } : y)) }))} />
                <span>/gal</span>
                <button type="button" className={BUTTON.default} aria-label={`Remove band ${i + 1}`} onClick={() => set((x) => ({ ...x, bands: x.bands.filter((_, j) => j !== i) }))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              className={BUTTON.default}
              onClick={() =>
                set((x) => {
                  const last = x.bands[x.bands.length - 1]
                  const from = last ? (num(last.maxSqft) ?? num(last.minSqft) ?? 0) + 1 : 1500
                  return { ...x, bands: [...x.bands, { minSqft: String(from), maxSqft: '', perGallon: '' }] }
                })
              }
            >
              <Plus className="h-3.5 w-3.5" /> Add band
            </button>
          </div>
        </Section>

        <Section title="Totes" hint="Whole totes once a job needs one; pails for the rest">
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block space-y-1 text-[11px] font-medium text-adm-muted">
              <span>Tote size</span>
              <span className="flex items-center gap-1.5">
                <input className={twMerge(inputCls, 'tabular-nums')} inputMode="numeric" value={v.tote.gallons} onChange={(e) => set((x) => ({ ...x, tote: { ...x.tote, gallons: e.target.value } }))} />
                <span className="shrink-0 text-[11px] text-adm-faint">gal</span>
              </span>
            </label>
            <Money label="Tote price" unit="gal" value={v.tote.perGallon} onChange={(perGallon) => set((x) => ({ ...x, tote: { ...x.tote, perGallon } }))} hint={toteGal && totePrice != null ? `${usd(toteGal * totePrice, false)} a tote` : undefined} />
          </div>
        </Section>

        <Section title="Crazy Seal’s cost" hint="Thermo’s price, per unit. Staff only">
          <div className="grid gap-2 sm:grid-cols-3">
            {PRODUCT_KEYS.map((k) => (
              <Money
                key={k}
                label={PRODUCT_INFO[k].name}
                unit={k === 'tape' ? 'roll' : k === 'caulk' ? 'tube' : 'gal'}
                value={v.costs[k]}
                onChange={(c) => set((x) => ({ ...x, costs: { ...x.costs, [k]: c } }))}
                hint={k === 'tote' && toteGal && cost('tote') != null ? `${usd(toteGal * (cost('tote') ?? 0), false)} a tote` : undefined}
              />
            ))}
          </div>
        </Section>

        <Section title="Contractor order discounts" hint="Replace the live offer (never stack); the best discount wins">
          <div className="space-y-1.5">
            {v.jobDiscounts.map((j, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 text-[12px] text-adm-muted">
                <input className={twMerge(inputCls, 'w-20 tabular-nums')} aria-label={`Level ${i + 1} orders`} inputMode="numeric" value={j.minOrders} onChange={(e) => set((x) => ({ ...x, jobDiscounts: x.jobDiscounts.map((y, k) => (k === i ? { ...y, minOrders: e.target.value } : y)) }))} />
                <span>+ orders get</span>
                <input className={twMerge(inputCls, 'w-16 tabular-nums')} aria-label={`Level ${i + 1} percent`} inputMode="decimal" value={j.pct} onChange={(e) => set((x) => ({ ...x, jobDiscounts: x.jobDiscounts.map((y, k) => (k === i ? { ...y, pct: e.target.value } : y)) }))} />
                <span>% off</span>
                <button type="button" className={BUTTON.default} aria-label={`Remove level ${i + 1}`} onClick={() => set((x) => ({ ...x, jobDiscounts: x.jobDiscounts.filter((_, k) => k !== i) }))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button type="button" className={BUTTON.default} onClick={() => set((x) => ({ ...x, jobDiscounts: [...x.jobDiscounts, { minOrders: '', pct: '' }] }))}>
              <Plus className="h-3.5 w-3.5" /> Add level
            </button>
            <p className="text-[10.5px] text-adm-faint">Counts the contractor’s Crazy Seal orders (its linked Shopify customers and active team members), not cancelled.</p>
          </div>
        </Section>
      </div>

      <Section title="Margin preview" hint="Per unit, as you type: (price after discount − cost) ÷ price after discount">
        <div className="overflow-x-auto rounded-md border border-adm-line">
          <table className="w-full border-collapse text-[12px] text-adm-text">
            <thead>
              <tr className="border-b border-adm-line bg-adm-head text-[10.5px] uppercase tracking-[0.08em] text-adm-muted">
                <th className="px-2 py-1 text-left font-semibold">Product</th>
                <th className="px-2 py-1 text-left font-semibold">Pricing</th>
                <th className={twMerge(cell, 'font-semibold')}>Price</th>
                <th className={twMerge(cell, 'font-semibold')}>Cost</th>
                {discounts.map((d) => (
                  <th key={d.label} className={twMerge(cell, 'font-semibold')}>
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-adm-line-soft">
                  <td className="px-2 py-1 font-medium text-adm-ink">{r.name}</td>
                  <td className="px-2 py-1 text-adm-muted">{r.basis}</td>
                  <td className={cell}>{r.price != null ? `${usd(r.price)}/${r.unit}` : '—'}</td>
                  <td className={twMerge(cell, 'text-adm-muted')}>{r.cost != null ? usd(r.cost) : '—'}</td>
                  {discounts.map((d) => {
                    const net = r.price != null ? r.price * (1 - d.pct / 100) : null
                    const m = net != null && r.cost != null && net > 0 ? (net - r.cost) / net : null
                    return (
                      <td key={d.label} className={twMerge(cell, m != null && m < 0.3 ? (m < 0 ? 'font-semibold text-adm-red' : 'text-adm-warn') : undefined)}>
                        {m != null ? `${Math.round(m * 1000) / 10}%` : '—'}
                        {net != null && d.pct > 0 && <span className="block text-[10px] text-adm-faint">{usd(net)}</span>}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={pending || !dirty}
          className={BUTTON.gold}
          onClick={() =>
            start(async () => {
              const r = await savePriceList(v)
              setStatus(r.ok ? { ok: true, text: r.message ?? 'Saved' } : { ok: false, text: r.error })
              if (r.ok) router.refresh()
            })
          }
        >
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Save price list
        </button>
        {dirty && (
          <button type="button" className={BUTTON.default} disabled={pending} onClick={() => set(() => initial)}>
            Undo changes
          </button>
        )}
        {status && <span className={twMerge('text-[11.5px]', status.ok ? 'text-adm-green' : 'text-adm-red')}>{status.text}</span>}
      </div>
    </div>
  )
}
