import { redirect } from 'next/navigation'
import { getPortalAccountFromSession } from '@/lib/portal/session'
import { getProgramContent } from '@/lib/portal/accelerator'
import { PortalShell } from '@/components/portal/PortalShell'

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const account = await getPortalAccountFromSession()
  if (!account) redirect('/portal/login/')
  const { program, modules } = await getProgramContent()

  return (
    <PortalShell account={account} program={program} modules={modules}>
      {children}
    </PortalShell>
  )
}
