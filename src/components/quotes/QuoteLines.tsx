import React from 'react'
import { twMerge } from 'tailwind-merge'
import { shippingCopy } from '@/lib/pricing/engine'
import { discountLabel, usd, type PublicQuoteLine } from '@/lib/pricing/types'

/**
 * A quote's materials and totals, for the buyer's page, the builders'
 * preview and the contractor portal: the full price (struck through when
 * there's a discount), the discount naming why ("Live offer 10%",
 * "Contractor 51+ orders 30%"), shipping and the total. Never takes costs
 * (PublicQuoteLine).
 */

export interface QuoteTotals {
  subtotal_full: number
  discount_pct: number
  discount_total: number
  tier_name: string | null
  shipping: 'free' | 'freight'
  shipping_total: number | null
  total: number
}

const T = {
  light: {
    wrap: 'divide-y divide-gray-100',
    title: 'font-semibold text-gray-900',
    sub: 'text-[12px] text-gray-500',
    num: 'text-gray-900',
    muted: 'text-gray-500',
    save: 'text-accent-dark',
    total: 'text-primary',
    rule: 'border-gray-200',
  },
  dark: {
    wrap: 'divide-y divide-white/[0.06]',
    title: 'font-semibold text-white',
    sub: 'text-[12px] text-blue-100/50',
    num: 'text-white',
    muted: 'text-blue-100/55',
    save: 'text-accent-light',
    total: 'text-white',
    rule: 'border-white/10',
  },
} as const

export function QuoteLines({ lines, totals, theme = 'light', showFull = true, className }: { lines: PublicQuoteLine[]; totals: QuoteTotals; theme?: 'light' | 'dark'; showFull?: boolean; className?: string }) {
  const t = T[theme]
  return (
    <div className={className}>
      <ul className={t.wrap}>
        {lines.map((l, i) => (
          <li key={`${l.variant_id}-${i}`} className="flex items-start gap-3 py-2.5">
            {l.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={l.image} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-black/5" />
            ) : (
              <span className="h-11 w-11 shrink-0 rounded-lg bg-black/5" />
            )}
            <div className="min-w-0 flex-1">
              <p className={twMerge('text-sm', t.title)}>
                {l.product_title} <span className={twMerge('font-normal', t.muted)}>· {l.variant_title}</span>
              </p>
              <p className={t.sub}>{l.detail}</p>
            </div>
            <div className="shrink-0 text-right text-sm tabular-nums">
              <p className={t.num}>{usd(l.line_total)}</p>
              <p className={t.sub}>
                {l.quantity} × {usd(l.unit_price)}
                {showFull && l.unit_price < l.unit_full && <span className="ml-1 line-through">{usd(l.unit_full)}</span>}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <dl className={twMerge('mt-2 space-y-1 border-t pt-3 text-sm tabular-nums', t.rule)}>
        <div className="flex justify-between">
          <dt className={t.muted}>Full price</dt>
          <dd className={twMerge(t.num, totals.discount_total > 0 && 'line-through opacity-60')}>{usd(totals.subtotal_full)}</dd>
        </div>
        {totals.discount_total > 0 && (
          <div className="flex justify-between">
            <dt className={twMerge('font-semibold', t.save)}>{discountLabel(totals.tier_name, totals.discount_pct)}</dt>
            <dd className={twMerge('font-semibold', t.save)}>−{usd(totals.discount_total)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className={t.muted}>Shipping</dt>
          <dd className={t.num}>{totals.shipping_total != null && totals.shipping_total > 0 ? usd(totals.shipping_total) : shippingCopy(totals)}</dd>
        </div>
        <div className={twMerge('flex justify-between pt-1 text-base font-extrabold', t.total)}>
          <dt>Total</dt>
          <dd>{usd(totals.total)}</dd>
        </div>
      </dl>
    </div>
  )
}
