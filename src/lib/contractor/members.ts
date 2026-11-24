import { createAdminClient } from '@/lib/supabase/admin'
import { ROLE_INFO, type ContractorRole } from './roles'
import { listTeam } from './team-data'
import type { TeamMember } from './types'

/**
 * Changing someone already on a contractor's team: their role, turning their
 * access off and on, and taking them off the team. Shared by the portal's
 * Team page (src/lib/contractor/team-actions.ts, which also checks the
 * signed-in member may manage them) and the Crazy Seal admin. Every change is
 * scoped to one contractor, and a team always keeps an active owner.
 */

/** `changed` is false when they already had that role or access. */
export type MemberResult = { ok: true; message: string; changed: boolean } | { ok: false; error: string }

/** The member on this contractor's team, or null. */
export async function findMember(contractorId: string, proUserId: string): Promise<TeamMember | null> {
  if (!/^[0-9a-f-]{36}$/i.test(proUserId)) return null
  return (await listTeam(contractorId)).find((m) => m.pro_user_id === proUserId) ?? null
}

/** Why this change would leave the team with no active owner, or null when it's fine. */
async function lastOwnerProblem(target: TeamMember): Promise<string | null> {
  if (target.role !== 'owner' || target.status !== 'active') return null
  const { count, error } = await createAdminClient()
    .from('contractor_members')
    .select('pro_user_id', { count: 'exact', head: true })
    .eq('contractor_id', target.contractor_id)
    .eq('role', 'owner')
    .eq('status', 'active')
    .neq('pro_user_id', target.pro_user_id)
  if (error) throw new Error(`contractor_members: ${error.message}`)
  return count ? null : `${memberLabel(target)} is the only active owner. Make someone else an owner first.`
}

export async function changeMemberRole(target: TeamMember, role: ContractorRole): Promise<MemberResult> {
  if (role === target.role) return { ok: true, message: 'No change', changed: false }
  try {
    if (target.role === 'owner') {
      const problem = await lastOwnerProblem(target)
      if (problem) return { ok: false, error: problem }
    }
    const { error } = await createAdminClient()
      .from('contractor_members')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('pro_user_id', target.pro_user_id)
      .eq('contractor_id', target.contractor_id)
    if (error) throw new Error(error.message)
    return { ok: true, message: `${memberLabel(target)} is now ${ROLE_INFO[role].label}`, changed: true }
  } catch (err) {
    console.error('[contractor-members] role', err)
    return { ok: false, error: 'Could not change their role. Try again.' }
  }
}

/**
 * Turns someone's portal access off, or back on. Back on is 'active' if they
 * had signed in before, else 'invited' again until they do.
 */
export async function setMemberAccess(target: TeamMember, enabled: boolean): Promise<MemberResult> {
  const status = enabled ? (target.last_login_at || target.has_password ? 'active' : 'invited') : 'disabled'
  if (enabled ? target.status !== 'disabled' : target.status === 'disabled') return { ok: true, message: 'No change', changed: false }
  try {
    if (!enabled) {
      const problem = await lastOwnerProblem(target)
      if (problem) return { ok: false, error: problem }
    }
    const { error } = await createAdminClient()
      .from('contractor_members')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('pro_user_id', target.pro_user_id)
      .eq('contractor_id', target.contractor_id)
    if (error) throw new Error(error.message)
    return { ok: true, message: enabled ? `${memberLabel(target)} can open the portal again` : `${memberLabel(target)} can’t open the portal now`, changed: true }
  } catch (err) {
    console.error('[contractor-members] access', err)
    return { ok: false, error: 'Could not change their access. Try again.' }
  }
}

/** Takes them off the team. Their Pro Hub account stays; work assigned to them stays assigned. */
export async function removeMember(target: TeamMember): Promise<MemberResult> {
  try {
    const problem = await lastOwnerProblem(target)
    if (problem) return { ok: false, error: problem }
    const { error } = await createAdminClient()
      .from('contractor_members')
      .delete()
      .eq('pro_user_id', target.pro_user_id)
      .eq('contractor_id', target.contractor_id)
    if (error) throw new Error(error.message)
    return { ok: true, message: `${memberLabel(target)} is off the team`, changed: true }
  } catch (err) {
    console.error('[contractor-members] remove', err)
    return { ok: false, error: 'Could not remove them. Try again.' }
  }
}

/** "Jordan Ellis", or their email. */
export function memberLabel(m: Pick<TeamMember, 'name' | 'email'>): string {
  return m.name?.trim() || m.email
}
