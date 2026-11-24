import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { listTeam } from '@/lib/contractor/team-data'
import { assignableRoles, can, canManageMember } from '@/lib/contractor/roles'
import { TeamView } from '@/components/contractor/team/TeamView'

export const metadata: Metadata = { title: 'Team' }

/** The contractor's team: who can open the portal, their roles, and (for owners and admins) invites and changes. */
export default async function TeamPage() {
  const viewer = await requirePortal('team.view')
  const team = await listTeam(viewer.contractor.id)
  const canManage = can(viewer.role, 'team.manage') && !viewer.readOnly
  const actor = { proUserId: viewer.proUserId, role: viewer.role }

  return (
    <TeamView
      companyName={viewer.contractorName}
      viewerId={viewer.proUserId}
      assignable={canManage ? assignableRoles(viewer.role) : []}
      members={team.map((m) => ({ ...m, manageable: canManage && canManageMember(actor, { proUserId: m.pro_user_id, role: m.role }) }))}
    />
  )
}
