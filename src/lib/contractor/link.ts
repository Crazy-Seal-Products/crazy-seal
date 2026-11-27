import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from '@/lib/pro/auth'
import { logContractorActivity } from './activity'
import { releaseAutoCompany } from './provision'
import type { MemberRow } from './types'

/**
 * Bringing Pro Hub accounts over to contractors. An account is linked to a
 * contractor as its owner only when the account's email is exactly the email
 * on exactly one contractor record, and that contractor has no owner yet. The
 * account proved it owns that email to sign in, so it is that contractor.
 * Weaker matches (a shared Shopify customer, phone or company name) are never
 * enough to hand someone a company: staff add those people by hand. This only
 * ever adds a contractor_members row: it never changes or deletes an account,
 * its orders or its warranties.
 */

const MEMBER_COLS = 'pro_user_id, contractor_id, role, status, title, invited_by, created_at, updated_at'

type Account = Pick<ProUser, 'id' | 'email' | 'display_name' | 'shopify_customer_id'>

function personName(user: Pick<ProUser, 'display_name' | 'email'>): string {
  return user.display_name?.trim() || user.email || 'Team member'
}

export type MatchResult =
  | { kind: 'match'; contractorId: string }
  | { kind: 'none' }
  | { kind: 'several' }
  /** The contractor already has an owner: their owner adds people from Team. */
  | { kind: 'has_owner'; contractorId: string }

/**
 * Contractors whose email is exactly this one (any case). PostgREST treats `*`
 * in a like pattern as a wildcard, so such emails never match, and every row
 * is checked for exact equality after the query.
 */
export async function contractorsWithEmail(email: string | null | undefined): Promise<string[]> {
  const wanted = email?.trim().toLowerCase()
  // `*` can't be escaped for PostgREST; `%` and `_` can (real emails may contain `_`).
  if (!wanted || wanted.includes('*')) return []
  const { data } = await createAdminClient()
    .from('contractors')
    .select('id, email, import_key')
    .ilike('email', wanted.replace(/[\\%_]/g, '\\$&'))
    .limit(5)
  // A Pro account's own automatic company (provision.ts) isn't a contractor on the list.
  return (data ?? [])
    .filter((r) => String(r.email ?? '').trim().toLowerCase() === wanted && !String(r.import_key ?? '').startsWith('auto:'))
    .map((r) => r.id as string)
}

/** Which contractor this account is, if any (see above). */
export async function matchContractor(user: Account): Promise<MatchResult> {
  const db = createAdminClient()
  const ids = await contractorsWithEmail(user.email)
  if (!ids.length) return { kind: 'none' }
  if (ids.length > 1) return { kind: 'several' }
  const { count } = await db
    .from('contractor_members')
    .select('pro_user_id', { count: 'exact', head: true })
    .eq('contractor_id', ids[0])
    .eq('role', 'owner')
    .neq('status', 'disabled')
  return count ? { kind: 'has_owner', contractorId: ids[0] } : { kind: 'match', contractorId: ids[0] }
}

/**
 * Adds the account to the contractor as its owner. Returns the new row, or
 * null when the account is already on a team (someone linked it first).
 */
export async function linkAsOwner(user: Account, contractorId: string, via: 'sign_in' | 'staff_sync', staff?: string): Promise<MemberRow | null> {
  const { data, error } = await createAdminClient()
    .from('contractor_members')
    .insert({ pro_user_id: user.id, contractor_id: contractorId, role: 'owner', status: 'active' })
    .select(MEMBER_COLS)
    .maybeSingle<MemberRow>()
  if (error) {
    if (error.code !== '23505') console.error('[contractor-link] link failed', error.message)
    return null
  }
  if (data) {
    const name = personName(user)
    await logContractorActivity(contractorId, {
      actorId: via === 'sign_in' ? user.id : null,
      actorName: via === 'sign_in' ? name : `${staff || 'Crazy Seal'} (Crazy Seal)`,
      actorRole: via === 'sign_in' ? 'owner' : 'crazy_seal',
      entity: 'team',
      entityId: user.id,
      action: 'create',
      summary:
        via === 'sign_in'
          ? `${name} opened the contractor portal with their Pro Hub account`
          : `${name}’s Pro Hub account was brought over to the portal as owner`,
    })
  }
  return data
}

export interface SyncReport {
  linked: { email: string; contractorId: string }[]
  alreadyOnTeam: number
  noMatch: number
  several: string[]
  hasOwner: string[]
}

/**
 * Links every Pro Hub account that isn't on a team yet to its matching
 * contractor (see above). Safe to run again: linked accounts are skipped.
 */
export async function syncProAccounts(staff: string): Promise<SyncReport> {
  const db = createAdminClient()
  const report: SyncReport = { linked: [], alreadyOnTeam: 0, noMatch: 0, several: [], hasOwner: [] }
  const { data: users, error } = await db.from('pro_users').select('id, email, display_name, shopify_customer_id').order('created_at')
  if (error) throw new Error(`pro_users: ${error.message}`)
  const { data: members } = await db.from('contractor_members').select('pro_user_id, contractor_id')
  const onTeam = new Set((members ?? []).map((m) => m.pro_user_id as string))

  const { data: autos } = await db.from('contractors').select('id').like('import_key', 'auto:%')
  const autoIds = new Set(((autos ?? []) as { id: string }[]).map((a) => a.id))
  const teamOf = new Map(((members ?? []) as { pro_user_id: string; contractor_id?: string }[]).map((m) => [m.pro_user_id, m.contractor_id ?? '']))

  for (const user of (users ?? []) as Account[]) {
    const onAuto = autoIds.has(teamOf.get(user.id) ?? '')
    if (onTeam.has(user.id) && !onAuto) {
      report.alreadyOnTeam++
      continue
    }
    const match = await matchContractor(user)
    // Someone who only owns their automatic company moves to their real contractor record when it's still empty.
    if (onAuto) {
      if (match.kind === 'match' && (await releaseAutoCompany(user.id)) && (await linkAsOwner(user, match.contractorId, 'staff_sync', staff))) {
        report.linked.push({ email: user.email, contractorId: match.contractorId })
      } else report.alreadyOnTeam++
      continue
    }
    if (match.kind === 'none') report.noMatch++
    else if (match.kind === 'several') report.several.push(user.email)
    else if (match.kind === 'has_owner') report.hasOwner.push(user.email)
    else if (await linkAsOwner(user, match.contractorId, 'staff_sync', staff)) report.linked.push({ email: user.email, contractorId: match.contractorId })
  }
  return report
}
