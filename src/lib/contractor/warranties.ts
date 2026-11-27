import { createAdminClient } from '@/lib/supabase/admin'
import type { ProUser } from '@/lib/pro/auth'
import { loadJobsForPro } from '@/lib/pro/context'
import { orderNumberVariants } from '@/lib/pro/status'
import { certificateUrl } from '@/lib/warranty/certificate'
import { projectPhotos } from './media'
import type { ProjectPhotos } from './media-shared'
import { loadPortalOrders, toShopifyOrder, type OrderContractor, type PortalOrder } from './orders'
import { listTeam } from './team-data'
import type { TeamMember } from './types'

/**
 * Warranties in the portal: the contractor's registrations and claims (those
 * filed for the contractor, filed by anyone active on their team, or for one of
 * their orders; claims also when they're on one of those registrations),
 * plus everything the Pro Hub showed the signed-in account (loadJobsForPro:
 * by their email, what they filed, and their orders), including warranty
 * transfers. Each record once.
 */

export interface PortalRegistration {
  id: string
  name: string
  email: string | null
  orderNumber: string | null
  status: string
  createdAt: string | null
  source: string | null
  project: { id: string; name: string } | null
  filedBy: string | null
  certificateUrl: string
}

export interface PortalTransfer {
  id: string
  newOwnerName: string
  newOwnerEmail: string
  orderNumber: string | null
  status: string
  createdAt: string | null
}

export interface PortalWarranties {
  registrations: PortalRegistration[]
  claims: PortalClaim[]
  transfers: PortalTransfer[]
}

export interface PortalClaim {
  id: string
  name: string
  orderNumber: string | null
  status: string
  createdAt: string | null
  summary: string | null
  project: { id: string; name: string } | null
  registrationId: string | null
  filedBy: string | null
}

interface RegRow {
  id: string
  name: string
  email: string | null
  order_number: string | null
  status: string | null
  created_at: string | null
  source: string | null
  project_id: string | null
  filed_by_pro_user_id: string | null
}

interface ClaimRow {
  id: string
  name: string
  order_number: string | null
  status: string | null
  created_at: string | null
  failure_description: string | null
  project_id: string | null
  warranty_registration_id: string | null
  filed_by_pro_user_id: string | null
}

const REG_COLS = 'id, name, email, order_number, status, created_at, source, project_id, filed_by_pro_user_id'
const CLAIM_COLS = 'id, name, order_number, status, created_at, failure_description, project_id, warranty_registration_id, filed_by_pro_user_id'
const LIMIT = 300

function chunks<T>(list: T[], size = 120): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
  return out
}

/** Every way an order number might have been typed: "#1234", "1234". */
export function orderNumberSet(orderNames: string[]): string[] {
  return [...new Set(orderNames.flatMap((n) => orderNumberVariants(n)))]
}

async function rowsWhere<T>(table: string, cols: string, column: string, values: string[]): Promise<T[]> {
  if (!values.length) return []
  const db = createAdminClient()
  const results = await Promise.all(
    chunks(values).map((part) =>
      db
        .from(table)
        .select(cols)
        .in(column, part)
        .order('created_at', { ascending: false })
        .limit(LIMIT),
    ),
  )
  const out: T[] = []
  for (const r of results) {
    if (r.error) throw new Error(`${table}: ${r.error.message}`)
    out.push(...((r.data ?? []) as T[]))
  }
  return out
}

function merge<T extends { id: string; created_at: string | null }>(...lists: T[][]): T[] {
  const byId = new Map<string, T>()
  for (const list of lists) for (const row of list) byId.set(row.id, row)
  return [...byId.values()].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? '')).slice(0, LIMIT)
}

