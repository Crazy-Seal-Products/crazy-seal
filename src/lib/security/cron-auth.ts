import { createHash, timingSafeEqual } from 'node:crypto'

/**
 * True only for Vercel Cron: `Authorization: Bearer <CRON_SECRET>`, compared in constant
 * time. A missing CRON_SECRET refuses every request.
 */
export function isCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const given = createHash('sha256').update(request.headers.get('authorization') ?? '').digest()
  const expected = createHash('sha256').update(`Bearer ${secret}`).digest()
  return timingSafeEqual(given, expected)
}
