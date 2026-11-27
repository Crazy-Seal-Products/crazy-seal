'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { dayKey } from '@/lib/portal/admin/format'
import { diff, logActivity } from './activity'
import {
  FormError,
  formDate,
  formMoney,
  formOneOf,
  formText,
  formWhole,
  getCustomer,
  insertCustomer,
  parseCustomerInput,
  resolveAssignee,
} from './customers'
import { portalAction, type PortalResult } from './guard'
import { getProjectRow } from './projects'
import { can } from './roles'
import { activeTeam } from './team-data'
import {
  INSTALL_STEP_LABEL,
  INSTALL_STEPS,
  PROJECT_SOURCES,
  PROJECT_STAGE_LABEL,
  PROJECT_STAGES,
  ROOF_COLORS,
  ROOF_TYPES,
  type ProjectRow,
  type ProjectSite,
  type TeamMember,
} from './types'
import type { ContractorViewer } from './viewer'

/**
 * Writes to a contractor's projects: create, edit details, move between
 * stages, and set the install step. Each one checks the role
 * (portalAction, refused in View as), scopes the write to the viewer's
 * contractor (and a sales rep's own projects), and logs a plain-English
 * activity line with what changed.
 */

const SAVE_FAILED = 'That didn’t save. Try again, or call Crazy Seal if it keeps happening.'

function failed(err: unknown): PortalResult {
  if (err instanceof FormError) return { ok: false, error: err.message }
  console.error('[contractor-projects]', err)
  return { ok: false, error: SAVE_FAILED }
}

function today(): string {
  return dayKey(new Date())
}

/** The site address with keys in one order (jsonb reorders them), or null when empty. */
function canonicalSite(site: ProjectSite | null | undefined): ProjectSite | null {
  if (!site) return null
  const out: ProjectSite = {}
  for (const key of ['street', 'city', 'state', 'zip'] as const) {
    const v = typeof site[key] === 'string' ? site[key]!.trim() : ''
    if (v) out[key] = v
  }
  return Object.keys(out).length ? out : null
}

function parseSite(fd: FormData): ProjectSite | null {
  return canonicalSite({
    street: formText(fd, 'site_street', 'Street', 200) ?? undefined,
    city: formText(fd, 'site_city', 'City', 100) ?? undefined,
    state: formText(fd, 'site_state', 'State', 40) ?? undefined,
    zip: formText(fd, 'site_zip', 'ZIP', 20) ?? undefined,
  })
}

/** The roof and sale fields both the new-project and edit forms send. `before` is the project being edited. */
function parseProjectFields(fd: FormData, before?: ProjectRow) {
  return {
    roof_type: formOneOf(fd, 'roof_type', 'Roof type', ROOF_TYPES, before?.roof_type),
    sqft: formWhole(fd, 'sqft', 'Square feet', 10_000_000),
    seams: formWhole(fd, 'seams', 'Seams', 1_000_000),
    color: formOneOf(fd, 'color', 'Color', ROOF_COLORS, before?.color),
    site: parseSite(fd),
    source: formOneOf(fd, 'source', 'Source', PROJECT_SOURCES, before?.source),
    value: formMoney(fd, 'value', 'Value'),
    expected_close: formDate(fd, 'expected_close', 'Expected close'),
    notes: formText(fd, 'notes', 'Notes', 4000),
  }
}

/** A team member from the form, or null. `current` is kept even when their access is off or they've left the team. */
function teamMemberOrNull(fd: FormData, key: string, team: TeamMember[], label: string, current?: string | null): string | null {
  const v = typeof fd.get(key) === 'string' ? (fd.get(key) as string).trim() : ''
  if (!v) return null
  if (current && v === current) return v
  if (!team.some((m) => m.pro_user_id === v)) throw new FormError(`Pick a ${label.toLowerCase()} on your team.`)
  return v
}

/**
 * The project's customer from the form: an existing one the viewer can see, a
 * new one (customer_mode=new, added after every other field checks out), or
 * none. Returns a function that does the adding, so nothing is written until
 * the whole form is valid.
 */
