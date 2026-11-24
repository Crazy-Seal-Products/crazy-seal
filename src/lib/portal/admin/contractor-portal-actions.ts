'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { logContractorActivity } from '@/lib/contractor/activity'
import { inviteMember, requestSiteOrigin, resendInvite } from '@/lib/contractor/invite'
import { changeMemberRole, findMember, memberLabel, removeMember, setMemberAccess } from '@/lib/contractor/members'
import { isContractorRole, ROLE_INFO } from '@/lib/contractor/roles'
import type { TeamMember } from '@/lib/contractor/types'
import { requirePortalAdmin, type PortalAdmin } from './auth'

/**
 * Admin writes for a contractor's portal (the Contractors page): their team
 * (add a person, change a role, turn access off and on, resend the invite,
 * take someone off) and their account terms (pricing tier, Crazy Seal sales
 * rep, payment terms). Staff can manage any role, owners included, but a
 * team always keeps an active owner. Team changes go in the contractor's
 * activity log as Crazy Seal.
 */

const UUID = /^[0-9a-f-]{36}$/i

function pagePath(contractorId: string) {
  return `/portal/admin/dealers/contractors/${contractorId}/`
}

function refresh(contractorId: string) {
  revalidatePath(pagePath(contractorId))
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
}

function staffFirst(admin: PortalAdmin): string {
  return admin.name?.split(' ')[0] || admin.email
}

async function logStaff(admin: PortalAdmin, contractorId: string, entry: { entityId: string; action: 'create' | 'update' | 'delete'; summary: string; changes?: Record<string, [unknown, unknown]> }) {
  await logContractorActivity(contractorId, {
    actorId: null,
    actorName: `${staffFirst(admin)} (Crazy Seal)`,
    actorRole: 'crazy_seal',
    entity: 'team',
    entityId: entry.entityId,
    action: entry.action,
    summary: entry.summary,
    changes: entry.changes ?? null,
  })
}

async function contractorExists(contractorId: string): Promise<boolean> {
  if (!UUID.test(contractorId)) return false
  const { data } = await createAdminClient().from('contractors').select('id').eq('id', contractorId).maybeSingle()
  return Boolean(data)
}

type Target = { ok: true; admin: PortalAdmin; target: TeamMember } | { ok: false; error: string }

async function target(contractorId: string, proUserId: string): Promise<Target> {
  const admin = await requirePortalAdmin('contractors')
  if (!UUID.test(contractorId)) return { ok: false, error: 'This contractor no longer exists.' }
  const member = await findMember(contractorId, proUserId)
  if (!member) return { ok: false, error: 'They’re not on this team any more. Refresh the page.' }
  return { ok: true, admin, target: member }
}

/** Add someone to the contractor's team (usually their owner) and email their set-password link. */
export async function addContractorPerson(contractorId: string, input: { email: string; name: string; role: string }): Promise<ActionResult> {
  const admin = await requirePortalAdmin('contractors')
  if (!(await contractorExists(contractorId))) return { ok: false, error: 'This contractor no longer exists.' }
  const role = String(input?.role ?? '')
  if (!isContractorRole(role)) return { ok: false, error: 'Pick a role.' }
  const result = await inviteMember({
    contractorId,
    email: input?.email,
    name: input?.name,
    role,
    invitedBy: null,
    inviterName: null,
    origin: await requestSiteOrigin(),
  })
  if (!result.ok) return result
  await logStaff(admin, contractorId, {
    entityId: result.proUserId,
    action: 'create',
    summary: `${staffFirst(admin)} from Crazy Seal added ${result.name} as ${ROLE_INFO[role].label}`,
  })
  refresh(contractorId)
  return { ok: true, message: result.message }
}

export async function setContractorMemberRole(contractorId: string, proUserId: string, role: string): Promise<ActionResult> {
  const t = await target(contractorId, proUserId)
  if (!t.ok) return t
  if (!isContractorRole(role)) return { ok: false, error: 'Pick a role.' }
  const result = await changeMemberRole(t.target, role)
  if (!result.ok) return result
  if (result.changed) {
    await logStaff(t.admin, contractorId, {
      entityId: proUserId,
      action: 'update',
      summary: `${staffFirst(t.admin)} from Crazy Seal made ${memberLabel(t.target)} ${ROLE_INFO[role].label}`,
      changes: { role: [t.target.role, role] },
    })
    refresh(contractorId)
  }
  return { ok: true, message: result.changed ? 'Saved' : 'No change' }
}

