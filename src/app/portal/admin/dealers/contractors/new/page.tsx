import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { ContractorEditor } from '@/components/portal/admin/ContractorEditor'
import { BackLink, PageHeader } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Add contractor' }

export default async function AdminAddContractorPage() {
  await requirePortalAdmin('contractors')
  return (
    <>
      <BackLink href="/portal/admin/dealers/contractors/">Contractors</BackLink>
      <PageHeader
        title="Add contractor"
        description="Their page goes live at the page address as soon as you add them, unless you untick Listed publicly. The ZIP places their pin on the maps."
      />
      <ContractorEditor contractor={null} />
    </>
  )
}
