import type { SupabaseClient } from '@supabase/supabase-js'
import { isDealerOrderTags, planShopifySync, type MatchAccount, type MatchContractor, type MatchCustomer, type MatchHow } from './shopify-match'
import { slugify, uniqueSlug } from './slug'

/**
 * The Shopify sync, which consolidates the Shopify dealer roster into
 * contractors: it links Shopify customers to the contractors they are (so the
 * admin shows each contractor's spending), and adds every Shopify dealer who
 * isn't a contractor yet, hidden from the public site until an admin lists
 * them. It only adds links and rows: it never unlinks, edits a contractor's
 * details, changes a page address or deletes. Matching rules: ./shopify-match.
 *
 * Run from the admin's Contractors page (syncContractorsFromShopify), or
 *   node --env-file=.env.local scripts/sync-shopify-contractors.mjs [--dry-run]
 * Takes the database client so the script can pass its own.
 */

export interface SyncReport {
  dryRun: boolean
  linked: { contractor: string; customer: string; how: MatchHow }[]
  added: { slug: string; name: string; customers: string[] }[]
  ambiguous: { customer: string; contractors: string[] }[]
}

interface SyncCustomer extends MatchCustomer {
  display_name: string | null
  is_dealer: boolean
  is_commercial: boolean
  city: string | null
  zip: string | null
  street: string | null
}

type SyncContractor = MatchContractor & { slug: string; company: string | null }

const CUSTOMER_COLUMNS =
  'shopify_id, email, phone, first_name, last_name, display_name, is_dealer, is_commercial, company:default_address->>company, province:default_address->>provinceCode, city:default_address->>city, zip:default_address->>zip, street:default_address->>address1'

const CONTRACTOR_COLUMNS =
  'id, slug, email, phone, company, first_name, goes_by, last_name, state, service_states, shopify_customer_ids, unlinked_customer_ids, created_at'

async function pages<T>(read: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await read(from, from + 999)
    if (error) throw new Error(error.message)
    out.push(...((data ?? []) as T[]))
    if ((data ?? []).length < 1000) return out
  }
}

