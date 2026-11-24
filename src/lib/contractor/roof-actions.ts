'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { dayKey } from '@/lib/portal/admin/format'
import { diff, logActivity } from './activity'
import { FormError, formDate, formMoney, formOneOf, formText, formWhole, getCustomer, insertCustomer, isUuid, parseCustomerInput, resolveAssignee } from './customers'
import { portalAction, type PortalResult } from './guard'
import { mediaUrl, presignMediaPut, uploadedSize } from './media'
import { getProjectRow } from './projects'
import {
  DEFICIENCY_STATUS_LABEL,
  DEFICIENCY_STATUSES,
  DOC_MAX_BYTES,
  DOCUMENT_KINDS,
  ESTIMATE_SCENARIOS,
  ESTIMATE_STATUS_LABEL,
  ESTIMATE_STATUSES,
  INSPECTION_KINDS,
  PLAN_ACTIONS,
  PLAN_STATUS_LABEL,
  PLAN_STATUSES,
  ROOF_DECKS,
  ROOF_SLOPES,
  ROOF_SYSTEMS,
  SCENARIO_LABEL,
  SEVERITIES,
  docContentType,
  docProblem,
  fileSize,
  type DeficiencyStatus,
  type EstimateStatus,
} from './roof-shared'
import {
  RoofsNotReady,
  checkRoofError,
  childForWrite,
  documentForWrite,
  facilityForWrite,
  isContractorRegistration,
  projectQuoteOptions,
  roofForWrite,
  type DeficiencyRow,
  type DocumentRow,
  type EstimateRow,
  type FacilityRow,
  type PlanRow,
  type RoofRow,
} from './roofs'
import { can } from './roles'
import { activeTeam } from './team-data'
import { ROOF_TYPES, type TeamMember } from './types'
import type { ContractorViewer } from './viewer'

/**
 * Writes on the Roofs pages: buildings, roofs, inspections (with the
 * problems found), deficiencies, estimates and their status, the budget plan
 * and documents. Each one checks the role (portalAction('roofs.edit'),
 * refused in View as), scopes the write to the viewer's contractor and to a
 * building or roof they can see (roofs.ts: a sales rep, their own), logs a
 * plain-English activity line under 'roofs' (the roof's id, or the
 * building's) and refreshes the Roofs pages.
 *
 * Documents upload like project photos: startRoofDocumentUpload returns a
 * presigned PUT under user-uploads/roof-docs/<contractor id>/, the browser
 * sends the file to S3, and finishRoofDocumentUpload checks it's there and
 * records it. Deleting a document removes the record; the S3 object stays.
 */

const SAVE_FAILED = 'That didn’t save. Try again, or call Crazy Seal if it keeps happening.'
const NOT_READY = 'Roofs is still being set up. Try again later, or call Crazy Seal.'
const ROOF_GONE = 'That roof isn’t available any more. Reload the page.'
const BUILDING_GONE = 'That building isn’t available any more. Reload the page.'

type Fail = { ok: false; error: string }

function failed(err: unknown): Fail {
  if (err instanceof FormError) return { ok: false, error: err.message }
  if (err instanceof RoofsNotReady) return { ok: false, error: NOT_READY }
  console.error('[contractor-roofs]', err)
  return { ok: false, error: SAVE_FAILED }
}

function me(viewer: ContractorViewer): string | null {
  return viewer.hasAccount ? viewer.proUserId : null
}

function refresh(): void {
  revalidatePath('/portal/roofs', 'layout')
}

function today(): string {
  return dayKey(new Date())
}

function now(): string {
  return new Date().toISOString()
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key)
  return typeof v === 'string' ? v.trim() : ''
}

function roofName(facility: Pick<FacilityRow, 'name'>, roof: Pick<RoofRow, 'name'>): string {
  return `“${facility.name} · ${roof.name}”`
}

/** Dollars, or null when empty (unlike formMoney's 0). */
function moneyOrNull(fd: FormData, key: string, label: string): number | null {
  return str(fd, key) ? formMoney(fd, key, label) : null
}

/** Who a record is assigned to: people who see the whole company pick; others keep it (or get it, when new). */
function assignee(viewer: ContractorViewer, fd: FormData, team: TeamMember[], before?: { assigned_to: string | null } | null): string | null {
  if (!can(viewer.role, 'sales.view_all')) return before ? before.assigned_to : me(viewer)
  return resolveAssignee(viewer, fd, 'assigned_to', team, before ? before.assigned_to : me(viewer), before?.assigned_to)
}

/** A team member picked in the form (an inspector), or null. `current` is kept as-is. */
function teamPick(fd: FormData, key: string, team: TeamMember[], label: string, current?: string | null): string | null {
  const v = str(fd, key)
  if (!v) return null
  if (current && v === current) return v
  if (!team.some((m) => m.pro_user_id === v)) throw new FormError(`Pick a ${label.toLowerCase()} on your team.`)
  return v
}

function isUniqueViolation(error: { code?: string } | null): boolean {
  return error?.code === '23505'
}

/** The next "R-1001" / "E-1001" style number for the contractor. */
async function nextNumber(table: 'roof_assets' | 'roof_estimates', column: 'tag' | 'number', prefix: string, contractorId: string): Promise<string> {
  const { data, error } = await createAdminClient().from(table).select(column).eq('contractor_id', contractorId).limit(10000)
  checkRoofError(error, table)
  const re = new RegExp(`^${prefix}-(\\d+)$`, 'i')
  let max = 1000
  for (const row of (data ?? []) as Record<string, string>[]) {
    const m = re.exec(row[column] ?? '')
    if (m) max = Math.max(max, Number(m[1]))
  }
  return `${prefix}-${max + 1}`
}

