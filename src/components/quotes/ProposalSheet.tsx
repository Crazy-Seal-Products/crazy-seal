'use client'

/* eslint-disable @next/next/no-img-element -- the Crazy Seal logo and Shopify product photos */

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useReducedMotion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'
import { shippingCopy } from '@/lib/pricing/engine'
import { discountLabel, usd, type PublicQuoteLine } from '@/lib/pricing/types'
import type { QuoteTotals } from './QuoteLines'

/**
 * The white "Material proposal" document of the contractor portal's quote
 * screens (Thermo's quote builder layout): a navy band with the contractor's
 * name and "Powered by Crazy Seal", a green to yellow rule, who it's for, the
 * priced lines (rows slide in and out as the roof changes) and the totals.
 * The builder feeds it the live preview; the quote page, the saved quote.
 * Never takes costs (PublicQuoteLine, QuoteTotals).
 */

export const CRAZY_SEAL_LOGO = 'https://media.crazyseal.com/site-assets/wp-media/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png'

const NAVY_BAND = 'linear-gradient(135deg, #003365 0%, #00284F 45%, #001A33 100%)'
const RULE = 'linear-gradient(90deg, #6DC015 0%, #A8D417 50%, #F9EA1C 100%)'

/** A dollar amount that glides to its new value when it changes. */
export function TweenMoney({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (reduce) {
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration: 0.55,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => {
        from.current = v
        setShown(v)
      },
    })
    return () => controls.stop()
  }, [value, reduce])
  return <span className={className}>{usd(reduce ? value : shown)}</span>
}

