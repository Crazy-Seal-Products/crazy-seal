import { redirect } from 'next/navigation'
import { PORTAL_ACCOUNTS } from '@/lib/portal/accounts'
import { getPortalAccountFromSession } from '@/lib/portal/session'
import { PortalShell } from '@/components/portal/PortalShell'

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const account = await getPortalAccountFromSession()
  if (!account) redirect('/portal/login/')

  const accounts = PORTAL_ACCOUNTS.map(({ id, company, contactName, blurb }) => ({ id, company, contactName, blurb }))
  return (
    <PortalShell account={account} accounts={accounts}>
      {children}
    </PortalShell>
  )
}