/* ============================================================ buildings */

/**
 * The building's owner from the form: an existing customer the viewer can
 * see, a new one (customer_mode=new, added once everything else checks out),
 * or none.
 */
async function parseOwner(
  viewer: ContractorViewer,
  fd: FormData,
  place: { city: string | null; state: string | null; zip: string | null },
  assignedTo: string | null,
  current?: string | null,
): Promise<{ id: string | null; create?: () => Promise<{ id: string; name: string }> }> {
  const mode = str(fd, 'customer_mode')
  if (mode === 'new') {
    if (!can(viewer.role, 'customers.edit')) throw new FormError('Your role can’t add customers. Pick an existing customer instead.')
    const input = parseCustomerInput(fd, 'customer_')
    const withTown = { ...input, type: input.type ?? 'Building owner', city: input.city ?? place.city, state: input.state ?? place.state, zip: input.zip ?? place.zip }
    return {
      id: null,
      create: async () => {
        const row = await insertCustomer(viewer, withTown, assignedTo)
        return { id: row.id, name: row.name }
      },
    }
  }
  const id = str(fd, 'customer_id')
  if (mode === 'none' || !id) return { id: null }
  if (current && id === current) return { id }
  const customer = await getCustomer(viewer, id)
  if (!customer) throw new FormError('Pick a customer from the list.')
  return { id: customer.id }
}