export async function listContractorWarranties(
  contractorId: string,
  team: TeamMember[],
  orderNames: string[],
): Promise<{ registrations: PortalRegistration[]; claims: PortalClaim[] }> {
  const db = createAdminClient()
  // What active members filed is the company's; invited and disabled members don't bring theirs in.
  const teamIds = team.filter((m) => m.status === 'active').map((m) => m.pro_user_id)
  const numbers = orderNumberSet(orderNames)

  const [regsByContractor, regsByTeam, regsByOrder] = await Promise.all([
    db.from('warranty_registrations').select(REG_COLS).eq('contractor_id', contractorId).order('created_at', { ascending: false }).limit(LIMIT),
    rowsWhere<RegRow>('warranty_registrations', REG_COLS, 'filed_by_pro_user_id', teamIds),
    rowsWhere<RegRow>('warranty_registrations', REG_COLS, 'order_number', numbers),
  ])
  if (regsByContractor.error) throw new Error(`warranty_registrations: ${regsByContractor.error.message}`)
  const regs = merge((regsByContractor.data ?? []) as RegRow[], regsByTeam, regsByOrder)

  const [claimsByContractor, claimsByTeam, claimsByOrder, claimsByReg] = await Promise.all([
    db.from('warranty_claims').select(CLAIM_COLS).eq('contractor_id', contractorId).order('created_at', { ascending: false }).limit(LIMIT),
    rowsWhere<ClaimRow>('warranty_claims', CLAIM_COLS, 'filed_by_pro_user_id', teamIds),
    rowsWhere<ClaimRow>('warranty_claims', CLAIM_COLS, 'order_number', numbers),
    rowsWhere<ClaimRow>(
      'warranty_claims',
      CLAIM_COLS,
      'warranty_registration_id',
      regs.map((r) => r.id),
    ),
  ])
  if (claimsByContractor.error) throw new Error(`warranty_claims: ${claimsByContractor.error.message}`)
  const claims = merge((claimsByContractor.data ?? []) as ClaimRow[], claimsByTeam, claimsByOrder, claimsByReg)

  const projectIds = [...new Set([...regs, ...claims].map((r) => r.project_id).filter((id): id is string => Boolean(id)))]
  const projects = new Map<string, string>()
  if (projectIds.length) {
    const { data, error } = await db.from('contractor_projects').select('id, name').eq('contractor_id', contractorId).in('id', projectIds)
    if (error) throw new Error(`contractor_projects: ${error.message}`)
    for (const p of (data ?? []) as { id: string; name: string }[]) projects.set(p.id, p.name)
  }
  const project = (id: string | null) => (id && projects.has(id) ? { id, name: projects.get(id)! } : null)
  const names = new Map(team.map((m) => [m.pro_user_id, m.name?.trim() || m.email]))
  const filedBy = (id: string | null) => (id ? names.get(id) ?? null : null)

  return {
    registrations: regs.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      orderNumber: r.order_number,
      status: r.status ?? 'submitted',
      createdAt: r.created_at,
      source: r.source,
      project: project(r.project_id),
      filedBy: filedBy(r.filed_by_pro_user_id),
      certificateUrl: certificateUrl(r.id),
    })),
    claims: claims.map((c) => ({
      id: c.id,
      name: c.name,
      orderNumber: c.order_number,
      status: c.status ?? 'submitted',
      createdAt: c.created_at,
      summary: c.failure_description,
      project: project(c.project_id),
      registrationId: c.warranty_registration_id,
      filedBy: filedBy(c.filed_by_pro_user_id),
    })),
  }
}

/** The project's warranty registration, if it has one. */
export async function projectRegistration(projectId: string): Promise<{ id: string; created_at: string | null } | null> {
  const { data, error } = await createAdminClient()
    .from('warranty_registrations')
    .select('id, created_at')
    .eq('project_id', projectId)
    .limit(1)
    .maybeSingle<{ id: string; created_at: string | null }>()
  if (error) throw new Error(`warranty_registrations: ${error.message}`)
  return data
}

/** One of the contractor's projects, or null. */
export async function contractorProject(contractorId: string, projectId: unknown): Promise<{ id: string; name: string; customer_id: string | null } | null> {
  if (typeof projectId !== 'string' || !/^[0-9a-f-]{36}$/i.test(projectId)) return null
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('id, name, customer_id')
    .eq('id', projectId)
    .eq('contractor_id', contractorId)
    .maybeSingle<{ id: string; name: string; customer_id: string | null }>()
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  return data
}

/** Uploaded photo links from a form (https only, at most `max`). */
export function photoUrls(value: unknown, max = 30): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((v): v is string => typeof v === 'string' && /^https:\/\/\S+$/.test(v.trim()) && v.length <= 1000)
    .map((v) => v.trim())
    .slice(0, max)
}

/** Which of these projects already have a warranty registration. */
export async function registeredProjectIds(projectIds: string[]): Promise<Set<string>> {
  const rows = await rowsWhere<{ id: string; project_id: string | null; created_at: string | null }>(
    'warranty_registrations',
    'id, project_id, created_at',
    'project_id',
    projectIds,
  )
  return new Set(rows.map((r) => r.project_id).filter((id): id is string => Boolean(id)))
}

/** What the warranty forms can fill in from a project: its customer, roof, order and photos. */
export interface WarrantyPrefill {
  projectId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  projectType: '' | 'RV Roof' | 'Other'
  squareFootage: string
  orderNumber: string
  /** The project's ready before/after photos (for the registration) and claim photos (for a claim), so they aren't uploaded twice. */
  photos?: ProjectPhotos
}

