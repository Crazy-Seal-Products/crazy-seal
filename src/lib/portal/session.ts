import { cookies } from 'next/headers'
import { getPortalAccount, type PortalAccount } from './accounts'

/**
 * Pro Portal dealer session — DEMO ONLY.
 *
 * Dealer sign-ins aren't live yet, so the dealer side runs on one demo
 * account that anyone can open (it holds only made-up data). Real partner
 * auth already exists for the live Pro Hub (`src/lib/pro/auth.ts`); wire the
 * portal to it before dealers move over. Crazy Seal admins sign in with
 * their own credentials — see `admin/auth.ts`.
 *
 * Set `PORTAL_DEMO=0` to switch the demo off.
 */

export const PORTAL_COOKIE = 'cs_portal_demo'
export const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 12

export function isPortalDemoEnabled(): boolean {
  return process.env.PORTAL_DEMO !== '0'
}

export async function getPortalAccountFromSession(): Promise<PortalAccount | null> {
  if (!isPortalDemoEnabled()) return null
  const store = await cookies()
  return getPortalAccount(store.get(PORTAL_COOKIE)?.value) ?? null
}