/** Add a building (no id) or change one (id). */
export async function saveFacility(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const id = str(fd, 'id')
    const before = id ? await facilityForWrite(viewer, id) : null
    if (id && !before) throw new FormError(BUILDING_GONE)
    const team = await activeTeam(viewer.contractor.id)
    const fields = {
      name: formText(fd, 'name', 'Building name', 160, true)!,
      street: formText(fd, 'street', 'Street', 200),
      city: formText(fd, 'city', 'City', 100),
      state: formText(fd, 'state', 'State', 40),
      zip: formText(fd, 'zip', 'ZIP', 20),
      notes: formText(fd, 'notes', 'Notes', 4000),
    }
    const assignedTo = assignee(viewer, fd, team, before)
    const owner = await parseOwner(viewer, fd, fields, assignedTo, before?.customer_id)
    const customerId = owner.create ? (await owner.create()).id : owner.id
    const patch = { ...fields, customer_id: customerId, assigned_to: assignedTo }
    const db = createAdminClient()

    if (before) {
      const changes = diff(before as unknown as Record<string, unknown>, patch as Record<string, unknown>)
      if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.', id: before.id }
      const { data, error } = await db
        .from('roof_facilities')
        .update({ ...patch, updated_at: now() })
        .eq('id', before.id)
        .eq('contractor_id', viewer.contractor.id)
        .select('id')
      checkRoofError(error, 'roof_facilities')
      if (!data?.length) throw new FormError(BUILDING_GONE)
      await logActivity(viewer, { entity: 'roofs', entityId: before.id, action: 'update', summary: `Updated building “${fields.name}”`, changes })
      result = { ok: true, message: 'Saved.', id: before.id }
    } else {
      const stamp = now()
      const { data, error } = await db
        .from('roof_facilities')
        .insert({ ...patch, contractor_id: viewer.contractor.id, created_by: me(viewer), created_at: stamp, updated_at: stamp })
        .select('id')
        .single()
      checkRoofError(error, 'roof_facilities')
      const newId = (data as { id: string }).id
      await logActivity(viewer, { entity: 'roofs', entityId: newId, action: 'create', summary: `Added building “${fields.name}”` })
      result = { ok: true, message: 'Building added.', id: newId }
    }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/* ================================================================ roofs */

/** Add a roof (no id) or change one (id). */
export async function saveRoof(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const id = str(fd, 'id')
    const found = id ? await roofForWrite(viewer, id) : null
    if (id && !found) throw new FormError(ROOF_GONE)
    const before = found?.roof ?? null

    // The building: a roof can move to any building the viewer may change, or stay where it is.
    const facilityId = str(fd, 'facility_id')
    if (!facilityId) throw new FormError('Pick the building this roof is on.')
    const facility = before && facilityId === before.facility_id ? found!.facility : await facilityForWrite(viewer, facilityId)
    if (!facility) throw new FormError('Pick a building from the list.')

    const team = await activeTeam(viewer.contractor.id)
    const year = formWhole(fd, 'year_installed', 'Year installed', 2100)
    if (year !== null && year < 1900) throw new FormError('Year installed looks too early.')
    const score = formWhole(fd, 'condition_score', 'Condition score', 100)

    let projectId: string | null = str(fd, 'project_id') || null
    if (projectId && projectId !== before?.project_id) {
      if (!(await getProjectRow(viewer, projectId))) throw new FormError('Pick a project from the list.')
    }
    let warrantyId: string | null = str(fd, 'warranty_registration_id') || null
    if (warrantyId && warrantyId !== before?.warranty_registration_id) {
      if (!can(viewer.role, 'warranties.view') || !(await isContractorRegistration(viewer.contractor.id, warrantyId))) throw new FormError('Pick a warranty registration from the list.')
    }
    // Roles that don't see warranties keep whatever is linked.
    if (!can(viewer.role, 'warranties.view') && before) warrantyId = before.warranty_registration_id
    if (!fd.has('project_id') && before) projectId = before.project_id

    const typedTag = formText(fd, 'tag', 'Asset tag', 40)
    const patch = {
      facility_id: facility.id,
      name: formText(fd, 'name', 'Roof name', 160, true)!,
      roof_type: formOneOf(fd, 'roof_type', 'Roof type', ROOF_TYPES, before?.roof_type),
      system: formOneOf(fd, 'system', 'System', ROOF_SYSTEMS, before?.system),
      area_sqft: formWhole(fd, 'area_sqft', 'Roof area', 50_000_000),
      slope: formOneOf(fd, 'slope', 'Slope', ROOF_SLOPES, before?.slope),
      deck: formOneOf(fd, 'deck', 'Deck', ROOF_DECKS, before?.deck),
      year_installed: year,
      condition_score: score,
      last_inspected_on: formDate(fd, 'last_inspected_on', 'Last inspected'),
      next_inspection_on: formDate(fd, 'next_inspection_on', 'Next inspection'),
      project_id: projectId,
      warranty_registration_id: warrantyId,
      notes: formText(fd, 'notes', 'Notes', 4000),
      assigned_to: assignee(viewer, fd, team, before),
    }
    const db = createAdminClient()
    const label = roofName(facility, patch)

    if (before) {
      const full = { ...patch, tag: typedTag ?? before.tag }
      const changes = diff(before as unknown as Record<string, unknown>, full as Record<string, unknown>)
      if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.', id: before.id }
      const { data, error } = await db
        .from('roof_assets')
        .update({ ...full, updated_at: now() })
        .eq('id', before.id)
        .eq('contractor_id', viewer.contractor.id)
        .select('id')
      if (isUniqueViolation(error)) throw new FormError(`Another roof already has the tag ${full.tag}.`)
      checkRoofError(error, 'roof_assets')
      if (!data?.length) throw new FormError(ROOF_GONE)
      await logActivity(viewer, { entity: 'roofs', entityId: before.id, action: 'update', summary: `Updated roof ${label}`, changes })
      result = { ok: true, message: 'Saved.', id: before.id }
    } else {
      let newId: string | null = null
      for (let attempt = 0; attempt < 3 && !newId; attempt++) {
        const tag = typedTag ?? (await nextNumber('roof_assets', 'tag', 'R', viewer.contractor.id))
        const stamp = now()
        const { data, error } = await db
          .from('roof_assets')
          .insert({ ...patch, tag, contractor_id: viewer.contractor.id, created_by: me(viewer), created_at: stamp, updated_at: stamp })
          .select('id')
          .single()
        if (isUniqueViolation(error)) {
          if (typedTag) throw new FormError(`Another roof already has the tag ${typedTag}.`)
          continue
        }
        checkRoofError(error, 'roof_assets')
        newId = (data as { id: string }).id
      }
      if (!newId) throw new Error('roof_assets insert: no free tag')
      await logActivity(viewer, { entity: 'roofs', entityId: newId, action: 'create', summary: `Added roof ${label}` })
      result = { ok: true, message: 'Roof added.', id: newId }
    }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/* ========================================================== inspections */

interface FoundProblem {
  title: string
  severity: (typeof SEVERITIES)[number]
  location: string | null
  est_cost: number | null
}

/** The problems found, from the form's repeated def_* fields (rows without a title are skipped). */
function parseProblems(fd: FormData): FoundProblem[] {
  const titles = fd.getAll('def_title').map((v) => (typeof v === 'string' ? v.trim() : ''))
  const severities = fd.getAll('def_severity')
  const locations = fd.getAll('def_location')
  const costs = fd.getAll('def_cost')
  const out: FoundProblem[] = []
  titles.forEach((title, i) => {
    if (!title) return
    if (title.length > 160) throw new FormError(`Problem ${i + 1}: the title is too long (160 characters at most).`)
    const severity = SEVERITIES.find((s) => s === severities[i])
    if (!severity) throw new FormError(`Problem ${i + 1}: pick a severity.`)
    const location = typeof locations[i] === 'string' ? (locations[i] as string).trim().slice(0, 200) || null : null
    const rawCost = typeof costs[i] === 'string' ? (costs[i] as string).replace(/[$,\s]/g, '') : ''
    let est_cost: number | null = null
    if (rawCost) {
      const n = Number(rawCost)
      if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000) throw new FormError(`Problem ${i + 1}: the estimated cost must be an amount, 0 or more.`)
      est_cost = Math.round(n * 100) / 100
    }
    out.push({ title, severity, location, est_cost })
  })
  if (out.length > 50) throw new FormError('That’s a lot of problems for one inspection. Add 50 at most, then add the rest on the roof.')
  return out
}

/**
 * Records an inspection of a roof, and the problems found on it. When it's
 * the roof's latest inspection, the roof's condition and last inspection date
 * follow it; the next inspection date is set when one is given.
 */
export async function recordInspection(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const found = await roofForWrite(viewer, str(fd, 'roof_id'))
    if (!found) throw new FormError('Pick a roof from the list.')
    const { roof, facility } = found
    const team = await activeTeam(viewer.contractor.id)
    const kind = formOneOf(fd, 'kind', 'Inspection type', INSPECTION_KINDS)
    if (!kind) throw new FormError('Pick the type of inspection.')
    const inspectedOn = formDate(fd, 'inspected_on', 'Inspection date')
    if (!inspectedOn) throw new FormError('Inspection date is required.')
    if (inspectedOn > today()) throw new FormError('The inspection date can’t be in the future. To plan one, set the roof’s next inspection date.')
    const score = formWhole(fd, 'condition_score', 'Condition score', 100)
    if (score === null) throw new FormError('Set the condition score.')
    const next = formDate(fd, 'next_inspection_on', 'Next inspection')
    if (next && next <= inspectedOn) throw new FormError('The next inspection has to be after this one.')
    const inspector = teamPick(fd, 'inspector_id', team, 'Inspector')
    const summary = formText(fd, 'summary', 'Findings', 4000)
    const problems = parseProblems(fd)

    const db = createAdminClient()
    const stamp = now()
    const { data, error } = await db
      .from('roof_inspections')
      .insert({
        contractor_id: viewer.contractor.id,
        roof_asset_id: roof.id,
        kind,
        inspected_on: inspectedOn,
        inspector_id: inspector,
        condition_score: score,
        summary,
        assigned_to: inspector ?? me(viewer),
        created_by: me(viewer),
        created_at: stamp,
        updated_at: stamp,
      })
      .select('id')
      .single()
    checkRoofError(error, 'roof_inspections')
    const inspectionId = (data as { id: string }).id

    if (problems.length) {
      const { error: dError } = await db.from('roof_deficiencies').insert(
        problems.map((p) => ({
          ...p,
          contractor_id: viewer.contractor.id,
          roof_asset_id: roof.id,
          inspection_id: inspectionId,
          status: 'open',
          assigned_to: me(viewer),
          created_by: me(viewer),
          created_at: stamp,
          updated_at: stamp,
        })),
      )
      checkRoofError(dError, 'roof_deficiencies')
    }

    const latest = !roof.last_inspected_on || inspectedOn >= roof.last_inspected_on
    const roofPatch: Partial<RoofRow> = {}
    if (latest) {
      roofPatch.condition_score = score
      roofPatch.last_inspected_on = inspectedOn
    }
    if (next) roofPatch.next_inspection_on = next
    else if (roof.next_inspection_on && roof.next_inspection_on <= inspectedOn) roofPatch.next_inspection_on = null
    if (Object.keys(roofPatch).length) {
      const { error: rError } = await db
        .from('roof_assets')
        .update({ ...roofPatch, updated_at: stamp })
        .eq('id', roof.id)
        .eq('contractor_id', viewer.contractor.id)
      checkRoofError(rError, 'roof_assets')
    }

    const problemsNote = problems.length ? `, ${problems.length} problem${problems.length === 1 ? '' : 's'} found` : ''
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: roof.id,
      action: 'create',
      summary: `Recorded a ${kind.toLowerCase()} inspection of ${roofName(facility, roof)}: ${score}/100${problemsNote}`,
      changes: latest ? diff({ condition_score: roof.condition_score, last_inspected_on: roof.last_inspected_on }, { condition_score: score, last_inspected_on: inspectedOn }) : null,
    })
    result = { ok: true, message: 'Inspection recorded.', id: inspectionId }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/* ========================================================= deficiencies */

