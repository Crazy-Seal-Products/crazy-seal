'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { deleteTier, saveTier, type TierInput } from '@/lib/pricing/pricing-actions'
import { TIER_AUDIENCES, type PricingTier } from '@/lib/pricing/types'
import { BUTTON, inputCls } from '../styles'

/**
 * Pricing tiers: public volume tiers (the best active one whose minimum the
 * full subtotal reaches) and contractor tiers (assigned per contractor).
 */

const cell = 'px-2 py-1.5 align-middle'

function TierRow({ tier, used }: { tier: PricingTier | null; used: number }) {
  const router = useRouter()
  const initial: TierInput = {
    name: tier?.name ?? '',
    audience: tier?.audience ?? 'public',
    discountPct: tier ? String(tier.discount_pct) : '',
    minSubtotal: tier?.min_subtotal != null ? String(tier.min_subtotal) : '',
    active: tier?.active ?? true,
    sort: tier ? String(tier.sort) : '0',
  }
  const [v, setV] = useState<TierInput>(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const set = (patch: Partial<TierInput>) => {
    setV((x) => ({ ...x, ...patch }))
    setSaved(false)
    setError(null)
  }

  return (
    <tr className={twMerge('border-t border-adm-line-soft', !v.active && 'opacity-60')}>
      <td className={cell}>
        <input className={twMerge(inputCls, 'min-w-[8rem]')} aria-label="Tier name" placeholder={tier ? undefined : 'New tier'} value={v.name} onChange={(e) => set({ name: e.target.value })} />
      </td>
      <td className={cell}>
        <select className={twMerge(inputCls, 'min-w-[8rem]')} aria-label="Audience" value={v.audience} onChange={(e) => set({ audience: e.target.value === 'contractor' ? 'contractor' : 'public' })}>
          {TIER_AUDIENCES.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
      </td>
      <td className={cell}>
        <input className={twMerge(inputCls, 'w-20 text-right tabular-nums')} aria-label="Discount percent" inputMode="decimal" placeholder="0" value={v.discountPct} onChange={(e) => set({ discountPct: e.target.value })} />
      </td>
      <td className={cell}>
        {v.audience === 'public' ? (
          <input className={twMerge(inputCls, 'w-28 text-right tabular-nums')} aria-label="Minimum full subtotal" inputMode="decimal" placeholder="No minimum" value={v.minSubtotal} onChange={(e) => set({ minSubtotal: e.target.value })} />
        ) : (
          <span className="text-[11.5px] text-adm-muted">{tier ? `${used} contractor${used === 1 ? '' : 's'}` : 'Assigned per contractor'}</span>
        )}
      </td>
      <td className={cell}>
        <input className={twMerge(inputCls, 'w-16 text-right tabular-nums')} aria-label="Sort" inputMode="numeric" value={v.sort} onChange={(e) => set({ sort: e.target.value })} />
      </td>
      <td className={twMerge(cell, 'text-center')}>
        <input type="checkbox" aria-label="Active" checked={v.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[var(--adm-chart-gold)]" />
      </td>
      <td className={twMerge(cell, 'whitespace-nowrap')}>
        <span className="inline-flex items-center gap-1.5">
          <button
            type="button"
            disabled={pending || !dirty || !v.name.trim()}
            className={tier ? BUTTON.default : BUTTON.gold}
            onClick={() =>
              start(async () => {
                const r = await saveTier(tier?.id ?? null, v)
                if (!r.ok) return setError(r.error)
                setSaved(true)
                if (!tier) setV(initial)
                router.refresh()
              })
            }
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tier ? null : <Plus className="h-3.5 w-3.5" />}
            {tier ? 'Save' : 'Add'}
          </button>
          {tier && (
            <button
              type="button"
              aria-label={`Delete ${tier.name}`}
              disabled={pending}
              className={BUTTON.danger}
              onClick={() => {
                if (!window.confirm(`Delete ${tier.name}?${used ? ` ${used} contractor${used === 1 ? '' : 's'} will go back to public pricing.` : ''}`)) return
                start(async () => {
                  const r = await deleteTier(tier.id)
                  if (!r.ok) return setError(r.error)
                  router.refresh()
                })
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          {saved && !dirty && <Check aria-label="Saved" className="h-3.5 w-3.5 text-adm-green" />}
          {error && <span className="text-[11px] text-adm-red">{error}</span>}
        </span>
      </td>
    </tr>
  )
}

export function TiersEditor({ tiers, usage }: { tiers: PricingTier[]; usage: Record<string, number> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12.5px] text-adm-text">
        <thead>
          <tr className="border-b border-adm-line bg-adm-head text-[10.5px] uppercase tracking-[0.08em] text-adm-muted">
            <th className="px-2 py-1.5 font-semibold">Name</th>
            <th className="px-2 py-1.5 font-semibold">Audience</th>
            <th className="px-2 py-1.5 font-semibold">Discount %</th>
            <th className="px-2 py-1.5 font-semibold">Min full subtotal</th>
            <th className="px-2 py-1.5 font-semibold">Sort</th>
            <th className="px-2 py-1.5 text-center font-semibold">Active</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {tiers.map((t) => (
            <TierRow key={`${t.id}:${t.updated_at}`} tier={t} used={usage[t.id] ?? 0} />
          ))}
          <TierRow key="new" tier={null} used={0} />
        </tbody>
      </table>
    </div>
  )
}
