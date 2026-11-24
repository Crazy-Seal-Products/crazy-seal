'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, ArrowUpRight, Calculator, Check, FileText, Layers, ShieldCheck, Truck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { CRAZY_SEAL_LINE, productLine } from '@/lib/contractor/product-line'
import { ROOF_SYSTEMS, SYSTEM_FAMILY_LABEL, SYSTEM_WARRANTY, type RoofSystem, type SystemComponent, type SystemFamily } from '@/lib/contractor/systems'
import { listUnitPrice, parseRoofInputs, priceQuote, round2, type PriceResult } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { TAPE_ROLL_FT } from '@/lib/pricing/price-list-2027'
import { discountLabel, usd, type Coverage } from '@/lib/pricing/types'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel } from '@/components/portal/ui'
import { portalButton, portalInput } from '@/components/portal/portal-styles'
import { ChevronSelect, EmptyNote, MiniLabel, OPTION_STYLE, tint } from '../projects/kit'
import { Segmented } from '../Segmented'

export interface SystemsViewProps {
  /** The engine's inputs for the browser (no costs); null when the live catalog couldn't be read. */
  pricing: ClientPricing | null
  coverage: Coverage
  /** "Contractor 26+ orders 20% off", or null at full price. */
  discount: string | null
  canQuote: boolean
}

/** The site's installation steps (/installation/membrane-roof/). */
const STEPS = [
  { title: 'Inspection', body: 'Look over the whole roof, its seams and penetrations, before any work starts.' },
  { title: 'Clean & prep', body: 'Wash and scrub with Crazy Clean, clean old sealants, tape off fixtures.' },
  { title: 'Seal the roof', body: 'Crazy Caulk and Crazy Patch on seams and penetrations, then Crazy Seal in coats.' },
]

const ALL_ROOF_TYPES = [...new Set(ROOF_SYSTEMS.flatMap((s) => s.roofTypes))].sort((a, b) => a.localeCompare(b))

/**
 * The Systems page, Thermo's system master for Crazy Seal: each way the one
 * system goes on (RV or building, over the existing roof or direct to deck),
 * with its components in install order and the rates quotes use, where it
 * fits, the site's install guides, and what a sample job costs at this
 * contractor's prices (the quote builder's engine, run here; the sample can
 * be resized).
 */
