import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from '@/lib/pro/auth'
import { slugify, uniqueSlug } from '@/lib/contractors/slug'
import { logContractorActivity } from './activity'
import type { MemberRow, PortalContractor } from './types'

/**
 * Every Pro account gets the full contractor portal (quote builder, projects,
 * customers, price list, team…), which hangs off a contractor record. An
 * account that isn't on any contractor's team and isn't a contractor on
 * Crazy Seal's list gets its own company the first time it opens the portal:
 * a contractors row hidden from every public page (is_listed false) with the
 * account as owner. It only ever adds rows.
 *
 * The record is marked import_key = 'auto:<account id>', so staff can tell it
 * apart, and so inviting the person to a real contractor's team moves them
 * there (see releaseAutoCompany).
 */

const MEMBER_COLS = 'pro_user_id, contractor_id, role, status, title, invited_by, created_at, updated_at'
export const AUTO_COMPANY_PREFIX = 'auto:'

export function isAutoCompany(c: Pick<PortalContractor, 'import_key'> | null | undefined): boolean {
  return Boolean(c?.import_key?.startsWith(AUTO_COMPANY_PREFIX))
}

function companyName(user: Pick<ProUser, 'business_name' | 'display_name' | 'email'>): string {
  return user.business_name?.trim() || user.display_name?.trim() || user.email.split('@')[0] || 'My company'
}

async function freeSlug(base: string): Promise<string> {
  const db = createAdminClient()
  const root = (slugify(base) || 'contractor').slice(0, 50).replace(/-+$/, '') || 'contractor'
  const [{ data: rows }, { data: redirects }] = await Promise.all([
    db.from('contractors').select('slug').like('slug', `${root}%`).limit(500),
    db.from('contractor_redirects').select('slug').like('slug', `${root}%`).limit(500),
  ])
  const taken = new Set([...(rows ?? []), ...(redirects ?? [])].map((r) => r.slug as string))
  return uniqueSlug(root, taken)
}

/** Gives the account its own hidden company and makes it the owner. Null if that couldn't be done. */
export async function provisionCompany(user: ProUser): Promise<MemberRow | null> {
  const db = createAdminClient()
  const key = `${AUTO_COMPANY_PREFIX}${user.id}`
  // Made already (an earlier request), but the membership didn't land: reuse it.
  let { data: contractor } = await db.from('contractors').select('id').eq('import_key', key).maybeSingle<{ id: string }>()

  if (!contractor) {
    const name = companyName(user)
    const [first, ...rest] = (user.display_name?.trim() || '').split(/\s+/)
    for (let attempt = 0; attempt < 3 && !contractor; attempt++) {
      const { data, error } = await db
        .from('contractors')
        .insert({
          slug: await freeSlug(attempt ? `${name}-${Math.random().toString(36).slice(2, 6)}` : name),
          company: user.business_name?.trim() || user.display_name?.trim() || null,
          first_name: first || null,
          last_name: rest.join(' ') || null,
          email: user.email,
          phone: user.phone,
          is_listed: false,
          import_key: key,
          source: user.shopify_customer_id ? 'shopify' : 'admin',
          shopify_customer_ids: user.shopify_customer_id ? [user.shopify_customer_id] : [],
          notes: 'Set up automatically when this Pro account opened the contractor portal. Hidden from the public until Crazy Seal lists it.',
        })
        .select('id')
        .maybeSingle<{ id: string }>()
      if (data) contractor = data
      else if (error && error.code !== '23505') {
        console.error('[provision] contractor insert failed', error.message)
        return null
      } else {
        // Same import_key made at the same moment: use that one.
        const again = await db.from('contractors').select('id').eq('import_key', key).maybeSingle<{ id: string }>()
        if (again.data) contractor = again.data
      }
    }
  }
  if (!contractor) return null

  const { data: member, error } = await db
    .from('contractor_members')
    .insert({ pro_user_id: user.id, contractor_id: contractor.id, role: 'owner', status: 'active' })
    .select(MEMBER_COLS)
    .maybeSingle<MemberRow>()
  if (error) {
    if (error.code !== '23505') console.error('[provision] membership insert failed', error.message)
    const { data: existing } = await db.from('contractor_members').select(MEMBER_COLS).eq('pro_user_id', user.id).maybeSingle<MemberRow>()
    return existing
  }
  await logContractorActivity(contractor.id, {
    actorId: user.id,
    actorName: user.display_name?.trim() || user.email,
    actorRole: 'owner',
    entity: 'team',
    entityId: user.id,
    action: 'create',
    summary: `${user.display_name?.trim() || user.email} opened the Pro portal; their company was set up`,
  })
  return member
}

/** Whether anything has been made in this company yet (so leaving it would strand it). */
export async function companyHasRecords(contractorId: string): Promise<boolean> {
  const db = createAdminClient()
  const tables = ['contractor_projects', 'contractor_customers', 'quotes', 'roof_facilities', 'media_assets', 'contractor_quotes', 'contractor_opportunities'] as const
  const counts = await Promise.all(
    tables.map(async (t) => {
      const { count, error } = await db.from(t).select('*', { count: 'exact', head: true }).eq('contractor_id', contractorId)
      // A table that isn't there yet holds nothing; any other error counts as "has records" to stay safe.
      if (error) return error.code === '42P01' || error.code === 'PGRST205' ? 0 : 1
      return count ?? 0
    }),
  )
  return counts.some((n) => n > 0)
}

/**
 * Lets an account that only owns its automatic company join a real one:
 * removes its seat on the automatic company. Only when nothing has been made
 * there yet and nobody else works in it, so no projects, customers, quotes or
 * roofs are ever stranded; otherwise returns false and staff move them.
 */
export async function releaseAutoCompany(proUserId: string): Promise<boolean> {
  const db = createAdminClient()
  const { data: member } = await db.from('contractor_members').select('contractor_id').eq('pro_user_id', proUserId).maybeSingle<{ contractor_id: string }>()
  if (!member) return true
  const { data: contractor } = await db.from('contractors').select('import_key').eq('id', member.contractor_id).maybeSingle<{ import_key: string | null }>()
  if (!isAutoCompany(contractor)) return false
  const { count } = await db.from('contractor_members').select('pro_user_id', { count: 'exact', head: true }).eq('contractor_id', member.contractor_id)
  if ((count ?? 0) > 1) return false
  if (await companyHasRecords(member.contractor_id)) return false
  const { error } = await db.from('contractor_members').delete().eq('pro_user_id', proUserId).eq('contractor_id', member.contractor_id)
  return !error
}

/**
 * A stand-in company for View as of an account that has no company yet, so
 * staff see the full portal (read-only, empty). Never written anywhere.
 */
export function previewCompany(user: ProUser): PortalContractor {
  const now = new Date().toISOString()
  return {
    id: '00000000-0000-0000-0000-000000000000',
    slug: 'preview',
    segment: 'rv',
    company: companyName(user),
    first_name: null,
    goes_by: null,
    last_name: null,
    phone: user.phone,
    phone_alt: null,
    email: user.email,
    street: null,
    city: null,
    state: null,
    zip: null,
    service_states: [],
    service_mode: null,
    notes: null,
    theme: 'seal',
    color_primary: null,
    color_accent: null,
    logo_url: null,
    tagline: null,
    is_listed: false,
    import_key: null,
    shopify_customer_ids: user.shopify_customer_id ? [user.shopify_customer_id] : [],
    unlinked_customer_ids: [],
    source: 'admin',
    created_at: user.created_at || now,
    updated_at: now,
    pricing_tier_id: null,
    rep_id: null,
    payment_terms: 'card',
  }
}
