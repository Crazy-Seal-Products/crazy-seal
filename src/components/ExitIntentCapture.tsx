'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { X, MessageSquare, Loader2 } from 'lucide-react'
import { Input, Button } from '@/lib/design-system'
import { useTracking } from '@/components/tracking'
import { trackMetaEvent, generateEventId } from '@/lib/tracking/meta-pixel'

/** Pages where abandoning visitors are worth a capture attempt. */
const TARGET_PATHS = ['/kit-builder', '/store']

const SESSION_KEY = 'cs_exit_capture_shown'
const IDLE_MS = 45_000

export function ExitIntentCapture() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const { visitorId, sessionId, trackEvent } = useTracking()

  const eligible = TARGET_PATHS.some(
    (p) => pathname === p || pathname?.startsWith(p + '/')
  )

  const trigger = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setOpen(true)
  }, [])

  useEffect(() => {
    if (!eligible || sessionStorage.getItem(SESSION_KEY)) return

    // Desktop: cursor leaving through the top of the viewport
    function onMouseOut(e: MouseEvent) {
      if (!e.relatedTarget && e.clientY <= 0) trigger()
    }

    // Mobile fallback: idle on the page
    const idleTimer = setTimeout(trigger, IDLE_MS)

    document.addEventListener('mouseout', onMouseOut)
    return () => {
      document.removeEventListener('mouseout', onMouseOut)
      clearTimeout(idleTimer)
    }
  }, [eligible, pathname, trigger])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!turnstileToken) {
      setError('Please complete the verification check.')
      setSubmitting(false)
      return
    }

    const formData = new FormData(e.currentTarget)
    const eventId = generateEventId()
    const sourcePage = `exit-intent:${pathname?.replace(/^\//, '') || 'unknown'}`

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name') as string,
          email: formData.get('email') as string,
          phone: formData.get('phone') as string,
          texting_consent: true,
          lead_type: 'quote',
          message: 'Requested a kit recommendation by text (exit capture).',
          source_page: sourcePage,
          visitor_id: visitorId,
          session_id: sessionId,
          turnstile_token: turnstileToken,
          event_id: eventId,
        }),
      })

      if (!res.ok) throw new Error('Failed to submit. Please try again.')

      await trackEvent('form_submitted', { source_page: sourcePage })
      trackMetaEvent('Lead', { content_name: sourcePage }, eventId)
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      turnstileRef.current?.reset()
      setTurnstileToken(null)
    } finally {
      setSubmitting(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl z-10 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <MessageSquare className="w-10 h-10 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#003365] mb-2">You&apos;re all set!</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              A Crazy Seal specialist will reach out shortly with the right kit
              for your roof.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold text-[#003365] mb-2 pr-8">
              Not sure which kit you need?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Leave your info and a specialist will text or call you with the
              exact kit for your roof — usually within one business day.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input name="name" size="lg" placeholder="Name" required />
              <Input name="phone" size="lg" type="tel" placeholder="Phone" required />
              <Input name="email" size="lg" type="email" placeholder="Email" required />
              <div className="flex justify-center">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={setTurnstileToken}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: 'light', size: 'normal' }}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
              )}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={submitting || !turnstileToken}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Get My Kit Recommendation'
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