function phone(v: string | null): string | null {
  const digits = (v ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : v?.trim() || null
}

const orNull = (v: string | null | undefined, max = 120) => v?.replace(/\s+/g, ' ').trim().slice(0, max) || null

/** How much a Shopify record tells us, to pick the one a new contractor's details come from. */
const detail = (c: SyncCustomer) => (c.email ? 4 : 0) + (c.province ? 2 : 0) + (c.company ? 1 : 0)

/** A new hidden contractor from a Shopify dealer's records (one person, maybe several records). */
function contractorFrom(group: SyncCustomer[]) {
  const c = [...group].sort((a, b) => detail(b) - detail(a))[0]
  const state = /^[A-Z]{2}$/.test(c.province ?? '') ? c.province : null
  const zip = (c.zip ?? '').replace(/\D/g, '').slice(0, 5)
  return {
    source: 'shopify',
    is_listed: false,
    segment: group.some((g) => g.is_commercial) ? 'commercial' : 'rv',
    company: orNull(c.company),
    first_name: orNull(c.first_name, 60),
    last_name: orNull(c.last_name, 60),
    phone: phone(c.phone ?? group.find((g) => g.phone)?.phone ?? null),
    email: orNull(c.email, 160)?.toLowerCase() ?? null,
    street: orNull(c.street, 200),
    city: orNull(c.city, 80),
    state,
    zip: zip.length === 5 ? zip : null,
    service_states: state ? [state] : [],
    shopify_customer_ids: group.map((g) => g.shopify_id),
  }
}

const nameOf = (c: { company: string | null; first_name: string | null; last_name: string | null; email?: string | null }) =>
  c.company?.trim() || [c.first_name, c.last_name].filter(Boolean).join(' ') || c.email || 'Contractor'

export async function syncShopifyContractors(db: SupabaseClient, { dryRun = false }: { dryRun?: boolean } = {}): Promise<SyncReport> {
  const [contractors, redirects, customers, orders, accounts] = await Promise.all([
    pages<SyncContractor>((from, to) => db.from('contractors').select(CONTRACTOR_COLUMNS).order('id').range(from, to)),
    pages<{ slug: string }>((from, to) => db.from('contractor_redirects').select('slug').order('slug').range(from, to)),
    pages<SyncCustomer>((from, to) => db.from('shopify_customers').select(CUSTOMER_COLUMNS).is('deleted_at', null).order('id').range(from, to)),
    pages<{ customer_shopify_id: string | null; tags: string[] | null; cancelled_at: string | null }>((from, to) =>
      db
        .from('shopify_orders')
        .select('customer_shopify_id, tags, cancelled_at')
        .is('deleted_at', null)
        .eq('test', false)
        .not('customer_shopify_id', 'is', null)
        .order('id')
        .range(from, to),
    ),
    pages<MatchAccount>((from, to) => db.from('pro_users').select('email, shopify_customer_id').order('id').range(from, to)),
  ])

  const roster = new Set(customers.filter((c) => c.is_dealer).map((c) => c.shopify_id))
  for (const o of orders) if (!o.cancelled_at && o.customer_shopify_id && isDealerOrderTags(o.tags)) roster.add(o.customer_shopify_id)

  const plan = planShopifySync({ contractors, customers, accounts, roster })
  const contractorById = new Map(contractors.map((d) => [d.id, d]))
  const customerById = new Map(customers.map((c) => [c.shopify_id, c]))
  const report: SyncReport = {
    dryRun,
    linked: plan.links.map((l) => ({ contractor: contractorById.get(l.contractorId)!.slug, customer: nameOf(customerById.get(l.customerId)!), how: l.how })),
    added: [],
    ambiguous: plan.ambiguous.map((a) => ({ customer: nameOf(customerById.get(a.customerId)!), contractors: a.contractorIds.map((id) => contractorById.get(id)!.slug) })),
  }

  // Links: each contractor's list plus the new customers.
  const adding = new Map<string, string[]>()
  for (const l of plan.links) adding.set(l.contractorId, [...(adding.get(l.contractorId) ?? []), l.customerId])
  if (!dryRun) {
    for (const [id, ids] of adding) {
      const { data: now, error: readError } = await db.from('contractors').select('shopify_customer_ids').eq('id', id).maybeSingle<{ shopify_customer_ids: string[] }>()
      if (readError) throw new Error(readError.message)
      if (!now) continue
      const { error } = await db
        .from('contractors')
        .update({ shopify_customer_ids: [...new Set([...now.shopify_customer_ids, ...ids])] })
        .eq('id', id)
      if (error) throw new Error(`link ${contractorById.get(id)?.slug}: ${error.message}`)
    }
  }

  // New contractors, each at a page address no one has or used to have.
  const taken = new Set([...contractors.map((d) => d.slug), ...redirects.map((r) => r.slug)])
  for (const ids of plan.adds) {
    const row = contractorFrom(ids.map((id) => customerById.get(id)!))
    const name = nameOf(row)
    const customers = ids.map((id) => nameOf(customerById.get(id)!))
    if (!dryRun) {
      // A sync started a moment ago may have added them already.
      const { data: already } = await db.from('contractors').select('id').overlaps('shopify_customer_ids', ids).limit(1)
      if (already?.length) continue
    }
    for (let attempt = 0; ; attempt++) {
      const slug = uniqueSlug(slugify(name), taken)
      taken.add(slug)
      if (dryRun) {
        report.added.push({ slug, name, customers })
        break
      }
      const { error } = await db.from('contractors').insert({ ...row, slug })
      if (!error) {
        report.added.push({ slug, name, customers })
        break
      }
      // Someone took the address a moment ago: try the next one.
      if (error.code !== '23505' || attempt > 5) throw new Error(`add ${name}: ${error.message}`)
    }
  }
  return report
}
