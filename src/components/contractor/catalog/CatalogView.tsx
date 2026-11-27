'use client'

/* eslint-disable @next/next/no-img-element -- Shopify and crazyseal.com packshots */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, BadgePercent, Calculator, FileText, Phone, Ruler, ShieldAlert } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { CATALOG_CATEGORIES, CATEGORY_INFO, COLOR_SWATCH, coverageLines, PRODUCT_LINE, type CatalogCategory, type ProductLineItem } from '@/lib/contractor/product-line'
import { listUnitPrice, QUOTE_PRODUCTS, round2, variantFull, type PriceBasis } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { bandLabel, PRODUCT_INFO, TAPE_ROLL_FT, type ClientPriceList, type ProductKey } from '@/lib/pricing/price-list-2027'
import { usd, type Coverage } from '@/lib/pricing/types'
import { SUPPORT_PHONE } from '@/lib/pro/config'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel } from '@/components/portal/ui'
import { portalButton } from '@/components/portal/portal-styles'
import { ChevronSelect, EmptyNote, OPTION_STYLE, SearchPill, tint } from '../projects/kit'
import { Segmented } from '../Segmented'

type Basis = Pick<PriceBasis, 'kind' | 'band'>

export interface CatalogViewProps {
  /** The live store, priced (no costs); null when it couldn't be read. */
  pricing: ClientPricing | null
  priceList: ClientPriceList
  coverage: Coverage
  /** The contractor's discount: its percent and what the quote calls it. */
  discount: { pct: number; label: string } | null
  canQuote: boolean
}

interface SizeRow {
  units: number
  label: string
  full: number
  yours: number
  /** Colors of this size cost different amounts: the lowest shows, as "from". */
  varies: boolean
}

interface CatalogCard {
  item: ProductLineItem
  image: string
  /** Null when the store couldn't be read; empty when the store has none quotes can use. */
  sizes: SizeRow[] | null
  colors: string[]
  unitFull: number
  unitYours: number
}

const COLOR_OPTION = /colou?r/i

function sizeLabel(key: ProductKey, units: number): string {
  if (key === 'tote') return `${units.toLocaleString('en-US')} gal tote`
  if (key === 'caulk') return `${units} tube${units === 1 ? '' : 's'}`
  if (key === 'tape') return `${Math.round(units * TAPE_ROLL_FT)} ft roll`
  return `${units} gal`
}

function cardsFor(pricing: ClientPricing | null, list: ClientPriceList, basis: Basis, pct: number): CatalogCard[] {
  const off = (n: number) => round2(n * (1 - pct / 100))
  return PRODUCT_LINE.map((item) => {
    const unitFull = listUnitPrice(item.key, basis, list)
    const base = { item, unitFull, unitYours: off(unitFull) }
    if (!pricing) return { ...base, image: item.image, sizes: null, colors: [] }
    const product = pricing.catalog[QUOTE_PRODUCTS[item.key]]
    if (!product) return { ...base, image: item.image, sizes: [], colors: [] }

    const groups = new Map<number, number[]>()
    const colors = new Set<string>()
    for (const v of product.variants) {
      const p = pricing.prices[v.id]
      if (!p) continue
      groups.set(p.units, [...(groups.get(p.units) ?? []), variantFull(p, basis, pricing.priceList)])
      const color = v.selectedOptions.find((o) => COLOR_OPTION.test(o.name))?.value
      if (color) colors.add(color)
    }
    const sizes = [...groups.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([units, fulls]) => {
        const full = Math.min(...fulls)
        return { units, label: sizeLabel(item.key, units), full, yours: off(full), varies: new Set(fulls).size > 1 }
      })
    // The store's own color order (White, Gray, Tan), limited to colors quotes can use.
    const order = product.options.find((o) => COLOR_OPTION.test(o.name))?.values ?? []
    const rank = (c: string) => (order.includes(c) ? order.indexOf(c) : order.length)
    const sorted = [...colors].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    return { ...base, image: product.featuredImage ?? item.image, sizes, colors: sorted }
  })
}

