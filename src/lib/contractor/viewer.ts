import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProUser, type ProUser } from '@/lib/pro/auth'
import { getViewAs, NO_ACCOUNT_ID } from '@/lib/pro/view-as'
import { linkAsOwner, matchContractor } from './link'
import { isAutoCompany, previewCompany, provisionCompany, releaseAutoCompany } from './provision'
import { can, type Capability, type ContractorRole } from './roles'
import { contractorName, type MemberRow, type PortalContractor } from './types'

/**
 * Who is looking at the contractor portal (/portal), and as which contractor.
 *
 * The portal is where Pro Hub accounts sign in (src/lib/pro/auth): every
 * account gets in. contractor_members says which contractor an account works
 * for and its role there; an account on no team yet gets a personal portal
 * (its own orders, warranties, rewards and support, as Pro Hub had). An
 * account whose Shopify customer or email matches a contractor that has no
 * owner yet is linked as that contractor's owner the first time it signs in.
 *
 * Crazy Seal staff can open a portal with View as (src/lib/pro/view-as): then
 * the viewer is read-only, and for a contractor whose team has no accounts yet
 * it's a base view with the owner's role.
 */

/** The signed-in Pro Hub account, with or without a contractor. */
export interface AccountViewer {
  user: ProUser
  /** The Pro Hub account id; NO_ACCOUNT_ID in a base view. */
  proUserId: string
  /** False in a base view of a dealer or contractor with no account. */
  hasAccount: boolean
  email: string
  /** Their name, or their email. */
  name: string
  firstName: string
  /** Crazy Seal staff looking in with View as: nothing can be changed. */
  readOnly: boolean
  viewAs: { adminName: string; expiresAt: number } | null
}

/** An account working for a contractor. */
export interface ContractorViewer extends AccountViewer {
  role: ContractorRole
  member: MemberRow | null
  contractor: PortalContractor
  contractorName: string
}

/** A team's invitation waiting for this account to accept it. */
export interface PendingInvitation {
  contractorId: string
  contractorName: string
  role: ContractorRole
}

export type ViewerState =
  | { status: 'signed_out' }
  /**
   * Signed in, not on a contractor's team: the personal portal. `disabled`
   * when their company turned off their access; `invitation` when a team has
   * invited them and they haven't accepted yet.
   */
  | { status: 'personal'; account: AccountViewer; disabled: boolean; invitation: PendingInvitation | null }
  | { status: 'ok'; viewer: ContractorViewer }

const MEMBER_COLS = 'pro_user_id, contractor_id, role, status, title, invited_by, created_at, updated_at'

async function contractorById(id: string): Promise<PortalContractor | null> {
  const { data, error } = await createAdminClient().from('contractors').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`contractors: ${error.message}`)
  return (data as PortalContractor | null) ?? null
}

function personName(user: Pick<ProUser, 'display_name' | 'email'>): string {
  return user.display_name?.trim() || user.email || 'Team member'
}

function accountViewer(user: ProUser, viewAs: Awaited<ReturnType<typeof getViewAs>>): AccountViewer {
  const name = personName(user)
  return {
    user,
    proUserId: user.id,
    hasAccount: user.id !== NO_ACCOUNT_ID,
    email: user.email,
    name,
    firstName: name.split(/[\s@]/)[0] || name,
    readOnly: Boolean(viewAs),
    viewAs: viewAs ? { adminName: viewAs.admin.name || viewAs.admin.email, expiresAt: viewAs.expiresAt } : null,
  }
}