/** Log a problem on a roof (roof_id), or change one (id). */
export async function saveDeficiency(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const id = str(fd, 'id')
    const existing = id ? await childForWrite<DeficiencyRow>(viewer, 'roof_deficiencies', id) : null
    if (id && !existing) throw new FormError('That problem isn’t available any more. Reload the page.')
    const found = existing ?? (await roofForWrite(viewer, str(fd, 'roof_id')))
    if (!found) throw new FormError('Pick a roof from the list.')
    const before = existing?.row ?? null
    const severity = formOneOf(fd, 'severity', 'Severity', SEVERITIES)
    if (!severity) throw new FormError('Pick a severity.')
    const fields = {
      title: formText(fd, 'title', 'What’s wrong', 160, true)!,
      location: formText(fd, 'location', 'Where', 200),
      severity,
      status: (before ? (formOneOf(fd, 'status', 'Status', DEFICIENCY_STATUSES) ?? before.status) : 'open') as DeficiencyStatus,
      est_cost: moneyOrNull(fd, 'est_cost', 'Estimated cost'),
      notes: formText(fd, 'notes', 'Notes', 4000),
    }
    const db = createAdminClient()
    const label = roofName(found.facility, found.roof)
    if (before) {
      const changes = diff({ ...before, est_cost: before.est_cost === null ? null : Number(before.est_cost) } as unknown as Record<string, unknown>, fields)
      if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.', id: before.id }
      const { error } = await db.from('roof_deficiencies').update({ ...fields, updated_at: now() }).eq('id', before.id).eq('contractor_id', viewer.contractor.id)
      checkRoofError(error, 'roof_deficiencies')
      await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'update', summary: `Updated “${fields.title}” on ${label}`, changes })
      result = { ok: true, message: 'Saved.', id: before.id }
    } else {
      const stamp = now()
      const { data, error } = await db
        .from('roof_deficiencies')
        .insert({ ...fields, contractor_id: viewer.contractor.id, roof_asset_id: found.roof.id, assigned_to: me(viewer), created_by: me(viewer), created_at: stamp, updated_at: stamp })
        .select('id')
        .single()
      checkRoofError(error, 'roof_deficiencies')
      await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'create', summary: `Logged “${fields.title}” (${severity}) on ${label}` })
      result = { ok: true, message: 'Problem logged.', id: (data as { id: string }).id }
    }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/** Moves a problem to another status (fields: id, status). */
