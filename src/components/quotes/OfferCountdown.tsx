'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCountdown } from '@/lib/quotes/types'

/**
 * The live offer's countdown: "Offer ends in 2d 14h 03m", ticking every
 * second. The server renders it at `serverNow` and the browser takes over
 * after mount, so both first renders match. With refreshOnExpire, the page
 * reloads its data when the offer ends (so "Refresh my price" appears).
 */
export function OfferCountdown({
  expiresAt,
  serverNow,
  refreshOnExpire = false,
  prefix = 'Offer ends in',
  endedText = 'Offer ended',
  className,
}: {
  expiresAt: string
  serverNow: number
  refreshOnExpire?: boolean
  prefix?: string
  endedText?: string
  className?: string
}) {
  const router = useRouter()
  const end = Date.parse(expiresAt)
  const [now, setNow] = useState(serverNow)
  const fired = useRef(end <= serverNow)

  useEffect(() => {
    const tick = () => setNow(Date.now())
    const first = window.setTimeout(tick, 0)
    const id = window.setInterval(tick, 1000)
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [])

  const left = end - now
  useEffect(() => {
    if (left > 0 || fired.current) return
    fired.current = true
    if (refreshOnExpire) router.refresh()
  }, [left, refreshOnExpire, router])

  return (
    <span className={className} suppressHydrationWarning>
      {left > 0 ? `${prefix} ${formatCountdown(left)}` : endedText}
    </span>
  )
}
