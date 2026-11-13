'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { SLUG_PATTERN, slugify, uniqueSlug } from '@/lib/contractors/slug'
import { resendUnsentQuotes } from '@/lib/contractors/quote'
import { syncShopifyContractors } from '@/lib/contractors/shopify-sync'
import { isHex, isThemeKey } from '@/lib/contractors/theme'
import type { Segment, ServiceMode } from '@/lib/contractors/types'
import { requirePortalAdmin } from './auth'

/**
 * Writes for Contractors: add a contractor, edit one, link or unlink
 * their Shopify customers, and run the Shopify sync that consolidates the
 * Shopify dealer roster into contractors. A save refreshes the contractor's
 * public page and the finder.
 */

export interface ContractorInput {
  /** The page address, /contractor/<slug>. Blank on a new contractor makes one from the name. */
  slug: string
  isListed: boolean
  segment: Segment
  company: string
  firstName: string
  goesBy: string
  lastName: string
  phone: string
  phoneAlt: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  serviceStates: string
  serviceMode: ServiceMode | ''
  notes: string
  theme: string
  primary: string
  accent: string
  logoUrl: string
  tagline: string
}

const text = (v: unknown, max = 120) => String(v ?? '').trim().slice(0, max) || null

function phone(v: unknown): string | null {
  const raw = text(v, 40)
  const digits = raw?.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '') ?? ''
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : raw
}

function httpsUrl(v: string | null): boolean {
  if (!v) return true
  try {
    return new URL(v).protocol === 'https:'
  } catch {
    return false
  }
}

/** The input as a contractors row (without the slug), or what's wrong with it. */
function clean(input: ContractorInput): { row: Record<string, unknown>; name: string } | { error: string } {
  const company = text(input.company)
  const firstName = text(input.firstName, 60)
  const lastName = text(input.lastName, 60)
  if (!company && !firstName && !lastName) return { error: 'Add a company or a contact name.' }

  const email = text(input.email, 160)?.toLowerCase() ?? null
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'That email doesn’t look right.' }

  const state = text(input.state, 2)?.toUpperCase() ?? null
  if (state && !/^[A-Z]{2}$/.test(state)) return { error: 'Use the 2-letter state code.' }
  const zip = text(input.zip, 10)
  if (zip && !/^\d{5}$/.test(zip)) return { error: 'The ZIP needs 5 digits.' }
  const others = String(input.serviceStates ?? '')
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter((s) => /^[A-Z]{2}$/.test(s))
  const serviceStates = [...new Set([...(state ? [state] : []), ...others])]

  const primary = text(input.primary, 7)?.toLowerCase() ?? null
  const accent = text(input.accent, 7)?.toLowerCase() ?? null
  if ((primary && !isHex(primary)) || (accent && !isHex(accent))) return { error: 'Colors need to be hex, like #003365.' }
  const logoUrl = text(input.logoUrl, 500)
  if (!httpsUrl(logoUrl)) return { error: 'The logo needs an https:// address.' }

  return {
    name: company || [input.goesBy || firstName, lastName].filter(Boolean).join(' '),
    row: {
      is_listed: Boolean(input.isListed),
      segment: input.segment === 'commercial' ? 'commercial' : 'rv',
      company,
      first_name: firstName,
      goes_by: text(input.goesBy, 60),
      last_name: lastName,
      phone: phone(input.phone),
      phone_alt: phone(input.phoneAlt),
      email,
      street: text(input.street, 200),
      city: text(input.city, 80),
      state,
      zip,
      service_states: serviceStates,
      service_mode: ['shop', 'mobile', 'both'].includes(input.serviceMode) ? input.serviceMode : null,
      notes: text(input.notes, 2000),
      theme: isThemeKey(input.theme) ? input.theme : 'seal',
      color_primary: primary,
      color_accent: accent,
      logo_url: logoUrl,
      tagline: text(input.tagline, 90),
    },
  }
}

/** A typed page address, checked; null when it's blank. */
function typedSlug(v: string): { slug: string | null } | { error: string } {
  const slug = String(v ?? '').trim().toLowerCase()
  if (!slug) return { slug: null }
  return SLUG_PATTERN.test(slug) && slug.length <= 60
    ? { slug }
    : { error: 'The page address can use lowercase letters, numbers and single dashes.' }
}

/**
 * The dealer-list fields the import writes. An admin's change to one goes in edited_fields, and the
 * import leaves it alone from then on (docs/statecharts/contractor-records).
 */
