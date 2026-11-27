'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import { BUILDER_LIVE_TAG } from './builder-live'
import { QUOTE_HANDLES } from './engine'
import { getQuoteCatalog } from './price-book'
import { PRODUCT_KEYS, type JobDiscount, type PriceList, type ProductKey } from './price-list-2027'
import { getPricingSettings } from './settings'
import { getTier } from './tiers'
import type { Coverage, PricingLogSubject, TierAudience } from './types'

/**
 * Admin writes to pricing (Admin > Pricing): settings, the price list and
 * job discounts (036_price_list.sql), tiers and the price book. Every change
 * is a pricing_log row: who, what, and from what to what.
 */

const PATH = '/portal/admin/pricing'
const UUID_RE = /^[0-9a-f-]{36}$/i

/** The error when a save needs 036's columns and the database doesn't have them yet. */
const NEEDS_036 =
  'Apply migration 036 (supabase/migrations/036_price_list.sql) to the database first: the price list, job discounts and free-shipping line are saved in its new columns. Until then quotes use the built-in 2027 price list.'

/** PostgREST / Postgres saying a column doesn't exist. */
function missingColumn(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  return error.code === '42703' || error.code === 'PGRST204' || /column .* does not exist|could not find the .* column/i.test(error.message ?? '')
}

async function logPricing(admin: PortalAdmin, subject: PricingLogSubject, subjectId: string | null, summary: string, changes: Record<string, [unknown, unknown]> | null) {
  const { error } = await createAdminClient()
    .from('pricing_log')
    .insert({ actor_email: admin.email, actor_name: admin.name, subject, subject_id: subjectId, summary: summary.slice(0, 500), changes: changes && Object.keys(changes).length ? changes : null })
  if (error) console.error('[pricing_log] insert failed', error.message)
}

function diff(before: Record<string, unknown>, after: Record<string, unknown>): Record<string, [unknown, unknown]> {
  const out: Record<string, [unknown, unknown]> = {}
  for (const [k, v] of Object.entries(after)) {
    if (JSON.stringify(before[k] ?? null) !== JSON.stringify(v ?? null)) out[k] = [before[k] ?? null, v ?? null]
  }
  return out
}

/** A number from a form field ('' -> null), or undefined when it isn't one. */
function numField(v: FormDataEntryValue | unknown, opts: { min?: number; max?: number; integer?: boolean } = {}): number | null | undefined {
  const s = String(v ?? '').replace(/[$,%\s]/g, '')
  if (!s) return null
  const x = Number(s)
  if (!Number.isFinite(x)) return undefined
  if (opts.integer && !Number.isInteger(x)) return undefined
  if (opts.min != null && x < opts.min) return undefined
  if (opts.max != null && x > opts.max) return undefined
  return x
}

const SETTING_LABEL: Record<string, string> = {
  default_markup: 'default markup',
  offer_discount_pct: 'live offer discount',
  offer_hours: 'offer hours',
  free_shipping_under: 'freight from',
  free_shipping_over: 'free shipping from',
  price_list: 'price list',
  job_discounts: 'job discounts',
  capture_phone_at: 'ask for phone at',
  capture_address_at: 'ask for address at',
  reminder_hours: 'reminder before the offer ends',
  auto_reoffer: 'automatic re-offer',
  public_builder_live: 'public builder live',
  coverage: 'coverage rates',
}

