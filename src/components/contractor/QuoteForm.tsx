'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { type TurnstileInstance } from '@marsidev/react-turnstile'
import { Check, Loader2, Send } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { FormTurnstile } from '@/components/forms/FormTurnstile'
import { EASE_OUT_EXPO } from '@/components/motion'
import { useTracking } from '@/components/tracking'
import type { PublicContractor } from '@/lib/contractors/types'

/**
 * "Request a quote" on a contractor's page. Posts to /api/contractors/quote,
 * which saves the lead and emails it to the contractor. Styled with the
 * page's --cb-* brand variables.
 */

const INPUT =
  'h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-(--cb-primary) focus:ring-4 focus:ring-(--cb-primary)/15'
const LABEL = 'block space-y-1.5 text-sm font-semibold text-slate-700'

export function QuoteForm({ contractor: c }: { contractor: PublicContractor }) {
  const { visitorId, sessionId, trackEvent } = useTracking()
  const turnstileRef = useRef<TurnstileInstance>(null)
  const [token, setToken] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{ firstName: string; email: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const commercial = c.segment === 'commercial'

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    if (!token) return setError('Please complete the verification check below.')
    setSending(true)
    setError(null)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    try {
      const res = await fetch('/api/contractors/quote/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: c.slug,
          name,
          email,
          phone: form.get('phone'),
          zip: form.get('zip'),
          size: form.get('size'),
          message: form.get('message'),
          texting_consent: form.get('texting_consent') === 'on',
          website: form.get('website'),
          turnstile_token: token,
          visitor_id: visitorId,
          session_id: sessionId,
        }),
      })
      const json = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(json.error || 'Something went wrong. Please try again.')
      setSent({ firstName: name.split(/\s+/)[0] || name, email })
      void trackEvent('form_submitted', { source_page: `/contractor/${c.slug}` })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      turnstileRef.current?.reset()
      setToken(null)
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="flex min-h-[26rem] flex-col items-center justify-center text-center"
          role="status"
        >
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="grid h-16 w-16 place-items-center rounded-full bg-(--cb-accent) text-(--cb-on-accent) shadow-lg"
          >
            <Check className="h-8 w-8" strokeWidth={3} />
          </motion.span>
          <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight">Thanks, {sent.firstName}.</h3>
          <p className="mt-2 max-w-sm text-slate-600">
            Your request is on its way to {c.name}. They’ll reply to {sent.email}.
          </p>
        </motion.div>
      ) : (
        <motion.form key="form" exit={{ opacity: 0, y: -8 }} onSubmit={submit} className="relative grid gap-4 sm:grid-cols-2">
          <label className={LABEL}>
            <span>Name</span>
            <input name="name" required autoComplete="name" className={INPUT} />
          </label>
          <label className={LABEL}>
            <span>Email</span>
            <input name="email" type="email" required autoComplete="email" className={INPUT} />
          </label>
          <label className={LABEL}>
            <span>
              Phone <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input name="phone" type="tel" autoComplete="tel" className={INPUT} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={LABEL}>
              <span>ZIP</span>
              <input name="zip" inputMode="numeric" pattern="\d{5}" maxLength={5} autoComplete="postal-code" className={INPUT} />
            </label>
            <label className={LABEL}>
              <span>{commercial ? 'Roof sq ft' : 'RV length (ft)'}</span>
              <input name="size" inputMode="numeric" maxLength={12} placeholder={commercial ? '10,000' : '32'} className={INPUT} />
            </label>
          </div>
          <label className={twMerge(LABEL, 'sm:col-span-2')}>
            <span>What’s going on with your roof?</span>
            <textarea
              name="message"
              rows={4}
              maxLength={3000}
              placeholder={commercial ? 'Leaks, ponding, roof type, timeline…' : 'Leaks, soft spots, roof type, year and make…'}
              className={twMerge(INPUT, 'h-auto resize-y py-3 leading-relaxed')}
            />
          </label>
          <label className="flex items-start gap-2.5 text-sm text-slate-600 sm:col-span-2">
            <input name="texting_consent" type="checkbox" className="mt-0.5 h-4 w-4 accent-(--cb-primary)" />
            <span>It’s OK for {c.name} to text me about this request.</span>
          </label>
          {/* Honeypot: hidden from people, filled in by bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <FormTurnstile id={`turnstile-quote-${c.slug}`} turnstileRef={turnstileRef} onToken={setToken} />
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-(--cb-accent) px-6 py-3.5 text-sm font-bold text-(--cb-on-accent) shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-70"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? 'Sending…' : 'Send my request'}
            </button>
            {error && (
              <p role="alert" className="text-sm font-semibold text-red-600">
                {error}
              </p>
            )}
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  )
}
