'use client'

import React from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'

type FormTurnstileProps = {
  /** Must be unique on the page. Duplicate Turnstile ids break iOS Safari. */
  id: string
  onToken: (token: string | null) => void
  turnstileRef?: React.Ref<TurnstileInstance>
  theme?: 'light' | 'dark' | 'auto'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

export function FormTurnstile({
  id,
  onToken,
  turnstileRef,
  theme = 'light',
  appearance,
}: FormTurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) {
    return (
      <p className="text-sm text-red-600 text-center">
        Verification is temporarily unavailable. Please refresh and try again.
      </p>
    )
  }

  return (
    <Turnstile
      id={id}
      ref={turnstileRef}
      siteKey={siteKey}
      onSuccess={onToken}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
      onTimeout={() => onToken(null)}
      options={{
        theme,
        size: 'flexible',
        ...(appearance ? { appearance } : {}),
      }}
    />
  )
}

export const TURNSTILE_RETRY_MESSAGE =
  "We couldn't verify your connection. Check your signal and tap submit again."

/**
 * Returns a usable Turnstile token. The widget is often invisible, so when its
 * token has expired or errored (common on mobile after switching to the camera
 * or on a weak signal) the user has no way to fix it. Here we reset the widget
 * and wait for a fresh token instead of failing straight away.
 */
export async function ensureTurnstileToken(
  ref: React.RefObject<TurnstileInstance | null>,
  current: string | null,
  timeoutMs = 20000,
): Promise<string | null> {
  const widget = ref.current
  if (!widget) return current
  if (current && !widget.isExpired()) return current
  try {
    widget.reset()
    return await widget.getResponsePromise(timeoutMs)
  } catch {
    return null
  }
}
