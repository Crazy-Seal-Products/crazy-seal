'use client'

import React, { useMemo } from 'react'
import { twMerge } from 'tailwind-merge'
import { parseRoofInputs, priceQuote, roofSqft, RV_ROOF_WIDTH_FT, type PriceResult } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { APPLICATIONS, INSTALL_METHODS, ROOF_COLORS, type Application, type InstallMethod, type RoofColor, type RoofInputs, type ShipTo } from '@/lib/pricing/types'

/**
 * The roof questions the builders ask (the public /quote/, the contractor
 * portal's new quote and the admin's), and the live price preview: the pure
 * engine run in the browser on the prices the page was given (no costs,
 * except in the admin for roles that can open Pricing). The server prices the quote again when it's saved.
 */

export interface RoofDraft {
  application: Application | ''
  installMethod: InstallMethod | ''
  sqft: string
  rvLengthFt: string
  seamsFt: string
  color: RoofColor
  roofType?: string | null
}

export const EMPTY_ROOF: RoofDraft = { application: '', installMethod: '', sqft: '', rvLengthFt: '', seamsFt: '', color: 'White' }

export function usePricePreview(pricing: ClientPricing, draft: RoofDraft, buyer: { phone?: string | null; shipTo?: ShipTo | null } = {}) {
  return useMemo((): { inputs: RoofInputs | null; error: string | null; result: PriceResult | null } => {
    if (!draft.application || !draft.installMethod) return { inputs: null, error: null, result: null }
    const parsed = parseRoofInputs(draft)
    if ('error' in parsed) return { inputs: null, error: parsed.error, result: null }
    const result = priceQuote({
      inputs: parsed,
      catalog: pricing.catalog,
      prices: pricing.prices,
      priceList: pricing.priceList,
      settings: pricing.settings,
      tiers: pricing.tiers,
      audience: pricing.audience,
      contractorTierId: pricing.contractorTierId,
      orderCount: pricing.orderCount,
      paymentTerms: pricing.paymentTerms,
      buyer,
    })
    return { inputs: parsed, error: null, result }
  }, [pricing, draft, buyer])
}

/** light: the public builder; dark: the contractor portal; admin: Crazy Seal Admin (its adm-* tokens, light or dark). */
type Theme = 'light' | 'dark' | 'admin'

const T = {
  light: {
    label: 'mb-1.5 block text-[13px] font-semibold text-gray-800',
    hint: 'mt-1 block text-[11.5px] text-gray-500',
    input:
      'w-full rounded-lg border border-gray-200 bg-slate-50/80 px-3 py-2.5 text-base text-gray-900 shadow-[inset_0_1px_2px_rgb(0_32_67/0.06)] outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15 sm:text-sm',
    chip: 'rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-semibold text-gray-700 transition hover:border-accent/50',
    chipOn: 'border-accent bg-accent/[0.07] text-primary ring-2 ring-accent/30',
  },
  dark: {
    label: 'mb-1.5 block text-[13px] font-semibold text-white/85',
    hint: 'mt-1 block text-[11.5px] text-blue-100/50',
    input:
      'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-blue-100/30 outline-none transition focus:border-accent/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-accent/15',
    chip: 'rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-sm font-semibold text-white/75 transition hover:border-white/25',
    chipOn: 'border-accent/70 bg-accent/15 text-white ring-2 ring-accent/25',
  },
  admin: {
    label: 'mb-1 block text-[11px] font-medium text-adm-muted',
    hint: 'mt-1 block text-[11px] text-adm-faint',
    input:
      'h-8 w-full rounded-md border border-adm-line bg-adm-input px-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25',
    chip: 'rounded-md border border-adm-line bg-adm-input px-2.5 py-2 text-left text-[12.5px] font-medium text-adm-text transition hover:border-adm-blue-bright/60 hover:text-adm-ink',
    chipOn: 'border-adm-blue-bright bg-adm-blue-bright/10 text-adm-ink ring-2 ring-adm-blue-bright/25',
  },
} as const

