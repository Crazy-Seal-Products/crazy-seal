import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from './activity'
import { can, seesRecord } from './roles'
import { listTeam, memberName } from './team-data'
import { CUSTOMER_TYPES, type CustomerRow, type ProjectStage, type TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * A contractor's own customers (contractor_customers): reads for the portal's
 * Customers pages and pickers, plus the form-input checks the customer and
 * project server actions share. Server only.
 *
 * Sales reps see only the customers assigned to them or that they added
 * (seesRecord in roles.ts); that's applied in every query here, not just the
 * screen.
 */

// ─── Form input ───────────────────────────────────────────────────────────

/** A message for the person filling in the form (anything else is a bug). */
export class FormError extends Error {}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

function raw(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

/** Trimmed text, or null when empty. Throws FormError when too long or required and missing. */
export function formText(fd: FormData, key: string, label: string, max: number, required = false): string | null {
  const v = raw(fd, key)
  if (!v) {
    if (required) throw new FormError(`${label} is required.`)
    return null
  }
  if (v.length > max) throw new FormError(`${label} is too long (${max} characters at most).`)
  return v
}

/** A whole number from 0 to `max`, or null when empty. Commas are fine. */
export function formWhole(fd: FormData, key: string, label: string, max: number): number | null {
  const v = raw(fd, key).replace(/,/g, '')
  if (!v) return null
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) throw new FormError(`${label} must be a number, 0 or more.`)
  if (n > max) throw new FormError(`${label} looks too big.`)
  return Math.round(n)
}

/** Dollars from 0 up, to the cent; 0 when empty. "$12,500" is fine. */
export function formMoney(fd: FormData, key: string, label: string): number {
  const v = raw(fd, key).replace(/[$,\s]/g, '')
  if (!v) return 0
  const n = Number(v)
  if (!Number.isFinite(n) || n < 0) throw new FormError(`${label} must be an amount, 0 or more.`)
  if (n > 1_000_000_000) throw new FormError(`${label} looks too big.`)
  return Math.round(n * 100) / 100
}

/** A YYYY-MM-DD date, or null when empty. */
export function formDate(fd: FormData, key: string, label: string): string | null {
  const v = raw(fd, key)
  if (!v) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(`${v}T12:00:00Z`))) throw new FormError(`${label} isn’t a valid date.`)
  const year = Number(v.slice(0, 4))
  if (year < 2000 || year > 2100) throw new FormError(`${label} isn’t a valid date.`)
  return v
}

/** One of `options` (or `current`, the value already saved, kept as-is), or null when empty. */
export function formOneOf<T extends string>(fd: FormData, key: string, label: string, options: readonly T[], current?: string | null): T | null {
  const v = raw(fd, key)
  if (!v) return null
  if (current && v === current) return v as T
  if (!(options as readonly string[]).includes(v)) throw new FormError(`Pick a ${label.toLowerCase()} from the list.`)
  return v as T
}

export function formEmail(fd: FormData, key: string, label = 'Email'): string | null {
  const v = formText(fd, key, label, 200)
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new FormError(`${label} doesn’t look like an email address.`)
  return v ? v.toLowerCase() : null
}

/**
 * Who a record is assigned to. Sales reps always get their own records; others
 * may pick anyone active on the team, or nobody. `fallback` is used when the
 * form didn't send the field at all. `current` (who an edited record is
 * assigned to now) is kept even when their access is off or they've left the
 * team, so saving other fields doesn't clear it.
 */
export function resolveAssignee(
  viewer: ContractorViewer,
  fd: FormData,
  key: string,
  team: TeamMember[],
  fallback: string | null,
  current?: string | null,
): string | null {
  if (!can(viewer.role, 'sales.view_all')) return viewer.hasAccount ? viewer.proUserId : null
  if (!fd.has(key)) return fallback
  const v = raw(fd, key)
  if (!v) return null
  if (current && v === current) return v
  if (!team.some((m) => m.pro_user_id === v && m.status !== 'disabled')) throw new FormError('Pick someone on your team.')
  return v
}

/** Whether the viewer may see a customer or project (sales reps: only their own). */
export function viewerSees(viewer: ContractorViewer, row: { assigned_to: string | null; created_by: string | null }): boolean {
  return seesRecord({ proUserId: viewer.proUserId, role: viewer.role }, [row.assigned_to, row.created_by])
}

/** The owner filter for a sales rep (PostgREST `or`), or null when the viewer sees everything. */
export function repFilter(viewer: ContractorViewer): string | null {
  if (can(viewer.role, 'sales.view_all')) return null
  const id = isUuid(viewer.proUserId) ? viewer.proUserId : '00000000-0000-0000-0000-000000000000'
  return `assigned_to.eq.${id},created_by.eq.${id}`
}

// ─── Customer input ───────────────────────────────────────────────────────

export interface CustomerInput {
  name: string
  type: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
}

/**
 * The customer fields from a form; `prefix` namespaces them (the project
 * form's inline "new customer"). `before` is the customer being edited.
 */
