'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Headset, Loader2, RefreshCw } from 'lucide-react'
import { MISSING_LABEL, type Handoff, type MissingKey, type ShipTo } from '@/lib/pricing/types'
import type { QuoteStatus } from '@/lib/quotes/types'

/**
 * What the buyer can do on their quote's page (/quote/<token>/): fill in
 * missing details, check out (a Shopify invoice for the quote), refresh the
 * price once the live offer ends ("Refresh my price"), or ask for a
 * specialist. Each posts to /api/quotes/<token>/….
 */

const INPUT =
  'w-full rounded-lg border border-gray-200 bg-slate-50/80 px-3 py-2.5 text-base text-gray-900 outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15 sm:text-sm'
const PRIMARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_-8px_rgba(91,164,17,0.7)] transition hover:-translate-y-0.5 disabled:opacity-60'
const SECONDARY =
  'inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-accent/50 disabled:opacity-60'

const HANDOFF_COPY: Record<Handoff, string> = {
  freight: 'Your order ships freight. A Crazy Seal specialist will add the freight and email you an invoice to pay.',
  terms: 'Crazy Seal will invoice you for this order.',
  no_access: 'A Crazy Seal specialist is finishing your checkout and will email you an invoice shortly.',
  incomplete: 'A Crazy Seal specialist has your quote and will be in touch.',
}

async function post(url: string, body: unknown): Promise<Record<string, unknown>> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) throw Object.assign(new Error(String(json.error || 'Something went wrong. Please try again.')), { json })
  return json
}

export function BuyerQuoteActions({
  token,
  status,
  missing,
  handoff,
  expired,
  phone,
  shipTo,
}: {
  token: string
  status: QuoteStatus
  missing: MissingKey[]
  handoff: Handoff | null
  expired: boolean
  phone: string | null
  shipTo: ShipTo | null
}) {
  const router = useRouter()
  const base = `/api/quotes/${token}`
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [info, setInfo] = useState({ phone: phone ?? '', street: shipTo?.street ?? '', city: shipTo?.city ?? '', state: shipTo?.state ?? '', zip: shipTo?.zip ?? '' })
  const [askOpen, setAskOpen] = useState(false)
  const [message, setMessage] = useState('')

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key)
    setError(null)
    setNotice(null)
    try {
      await fn()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      router.refresh()
    } finally {
      setBusy(null)
    }
  }

  if (status === 'ordered') return <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent-dark">Ordered. Thank you! Your order confirmation is in your email.</p>
  if (status === 'lost' || status === 'cancelled') return <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-gray-600">This quote is closed. Call us or build a new quote for today’s prices.</p>

  const specialist = (
    <div className="space-y-2">
      {askOpen ? (
        <>
          <textarea rows={3} className={INPUT} placeholder="What would you like to ask? (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button
            type="button"
            disabled={busy !== null}
            className={SECONDARY}
            onClick={() =>
              run('specialist', async () => {
                await post(`${base}/specialist/`, { message })
                setAskOpen(false)
                setNotice('Thanks! A Crazy Seal roofing specialist will contact you shortly.')
              })
            }
          >
            {busy === 'specialist' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Headset className="h-4 w-4" />} Send to a specialist
          </button>
        </>
      ) : (
        <button type="button" className={SECONDARY} onClick={() => setAskOpen(true)}>
          <Headset className="h-4 w-4" /> Talk to a specialist
        </button>
      )}
    </div>
  )

  let main: React.ReactNode = null
  if (expired) {
    main = (
      <button type="button" disabled={busy !== null} className={PRIMARY} onClick={() =>
          run('refresh', async () => {
            await post(`${base}/refresh/`, {})
            router.refresh()
          })
        }
      >
        {busy === 'refresh' ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Refresh my price
      </button>
    )
  } else if (missing.length) {
    main = (
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault()
          run('info', async () => {
            await post(`${base}/info/`, {
              ...(missing.includes('phone') ? { phone: info.phone } : {}),
              ...(missing.includes('ship_to') ? { shipTo: { street: info.street, city: info.city, state: info.state, zip: info.zip } } : {}),
            })
            router.refresh()
          })
        }}
      >
        <p className="text-[13px] font-semibold text-gray-800">Before checkout we need your {missing.map((m) => MISSING_LABEL[m].toLowerCase()).join(' and ')}.</p>
        {missing.includes('phone') && <input required type="tel" autoComplete="tel" placeholder="Phone" className={INPUT} value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />}
        {missing.includes('ship_to') && (
          <div className="grid grid-cols-6 gap-2">
            <input required placeholder="Street address" autoComplete="shipping street-address" className={`${INPUT} col-span-6`} value={info.street} onChange={(e) => setInfo({ ...info, street: e.target.value })} />
            <input required placeholder="City" autoComplete="shipping address-level2" className={`${INPUT} col-span-3`} value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} />
            <input required placeholder="ST" maxLength={2} autoComplete="shipping address-level1" className={`${INPUT} col-span-1`} value={info.state} onChange={(e) => setInfo({ ...info, state: e.target.value.toUpperCase() })} />
            <input required placeholder="ZIP" inputMode="numeric" autoComplete="shipping postal-code" className={`${INPUT} col-span-2`} value={info.zip} onChange={(e) => setInfo({ ...info, zip: e.target.value })} />
          </div>
        )}
        <button type="submit" disabled={busy !== null} className={PRIMARY}>
          {busy === 'info' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} Save and continue
        </button>
      </form>
    )
  } else if (handoff) {
    main = <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-700">{HANDOFF_COPY[handoff]}</p>
  } else {
    main = (
      <button
        type="button"
        disabled={busy !== null}
        className={PRIMARY}
        onClick={() =>
          run('checkout', async () => {
            const json = await post(`${base}/checkout/`, {})
            if (typeof json.url === 'string') window.location.assign(json.url)
          })
        }
      >
        {busy === 'checkout' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />} {status === 'checkout' ? 'Continue to checkout' : 'Check out'}
      </button>
    )
  }

  return (
    <div className="space-y-3">
      {main}
      {error && <p className="text-[13px] font-medium text-red-600">{error}</p>}
      {notice && <p className="text-[13px] font-medium text-accent-dark">{notice}</p>}
      {specialist}
    </div>
  )
}
