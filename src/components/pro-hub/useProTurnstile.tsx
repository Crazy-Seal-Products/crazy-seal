'use client'

import { useRef, useState } from 'react'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { ensureTurnstileToken, FormTurnstile, TURNSTILE_RETRY_MESSAGE } from '@/components/forms/FormTurnstile'

type Check = { ok: true; token: string | null } | { ok: false; error: string }

/**
 * Cloudflare Turnstile for the Pro Hub's sign-in, sign-up and reset forms, so
 * scripts can't create accounts, send emails or guess passwords. Most people
 * never see it; it shows a "Verify you are human" box only when Cloudflare
 * isn't sure. Each token works once, so call reset() after every attempt.
 */
export function useProTurnstile(id: string) {
  const ref = useRef<TurnstileInstance | null>(null)
  const [current, setCurrent] = useState<string | null>(null)

  return {
    widget: <FormTurnstile id={id} turnstileRef={ref} onToken={setCurrent} appearance="interaction-only" />,
    /** A token to send with the request. Local development goes ahead without one (the server skips the check there). */
    async check(): Promise<Check> {
      if (process.env.NODE_ENV !== 'production') return { ok: true, token: current }
      const token = await ensureTurnstileToken(ref, current)
      return token ? { ok: true, token } : { ok: false, error: TURNSTILE_RETRY_MESSAGE }
    },
    reset() {
      ref.current?.reset()
      setCurrent(null)
    },
  }
}
