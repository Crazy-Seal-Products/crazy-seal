/**
 * Which Shopify customers are which contractor (a row of the contractors
 * table). Used by the Shopify sync (./shopify-sync), which consolidates the
 * Shopify dealer roster into contractors, and by the admin's Contractors page.
 * Plain module with no imports, so the sync script can load it too.
 *
 * A customer already linked to a contractor stays with them. Otherwise, from
 * the strongest match down: the same email (theirs, or their Pro Hub
 * account's), the same 10-digit phone, the same company in a state the
 * contractor covers, and for Shopify dealers only, the same name in a state
 * the contractor covers. A customer with no state on file passes the state
 * checks. The first kind that finds anyone decides: one contractor gets the
 * link; two or more are narrowed to those in the customer's state, then those
 * with the customer's name. Several left with the same email are the same
 * person listed in more than one state, so the first listed gets it; several
 * left any other way are left for an admin. A contractor never gets a customer
 * an admin unlinked from them.
 *
 * Shopify dealers (customers tagged Dealer, Pro or Professional, or with an
 * order tagged Dealer) who match no contractor become new contractors, one per
 * person: those who share an email, phone, company or name and state become
 * one contractor with all of them linked.
 */

export interface MatchContractor {
  id: string
  email: string | null
  phone: string | null
  company: string | null
  first_name: string | null
  goes_by: string | null
  last_name: string | null
  state: string | null
  service_states: string[] | null
  shopify_customer_ids: string[] | null
  unlinked_customer_ids: string[] | null
  created_at: string
}

export interface MatchCustomer {
  shopify_id: string
  email: string | null
  phone: string | null
  first_name: string | null
  last_name: string | null
  company: string | null
  /** Their default address's 2-letter state. */
  province: string | null
}

export interface MatchAccount {
  email: string
  shopify_customer_id: string | null
}

export type MatchHow = 'email' | 'phone' | 'company' | 'name'

export interface ShopifyPlan {
  /** New links, customer to contractor. */
  links: { contractorId: string; customerId: string; how: MatchHow }[]
  /** Shopify dealers who match no contractor, grouped by person: each group becomes a new contractor. */
  adds: string[][]
  /** Customers who match several contractors equally well: an admin links them by hand. */
  ambiguous: { customerId: string; contractorIds: string[]; how: MatchHow }[]
}

/** An order the sales team tagged "Dealer". */
export const isDealerOrderTags = (tags: string[] | null) => (tags ?? []).some((t) => t.trim().toLowerCase() === 'dealer')

const low = (v: string | null | undefined) => (v ?? '').trim().toLowerCase()