export async function setDeficiencyStatus(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let message = ''
  try {
    const found = await childForWrite<DeficiencyRow>(viewer, 'roof_deficiencies', str(fd, 'id'))
    if (!found) throw new FormError('That problem isn’t available any more. Reload the page.')
    const status = formOneOf(fd, 'status', 'Status', DEFICIENCY_STATUSES)
    if (!status) throw new FormError('Pick a status.')
    if (status === found.row.status) return { ok: true }
    const { error } = await createAdminClient()
      .from('roof_deficiencies')
      .update({ status, updated_at: now() })
      .eq('id', found.row.id)
      .eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_deficiencies')
    message = `“${found.row.title}” on ${roofName(found.facility, found.roof)}: ${DEFICIENCY_STATUS_LABEL[status]}`
    await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'update', summary: message, changes: { status: [found.row.status, status] } })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message }
}

/* ============================================================ estimates */

/** Moves the covered problems from one set of statuses to another. */
async function moveDeficiencies(contractorId: string, roofId: string, ids: string[], from: DeficiencyStatus[], to: DeficiencyStatus): Promise<void> {
  const list = ids.filter(isUuid)
  if (!list.length) return
  const { error } = await createAdminClient()
    .from('roof_deficiencies')
    .update({ status: to, updated_at: now() })
    .eq('contractor_id', contractorId)
    .eq('roof_asset_id', roofId)
    .in('id', list)
    .in('status', from)
  checkRoofError(error, 'roof_deficiencies')
}

/** The covered problems from the form: the roof's own, by id. */
async function parseCovered(fd: FormData, contractorId: string, roofId: string): Promise<string[]> {
  const ids = [...new Set(fd.getAll('deficiency_ids').filter(isUuid))].slice(0, 200)
  if (!ids.length) return []
  const { data, error } = await createAdminClient().from('roof_deficiencies').select('id').eq('contractor_id', contractorId).eq('roof_asset_id', roofId).in('id', ids)
  checkRoofError(error, 'roof_deficiencies')
  const known = new Set(((data ?? []) as { id: string }[]).map((d) => d.id))
  return ids.filter((id) => known.has(id))
}

/**
 * New estimate for a roof (roof_id), saved as a draft, or changes to one (id)
 * while it's a draft or awaiting approval. The problems it covers move to
 * "In an estimate"; ones taken off go back to open.
 */
export async function saveEstimate(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const id = str(fd, 'id')
    const existing = id ? await childForWrite<EstimateRow>(viewer, 'roof_estimates', id) : null
    if (id && !existing) throw new FormError('That estimate isn’t available any more. Reload the page.')
    const found = existing ?? (await roofForWrite(viewer, str(fd, 'roof_id')))
    if (!found) throw new FormError('Pick a roof from the list.')
    const before = existing?.row ?? null
    if (before && (before.status === 'approved' || before.status === 'declined')) {
      throw new FormError(`This estimate is ${ESTIMATE_STATUS_LABEL[before.status].toLowerCase()}. Move it back to draft to change it.`)
    }
    const team = await activeTeam(viewer.contractor.id)
    const scenario = formOneOf(fd, 'scenario', 'Scenario', ESTIMATE_SCENARIOS)
    if (!scenario) throw new FormError('Pick repair, restore or replace.')
    const budgetYear = formWhole(fd, 'budget_year', 'Budget year', 2100)
    if (budgetYear !== null && budgetYear < 2000) throw new FormError('Budget year looks wrong.')
    const covered = await parseCovered(fd, viewer.contractor.id, found.roof.id)
    const fields = {
      scenario,
      amount: formMoney(fd, 'amount', 'Amount'),
      budget_year: budgetYear,
      assumptions: formText(fd, 'assumptions', 'Scope & assumptions', 4000),
      deficiency_ids: covered,
      assigned_to: assignee(viewer, fd, team, before),
    }
    const db = createAdminClient()
    const label = roofName(found.facility, found.roof)

    if (before) {
      const changes = diff({ ...before, amount: Number(before.amount) } as unknown as Record<string, unknown>, fields as Record<string, unknown>)
      if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.', id: before.id }
      const { error } = await db.from('roof_estimates').update({ ...fields, updated_at: now() }).eq('id', before.id).eq('contractor_id', viewer.contractor.id)
      checkRoofError(error, 'roof_estimates')
      const was = before.deficiency_ids ?? []
      await moveDeficiencies(viewer.contractor.id, found.roof.id, covered, ['open'], 'scoped')
      await moveDeficiencies(viewer.contractor.id, found.roof.id, was.filter((d) => !covered.includes(d)), ['scoped'], 'open')
      await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'update', summary: `Updated estimate ${before.number} for ${label}`, changes })
      result = { ok: true, message: 'Saved.', id: before.id }
    } else {
      let newId: string | null = null
      let number = ''
      for (let attempt = 0; attempt < 3 && !newId; attempt++) {
        number = await nextNumber('roof_estimates', 'number', 'E', viewer.contractor.id)
        const stamp = now()
        const { data, error } = await db
          .from('roof_estimates')
          .insert({ ...fields, number, status: 'draft', contractor_id: viewer.contractor.id, roof_asset_id: found.roof.id, created_by: me(viewer), created_at: stamp, updated_at: stamp })
          .select('id')
          .single()
        if (isUniqueViolation(error)) continue
        checkRoofError(error, 'roof_estimates')
        newId = (data as { id: string }).id
      }
      if (!newId) throw new Error('roof_estimates insert: no free number')
      await moveDeficiencies(viewer.contractor.id, found.roof.id, covered, ['open'], 'scoped')
      await logActivity(viewer, {
        entity: 'roofs',
        entityId: found.roof.id,
        action: 'create',
        summary: `Drafted ${SCENARIO_LABEL[scenario].toLowerCase()} estimate ${number} for ${label}`,
      })
      result = { ok: true, message: `Estimate ${number} saved as a draft.`, id: newId }
    }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/** Where an estimate can go from each status. */
