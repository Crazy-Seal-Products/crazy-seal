import { createAdminClient } from '@/lib/supabase/admin'
import { dayKey } from '@/lib/portal/admin/format'
import { listActivity } from './activity'
import { customerOptions, isUuid, viewerSees } from './customers'
import { feedItems, type FeedItem } from './dashboard'
import { teamOptions } from './projects'
import { can, seesRecord } from './roles'
import type {
  DeficiencyItem,
  DocumentItem,
  EstimateItem,
  FacilityItem,
  InspectionItem,
  LinkedQuote,
  PlanItem,
  RoofFormOptions,
  RoofItem,
  RoofPerms,
  RoofProjectOption,
  RoofWarrantyOption,
  RoofWorkspace,
} from './roof-shared'
import { isOpenDeficiency } from './roof-shared'
import { listTeam, memberName } from './team-data'
import type { TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * Roofs in the contractor portal (Thermo's roof-asset platform; tables in
 * supabase/migrations/037_roof_platform.sql): reads for the Roofs pages and
 * the checks the writes in roof-actions.ts share. Server only.
 *
 * Everything is scoped to the viewer's contractor. Roles without
 * sales.view_all (sales reps) see a building when it's assigned to them or
 * they added it, and a roof when they can see its building or the roof is
 * theirs; a roof's inspections, deficiencies, estimates and plan go with it.
 * Documents go with the roof or building they're filed under, or else the
 * project; one filed under nothing is its uploader's.
 *
 * Until 037 is applied the tables don't exist: reads then return
 * { ready: false } and the pages say Roofs is being set up.
 */

/* ------------------------------------------------------------ not set up */

/** The roof tables aren't in the database yet (037 not applied). */
export class RoofsNotReady extends Error {
  constructor() {
    super('Roofs is being set up.')
  }
}

/** Postgres "relation does not exist" (42P01), or PostgREST's "table not in the schema cache" (PGRST205). */
export function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  return /relation "?[\w.]*roof_[\w]*"? does not exist|could not find the table '[\w.]*roof_/i.test(error.message ?? '')
}

function check(error: { code?: string; message?: string } | null, table: string): void {
  if (!error) return
  if (isMissingTable(error)) throw new RoofsNotReady()
  throw new Error(`${table}: ${error.message}`)
}

export type Loaded<T> = { ready: true; data: T } | { ready: false }

/** Runs a read, turning "tables not there yet" into { ready: false }. */
export async function whenReady<T>(load: () => Promise<T>): Promise<Loaded<T>> {
  try {
    return { ready: true, data: await load() }
  } catch (err) {
    if (err instanceof RoofsNotReady) return { ready: false }
    throw err
  }
}

/* ------------------------------------------------------------------ rows */

