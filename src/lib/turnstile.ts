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
