'use server'

import { after } from 'next/server'
import { headers } from 'next/headers'
import { siteOrigin } from '@/lib/pro/auth'
import { completePasswordSetup, requestPasswordLink } from './password-setup'

export type SetPasswordState = { ok: true; email: string } | { ok: false; error: string; expired?: boolean } | null

/** The set-your-own-password form. The token comes from the emailed link. */
export async function setPasswordFromLink(_prev: SetPasswordState, form: FormData): Promise<SetPasswordState> {
  return completePasswordSetup(String(form.get('token') ?? ''), String(form.get('password') ?? ''), String(form.get('confirm') ?? ''))
}

/**
 * "Forgot your password?" on the admin sign-in. Always answers the same way, at
 * once: the lookup and the email run after the response, so neither the answer
 * nor its timing shows whether the email belongs to staff.
 */
export async function requestStaffPasswordLink(email: string): Promise<void> {
  // Production links always point at the live site, never at a host taken from the request.
  let origin = siteOrigin()
  if (process.env.NODE_ENV !== 'production') {
    const h = await headers()
    origin = `${h.get('x-forwarded-proto') ?? 'http'}://${h.get('host')}`
  }
  const address = typeof email === 'string' ? email : ''
  after(() => requestPasswordLink(address, origin))
}
