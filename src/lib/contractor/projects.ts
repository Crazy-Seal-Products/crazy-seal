import { createAdminClient } from '@/lib/supabase/admin'
import { listActivity } from './activity'
import { isUuid, repFilter, viewerSees } from './customers'
import { can, ROLE_INFO } from './roles'
import { listTeam, memberName } from './team-data'
import type { ActivityRow, CustomerRow, ProjectRow, ProjectStage, TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * A contractor's projects (contractor_projects): one record per roof, from the
 * first request through the order, the install and the warranty. Reads for
 * the portal's Projects pages. Server only.
 *
 * Sales reps see only projects assigned to them or that they created
 * (seesRecord in roles.ts), enforced in every query here.
 */

export interface ProjectListItem extends ProjectRow {
  customer_name: string | null
  assignee_name: string | null
}

type JoinedProject = ProjectRow & { customer: { name: string } | null }

function normalize(row: JoinedProject, names: Map<string, string>): ProjectListItem {
  const { customer, ...project } = row
  return {
    ...project,
    value: Number(project.value) || 0,
    customer_name: customer?.name ?? null,
    assignee_name: project.assigned_to ? (names.get(project.assigned_to) ?? null) : null,
  }
}

/** A team member for "assigned to" pickers (safe to send to the browser). */
export interface TeamOption {
  id: string
  name: string
  role: string
  /**
   * Access off, or off the team: only offered in a picker that already has
   * them, so saving the form keeps them rather than clearing it.
   */
  inactive?: boolean
}

/**
 * Team members for pickers, by name: everyone whose access is on, plus the
 * people in `keep` (who a record is assigned to now) even when their access
 * is off or they've left the team.
 */
export function teamOptions(team: TeamMember[], keep: Array<string | null | undefined> = []): TeamOption[] {
  const kept = new Set(keep.filter((id): id is string => Boolean(id)))
  const options: TeamOption[] = []
  for (const m of team) {
    const role = ROLE_INFO[m.role]?.label ?? m.role
    if (m.status !== 'disabled') options.push({ id: m.pro_user_id, name: memberName(m), role })
    else if (kept.has(m.pro_user_id)) options.push({ id: m.pro_user_id, name: memberName(m), role: `${role}, access off`, inactive: true })
  }
  for (const id of kept) {
    if (!team.some((m) => m.pro_user_id === id)) options.push({ id, name: 'Former team member', role: 'off the team', inactive: true })
  }
  return options.sort((a, b) => a.name.localeCompare(b.name))
}

export function teamNames(team: TeamMember[]): Map<string, string> {
  return new Map(team.map((m) => [m.pro_user_id, memberName(m)]))
}

/** The viewer's own filter: projects assigned to or created by them. */
function mineFilter(viewer: ContractorViewer): string {
  const id = isUuid(viewer.proUserId) ? viewer.proUserId : '00000000-0000-0000-0000-000000000000'
  return `assigned_to.eq.${id},created_by.eq.${id}`
}

/** The projects this viewer can see, most recently updated first. */
export async function listProjects(
  viewer: ContractorViewer,
  opts: { mine?: boolean; includeLost?: boolean; customerId?: string; stages?: readonly ProjectStage[]; team?: TeamMember[] } = {},
): Promise<ProjectListItem[]> {
  let q = createAdminClient()
    .from('contractor_projects')
    .select('*, customer:contractor_customers(name)')
    .eq('contractor_id', viewer.contractor.id)
    .order('updated_at', { ascending: false })
    .limit(2000)
  const scope = repFilter(viewer) ?? (opts.mine ? mineFilter(viewer) : null)
  if (scope) q = q.or(scope)
  if (!opts.includeLost) q = q.neq('stage', 'lost')
  if (opts.customerId) q = q.eq('customer_id', opts.customerId)
  if (opts.stages) q = q.in('stage', [...opts.stages])
  const [{ data, error }, team] = await Promise.all([q, opts.team ? Promise.resolve(opts.team) : listTeam(viewer.contractor.id)])
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  const names = teamNames(team)
  return ((data ?? []) as JoinedProject[]).map((r) => normalize(r, names))
}

/** One project row, if it's the viewer's contractor's and the viewer may see it. */
export async function getProjectRow(viewer: ContractorViewer, id: string): Promise<ProjectRow | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('*')
    .eq('id', id)
    .eq('contractor_id', viewer.contractor.id)
    .maybeSingle()
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  const row = data as ProjectRow | null
  if (!row || !viewerSees(viewer, row)) return null
  return { ...row, value: Number(row.value) || 0 }
}

export interface ProjectQuote {
  id: string
  number: string
  name: string
  status: string
  total: number
  created_at: string
}

export interface ProjectOrder {
  shopify_order_id: string
  name: string
  created_at: string | null
  total: number | null
  financial_status: string | null
  fulfillment_status: string | null
  cancelled: boolean
  linked_by: string | null
}

export interface ProjectWarranty {
  registrations: { id: string; status: string; created_at: string | null; name: string | null }[]
  claims: { id: string; status: string; created_at: string | null; summary: string | null }[]
}

export interface ProjectDetail {
  project: ProjectListItem
  customer: CustomerRow | null
  /** Whether the viewer can open the customer's page (sales reps: only their own customers). */
  customerVisible: boolean
  /** null when the viewer's role can't see that panel. */
  quotes: ProjectQuote[] | null
  orders: ProjectOrder[] | null
  warranty: ProjectWarranty | null
  activity: ActivityRow[]
  team: TeamMember[]
}

