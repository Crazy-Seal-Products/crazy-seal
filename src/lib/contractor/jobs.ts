import { createAdminClient } from '@/lib/supabase/admin'
import { dayKey } from '@/lib/portal/admin/format'
import { listProjects, teamNames, type ProjectListItem } from './projects'
import { can } from './roles'
import { listTeam } from './team-data'
import type { InstallStep, ProjectSite, ProjectStage } from './types'
import type { ContractorViewer } from './viewer'
import { registeredProjectIds } from './warranties'

/**
 * The Jobs page (/portal/jobs/): the roofs past the sale, from Won through
 * the install to the warranty, as Thermo's dealer-portal Jobs view. Reads
 * contractor_projects through listProjects, so a sales rep still only sees
 * their own. Server only.
 */

/** The stages the Jobs page shows, in the order its cards sort. */
export const JOB_STAGES: readonly ProjectStage[] = ['in_progress', 'ordered', 'won', 'complete']

/** Completed jobs stay on the page this many days after their completion date. */
export const RECENT_COMPLETE_DAYS = 60

export interface JobItem extends ProjectListItem {
  ops_lead_name: string | null
  /** Shopify orders linked to the job; null when the viewer's role can't see orders. */
  orders: number | null
  /** A warranty registration names this job (the last step of the install). */
  warranty_registered: boolean
}

/** What a Jobs card gets (safe to send to the browser). */
export interface JobSummary {
  id: string
  name: string
  stage: ProjectStage
  install_step: InstallStep | null
  customer_name: string | null
  site: ProjectSite | null
  sqft: number | null
  roof_type: string | null
  color: string | null
  crew: string | null
  start_date: string | null
  completed_on: string | null
  assignee_name: string | null
  ops_lead_name: string | null
  orders: number | null
  warranty_registered: boolean
  /** Assigned to the viewer, created by them, or theirs to lead on the roof ("Mine"). */
  mine: boolean
}

export function jobSummary(job: JobItem, viewer: Pick<ContractorViewer, 'proUserId' | 'hasAccount'>): JobSummary {
  const me = viewer.hasAccount ? viewer.proUserId : null
  return {
    id: job.id,
    name: job.name,
    stage: job.stage,
    install_step: job.install_step,
    customer_name: job.customer_name,
    site: job.site,
    sqft: job.sqft,
    roof_type: job.roof_type,
    color: job.color,
    crew: job.crew?.trim() || null,
    start_date: job.start_date,
    completed_on: job.completed_on,
    assignee_name: job.assignee_name,
    ops_lead_name: job.ops_lead_name,
    orders: job.orders,
    warranty_registered: job.warranty_registered,
    mine: Boolean(me && [job.assigned_to, job.created_by, job.ops_lead_id].includes(me)),
  }
}

const CHUNK = 150

function chunks<T>(list: T[]): T[][] {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += CHUNK) out.push(list.slice(i, i + CHUNK))
  return out
}

/** How many live (not deleted) Shopify orders are linked to each project. */
async function linkedOrderCounts(projectIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (!projectIds.length) return counts
  const db = createAdminClient()
  const linkParts = await Promise.all(
    chunks(projectIds).map((part) => db.from('contractor_project_orders').select('project_id, shopify_order_id').in('project_id', part).limit(5000)),
  )
  const links: { project_id: string; shopify_order_id: string }[] = []
  for (const r of linkParts) {
    if (r.error) throw new Error(`contractor_project_orders: ${r.error.message}`)
    links.push(...((r.data ?? []) as { project_id: string; shopify_order_id: string }[]))
  }
  if (!links.length) return counts

  // An order deleted in Shopify no longer counts (the project page leaves it out too).
  const orderIds = [...new Set(links.map((l) => l.shopify_order_id))]
  const deletedParts = await Promise.all(
    chunks(orderIds).map((part) => db.from('shopify_orders').select('shopify_id').in('shopify_id', part).not('deleted_at', 'is', null).limit(5000)),
  )
  const deleted = new Set<string>()
  for (const r of deletedParts) {
    if (r.error) throw new Error(`shopify_orders: ${r.error.message}`)
    for (const o of (r.data ?? []) as { shopify_id: string }[]) deleted.add(o.shopify_id)
  }
  for (const l of links) {
    if (deleted.has(l.shopify_order_id)) continue
    counts.set(l.project_id, (counts.get(l.project_id) ?? 0) + 1)
  }
  return counts
}

const STAGE_RANK = new Map(JOB_STAGES.map((s, i) => [s, i]))

/** Installing first (earliest start first), then waiting on materials, then won, then the latest completed. */
function byJobOrder(a: JobItem, b: JobItem): number {
  const rank = (STAGE_RANK.get(a.stage) ?? 9) - (STAGE_RANK.get(b.stage) ?? 9)
  if (rank) return rank
  if (a.stage === 'complete') return (b.completed_on ?? '').localeCompare(a.completed_on ?? '')
  const start = (a.start_date ?? '9999').localeCompare(b.start_date ?? '9999')
  return start || b.updated_at.localeCompare(a.updated_at)
}

/**
 * The jobs this viewer can see: won, materials ordered, installing, and
 * complete in the last RECENT_COMPLETE_DAYS days, with the operations lead's
 * name, linked orders (roles that see orders) and whether the warranty is
 * registered.
 */
export async function listJobs(viewer: ContractorViewer): Promise<JobItem[]> {
  const team = await listTeam(viewer.contractor.id)
  const rows = await listProjects(viewer, { stages: JOB_STAGES, team })
  const cutoff = dayKey(new Date(Date.now() - RECENT_COMPLETE_DAYS * 86_400_000))
  const recent = rows.filter((p) => p.stage !== 'complete' || (p.completed_on ?? dayKey(p.updated_at)) >= cutoff)
  const ids = recent.map((p) => p.id)

  const [registered, orderCounts] = await Promise.all([
    registeredProjectIds(ids),
    can(viewer.role, 'orders.view') ? linkedOrderCounts(ids) : Promise.resolve(null),
  ])
  const names = teamNames(team)

  return recent
    .map((p) => ({
      ...p,
      ops_lead_name: p.ops_lead_id ? (names.get(p.ops_lead_id) ?? 'Former team member') : null,
      orders: orderCounts ? (orderCounts.get(p.id) ?? 0) : null,
      warranty_registered: registered.has(p.id),
    }))
    .sort(byJobOrder)
}