const ESTIMATE_MOVES: Record<EstimateStatus, readonly EstimateStatus[]> = {
  draft: ['sent'],
  sent: ['approved', 'declined', 'draft'],
  approved: ['sent'],
  declined: ['draft'],
}

/**
 * Moves an estimate along draft -> sent -> approved / declined (fields: id,
 * status, approval_note). Approving schedules the problems it covers;
 * declining puts them back to open; reopening undoes either.
 */
export async function setEstimateStatus(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let message = ''
  try {
    const found = await childForWrite<EstimateRow>(viewer, 'roof_estimates', str(fd, 'id'))
    if (!found) throw new FormError('That estimate isn’t available any more. Reload the page.')
    const est = found.row
    const status = formOneOf(fd, 'status', 'Status', ESTIMATE_STATUSES)
    if (!status) throw new FormError('Pick a status.')
    if (status === est.status) return { ok: true }
    if (!ESTIMATE_MOVES[est.status].includes(status)) {
      throw new FormError(`An estimate that’s ${ESTIMATE_STATUS_LABEL[est.status].toLowerCase()} can’t be marked ${ESTIMATE_STATUS_LABEL[status].toLowerCase()}.`)
    }
    const decided = status === 'approved' || status === 'declined'
    const patch = {
      status,
      approved_at: decided ? now() : null,
      approval_note: decided ? formText(fd, 'approval_note', 'Note', 2000) : null,
    }
    const { error } = await createAdminClient().from('roof_estimates').update({ ...patch, updated_at: now() }).eq('id', est.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_estimates')

    const covered = est.deficiency_ids ?? []
    const cid = viewer.contractor.id
    const roofId = found.roof.id
    if (status === 'approved') await moveDeficiencies(cid, roofId, covered, ['open', 'scoped'], 'scheduled')
    if (status === 'declined') await moveDeficiencies(cid, roofId, covered, ['scoped'], 'open')
    if (status === 'sent' && est.status === 'approved') await moveDeficiencies(cid, roofId, covered, ['scheduled'], 'scoped')
    if (status === 'draft' && est.status === 'declined') await moveDeficiencies(cid, roofId, covered, ['open'], 'scoped')

    const label = roofName(found.facility, found.roof)
    message =
      status === 'sent'
        ? est.status === 'approved'
          ? `Reopened estimate ${est.number} for ${label}`
          : `Sent estimate ${est.number} for ${label} to the customer`
        : status === 'draft'
          ? `Moved estimate ${est.number} for ${label} back to draft`
          : `Estimate ${est.number} for ${label} ${status}${patch.approval_note ? `: “${patch.approval_note}”` : ''}`
    await logActivity(viewer, { entity: 'roofs', entityId: roofId, action: 'update', summary: message, changes: { status: [est.status, status] } })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message }
}

/** Links a materials quote on the roof's project to an estimate, or unlinks it (fields: id, quote_id). */
export async function linkEstimateQuote(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const found = await childForWrite<EstimateRow>(viewer, 'roof_estimates', str(fd, 'id'))
    if (!found) throw new FormError('That estimate isn’t available any more. Reload the page.')
    const quoteId = str(fd, 'quote_id') || null
    if (quoteId === found.row.quote_id) return { ok: true }
    let quoteNumber = ''
    if (quoteId) {
      if (!found.roof.project_id) throw new FormError('Link the roof to a project first: quotes are made on a project.')
      const options = await projectQuoteOptions(viewer, found.roof.project_id)
      const quote = options.find((q) => q.id === quoteId)
      if (!quote) throw new FormError('Pick a quote from the list.')
      quoteNumber = quote.number
    }
    const { error } = await createAdminClient()
      .from('roof_estimates')
      .update({ quote_id: quoteId, updated_at: now() })
      .eq('id', found.row.id)
      .eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_estimates')
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: found.roof.id,
      action: 'update',
      summary: quoteId ? `Linked materials quote ${quoteNumber} to estimate ${found.row.number}` : `Unlinked the materials quote from estimate ${found.row.number}`,
    })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Saved.' }
}

/** Deletes a draft estimate (field: id); the problems it covered go back to open. */
export async function deleteEstimate(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const found = await childForWrite<EstimateRow>(viewer, 'roof_estimates', str(fd, 'id'))
    if (!found) return { ok: true }
    if (found.row.status !== 'draft') throw new FormError('Only drafts can be deleted. Mark it declined instead.')
    const { error } = await createAdminClient().from('roof_estimates').delete().eq('id', found.row.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_estimates')
    await moveDeficiencies(viewer.contractor.id, found.roof.id, found.row.deficiency_ids ?? [], ['scoped'], 'open')
    await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'delete', summary: `Deleted draft estimate ${found.row.number} for ${roofName(found.facility, found.roof)}` })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Deleted.' }
}

/* ================================================================ plans */