export function SystemsView({ pricing, coverage, discount, canQuote }: SystemsViewProps) {
  const [family, setFamily] = useState<'all' | SystemFamily>('all')
  const [roofType, setRoofType] = useState('')
  const shown = ROOF_SYSTEMS.filter((s) => (family === 'all' || s.family === family) && (!roofType || s.roofTypes.includes(roofType)))
  const count = (f: SystemFamily) => ROOF_SYSTEMS.filter((s) => s.family === f).length

  return (
    <div>
      <Panel className="mb-6 overflow-hidden" delay={0.04}>
        <span aria-hidden="true" className="pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.12] blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
          <div>
            <MiniLabel>Every system, the same three steps</MiniLabel>
            <p className="mt-1 max-w-2xl text-sm text-[var(--p-muted,#9DA3AB)]">
              Every component shares the same base formula, so caulk, mastic and membrane merge into one seamless, chemically bonded roof.
            </p>
          </div>
          {discount && (
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1" style={tint('var(--p-primary, #6DC015)')}>
              Your prices: {discount}
            </span>
          )}
        </div>
        <ol className="relative mt-5 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.12 + i * 0.08 }}
              className="flex gap-3 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15 p-3.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-sm font-bold text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--p-ink,#fff)]">{step.title}</span>
                <span className="block text-xs leading-snug text-[var(--p-muted,#9DA3AB)]">{step.body}</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </Panel>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <Segmented
          id="systems-family"
          label="Roofs"
          value={family}
          onChange={setFamily}
          options={[
            { key: 'all', label: 'All systems', count: ROOF_SYSTEMS.length },
            { key: 'rv', label: SYSTEM_FAMILY_LABEL.rv, count: count('rv') },
            { key: 'building', label: SYSTEM_FAMILY_LABEL.building, count: count('building') },
          ]}
        />
        <label className="flex w-full items-center gap-2 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] sm:ml-auto sm:w-auto">
          <span className="shrink-0">Goes over</span>
          <ChevronSelect value={roofType} onChange={(e) => setRoofType(e.target.value)} wrapperClassName="min-w-0 flex-1 sm:w-56 sm:flex-none" className="!rounded-full !py-2 !text-sm">
            <option value="" style={OPTION_STYLE}>
              Any roof
            </option>
            {ALL_ROOF_TYPES.map((r) => (
              <option key={r} value={r} style={OPTION_STYLE}>
                {r}
              </option>
            ))}
          </ChevronSelect>
        </label>
      </motion.div>

      {shown.length === 0 ? (
        <Panel>
          <EmptyNote>
            No system matches.{' '}
            <button
              type="button"
              onClick={() => {
                setFamily('all')
                setRoofType('')
              }}
              className="font-semibold text-[var(--p-primary,#6DC015)] hover:underline"
            >
              Show every system
            </button>
          </EmptyNote>
        </Panel>
      ) : (
        <motion.div layout className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-2">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((s, i) => (
              <motion.div
                key={s.id}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: Math.min(0.1 + i * 0.06, 0.45) }}
                className="min-w-0"
              >
                <SystemCard system={s} pricing={pricing} coverage={coverage} canQuote={canQuote} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

/** The rate quotes use for a component in this system. */
function rateFor(c: SystemComponent, system: RoofSystem, coverage: Coverage): string {
  switch (c.product) {
    case 'seal':
    case 'tote':
      return `${coverage.coats} coats · ${coverage.sealSqftPerGallonPerCoat[system.installMethod].toLocaleString('en-US')} sq ft/gal`
    case 'clean':
      return `${coverage.cleanSqftPerGallon.toLocaleString('en-US')} sq ft/gal`
    case 'caulk':
      return `1 tube / ${coverage.caulkSqftPerTube.toLocaleString('en-US')} sq ft`
    case 'patch':
      return `${coverage.patchFtPerGallon.toLocaleString('en-US')} ft/gal`
    case 'tape':
      return `${TAPE_ROLL_FT} ft/roll`
  }
}

function SystemCard({ system: s, pricing, coverage, canQuote }: { system: RoofSystem; pricing: ClientPricing | null; coverage: Coverage; canQuote: boolean }) {
  return (
    <article
      className={twMerge(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] p-5 backdrop-blur-xl md:p-6',
        'bg-[image:var(--p-panel)] shadow-[var(--p-shadow)] transition-[border-color] duration-300 hover:border-[color-mix(in_oklab,var(--p-primary)_35%,transparent)]',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.1] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1" style={tint(s.family === 'rv' ? '#4CC3FF' : '#FF9F45')}>
          <Layers className="h-3 w-3" />
          {SYSTEM_FAMILY_LABEL[s.family]} · {s.installMethod === 'direct-to-deck' ? 'Direct to deck' : 'Over existing'}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1" style={tint('var(--p-primary, #6DC015)')}>
          <ShieldCheck className="h-3 w-3" />
          {SYSTEM_WARRANTY}
        </span>
      </div>

      <h2 className="relative mt-3 text-lg font-bold leading-snug text-[var(--p-ink,#fff)] md:text-xl">{s.name}</h2>
      <p className="relative mt-1 text-[11px] font-semibold text-[var(--p-kicker,#F9EA1C)]">{CRAZY_SEAL_LINE}</p>
      <p className="relative mt-3 text-sm leading-relaxed text-[var(--p-muted,#9DA3AB)]">{s.summary}</p>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {s.roofTypes.map((r) => (
          <span key={r} className="rounded-lg bg-white/[0.07] px-2.5 py-1 text-[12px] font-semibold text-[var(--p-ink,#fff)] ring-1 ring-white/[0.06]">
            {r}
          </span>
        ))}
      </div>

      <MiniLabel className="relative mt-5">Components, in install order</MiniLabel>
      <ol className="relative mt-2 space-y-1.5">
        {s.components.map((c, i) => (
          <motion.li
            key={`${c.product}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: 0.25 + i * 0.06 }}
            className="flex items-start justify-between gap-3 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/10 px-3 py-2 text-sm"
          >
            <span className="min-w-0">
              <span className="block font-semibold text-[var(--p-ink,#fff)]">
                <span className="mr-2 tabular-nums text-[var(--p-muted,#9DA3AB)]">{i + 1}.</span>
                {productLine(c.product).name}
              </span>
              <span className="block text-[12px] leading-snug text-[var(--p-muted,#9DA3AB)]">{c.use}</span>
            </span>
            <span className="shrink-0 pt-0.5 text-right text-[11.5px] tabular-nums text-[var(--p-accent,#F9EA1C)]">{rateFor(c, s, coverage)}</span>
          </motion.li>
        ))}
      </ol>

      <MiniLabel className="relative mt-5">Where it fits</MiniLabel>
      <ul className="relative mt-2 space-y-1.5">
        {s.fits.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-[var(--p-ink,#fff)]">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-primary,#6DC015)]" />
            {f}
          </li>
        ))}
      </ul>
      {s.notes.map((n) => (
        <p key={n} className="relative mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs ring-1" style={tint('var(--p-accent, #F9EA1C)')}>
          <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
          {n}
        </p>
      ))}

      <Estimator system={s} pricing={pricing} />

      <div className="relative mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-4">
        {s.guides.map((g) => (
          <a
            key={g.href}
            href={g.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-primary,#6DC015)] transition hover:brightness-125"
          >
            {g.href.endsWith('.pdf') ? <FileText className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
            {g.label}
          </a>
        ))}
        {canQuote && (
          <Link href="/portal/quotes/new/" className={twMerge(portalButton, 'ml-auto')}>
            <Calculator className="h-4 w-4" /> Quote this system
          </Link>
        )}
      </div>
    </article>
  )
}

type Estimate = { ok: true; result: PriceResult; sqft: number; materials: number; tapeRolls: number; tapeCost: number; total: number } | { ok: false; error: string }

function estimate(system: RoofSystem, pricing: ClientPricing, size: string, seams: string): Estimate {
  const rv = system.application === 'rv'
  const parsed = parseRoofInputs({
    application: system.application,
    installMethod: system.installMethod,
    color: 'White',
    sqft: rv ? null : size,
    rvLengthFt: rv ? size : null,
    seamsFt: seams,
  })
  if ('error' in parsed) return { ok: false, error: parsed.error }
  const result = priceQuote({
    inputs: parsed,
    catalog: pricing.catalog,
    prices: pricing.prices,
    priceList: pricing.priceList,
    settings: pricing.settings,
    tiers: pricing.tiers,
    audience: 'contractor',
    contractorTierId: pricing.contractorTierId,
    orderCount: pricing.orderCount,
    paymentTerms: pricing.paymentTerms,
  })
  const materials = round2(result.lines.reduce((sum, l) => sum + l.line_total, 0))
  // Quotes don't include Crazy Tape; a deck system needs it on every seam, so the estimate adds it at the same price and discount.
  const hasTape = system.components.some((c) => c.product === 'tape')
  const tapeRolls = hasTape && parsed.seamsFt > 0 ? Math.ceil(parsed.seamsFt / TAPE_ROLL_FT) : 0
  const tapeUnit = round2(listUnitPrice('tape', result.basis, pricing.priceList) * (1 - result.discount_pct / 100))
  const tapeCost = round2(tapeUnit * tapeRolls)
  return { ok: true, result, sqft: result.materials.sqft, materials, tapeRolls, tapeCost, total: round2(materials + tapeCost) }
}

/** What a sample job costs at this contractor's prices, worked out by the quote builder's engine. */
function Estimator({ system: s, pricing }: { system: RoofSystem; pricing: ClientPricing | null }) {
  const rv = s.application === 'rv'
  const [size, setSize] = useState(String(rv ? (s.sample.rvLengthFt ?? 30) : (s.sample.sqft ?? 1000)))
  const [seams, setSeams] = useState(String(s.sample.seamsFt))
  const est = useMemo(() => (pricing ? estimate(s, pricing, size, seams) : null), [s, pricing, size, seams])

  return (
    <div className="relative mt-5 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <MiniLabel className="text-[var(--p-kicker,#F9EA1C)]">Sample job at your prices</MiniLabel>
        {est?.ok && <span className="text-[11px] text-[var(--p-muted,#9DA3AB)]">{est.result.basis.label}</span>}
      </div>
      {!pricing ? (
        <p className="mt-3 text-sm text-[var(--p-muted,#9DA3AB)]">Prices aren’t available right now. The quote builder will have them when the store is back.</p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[var(--p-muted,#9DA3AB)]">{rv ? 'RV length (ft)' : 'Roof (sq ft)'}</span>
              <input inputMode="numeric" value={size} onChange={(e) => setSize(e.target.value)} className={twMerge(portalInput, 'py-2 tabular-nums')} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold text-[var(--p-muted,#9DA3AB)]">{s.installMethod === 'direct-to-deck' ? 'Deck seams (ft)' : 'Seams (ft)'}</span>
              <input inputMode="numeric" value={seams} onChange={(e) => setSeams(e.target.value)} className={twMerge(portalInput, 'py-2 tabular-nums')} />
            </label>
          </div>
          {est && !est.ok ? (
            <p className="mt-3 text-xs text-[#FFB4A8]">{est.error}</p>
          ) : est?.ok ? (
            <div className="mt-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p>
                  <span className="block bg-[linear-gradient(120deg,var(--p-primary,#6DC015),var(--p-accent,#F9EA1C))] bg-clip-text text-3xl font-black tabular-nums text-transparent">
                    {est.sqft ? usd(est.total / est.sqft) : '—'}
                  </span>
                  <span className="text-[11px] text-[var(--p-muted,#9DA3AB)]">per sq ft, materials{est.tapeRolls ? ', with Crazy Tape' : ''}</span>
                </p>
                <p className="text-right">
                  <span className="block text-lg font-bold tabular-nums text-[var(--p-ink,#fff)]">{usd(est.total)}</span>
                  <span className="text-[11px] text-[var(--p-muted,#9DA3AB)]">
                    {est.sqft.toLocaleString('en-US')} sq ft
                    {est.result.discount_pct > 0 && ` · ${discountLabel(est.result.tier_name, est.result.discount_pct)} off`}
                  </span>
                </p>
              </div>
              <ul className="mt-3 space-y-1 border-t border-white/[0.06] pt-3 text-xs">
                {est.result.lines.map((l, i) => (
                  <li key={`${l.variant_id}-${i}`} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate text-[var(--p-ink,#fff)]">
                      <span className="tabular-nums text-[var(--p-muted,#9DA3AB)]">{l.quantity} ×</span> {l.product_title} <span className="text-[var(--p-muted,#9DA3AB)]">{l.variant_title}</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--p-ink,#fff)]">{usd(l.line_total)}</span>
                  </li>
                ))}
                {est.tapeRolls > 0 && (
                  <li className="flex justify-between gap-3">
                    <span className="min-w-0 truncate text-[var(--p-ink,#fff)]">
                      <span className="tabular-nums text-[var(--p-muted,#9DA3AB)]">{est.tapeRolls} ×</span> Crazy Tape <span className="text-[var(--p-muted,#9DA3AB)]">{TAPE_ROLL_FT} ft roll</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-[var(--p-ink,#fff)]">{usd(est.tapeCost)}</span>
                  </li>
                )}
              </ul>
              {est.tapeRolls > 0 && <p className="mt-2 text-[11px] text-[var(--p-muted,#9DA3AB)]">Quotes don’t add Crazy Tape: order the rolls with the job’s materials.</p>}
              {est.result.unavailable.length > 0 && (
                <p className="mt-2 text-[11px] text-[#FFC2B8]">Not in the store right now: {est.result.unavailable.join(', ')}. A quote with them goes to Crazy Seal staff.</p>
              )}
              {est.result.shipping === 'freight' && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--p-muted,#9DA3AB)]">
                  <Truck className="h-3 w-3" /> A job this size ships freight, which Crazy Seal quotes.
                </p>
              )}
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
