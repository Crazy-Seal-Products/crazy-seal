import { redirect } from 'next/navigation'
import { getPortalAccountFromSession } from '@/lib/portal/session'
import { PortalShell } from '@/components/portal/PortalShell'

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const account = await getPortalAccountFromSession()
  if (!account) redirect('/portal/login/')

  return <PortalShell account={account}>{children}</PortalShell>
}