export function parseCustomerInput(fd: FormData, prefix = '', before?: Pick<CustomerRow, 'type'> | null): CustomerInput {
  return {
    name: formText(fd, `${prefix}name`, 'Customer name', 160, true)!,
    type: formOneOf(fd, `${prefix}type`, 'Customer type', CUSTOMER_TYPES, before?.type),
    contact_name: formText(fd, `${prefix}contact_name`, 'Contact name', 120),
    email: formEmail(fd, `${prefix}email`),
    phone: formText(fd, `${prefix}phone`, 'Phone', 40),
    city: formText(fd, `${prefix}city`, 'City', 100),
    state: formText(fd, `${prefix}state`, 'State', 40),
    zip: formText(fd, `${prefix}zip`, 'ZIP', 20),
    notes: formText(fd, `${prefix}notes`, 'Notes', 4000),
  }
}

/** Adds a customer for the viewer's contractor and logs it. Callers check customers.edit first. */
export async function insertCustomer(viewer: ContractorViewer, input: CustomerInput, assignedTo: string | null): Promise<CustomerRow> {
  const now = new Date().toISOString()
  const { data, error } = await createAdminClient()
    .from('contractor_customers')
    .insert({
      ...input,
      contractor_id: viewer.contractor.id,
      assigned_to: assignedTo,
      created_by: viewer.hasAccount ? viewer.proUserId : null,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single()
  if (error || !data) throw new Error(`contractor_customers insert: ${error?.message ?? 'no row'}`)
  const row = data as CustomerRow
  await logActivity(viewer, { entity: 'customers', entityId: row.id, action: 'create', summary: `Added customer ${row.name}` })
  return row
}

// ─── Reads ────────────────────────────────────────────────────────────────

const OPEN_STAGES: readonly ProjectStage[] = ['lead', 'quoted', 'won', 'ordered', 'in_progress']

export interface CustomerListItem extends CustomerRow {
  owner_name: string | null
  open_projects: number
  projects: number
}

/** The customers this viewer can see, newest first, with their open project counts. */
export async function listCustomers(viewer: ContractorViewer): Promise<CustomerListItem[]> {
  const db = createAdminClient()
  const scope = repFilter(viewer)
  let q = db.from('contractor_customers').select('*').eq('contractor_id', viewer.contractor.id).order('created_at', { ascending: false }).limit(2000)
  if (scope) q = q.or(scope)
  let pq = db.from('contractor_projects').select('customer_id, stage').eq('contractor_id', viewer.contractor.id).not('customer_id', 'is', null).limit(5000)
  if (scope) pq = pq.or(scope)
  const [{ data, error }, { data: projects, error: pError }, team] = await Promise.all([q, pq, listTeam(viewer.contractor.id)])
  if (error) throw new Error(`contractor_customers: ${error.message}`)
  if (pError) throw new Error(`contractor_projects: ${pError.message}`)

  const counts = new Map<string, { open: number; all: number }>()
  for (const p of (projects ?? []) as { customer_id: string; stage: ProjectStage }[]) {
    const c = counts.get(p.customer_id) ?? { open: 0, all: 0 }
    c.all += 1
    if (OPEN_STAGES.includes(p.stage)) c.open += 1
    counts.set(p.customer_id, c)
  }
  const names = new Map(team.map((m) => [m.pro_user_id, memberName(m)]))
  return ((data ?? []) as CustomerRow[]).map((c) => ({
    ...c,
    owner_name: c.assigned_to ? (names.get(c.assigned_to) ?? null) : null,
    open_projects: counts.get(c.id)?.open ?? 0,
    projects: counts.get(c.id)?.all ?? 0,
  }))
}

/** One customer, if it's the viewer's contractor's and the viewer may see it. */
export async function getCustomer(viewer: ContractorViewer, id: string): Promise<CustomerRow | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient()
    .from('contractor_customers')
    .select('*')
    .eq('id', id)
    .eq('contractor_id', viewer.contractor.id)
    .maybeSingle()
  if (error) throw new Error(`contractor_customers: ${error.message}`)
  const row = data as CustomerRow | null
  if (!row || !viewerSees(viewer, row)) return null
  return row
}

export interface CustomerOption {
  id: string
  name: string
  detail: string
}

/** Customers for a picker: name plus contact and town. */
export async function customerOptions(viewer: ContractorViewer): Promise<CustomerOption[]> {
  let q = createAdminClient()
    .from('contractor_customers')
    .select('id, name, contact_name, city, state, assigned_to, created_by')
    .eq('contractor_id', viewer.contractor.id)
    .order('name')
    .limit(2000)
  const scope = repFilter(viewer)
  if (scope) q = q.or(scope)
  const { data, error } = await q
  if (error) throw new Error(`contractor_customers: ${error.message}`)
  return ((data ?? []) as Pick<CustomerRow, 'id' | 'name' | 'contact_name' | 'city' | 'state'>[]).map((c) => ({
    id: c.id,
    name: c.name,
    detail: [c.contact_name && c.contact_name !== c.name ? c.contact_name : null, [c.city, c.state].filter(Boolean).join(', ')]
      .filter(Boolean)
      .join(' · '),
  }))
}
