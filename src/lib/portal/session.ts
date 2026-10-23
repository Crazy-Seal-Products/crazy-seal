import { cookies } from 'next/headers'
import { getPortalAccount, type PortalAccount } from './accounts'

/**
 * Pro Portal session — DEMO ONLY.
 *
 * The portal signs in with mock accounts while the module flow is being
 * reviewed. Real partner auth already exists for the live Pro Hub
 * (`src/lib/pro/auth.ts`); wire the portal to it before launch.
 *
 * Demo sign-in is on in development and Vercel preview deployments and off
 * in production unless `PORTAL_DEMO=1` is set explicitly.
 */

export const PORTAL_COOKIE = 'cs_portal_demo'
export const PORTAL_COOKIE_MAX_AGE = 60 * 60 * 12

export function isPortalDemoEnabled(): boolean {
  if (process.env.PORTAL_DEMO === '1') return true
  if (process.env.PORTAL_DEMO === '0') return false
  return process.env.VERCEL_ENV !== 'production'
}

export async function getPortalAccountFromSession(): Promise<PortalAccount | null> {
  if (!isPortalDemoEnabled()) return null
  const store = await cookies()
  return getPortalAccount(store.get(PORTAL_COOKIE)?.value) ?? null
}