const LIST_FIELDS = [
  'segment',
  'company',
  'first_name',
  'goes_by',
  'last_name',
  'phone',
  'phone_alt',
  'email',
  'street',
  'city',
  'state',
  'zip',
  'service_states',
  'service_mode',
  'notes',
] as const

const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
const filled = (v: unknown) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)

/**
 * Who holds a page address: a contractor's current address, or one a contractor used to have.
 * Both are taken, so an old address never opens anyone else's page.
 */
async function addressHolder(slug: string): Promise<{ contractorId: string; current: boolean } | null> {
  const db = createAdminClient()
  const { data: now } = await db.from('contractors').select('id').eq('slug', slug).limit(1)
  if (now?.length) return { contractorId: (now[0] as { id: string }).id, current: true }
  const { data: before } = await db.from('contractor_redirects').select('contractor_id').eq('slug', slug).maybeSingle<{ contractor_id: string }>()
  return before ? { contractorId: before.contractor_id, current: false } : null
}

function refresh(...slugs: string[]) {
  for (const s of slugs) revalidatePath(`/contractor/${s}`)
  revalidatePath('/contractor')
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
}

const TAKEN = (slug: string) => `/contractor/${slug} is taken. Pick another page address.`

export async function createContractor(input: ContractorInput): Promise<ActionResult & { id?: string }> {
  await requirePortalAdmin('contractors')
  const cleaned = clean(input)
  if ('error' in cleaned) return { ok: false, error: cleaned.error }
  const typed = typedSlug(input.slug)
  if ('error' in typed) return { ok: false, error: typed.error }

  const db = createAdminClient()
  let slug = typed.slug
  if (slug && (await addressHolder(slug))) return { ok: false, error: TAKEN(slug) }
  if (!slug) {
    const [{ data: now }, { data: before }] = await Promise.all([
      db.from('contractors').select('slug').limit(5000),
      db.from('contractor_redirects').select('slug').limit(5000),
    ])
    const taken = new Set([...(now ?? []), ...(before ?? [])].map((r: { slug: string }) => r.slug))
    slug = uniqueSlug(slugify(cleaned.name), taken)
  }

  // Everything an admin types in is theirs: a later import fills only the fields left blank.
  const edited = LIST_FIELDS.filter((f) => filled(cleaned.row[f]))
  const { data, error } = await db
    .from('contractors')
    .insert({ ...cleaned.row, slug, edited_fields: edited, source: 'admin' })
    .select('id')
    .single<{ id: string }>()
  if (error) return { ok: false, error: error.code === '23505' ? 'That page address was just taken. Try again.' : 'Could not add the contractor. Try again.' }
  refresh(slug)
  return { ok: true, id: data.id, message: 'Added' }
}

