import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { verifyTurnstile } from '@/lib/turnstile'

/**
 * Turnstile for starting a site chat. Skipped in local development only:
 * the site key doesn't issue tokens on localhost, so the chat couldn't be
 * tested there otherwise. Production always checks.
 */
export async function passesHumanCheck(token: string | null | undefined, request: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') return true
  return verifyTurnstile(token ?? undefined, request)
}

/**
 * Protection for the public site chat. A visitor passes Turnstile once to
 * start a chat; the server then hands back a token signed for that chat id,
 * which the widget sends with every later message. A small per-IP limiter
 * caps how fast anyone can send.
 */

function key(): Buffer {
  return createHmac('sha256', process.env.SUPABASE_SECRET_KEY ?? 'dev-only').update('cs-site-chat:v1').digest()
}

export function chatToken(conversationId: string): string {
  return createHmac('sha256', key()).update(conversationId).digest('base64url')
}

export function verifyChatToken(conversationId: string, token: string | undefined | null): boolean {
  if (!token) return false
  const expected = Buffer.from(chatToken(conversationId))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}

// Per server instance, like the admin sign-in limiter: enough to stop a loop.
const hits = new Map<string, number[]>()

export function rateLimited(request: NextRequest, bucket: string, max: number, windowMs: number): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
  const k = `${bucket}:${ip}`
  const now = Date.now()
  const recent = (hits.get(k) ?? []).filter((t) => now - t < windowMs)
  recent.push(now)
  hits.set(k, recent)
  if (hits.size > 5000) for (const [key, times] of hits) if (!times.some((t) => now - t < windowMs)) hits.delete(key)
  return recent.length > max
}