async function parseCustomerChoice(
  viewer: ContractorViewer,
  fd: FormData,
  site: ProjectSite | null,
  assignedTo: string | null,
  current?: string | null,
): Promise<{ id: string | null; name: string | null; create?: () => Promise<{ id: string; name: string }> }> {
  const mode = fd.get('customer_mode')
  if (mode === 'new') {
    if (!can(viewer.role, 'customers.edit')) throw new FormError('Your role can’t add customers. Pick an existing customer instead.')
    const input = parseCustomerInput(fd, 'customer_')
    const withTown = { ...input, city: input.city ?? site?.city ?? null, state: input.state ?? site?.state ?? null, zip: input.zip ?? site?.zip ?? null }
    return {
      id: null,
      name: input.name,
      create: async () => {
        const row = await insertCustomer(viewer, withTown, assignedTo)
        return { id: row.id, name: row.name }
      },
    }
  }
  const id = typeof fd.get('customer_id') === 'string' ? (fd.get('customer_id') as string).trim() : ''
  if (mode === 'none' || !id) return { id: null, name: null }
  // Keeping the project's current customer is fine even when it's on someone else's list.
  if (current && id === current) return { id, name: null }
  const customer = await getCustomer(viewer, id)
  if (!customer) throw new FormError('Pick a customer from the list.')
  return { id: customer.id, name: customer.name }
}

/** New project, from /portal/projects/new/. Opens the project when it's saved. */
export async function createProject(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let id: string
  try {
    const team = await activeTeam(viewer.contractor.id)
    const fields = parseProjectFields(fd)
    const assignedTo = resolveAssignee(viewer, fd, 'assigned_to', team, viewer.hasAccount ? viewer.proUserId : null)
    const typedName = formText(fd, 'name', 'Project name', 160)
    const choice = await parseCustomerChoice(viewer, fd, fields.site, assignedTo)
    const customer = choice.create ? await choice.create() : choice.id ? { id: choice.id, name: choice.name! } : null
    const name = typedName ?? `${customer?.name ?? 'New project'}: ${fields.roof_type ?? 'roof'}`.slice(0, 160)

    const now = new Date().toISOString()
    const { data, error } = await createAdminClient()
      .from('contractor_projects')
      .insert({
        ...fields,
        contractor_id: viewer.contractor.id,
        customer_id: customer?.id ?? null,
        name,
        stage: 'lead',
        assigned_to: assignedTo,
        created_by: viewer.hasAccount ? viewer.proUserId : null,
        created_at: now,
        updated_at: now,
      })
      .select('id')
      .single()
    if (error || !data) throw new Error(`contractor_projects insert: ${error?.message ?? 'no row'}`)
    id = data.id as string
    await logActivity(viewer, {
      entity: 'projects',
      entityId: id,
      action: 'create',
      summary: customer ? `Created project “${name}” for ${customer.name}` : `Created project “${name}”`,
    })
  } catch (err) {
    return failed(err)
  }
  revalidatePath('/portal', 'layout')
  redirect(`/portal/projects/${id}/`)
}

async function loadForWrite(viewer: ContractorViewer, fd: FormData): Promise<ProjectRow> {
  const id = fd.get('id')
  const row = typeof id === 'string' ? await getProjectRow(viewer, id) : null
  if (!row) throw new FormError('That project isn’t available any more. Reload the page.')
  return row
}

async function writeProject(viewer: ContractorViewer, id: string, patch: Partial<ProjectRow>): Promise<void> {
  const { data, error } = await createAdminClient()
    .from('contractor_projects')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('contractor_id', viewer.contractor.id)
    .select('id')
  if (error) throw new Error(`contractor_projects update: ${error.message}`)
  if (!data?.length) throw new FormError('That project isn’t available any more. Reload the page.')
}