export async function saveContractor(id: string, input: ContractorInput): Promise<ActionResult> {
  await requirePortalAdmin('contractors')
  const cleaned = clean(input)
  if ('error' in cleaned) return { ok: false, error: cleaned.error }
  const typed = typedSlug(input.slug)
  if ('error' in typed) return { ok: false, error: typed.error }
  if (!typed.slug) return { ok: false, error: 'Add a page address.' }
  const slug = typed.slug

  const db = createAdminClient()
  const { data: before } = await db.from('contractors').select('*').eq('id', id).maybeSingle<Record<string, unknown> & { slug: string; edited_fields: string[] | null }>()
  if (!before) return { ok: false, error: 'This contractor no longer exists.' }
  const holder = slug === before.slug ? null : await addressHolder(slug)
  if (holder && holder.contractorId !== id) return { ok: false, error: TAKEN(slug) }

  const changed = LIST_FIELDS.filter((f) => !same(cleaned.row[f], before[f]))
  const edited = [...new Set([...(before.edited_fields ?? []), ...changed])]
  const { error } = await db
    .from('contractors')
    .update({ ...cleaned.row, slug, edited_fields: edited, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: error.code === '23505' ? TAKEN(slug) : 'Could not save. Try again.' }

  if (slug !== before.slug) {
    // The old address keeps leading here, and taking back an address of their own clears its redirect.
    const { error: kept } = await db.from('contractor_redirects').upsert({ slug: before.slug, contractor_id: id }, { onConflict: 'slug' })
    if (kept) console.error('[contractors] could not keep the old address', kept.message)
    if (holder) await db.from('contractor_redirects').delete().eq('slug', slug)
  }
  refresh(before.slug, slug)
  return { ok: true, message: 'Saved' }
}

/** Send again: email a quote request that hasn't reached the contractor or Crazy Seal's inbox. */
export async function resendQuote(leadId: string): Promise<void> {
  await requirePortalAdmin('contractors')
  await resendUnsentQuotes({ leadId })
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`

/** Link Shopify customers to their contractors and add Shopify dealers who aren't contractors yet, hidden. */
export async function syncContractorsFromShopify(): Promise<ActionResult> {
  await requirePortalAdmin('contractors')
  try {
    const report = await syncShopifyContractors(createAdminClient())
    revalidatePath('/portal/admin/dealers/contractors', 'layout')
    const parts = [report.added.length && `added ${plural(report.added.length, 'contractor')} (hidden)`, report.linked.length && `linked ${plural(report.linked.length, 'customer')}`]
    return { ok: true, message: parts.filter(Boolean).join(', ').replace(/^./, (c) => c.toUpperCase()) || 'Nothing new' }
  } catch (e) {
    console.error('[contractors] Shopify sync failed', e)
    return { ok: false, error: 'The sync didn’t finish. Try again.' }
  }
}

interface LinkRow {
  id: string
  slug: string
  company: string | null
  first_name: string | null
  last_name: string | null
  shopify_customer_ids: string[]
  unlinked_customer_ids: string[]
}

const LINK_COLUMNS = 'id, slug, company, first_name, last_name, shopify_customer_ids, unlinked_customer_ids'
const contractorName = (d: LinkRow) => d.company || [d.first_name, d.last_name].filter(Boolean).join(' ') || d.slug

/** Link the Shopify customer with this email to a contractor, so their orders count as the contractor's. */
export async function linkContractorCustomer(contractorId: string, email: string): Promise<ActionResult> {
  await requirePortalAdmin('contractors')
  const wanted = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wanted)) return { ok: false, error: 'Enter the email on their Shopify customer record.' }
  const db = createAdminClient()
  const [{ data: contractor }, { data: customers }] = await Promise.all([
    db.from('contractors').select(LINK_COLUMNS).eq('id', contractorId).maybeSingle<LinkRow>(),
    db.from('shopify_customers').select('shopify_id').ilike('email', wanted.replace(/[\\%_]/g, '\\$&')).is('deleted_at', null).limit(2),
  ])
  if (!contractor) return { ok: false, error: 'This contractor no longer exists.' }
  const customer = (customers ?? [])[0] as { shopify_id: string } | undefined
  if (!customer) return { ok: false, error: 'No Shopify customer has that email.' }
  if (contractor.shopify_customer_ids.includes(customer.shopify_id)) return { ok: true, message: 'Already linked' }
  const { data: other } = await db.from('contractors').select(LINK_COLUMNS).contains('shopify_customer_ids', [customer.shopify_id]).limit(1)
  const owner = (other ?? [])[0] as LinkRow | undefined
  if (owner) return { ok: false, error: `That customer is linked to ${contractorName(owner)}. Unlink them there first.` }
  const { error } = await db
    .from('contractors')
    .update({
      shopify_customer_ids: [...contractor.shopify_customer_ids, customer.shopify_id],
      unlinked_customer_ids: contractor.unlinked_customer_ids.filter((id) => id !== customer.shopify_id),
    })
    .eq('id', contractorId)
  if (error) return { ok: false, error: 'Could not link them. Try again.' }
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
  return { ok: true, message: 'Linked' }
}

/** Unlink a Shopify customer from a contractor. The sync won't link them to this contractor again. */
export async function unlinkContractorCustomer(contractorId: string, customerId: string): Promise<ActionResult> {
  await requirePortalAdmin('contractors')
  const db = createAdminClient()
  const { data: contractor } = await db.from('contractors').select(LINK_COLUMNS).eq('id', contractorId).maybeSingle<LinkRow>()
  if (!contractor) return { ok: false, error: 'This contractor no longer exists.' }
  const { error } = await db
    .from('contractors')
    .update({
      shopify_customer_ids: contractor.shopify_customer_ids.filter((id) => id !== customerId),
      unlinked_customer_ids: [...new Set([...contractor.unlinked_customer_ids, customerId])],
    })
    .eq('id', contractorId)
  if (error) return { ok: false, error: 'Could not unlink them. Try again.' }
  revalidatePath('/portal/admin/dealers/contractors', 'layout')
  return { ok: true, message: 'Unlinked' }
}
