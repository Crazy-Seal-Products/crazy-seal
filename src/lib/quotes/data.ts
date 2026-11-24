import { createAdminClient } from '@/lib/supabase/admin'
import { isQuoteToken } from './token'
import { APPLICATIONS, INSTALL_METHODS, ROOF_COLORS, type MissingKey, type QuoteLine, type RoofInputs } from '@/lib/pricing/types'
import type { QuoteRow } from './types'

/** Reads quotes (033_quotes.sql). Server only; callers scope by contractor or admin role. */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const num = (v: unknown) => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}
const numOrNull = (v: unknown) => (v == null || v === '' ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const str = (...vals: unknown[]) => {
  const v = vals.find((x) => typeof x === 'string' && x.trim())
  return typeof v === 'string' ? v : ''
}

/**
 * quotes.inputs as RoofInputs. Quotes saved before this code (Nov 2026) may
 * use other key names, so read those too and fall back to safe defaults: a
 * page must never fail on an old row.
 */
export function normalizeInputs(raw: unknown): RoofInputs {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const app = str(r.application, r.applicationType, r.type).toLowerCase()
  const method = str(r.installMethod, r.install_method, r.method).toLowerCase()
  const color = str(r.color, r.colour).toLowerCase()
  const len = numOrNull(r.rvLengthFt ?? r.rv_length ?? r.length)
  return {
    application: APPLICATIONS.find((a) => a.key === app)?.key ?? (len ? 'rv' : 'commercial'),
    installMethod: INSTALL_METHODS.find((m) => m.key === method)?.key ?? 'over-existing',
    sqft: numOrNull(r.sqft ?? r.square_feet ?? r.squareFeet),
    rvLengthFt: len,
    seamsFt: num(r.seamsFt ?? r.seams ?? r.seams_ft),
    color: ROOF_COLORS.find((c) => c.toLowerCase() === color) ?? 'White',
    roofType: str(r.roofType, r.roof_type) || null,
  }
}

function normalizeLine(raw: unknown): QuoteLine {
  const l = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  return {
    variant_id: str(l.variant_id, l.variantId),
    product_handle: str(l.product_handle, l.handle, l.productHandle),
    product_title: str(l.product_title, l.productTitle, l.title) || 'Material',
    variant_title: str(l.variant_title, l.variantTitle),
    image: str(l.image) || null,
    quantity: num(l.quantity ?? l.qty),
    unit_full: num(l.unit_full ?? l.unitFull ?? l.full_price),
    unit_price: num(l.unit_price ?? l.unitPrice ?? l.price),
    line_total: num(l.line_total ?? l.lineTotal ?? l.total),
    unit_cost: numOrNull(l.unit_cost ?? l.unitCost ?? l.cost),
    detail: str(l.detail),
  }
}

function normalizeMissing(raw: unknown): MissingKey[] {
  if (!Array.isArray(raw)) return []
  const out = new Set<MissingKey>()
  for (const m of raw) {
    const k = String(m).toLowerCase()
    if (k === 'phone') out.add('phone')
    else if (/ship|address/.test(k)) out.add('ship_to')
  }
  return [...out]
}

export function toQuote(r: Record<string, unknown>): QuoteRow {
  const q = r as unknown as QuoteRow
  return {
    ...q,
    inputs: normalizeInputs(r.inputs),
    subtotal_full: num(r.subtotal_full),
    discount_pct: num(r.discount_pct),
    discount_total: num(r.discount_total),
    shipping_total: numOrNull(r.shipping_total),
    total: num(r.total),
    cost_total: numOrNull(r.cost_total),
    revision: num(r.revision) || 1,
    draft_revision: numOrNull(r.draft_revision),
    lines: Array.isArray(r.lines) ? r.lines.map(normalizeLine) : [],
    missing: normalizeMissing(r.missing),
    ship_to: r.ship_to && typeof r.ship_to === 'object' ? (r.ship_to as QuoteRow['ship_to']) : null,
  }
}

export async function getQuote(id: string): Promise<QuoteRow | null> {
  if (!UUID_RE.test(id)) return null
  const { data, error } = await createAdminClient().from('quotes').select('*').eq('id', id).maybeSingle()
  if (error) throw new Error(`quotes: ${error.message}`)
  return data ? toQuote(data as Record<string, unknown>) : null
}

export async function getQuoteByToken(token: string): Promise<QuoteRow | null> {
  if (!isQuoteToken(token)) return null
  const { data, error } = await createAdminClient().from('quotes').select('*').eq('token', token).maybeSingle()
  if (error) throw new Error(`quotes: ${error.message}`)
  return data ? toQuote(data as Record<string, unknown>) : null
}

/** A contractor's quotes, newest first; `createdBy` limits them to one team member's. */
export async function listContractorQuotes(contractorId: string, opts: { createdBy?: string | null; projectId?: string; limit?: number } = {}): Promise<QuoteRow[]> {
  let q = createAdminClient()
    .from('quotes')
    .select('*')
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false })
    .limit(Math.min(opts.limit ?? 200, 500))
  if (opts.createdBy) q = q.eq('created_by_pro_user', opts.createdBy)
  if (opts.projectId) q = q.eq('project_id', opts.projectId)
  const { data, error } = await q
  if (error) throw new Error(`quotes: ${error.message}`)
  return (data ?? []).map((r) => toQuote(r as Record<string, unknown>))
}

