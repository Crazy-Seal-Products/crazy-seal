import { randomBytes } from 'node:crypto'

/** A quote's private link token: 32 random hex characters (128 bits). */
export function newQuoteToken(): string {
  return randomBytes(16).toString('hex')
}

export function isQuoteToken(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{32}$/.test(value)
}

/** The buyer's link: /quote/<token>/ on the site. */
export function quoteUrl(token: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://crazyseal.com').replace(/\/$/, '')
  return `${base}/quote/${token}/`
}