/** Adds an item to a roof's budget plan (roof_id), or changes one (id). */
export async function savePlanItem(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let result: PortalResult
  try {
    const id = str(fd, 'id')
    const existing = id ? await childForWrite<PlanRow>(viewer, 'roof_plans', id) : null
    if (id && !existing) throw new FormError('That plan item isn’t available any more. Reload the page.')
    const found = existing ?? (await roofForWrite(viewer, str(fd, 'roof_id')))
    if (!found) throw new FormError('Pick a roof from the list.')
    const before = existing?.row ?? null
    const year = formWhole(fd, 'year', 'Year', 2100)
    if (year === null || year < 2000) throw new FormError('Pick a year.')
    const action = formOneOf(fd, 'action', 'Action', PLAN_ACTIONS)
    if (!action) throw new FormError('Pick an action.')
    const fields = {
      year,
      action,
      est_cost: formMoney(fd, 'est_cost', 'Estimated cost'),
      status: formOneOf(fd, 'status', 'Status', PLAN_STATUSES) ?? before?.status ?? 'proposed',
      notes: formText(fd, 'notes', 'Notes', 2000),
    }
    const db = createAdminClient()
    const label = roofName(found.facility, found.roof)
    if (before) {
      const changes = diff({ ...before, est_cost: Number(before.est_cost) } as unknown as Record<string, unknown>, fields)
      if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.', id: before.id }
      const { error } = await db.from('roof_plans').update({ ...fields, updated_at: now() }).eq('id', before.id).eq('contractor_id', viewer.contractor.id)
      checkRoofError(error, 'roof_plans')
      await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'update', summary: `Updated the ${year} ${action.toLowerCase()} plan for ${label}`, changes })
      result = { ok: true, message: 'Saved.', id: before.id }
    } else {
      const stamp = now()
      const { data, error } = await db
        .from('roof_plans')
        .insert({ ...fields, contractor_id: viewer.contractor.id, roof_asset_id: found.roof.id, assigned_to: me(viewer), created_by: me(viewer), created_at: stamp, updated_at: stamp })
        .select('id')
        .single()
      checkRoofError(error, 'roof_plans')
      await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'create', summary: `Planned ${action.toLowerCase()} in ${year} for ${label}` })
      result = { ok: true, message: 'Added to the plan.', id: (data as { id: string }).id }
    }
  } catch (err) {
    return failed(err)
  }
  refresh()
  return result
}

/** Moves a plan item to another status (fields: id, status). */
export async function setPlanStatus(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let message = ''
  try {
    const found = await childForWrite<PlanRow>(viewer, 'roof_plans', str(fd, 'id'))
    if (!found) throw new FormError('That plan item isn’t available any more. Reload the page.')
    const status = formOneOf(fd, 'status', 'Status', PLAN_STATUSES)
    if (!status) throw new FormError('Pick a status.')
    if (status === found.row.status) return { ok: true }
    const { error } = await createAdminClient().from('roof_plans').update({ status, updated_at: now() }).eq('id', found.row.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_plans')
    message = `${found.row.year} ${found.row.action.toLowerCase()} for ${roofName(found.facility, found.roof)}: ${PLAN_STATUS_LABEL[status]}`
    await logActivity(viewer, { entity: 'roofs', entityId: found.roof.id, action: 'update', summary: message, changes: { status: [found.row.status, status] } })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message }
}

/** Removes an item from a roof's plan (field: id). */
export async function deletePlanItem(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const found = await childForWrite<PlanRow>(viewer, 'roof_plans', str(fd, 'id'))
    if (!found) return { ok: true }
    const { error } = await createAdminClient().from('roof_plans').delete().eq('id', found.row.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_plans')
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: found.roof.id,
      action: 'delete',
      summary: `Removed the ${found.row.year} ${found.row.action.toLowerCase()} plan for ${roofName(found.facility, found.roof)}`,
    })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Removed from the plan.' }
}

/* ============================================================ documents */

export type StartDocUploadResult = { ok: true; uploadUrl: string; key: string; contentType: string } | Fail

const DOC_PREFIX = 'user-uploads/roof-docs'

/** "Roof survey (2).pdf" -> "Roof_survey_2_.pdf", at most 80 characters, keeping the extension. */
function safeName(fileName: string): string {
  const clean = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_') || 'file'
  if (clean.length <= 80) return clean
  const dot = clean.lastIndexOf('.')
  const ext = dot > 0 && clean.length - dot <= 6 ? clean.slice(dot) : ''
  return clean.slice(0, 80 - ext.length) + ext
}

/** Checks a document can be uploaded and returns where the browser PUTs it. */
export async function startRoofDocumentUpload(input: { fileName: string; bytes: number }): Promise<StartDocUploadResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const fileName = String(input?.fileName ?? '').trim().slice(0, 200) || 'file'
    const bytes = Math.floor(Number(input?.bytes))
    const problem = docProblem(fileName, bytes)
    if (problem) return { ok: false, error: problem }
    // The table has to be there before anything goes to S3.
    const { error } = await createAdminClient().from('roof_documents').select('id').eq('contractor_id', viewer.contractor.id).limit(1)
    checkRoofError(error, 'roof_documents')
    const contentType = docContentType(fileName)!
    const key = `${DOC_PREFIX}/${viewer.contractor.id}/${Date.now()}-${randomUUID().slice(0, 8)}-${safeName(fileName)}`
    const uploadUrl = await presignMediaPut(key, contentType)
    return { ok: true, uploadUrl, key, contentType }
  } catch (err) {
    return failed(err)
  }
}