export async function warrantyPrefill(contractorId: string, projectId: unknown): Promise<WarrantyPrefill | null> {
  if (typeof projectId !== 'string' || !/^[0-9a-f-]{36}$/i.test(projectId)) return null
  const db = createAdminClient()
  const { data: project, error } = await db
    .from('contractor_projects')
    .select('id, customer_id, roof_type, sqft')
    .eq('id', projectId)
    .eq('contractor_id', contractorId)
    .maybeSingle<{ id: string; customer_id: string | null; roof_type: string | null; sqft: number | null }>()
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  if (!project) return null

  const [customer, links, photos] = await Promise.all([
    project.customer_id
      ? db
          .from('contractor_customers')
          .select('name, contact_name, email, phone')
          .eq('id', project.customer_id)
          .eq('contractor_id', contractorId)
          .maybeSingle<{ name: string; contact_name: string | null; email: string | null; phone: string | null }>()
      : Promise.resolve({ data: null }),
    db.from('contractor_project_orders').select('shopify_order_id').eq('project_id', project.id).order('linked_at').limit(5),
    projectPhotos(contractorId, project.id),
  ])
  let orderNumber = ''
  const orderIds = ((links.data ?? []) as { shopify_order_id: string }[]).map((l) => l.shopify_order_id)
  if (orderIds.length) {
    const { data: orders } = await db.from('shopify_orders').select('name').in('shopify_id', orderIds).is('deleted_at', null).limit(1)
    orderNumber = ((orders ?? []) as { name: string }[])[0]?.name ?? ''
  }

  const person = (customer.data?.contact_name || customer.data?.name || '').trim()
  const [firstName, ...rest] = person.split(/\s+/)
  const roof = (project.roof_type ?? '').toLowerCase()
  return {
    projectId: project.id,
    firstName: firstName ?? '',
    lastName: rest.join(' '),
    email: customer.data?.email ?? '',
    phone: customer.data?.phone ?? '',
    projectType: roof ? (roof.includes('rv') ? 'RV Roof' : 'Other') : '',
    squareFootage: project.sqft ? String(project.sqft) : '',
    orderNumber,
    photos,
  }
}

/**
 * The warranties the portal shows for the signed-in account (null in a base
 * view with no account) and, when there is one, their contractor. Pass the
 * orders already loaded (loadPortalOrders) to save loading them again.
 */
export async function loadPortalWarranties(
  user: ProUser | null,
  contractor?: OrderContractor | null,
  opts: { orders?: PortalOrder[]; team?: TeamMember[] } = {},
): Promise<PortalWarranties> {
  const orders = opts.orders ?? (await loadPortalOrders(user, contractor)).orders
  const team = contractor ? (opts.team ?? (await listTeam(contractor.id))) : []
  const [company, jobs] = await Promise.all([
    contractor
      ? listContractorWarranties(
          contractor.id,
          team,
          orders.map((o) => o.name),
        )
      : Promise.resolve({ registrations: [], claims: [] }),
    user
      ? loadJobsForPro({ user, statuses: [], customer: null, orders: orders.map(toShopifyOrder), shopifyError: null })
      : Promise.resolve({ registrations: [], claims: [], transfers: [] }),
  ])

  const registrations = new Map(company.registrations.map((r) => [r.id, r]))
  for (const r of jobs.registrations) {
    if (registrations.has(r.id)) continue
    registrations.set(r.id, {
      id: r.id,
      name: r.name,
      email: r.email,
      orderNumber: r.order_number,
      status: r.status ?? 'submitted',
      createdAt: r.created_at,
      source: null,
      project: null,
      filedBy: null,
      certificateUrl: certificateUrl(r.id),
    })
  }
  const claims = new Map(company.claims.map((c) => [c.id, c]))
  for (const c of jobs.claims) {
    if (claims.has(c.id)) continue
    claims.set(c.id, {
      id: c.id,
      name: c.name,
      orderNumber: c.order_number,
      status: c.status ?? 'submitted',
      createdAt: c.created_at,
      summary: c.failure_description,
      project: null,
      registrationId: null,
      filedBy: null,
    })
  }
  const newestFirst = <T extends { createdAt: string | null }>(rows: T[]) => rows.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  return {
    registrations: newestFirst([...registrations.values()]),
    claims: newestFirst([...claims.values()]),
    transfers: newestFirst(
      jobs.transfers.map((t) => ({
        id: t.id,
        newOwnerName: t.new_owner_name,
        newOwnerEmail: t.new_owner_email,
        orderNumber: t.order_number,
        status: t.status ?? 'submitted',
        createdAt: t.created_at,
      })),
    ),
  }
}

/** Has this order a warranty registration among these? And its certificate. */
export function registrationForOrder(orderName: string, registrations: PortalRegistration[]): PortalRegistration | null {
  const variants = new Set(orderNumberVariants(orderName).map((v) => v.toLowerCase()))
  return registrations.find((r) => r.orderNumber && variants.has(r.orderNumber.trim().toLowerCase())) ?? null
}
