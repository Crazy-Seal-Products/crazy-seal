'use client'

import { useEffect, useState, useTransition } from 'react'
import { usePathname } from 'next/navigation'
import { CircleCheck, Loader2, MapPin, MessageSquarePlus, X } from 'lucide-react'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'

const MAX = 4000

/**
 * The round feedback button in the bottom-right corner of every contractor
 * portal page (the admin has the same one). It opens a short form whose
 * message goes to Crazy Seal's Support inbox as Feedback from this account,
 * with the page attached; replies show up under Support and by email. In
 * View as it's shown but can't send (read-only).
 */
export function PortalFeedbackButton({ firstName, readOnly }: { firstName: string; readOnly: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, start] = useTransition()

  const close = () => {
    setOpen(false)
    setError(null)
    setSent(false)
  }

  useEffect(() => {
    if (!open || !sent) return
    const t = setTimeout(close, 2600)
    return () => clearTimeout(t)
  }, [open, sent])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const submit = () => {
    if (pending || !message.trim() || readOnly) return
    setError(null)
    start(async () => {
      try {
        const page = window.location.pathname + window.location.search
        const res = await fetch('/api/pro/support/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'general_feedback',
            subject: `Portal feedback: ${pathname}`.slice(0, 150),
            body: `${message.trim()}\n\nPage: ${page}\nScreen: ${window.innerWidth}×${window.innerHeight}`.slice(0, MAX),
          }),
        })
        const data = await res.json().catch(() => null)
        if (!res.ok) {
          setError(data?.error || 'Could not send. Try again.')
          return
        }
        setMessage('')
        setSent(true)
      } catch {
        setError('Could not send. Check your connection and try again.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className="group fixed bottom-4 right-4 z-[55] grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-[#FFE066] to-[#F5C542] text-[#2A2100] shadow-[0_10px_28px_-8px_rgb(245_197_66/0.75),0_2px_6px_rgb(0_0_0/0.25)] ring-1 ring-black/10 transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white print:hidden sm:bottom-5 sm:right-5"
      >
        <MessageSquarePlus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        {message.trim() && !open && <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-[var(--p-primary)] ring-2 ring-[var(--p-surface)]" aria-hidden="true" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Send feedback"
            className="relative w-full max-w-lg rounded-t-3xl border border-white/10 bg-[var(--p-raised)] p-6 text-[var(--p-ink)] shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MessageSquarePlus className="h-5 w-5 text-[#F5C542]" /> Send feedback
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="rounded-full p-1.5 text-[var(--p-muted)] hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            {sent ? (
              <div className="grid place-items-center gap-2 py-8 text-center" role="status">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <CircleCheck className="h-6 w-6" />
                </span>
                <p className="text-[15px] font-semibold">Thanks{firstName ? `, ${firstName}` : ''}!</p>
                <p className="max-w-xs text-sm text-[var(--p-muted)]">Crazy Seal has it. Replies show up under Support and by email.</p>
              </div>
            ) : (
              <form
                className="grid gap-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  submit()
                }}
              >
                <p className="text-sm text-[var(--p-muted)]">
                  Something broken, confusing, or missing? Tell us what happened or what you need. The page you’re on is attached for you.
                </p>
                <textarea
                  autoFocus
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                  rows={6}
                  aria-label="Your feedback"
                  placeholder="e.g. I can’t find where to file the warranty for last week’s job."
                  className="min-h-[8.5rem] w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-[var(--p-ink)] outline-none placeholder:text-white/30 focus:border-white/30"
                />
                <p className="flex items-center gap-1 text-xs text-[var(--p-muted)]">
                  <MapPin className="h-3.5 w-3.5" /> {pathname}
                </p>
                {readOnly && <p className="rounded-lg bg-amber-400/10 px-3 py-2 text-xs text-amber-200">Read-only in admin view: feedback can’t be sent from here.</p>}
                {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
                <div className="flex justify-end gap-2 border-t border-white/10 pt-3">
                  <button type="button" onClick={close} className={portalGhostButton}>
                    Cancel
                  </button>
                  <button type="submit" disabled={pending || !message.trim() || readOnly} className={portalButton}>
                    {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Send feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
