import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { PORTAL_ACCOUNTS } from '@/lib/portal/accounts'
import { getPortalAccountFromSession, isPortalDemoEnabled } from '@/lib/portal/session'
import { PortalLogin } from '@/components/portal/PortalLogin'

export const metadata: Metadata = { title: 'Sign in' }

export default async function PortalLoginPage() {
  if (await getPortalAccountFromSession()) redirect('/portal/')
  const accounts = PORTAL_ACCOUNTS.map(({ id, company, contactName, email, blurb, tier }) => ({
    id,
    company,
    contactName,
    email,
    blurb,
    tier,
  }))
  return <PortalLogin accounts={accounts} demoEnabled={isPortalDemoEnabled()} />
}