const SWATCH: Record<RoofColor, string> = { White: '#f8fafc', Gray: '#9ca3af', Tan: '#d6c3a0' }

function Choice<K extends string>({ theme, label, options, value, onChange }: { theme: Theme; label: string; options: readonly { key: K; label: string }[]; value: K | ''; onChange: (k: K) => void }) {
  const t = T[theme]
  return (
    <fieldset>
      <legend className={t.label}>{label}</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <button key={o.key} type="button" aria-pressed={value === o.key} onClick={() => onChange(o.key)} className={twMerge(t.chip, value === o.key && t.chipOn)}>
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function RoofQuestions({ theme, draft, onChange, className }: { theme: Theme; draft: RoofDraft; onChange: (next: RoofDraft) => void; className?: string }) {
  const t = T[theme]
  const set = (patch: Partial<RoofDraft>) => onChange({ ...draft, ...patch })
  const isRv = draft.application === 'rv'
  const rvSqft = isRv && Number(draft.rvLengthFt) > 0 ? roofSqft({ application: 'rv', installMethod: 'over-existing', sqft: null, rvLengthFt: Number(draft.rvLengthFt), seamsFt: 0, color: 'White' }) : null

  return (
    <div className={twMerge('grid gap-5', className)}>
      <Choice theme={theme} label="What are you sealing?" options={APPLICATIONS} value={draft.application} onChange={(application) => set({ application })} />
      <Choice
        theme={theme}
        label="What does it go over?"
        options={INSTALL_METHODS.map((m) => ({ key: m.key, label: m.key === 'over-existing' ? 'An existing roof' : 'Bare wood decking' }))}
        value={draft.installMethod}
        onChange={(installMethod) => set({ installMethod })}
      />
      {draft.application && (
        <div className="grid gap-4 sm:grid-cols-2">
          {isRv ? (
            <label className="block">
              <span className={t.label}>RV length (ft)</span>
              <input className={t.input} inputMode="numeric" placeholder="e.g. 32" value={draft.rvLengthFt} onChange={(e) => set({ rvLengthFt: e.target.value.replace(/[^\d.]/g, '') })} />
              <span className={t.hint}>{rvSqft ? `About ${rvSqft.toLocaleString('en-US')} sq ft of roof (${RV_ROOF_WIDTH_FT} ft wide)` : `We figure the roof at ${RV_ROOF_WIDTH_FT} ft wide.`}</span>
            </label>
          ) : (
            <label className="block">
              <span className={t.label}>Roof size (sq ft)</span>
              <input className={t.input} inputMode="numeric" placeholder="e.g. 2,400" value={draft.sqft} onChange={(e) => set({ sqft: e.target.value.replace(/[^\d,]/g, '') })} />
              <span className={t.hint}>Length × width of the area to coat.</span>
            </label>
          )}
          <label className="block">
            <span className={t.label}>Seams (linear ft)</span>
            <input className={t.input} inputMode="numeric" placeholder="0" value={draft.seamsFt} onChange={(e) => set({ seamsFt: e.target.value.replace(/[^\d,]/g, '') })} />
            <span className={t.hint}>{isRv ? 'Front, back and side seams. Leave 0 if you’re not sure.' : 'Seams and flashing to patch first. 0 if none.'}</span>
          </label>
        </div>
      )}
      {draft.application && (
        <fieldset>
          <legend className={t.label}>Color</legend>
          <div className="flex flex-wrap gap-2">
            {ROOF_COLORS.map((c) => (
              <button key={c} type="button" aria-pressed={draft.color === c} onClick={() => set({ color: c })} className={twMerge(t.chip, 'flex items-center gap-2', draft.color === c && t.chipOn)}>
                <span aria-hidden="true" className="h-4 w-4 rounded-full ring-1 ring-black/15" style={{ background: SWATCH[c] }} />
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </div>
  )
}
