'use server'

import { revalidatePath } from 'next/cache'
import { logActivity } from './activity'
import { portalAction, type PortalResult } from './guard'
import { inviteMember, requestSiteOrigin, resendInvite } from './invite'
import { changeMemberRole, findMember, memberLabel, removeMember, setMemberAccess } from './members'
import { assignableRoles, canManageMember, isContractorRole, ROLE_INFO } from './roles'
import type { TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * The Team page's writes. Owners and admins (team.manage) invite people and
 * change anyone they may manage (canManageMember: never themselves, and
 * admins never owners), always on their own contractor's team. Each change
 * goes in the activity log.
 */

const TEAM_PATH = '/portal/team/'

type Managed = { ok: true; viewer: ContractorViewer; target: TeamMember } | { ok: false; error: string }

/** The signed-in manager and the teammate they're changing, if they may. */
async function managed(proUserId: string): Promise<Managed> {
  const g = await portalAction('team.manage')
  if (!g.ok) return g
  const viewer = g.viewer
  const target = await findMember(viewer.contractor.id, String(proUserId ?? ''))
  if (!target) return { ok: false, error: 'They’re not on your team. Refresh the page.' }
  if (target.pro_user_id === viewer.proUserId) return { ok: false, error: 'You can’t change your own access. Ask another owner.' }
  if (!canManageMember({ proUserId: viewer.proUserId, role: viewer.role }, { proUserId: target.pro_user_id, role: target.role })) {
    return { ok: false, error: 'Only an owner can change an owner’s access.' }
  }
  return { ok: true, viewer, target }
}

export async function inviteTeamMember(input: { email: string; name: string; role: string }): Promise<PortalResult> {
  const g = await portalAction('team.manage')
  if (!g.ok) return g
  const viewer = g.viewer
  const role = String(input?.role ?? '')
  if (!isContractorRole(role) || !assignableRoles(viewer.role).includes(role)) return { ok: false, error: 'You can’t give that role.' }

  const result = await inviteMember({
    contractorId: viewer.contractor.id,
    email: input?.email,
    name: input?.name,
    role,
    invitedBy: viewer.hasAccount ? viewer.proUserId : null,
    inviterName: viewer.name,
    origin: await requestSiteOrigin(),
  })
  if (!result.ok) return result
  await logActivity(viewer, {
    entity: 'team',
    entityId: result.proUserId,
    action: 'create',
    summary: `${viewer.firstName} invited ${result.name} as ${ROLE_INFO[role].label}`,
  })
  revalidatePath(TEAM_PATH)
  return { ok: true, message: result.message, id: result.proUserId }
}

export async function changeTeamRole(proUserId: string, role: string): Promise<PortalResult> {
  const m = await managed(proUserId)
  if (!m.ok) return m
  if (!isContractorRole(role) || !assignableRoles(m.viewer.role).includes(role)) return { ok: false, error: 'You can’t give that role.' }
  const result = await changeMemberRole(m.target, role)
  if (!result.ok) return result
  if (result.changed) {
    await logActivity(m.viewer, {
      entity: 'team',
      entityId: m.target.pro_user_id,
      action: 'update',
      summary: `${m.viewer.firstName} made ${memberLabel(m.target)} ${ROLE_INFO[role].label}`,
      changes: { role: [m.target.role, role] },
    })
    revalidatePath(TEAM_PATH)
  }
  return { ok: true, message: result.message }
}

export async function setTeamAccess(proUserId: string, enabled: boolean): Promise<PortalResult> {
  const m = await managed(proUserId)
  if (!m.ok) return m
  const result = await setMemberAccess(m.target, Boolean(enabled))
  if (!result.ok) return result
  if (result.changed) {
    await logActivity(m.viewer, {
      entity: 'team',
      entityId: m.target.pro_user_id,
      action: 'update',
      summary: enabled
        ? `${m.viewer.firstName} turned ${memberLabel(m.target)}’s portal access back on`
        : `${m.viewer.firstName} turned off ${memberLabel(m.target)}’s portal access`,
    })
    revalidatePath(TEAM_PATH)
  }
  return { ok: true, message: result.message }
}

export async function resendTeamInvite(proUserId: string): Promise<PortalResult> {
  const m = await managed(proUserId)
  if (!m.ok) return m
  const result = await resendInvite({
    contractorId: m.viewer.contractor.id,
    proUserId: m.target.pro_user_id,
    inviterName: m.viewer.name,
    origin: await requestSiteOrigin(),
  })
  if (!result.ok) return result
  await logActivity(m.viewer, {
    entity: 'team',
    entityId: m.target.pro_user_id,
    action: 'update',
    summary: `${m.viewer.firstName} sent ${memberLabel(m.target)} a new invite`,
  })
  return { ok: true, message: result.message }
}

export async function removeTeamMember(proUserId: string): Promise<PortalResult> {
  const m = await managed(proUserId)
  if (!m.ok) return m
  const result = await removeMember(m.target)
  if (!result.ok) return result
  await logActivity(m.viewer, {
    entity: 'team',
    entityId: m.target.pro_user_id,
    action: 'delete',
    summary: `${m.viewer.firstName} took ${memberLabel(m.target)} off the team`,
  })
  revalidatePath(TEAM_PATH)
  return { ok: true, message: result.message }
}
