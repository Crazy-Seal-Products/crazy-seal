import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Signed links for the warranty certificate page
 * (/print/warranty-certificate/[id]) — replaces the old Gravity PDF
 * "generate a PDF from the entry" flow. The HMAC keeps certificate URLs
 * shareable but not guessable/enumerable.
 */

function secret(): string {
  return process.env.PDF_SECRET || process.env.SUPABASE_SECRET_KEY || ''
}

export function certificateToken(registrationId: string): string {
  return createHmac('sha256', secret())
    .update(`warranty-certificate:${registrationId}`)
    .digest('hex')
    .slice(0, 32)
}

export function verifyCertificateToken(registrationId: string, token: string | undefined | null): boolean {
  if (!token || !secret()) return false
  const expected = Buffer.from(certificateToken(registrationId))
  const provided = Buffer.from(token)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export function certificatePath(registrationId: string): string {
  return `/print/warranty-certificate/${registrationId}?t=${certificateToken(registrationId)}`
}

export function certificateUrl(registrationId: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://crazyseal.com').replace(/\/$/, '')
  return `${base}${certificatePath(registrationId)}`
}
