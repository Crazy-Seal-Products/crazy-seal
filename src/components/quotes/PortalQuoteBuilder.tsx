'use client'

import React, { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, BadgePercent, Caravan, Check, Clock, Hammer, House, Info, Loader2, MapPin, PackageX, Save, SquareStack, Truck, Wallet, Warehouse, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { portalButton, portalInput } from '@/components/portal/portal-styles'
import { roofSqft, roofSummary, RV_ROOF_WIDTH_FT } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { APPLICATIONS, INSTALL_METHODS, ROOF_COLORS, stripCosts, usd, type Application, type InstallMethod, type ShipTo } from '@/lib/pricing/types'
import { createPortalQuote } from '@/lib/quotes/portal-actions'
import { ProposalSheet, SheetNote } from './ProposalSheet'
import { EMPTY_ROOF, usePricePreview, type RoofDraft } from './RoofQuestions'

/**
 * New materials quote in the contractor portal (/portal/quotes/new/), laid
 * out like Thermo's quote builder: the roof questions on the left (project,
 * application and install method as toggle cards, size and seams as sliders
 * with a number, color swatches, ship-to), and on the right the live
 * "Material proposal" (the full price less the contractor's best discount:
 * the live offer, their order-count level or their tier) with "Save quote",
 * which holds the price as a live offer for offer_hours. Pick a
 * project (or open it from one: ?project=<id>) to prefill the roof and
 * ship-to from it. The server prices the quote again when it's saved.
 */

export interface QuoteProjectOption {
  id: string
  name: string
  stage: string
  roof_type: string | null
  sqft: number | null
  seams: number | null
  color: string | null
  site: ShipTo | null
}

/** The roof a project describes (also used by the admin's new quote). */
export function draftFromProject(p: QuoteProjectOption | null): RoofDraft {
  if (!p) return EMPTY_ROOF
  const rt = (p.roof_type ?? '').toLowerCase()
  const application = rt.includes('rv') ? 'rv' : rt.includes('shingle') || rt.includes('residential') ? 'residential' : p.roof_type || p.sqft ? 'commercial' : ''
  const color = ROOF_COLORS.find((c) => c.toLowerCase() === (p.color ?? '').toLowerCase()) ?? 'White'
  return {
    application,
    installMethod: 'over-existing',
    // An RV project's size is its roof area; the builder asks for the length, so work it back.
    sqft: application !== 'rv' && p.sqft ? String(p.sqft) : '',
    rvLengthFt: application === 'rv' && p.sqft ? String(Math.round(p.sqft / RV_ROOF_WIDTH_FT)) : '',
    seamsFt: p.seams ? String(p.seams) : '',
    color,
    roofType: p.roof_type,
  }
}

const EMPTY_SHIP: ShipTo = { street: '', city: '', state: '', zip: '' }

const APPLICATION_CARD: Record<Application, { icon: LucideIcon; sub: string }> = {
  rv: { icon: Caravan, sub: 'Motorhomes, campers and trailers' },
  commercial: { icon: Warehouse, sub: 'Flat and low-slope buildings' },
  residential: { icon: House, sub: 'Flat and low-slope homes' },
}

const METHOD_CARD: Record<InstallMethod, { icon: LucideIcon; title: string; sub: string }> = {
  'over-existing': { icon: SquareStack, title: 'An existing roof', sub: 'Restore over the roof that’s there' },
  'direct-to-deck': { icon: Hammer, title: 'Bare wood decking', sub: 'Seal new decking directly' },
}

const SWATCH: Record<(typeof ROOF_COLORS)[number], string> = {
  White: 'linear-gradient(145deg, #FFFFFF 0%, #E2E8F0 100%)',
  Gray: 'linear-gradient(145deg, #B8BEC7 0%, #6B7280 100%)',
  Tan: 'linear-gradient(145deg, #E8D8B8 0%, #B89A6A 100%)',
}

/** Slider ranges per application; the number box takes any size the engine allows. */
const SIZE_RANGE: Record<Application, { min: number; max: number; step: number }> = {
  rv: { min: 5, max: 60, step: 1 },
  residential: { min: 100, max: 8000, step: 50 },
  commercial: { min: 500, max: 100000, step: 500 },
}
const SEAM_RANGE: Record<Application, { min: number; max: number; step: number }> = {
  rv: { min: 0, max: 200, step: 5 },
  residential: { min: 0, max: 1500, step: 10 },
  commercial: { min: 0, max: 6000, step: 25 },
}

const toNum = (s: string) => {
  const n = Number(s.replace(/,/g, ''))
  return s.trim() && Number.isFinite(n) ? n : null
}

const selectCls = twMerge(portalInput, '[&>option]:text-gray-900')

function Step({ n, title, hint, children }: { n: number; title: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--p-line)] pt-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-[11px] font-bold tracking-normal text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
            {n}
          </span>
          {title}
        </h2>
        {hint}
      </div>
      {children}
    </section>
  )
}

