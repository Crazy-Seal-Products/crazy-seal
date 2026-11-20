import type { NextRequest } from 'next/server'

/** Verifies a Cloudflare Turnstile token server-side. */
export async function verifyTurnstile(token: string | undefined, request: NextRequest): Promise<boolean> {
  if (!token) return false

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      remoteip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
    }),
  })

  const data = await res.json()
  if (!data.success) {
    console.error('Turnstile verification failed:', data)
  }
  return Boolean(data.success)
}

/**
 * verifyTurnstile for forms that also have to work in local development,
 * where the site key doesn't issue tokens on localhost: skipped there only.
 * Production always checks.
 */
export async function passesTurnstile(token: unknown, request: NextRequest): Promise<boolean> {
  if (process.env.NODE_ENV !== 'production') return true
  return verifyTurnstile(typeof token === 'string' ? token : undefined, request)
}