/** The project's quotes the viewer may see: a role without sales.view_all only sees the ones they made, as on the Quotes list. */
async function projectQuotes(viewer: ContractorViewer, projectId: string): Promise<ProjectQuote[]> {
  let q = createAdminClient()
    .from('quotes')
    .select('id, number, name, status, total, created_at')
    .eq('project_id', projectId)
    .eq('contractor_id', viewer.contractor.id)
    .order('created_at', { ascending: false })
    .limit(50)
  if (!can(viewer.role, 'sales.view_all')) q = q.eq('created_by_pro_user', isUuid(viewer.proUserId) ? viewer.proUserId : '00000000-0000-0000-0000-000000000000')
  const { data, error } = await q
  if (error) throw new Error(`quotes: ${error.message}`)
  return ((data ?? []) as ProjectQuote[]).map((q) => ({ ...q, total: Number(q.total) || 0 }))
}

async function projectOrders(projectId: string): Promise<ProjectOrder[]> {
  const db = createAdminClient()
  const { data: links, error } = await db
    .from('contractor_project_orders')
    .select('shopify_order_id, linked_by, linked_at')
    .eq('project_id', projectId)
    .order('linked_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`contractor_project_orders: ${error.message}`)
  const rows = (links ?? []) as { shopify_order_id: string; linked_by: string | null; linked_at: string }[]
  if (!rows.length) return []
  const { data: orders, error: oError } = await db
    .from('shopify_orders')
    .select('shopify_id, name, shopify_created_at, total_price, current_total_price, financial_status, fulfillment_status, cancelled_at, deleted_at')
    .in(
      'shopify_id',
      rows.map((r) => r.shopify_order_id),
    )
  if (oError) throw new Error(`shopify_orders: ${oError.message}`)
  const byId = new Map(
    (
      (orders ?? []) as {
        shopify_id: string
        name: string
        shopify_created_at: string | null
        total_price: number | null
        current_total_price: number | null
        financial_status: string | null
        fulfillment_status: string | null
        cancelled_at: string | null
        deleted_at: string | null
      }[]
    ).map((o) => [o.shopify_id, o]),
  )
  return rows
    .filter((r) => !byId.get(r.shopify_order_id)?.deleted_at)
    .map((r) => {
      const o = byId.get(r.shopify_order_id)
      const total = o?.current_total_price ?? o?.total_price
      return {
        shopify_order_id: r.shopify_order_id,
        name: o?.name ?? 'Order (syncing from Shopify)',
        created_at: o?.shopify_created_at ?? r.linked_at,
        total: total == null ? null : Number(total),
        financial_status: o?.financial_status ?? null,
        fulfillment_status: o?.fulfillment_status ?? null,
        cancelled: Boolean(o?.cancelled_at),
        linked_by: r.linked_by,
      }
    })
}

async function projectWarranty(projectId: string): Promise<ProjectWarranty> {
  const db = createAdminClient()
  const [regs, claims] = await Promise.all([
    db.from('warranty_registrations').select('id, status, created_at, name').eq('project_id', projectId).order('created_at', { ascending: false }).limit(10),
    db
      .from('warranty_claims')
      .select('id, status, created_at, failure_description')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(50),
  ])
  if (regs.error) throw new Error(`warranty_registrations: ${regs.error.message}`)
  if (claims.error) throw new Error(`warranty_claims: ${claims.error.message}`)
  return {
    registrations: ((regs.data ?? []) as { id: string; status: string | null; created_at: string | null; name: string | null }[]).map((r) => ({
      ...r,
      status: r.status ?? 'submitted',
    })),
    claims: ((claims.data ?? []) as { id: string; status: string | null; created_at: string | null; failure_description: string | null }[]).map((c) => ({
      id: c.id,
      status: c.status ?? 'submitted',
      created_at: c.created_at,
      summary: c.failure_description,
    })),
  }
}

/** The project's activity: its own lines, plus the website request it came from (logged under the lead's id). */
async function projectActivity(contractorId: string, project: ProjectRow): Promise<ActivityRow[]> {
  const [own, fromLead] = await Promise.all([
    listActivity(contractorId, { entity: 'projects', entityId: project.id, limit: 100 }),
    project.lead_id ? listActivity(contractorId, { entity: 'projects', entityId: project.lead_id, limit: 10 }) : Promise.resolve([]),
  ])
  return [...own, ...fromLead].sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
}

/** Everything the project page shows, or null when the viewer can't see this project. */
export async function getProjectDetail(viewer: ContractorViewer, id: string): Promise<ProjectDetail | null> {
  const row = await getProjectRow(viewer, id)
  if (!row) return null
  const db = createAdminClient()
  const [team, customerRes, quotes, orders, warranty, activity] = await Promise.all([
    listTeam(viewer.contractor.id),
    row.customer_id
      ? db.from('contractor_customers').select('*').eq('id', row.customer_id).eq('contractor_id', viewer.contractor.id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    can(viewer.role, 'quotes.view') ? projectQuotes(viewer, row.id) : Promise.resolve(null),
    can(viewer.role, 'orders.view') ? projectOrders(row.id) : Promise.resolve(null),
    can(viewer.role, 'warranties.view') ? projectWarranty(row.id) : Promise.resolve(null),
    projectActivity(viewer.contractor.id, row),
  ])
  if (customerRes.error) throw new Error(`contractor_customers: ${customerRes.error.message}`)
  const customer = (customerRes.data as CustomerRow | null) ?? null
  const names = teamNames(team)
  return {
    project: normalize({ ...row, customer: customer ? { name: customer.name } : null }, names),
    customer,
    customerVisible: Boolean(customer && viewerSees(viewer, customer)),
    quotes,
    orders,
    warranty,
    activity,
    team,
  }
}
