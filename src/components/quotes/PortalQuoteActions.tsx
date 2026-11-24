'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CircleCheck, CircleAlert, Info, Loader2, RefreshCw, ShoppingCart } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/portal-styles'
import { MISSING_LABEL, type Handoff, type MissingKey, type ShipTo } from '@/lib/pricing/types'
import { placePortalOrder, refreshPortalQuote, savePortalQuoteInfo } from '@/lib/quotes/portal-actions'
import type { QuoteStatus } from '@/lib/quotes/types'

/**
 * Ordering from a quote in the contractor portal: fill in what's missing,
 * then "Place order" (the Shopify checkout for the
 * quote, or for a contractor on terms, an order Crazy Seal invoices). Once
 * the live offer ends, "Refresh my price" prices it again. Only roles with
 * orders.create can order.
 */

const BIG = twMerge(portalButton, 'w-full py-3 text-[15px]')

/** A quiet note in the side panel. */
function Note({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'muted' | 'good' }) {
  return (
    <p
      className={twMerge(
        'flex gap-2.5 rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1',
        tone === 'good'
          ? 'bg-[color-mix(in_oklab,var(--p-primary)_14%,transparent)] font-semibold text-[var(--p-ink)] ring-[color-mix(in_oklab,var(--p-primary)_35%,transparent)] shadow-[0_12px_30px_-18px_var(--p-primary)]'
          : 'bg-white/[0.04] text-[var(--p-muted)] ring-white/[0.07]',
      )}
    >
      {tone === 'good' ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-primary)]" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />}
      <span>{children}</span>
    </p>
  )
}

const HANDOFF_COPY: Partial<Record<Handoff, string>> = {
  freight: 'This order ships freight. Crazy Seal will quote the freight and send the invoice.',
  no_access: 'Crazy Seal is finishing this checkout and will send the invoice.',
}

export function PortalQuoteActions({
  quoteId,
  status,
  missing,
  handoff,
  expired,
  terms,
  canOrder,
  canEdit,
  phone,
  shipTo,
  invoiceUrl,
  orderRequestedAt,
}: {
  quoteId: string
  status: QuoteStatus
  missing: MissingKey[]
  handoff: Handoff | null
  expired: boolean
  terms: boolean
  canOrder: boolean
  canEdit: boolean
  phone: string | null
  shipTo: ShipTo | null
  invoiceUrl: string | null
  /** When a contractor on terms already asked Crazy Seal to invoice this quote. */
  orderRequestedAt: string | null
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [info, setInfo] = useState({ phone: phone ?? '', street: shipTo?.street ?? '', city: shipTo?.city ?? '', state: shipTo?.state ?? '', zip: shipTo?.zip ?? '' })

  function run(key: string, fn: () => Promise<{ ok: true; message?: string; url?: string } | { ok: false; error: string }>) {
    setBusy(key)
    setError(null)
    setNotice(null)
    start(async () => {
      const r = await fn()
      setBusy(null)
      if (!r.ok) {
        setError(r.error)
        router.refresh()
        return
      }
      if (r.url) {
        window.location.assign(r.url)
        return
      }
      if (r.message) setNotice(r.message)
      router.refresh()
    })
  }

  if (status === 'ordered') return <Note tone="good">Ordered. The order is on the project and in Orders.</Note>
  if (status === 'lost' || status === 'cancelled') return <Note>This quote is closed. Make a new one for today’s prices.</Note>

  let main: React.ReactNode
  if (expired) {
    main = canEdit ? (
      <button type="button" className={BIG} disabled={pending} onClick={() => run('refresh', () => refreshPortalQuote(quoteId))}>
        {busy === 'refresh' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh my price
      </button>
    ) : (
      <Note>This offer ended. Ask whoever made the quote to refresh the price.</Note>
    )
  } else if (missing.length) {
    main = canEdit ? (
      <form
        className="space-y-2.5 rounded-2xl bg-[color-mix(in_oklab,var(--p-accent)_8%,transparent)] p-4 ring-1 ring-[color-mix(in_oklab,var(--p-accent)_28%,transparent)]"
        onSubmit={(e) => {
          e.preventDefault()
          run('info', () =>
            savePortalQuoteInfo(quoteId, {
              ...(missing.includes('phone') ? { phone: info.phone } : {}),
              ...(missing.includes('ship_to') ? { shipTo: { street: info.street, city: info.city, state: info.state, zip: info.zip } } : {}),
            }),
          )
        }}
      >
        <p className="flex items-start gap-2 text-sm font-semibold text-[var(--p-ink)]">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
          Before ordering, add the {missing.map((m) => MISSING_LABEL[m].toLowerCase()).join(' and ')}.
        </p>
        {missing.includes('phone') && <input required type="tel" className={portalInput} placeholder="Phone for delivery" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />}
        {missing.includes('ship_to') && (
          <div className="grid grid-cols-6 gap-2">
            <input required className={`${portalInput} col-span-6`} placeholder="Street address" value={info.street} onChange={(e) => setInfo({ ...info, street: e.target.value })} />
            <input required className={`${portalInput} col-span-3`} placeholder="City" value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} />
            <input required className={`${portalInput} col-span-1`} placeholder="ST" maxLength={2} value={info.state} onChange={(e) => setInfo({ ...info, state: e.target.value.toUpperCase() })} />
            <input required className={`${portalInput} col-span-2`} placeholder="ZIP" value={info.zip} onChange={(e) => setInfo({ ...info, zip: e.target.value })} />
          </div>
        )}
        <button type="submit" className={twMerge(portalGhostButton, 'w-full')} disabled={pending}>
          {busy === 'info' && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </form>
    ) : (
      <Note>This quote still needs the {missing.map((m) => MISSING_LABEL[m].toLowerCase()).join(' and ')}.</Note>
    )
  } else if (!canOrder) {
    main = <Note>Ask your owner or operations lead to place the order.</Note>
  } else if (terms && orderRequestedAt) {
    main = (
      <Note tone="good">
        Order sent to Crazy Seal on {new Date(orderRequestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. They’ll confirm it and invoice you.
      </Note>
    )
  } else if (terms) {
    main = (
      <div className="space-y-2.5">
        <button type="button" className={BIG} disabled={pending} onClick={() => run('order', () => placePortalOrder(quoteId))}>
          {busy === 'order' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Place order
        </button>
        <p className="text-center text-xs text-[var(--p-muted)]">Crazy Seal will invoice you.</p>
      </div>
    )
  } else if (handoff && HANDOFF_COPY[handoff]) {
    main = <Note>{HANDOFF_COPY[handoff]}</Note>
  } else {
    main = (
      <div className="space-y-2.5">
        <button type="button" className={BIG} disabled={pending} onClick={() => run('order', () => placePortalOrder(quoteId))}>
          {busy === 'order' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} {status === 'checkout' ? 'Continue to checkout' : 'Place order'}
        </button>
        {status === 'checkout' && invoiceUrl && <p className="text-center text-xs text-[var(--p-muted)]">Checkout is open for this revision.</p>}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {main}
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-3 py-2 text-sm font-medium text-red-200 ring-1 ring-red-400/30">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-[color-mix(in_oklab,var(--p-primary)_12%,transparent)] px-3 py-2 text-sm font-medium text-[var(--p-ink)] ring-1 ring-[color-mix(in_oklab,var(--p-primary)_30%,transparent)]">
          {notice}
        </p>
      )}
    </div>
  )
}
