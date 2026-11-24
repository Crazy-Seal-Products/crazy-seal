'use client'

import React, { useActionState, useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { ActionButton, type ActionResult } from '@/components/portal/admin/controls'
import { BUTTON, inputCls, labelCls, textareaCls } from '@/components/portal/admin/styles'
import {
  addQuoteNote,
  cancelQuote,
  clearQuoteOverride,
  createQuoteCheckout,
  linkQuoteOrder,
  markQuoteLost,
  overrideQuotePrice,
  reopenQuote,
  repriceQuoteAsStaff,
  resendQuoteLink,
} from '@/lib/quotes/admin-actions'
import type { PriceOverride, QuoteStatus } from '@/lib/quotes/types'

/** Staff controls on a quote (Admin > Quotes > a quote). Each calls a server action in lib/quotes/admin-actions. */

function Result({ r }: { r: ActionResult | null }) {
  if (!r) return null
  return <span className={twMerge('text-[11.5px]', r.ok ? 'text-adm-green' : 'text-adm-red')}>{r.ok ? r.message ?? 'Done' : r.error}</span>
}

function useRun() {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  const run = (fn: () => Promise<ActionResult>) => {
    setResult(null)
    start(async () => setResult(await fn()))
  }
  return { pending, result, run }
}

export function OverrideForm({ id, current, disabled }: { id: string; current: PriceOverride | null; disabled: boolean }) {
  const [v, setV] = useState({ discountPct: current?.discountPct != null ? String(current.discountPct) : '', freight: current?.freight != null ? String(current.freight) : '', reason: '' })
  const { pending, result, run } = useRun()
  return (
    <form
      className="grid gap-2 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        run(() => overrideQuotePrice(id, v))
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <label className={labelCls}>
          <span>Discount % (replaces every other discount)</span>
          <input className={inputCls} inputMode="decimal" disabled={disabled} value={v.discountPct} onChange={(e) => setV({ ...v, discountPct: e.target.value })} placeholder="Best discount" />
        </label>
        <label className={labelCls}>
          <span>Freight $</span>
          <input className={inputCls} inputMode="decimal" disabled={disabled} value={v.freight} onChange={(e) => setV({ ...v, freight: e.target.value })} placeholder="None" />
        </label>
      </div>
      <label className={labelCls}>
        <span>Reason (staff only)</span>
        <input className={inputCls} disabled={disabled} value={v.reason} onChange={(e) => setV({ ...v, reason: e.target.value })} placeholder="e.g. matched a competitor’s price" />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending || disabled} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Override and reprice
        </button>
        {current && !disabled && (
          <button type="button" disabled={pending} className={BUTTON.default} onClick={() => run(() => clearQuoteOverride(id))}>
            Remove override
          </button>
        )}
        <Result r={result} />
      </div>
    </form>
  )
}

function ReasonAction({ label, placeholder, tone, action, required }: { label: string; placeholder: string; tone: 'default' | 'danger'; action: (reason: string) => Promise<ActionResult>; required?: boolean }) {
  const [reason, setReason] = useState('')
  const { pending, result, run } = useRun()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input className={twMerge(inputCls, 'min-w-[10rem] flex-1')} placeholder={placeholder} value={reason} onChange={(e) => setReason(e.target.value)} />
      <button type="button" disabled={pending || (required && !reason.trim())} className={BUTTON[tone]} onClick={() => run(() => action(reason))}>
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {label}
      </button>
      <Result r={result} />
    </div>
  )
}

export function QuoteStaffActions({ id, status, hasOrder, handoff }: { id: string; status: QuoteStatus; hasOrder: boolean; handoff: string | null }) {
  const active = status === 'open' || status === 'checkout'
  const [order, setOrder] = useState('')
  const { pending, result, run } = useRun()
  return (
    <div className="grid gap-3 p-3">
      {active && (
        <div className="flex flex-wrap gap-2">
          <ActionButton action={createQuoteCheckout.bind(null, id)} tone={handoff ? 'gold' : 'default'} confirm={handoff ? 'Open a Shopify checkout for this handed-off quote?' : undefined}>
            Create checkout
          </ActionButton>
          <ActionButton action={repriceQuoteAsStaff.bind(null, id)} confirm="Reprice from today’s price list, costs and discounts? This makes a new revision with a new live offer.">
            Reprice
          </ActionButton>
          <ActionButton action={resendQuoteLink.bind(null, id)}>Email the link again</ActionButton>
        </div>
      )}
      {active && <ReasonAction label="Mark lost" placeholder="Why it was lost" tone="danger" required action={markQuoteLost.bind(null, id)} />}
      {active && <ReasonAction label="Cancel" placeholder="Reason (optional)" tone="danger" action={cancelQuote.bind(null, id)} />}
      {(status === 'lost' || status === 'cancelled') && (
        <div>
          <ActionButton action={reopenQuote.bind(null, id)}>Reopen</ActionButton>
        </div>
      )}
      {!hasOrder && (
        <div className="flex flex-wrap items-center gap-2">
          <input className={twMerge(inputCls, 'w-40')} placeholder="Order #1234" value={order} onChange={(e) => setOrder(e.target.value)} />
          <button type="button" disabled={pending || !order.trim()} className={BUTTON.default} onClick={() => run(() => linkQuoteOrder(id, order))}>
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Link order
          </button>
          <Result r={result} />
        </div>
      )}
    </div>
  )
}

export function QuoteNoteForm({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(addQuoteNote.bind(null, id), null)
  return (
    <form action={formAction} className="grid gap-2 border-b border-adm-line-soft p-3">
      <textarea name="note" className={textareaCls} placeholder="Add a note for staff (the buyer never sees it)" />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className={BUTTON.default}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Add note
        </button>
        <Result r={state} />
      </div>
    </form>
  )
}