export interface FacilityRow {
  id: string
  contractor_id: string
  customer_id: string | null
  name: string
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface RoofRow {
  id: string
  contractor_id: string
  facility_id: string
  tag: string
  name: string
  roof_type: string | null
  system: string | null
  area_sqft: number | null
  slope: string | null
  deck: string | null
  year_installed: number | null
  condition_score: number | null
  last_inspected_on: string | null
  next_inspection_on: string | null
  warranty_registration_id: string | null
  project_id: string | null
  notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InspectionRow {
  id: string
  contractor_id: string
  roof_asset_id: string
  kind: InspectionItem['kind']
  inspected_on: string
  inspector_id: string | null
  condition_score: number | null
  summary: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DeficiencyRow {
  id: string
  contractor_id: string
  roof_asset_id: string
  inspection_id: string | null
  title: string
  location: string | null
  severity: DeficiencyItem['severity']
  status: DeficiencyItem['status']
  est_cost: number | string | null
  notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface EstimateRow {
  id: string
  contractor_id: string
  roof_asset_id: string
  number: string
  scenario: EstimateItem['scenario']
  amount: number | string
  status: EstimateItem['status']
  deficiency_ids: string[] | null
  budget_year: number | null
  assumptions: string | null
  quote_id: string | null
  approved_at: string | null
  approval_note: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PlanRow {
  id: string
  contractor_id: string
  roof_asset_id: string
  year: number
  action: PlanItem['action']
  est_cost: number | string
  status: PlanItem['status']
  notes: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DocumentRow {
  id: string
  contractor_id: string
  facility_id: string | null
  roof_asset_id: string | null
  project_id: string | null
  title: string
  kind: DocumentItem['kind']
  s3_key: string
  url: string
  mime: string | null
  bytes: number | string | null
  uploaded_by: string | null
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

const LIMIT = 5000

/* ----------------------------------------------------------------- scope */

function seesAll(viewer: ContractorViewer): boolean {
  return can(viewer.role, 'sales.view_all')
}

function owns(viewer: ContractorViewer, row: { assigned_to: string | null; created_by: string | null }): boolean {
  return seesRecord(viewer, [row.assigned_to, row.created_by])
}

/** Whether the viewer may see (and, with roofs.edit, change) a roof on this building. */
export function roofVisible(viewer: ContractorViewer, roof: RoofRow, facility: FacilityRow | null): boolean {
  return seesAll(viewer) || owns(viewer, roof) || Boolean(facility && owns(viewer, facility))
}

/** Whether the viewer may see and change the building itself. */
export function facilityEditable(viewer: ContractorViewer, facility: FacilityRow): boolean {
  return seesAll(viewer) || owns(viewer, facility)
}

interface Scope {
  facilities: FacilityRow[]
  roofs: RoofRow[]
  /** Buildings the viewer may change (the rest are shown for one of their roofs). */
  editable: Set<string>
}

/** The buildings and roofs this viewer can see. */
async function loadScope(viewer: ContractorViewer): Promise<Scope> {
  const db = createAdminClient()
  const cid = viewer.contractor.id
  const [f, r] = await Promise.all([
    db.from('roof_facilities').select('*').eq('contractor_id', cid).order('name').limit(LIMIT),
    db.from('roof_assets').select('*').eq('contractor_id', cid).order('name').limit(LIMIT),
  ])
  check(f.error, 'roof_facilities')
  check(r.error, 'roof_assets')
  const facilities = (f.data ?? []) as FacilityRow[]
  const roofs = (r.data ?? []) as RoofRow[]
  if (seesAll(viewer)) return { facilities, roofs, editable: new Set(facilities.map((x) => x.id)) }

  const editable = new Set(facilities.filter((x) => owns(viewer, x)).map((x) => x.id))
  const visibleRoofs = roofs.filter((x) => editable.has(x.facility_id) || owns(viewer, x))
  const shown = new Set([...editable, ...visibleRoofs.map((x) => x.facility_id)])
  return { facilities: facilities.filter((x) => shown.has(x.id)), roofs: visibleRoofs, editable }
}

/* ---------------------------------------------------------------- helpers */

function toNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function today(): string {
  return dayKey(new Date())
}

async function customerNames(contractorId: string): Promise<Map<string, string>> {
  const { data, error } = await createAdminClient().from('contractor_customers').select('id, name').eq('contractor_id', contractorId).limit(LIMIT)
  if (error) throw new Error(`contractor_customers: ${error.message}`)
  return new Map(((data ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]))
}

interface ProjectLite {
  id: string
  name: string
  stage: string
  sqft: number | null
  assigned_to: string | null
  created_by: string | null
}

async function contractorProjects(contractorId: string): Promise<ProjectLite[]> {
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .select('id, name, stage, sqft, assigned_to, created_by')
    .eq('contractor_id', contractorId)
    .order('updated_at', { ascending: false })
    .limit(2000)
  if (error) throw new Error(`contractor_projects: ${error.message}`)
  return (data ?? []) as ProjectLite[]
}

function names(team: TeamMember[]): Map<string, string> {
  return new Map(team.map((m) => [m.pro_user_id, memberName(m)]))
}

function nameOf(map: Map<string, string>, id: string | null | undefined): string | null {
  if (!id) return null
  return map.get(id) ?? 'Former team member'
}

function toFacilityItem(f: FacilityRow, customers: Map<string, string>, people: Map<string, string>, editable: boolean): FacilityItem {
  return {
    id: f.id,
    customer_id: f.customer_id,
    customer_name: f.customer_id ? (customers.get(f.customer_id) ?? null) : null,
    name: f.name,
    street: f.street,
    city: f.city,
    state: f.state,
    zip: f.zip,
    notes: f.notes,
    assigned_to: f.assigned_to,
    owner_name: nameOf(people, f.assigned_to),
    created_at: f.created_at,
    editable,
  }
}

function toRoofItem(r: RoofRow, facility: FacilityItem | undefined, people: Map<string, string>, openCount: number): RoofItem {
  return {
    id: r.id,
    facility_id: r.facility_id,
    facility_name: facility?.name ?? 'Building',
    customer_id: facility?.customer_id ?? null,
    customer_name: facility?.customer_name ?? null,
    tag: r.tag,
    name: r.name,
    roof_type: r.roof_type,
    system: r.system,
    area_sqft: toNumber(r.area_sqft),
    slope: r.slope,
    deck: r.deck,
    year_installed: r.year_installed,
    condition_score: toNumber(r.condition_score),
    last_inspected_on: r.last_inspected_on,
    next_inspection_on: r.next_inspection_on,
    warranty_registration_id: r.warranty_registration_id,
    project_id: r.project_id,
    notes: r.notes,
    assigned_to: r.assigned_to,
    owner_name: nameOf(people, r.assigned_to),
    open_deficiencies: openCount,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

function toInspectionItem(i: InspectionRow, people: Map<string, string>): InspectionItem {
  return {
    id: i.id,
    roof_asset_id: i.roof_asset_id,
    kind: i.kind,
    inspected_on: i.inspected_on,
    inspector_id: i.inspector_id,
    inspector_name: nameOf(people, i.inspector_id),
    condition_score: toNumber(i.condition_score),
    summary: i.summary,
    created_at: i.created_at,
  }
}

export function toDeficiencyItem(d: DeficiencyRow): DeficiencyItem {
  return {
    id: d.id,
    roof_asset_id: d.roof_asset_id,
    inspection_id: d.inspection_id,
    title: d.title,
    location: d.location,
    severity: d.severity,
    status: d.status,
    est_cost: toNumber(d.est_cost),
    notes: d.notes,
    created_at: d.created_at,
    updated_at: d.updated_at,
  }
}

function toEstimateItem(e: EstimateRow, quotes: Map<string, LinkedQuote>, people: Map<string, string>): EstimateItem {
  return {
    id: e.id,
    roof_asset_id: e.roof_asset_id,
    number: e.number,
    scenario: e.scenario,
    amount: toNumber(e.amount) ?? 0,
    status: e.status,
    deficiency_ids: e.deficiency_ids ?? [],
    budget_year: e.budget_year,
    assumptions: e.assumptions,
    quote_id: e.quote_id,
    quote: e.quote_id ? (quotes.get(e.quote_id) ?? null) : null,
    approved_at: e.approved_at,
    approval_note: e.approval_note,
    assigned_to: e.assigned_to,
    owner_name: nameOf(people, e.assigned_to),
    created_at: e.created_at,
    updated_at: e.updated_at,
  }
}

function toPlanItem(p: PlanRow): PlanItem {
  return {
    id: p.id,
    roof_asset_id: p.roof_asset_id,
    year: p.year,
    action: p.action,
    est_cost: toNumber(p.est_cost) ?? 0,
    status: p.status,
    notes: p.notes,
    created_at: p.created_at,
  }
}

/** Child rows of the visible roofs: one roof's, or the contractor's filtered to the visible roofs. */
async function childRows<T extends { roof_asset_id: string }>(
  table: string,
  contractorId: string,
  roofIds: Set<string>,
  order: { column: string; ascending: boolean },
  roofId?: string,
): Promise<T[]> {
  let q = createAdminClient().from(table).select('*').eq('contractor_id', contractorId)
  if (roofId) q = q.eq('roof_asset_id', roofId)
  const { data, error } = await q.order(order.column, { ascending: order.ascending }).limit(LIMIT)
  check(error, table)
  return ((data ?? []) as T[]).filter((row) => roofIds.has(row.roof_asset_id))
}

/** The Crazy Seal quotes linked to estimates, with whether the viewer may open each. */
async function linkedQuotes(viewer: ContractorViewer, ids: string[]): Promise<Map<string, LinkedQuote>> {
  const unique = [...new Set(ids.filter(isUuid))]
  if (!unique.length) return new Map()
  const { data, error } = await createAdminClient()
    .from('quotes')
    .select('id, number, status, total, created_by_pro_user')
    .eq('contractor_id', viewer.contractor.id)
    .in('id', unique)
  if (error) throw new Error(`quotes: ${error.message}`)
  const mayOpen = can(viewer.role, 'quotes.view')
  return new Map(
    ((data ?? []) as { id: string; number: string; status: string; total: number | string; created_by_pro_user: string | null }[]).map((q) => [
      q.id,
      { id: q.id, number: q.number, status: q.status, total: Number(q.total) || 0, visible: mayOpen && seesRecord(viewer, [q.created_by_pro_user]) },
    ]),
  )
}

/* -------------------------------------------------------------- workspace */

export interface WorkspaceParts {
  inspections?: boolean
  deficiencies?: boolean
  estimates?: boolean
  plans?: boolean
  documents?: boolean
}

interface Built {
  workspace: RoofWorkspace
  scope: Scope
  team: TeamMember[]
  projects: ProjectLite[]
}

async function build(viewer: ContractorViewer, parts: WorkspaceParts, roofId?: string): Promise<Built> {
  const cid = viewer.contractor.id
  const scope = await loadScope(viewer)
  const roofIds = new Set(scope.roofs.map((r) => r.id))
  const order = (column: string, ascending = false) => ({ column, ascending })

  // Open deficiencies are counted on every page (the roof table and building rows show them).
  const [team, customers, projects, inspections, deficiencies, estimates, plans, documents] = await Promise.all([
    listTeam(cid),
    customerNames(cid),
    parts.documents ? contractorProjects(cid) : Promise.resolve([] as ProjectLite[]),
    parts.inspections ? childRows<InspectionRow>('roof_inspections', cid, roofIds, order('inspected_on'), roofId) : Promise.resolve([] as InspectionRow[]),
    childRows<DeficiencyRow>('roof_deficiencies', cid, roofIds, order('created_at'), roofId),
    parts.estimates ? childRows<EstimateRow>('roof_estimates', cid, roofIds, order('created_at'), roofId) : Promise.resolve([] as EstimateRow[]),
    parts.plans ? childRows<PlanRow>('roof_plans', cid, roofIds, order('year', true), roofId) : Promise.resolve([] as PlanRow[]),
    parts.documents ? documentRows(viewer, scope, roofId) : Promise.resolve([] as DocumentRow[]),
  ])

  const people = names(team)
  const facilityItems = scope.facilities.map((f) => toFacilityItem(f, customers, people, scope.editable.has(f.id)))
  const facilityById = new Map(facilityItems.map((f) => [f.id, f]))
  const deficiencyItems = deficiencies.map(toDeficiencyItem)
  const openByRoof = new Map<string, number>()
  for (const d of deficiencyItems) if (isOpenDeficiency(d)) openByRoof.set(d.roof_asset_id, (openByRoof.get(d.roof_asset_id) ?? 0) + 1)

  const quotes = await linkedQuotes(
    viewer,
    estimates.map((e) => e.quote_id ?? ''),
  )
  const projectNames = new Map(projects.map((p) => [p.id, p.name]))

  const workspace: RoofWorkspace = {
    today: today(),
    year: Number(today().slice(0, 4)),
    facilities: facilityItems,
    roofs: scope.roofs.map((r) => toRoofItem(r, facilityById.get(r.facility_id), people, openByRoof.get(r.id) ?? 0)),
    inspections: inspections.map((i) => toInspectionItem(i, people)),
    deficiencies: parts.deficiencies ? deficiencyItems : [],
    estimates: estimates.map((e) => toEstimateItem(e, quotes, people)),
    plans: plans.map(toPlanItem),
    documents: documents.map((d) => ({
      id: d.id,
      facility_id: d.facility_id,
      roof_asset_id: d.roof_asset_id,
      project_id: d.project_id,
      project_name: d.project_id ? (projectNames.get(d.project_id) ?? null) : null,
      title: d.title,
      kind: d.kind,
      url: d.url,
      mime: d.mime,
      bytes: toNumber(d.bytes),
      uploaded_by: d.uploaded_by,
      uploader_name: nameOf(people, d.uploaded_by),
      created_at: d.created_at,
    })),
  }
  return { workspace, scope, team, projects }
}

/**
 * The documents the viewer may see (see the note at the top), newest first.
 * With `roofId`: that roof's, plus its building's that aren't filed under
 * another roof.
 */
async function documentRows(viewer: ContractorViewer, scope: Scope, roofId?: string): Promise<DocumentRow[]> {
  let q = createAdminClient().from('roof_documents').select('*').eq('contractor_id', viewer.contractor.id)
  const facilityId = roofId ? scope.roofs.find((r) => r.id === roofId)?.facility_id : undefined
  if (roofId) q = facilityId && isUuid(facilityId) ? q.or(`roof_asset_id.eq.${roofId},facility_id.eq.${facilityId}`) : q.eq('roof_asset_id', roofId)
  const { data, error } = await q.order('created_at', { ascending: false }).limit(LIMIT)
  check(error, 'roof_documents')
  let rows = (data ?? []) as DocumentRow[]
  if (roofId) rows = rows.filter((d) => d.roof_asset_id === roofId || (!d.roof_asset_id && d.facility_id === facilityId))
  if (seesAll(viewer)) return rows
  const roofIds = new Set(scope.roofs.map((r) => r.id))
  const facilityIds = new Set(scope.facilities.map((f) => f.id))
  const projects = rows.some((d) => !d.roof_asset_id && !d.facility_id && d.project_id) ? await contractorProjects(viewer.contractor.id) : []
  const projectsSeen = new Set(projects.filter((p) => viewerSees(viewer, p)).map((p) => p.id))
  return rows.filter((d) => {
    if (d.roof_asset_id) return roofIds.has(d.roof_asset_id)
    if (d.facility_id) return facilityIds.has(d.facility_id)
    if (d.project_id) return projectsSeen.has(d.project_id)
    return seesRecord(viewer, [d.uploaded_by, d.created_by, d.assigned_to])
  })
}

/** The Roofs pages' data for this viewer: their buildings and roofs (with open deficiency counts) and the lists in `parts`. */
export async function loadRoofWorkspace(viewer: ContractorViewer, parts: WorkspaceParts = {}): Promise<Loaded<RoofWorkspace>> {
  return whenReady(async () => (await build(viewer, parts)).workspace)
}

/* ------------------------------------------------------------- pickers */

/** Pickers for the Roofs forms; empty when the viewer can't edit. */
export async function roofFormOptions(
  viewer: ContractorViewer,
  perms: RoofPerms,
  opts: { customers?: boolean; projects?: boolean; warranties?: boolean; keep?: Array<string | null | undefined> } = {},
): Promise<RoofFormOptions> {
  const me = viewer.hasAccount ? viewer.proUserId : null
  if (!perms.edit) return { customers: [], team: [], projects: [], warranties: [], me }
  const [team, customers, projects, warranties] = await Promise.all([
    listTeam(viewer.contractor.id),
    opts.customers ? customerOptions(viewer) : Promise.resolve([]),
    opts.projects ? projectOptions(viewer) : Promise.resolve([]),
    opts.warranties && perms.warranties ? warrantyOptions(viewer.contractor.id) : Promise.resolve([]),
  ])
  return { customers, team: teamOptions(team, opts.keep ?? []), projects, warranties, me }
}

/** Projects the viewer can see, for linking a roof or a document. */
export async function projectOptions(viewer: ContractorViewer): Promise<RoofProjectOption[]> {
  const rows = await contractorProjects(viewer.contractor.id)
  return rows.filter((p) => viewerSees(viewer, p)).map((p) => ({ id: p.id, name: p.name, stage: p.stage, sqft: p.sqft }))
}

/** The contractor's warranty registrations (filed for them or for one of their projects), newest first. */
export async function warrantyOptions(contractorId: string): Promise<RoofWarrantyOption[]> {
  const db = createAdminClient()
  const projectIds = (await contractorProjects(contractorId)).map((p) => p.id)
  const [own, viaProjects] = await Promise.all([
    db.from('warranty_registrations').select('id, name, status, created_at').eq('contractor_id', contractorId).order('created_at', { ascending: false }).limit(300),
    projectIds.length
      ? db.from('warranty_registrations').select('id, name, status, created_at').in('project_id', projectIds.slice(0, 300)).order('created_at', { ascending: false }).limit(300)
      : Promise.resolve({ data: [], error: null }),
  ])
  if (own.error) throw new Error(`warranty_registrations: ${own.error.message}`)
  if (viaProjects.error) throw new Error(`warranty_registrations: ${viaProjects.error.message}`)
  const seen = new Map<string, RoofWarrantyOption>()
  for (const w of [...(own.data ?? []), ...(viaProjects.data ?? [])] as { id: string; name: string | null; status: string | null; created_at: string | null }[]) {
    if (!seen.has(w.id)) seen.set(w.id, { id: w.id, name: w.name || 'Warranty registration', status: w.status ?? 'submitted', created_at: w.created_at })
  }
  return [...seen.values()].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
}

/** Whether a warranty registration is this contractor's (filed for them, or for one of their projects). */
export async function isContractorRegistration(contractorId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false
  const { data, error } = await createAdminClient().from('warranty_registrations').select('id, contractor_id, project_id').eq('id', id).maybeSingle()
  if (error) throw new Error(`warranty_registrations: ${error.message}`)
  const row = data as { id: string; contractor_id: string | null; project_id: string | null } | null
  if (!row) return false
  if (row.contractor_id === contractorId) return true
  if (!row.project_id) return false
  const { data: p } = await createAdminClient().from('contractor_projects').select('id').eq('id', row.project_id).eq('contractor_id', contractorId).maybeSingle()
  return Boolean(p)
}

/* ----------------------------------------------------------- roof record */

export interface RoofRecordData {
  workspace: RoofWorkspace
  roof: RoofItem
  facility: FacilityItem
  /** The building's other roofs the viewer can see. */
  siblings: RoofItem[]
  customer: { id: string; name: string; contact_name: string | null; email: string | null; phone: string | null; visible: boolean } | null
  project: { id: string; name: string; stage: string; sqft: number | null; visible: boolean } | null
  /** null when there's none, or the viewer's role doesn't see warranties. */
  warranty: { id: string; name: string; status: string; created_at: string | null } | null
  /** Quotes on the linked project the viewer may see, for linking to an estimate. */
  projectQuotes: LinkedQuote[]
  activity: FeedItem[]
  people: Record<string, string>
}

/** One roof and everything on it, or null when it isn't the viewer's to see. */
export async function getRoofRecord(viewer: ContractorViewer, id: string): Promise<Loaded<RoofRecordData | null>> {
  return whenReady(async () => {
    if (!isUuid(id)) return null
    const built = await build(viewer, { inspections: true, deficiencies: true, estimates: true, plans: true, documents: true }, id)
    const { workspace } = built
    const roof = workspace.roofs.find((r) => r.id === id)
    const facility = roof ? workspace.facilities.find((f) => f.id === roof.facility_id) : undefined
    if (!roof || !facility) return null
    const db = createAdminClient()
    const row = built.scope.roofs.find((r) => r.id === id)!

    const [customerRes, projectRow, warranty, projectQuotes, activity] = await Promise.all([
      facility.customer_id
        ? db.from('contractor_customers').select('id, name, contact_name, email, phone, assigned_to, created_by').eq('id', facility.customer_id).eq('contractor_id', viewer.contractor.id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      row.project_id ? Promise.resolve(built.projects.find((p) => p.id === row.project_id) ?? null) : Promise.resolve(null),
      row.warranty_registration_id && can(viewer.role, 'warranties.view')
        ? db.from('warranty_registrations').select('id, name, status, created_at').eq('id', row.warranty_registration_id).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      row.project_id ? projectQuoteOptions(viewer, row.project_id) : Promise.resolve([]),
      listActivity(viewer.contractor.id, { entity: 'roofs', entityId: id, limit: 60 }),
    ])
    if (customerRes.error) throw new Error(`contractor_customers: ${customerRes.error.message}`)
    if (warranty.error) throw new Error(`warranty_registrations: ${warranty.error.message}`)
    const c = customerRes.data as { id: string; name: string; contact_name: string | null; email: string | null; phone: string | null; assigned_to: string | null; created_by: string | null } | null
    const w = warranty.data as { id: string; name: string | null; status: string | null; created_at: string | null } | null

    return {
      workspace,
      roof,
      facility,
      siblings: workspace.roofs.filter((r) => r.facility_id === facility.id && r.id !== roof.id),
      customer: c
        ? { id: c.id, name: c.name, contact_name: c.contact_name, email: c.email, phone: c.phone, visible: can(viewer.role, 'customers.view') && viewerSees(viewer, c) }
        : null,
      project: projectRow
        ? { id: projectRow.id, name: projectRow.name, stage: projectRow.stage, sqft: projectRow.sqft, visible: can(viewer.role, 'projects.view') && viewerSees(viewer, projectRow) }
        : null,
      warranty: w ? { id: w.id, name: w.name || 'Warranty registration', status: w.status ?? 'submitted', created_at: w.created_at } : null,
      projectQuotes,
      activity: feedItems(activity),
      people: Object.fromEntries(built.team.map((m) => [m.pro_user_id, memberName(m)])),
    }
  })
}

/** A project's materials quotes the viewer may see (a sales rep: the ones they made), newest first. */
export async function projectQuoteOptions(viewer: ContractorViewer, projectId: string): Promise<LinkedQuote[]> {
  if (!can(viewer.role, 'quotes.view') || !isUuid(projectId)) return []
  const { data, error } = await createAdminClient()
    .from('quotes')
    .select('id, number, status, total, created_by_pro_user')
    .eq('contractor_id', viewer.contractor.id)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw new Error(`quotes: ${error.message}`)
  return ((data ?? []) as { id: string; number: string; status: string; total: number | string; created_by_pro_user: string | null }[])
    .filter((q) => seesRecord(viewer, [q.created_by_pro_user]))
    .map((q) => ({ id: q.id, number: q.number, status: q.status, total: Number(q.total) || 0, visible: true }))
}

/** Quotes the viewer may see on each of these projects, for linking to estimates (by project id). */
export async function quotesForProjects(viewer: ContractorViewer, projectIds: Array<string | null | undefined>): Promise<Record<string, LinkedQuote[]>> {
  const ids = [...new Set(projectIds.filter(isUuid))].slice(0, 300)
  if (!ids.length || !can(viewer.role, 'quotes.view')) return {}
  const { data, error } = await createAdminClient()
    .from('quotes')
    .select('id, number, status, total, created_by_pro_user, project_id')
    .eq('contractor_id', viewer.contractor.id)
    .in('project_id', ids)
    .order('created_at', { ascending: false })
    .limit(1000)
  if (error) throw new Error(`quotes: ${error.message}`)
  const out: Record<string, LinkedQuote[]> = {}
  for (const q of (data ?? []) as { id: string; number: string; status: string; total: number | string; created_by_pro_user: string | null; project_id: string }[]) {
    if (!seesRecord(viewer, [q.created_by_pro_user])) continue
    ;(out[q.project_id] ??= []).push({ id: q.id, number: q.number, status: q.status, total: Number(q.total) || 0, visible: true })
  }
  return out
}

/* ------------------------------------------------------- writes' checks */

/** A building the viewer may change, or null. */
export async function facilityForWrite(viewer: ContractorViewer, id: unknown): Promise<FacilityRow | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient().from('roof_facilities').select('*').eq('id', id).eq('contractor_id', viewer.contractor.id).maybeSingle()
  check(error, 'roof_facilities')
  const row = data as FacilityRow | null
  return row && facilityEditable(viewer, row) ? row : null
}

/** A roof the viewer may change (and its building), or null. */
export async function roofForWrite(viewer: ContractorViewer, id: unknown): Promise<{ roof: RoofRow; facility: FacilityRow } | null> {
  if (!isUuid(id)) return null
  const db = createAdminClient()
  const { data, error } = await db.from('roof_assets').select('*').eq('id', id).eq('contractor_id', viewer.contractor.id).maybeSingle()
  check(error, 'roof_assets')
  const roof = data as RoofRow | null
  if (!roof) return null
  const { data: f, error: fError } = await db.from('roof_facilities').select('*').eq('id', roof.facility_id).eq('contractor_id', viewer.contractor.id).maybeSingle()
  check(fError, 'roof_facilities')
  const facility = f as FacilityRow | null
  if (!facility || !roofVisible(viewer, roof, facility)) return null
  return { roof, facility }
}

/** A row on one of the viewer's roofs (inspection, deficiency, estimate, plan item), with that roof, or null. */
export async function childForWrite<T extends { roof_asset_id: string }>(
  viewer: ContractorViewer,
  table: 'roof_inspections' | 'roof_deficiencies' | 'roof_estimates' | 'roof_plans',
  id: unknown,
): Promise<{ row: T; roof: RoofRow; facility: FacilityRow } | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient().from(table).select('*').eq('id', id).eq('contractor_id', viewer.contractor.id).maybeSingle()
  check(error, table)
  const row = data as T | null
  if (!row) return null
  const found = await roofForWrite(viewer, row.roof_asset_id)
  return found ? { row, ...found } : null
}

/** A document the viewer may change, or null. */
export async function documentForWrite(viewer: ContractorViewer, id: unknown): Promise<DocumentRow | null> {
  if (!isUuid(id)) return null
  const { data, error } = await createAdminClient().from('roof_documents').select('*').eq('id', id).eq('contractor_id', viewer.contractor.id).maybeSingle()
  check(error, 'roof_documents')
  const row = data as DocumentRow | null
  if (!row) return null
  if (seesAll(viewer)) return row
  if (row.roof_asset_id) return (await roofForWrite(viewer, row.roof_asset_id)) ? row : null
  if (row.facility_id) {
    const scope = await loadScope(viewer)
    return scope.facilities.some((f) => f.id === row.facility_id) ? row : null
  }
  return seesRecord(viewer, [row.uploaded_by, row.created_by, row.assigned_to]) ? row : null
}

/** The viewer's Roofs permissions. */
export function roofPerms(viewer: ContractorViewer): RoofPerms {
  return {
    edit: !viewer.readOnly && can(viewer.role, 'roofs.edit'),
    assign: can(viewer.role, 'sales.view_all'),
    addCustomer: can(viewer.role, 'customers.edit'),
    quotes: !viewer.readOnly && can(viewer.role, 'quotes.create'),
    projects: can(viewer.role, 'projects.view'),
    warranties: can(viewer.role, 'warranties.view'),
    customers: can(viewer.role, 'customers.view'),
  }
}

/** Re-exported for the writes: the roof table's check. */
export { check as checkRoofError }