export async function savePricingSettings(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  const admin = await requirePortalAdmin('pricing')
  const before = await getPricingSettings()

  const fields: Array<[string, number | null | undefined, string]> = [
    ['offer_discount_pct', numField(form.get('offer_discount_pct'), { min: 0, max: 99.99 }), 'The live offer discount is a percent from 0 to 99.'],
    ['offer_hours', numField(form.get('offer_hours'), { min: 1, max: 720, integer: true }), 'The offer lasts 1 to 720 hours.'],
    ['free_shipping_over', numField(form.get('free_shipping_over'), { min: 0, max: 10_000_000 }), 'Enter the order total where free shipping starts.'],
    ['free_shipping_under', numField(form.get('free_shipping_under'), { min: 0, max: 10_000_000 }), 'Enter the order total where freight starts.'],
    ['capture_phone_at', numField(form.get('capture_phone_at'), { min: 0, max: 10_000_000 }), 'Enter the total where the builder asks for a phone number.'],
    ['capture_address_at', numField(form.get('capture_address_at'), { min: 0, max: 10_000_000 }), 'Enter the total where the builder asks for a ship-to address.'],
    ['reminder_hours', numField(form.get('reminder_hours'), { min: 0, max: 720, integer: true }), 'The reminder goes 0 to 720 hours before the offer ends (0: no reminder).'],
  ]
  const next: Record<string, unknown> = {}
  for (const [key, value, message] of fields) {
    if (value == null) return { ok: false, error: message }
    next[key] = value
  }
  if ((next.reminder_hours as number) >= (next.offer_hours as number)) return { ok: false, error: 'The reminder has to go out before the offer ends: fewer hours than the offer lasts.' }
  if ((next.free_shipping_over as number) > (next.free_shipping_under as number)) return { ok: false, error: 'Free shipping has to start below where freight starts.' }
  // free_shipping_over is 036's column: before 036 only an unchanged value can be saved (it isn't sent).
  if (!before.has_price_list) {
    if (next.free_shipping_over !== before.free_shipping_over) return { ok: false, error: NEEDS_036 }
    delete next.free_shipping_over
  }

  const cov = (name: string, min: number, max: number) => numField(form.get(name), { min, max })
  const coverage: Coverage = {
    coats: cov('coats', 1, 5) as number,
    caulkSqftPerTube: cov('caulkSqftPerTube', 1, 100_000) as number,
    patchFtPerGallon: cov('patchFtPerGallon', 1, 100_000) as number,
    cleanSqftPerGallon: cov('cleanSqftPerGallon', 1, 100_000) as number,
    sealSqftPerGallonPerCoat: {
      'over-existing': cov('seal_over_existing', 1, 10_000) as number,
      'direct-to-deck': cov('seal_direct_to_deck', 1, 10_000) as number,
    },
  }
  const covValues = [coverage.coats, coverage.caulkSqftPerTube, coverage.patchFtPerGallon, coverage.cleanSqftPerGallon, ...Object.values(coverage.sealSqftPerGallonPerCoat)]
  if (covValues.some((v) => v == null || !Number.isFinite(v))) return { ok: false, error: 'Each coverage rate needs a positive number (coats 1 to 5).' }
  if (!Number.isInteger(coverage.coats)) return { ok: false, error: 'Coats is a whole number.' }
  next.coverage = coverage
  next.auto_reoffer = form.get('auto_reoffer') === 'on'
  next.public_builder_live = form.get('public_builder_live') === 'on'

  const changes = diff(before as unknown as Record<string, unknown>, next)
  if (!Object.keys(changes).length) return { ok: true, message: 'No changes' }

  const { error } = await createAdminClient()
    .from('pricing_settings')
    .update({ ...next, updated_by: admin.email, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) return { ok: false, error: missingColumn(error) ? NEEDS_036 : error.message }

  await logPricing(admin, 'settings', null, `Changed ${Object.keys(changes).map((k) => SETTING_LABEL[k] ?? k).join(', ')}`, changes)
  revalidatePath(PATH)
  revalidatePath('/quote')
  revalidatePath('/portal/catalog')
  // The switch decides store or quote builder on every page (header, footer,
  // store redirects); expire it now rather than wait out its cache.
  if ('public_builder_live' in changes) revalidateTag(BUILDER_LIVE_TAG, { expire: 0 })
  return { ok: true, message: 'Saved' }
}

/** The price list editor's form, as typed (dollars and percents as strings). */
export interface PriceListInput {
  retail: { seal: string; patch: string; caulk: string; clean: string; tape: string }
  bands: Array<{ minSqft: string; maxSqft: string; perGallon: string }>
  tote: { gallons: string; perGallon: string }
  project: { caulk: string; clean: string; tape: string }
  costs: Record<ProductKey, string>
  jobDiscounts: Array<{ minOrders: string; pct: string }>
}

const MAX_PRICE = 1_000_000

/** Checks the price list editor's form: the price list and job discounts, or what's wrong. */
function parsePriceListInput(input: PriceListInput): { ok: true; priceList: PriceList; jobDiscounts: JobDiscount[] } | { ok: false; error: string } {
  const price = (v: unknown, what: string): number | string => numField(v, { min: 0, max: MAX_PRICE }) ?? `${what} needs a dollar amount.`
  const optional = (v: unknown, what: string): number | null | string => {
    const x = numField(v, { min: 0, max: MAX_PRICE })
    return x === undefined ? `${what} is a dollar amount, or empty to use the project price.` : x
  }
  const r = input?.retail ?? ({} as Partial<PriceListInput['retail']>)
  const p = input?.project ?? ({} as Partial<PriceListInput['project']>)
  const v = {
    seal: price(r.seal, 'Retail Crazy Seal'),
    patch: price(r.patch, 'Retail Crazy Patch'),
    caulk: price(r.caulk, 'Retail Crazy Caulk'),
    clean: optional(r.clean, 'Retail Crazy Clean'),
    tape: optional(r.tape, 'Retail Crazy Tape'),
    pCaulk: price(p.caulk, 'Project Crazy Caulk'),
    pClean: price(p.clean, 'Project Crazy Clean'),
    pTape: price(p.tape, 'Project Crazy Tape'),
    toteGallons: numField(input?.tote?.gallons, { min: 1, max: 10_000, integer: true }) ?? 'The tote size is a whole number of gallons.',
    totePerGallon: price(input?.tote?.perGallon, 'The tote price per gallon'),
  }
  for (const x of Object.values(v)) if (typeof x === 'string') return { ok: false, error: x }
  const n = (x: number | string | null) => x as number

  const bands: PriceList['bands'] = []
  for (const [i, b] of (input?.bands ?? []).entries()) {
    const min = numField(b?.minSqft, { min: 1, max: 10_000_000, integer: true })
    const max = numField(b?.maxSqft, { min: 1, max: 10_000_000, integer: true })
    const per = numField(b?.perGallon, { min: 0, max: MAX_PRICE })
    if (min == null) return { ok: false, error: `Band ${i + 1} needs its smallest roof, in whole sq ft.` }
    if (max === undefined) return { ok: false, error: `Band ${i + 1}: the largest roof is whole sq ft, or empty for no top.` }
    if (per == null) return { ok: false, error: `Band ${i + 1} needs a price per gallon.` }
    if (max != null && max < min) return { ok: false, error: `Band ${i + 1} ends before it starts.` }
    bands.push({ minSqft: min, maxSqft: max, perGallon: per })
  }
  if (!bands.length) return { ok: false, error: 'Add at least one project band.' }
  bands.sort((a, b) => a.minSqft - b.minSqft)
  for (let i = 1; i < bands.length; i++) {
    const prev = bands[i - 1]
    if (prev.maxSqft == null || prev.maxSqft >= bands[i].minSqft) return { ok: false, error: `The bands from ${prev.minSqft.toLocaleString('en-US')} and ${bands[i].minSqft.toLocaleString('en-US')} sq ft overlap.` }
  }

  const costs = {} as Record<ProductKey, number>
  for (const k of PRODUCT_KEYS) {
    const c = price(input?.costs?.[k], `The ${k} cost`)
    if (typeof c === 'string') return { ok: false, error: c }
    costs[k] = c
  }

  const jobDiscounts: JobDiscount[] = []
  for (const [i, j] of (input?.jobDiscounts ?? []).entries()) {
    const minOrders = numField(j?.minOrders, { min: 1, max: 100_000, integer: true })
    const pct = numField(j?.pct, { min: 0, max: 99.99 })
    if (minOrders == null) return { ok: false, error: `Job discount ${i + 1} needs a whole number of orders.` }
    if (pct == null) return { ok: false, error: `Job discount ${i + 1} needs a percent from 0 to 99.` }
    jobDiscounts.push({ minOrders, pct })
  }
  jobDiscounts.sort((a, b) => a.minOrders - b.minOrders)
  if (new Set(jobDiscounts.map((j) => j.minOrders)).size !== jobDiscounts.length) return { ok: false, error: 'Two job discounts start at the same order count.' }

  return {
    ok: true,
    jobDiscounts,
    priceList: {
      retail: { seal: n(v.seal), patch: n(v.patch), caulk: n(v.caulk), clean: v.clean as number | null, tape: v.tape as number | null },
      bands,
      tote: { gallons: n(v.toteGallons), perGallon: n(v.totePerGallon) },
      project: { caulk: n(v.pCaulk), clean: n(v.pClean), tape: n(v.pTape) },
      costs,
    },
  }
}

/** Saves the price list and job discounts (pricing_settings.price_list and job_discounts, from 036). */
export async function savePriceList(input: PriceListInput): Promise<ActionResult> {
  const admin = await requirePortalAdmin('pricing')
  const parsed = parsePriceListInput(input)
  if (!parsed.ok) return parsed
  const before = await getPricingSettings()
  if (!before.has_price_list) return { ok: false, error: NEEDS_036 }

  const next = { price_list: parsed.priceList, job_discounts: parsed.jobDiscounts }
  const changes = diff({ price_list: before.price_list, job_discounts: before.job_discounts }, next)
  if (!Object.keys(changes).length) return { ok: true, message: 'No changes' }

  const { error } = await createAdminClient()
    .from('pricing_settings')
    .update({ ...next, updated_by: admin.email, updated_at: new Date().toISOString() })
    .eq('id', true)
  if (error) return { ok: false, error: missingColumn(error) ? NEEDS_036 : error.message }

  await logPricing(admin, 'settings', null, `Changed the ${Object.keys(changes).map((k) => SETTING_LABEL[k] ?? k).join(' and ')}`, changes)
  revalidatePath(PATH)
  revalidatePath('/quote')
  revalidatePath('/portal/catalog')
  return { ok: true, message: 'Saved. New and refreshed quotes use it.' }
}

export interface TierInput {
  name: string
  audience: TierAudience
  /** Percent, as typed. */
  discountPct: string
  /** Dollars, as typed; public tiers only. */
  minSubtotal: string
  active: boolean
  sort: string
}

export async function saveTier(id: string | null, input: TierInput): Promise<ActionResult> {
  const admin = await requirePortalAdmin('pricing')
  if (id && !UUID_RE.test(id)) return { ok: false, error: 'Unknown tier' }
  const name = String(input?.name ?? '').trim().replace(/\s+/g, ' ')
  if (!name || name.length > 60) return { ok: false, error: 'Give the tier a name (up to 60 characters).' }
  const audience: TierAudience = input?.audience === 'contractor' ? 'contractor' : 'public'
  const pct = numField(input?.discountPct, { min: 0, max: 99.99 })
  if (pct == null) return { ok: false, error: 'The discount is a percent from 0 to 99.' }
  const min = audience === 'public' ? numField(input?.minSubtotal, { min: 0, max: 100_000_000 }) : null
  if (min === undefined) return { ok: false, error: 'The minimum is a dollar amount, or empty for none.' }
  const sortRaw = numField(input?.sort, { integer: true, min: -1000, max: 1000 })
  if (sortRaw === undefined) return { ok: false, error: 'Sort is a whole number from -1000 to 1000.' }
  const sort = sortRaw ?? 0

  const row = { name, audience, discount_pct: pct, min_subtotal: min, active: Boolean(input?.active), sort, updated_at: new Date().toISOString() }
  const db = createAdminClient()
  const before = id ? await getTier(id) : null
  if (id && !before) return { ok: false, error: 'Unknown tier' }

  if (id && before) {
    const { error } = await db.from('pricing_tiers').update(row).eq('id', id)
    if (error) return { ok: false, error: error.message }
    const changes = diff(before as unknown as Record<string, unknown>, { name, audience, discount_pct: pct, min_subtotal: min, active: row.active, sort })
    if (Object.keys(changes).length) await logPricing(admin, 'tier', id, `Changed tier ${name}`, changes)
  } else {
    const { data, error } = await db.from('pricing_tiers').insert(row).select('id').single<{ id: string }>()
    if (error) return { ok: false, error: error.message }
    await logPricing(admin, 'tier', data.id, `Added ${audience} tier ${name} at ${pct}%`, null)
  }
  revalidatePath(PATH)
  return { ok: true, message: 'Saved' }
}

export async function deleteTier(id: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('pricing')
  const before = await getTier(id)
  if (!before) return { ok: false, error: 'Unknown tier' }
  const db = createAdminClient()
  const { count } = await db.from('contractors').select('id', { count: 'exact', head: true }).eq('pricing_tier_id', id)
  const { error } = await db.from('pricing_tiers').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  await logPricing(
    admin,
    'tier',
    id,
    `Deleted tier ${before.name}${count ? ` (${count} contractor${count === 1 ? '' : 's'} lost it)` : ''}`,
    { name: [before.name, null], discount_pct: [before.discount_pct, null] },
  )
  revalidatePath(PATH)
  return { ok: true, message: 'Deleted' }
}

export interface CostInput {
  /** Dollars, as typed; '' to use the price list's cost. */
  cost: string
  /** Multiplier, as typed; '' to price from the price list (set: the variant's price is cost x markup). */
  markup: string
  active: boolean
}

export async function saveCost(variantId: string, input: CostInput): Promise<ActionResult> {
  const admin = await requirePortalAdmin('pricing')
  const catalog = await getQuoteCatalog()
  const product = QUOTE_HANDLES.map((h) => catalog[h]).find((p) => p?.variants.some((v) => v.id === variantId))
  const variant = product?.variants.find((v) => v.id === variantId)
  if (!product || !variant) return { ok: false, error: 'That variant isn’t one the quote builder uses.' }

  const cost = numField(input?.cost, { min: 0, max: 1_000_000 })
  if (cost === undefined) return { ok: false, error: 'The cost is a dollar amount, or empty for the price list’s cost.' }
  const markup = numField(input?.markup, { min: 1, max: 999 })
  if (markup === undefined) return { ok: false, error: 'The markup is a multiplier of 1 or more, or empty to use the price list.' }

  const db = createAdminClient()
  const { data: prev } = await db.from('price_book').select('material_cost, markup, active').eq('variant_id', variantId).maybeSingle()
  const before = {
    material_cost: prev?.material_cost == null ? null : Number(prev.material_cost),
    markup: prev?.markup == null ? null : Number(prev.markup),
    active: prev ? prev.active !== false : true,
  }
  const after = { material_cost: cost, markup, active: Boolean(input?.active) }
  const changes = diff(before, after)
  if (prev && !Object.keys(changes).length) return { ok: true, message: 'No changes' }

  const title = `${product.title} · ${variant.title}`
  const { error } = await db
    .from('price_book')
    .upsert({ variant_id: variantId, product_handle: product.handle, title, ...after, updated_by: admin.email, updated_at: new Date().toISOString() }, { onConflict: 'variant_id' })
  if (error) return { ok: false, error: error.message }

  const parts: string[] = []
  if (changes.material_cost) parts.push(cost == null ? 'price list cost' : `cost $${cost.toFixed(2)}`)
  if (changes.markup) parts.push(markup == null ? 'price list price' : `fixed price at cost x${markup}`)
  if (changes.active) parts.push(after.active ? 'turned on' : 'turned off')
  await logPricing(admin, 'cost', variantId, `${title}: ${parts.join(', ') || 'saved'}`, Object.keys(changes).length ? changes : null)
  revalidatePath(PATH)
  return { ok: true, message: 'Saved' }
}
