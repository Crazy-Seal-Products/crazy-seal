'use client'

import React, { useRef, useState } from 'react'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useFinalStepVisible } from '@/components/forms/form-ui'

type FormTurnstileProps = {
  /** Must be unique on the page. Duplicate Turnstile ids break iOS Safari. */
  id: string
  onToken: (token: string | null) => void
  turnstileRef?: React.Ref<TurnstileInstance>
  theme?: 'light' | 'dark' | 'auto'
  appearance?: 'always' | 'execute' | 'interaction-only'
}

/** Widgets currently showing the "Verify you are human" checkbox. */
const awaitingTap = new WeakSet<TurnstileInstance>()

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value)
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value
}

export function FormTurnstile({
  id,
  onToken,
  turnstileRef,
  theme = 'light',
  appearance,
}: FormTurnstileProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const instance = useRef<TurnstileInstance | null>(null)

  // Turnstile can't show its checkbox inside a hidden container (earlier
  // stepper steps), which left phones stuck with no token and nothing to tap.
  // Render only once the final step is on screen, then stay mounted.
  const visible = useFinalStepVisible()
  const [shown, setShown] = useState(visible)
  if (visible && !shown) setShown(true)

  if (!siteKey) {
    return (
      <p className="text-sm text-red-600 text-center">
        Verification is temporarily unavailable. Please refresh and try again.
      </p>
    )
  }
  if (!shown) return null

  const markTap = (needed: boolean) => {
    const w = instance.current
    if (!w) return
    if (needed) awaitingTap.add(w)
    else awaitingTap.delete(w)
  }

  return (
    <Turnstile
      id={id}
      ref={(w: TurnstileInstance | null) => {
        instance.current = w
        assignRef(turnstileRef, w)
      }}
      siteKey={siteKey}
      onSuccess={(token) => {
        markTap(false)
        onToken(token)
      }}
      onExpire={() => onToken(null)}
      onError={() => onToken(null)}
      onTimeout={() => onToken(null)}
      onBeforeInteractive={() => markTap(true)}
      onAfterInteractive={() => markTap(false)}
      options={{
        theme,
        size: 'flexible',
        ...(appearance ? { appearance } : {}),
      }}
    />
  )
}

export const TURNSTILE_RETRY_MESSAGE =
  'Tick "Verify you are human" above, then tap submit again. If you don\'t see it, check your signal and try again.'

/**
 * Returns a usable Turnstile token. The widget is often invisible, so when its
 * token has expired or errored (common on mobile after switching to the camera
 * or on a weak signal) we reset it and wait for a fresh one instead of failing
 * straight away. If it's showing its checkbox we leave it alone for the user.
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
    if (awaitingTap.has(widget)) return await widget.getResponsePromise(1500)
    widget.reset()
    return await widget.getResponsePromise(timeoutMs)
  } catch {
    return null
  }
}
