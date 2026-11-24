'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { logContractorActivity } from './activity'
import type { PortalResult } from './guard'
import { getViewerState } from './viewer'

/**
 * Accepting or declining a team's invitation. Being invited never puts someone
 * on a team by itself: they see "You're invited to join …" in their portal and
 * choose. Declining removes only the invitation (the contractor_members row);
 * their account, orders and warranties are untouched.
 */

async function pending() {
  const state = await getViewerState()
  if (state.status !== 'personal' || !state.invitation) return { ok: false as const, error: 'There’s no invitation waiting.' }
  if (state.account.readOnly) return { ok: false as const, error: VIEW_AS_READ_ONLY }
  return { ok: true as const, account: state.account, invitation: state.invitation }
}

export async function acceptInvitation(): Promise<PortalResult> {
  const p = await pending()
  if (!p.ok) return p
  const { error } = await createAdminClient()
    .from('contractor_members')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('pro_user_id', p.account.proUserId)
    .eq('contractor_id', p.invitation.contractorId)
    .eq('status', 'invited')
  if (error) return { ok: false, error: 'Could not accept the invitation. Try again.' }
  await logContractorActivity(p.invitation.contractorId, {
    actorId: p.account.proUserId,
    actorName: p.account.name,
    actorRole: p.invitation.role,
    entity: 'team',
    entityId: p.account.proUserId,
    action: 'update',
    summary: `${p.account.name} accepted the invitation and joined the team`,
  })
  revalidatePath('/portal', 'layout')
  redirect('/portal/')
}

export async function declineInvitation(): Promise<PortalResult> {
  const p = await pending()
  if (!p.ok) return p
  const { error } = await createAdminClient()
    .from('contractor_members')
    .delete()
    .eq('pro_user_id', p.account.proUserId)
    .eq('contractor_id', p.invitation.contractorId)
    .eq('status', 'invited')
  if (error) return { ok: false, error: 'Could not decline the invitation. Try again.' }
  await logContractorActivity(p.invitation.contractorId, {
    actorId: null,
    actorName: p.account.name,
    actorRole: null,
    entity: 'team',
    entityId: p.account.proUserId,
    action: 'delete',
    summary: `${p.account.name} declined the invitation`,
  })
  revalidatePath('/portal', 'layout')
  return { ok: true, message: 'Invitation declined.' }
}
