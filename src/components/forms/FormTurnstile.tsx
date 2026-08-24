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