function matches(card: CatalogCard, q: string): boolean {
  if (!q) return true
  const hay = [card.item.name, card.item.role, card.item.blurb, CATEGORY_INFO[card.item.category].name, ...(card.sizes ?? []).map((s) => s.label)].join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

/**
 * The Catalog tab, Thermo's catalog: Crazy Seal's line by category, each
 * product with its packshot, what it does, how far it goes (the rates quotes
 * use), the store's sizes and colors at this contractor's price on the
 * pricing they pick (retail or a project band), its data sheets and a way
 * into the quote builder.
 */
export function CatalogView({ pricing, priceList, coverage, discount, canQuote }: CatalogViewProps) {
  const [category, setCategory] = useState<CatalogCategory | 'all'>('all')
  const [basisKey, setBasisKey] = useState('retail')
  const [query, setQuery] = useState('')

  const bases = useMemo(
    () => [
      { key: 'retail', label: `Retail: RV roofs and under ${(priceList.bands[0]?.minSqft ?? 1500).toLocaleString('en-US')} sq ft`, basis: { kind: 'retail', band: null } as Basis },
      ...priceList.bands.map((b) => ({ key: `band-${b.minSqft}`, label: `Project: ${bandLabel(b)}`, basis: { kind: 'project', band: b } as Basis })),
    ],
    [priceList],
  )
  const basis = (bases.find((b) => b.key === basisKey) ?? bases[0]).basis
  const pct = discount?.pct ?? 0
  const cards = useMemo(() => cardsFor(pricing, priceList, basis, pct), [pricing, priceList, basis, pct])
  const q = query.trim()
  const searched = cards.filter((c) => matches(c, q))
  const shown = category === 'all' ? searched : searched.filter((c) => c.item.category === category)
  const count = (cat: CatalogCategory) => searched.filter((c) => c.item.category === cat).length

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.05 }}
        className="mb-4 flex flex-wrap items-center gap-2"
      >
        <Segmented
          id="catalog-category"
          label="Category"
          value={category}
          onChange={setCategory}
          options={[{ key: 'all', label: 'All products', count: searched.length }, ...CATALOG_CATEGORIES.map((c) => ({ key: c, label: CATEGORY_INFO[c].name, count: count(c) }))]}
        />
        <SearchPill value={query} onChange={setQuery} label="Search products" placeholder="Search products" className="w-full sm:ml-auto sm:w-64" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
        className="mb-6 flex flex-wrap items-center gap-3"
      >
        <label className="flex w-full items-center gap-2 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] sm:w-auto">
          <span className="shrink-0">Price at</span>
          <ChevronSelect value={basisKey} onChange={(e) => setBasisKey(e.target.value)} wrapperClassName="min-w-0 flex-1 sm:w-80 sm:flex-none" className="!rounded-full !py-2 !text-sm">
            {bases.map((b) => (
              <option key={b.key} value={b.key} style={OPTION_STYLE}>
                {b.label}
              </option>
            ))}
          </ChevronSelect>
        </label>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1" style={tint('var(--p-primary, #6DC015)')}>
          <BadgePercent className="h-3.5 w-3.5" />
          {discount ? `Your prices: ${discount.label}` : 'Full price'}
        </span>
        {!pricing && <span className="text-xs text-[var(--p-muted,#9DA3AB)]">The store’s sizes aren’t available right now; per-unit prices still apply.</span>}
      </motion.div>

      {shown.length === 0 ? (
        <Panel>
          <EmptyNote>
            Nothing matches “{q}”.{' '}
            <button type="button" onClick={() => setQuery('')} className="font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
              Show every product
            </button>
          </EmptyNote>
        </Panel>
      ) : (
        <motion.div layout className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((card, i) => (
              <motion.div
                key={card.item.key}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: Math.min(0.12 + i * 0.05, 0.45) }}
                className="min-w-0"
              >
                <ProductCard card={card} coverage={coverage} toteGallons={priceList.tote.gallons} pct={pct} retail={basis.kind === 'retail'} canQuote={canQuote} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

function ProductCard({
  card,
  coverage,
  toteGallons,
  pct,
  retail,
  canQuote,
}: {
  card: CatalogCard
  coverage: Coverage
  toteGallons: number
  pct: number
  retail: boolean
  canQuote: boolean
}) {
  const { item, sizes } = card
  const unit = item.key === 'tote' ? 'gallon' : PRODUCT_INFO[item.key].unit
  const notInStore = sizes !== null && sizes.length === 0
  const noRetail = retail && (item.key === 'clean' || item.key === 'tape')

  return (
    <article
      className={twMerge(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] backdrop-blur-xl',
        'bg-[image:var(--p-panel)] shadow-[var(--p-shadow)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-[color-mix(in_oklab,var(--p-primary)_40%,transparent)]',
      )}
    >
      <div className="relative grid h-44 place-items-center overflow-hidden border-b border-[var(--p-line,rgba(255,255,255,0.06))] bg-[radial-gradient(ellipse_at_50%_80%,color-mix(in_oklab,var(--p-primary)_22%,transparent),transparent_65%)]">
        <span aria-hidden="true" className="absolute bottom-5 h-5 w-1/2 rounded-full bg-black/40 blur-xl" />
        <img
          src={card.image}
          alt={item.name}
          loading="lazy"
          className="relative max-h-36 w-auto max-w-[62%] object-contain drop-shadow-[0_16px_20px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:-rotate-2 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border border-[var(--p-line,rgba(255,255,255,0.12))] bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)] backdrop-blur">
          {CATEGORY_INFO[item.category].short}
        </span>
        {sizes && sizes.length > 0 && (
          <span className="absolute right-3 top-3 font-mono text-[11px] text-[var(--p-accent,#F9EA1C)]">{sizes.map((s) => s.label).join(' / ')}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-snug text-[var(--p-ink,#fff)]">{item.name}</h3>
            <p className="text-xs font-semibold text-[var(--p-kicker,#F9EA1C)]">{item.role}</p>
          </div>
          <p className="shrink-0 text-right tabular-nums">
            <span className="block text-base font-bold text-[var(--p-ink,#fff)]">{usd(card.unitYours)}</span>
            <span className="block text-[11px] text-[var(--p-muted,#9DA3AB)]">
              {pct > 0 && <span className="mr-1 line-through">{usd(card.unitFull)}</span>}/ {unit}
            </span>
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[var(--p-muted,#9DA3AB)]">{item.blurb}</p>

        <ul className="mt-4 space-y-1.5">
          {coverageLines(item.key, coverage, toteGallons).map((line) => (
            <li key={line} className="flex items-start gap-2 text-xs text-[var(--p-ink,#fff)]">
              <Ruler className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--p-accent,#F9EA1C)]" />
              {line}
            </li>
          ))}
        </ul>

        {sizes === null ? (
          <p className="mt-4 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-[var(--p-muted,#9DA3AB)]">{item.sizes}</p>
        ) : notInStore ? (
          <p className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ring-1" style={tint('var(--p-accent, #F9EA1C)')}>
            <Phone className="h-3.5 w-3.5 shrink-0" />
            Not in the online store right now. Call Crazy Seal at {SUPPORT_PHONE} to order.
          </p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15">
            {sizes.map((s) => (
              <div key={s.units} className="flex items-center justify-between gap-3 border-t border-white/[0.05] px-3 py-2 text-sm first:border-t-0">
                <span className="font-medium text-[var(--p-ink,#fff)]">{s.label}</span>
                <span className="text-right tabular-nums">
                  <span className="font-bold text-[var(--p-ink,#fff)]">
                    {s.varies ? 'from ' : ''}
                    {usd(s.yours)}
                  </span>
                  {pct > 0 && <span className="ml-1.5 text-[11px] text-[var(--p-muted,#9DA3AB)] line-through">{usd(s.full)}</span>}
                </span>
              </div>
            ))}
          </div>
        )}

        {(card.colors.length > 0 || noRetail || item.key === 'tote') && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-[var(--p-muted,#9DA3AB)]">
            {card.colors.length > 0 && (
              <span className="flex flex-wrap items-center gap-2">
                {card.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full ring-1 ring-white/25" style={{ background: COLOR_SWATCH[c.toLowerCase()] ?? 'rgba(255,255,255,0.3)' }} />
                    {c}
                  </span>
                ))}
              </span>
            )}
            {noRetail && <span>No retail price: retail quotes use the project price.</span>}
            {item.key === 'tote' && <span>Same price on every job.</span>}
          </div>
        )}

        <div className="flex-1" />
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-4">
          {item.docs.map((d) => (
            <a
              key={d.href}
              href={d.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-primary,#6DC015)] transition hover:brightness-125"
            >
              {d.label.startsWith('Safety') ? <ShieldAlert className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
              {d.label}
            </a>
          ))}
          {item.page && (
            <a
              href={item.page}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:text-[var(--p-ink,#fff)]"
            >
              Product page <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          {canQuote && !notInStore && (
            <Link href="/portal/quotes/new/" className={twMerge(portalButton, 'ml-auto px-3.5 py-2 text-xs')}>
              <Calculator className="h-3.5 w-3.5" /> Add to a quote
            </Link>
          )}
        </div>
      </div>
    </article>
  )
}