export function phoneKey(v: string | null | undefined): string | null {
  const digits = (v ?? '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return digits.length === 10 ? digits : null
}

const NOT_A_COMPANY = new Set(['', 'na', 'none', 'self', 'home', 'personal', 'private', 'individual', 'rv', 'test'])

export function companyKey(v: string | null | undefined): string | null {
  const key = low(v)
    .replace(/&/g, ' and ')
    .replace(/\b(llc|l\.l\.c|inc|co|corp|corporation|company|ltd|pllc)\b\.?/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
  return NOT_A_COMPANY.has(key) || key.length < 4 ? null : key
}

function nameKey(first: string | null | undefined, last: string | null | undefined): string | null {
  const f = low(first).replace(/\s+/g, ' ')
  const l = low(last).replace(/\s+/g, ' ')
  return f && l ? `${f} ${l}` : null
}

/** A phone shared by more customers than this is an office or a placeholder, not one contractor. */
const SHARED_PHONE = 5

export function planShopifySync({
  contractors,
  customers,
  accounts,
  roster,
}: {
  contractors: MatchContractor[]
  customers: MatchCustomer[]
  accounts: MatchAccount[]
  /** Shopify ids of the dealer roster: customers Shopify marks as dealers. */
  roster: Set<string>
}): ShopifyPlan {
  const linked = new Set(contractors.flatMap((d) => d.shopify_customer_ids ?? []))
  const order = [...contractors].sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
  const index = (keys: (d: MatchContractor) => (string | null)[]) => {
    const map = new Map<string, MatchContractor[]>()
    for (const d of order) for (const k of new Set(keys(d))) if (k) map.set(k, [...(map.get(k) ?? []), d])
    return map
  }
  const byEmail = index((d) => [low(d.email) || null])
  const byPhone = index((d) => [phoneKey(d.phone)])
  const byCompany = index((d) => [companyKey(d.company)])
  const byName = index((d) => [nameKey(d.first_name, d.last_name), nameKey(d.goes_by, d.last_name)])

  const accountEmails = new Map<string, string[]>()
  for (const a of accounts) {
    if (!a.shopify_customer_id) continue
    accountEmails.set(a.shopify_customer_id, [...(accountEmails.get(a.shopify_customer_id) ?? []), low(a.email)])
  }
  const phoneUse = new Map<string, number>()
  for (const c of customers) {
    const p = phoneKey(c.phone)
    if (p) phoneUse.set(p, (phoneUse.get(p) ?? 0) + 1)
  }

  const plan: ShopifyPlan = { links: [], adds: [], ambiguous: [] }
  const unmatched: MatchCustomer[] = []
  for (const c of customers) {
    if (linked.has(c.shopify_id)) continue
    const state = (c.province ?? '').toUpperCase()
    const covers = (d: MatchContractor) => !state || d.state === state || (d.service_states ?? []).includes(state)
    const allowed = (ds: MatchContractor[] | undefined) => (ds ?? []).filter((d) => !(d.unlinked_customer_ids ?? []).includes(c.shopify_id))
    const phone = phoneKey(c.phone)
    const name = nameKey(c.first_name, c.last_name)

    const tiers: [MatchHow, MatchContractor[]][] = [
      ['email', allowed([...new Set([low(c.email), ...(accountEmails.get(c.shopify_id) ?? [])])].flatMap((e) => (e ? byEmail.get(e) ?? [] : [])))],
      ['phone', phone && (phoneUse.get(phone) ?? 0) <= SHARED_PHONE ? allowed(byPhone.get(phone)) : []],
      ['company', allowed(byCompany.get(companyKey(c.company) ?? '')).filter(covers)],
      ['name', roster.has(c.shopify_id) && name ? allowed(byName.get(name)).filter(covers) : []],
    ]

    let decided = false
    for (const [how, found] of tiers) {
      const unique = [...new Map(found.map((d) => [d.id, d])).values()]
      if (!unique.length) continue
      decided = true
      let pick = unique
      if (pick.length > 1 && state && pick.some(covers)) pick = pick.filter(covers)
      if (pick.length > 1 && name && pick.some((d) => byName.get(name)?.includes(d))) pick = pick.filter((d) => byName.get(name)?.includes(d))
      if (pick.length === 1 || how === 'email') plan.links.push({ contractorId: pick[0].id, customerId: c.shopify_id, how })
      else plan.ambiguous.push({ customerId: c.shopify_id, contractorIds: pick.map((d) => d.id), how })
      break
    }
    if (!decided && roster.has(c.shopify_id)) unmatched.push(c)
  }
  plan.adds = groupByPerson(unmatched)
  return plan
}

/** Unmatched Shopify dealers who share an email, phone, company, or name and state, as one group each. */
function groupByPerson(customers: MatchCustomer[]): string[][] {
  const parent = customers.map((_, i) => i)
  const root = (i: number): number => (parent[i] === i ? i : (parent[i] = root(parent[i])))
  const owner = new Map<string, number>()
  customers.forEach((c, i) => {
    const name = nameKey(c.first_name, c.last_name)
    const keys = [
      low(c.email) && `e:${low(c.email)}`,
      phoneKey(c.phone) && `p:${phoneKey(c.phone)}`,
      companyKey(c.company) && `c:${companyKey(c.company)}`,
      name && c.province && `n:${name}:${c.province.toUpperCase()}`,
    ]
    for (const k of keys) {
      if (!k) continue
      const j = owner.get(k)
      if (j === undefined) owner.set(k, i)
      else parent[root(i)] = root(j)
    }
  })
  const groups = new Map<number, string[]>()
  customers.forEach((c, i) => groups.set(root(i), [...(groups.get(root(i)) ?? []), c.shopify_id]))
  return [...groups.values()]
}
