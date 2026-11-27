'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2, Printer, Save } from 'lucide-react'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/portal-styles'
import { usd } from '@/lib/pricing/types'
import { savePortalProposal } from '@/lib/quotes/portal-actions'
import type { QuoteProposal } from '@/lib/quotes/types'
import { TweenMoney } from './ProposalSheet'

const LABEL = 'mb-1.5 block text-xs font-medium text-[var(--p-muted)]'

/**
 * The contractor's proposal to their own customer, built on this quote:
 * materials (Crazy Seal's price plus the contractor's markup), labor, notes.
 * The printable page is /portal/quotes/<id>/proposal/.
 */
export function ProposalEditor({ quoteId, merchandise, shipping, proposal, canEdit }: { quoteId: string; merchandise: number; shipping: number; proposal: QuoteProposal | null; canEdit: boolean }) {
  const [v, setV] = useState({
    customerName: proposal?.customerName ?? '',
    labor: proposal ? String(proposal.labor) : '',
    materialMarkupPct: proposal ? String(proposal.materialMarkupPct) : '25',
    notes: proposal?.notes ?? '',
  })
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const labor = Number(v.labor.replace(/[$,\s]/g, '')) || 0
  const markup = Number(v.materialMarkupPct.replace(/[%,\s]/g, '')) || 0
  const materials = Math.round(merchandise * (1 + markup / 100) * 100) / 100
  const total = Math.round((materials + shipping + labor) * 100) / 100

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <div className="grid content-start gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className={LABEL}>Customer</span>
            <input className={portalInput} disabled={!canEdit} value={v.customerName} onChange={(e) => setV({ ...v, customerName: e.target.value })} placeholder="Who it’s for" />
          </label>
          <label className="block">
            <span className={LABEL}>Labor ($)</span>
            <input className={portalInput} disabled={!canEdit} inputMode="decimal" value={v.labor} onChange={(e) => setV({ ...v, labor: e.target.value })} placeholder="0" />
          </label>
          <label className="block">
            <span className={LABEL}>Markup on materials (%)</span>
            <input className={portalInput} disabled={!canEdit} inputMode="decimal" value={v.materialMarkupPct} onChange={(e) => setV({ ...v, materialMarkupPct: e.target.value })} />
          </label>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-[var(--p-line)] bg-[linear-gradient(160deg,color-mix(in_oklab,var(--p-primary)_22%,transparent),rgba(0,0,0,0.15))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div aria-hidden="true" className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[var(--p-primary)] opacity-30 blur-2xl" />
          <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--p-muted)]">Customer price</p>
          <p className="relative mt-1 text-3xl font-black tabular-nums text-[var(--p-ink)]">
            <TweenMoney value={total} />
          </p>
          <p className="relative mt-2 space-y-0.5 text-[11px] leading-relaxed text-[var(--p-muted)]">
            <span className="block">Materials {usd(materials)}</span>
            {shipping > 0 && <span className="block">Shipping {usd(shipping)}</span>}
            <span className="block">Labor {usd(labor)}</span>
          </p>
        </div>
      </div>
      <label className="block">
        <span className={LABEL}>Scope and terms</span>
        <textarea className={portalInput} rows={3} disabled={!canEdit} placeholder="Scope, warranty, schedule… (shows on the proposal)" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {canEdit && (
          <button
            type="button"
            className={portalButton}
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await savePortalProposal(quoteId, v)
                setResult(r.ok ? { ok: true, text: r.message ?? 'Saved' } : { ok: false, text: r.error })
              })
            }
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save proposal
          </button>
        )}
        {proposal && (
          <Link href={`/portal/quotes/${quoteId}/proposal/`} className={portalGhostButton} target="_blank">
            <Printer className="h-4 w-4" /> Print proposal
          </Link>
        )}
        {result && <span className={result.ok ? 'text-sm font-medium text-[var(--p-primary)]' : 'text-sm font-medium text-red-300'}>{result.text}</span>}
      </div>
    </div>
  )
}
