import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { safePortalNext } from './next-path'
import { can, type Capability } from './roles'
import { getViewerState, type AccountViewer, type ContractorViewer } from './viewer'

/**
 * Checks for contractor portal pages and server actions. Company pages call
 * requirePortal(capability); pages every Pro Hub account has (dashboard,
 * orders, warranties, rewards, support, training) call requireAccount(). Every
 * write calls portalAction(capability), so what a role can do through the
 * server matches what its screen shows (src/lib/contractor/roles.ts). Writes
 * are refused in View as.
 */

export const PORTAL_SIGN_IN = '/pro/login/?next=/portal/'

/** Sign in, then back to the portal page that was asked for (set by src/proxy.ts), when it's a safe one. */
export async function portalSignIn(): Promise<string> {
  const path = safePortalNext((await headers()).get('x-cs-portal-path'))
  return path && path !== '/portal/' ? `/pro/login/?next=${encodeURIComponent(path)}` : PORTAL_SIGN_IN
}

/**
 * For company pages (projects, customers, quotes, team…): the contractor
 * viewer. Signed-out people go to sign in, accounts on no team to the portal
 * home, and roles without the capability get a 404.
 */
export async function requirePortal(capability?: Capability): Promise<ContractorViewer> {
  const state = await getViewerState()
  if (state.status === 'signed_out') redirect(await portalSignIn())
  if (state.status === 'personal') redirect('/portal/')
  if (capability && !can(state.viewer.role, capability)) notFound()
  return state.viewer
}

/**
 * For pages every account has: the account, and its contractor viewer when it
 * works for one. With a viewer, `capability` must be allowed for its role.
 */
export async function requireAccount(capability?: Capability): Promise<{ account: AccountViewer; viewer: ContractorViewer | null }> {
  const state = await getViewerState()
  if (state.status === 'signed_out') redirect(await portalSignIn())
  if (state.status === 'personal') return { account: state.account, viewer: null }
  if (capability && !can(state.viewer.role, capability)) notFound()
  return { account: state.viewer, viewer: state.viewer }
}

/** What a portal server action returns: `id` names a record it created. */
export type PortalResult = { ok: true; message?: string; id?: string } | { ok: false; error: string }

export type GuardResult = { ok: true; viewer: ContractorViewer } | { ok: false; error: string }

/** For server actions and API routes: the viewer if they may make this change, or why not. */
export async function portalAction(capability: Capability): Promise<GuardResult> {
  const state = await getViewerState()
  if (state.status === 'signed_out') return { ok: false, error: 'Your session ended. Sign in again.' }
  if (state.status === 'personal') return { ok: false, error: 'This account isn’t on a contractor team.' }
  const viewer = state.viewer
  if (viewer.readOnly) return { ok: false, error: VIEW_AS_READ_ONLY }
  if (!can(viewer.role, capability)) return { ok: false, error: 'Your role can’t do that. Ask your company’s owner or admin.' }
  return { ok: true, viewer }
}

export type AccountGuardResult = { ok: true; account: AccountViewer; viewer: ContractorViewer | null } | { ok: false; error: string }

/**
 * For writes every account can make (warranties on their own orders, support):
 * the account, and its contractor viewer when it has one, whose role must
 * allow `capability`. Refused in View as.
 */
export async function accountAction(capability?: Capability): Promise<AccountGuardResult> {
  const state = await getViewerState()
  if (state.status === 'signed_out') return { ok: false, error: 'Your session ended. Sign in again.' }
  const account = state.status === 'ok' ? state.viewer : state.account
  if (account.readOnly) return { ok: false, error: VIEW_AS_READ_ONLY }
  if (state.status === 'personal') return { ok: true, account, viewer: null }
  if (capability && !can(state.viewer.role, capability)) return { ok: false, error: 'Your role can’t do that. Ask your company’s owner or admin.' }
  return { ok: true, account, viewer: state.viewer }
}
