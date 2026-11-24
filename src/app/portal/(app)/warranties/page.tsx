import type { Metadata } from 'next'
import { requireAccount } from '@/lib/contractor/guard'
import { can } from '@/lib/contractor/roles'
import { loadPortalWarranties } from '@/lib/contractor/warranties'
import { WarrantiesView } from '@/components/contractor/warranties/WarrantiesView'

export const metadata: Metadata = { title: 'Warranties' }

/**
 * Warranties: the contractor's registrations and claims (theirs, their team's,
 * or on their orders) and everything the Pro Hub showed the signed-in
 * account, transfers included.
 */
export default async function WarrantiesPage() {
  const { account, viewer } = await requireAccount('warranties.view')
  const { registrations, claims, transfers } = await loadPortalWarranties(account.user, viewer?.contractor ?? null)
  return (
    <WarrantiesView
      registrations={registrations}
      claims={claims}
      transfers={transfers}
      canEdit={!account.readOnly && (!viewer || can(viewer.role, 'warranties.edit'))}
    />
  )
}
