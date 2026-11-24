'use client'

import React, { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { ArrowRight, Calculator, Clock, Loader2, ShieldCheck, Truck } from 'lucide-react'
import { FormTurnstile, ensureTurnstileToken, TURNSTILE_RETRY_MESSAGE } from '@/components/forms/FormTurnstile'
import { useTracking } from '@/components/tracking'
import { roofSummary } from '@/lib/pricing/engine'
import type { ClientPricing } from '@/lib/pricing/load'
import { stripCosts, usd, type ShipTo } from '@/lib/pricing/types'
import { BUYER_ROLES, TIMELINES } from '@/lib/quotes/types'
import { QuoteLines } from './QuoteLines'
import { EMPTY_ROOF, RoofQuestions, usePricePreview, type RoofDraft } from './RoofQuestions'

/**
 * The public roof-only builder (/quote/): it opens on the roof questions and
 * prices the materials itself, live, with no product picking: the full price
 * with the live offer taken off (retail under 1,500 sq ft, project pricing by
 * roof size above). Saving (every quote is a lead) asks for a name and
 * email, a phone number once the total reaches capture_phone_at and a
 * ship-to address from capture_address_at, then sends the buyer to their
 * quote's own page, where the offer counts down from offer_hours.
 */

const INPUT =
  'w-full rounded-lg border border-gray-200 bg-slate-50/80 px-3 py-2.5 text-base text-gray-900 shadow-[inset_0_1px_2px_rgb(0_32_67/0.06)] outline-none transition focus:border-accent focus:bg-white focus:ring-4 focus:ring-accent/15 sm:text-sm'
const LABEL = 'block space-y-1 text-[13px] font-semibold text-gray-800'

export function PublicQuoteBuilder({ pricing, preview }: { pricing: ClientPricing; preview: boolean }) {
  const router = useRouter()
  const { visitorId, sessionId, trackEvent } = useTracking()
  const [draft, setDraft] = useState<RoofDraft>(EMPTY_ROOF)
  const [contact, setContact] = useState({ name: '', email: '', phone: '', buyerRole: '', timeline: '', notes: '' })
  const [ship, setShip] = useState<ShipTo>({ street: '', city: '', state: '', zip: '' })
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [token, setToken] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buyer = useMemo(() => ({ phone: contact.phone, shipTo: ship }), [contact.phone, ship])
  const { inputs, error: inputError, result } = usePricePreview(pricing, draft, buyer)
  const total = result?.total ?? 0
  const needsPhone = total >= pricing.settings.capture_phone_at
  const needsAddress = total >= pricing.settings.capture_address_at
  const priced = Boolean(result && result.lines.length)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inputs || !priced) return setError('Answer the roof questions first.')
    setSaving(true)
    setError(null)
    const form = new FormData(e.currentTarget)
    try {
      const t = await ensureTurnstileToken(turnstileRef, token)
      if (!t && process.env.NODE_ENV === 'production') throw new Error(TURNSTILE_RETRY_MESSAGE)
      const res = await fetch('/api/quotes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs,
          ...contact,
          shipTo: needsAddress || ship.street ? ship : null,
          website: form.get('website'),
          turnstile_token: t,
          visitor_id: visitorId,
          session_id: sessionId,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string; url?: string }
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.')
      void trackEvent('form_submitted', { source_page: '/quote/', total })
      if (json.url) router.push(json.url)
      else setError('Thanks! Check your email for your quote.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      turnstileRef.current?.reset()
      setToken(null)
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-3xl bg-white p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/5 sm:p-6">
        {preview && (
          <p className="mb-4 rounded-xl bg-amber-100 px-3 py-2 text-[13px] font-semibold text-amber-900">
            Preview: not live yet. Only signed-in Crazy Seal staff can see this page. Quotes saved here are real (they email the address you enter).
          </p>
        )}
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white">
            <Calculator className="h-[18px] w-[18px]" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold leading-tight text-primary sm:text-xl">Tell us about your roof</h2>
            <p className="text-[13px] text-gray-500">We work out the materials and price them as you go.</p>
          </div>
        </div>
        <RoofQuestions theme="light" draft={draft} onChange={setDraft} />
        {inputError && draft.application && <p className="mt-3 text-[13px] text-gray-500">{inputError}</p>}
      </div>

      <div className="grid content-start gap-4">
        <section className="rounded-3xl bg-white p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/5 sm:p-5" aria-live="polite">
          <h2 className="text-base font-extrabold text-primary">Your materials</h2>
          {result && inputs ? (
            <>
              <p className="mb-2 text-[12.5px] text-gray-500">
                {roofSummary(inputs)} · <span className="font-semibold text-gray-700">{result.basis.label}</span>
              </p>
              {priced ? (
                <>
                  <QuoteLines lines={stripCosts(result.lines)} totals={result} theme="light" />
                  {result.discount_total > 0 && (
                    <p className="mt-3 flex gap-2 rounded-lg bg-accent/[0.08] px-3 py-2 text-[12.5px] font-medium text-accent-dark">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0" /> A live offer: save your quote to hold this price for {pricing.settings.offer_hours} hours.
                    </p>
                  )}
                  {result.shipping === 'free' && result.shipping_total == null && (
                    <p className="mt-2 flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-gray-600">
                      <Truck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> Shipping is calculated at checkout. Add {usd(pricing.settings.free_shipping_over - result.total)} more for free shipping.
                    </p>
                  )}
                </>
              ) : (
                <p className="py-6 text-center text-sm text-gray-500">We can’t price this roof online. Call us and a specialist will quote it.</p>
              )}
              {result.unavailable.length > 0 && priced && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900">
                  {result.unavailable.join(', ')} can’t be priced online right now; a specialist will add it to your quote.
                </p>
              )}
              {result.shipping === 'freight' && (
                <p className="mt-3 flex gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[12.5px] text-gray-600">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-secondary" /> An order this size ships freight. Save your quote and a specialist will add the freight and send your invoice.
                </p>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">Answer the questions to see your materials and price.</p>
          )}
        </section>

        {priced && (
          <form onSubmit={save} className="rounded-3xl bg-white p-4 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.45)] ring-1 ring-black/5 sm:p-5">
            <h2 className="text-base font-extrabold text-primary">Save your quote</h2>
            <p className="mb-3 text-[12.5px] text-gray-500">We’ll email you a link. Your price is a live offer for {pricing.settings.offer_hours} hours; after that you can refresh it at the day’s prices.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className={LABEL}>
                <span>Name</span>
                <input required autoComplete="name" className={INPUT} value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
              </label>
              <label className={LABEL}>
                <span>Email</span>
                <input required type="email" autoComplete="email" className={INPUT} value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
              </label>
              {needsPhone && (
                <label className={LABEL}>
                  <span>Phone</span>
                  <input required type="tel" autoComplete="tel" className={INPUT} value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                </label>
              )}
              <label className={LABEL}>
                <span>You are a…</span>
                <select className={INPUT} value={contact.buyerRole} onChange={(e) => setContact({ ...contact, buyerRole: e.target.value })}>
                  <option value="">Choose (optional)</option>
                  {BUYER_ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className={LABEL}>
                <span>When are you starting?</span>
                <select className={INPUT} value={contact.timeline} onChange={(e) => setContact({ ...contact, timeline: e.target.value })}>
                  <option value="">Choose (optional)</option>
                  {TIMELINES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>
            {needsAddress && (
              <fieldset className="mt-3 grid gap-3 sm:grid-cols-6">
                <legend className="mb-1 text-[13px] font-semibold text-gray-800">Ship to</legend>
                <label className={`${LABEL} sm:col-span-6`}>
                  <span className="sr-only">Street</span>
                  <input required placeholder="Street address" autoComplete="shipping street-address" className={INPUT} value={ship.street ?? ''} onChange={(e) => setShip({ ...ship, street: e.target.value })} />
                </label>
                <label className={`${LABEL} sm:col-span-3`}>
                  <span className="sr-only">City</span>
                  <input required placeholder="City" autoComplete="shipping address-level2" className={INPUT} value={ship.city ?? ''} onChange={(e) => setShip({ ...ship, city: e.target.value })} />
                </label>
                <label className={`${LABEL} sm:col-span-1`}>
                  <span className="sr-only">State</span>
                  <input required placeholder="ST" maxLength={2} autoComplete="shipping address-level1" className={INPUT} value={ship.state ?? ''} onChange={(e) => setShip({ ...ship, state: e.target.value.toUpperCase() })} />
                </label>
                <label className={`${LABEL} sm:col-span-2`}>
                  <span className="sr-only">ZIP</span>
                  <input required placeholder="ZIP" inputMode="numeric" autoComplete="shipping postal-code" className={INPUT} value={ship.zip ?? ''} onChange={(e) => setShip({ ...ship, zip: e.target.value })} />
                </label>
              </fieldset>
            )}
            <label className={`${LABEL} mt-3`}>
              <span>Anything we should know? (optional)</span>
              <textarea rows={2} className={INPUT} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} />
            </label>
            {/* Honeypot: people never see this field. */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />
            <div className="mt-3">
              <FormTurnstile id="quote-builder-turnstile" turnstileRef={turnstileRef} onToken={setToken} />
            </div>
            {error && <p className="mt-2 text-[13px] font-medium text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-5 py-3 text-sm font-bold text-white shadow-[0_8px_22px_-8px_rgba(91,164,17,0.7)] transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Save my quote · {usd(total)}
            </button>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-gray-500">
              <ShieldCheck className="h-3.5 w-3.5 text-accent" /> No account needed. We only use your details for this quote.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