export function ProposalSheet({
  brandName,
  preparedFor,
  subtitle,
  meta = [],
  live = false,
  lines,
  totals,
  emptyText = 'Answer the roof questions to see the materials and price.',
  notices,
  offer,
  footer,
  className,
}: {
  /** The contractor's name: the document is theirs. */
  brandName: string
  preparedFor: string
  subtitle?: string | null
  /** Small lines under "Material proposal" (quote number, dates). */
  meta?: string[]
  /** Shows a pulsing "Live price" tag (the builder). */
  live?: boolean
  /** Null until the roof is answered. */
  lines: PublicQuoteLine[] | null
  totals: QuoteTotals | null
  emptyText?: string
  /** Light callouts under the totals (freight, items priced by staff, terms). */
  notices?: React.ReactNode
  /** Under the total: the live offer's countdown, or how long a saved quote's offer will last. */
  offer?: React.ReactNode
  /** The action under the document (Save quote). */
  footer?: React.ReactNode
  className?: string
}) {
  const priced = Boolean(lines && lines.length && totals)
  // Keyed by variant so a row stays put (and animates) as quantities change; a repeat gets a suffix.
  const seen = new Map<string, number>()
  const keyed = (lines ?? []).map((l) => {
    const n = seen.get(l.variant_id) ?? 0
    seen.set(l.variant_id, n + 1)
    return { line: l, key: n ? `${l.variant_id}-${n}` : l.variant_id }
  })

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.08 }}
      className={twMerge(
        'relative overflow-hidden rounded-3xl bg-white text-[#0F1A26] ring-1 ring-black/5',
        'shadow-[0_50px_100px_-45px_rgba(0,0,0,0.95),0_24px_50px_-30px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]',
        className,
      )}
    >
      {/* Navy brand band */}
      <header className="relative overflow-hidden px-6 py-6 md:px-7" style={{ background: NAVY_BAND }}>
        <div aria-hidden="true" className="pointer-events-none absolute -left-12 -top-20 h-48 w-48 rounded-full bg-[#6DC015]/25 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-10 h-44 w-44 rounded-full bg-[#F9EA1C]/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold tracking-tight text-white md:text-2xl">{brandName}</p>
            <p className="mt-1.5 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
              Powered by
              <img src={CRAZY_SEAL_LOGO} alt="Crazy Seal" className="h-9 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]" />
            </p>
          </div>
          <div className="shrink-0 text-right text-[11px] leading-relaxed text-white/60">
            <p className="text-sm font-bold text-white">Material proposal</p>
            {live && (
              <p className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-[#B6EB6E]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#6DC015] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#6DC015]" />
                </span>
                Live price
              </p>
            )}
            {meta.map((m) => (
              <p key={m}>{m}</p>
            ))}
          </div>
        </div>
      </header>
      <motion.div
        aria-hidden="true"
        className="h-1.5 origin-left"
        style={{ background: RULE }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.25 }}
      />

      <div className="p-6 md:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Prepared for</p>
        <p className="mt-1 text-xl font-bold tracking-tight md:text-2xl">{preparedFor}</p>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}

        {priced && lines && totals ? (
          <>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-[10.5px] uppercase tracking-[0.14em] text-slate-400">
                  <tr>
                    <th scope="col" className="pb-2 font-semibold">
                      Product
                    </th>
                    <th scope="col" className="pb-2 text-right font-semibold">
                      Qty
                    </th>
                    <th scope="col" className="hidden pb-2 text-right font-semibold sm:table-cell">
                      Unit
                    </th>
                    <th scope="col" className="pb-2 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {keyed.map(({ line: l, key }) => (
                      <motion.tr
                        key={key}
                        layout
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                        className="border-t border-slate-200/80 align-top"
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-start gap-3">
                            {l.image ? (
                              <img src={l.image} alt="" className="h-10 w-10 shrink-0 rounded-xl bg-white object-contain p-0.5 shadow-sm ring-1 ring-slate-200" />
                            ) : (
                              <span className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 ring-1 ring-slate-200" />
                            )}
                            <span className="min-w-0">
                              <span className="block font-semibold leading-snug">{l.product_title}</span>
                              <span className="block text-[11.5px] text-slate-500">{l.variant_title}</span>
                              {l.detail && <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">{l.detail}</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-right tabular-nums">
                          <motion.span key={l.quantity} initial={{ opacity: 0.2, y: -4 }} animate={{ opacity: 1, y: 0 }} className="inline-block font-semibold">
                            {l.quantity}
                          </motion.span>
                        </td>
                        <td className="hidden py-3 pr-3 text-right tabular-nums text-slate-500 sm:table-cell">
                          {usd(l.unit_price)}
                          {l.unit_price < l.unit_full && <span className="block text-[11px] text-slate-400 line-through">{usd(l.unit_full)}</span>}
                        </td>
                        <td className="py-3 text-right font-semibold tabular-nums">
                          <TweenMoney value={l.line_total} />
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <dl className="mt-3 space-y-1.5 border-t border-slate-200 pt-4 text-sm tabular-nums">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Full price</dt>
                <dd>
                  <TweenMoney value={totals.subtotal_full} className={totals.discount_total > 0 ? 'text-slate-400 line-through' : undefined} />
                </dd>
              </div>
              <AnimatePresence initial={false}>
                {totals.discount_total > 0 && (
                  <motion.div
                    key="discount"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between gap-3 overflow-hidden"
                  >
                    <dt className="flex items-center gap-2 font-semibold text-[#3F7F0C]">
                      <span className="rounded-full bg-[#6DC015]/15 px-2 py-0.5 text-[11px]">{discountLabel(totals.tier_name, totals.discount_pct)}</span>
                    </dt>
                    <dd className="font-semibold text-[#3F7F0C]">
                      −<TweenMoney value={totals.discount_total} />
                    </dd>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Shipping</dt>
                <dd className={totals.shipping_total === 0 ? 'font-semibold text-[#3F7F0C]' : undefined}>
                  {totals.shipping_total != null && totals.shipping_total > 0 ? usd(totals.shipping_total) : shippingCopy(totals)}
                </dd>
              </div>
            </dl>

            <div className="mt-4 flex items-end justify-between gap-4 border-t-2 border-[#6DC015] pt-4">
              <p className="text-[11px] leading-relaxed text-slate-400">
                {lines.length} item{lines.length === 1 ? '' : 's'} · Crazy Seal roof system
              </p>
              <p className="text-right">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total</span>
                <TweenMoney value={totals.total} className="text-3xl font-black tracking-tight tabular-nums text-[#001A33] md:text-[2.1rem]" />
              </p>
            </div>
            {offer && <div className="mt-3 flex justify-end text-right text-xs font-semibold text-[#3F7F0C]">{offer}</div>}
          </>
        ) : (
          <div className="mt-6">
            <div className="space-y-3" aria-hidden="true">
              {[0.92, 0.7, 0.82, 0.6].map((w, i) => (
                <div key={i} className="flex items-center gap-3 border-t border-slate-100 pt-3">
                  <span className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-100" style={{ animationDelay: `${i * 120}ms` }} />
                  <span className="h-3 animate-pulse rounded-full bg-slate-100" style={{ width: `${w * 60}%`, animationDelay: `${i * 120}ms` }} />
                  <span className="ml-auto h-3 w-14 animate-pulse rounded-full bg-slate-100" style={{ animationDelay: `${i * 120}ms` }} />
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-center text-sm text-slate-500 ring-1 ring-slate-100">{lines && !lines.length ? 'Nothing to price for this roof. Call Crazy Seal for a custom quote.' : emptyText}</p>
          </div>
        )}

        {notices && <div className="mt-4 space-y-2">{notices}</div>}
        {footer && <div className="mt-6">{footer}</div>}
      </div>
    </motion.article>
  )
}

/** A light callout inside the document. */
export function SheetNote({ tone = 'info', icon, children }: { tone?: 'info' | 'warn'; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <p
      className={twMerge(
        'flex gap-2 rounded-xl px-3 py-2.5 text-xs leading-relaxed ring-1',
        tone === 'warn' ? 'bg-amber-50 text-amber-800 ring-amber-200/70' : 'bg-slate-50 text-slate-600 ring-slate-200/70',
      )}
    >
      {icon && <span className="mt-px shrink-0">{icon}</span>}
      <span>{children}</span>
    </p>
  )
}
