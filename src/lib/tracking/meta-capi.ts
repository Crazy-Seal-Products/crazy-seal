import { createHash } from 'crypto'

/**
 * Meta (Facebook) Conversions API — server-side.
 *
 * Mirrors the old WordPress plugin flow: the server sends conversion events
 * directly to Meta with hashed customer data, alongside the browser Pixel.
 * When the Pixel event and this server event share the same `event_id`, Meta
 * deduplicates them automatically.
 *
 * Env:
 *   NEXT_PUBLIC_META_PIXEL_ID  (Pixel / Dataset ID — reused server-side)
 *   META_CAPI_ACCESS_TOKEN     (Conversions API access token, secret)
 *   META_TEST_EVENT_CODE       (optional — routes events to Test Events view)
 */

const GRAPH_VERSION = 'v21.0'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE

export type MetaCapiEventName = 'Lead' | 'PageView' | 'Contact' | 'CompleteRegistration' | 'Schedule'

export interface MetaUserData {
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  country?: string | null
  /** _fbc cookie value, or constructed from fbclid */
  fbc?: string | null
  /** _fbp cookie value */
  fbp?: string | null
  clientIpAddress?: string | null
  clientUserAgent?: string | null
}

export interface MetaCapiEvent {
  eventName: MetaCapiEventName
  eventId: string
  eventSourceUrl?: string | null
  userData: MetaUserData
  customData?: Record<string, unknown>
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/** Normalize + SHA-256 hash, per Meta's matching spec. Returns undefined if empty. */
function hashField(value: string | null | undefined, normalizer: (v: string) => string): string | undefined {
  if (!value) return undefined
  const normalized = normalizer(value.trim())
  if (!normalized) return undefined
  return sha256(normalized)
}

const lower = (v: string) => v.toLowerCase()
const alphaLower = (v: string) => v.toLowerCase().replace(/[^a-z]/g, '')

function normalizePhone(v: string): string {
  const digits = v.replace(/\D/g, '')
  if (!digits) return ''
  // Assume US: prepend country code 1 for bare 10-digit numbers.
  return digits.length === 10 ? `1${digits}` : digits
}

function buildHashedUserData(u: MetaUserData): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  const em = hashField(u.email, lower)
  const ph = hashField(u.phone, normalizePhone)
  const fn = hashField(u.firstName, alphaLower)
  const ln = hashField(u.lastName, alphaLower)
  const ct = hashField(u.city, alphaLower)
  const st = hashField(u.state, alphaLower)
  const zp = hashField(u.zip, (v) => v.toLowerCase().replace(/\s/g, '').slice(0, 5))
  const country = hashField(u.country || 'us', alphaLower)

  if (em) data.em = [em]
  if (ph) data.ph = [ph]
  if (fn) data.fn = [fn]
  if (ln) data.ln = [ln]
  if (ct) data.ct = [ct]
  if (st) data.st = [st]
  if (zp) data.zp = [zp]
  if (country) data.country = [country]

  // Non-hashed identifiers (sent as-is)
  if (u.fbc) data.fbc = u.fbc
  if (u.fbp) data.fbp = u.fbp
  if (u.clientIpAddress) data.client_ip_address = u.clientIpAddress
  if (u.clientUserAgent) data.client_user_agent = u.clientUserAgent

  return data
}

export function isMetaCapiConfigured(): boolean {
  return Boolean(PIXEL_ID && ACCESS_TOKEN)
}

/**
 * Build a Meta `fbc` value from an `fbclid` when the `_fbc` cookie is absent.
 * Format: fb.1.<creationTimeMs>.<fbclid>
 */
export function fbcFromFbclid(fbclid: string | null | undefined): string | null {
  if (!fbclid) return null
  return `fb.1.${Date.now()}.${fbclid}`
}

/**
 * Send a single event to the Conversions API. Safe to call fire-and-forget;
 * never throws. Returns a small result for logging.
 */
export async function sendMetaCapiEvent(
  event: MetaCapiEvent
): Promise<{ ok: boolean; status?: number; error?: string; skipped?: boolean }> {
  if (!isMetaCapiConfigured()) {
    return { ok: false, skipped: true, error: 'Meta CAPI not configured' }
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        action_source: 'website',
        ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
        user_data: buildHashedUserData(event.userData),
        ...(event.customData ? { custom_data: event.customData } : {}),
      },
    ],
    ...(TEST_EVENT_CODE ? { test_event_code: TEST_EVENT_CODE } : {}),
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    if (!res.ok) {
      const text = await res.text()
      console.error('[Meta CAPI] Event rejected:', res.status, text)
      return { ok: false, status: res.status, error: text }
    }

    return { ok: true, status: res.status }
  } catch (err) {
    console.error('[Meta CAPI] Send error:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
