import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { DEMO_ACCOUNT } from '@/lib/portal/accounts'
import { isPortalDemoEnabled } from '@/lib/portal/session'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { PortalLogin } from '@/components/portal/PortalLogin'

export const metadata: Metadata = { title: 'Sign in' }

// Admins skip straight to the admin. A demo session doesn't redirect, so
// someone browsing the demo can still reach the sign-in form.
export default async function PortalLoginPage() {
  if (await getPortalAdmin()) redirect('/portal/admin/')

  const { company, contactName, blurb, tier } = DEMO_ACCOUNT
  return <PortalLogin demo={isPortalDemoEnabled() ? { company, contactName, blurb, tier } : null} />
}
