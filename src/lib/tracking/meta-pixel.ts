'use client'

/**
 * Meta (Facebook) Pixel helpers.
 *
 * The Pixel base code is loaded by <MetaPixel />. These helpers fire standard
 * events client-side AND mirror an `event_id` into the GTM dataLayer so the
 * server-side Conversions API event (sent from sGTM) can be deduplicated
 * against the browser event. Meta dedupes when the Pixel `eventID` matches the
 * CAPI `event_id` for the same event name.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
    _fbq?: unknown
    dataLayer?: Record<string, unknown>[]
  }
}

export type MetaStandardEvent =
  | 'PageView'
  | 'Lead'
  | 'Schedule'
  | 'CompleteRegistration'
  | 'Contact'
  | 'ViewContent'
  | 'Purchase'

export function isMetaPixelEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID)
}

/** Generate a unique id used to deduplicate the Pixel event with its CAPI twin. */
export function generateEventId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Fire a Meta standard event. Pass a stable `eventId` (and push the same value
 * to your CAPI tag) to enable deduplication.
 */
export function trackMetaEvent(
  event: MetaStandardEvent,
  params: Record<string, unknown> = {},
  eventId?: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return
  if (eventId) {
    window.fbq('track', event, params, { eventID: eventId })
  } else {
    window.fbq('track', event, params)
  }
}

/**
 * Push an event_id into the dataLayer so a server-side GTM / CAPI tag can read
 * it and send a deduplicated server event for the same conversion.
 */
export function pushDedupEventId(dataLayerEvent: string, eventId: string): void {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event: dataLayerEvent, event_id: eventId })
}
