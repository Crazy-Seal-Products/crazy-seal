'use client'

import { useEffect, useState, useTransition } from 'react'
import { CircleCheck, Loader2, MapPin, MessageSquarePlus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { sendPageFeedback } from '@/lib/support/actions'
import { Modal } from './modal'
import { BUTTON, textareaCls } from './styles'

const MAX = 4000

/**
 * The round button in the bottom-right corner of every admin page. It opens
 * a short form whose message goes to the Support inbox as Feedback, with the
 * page, time, sender and browser attached automatically (see sendPageFeedback).
 * A draft survives closing the form until it's sent.
 */
export function FeedbackButton({ pageLabel, firstName }: { pageLabel: string; firstName: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<number | null>(null)
  const [pending, start] = useTransition()

  const close = () => {
    setOpen(false)
    setError(null)
    setSent(null)
  }

  useEffect(() => {
    if (!open || sent === null) return
    const timer = setTimeout(close, 2600)
    return () => clearTimeout(timer)
  }, [open, sent])

  const submit = () => {
    if (pending || !message.trim()) return
    setError(null)
    start(async () => {
      const result = await sendPageFeedback({
        message,
        path: window.location.pathname + window.location.search,
        pageLabel,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        userAgent: navigator.userAgent,
      }).catch(() => ({ ok: false as const, error: 'Could not send. Check your connection and try again.' }))
      if (result.ok) {
        setMessage('')
        setSent('number' in result && result.number ? result.number : 0)
      } else {
        setError(result.error)
      }
    })
  }

  const now = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        title="Send feedback"
        className="group fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-adm-gold-bright to-adm-gold text-adm-gold-ink shadow-[0_10px_28px_-8px_rgb(245_197_66/0.75),0_2px_6px_rgb(0_0_0/0.25)] ring-1 ring-black/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgb(245_197_66/0.9),0_2px_6px_rgb(0_0_0/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adm-blue-bright print:hidden sm:bottom-5 sm:right-5"
      >
        <MessageSquarePlus className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
        {message.trim() && !open && <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-adm-blue-bright ring-2 ring-adm-bg" aria-hidden="true" />}
      </button>

      {open && (
        <Modal
          title="Send feedback"
          icon={<MessageSquarePlus className="h-4 w-4 text-adm-gold" />}
          onClose={close}
          className="max-w-lg shadow-[0_30px_80px_-20px_rgb(0_0_0/0.6)]"
        >
          {sent !== null ? (
            <div className="grid place-items-center gap-2 px-6 py-10 text-center" role="status">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-adm-green/15 text-adm-green">
                <CircleCheck className="h-6 w-6" />
              </span>
              <p className="text-[15px] font-semibold text-adm-ink">Thanks{firstName ? `, ${firstName}` : ''}!</p>
              <p className="max-w-xs text-[12.5px] leading-relaxed text-adm-muted">
                Your feedback is in{sent ? ` as #${sent}` : ''}. If we need more detail we’ll reply by email.
              </p>
            </div>
          ) : (
            <form
              className="grid gap-3 p-4"
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
            >
              <p className="text-[12.5px] leading-relaxed text-adm-muted">
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
                maxLength={MAX}
                aria-label="Your feedback"
                placeholder="e.g. The Orders filter forgets my date range when I open an order and come back."
                className={twMerge(textareaCls, 'min-h-[8.5rem] resize-y rounded-lg px-3 py-2.5 text-[13.5px] leading-relaxed')}
              />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-adm-faint">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{pageLabel}</span>
                </span>
                <span>{now}</span>
                <span className="ml-auto tabular-nums">{message.length > MAX - 500 ? `${MAX - message.length} left` : ''}</span>
              </div>
              {error && <p className="rounded-md bg-red-500/10 px-3 py-2 text-[12px] text-adm-red">{error}</p>}
              <div className="flex items-center justify-end gap-2 border-t border-adm-line pt-3">
                <span className="mr-auto hidden text-[11px] text-adm-faint sm:inline">Ctrl + Enter to send</span>
                <button type="button" onClick={close} className={BUTTON.default}>
                  Cancel
                </button>
                <button type="submit" disabled={pending || !message.trim()} className={BUTTON.gold}>
                  {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Send feedback
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  )
}
