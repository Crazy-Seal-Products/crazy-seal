import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { PortalLogin } from '@/components/portal/PortalLogin'

export const metadata: Metadata = { title: 'Sign in' }

// Crazy Seal staff sign in to the admin here (admins skip straight to it).
// Contractors are sent on to the Pro Hub sign-in, which opens their portal.
export default async function PortalLoginPage() {
  if (await getPortalAdmin()) redirect('/portal/admin/')
  return <PortalLogin />
}