/** Edit details on the project page. */
export async function updateProject(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const before = await loadForWrite(viewer, fd)
    const team = await activeTeam(viewer.contractor.id)
    const fields = parseProjectFields(fd, before)
    // Sales reps can't hand their projects to someone else.
    const assignedTo = can(viewer.role, 'sales.view_all') ? resolveAssignee(viewer, fd, 'assigned_to', team, before.assigned_to, before.assigned_to) : before.assigned_to
    const name = formText(fd, 'name', 'Project name', 160, true)!
    const choice = await parseCustomerChoice(viewer, fd, fields.site, assignedTo, before.customer_id)
    const customerId = choice.create ? (await choice.create()).id : choice.id

    const patch: Partial<ProjectRow> = {
      ...fields,
      name,
      customer_id: customerId,
      assigned_to: assignedTo,
      ops_lead_id: fd.has('ops_lead_id') ? teamMemberOrNull(fd, 'ops_lead_id', team, 'Operations lead', before.ops_lead_id) : before.ops_lead_id,
      crew: formText(fd, 'crew', 'Crew', 120),
      start_date: formDate(fd, 'start_date', 'Start date'),
    }
    const changes = diff({ ...before, site: canonicalSite(before.site) } as unknown as Record<string, unknown>, patch as Record<string, unknown>)
    if (!Object.keys(changes).length) return { ok: true, message: 'Nothing changed.' }
    await writeProject(viewer, before.id, patch)
    await logActivity(viewer, { entity: 'projects', entityId: before.id, action: 'update', summary: `Updated “${name}”`, changes })
  } catch (err) {
    return failed(err)
  }
  revalidatePath('/portal', 'layout')
  return { ok: true, message: 'Saved.' }
}

/**
 * Moves a project to another stage (fields: id, stage). Installing starts the
 * crew on Clean & prep and sets the start date if they're empty; Complete
 * records today as the completion date (cleared if it's moved back).
 */
export async function moveProjectStage(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  let message = ''
  try {
    const before = await loadForWrite(viewer, fd)
    const stage = formOneOf(fd, 'stage', 'Stage', PROJECT_STAGES)
    if (!stage) throw new FormError('Pick a stage.')
    if (stage === before.stage) return { ok: true }

    const patch: Partial<ProjectRow> = { stage }
    if (stage === 'in_progress') {
      if (!before.install_step) patch.install_step = 'clean_prep'
      if (!before.start_date) patch.start_date = today()
    }
    if (stage === 'complete') patch.completed_on = today()
    else if (before.completed_on) patch.completed_on = null

    await writeProject(viewer, before.id, patch)
    const summary =
      stage === 'lost'
        ? `Marked “${before.name}” lost`
        : before.stage === 'lost'
          ? `Reopened “${before.name}” as ${PROJECT_STAGE_LABEL[stage]}`
          : `Moved “${before.name}” to ${PROJECT_STAGE_LABEL[stage]}`
    await logActivity(viewer, { entity: 'projects', entityId: before.id, action: 'update', summary, changes: diff(before as unknown as Record<string, unknown>, patch as Record<string, unknown>) })
    message = summary
  } catch (err) {
    return failed(err)
  }
  revalidatePath('/portal', 'layout')
  return { ok: true, message }
}

/** Where the crew is on an installing project (fields: id, install_step). */
export async function setInstallStep(_prev: PortalResult | null, fd: FormData): Promise<PortalResult> {
  const g = await portalAction('projects.edit')
  if (!g.ok) return g
  const viewer = g.viewer
  try {
    const before = await loadForWrite(viewer, fd)
    if (before.stage !== 'in_progress') throw new FormError('Move the project to Installing first.')
    const step = formOneOf(fd, 'install_step', 'Install step', INSTALL_STEPS)
    if (!step) throw new FormError('Pick an install step.')
    if (step === before.install_step) return { ok: true }
    await writeProject(viewer, before.id, { install_step: step })
    await logActivity(viewer, {
      entity: 'projects',
      entityId: before.id,
      action: 'update',
      summary: `“${before.name}”: crew on ${INSTALL_STEP_LABEL[step]}`,
      changes: { install_step: [before.install_step, step] },
    })
  } catch (err) {
    return failed(err)
  }
  revalidatePath('/portal', 'layout')
  return { ok: true }
}