export const getViewerState = cache(async (): Promise<ViewerState> => {
  const viewAs = await getViewAs()
  const user = await getProUser()
  if (!user) return { status: 'signed_out' }
  const db = createAdminClient()
  const account = accountViewer(user, viewAs)

  let member: MemberRow | null = null
  let contractorId: string | null = viewAs?.contractorId ?? null

  if (account.hasAccount) {
    const { data, error } = await db.from('contractor_members').select(MEMBER_COLS).eq('pro_user_id', user.id).maybeSingle<MemberRow>()
    if (error) throw new Error(`contractor_members: ${error.message}`)
    member = data
    if (!member && !viewAs) {
      // An account whose email is a contractor's own email on record (and that contractor has no
      // owner yet) is that contractor: it becomes the owner (src/lib/contractor/link.ts).
      const match = await matchContractor(user)
      if (match.kind === 'match') member = await linkAsOwner(user, match.contractorId, 'sign_in')
      if (!member && match.kind === 'match') {
        const { data: again } = await db.from('contractor_members').select(MEMBER_COLS).eq('pro_user_id', user.id).maybeSingle<MemberRow>()
        member = again
      }
      // Anyone else gets their own company, so every account has the full portal (src/lib/contractor/provision.ts).
      if (!member && match.kind !== 'match') member = await provisionCompany(user)
    }
    if (member && contractorId && member.contractor_id !== contractorId) member = null
    if (member) contractorId = member.contractor_id
  }

  if (member?.status === 'disabled' && !viewAs) return { status: 'personal', account, disabled: true, invitation: null }
  if (!contractorId && viewAs) {
    // View as of an account with no company yet: the full portal they'll get, read-only and empty.
    const preview = previewCompany(user)
    return { status: 'ok', viewer: { ...account, role: 'owner', member: null, contractor: preview, contractorName: contractorName(preview) } }
  }
  if (!contractorId) return { status: 'personal', account, disabled: false, invitation: null }

  let contractor = await contractorById(contractorId)
  if (!contractor) return { status: 'personal', account, disabled: false, invitation: null }

  // Owner of only their automatic company, and Crazy Seal has since put this email on a real
  // contractor with no owner: move them there (only while the automatic company is still empty).
  if (member && !viewAs && member.role === 'owner' && isAutoCompany(contractor)) {
    const match = await matchContractor(user)
    if (match.kind === 'match' && (await releaseAutoCompany(user.id))) {
      const moved = await linkAsOwner(user, match.contractorId, 'sign_in')
      const real = moved ? await contractorById(moved.contractor_id) : null
      if (moved && real) {
        member = moved
        contractor = real
      }
    }
  }

  if (member?.status === 'invited') {
    const ownEmail = Boolean(contractor.email && contractor.email.trim().toLowerCase() === user.email.trim().toLowerCase())
    if (ownEmail && !viewAs) {
      // The contractor activating its own account (Forgot password on its email on record): no one to ask.
      await db
        .from('contractor_members')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('pro_user_id', member.pro_user_id)
        .eq('status', 'invited')
      member = { ...member, status: 'active' }
    } else {
      // Anyone else accepts first: until then they keep their personal portal and the team sees nothing of theirs.
      return {
        status: 'personal',
        account,
        disabled: false,
        invitation: { contractorId: contractor.id, contractorName: contractorName(contractor), role: member.role },
      }
    }
  }

  return {
    status: 'ok',
    viewer: {
      ...account,
      role: member?.role ?? 'owner',
      member,
      contractor,
      contractorName: contractorName(contractor),
    },
  }
})

/** The viewer working for a contractor, or null (signed out, or a personal portal). */
export async function getContractorViewer(): Promise<ContractorViewer | null> {
  const state = await getViewerState()
  return state.status === 'ok' ? state.viewer : null
}

/** The signed-in account, with or without a contractor; null when signed out. */
export async function getAccountViewer(): Promise<{ account: AccountViewer; viewer: ContractorViewer | null } | null> {
  const state = await getViewerState()
  if (state.status === 'signed_out') return null
  if (state.status === 'ok') return { account: state.viewer, viewer: state.viewer }
  return { account: state.account, viewer: null }
}

/** The invitation this account can accept or decline, if any. */
export async function getPendingInvitation(): Promise<PendingInvitation | null> {
  const state = await getViewerState()
  return state.status === 'personal' ? state.invitation : null
}

export function viewerCan(viewer: ContractorViewer, capability: Capability): boolean {
  return can(viewer.role, capability)
}
