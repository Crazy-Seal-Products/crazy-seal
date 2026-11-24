import { createAdminClient } from '@/lib/supabase/admin'
import { dayStartIso, dayKey } from '@/lib/portal/admin/format'
import { actorRoleLabel, listActivity } from './activity'
import { repFilter } from './customers'
import { listProjects, type ProjectListItem } from './projects'
import { can } from './roles'
import { listTeam, memberName } from './team-data'
import type { ActivityRow, ProjectStage, TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * The portal dashboard's numbers and lists, each shown only to roles that can
 * open the page it summarizes, and each scoped to the contractor (and, for a
 * sales rep, to their own records). Also the activity feed's rows. Server only.
 */

/** An activity line with its actor's role in words, for the ActivityFeed component. */
export interface FeedItem extends ActivityRow {
  role_label: string
}

export function feedItems(rows: ActivityRow[]): FeedItem[] {
  return rows.map((r) => ({ ...r, role_label: actorRoleLabel(r.actor_role) }))
}

/** Team member ids to names, so the feed can show "Assigned to: Jordan" instead of an id. */
export function peopleNames(team: TeamMember[]): Record<string, string> {
  return Object.fromEntries(team.map((m) => [m.pro_user_id, memberName(m)]))
}

const OPEN_STAGES: readonly ProjectStage[] = ['lead', 'quoted', 'won', 'ordered', 'in_progress']
const PIPELINE_STAGES: readonly ProjectStage[] = ['lead', 'quoted', 'won']

export interface DashboardData {
  /** null when the viewer's role doesn't see that number. */
  pipeline: { value: number; count: number } | null
  openQuotes: number | null
  installing: number | null
  warrantiesAwaiting: number | null
  myWork: ProjectListItem[] | null
  newRequests: ProjectListItem[] | null
  activity: FeedItem[] | null
  people: Record<string, string>
  /** Open projects per stage (count and value), for the Projects section; null without projects.view. */
  stages: { stage: ProjectStage; count: number; value: number }[] | null
  /** Projects ordering materials or installing, with where the crew is. */
  underway: ProjectListItem[] | null
  customers: number | null
  team: number | null
  /** The latest quotes, newest first. */
  recentQuotes: { id: string; number: string; name: string; total: number; status: string; created_at: string }[] | null
}

async function customerCount(viewer: ContractorViewer): Promise<number> {
  let q = createAdminClient().from('contractor_customers').select('id', { count: 'exact', head: true }).eq('contractor_id', viewer.contractor.id)
  const scope = repFilter(viewer)
  if (scope) q = q.or(scope)
  const { count, error } = await q
  if (error) throw new Error(`contractor_customers: ${error.message}`)
  return count ?? 0
}

async function recentQuotes(viewer: ContractorViewer): Promise<NonNullable<DashboardData['recentQuotes']>> {
  let q = createAdminClient()
    .from('quotes')
    .select('id, number, name, total, status, created_at')
    .eq('contractor_id', viewer.contractor.id)
    .order('created_at', { ascending: false })
    .limit(5)
  if (!can(viewer.role, 'sales.view_all')) q = q.eq('created_by_pro_user', viewer.proUserId)
  const { data, error } = await q
  if (error) throw new Error(`quotes: ${error.message}`)
  return ((data ?? []) as { id: string; number: string; name: string; total: number | string; status: string; created_at: string }[]).map((r) => ({
    ...r,
    total: Number(r.total) || 0,
  }))
}

async function openQuoteCount(viewer: ContractorViewer): Promise<number> {
  const db = createAdminClient()
  const { data, error } = await db
    .from('quotes')
    .select('id, project_id, created_by_pro_user')
    .eq('contractor_id', viewer.contractor.id)
    .in('status', ['open', 'checkout'])
    .limit(5000)
  if (error) throw new Error(`quotes: ${error.message}`)
  const rows = (data ?? []) as { id: string; project_id: string | null; created_by_pro_user: string | null }[]
  const scope = repFilter(viewer)
  if (!scope) return rows.length
  // A sales rep counts their own quotes and quotes on projects they can see.
  const { data: projects, error: pError } = await db.from('contractor_projects').select('id').eq('contractor_id', viewer.contractor.id).or(scope).limit(5000)
  if (pError) throw new Error(`contractor_projects: ${pError.message}`)
  const visible = new Set(((projects ?? []) as { id: string }[]).map((p) => p.id))
  return rows.filter((q) => q.created_by_pro_user === viewer.proUserId || (q.project_id && visible.has(q.project_id))).length
}

async function warrantiesAwaiting(contractorId: string): Promise<number> {
  const { count, error } = await createAdminClient()
    .from('warranty_registrations')
    .select('id', { count: 'exact', head: true })
    .eq('contractor_id', contractorId)
    .eq('status', 'submitted')
  if (error) throw new Error(`warranty_registrations: ${error.message}`)
  return count ?? 0
}

export async function getDashboard(viewer: ContractorViewer): Promise<DashboardData> {
  const role = viewer.role
  const team = await listTeam(viewer.contractor.id)
  const [open, quotes, warranties, activity, customers, latestQuotes] = await Promise.all([
    can(role, 'projects.view') ? listProjects(viewer, { stages: OPEN_STAGES, team }) : Promise.resolve(null),
    can(role, 'quotes.view') ? openQuoteCount(viewer) : Promise.resolve(null),
    can(role, 'warranties.view') ? warrantiesAwaiting(viewer.contractor.id) : Promise.resolve(null),
    can(role, 'activity.view') ? listActivity(viewer.contractor.id, { limit: 8 }) : Promise.resolve(null),
    can(role, 'customers.view') ? customerCount(viewer) : Promise.resolve(null),
    can(role, 'quotes.view') ? recentQuotes(viewer) : Promise.resolve(null),
  ])

  let pipeline: DashboardData['pipeline'] = null
  let installing: number | null = null
  let myWork: ProjectListItem[] | null = null
  let newRequests: ProjectListItem[] | null = null
  if (open) {
    const inPipeline = open.filter((p) => PIPELINE_STAGES.includes(p.stage))
    pipeline = { value: inPipeline.reduce((sum, p) => sum + p.value, 0), count: inPipeline.length }
    installing = open.filter((p) => p.stage === 'in_progress').length
    myWork = viewer.hasAccount ? open.filter((p) => p.assigned_to === viewer.proUserId).slice(0, 8) : []
    // Website requests from the last 30 days (store time), newest first.
    const since = Date.parse(dayStartIso(dayKey(new Date(Date.now() - 30 * 86_400_000))))
    newRequests = open
      .filter((p) => p.source === 'Crazy Seal page' && p.stage === 'lead' && Date.parse(p.created_at) >= since)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 8)
  }

  return {
    stages: open ? OPEN_STAGES.map((stage) => {
      const rows = open.filter((p) => p.stage === stage)
      return { stage, count: rows.length, value: rows.reduce((sum, p) => sum + p.value, 0) }
    }) : null,
    underway: open ? open.filter((p) => p.stage === 'in_progress' || p.stage === 'ordered').slice(0, 6) : null,
    customers,
    team: can(role, 'team.view') ? team.filter((m) => m.status === 'active').length : null,
    recentQuotes: latestQuotes,
    pipeline,
    openQuotes: quotes,
    installing,
    warrantiesAwaiting: warranties,
    myWork,
    newRequests,
    activity: activity ? feedItems(activity) : null,
    people: peopleNames(team),
  }
}