// ─── Admin list ──────────────────────────────────────────────────────────

export const ADMIN_STATUS_FILTERS = [
  { key: 'active', label: 'Open' },
  { key: 'needs_staff', label: 'Needs staff' },
  { key: 'ordered', label: 'Ordered' },
  { key: 'lost', label: 'Lost' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'all', label: 'All' },
] as const
export type AdminStatusFilter = (typeof ADMIN_STATUS_FILTERS)[number]['key']

export const ADMIN_AUDIENCE_FILTERS = [
  { key: 'all', label: 'Everyone' },
  { key: 'public', label: 'Public builder' },
  { key: 'contractor', label: 'Contractors' },
] as const
export type AdminAudienceFilter = (typeof ADMIN_AUDIENCE_FILTERS)[number]['key']

export const ADMIN_PAGE_SIZE = 50

export interface AdminQuoteQuery {
  status: AdminStatusFilter
  audience: AdminAudienceFilter
  q?: string
  page: number
  /** A Sales rep's own rep id: only quotes they own. Null: a rep with no linked roster row (sees none). Undefined: everyone's. */
  repId?: string | null
}

type Filter = { op: 'eq'; col: string; val: string } | { op: 'in'; col: string; vals: string[] } | { op: 'not_null'; col: string } | { op: 'or'; filters: string }

/** The list's filters as plain steps, applied the same way to the rows query and each count. */
function filtersFor(opts: Omit<AdminQuoteQuery, 'page'>, status: AdminStatusFilter): Filter[] {
  const out: Filter[] = []
  // A rep with no roster row matches nothing (the zero uuid is never a rep id).
  if (opts.repId !== undefined) out.push({ op: 'eq', col: 'rep_id', val: opts.repId ?? '00000000-0000-0000-0000-000000000000' })
  if (opts.audience !== 'all') out.push({ op: 'eq', col: 'audience', val: opts.audience })
  if (status === 'active') out.push({ op: 'in', col: 'status', vals: ['open', 'checkout'] })
  else if (status === 'needs_staff') out.push({ op: 'eq', col: 'status', val: 'open' }, { op: 'not_null', col: 'handoff' })
  else if (status !== 'all') out.push({ op: 'eq', col: 'status', val: status })
  const term = opts.q?.replace(/[,()%*\\.:]/g, ' ').trim()
  if (term) out.push({ op: 'or', filters: ['number', 'name', 'email', 'company', 'phone'].map((c) => `${c}.ilike.%${term}%`).join(',') })
  return out
}

export async function listAdminQuotes(opts: AdminQuoteQuery) {
  const db = createAdminClient()
  const from = (Math.max(1, opts.page) - 1) * ADMIN_PAGE_SIZE
  let list = db.from('quotes').select('*', { count: 'exact' })
  for (const f of filtersFor(opts, opts.status)) {
    list = f.op === 'eq' ? list.eq(f.col, f.val) : f.op === 'in' ? list.in(f.col, f.vals) : f.op === 'not_null' ? list.not(f.col, 'is', null) : list.or(f.filters)
  }
  const { data, error, count } = await list.order('created_at', { ascending: false }).range(from, from + ADMIN_PAGE_SIZE - 1)
  if (error) throw new Error(`quotes: ${error.message}`)

  const counts = Object.fromEntries(
    await Promise.all(
      ADMIN_STATUS_FILTERS.map(async (f) => {
        let head = db.from('quotes').select('id', { count: 'exact', head: true })
        for (const x of filtersFor(opts, f.key)) {
          head = x.op === 'eq' ? head.eq(x.col, x.val) : x.op === 'in' ? head.in(x.col, x.vals) : x.op === 'not_null' ? head.not(x.col, 'is', null) : head.or(x.filters)
        }
        const { count: c } = await head
        return [f.key, c ?? 0] as const
      }),
    ),
  ) as Record<AdminStatusFilter, number>

  const total = count ?? 0
  return {
    rows: (data ?? []).map((r) => toQuote(r as Record<string, unknown>)),
    total,
    pages: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
    counts,
  }
}
