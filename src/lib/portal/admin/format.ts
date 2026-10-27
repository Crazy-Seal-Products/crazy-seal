/**
 * Formatting for the Crazy Seal Admin. Safe on server and client.
 * Dates render in the store's time zone so day buckets match Shopify.
 */

export const STORE_TZ = 'America/New_York'

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})
const int = new Intl.NumberFormat('en-US')
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

export function money(n: number | null | undefined): string {
  return n == null ? '—' : usd.format(n)
}

export function money0(n: number | null | undefined): string {
  return n == null ? '—' : usd0.format(n)
}

/** $12.9K / $1.2M from 10,000 up; whole dollars below. */
export function moneyShort(n: number | null | undefined): string {
  if (n == null) return '—'
  return Math.abs(n) >= 10_000 ? usdCompact.format(n) : usd0.format(n)
}

export function num(n: number | null | undefined): string {
  return n == null ? '—' : int.format(n)
}

export function numShort(n: number): string {
  return Math.abs(n) >= 1000 ? compact.format(n) : int.format(n)
}

export function pct(n: number | null | undefined, digits = 0): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${(n * 100).toFixed(digits)}%`
}

const dayKeyFmt = new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
const shortDate = new Intl.DateTimeFormat('en-US', { timeZone: STORE_TZ, month: 'short', day: 'numeric' })
const fullDate = new Intl.DateTimeFormat('en-US', { timeZone: STORE_TZ, month: 'short', day: 'numeric', year: 'numeric' })
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: STORE_TZ,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})
const monthFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', year: '2-digit' })

/** YYYY-MM-DD in store time. */
export function dayKey(iso: string | Date): string {
  return dayKeyFmt.format(typeof iso === 'string' ? new Date(iso) : iso)
}

/** YYYY-MM in store time. */
export function monthKey(iso: string | Date): string {
  return dayKey(iso).slice(0, 7)
}

/** "Oct 26" this year, "Mar 19 '25" otherwise. */
export function dateShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const label = shortDate.format(d)
  const year = dayKey(d).slice(0, 4)
  return year === dayKey(new Date()).slice(0, 4) ? label : `${label} '${year.slice(2)}`
}

export function dateLong(iso: string | null | undefined): string {
  return iso ? fullDate.format(new Date(iso)) : '—'
}

export function dateTime(iso: string | null | undefined): string {
  return iso ? dateTimeFmt.format(new Date(iso)) : '—'
}

/** "Oct 26" from a YYYY-MM-DD key (no time-zone shift). */
export function dayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return shortDate.format(new Date(Date.UTC(y, m - 1, d, 12)))
}

/** "Oct '26" from a YYYY-MM key. */
export function monthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return monthFmt.format(new Date(Date.UTC(y, m - 1, 15))).replace(' ', " '")
}

export function ago(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'never'
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  if (d < 31) return `${d}d ago`
  const mo = Math.round(d / 30.4)
  if (mo < 12) return `${mo}mo ago`
  return `${Math.round(mo / 12)}y ago`
}

/** gid://shopify/Order/123 → 123 */
export function legacyId(gid: string | null | undefined): string {
  return gid?.split('/').pop() ?? ''
}

/** PAID / PARTIALLY_REFUNDED → Paid / Partially refunded */
export function humanize(value: string | null | undefined): string {
  if (!value) return '—'
  const s = value.replace(/_/g, ' ').toLowerCase()
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function addressLine(a: { city?: string | null; provinceCode?: string | null; province?: string | null } | null | undefined): string {
  if (!a) return '—'
  return [a.city, a.provinceCode || a.province].filter(Boolean).join(', ') || '—'
}

export function shopifyAdminUrl(kind: 'orders' | 'customers' | 'products' | 'discounts', id: string): string {
  return `https://admin.shopify.com/store/crazy-seal/${kind}/${legacyId(id)}`
}