function ToggleCard({ on, onClick, icon: Icon, title, sub, stacked = false }: { on: boolean; onClick: () => void; icon: LucideIcon; title: string; sub?: string; stacked?: boolean }) {
  return (
    <motion.button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={twMerge(
        'group relative overflow-hidden rounded-2xl border px-3.5 py-3.5 text-left transition-[background-color,border-color,box-shadow,translate] duration-300',
        on
          ? 'border-[var(--p-primary)] bg-[color-mix(in_oklab,var(--p-primary)_14%,transparent)] shadow-[0_14px_34px_-18px_var(--p-primary),inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'border-[var(--p-line)] bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]',
      )}
    >
      {on && <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[var(--p-primary)] opacity-25 blur-2xl" />}
      <span className={twMerge('relative flex items-start gap-3', stacked && 'flex-col gap-2.5')}>
        <span
          className={twMerge(
            'grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 transition duration-300',
            on ? 'bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)] ring-white/20' : 'bg-white/[0.05] text-[var(--p-accent)] ring-white/10 group-hover:scale-105',
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <span className={twMerge('min-w-0', !stacked && 'pr-5')}>
          <span className="block text-sm font-semibold leading-snug text-[var(--p-ink)]">{title}</span>
          {sub && <span className="mt-0.5 block text-[11px] leading-snug text-[var(--p-muted)]">{sub}</span>}
        </span>
      </span>
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--p-primary)] text-white shadow-[0_0_12px_-2px_var(--p-primary)]"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const RANGE_CLS = [
  'h-2 w-full cursor-pointer appearance-none rounded-full outline-none',
  '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[var(--p-primary)]',
  '[&::-webkit-slider-thumb]:shadow-[0_0_0_5px_color-mix(in_oklab,var(--p-primary)_28%,transparent),0_4px_12px_rgba(0,0,0,0.45)]',
  '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-200 active:[&::-webkit-slider-thumb]:scale-125',
  '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white',
  '[&::-moz-range-thumb]:bg-[var(--p-primary)] [&::-moz-range-thumb]:shadow-[0_0_0_5px_color-mix(in_oklab,var(--p-primary)_28%,transparent),0_4px_12px_rgba(0,0,0,0.45)]',
  'focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-white/40',
].join(' ')

/** A slider with the live number in mono beside the label, and a box to type an exact value. */
function RangeField({
  label,
  unit,
  value,
  onChange,
  range,
  hint,
  placeholder,
}: {
  label: string
  unit: string
  value: string
  onChange: (v: string) => void
  range: { min: number; max: number; step: number }
  hint?: React.ReactNode
  placeholder: string
}) {
  const n = toNum(value)
  const slider = n == null ? range.min : Math.min(range.max, Math.max(range.min, n))
  const pct = ((slider - range.min) / (range.max - range.min)) * 100
  const id = React.useId()
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-xs font-medium text-[var(--p-muted)]">
          {label}
        </label>
        <span className="flex items-center gap-1.5 rounded-xl border border-[var(--p-line)] bg-black/25 py-1 pl-2.5 pr-2.5 shadow-[inset_0_1px_3px_rgba(0,0,0,0.35)] transition focus-within:border-[var(--p-primary)] focus-within:ring-4 focus-within:ring-[color-mix(in_oklab,var(--p-primary)_20%,transparent)]">
          <input
            id={id}
            inputMode="numeric"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/[^\d,.]/g, ''))}
            className="w-20 bg-transparent text-right font-mono text-sm font-semibold tabular-nums text-[var(--p-ink)] outline-none placeholder:text-white/25"
          />
          <span className="font-mono text-[11px] text-[var(--p-muted)]">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        aria-label={`${label} slider`}
        min={range.min}
        max={range.max}
        step={range.step}
        value={slider}
        onChange={(e) => onChange(e.target.value)}
        className={RANGE_CLS}
        style={{
          background: `linear-gradient(90deg, var(--p-primary) 0%, var(--p-accent) ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[var(--p-muted)] opacity-70">
        <span>{range.min.toLocaleString('en-US')}</span>
        {hint && <span className="text-center font-sans opacity-100">{hint}</span>}
        <span>{range.max.toLocaleString('en-US')}+</span>
      </div>
    </div>
  )
}

export function PortalQuoteBuilder({
  pricing,
  projects,
  initialProjectId,
  tierLabel,
  terms,
  readOnly,
  contractorName,
  recent,
}: {
  pricing: ClientPricing
  projects: QuoteProjectOption[]
  initialProjectId: string | null
  tierLabel: string
  terms: boolean
  readOnly: boolean
  /** The contractor's name, the brand on the proposal. */
  contractorName: string
  /** The recent quotes panel under the builder. */
  recent?: React.ReactNode
}) {
  const router = useRouter()
  const initial = projects.find((p) => p.id === initialProjectId) ?? null
  const [projectId, setProjectId] = useState<string>(initial?.id ?? '')
  const [draft, setDraft] = useState<RoofDraft>(() => draftFromProject(initial))
  const [ship, setShip] = useState<ShipTo>(() => ({ ...EMPTY_SHIP, ...(initial?.site ?? {}) }))
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  const buyer = useMemo(() => ({ phone: 'on file', shipTo: ship }), [ship])
  const { inputs, error: inputError, result } = usePricePreview(pricing, draft, buyer)
  const project = projects.find((p) => p.id === projectId) ?? null
  const set = (patch: Partial<RoofDraft>) => setDraft((d) => ({ ...d, ...patch }))
  const app = draft.application
  const isRv = app === 'rv'
  const rvLen = toNum(draft.rvLengthFt)
  const rvSqft = isRv && rvLen && rvLen > 0 ? roofSqft({ application: 'rv', installMethod: 'over-existing', sqft: null, rvLengthFt: rvLen, seamsFt: 0, color: 'White' }) : null

  function pickProject(id: string) {
    setProjectId(id)
    const p = projects.find((x) => x.id === id) ?? null
    if (p) {
      setDraft(draftFromProject(p))
      setShip({ ...EMPTY_SHIP, ...(p.site ?? {}) })
    }
  }

  function save() {
    if (!inputs) return setError(inputError ?? 'Answer the roof questions first.')
    setError(null)
    start(async () => {
      const r = await createPortalQuote({ inputs, projectId: projectId || null, shipTo: ship.street || ship.city || ship.zip ? ship : null, notes })
      if (!r.ok) return setError(r.error)
      router.push(`/portal/quotes/${r.id}/`)
    })
  }

  const lines = result && inputs ? stripCosts(result.lines) : null
  const totals = result && inputs ? result : null
  const place = [ship.city, ship.state].filter(Boolean).join(', ')
  const coats = Math.max(1, Math.round(pricing.settings.coverage.coats || 2))

  return (
    <>
      <Link
        href={project ? `/portal/projects/${project.id}/` : '/portal/quotes/'}
        className="group mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--p-muted)] transition hover:text-[var(--p-ink)]"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> {project ? project.name : 'All quotes'}
      </Link>
      <ViewHeader
        kicker="Quote builder"
        title="Spec a roof in minutes"
        description={`Every gallon and tube priced live: retail under ${(pricing.priceList.bands[0]?.minSqft ?? 1500).toLocaleString('en-US')} sq ft, project pricing by roof size above, at your price: ${tierLabel}.`}
      />

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Panel className="min-w-0">
          <div className="space-y-6">
            <Step n={1} title="Project">
              <select className={selectCls} value={projectId} onChange={(e) => pickProject(e.target.value)} aria-label="Project">
                <option value="">No project (just pricing)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--p-muted)]">Quoting a project in Lead moves it to Quoted. Its size, seams, color and site fill in below.</p>
            </Step>

            <Step n={2} title="The roof">
              <fieldset>
                <legend className="mb-2 text-xs font-medium text-[var(--p-muted)]">What are you sealing?</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {APPLICATIONS.map((a) => (
                    <ToggleCard key={a.key} stacked on={app === a.key} onClick={() => set({ application: a.key })} icon={APPLICATION_CARD[a.key].icon} title={a.label} sub={APPLICATION_CARD[a.key].sub} />
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-4">
                <legend className="mb-2 text-xs font-medium text-[var(--p-muted)]">What does it go over?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {INSTALL_METHODS.map((m) => (
                    <ToggleCard
                      key={m.key}
                      on={draft.installMethod === m.key}
                      onClick={() => set({ installMethod: m.key })}
                      icon={METHOD_CARD[m.key].icon}
                      title={METHOD_CARD[m.key].title}
                      sub={METHOD_CARD[m.key].sub}
                    />
                  ))}
                </div>
              </fieldset>
            </Step>

            <AnimatePresence initial={false}>
              {app && (
                <motion.div
                  key="size"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                  className="space-y-6 overflow-hidden"
                >
                  <Step n={3} title="Size and seams">
                    <div className="space-y-5">
                      {isRv ? (
                        <RangeField
                          label="RV length"
                          unit="ft"
                          placeholder="32"
                          value={draft.rvLengthFt}
                          onChange={(rvLengthFt) => set({ rvLengthFt })}
                          range={SIZE_RANGE.rv}
                          hint={rvSqft ? `≈ ${rvSqft.toLocaleString('en-US')} sq ft at ${RV_ROOF_WIDTH_FT} ft wide` : `Figured at ${RV_ROOF_WIDTH_FT} ft wide`}
                        />
                      ) : (
                        <RangeField label="Roof area" unit="sq ft" placeholder="2,400" value={draft.sqft} onChange={(sqft) => set({ sqft })} range={SIZE_RANGE[app]} hint="Length × width to coat" />
                      )}
                      <RangeField
                        label="Seams and flashing"
                        unit="ft"
                        placeholder="0"
                        value={draft.seamsFt}
                        onChange={(seamsFt) => set({ seamsFt })}
                        range={SEAM_RANGE[app]}
                        hint={isRv ? 'Front, back and side seams' : 'To patch first · 0 if none'}
                      />
                    </div>
                  </Step>

                  <Step n={4} title="Color">
                    <div className="grid grid-cols-3 gap-2">
                      {ROOF_COLORS.map((c) => {
                        const on = draft.color === c
                        return (
                          <motion.button
                            key={c}
                            type="button"
                            aria-pressed={on}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => set({ color: c })}
                            className={twMerge(
                              'flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left text-sm font-semibold text-[var(--p-ink)] transition duration-300',
                              on
                                ? 'border-[var(--p-primary)] bg-[color-mix(in_oklab,var(--p-primary)_12%,transparent)] shadow-[0_12px_28px_-18px_var(--p-primary)]'
                                : 'border-[var(--p-line)] bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/25',
                            )}
                          >
                            <motion.span
                              aria-hidden="true"
                              animate={{ scale: on ? 1.08 : 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              className={twMerge('h-8 w-8 shrink-0 rounded-full shadow-[inset_0_-3px_6px_rgba(0,0,0,0.18),0_4px_10px_-4px_rgba(0,0,0,0.6)] ring-2', on ? 'ring-[var(--p-primary)]' : 'ring-white/15')}
                              style={{ background: SWATCH[c] }}
                            />
                            {c}
                          </motion.button>
                        )
                      })}
                    </div>
                  </Step>
                </motion.div>
              )}
            </AnimatePresence>

            <Step n={app ? 5 : 3} title="Ship to" hint={<MapPin className="h-4 w-4 text-[var(--p-accent)]" />}>
              <div className="grid grid-cols-6 gap-2">
                <input className={`${portalInput} col-span-6`} placeholder="Street address" value={ship.street ?? ''} onChange={(e) => setShip({ ...ship, street: e.target.value })} />
                <input className={`${portalInput} col-span-3`} placeholder="City" value={ship.city ?? ''} onChange={(e) => setShip({ ...ship, city: e.target.value })} />
                <input className={`${portalInput} col-span-1 px-2 text-center`} placeholder="ST" maxLength={2} value={ship.state ?? ''} onChange={(e) => setShip({ ...ship, state: e.target.value.toUpperCase() })} />
                <input className={`${portalInput} col-span-2`} placeholder="ZIP" inputMode="numeric" value={ship.zip ?? ''} onChange={(e) => setShip({ ...ship, zip: e.target.value })} />
              </div>
              <textarea className={`${portalInput} mt-2`} rows={2} placeholder="Notes for Crazy Seal (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Step>

            <AnimatePresence initial={false}>
              {inputError && app && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl bg-[color-mix(in_oklab,var(--p-accent)_12%,transparent)] px-3 py-2 text-xs font-medium text-[var(--p-accent)] ring-1 ring-[color-mix(in_oklab,var(--p-accent)_30%,transparent)]"
                >
                  {inputError}
                </motion.p>
              )}
            </AnimatePresence>

            <p className="flex gap-2 rounded-xl bg-white/[0.04] p-3 text-[11px] leading-relaxed text-[var(--p-muted)] ring-1 ring-white/[0.06]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--p-accent)]" />
              Quantities use Crazy Seal’s coverage rates ({coats} coat{coats === 1 ? '' : 's'}). Crazy Seal prices the quote again when you save it and holds the price as a live offer for {pricing.settings.offer_hours} hours; after that you can refresh it at the day’s prices.
            </p>
          </div>
        </Panel>

        <div className="min-w-0 xl:sticky xl:top-6">
          <ProposalSheet
            brandName={contractorName}
            preparedFor={project?.name ?? 'Price check (no project)'}
            subtitle={inputs ? roofSummary(inputs) + (place ? ` · ships to ${place}` : '') : null}
            meta={[tierLabel]}
            live
            lines={lines}
            totals={totals}
            offer={result?.lines.length ? <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Held {pricing.settings.offer_hours} hours once saved</span> : null}
            notices={
              result && inputs ? (
                <>
                  <SheetNote icon={<BadgePercent className="h-3.5 w-3.5" />}>{result.basis.label}</SheetNote>
                  {result.shipping === 'free' && result.shipping_total == null && (
                    <SheetNote icon={<Truck className="h-3.5 w-3.5" />}>
                      Shipping is calculated at checkout. Free from {usd(pricing.settings.free_shipping_over, false)} ({usd(pricing.settings.free_shipping_over - result.total)} more).
                    </SheetNote>
                  )}
                  {result.unavailable.length > 0 && (
                    <SheetNote tone="warn" icon={<PackageX className="h-3.5 w-3.5" />}>
                      {result.unavailable.join(', ')} can’t be priced online; Crazy Seal will add it.
                    </SheetNote>
                  )}
                  {result.shipping === 'freight' && <SheetNote icon={<Truck className="h-3.5 w-3.5" />}>Ships freight: Crazy Seal quotes the freight before you order.</SheetNote>}
                  {terms && <SheetNote icon={<Wallet className="h-3.5 w-3.5" />}>You’re on payment terms: Crazy Seal will invoice you when you order.</SheetNote>}
                </>
              ) : null
            }
            footer={
              <>
                <button type="button" className={twMerge(portalButton, 'w-full py-3.5 text-base')} disabled={pending || readOnly || !result?.lines.length} onClick={save}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pending ? 'Saving…' : 'Save quote'}
                </button>
                <AnimatePresence>
                  {error && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700 ring-1 ring-red-200">
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>
                {readOnly && <p className="mt-3 text-center text-xs font-medium text-amber-700">Admin view is read-only: quotes can’t be saved here.</p>}
                <div className="mt-3 text-center">
                  <Link href="/portal/quotes/" className="text-xs font-semibold text-slate-400 transition hover:text-slate-700">
                    Cancel
                  </Link>
                </div>
              </>
            }
          />
        </div>
      </div>

      {recent && <div className="mt-5">{recent}</div>}
    </>
  )
}