/** 'on' turns their access back on, 'off' turns it off. */
export async function setContractorMemberAccess(contractorId: string, proUserId: string, access: string): Promise<ActionResult> {
  const t = await target(contractorId, proUserId)
  if (!t.ok) return t
  if (access !== 'on' && access !== 'off') return { ok: false, error: 'Pick on or off.' }
  const enabled = access === 'on'
  const result = await setMemberAccess(t.target, enabled)
  if (!result.ok) return result
  if (result.changed) {
    await logStaff(t.admin, contractorId, {
      entityId: proUserId,
      action: 'update',
      summary: enabled
        ? `${staffFirst(t.admin)} from Crazy Seal turned ${memberLabel(t.target)}’s portal access back on`
        : `${staffFirst(t.admin)} from Crazy Seal turned off ${memberLabel(t.target)}’s portal access`,
    })
    refresh(contractorId)
  }
  return { ok: true, message: result.changed ? 'Saved' : 'No change' }
}

export async function resendContractorInvite(contractorId: string, proUserId: string): Promise<ActionResult> {
  const t = await target(contractorId, proUserId)
  if (!t.ok) return t
  const result = await resendInvite({ contractorId, proUserId, inviterName: null, origin: await requestSiteOrigin() })
  if (!result.ok) return result
  await logStaff(t.admin, contractorId, {
    entityId: proUserId,
    action: 'update',
    summary: `${staffFirst(t.admin)} from Crazy Seal sent ${memberLabel(t.target)} a new invite`,
  })
  return { ok: true, message: 'Sent' }
}

export async function removeContractorMember(contractorId: string, proUserId: string): Promise<ActionResult> {
  const t = await target(contractorId, proUserId)
  if (!t.ok) return t
  const result = await removeMember(t.target)
  if (!result.ok) return result
  await logStaff(t.admin, contractorId, {
    entityId: proUserId,
    action: 'delete',
    summary: `${staffFirst(t.admin)} from Crazy Seal took ${memberLabel(t.target)} off the team`,
  })
  refresh(contractorId)
  return { ok: true, message: 'Removed' }
}

export interface AccountInput {
  pricingTierId: string
  repId: string
  paymentTerms: string
}

/**
 * The contractor's account terms: their pricing tier (an active contractor
 * tier), the Crazy Seal sales rep who owns the account, and whether they pay
 * by card at checkout or on terms. A tier or rep that has since been turned
 * off can stay on the contractor it's already on.
 */
export async function saveContractorAccount(contractorId: string, input: AccountInput): Promise<ActionResult> {
  await requirePortalAdmin('contractors')
  if (!UUID.test(contractorId)) return { ok: false, error: 'This contractor no longer exists.' }
  const tierId = String(input?.pricingTierId ?? '').trim() || null
  const repId = String(input?.repId ?? '').trim() || null
  const terms = String(input?.paymentTerms ?? '')
  if (terms !== 'card' && terms !== 'terms') return { ok: false, error: 'Pick card or terms.' }
  if ((tierId && !UUID.test(tierId)) || (repId && !UUID.test(repId))) return { ok: false, error: 'Pick from the lists.' }

  const db = createAdminClient()
  const { data: before } = await db
    .from('contractors')
    .select('id, pricing_tier_id, rep_id, payment_terms')
    .eq('id', contractorId)
    .maybeSingle<{ id: string; pricing_tier_id: string | null; rep_id: string | null; payment_terms: string }>()
  if (!before) return { ok: false, error: 'This contractor no longer exists.' }

  if (tierId && tierId !== before.pricing_tier_id) {
    const { data: tier } = await db.from('pricing_tiers').select('id').eq('id', tierId).eq('audience', 'contractor').eq('active', true).maybeSingle()
    if (!tier) return { ok: false, error: 'That pricing tier isn’t available. Refresh the page.' }
  }
  if (repId && repId !== before.rep_id) {
    const { data: rep } = await db.from('sales_reps').select('id').eq('id', repId).eq('is_active', true).maybeSingle()
    if (!rep) return { ok: false, error: 'That sales rep isn’t active. Refresh the page.' }
  }

  const { error } = await db
    .from('contractors')
    // Not updated_at: the details editor on the same page resets when that changes.
    .update({ pricing_tier_id: tierId, rep_id: repId, payment_terms: terms })
    .eq('id', contractorId)
  if (error) {
    console.error('[contractor-portal] account', error.message)
    return { ok: false, error: 'Could not save. Try again.' }
  }
  refresh(contractorId)
  return { ok: true, message: 'Saved' }
}
