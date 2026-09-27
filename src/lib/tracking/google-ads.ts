/**
 * Crazy Seal Google Ads lead conversion.
 *
 * The WordPress site reported leads through GTM-58MMMKR. The conversion the
 * thank-you page fired was AW-750784920 / v8uJCJjF-r8BEJijgOYC. The Next.js
 * app navigates to /thank-you without a full page load, so that GTM trigger
 * never runs. RV Armor avoids the same gap by firing its Ads conversion on
 * the form_submission event. We fire this label directly when a lead is saved.
 *
 * Other labels in that container count a visit to a category page as a
 * conversion. Those stay off so Maximize conversions optimizes for leads.
 */

export const GOOGLE_ADS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-750784920'

export const GOOGLE_ADS_LEAD_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL || 'v8uJCJjF-r8BEJijgOYC'

const GCLID_COOKIE = '_gcl_aw'
const GCLID_MAX_AGE = 90 * 24 * 60 * 60

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function ensureGtag(): void {
  window.dataLayer = window.dataLayer || []
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // gtag.js reads `arguments`, not a rest array.
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments)
    }
  }
}

function phoneForGoogle(phone?: string): string | undefined {
  if (!phone) return undefined
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length > 8) return `+${digits}`
  return undefined
}

/**
 * Google's conversion linker stores the click id as `_gcl_aw=GCL.<ts>.<gclid>`.
 * Writing it ourselves covers the landing page even if gtag.js arrives after
 * the first client-side navigation strips gclid from the URL.
 */
export function rememberGoogleClickFromUrl(): void {
  if (typeof document === 'undefined') return
  const gclid = new URLSearchParams(window.location.search).get('gclid')
  if (!gclid || !/^[A-Za-z0-9_-]{10,}$/.test(gclid)) return
  if (document.cookie.split(';').some((part) => part.trim().startsWith(`${GCLID_COOKIE}=`))) return
  const ts = Math.floor(Date.now() / 1000)
  const secure = window.location.protocol === 'https:' ? '; secure' : ''
  document.cookie = `${GCLID_COOKIE}=${encodeURIComponent(`GCL.${ts}.${gclid}`)}; path=/; max-age=${GCLID_MAX_AGE}; samesite=lax${secure}`
}

export function trackGoogleAdsLead(options: {
  transactionId: string
  email?: string
  phone?: string
}): void {
  if (typeof window === 'undefined' || !GOOGLE_ADS_ID || !GOOGLE_ADS_LEAD_LABEL) return
  if (!options.transactionId || options.transactionId === 'ok') return

  ensureGtag()
  const email = options.email?.trim().toLowerCase()
  const phone_number = phoneForGoogle(options.phone)
  if (email || phone_number) {
    window.gtag!('set', 'user_data', {
      ...(email ? { email } : {}),
      ...(phone_number ? { phone_number } : {}),
    })
  }

  window.gtag!('event', 'conversion', {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`,
    transaction_id: options.transactionId,
  })
}

export async function reportLeadToGoogleAds(
  response: Response,
  user: { email?: string; phone?: string; eventId: string }
): Promise<void> {
  let transactionId = user.eventId
  try {
    const data = (await response.clone().json()) as { lead_id?: string }
    if (data?.lead_id === 'ok') return
    if (data?.lead_id) transactionId = String(data.lead_id)
  } catch {
    // The lead was already accepted. Still report it, keyed by the event id.
  }
  trackGoogleAdsLead({
    transactionId,
    email: user.email,
    phone: user.phone,
  })
}