/** The document's links from a form or an upload: a roof (and its building), a building, a project. */
async function parseLinks(
  viewer: ContractorViewer,
  input: { roofId?: string | null; facilityId?: string | null; projectId?: string | null },
  before?: DocumentRow | null,
): Promise<{ roof_asset_id: string | null; facility_id: string | null; project_id: string | null; label: string | null }> {
  const roofId = input.roofId || null
  let facilityId = input.facilityId || null
  const projectId = input.projectId || null
  let label: string | null = null
  if (roofId) {
    const found = await roofForWrite(viewer, roofId)
    if (found) {
      // A document on a roof is on its building too.
      facilityId = found.facility.id
      label = roofName(found.facility, found.roof)
    } else if (roofId !== before?.roof_asset_id) {
      throw new FormError('Pick a roof from the list.')
    }
  } else if (facilityId && facilityId !== before?.facility_id) {
    const facility = await facilityForWrite(viewer, facilityId)
    if (!facility) throw new FormError('Pick a building from the list.')
    label = `“${facility.name}”`
  }
  if (projectId && projectId !== before?.project_id) {
    const project = await getProjectRow(viewer, projectId)
    if (!project) throw new FormError('Pick a project from the list.')
    label = label ?? `“${project.name}”`
  }
  return { roof_asset_id: roofId, facility_id: facilityId, project_id: projectId, label }
}

/**
 * After the browser's PUT: checks the file reached S3 under this contractor's
 * documents and within the size limit, and records it with its title, kind
 * and links.
 */
export async function finishRoofDocumentUpload(input: {
  key: string
  fileName: string
  title: string
  kind: string
  roofId?: string | null
  facilityId?: string | null
  projectId?: string | null
}): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let id = ''
  try {
    const key = String(input?.key ?? '')
    const prefix = `${DOC_PREFIX}/${viewer.contractor.id}/`
    if (!key.startsWith(prefix) || key.includes('..') || key.length > 400 || key.slice(prefix.length).includes('/')) throw new FormError('That upload didn’t work. Try it again.')
    const contentType = docContentType(key)
    if (!contentType) throw new FormError('That upload didn’t work. Try it again.')
    const title = String(input.title ?? '').trim().slice(0, 200)
    if (!title) throw new FormError('Give the document a title.')
    const kind = DOCUMENT_KINDS.find((k) => k === input.kind)
    if (!kind) throw new FormError('Pick what kind of document it is.')
    const links = await parseLinks(viewer, { roofId: input.roofId, facilityId: input.facilityId, projectId: input.projectId })

    const size = await uploadedSize(key)
    const name = String(input.fileName ?? '').trim() || 'That file'
    if (size === 'missing') throw new FormError(`${name} didn’t finish uploading. Try it again.`)
    if (typeof size === 'number' && size > DOC_MAX_BYTES) throw new FormError(`${name} is ${fileSize(size)}, over the ${fileSize(DOC_MAX_BYTES)} limit.`)

    const db = createAdminClient()
    const stamp = now()
    const { data, error } = await db
      .from('roof_documents')
      .insert({
        contractor_id: viewer.contractor.id,
        facility_id: links.facility_id,
        roof_asset_id: links.roof_asset_id,
        project_id: links.project_id,
        title,
        kind,
        s3_key: key,
        url: mediaUrl(key),
        mime: contentType,
        bytes: typeof size === 'number' ? size : null,
        uploaded_by: me(viewer),
        assigned_to: me(viewer),
        created_by: me(viewer),
        created_at: stamp,
        updated_at: stamp,
      })
      .select('id')
      .single()
    // Sent twice (a retried finish): it's already recorded.
    if (isUniqueViolation(error)) return { ok: true, message: 'Uploaded.' }
    checkRoofError(error, 'roof_documents')
    id = (data as { id: string }).id
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: links.roof_asset_id ?? links.facility_id ?? id,
      action: 'create',
      summary: `Uploaded “${title}” (${kind.toLowerCase()})${links.label ? ` to ${links.label}` : ''}`,
    })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Uploaded.', id }
}

/** Changes a document's title, kind or links (fields: id, title, kind, roof_id, facility_id, project_id). */
export async function updateRoofDocument(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const before = await documentForWrite(viewer, str(fd, 'id'))
    if (!before) throw new FormError('That document isn’t available any more. Reload the page.')
    const kind = formOneOf(fd, 'kind', 'Kind', DOCUMENT_KINDS)
    if (!kind) throw new FormError('Pick what kind of document it is.')
    const links = await parseLinks(viewer, { roofId: str(fd, 'roof_id'), facilityId: str(fd, 'facility_id'), projectId: str(fd, 'project_id') }, before)
    const patch = {
      title: formText(fd, 'title', 'Title', 200, true)!,
      kind,
      roof_asset_id: links.roof_asset_id,
      facility_id: links.facility_id,
      project_id: links.project_id,
    }
    const changes = diff(before as unknown as Record<string, unknown>, patch)
    if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.' }
    const { error } = await createAdminClient().from('roof_documents').update({ ...patch, updated_at: now() }).eq('id', before.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_documents')
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: patch.roof_asset_id ?? patch.facility_id ?? before.id,
      action: 'update',
      summary: `Updated document “${patch.title}”`,
      changes,
    })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Saved.' }
}

/** Deletes a document's record (field: id). The file stays in S3, as project photos do. */
export async function deleteRoofDocument(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('roofs.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const before = await documentForWrite(viewer, str(fd, 'id'))
    if (!before) return { ok: true }
    const { error } = await createAdminClient().from('roof_documents').delete().eq('id', before.id).eq('contractor_id', viewer.contractor.id)
    checkRoofError(error, 'roof_documents')
    await logActivity(viewer, {
      entity: 'roofs',
      entityId: before.roof_asset_id ?? before.facility_id ?? before.id,
      action: 'delete',
      summary: `Deleted document “${before.title}”`,
    })
  } catch (err) {
    return failed(err)
  }
  refresh()
  return { ok: true, message: 'Deleted.' }
}
