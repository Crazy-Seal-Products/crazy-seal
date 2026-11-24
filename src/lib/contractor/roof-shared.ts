// Roofs in the contractor portal (Thermo's roof-asset platform, tables in
// supabase/migrations/037_roof_platform.sql): the lists, labels, colors and
// pure helpers the Roofs pages share, and the records they're sent. Plain
// module: safe to import from client components. Reads are in roofs.ts,
// writes in roof-actions.ts.

import type { CustomerOption } from './customers'
import type { TeamOption } from './projects'

/* ------------------------------------------------------------------ lists */

export const INSPECTION_KINDS = ['Routine', 'Leak response', 'Pre-job', 'Closeout', 'Warranty'] as const
export type InspectionKind = (typeof INSPECTION_KINDS)[number]

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const
export type Severity = (typeof SEVERITIES)[number]

export const DEFICIENCY_STATUSES = ['open', 'scoped', 'scheduled', 'resolved', 'monitor'] as const
export type DeficiencyStatus = (typeof DEFICIENCY_STATUSES)[number]

export const ESTIMATE_SCENARIOS = ['repair', 'restore', 'replace'] as const
export type EstimateScenario = (typeof ESTIMATE_SCENARIOS)[number]

export const ESTIMATE_STATUSES = ['draft', 'sent', 'approved', 'declined'] as const
export type EstimateStatus = (typeof ESTIMATE_STATUSES)[number]

export const PLAN_ACTIONS = ['Inspect', 'Maintain', 'Repair', 'Restore', 'Replace', 'Monitor'] as const
export type PlanAction = (typeof PLAN_ACTIONS)[number]

export const PLAN_STATUSES = ['proposed', 'approved', 'funded', 'done', 'deferred'] as const
export type PlanStatus = (typeof PLAN_STATUSES)[number]

export const DOCUMENT_KINDS = ['Warranty', 'Inspection report', 'Photo set', 'Spec', 'Invoice', 'Other'] as const
export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

export const ROOF_SLOPES = ['Low slope', 'Steep slope'] as const
export const ROOF_DECKS = ['Steel', 'Concrete', 'Wood', 'Gypsum', 'Unknown'] as const

/** What's on the roof now: a Crazy Seal system, or the roof as it was built. */
export const ROOF_SYSTEMS = [
  'Crazy Seal commercial roof system',
  'Crazy Seal residential roof system',
  'Crazy Seal RV Roof System',
  'Original roof (no Crazy Seal yet)',
  'Other system',
] as const

/* ----------------------------------------------------------------- labels */

export const SEVERITY_LABEL: Record<Severity, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }

export const SEVERITY_HELP: Record<Severity, string> = {
  critical: 'Water is getting in or damage is spreading. Fix right away.',
  high: 'Likely to leak or get worse soon. Fix within weeks.',
  medium: 'Wear that should be repaired at the next visit.',
  low: 'Minor. Keep an eye on it and fix it alongside other work.',
}

export const DEFICIENCY_STATUS_LABEL: Record<DeficiencyStatus, string> = {
  open: 'Open',
  scoped: 'In an estimate',
  scheduled: 'Scheduled',
  resolved: 'Resolved',
  monitor: 'Monitoring',
}

export const SCENARIO_LABEL: Record<EstimateScenario, string> = { repair: 'Repair', restore: 'Restore', replace: 'Replace' }

export const SCENARIO_ASSUMPTIONS: Record<EstimateScenario, string> = {
  repair: 'Targeted repairs at the listed problems, tied into the roof’s restoration plan.',
  restore: 'Clean, repair and restore with the Crazy Seal system over the existing roof. No tear-off; the repairs become part of the new roof.',
  replace: 'Tear-off to the deck, new insulation where it’s wet, new roof.',
}

/** How long each scenario buys, for the comparison. */
export const SCENARIO_LIFE: Record<EstimateScenario, { life: string; note: string }> = {
  repair: { life: 'Buys 2–5 years', note: 'Stops today’s leaks at the listed problems. Best paired with a planned restoration so the repair isn’t wasted.' },
  restore: {
    life: 'Adds 15–20+ years',
    note: 'Crazy Seal over the existing roof, backed by its warranty. No tear-off, and the repairs become part of the new roof.',
  },
  replace: { life: '20–30 years', note: 'Full tear-off and a new roof. The highest cost and disruption; right when the deck or insulation is soaked.' },
}

export const ESTIMATE_STATUS_LABEL: Record<EstimateStatus, string> = { draft: 'Draft', sent: 'Awaiting approval', approved: 'Approved', declined: 'Declined' }

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  proposed: 'Proposed',
  approved: 'Approved',
  funded: 'Funded',
  done: 'Done',
  deferred: 'Deferred',
}

/** A plan item's next step in the usual flow. */
export const PLAN_NEXT: Partial<Record<PlanStatus, PlanStatus>> = { proposed: 'approved', approved: 'funded', funded: 'done' }

/* ------------------------------------------------------------- condition */

export const CONDITIONS = ['good', 'fair', 'poor', 'critical'] as const
export type Condition = (typeof CONDITIONS)[number]

export const CONDITION_LABEL: Record<Condition, string> = { good: 'Good', fair: 'Fair', poor: 'Poor', critical: 'Critical' }

export const CONDITION_HELP: Record<Condition, string> = {
  good: 'Sound roof. Keep up routine inspections and maintenance.',
  fair: 'Wear is showing. Plan repairs or a restoration within a few years.',
  poor: 'Active problems. Repair soon and budget for a restoration.',
  critical: 'Failing or leaking. Needs work now to protect the building.',
}

export const CONDITION_SCALE = 'Condition score, 0 to 100, from the latest inspection: 80 and up is good, 60–79 fair, 40–59 poor, under 40 critical.'

const RED = '#FF7A6B'
const ORANGE = '#FF9F45'
const SKY = '#4CC3FF'

export const CONDITION_COLOR: Record<Condition, string> = {
  good: 'var(--p-primary, #6DC015)',
  fair: 'var(--p-accent, #F9EA1C)',
  poor: ORANGE,
  critical: RED,
}

export const SEVERITY_COLOR: Record<Severity, string> = { critical: RED, high: ORANGE, medium: 'var(--p-accent, #F9EA1C)', low: SKY }

export const NO_SCORE_COLOR = 'rgba(255,255,255,0.28)'

export function conditionOf(score: number): Condition {
  return score >= 80 ? 'good' : score >= 60 ? 'fair' : score >= 40 ? 'poor' : 'critical'
}

/** A deficiency that still needs something done (not resolved, not just being watched). */
export function isOpenDeficiency(d: { status: DeficiencyStatus }): boolean {
  return d.status !== 'resolved' && d.status !== 'monitor'
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }
export function bySeverity(a: { severity: Severity }, b: { severity: Severity }): number {
  return SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
}

/* ------------------------------------------------------------- estimates */

/**
 * Thermo's suggested price for a scenario (editable in the form): a repair is
 * $18 a square foot of the repair area plus $2,500 to mobilize; a restore
 * $3.10 and a replacement $10.50 a square foot of the whole roof.
 */
export function suggestedAmount(scenario: EstimateScenario, repairArea: number, roofArea: number): number {
  if (scenario === 'repair') return Math.round(Math.max(0, repairArea) * 18 + 2500)
  if (scenario === 'replace') return Math.round(Math.max(0, roofArea) * 10.5)
  return Math.round(Math.max(0, roofArea) * 3.1)
}

/** The repair area to suggest from: 8% of the roof, at least 100 sq ft. */
export function defaultRepairArea(roofArea: number | null | undefined): number {
  return Math.max(100, Math.round((roofArea ?? 0) * 0.08))
}

/** A plan item's suggested cost for an action, from the roof's area (Thermo's planning ranges, midpoint). */
export function suggestedPlanCost(action: PlanAction, roofArea: number | null | undefined): number {
  const area = Math.max(0, roofArea ?? 0)
  switch (action) {
    case 'Inspect':
      return 1200
    case 'Monitor':
      return 250
    case 'Maintain':
      return Math.round(area * 0.11)
    case 'Repair':
      return suggestedAmount('repair', defaultRepairArea(area), area)
    case 'Restore':
      return suggestedAmount('restore', 0, area)
    case 'Replace':
      return suggestedAmount('replace', 0, area)
  }
}

/* --------------------------------------------------------------- formats */

/** "184k sq ft", "12,500 sq ft". */
export function sqftLabel(n: number | null | undefined): string {
  if (!n) return '—'
  return `${n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 10_000 ? `${Math.round(n / 1000)}k` : n.toLocaleString('en-US')} sq ft`
}

/** "$1.2M", "$48k", "$950". */
export function compactMoney(n: number): string {
  return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n).toLocaleString('en-US')}`
}

/** "Dec 4, 2026" from a YYYY-MM-DD date column, without a time-zone shift. */
export function dayLong(d: string | null | undefined): string {
  if (!d) return '—'
  const [y, m, day] = d.slice(0, 10).split('-').map(Number)
  if (!y || !m || !day) return '—'
  return new Date(Date.UTC(y, m - 1, day, 12)).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })
}

/** Days from `today` (YYYY-MM-DD) to `d`; negative when it's past. */
export function daysFrom(today: string, d: string | null | undefined): number | null {
  if (!d) return null
  const a = Date.parse(`${today.slice(0, 10)}T12:00:00Z`)
  const b = Date.parse(`${d.slice(0, 10)}T12:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return Math.round((b - a) / 86_400_000)
}

/** YYYY-MM-DD a number of days (or years) after `day`. */
export function addDays(day: string, days: number): string {
  const t = Date.parse(`${day.slice(0, 10)}T12:00:00Z`) + days * 86_400_000
  return new Date(t).toISOString().slice(0, 10)
}

export function addYears(day: string, years: number): string {
  const [y, m, d] = day.slice(0, 10).split('-').map(Number)
  // Feb 29 becomes Feb 28 in a year without one.
  const date = new Date(Date.UTC(y + years, m - 1, m === 2 && d === 29 ? 28 : d, 12))
  return date.toISOString().slice(0, 10)
}

/** "24.3 MB", "860 KB". */
export function fileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes < 0) return '—'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const mb = bytes / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

/* ------------------------------------------------------------- documents */

/** Documents can be up to 100 MB. */
export const DOC_MAX_BYTES = 100 * 1024 * 1024

const DOC_EXT: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv',
  txt: 'text/plain',
  zip: 'application/zip',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
}

/** For file inputs. */
export const DOC_ACCEPT = Object.keys(DOC_EXT)
  .map((e) => `.${e}`)
  .join(',')

/** The Content-Type to store a document with (by its extension), or null when it isn't a kind we take. */
export function docContentType(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
  return DOC_EXT[ext] ?? null
}

/** Why a file can't be uploaded as a document, or null when it can. */
export function docProblem(fileName: string, bytes: number): string | null {
  if (!docContentType(fileName)) return `${fileName} isn’t a file we can keep (PDF, photo, Word, Excel, PowerPoint, CSV, text, ZIP or video).`
  if (!(bytes > 0)) return `${fileName} is empty.`
  if (bytes > DOC_MAX_BYTES) return `${fileName} is ${fileSize(bytes)}. Documents can be up to ${fileSize(DOC_MAX_BYTES)}.`
  return null
}

/** "Roof survey" from "Roof survey.pdf". */
export function titleFromFile(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').trim()
  return (base || fileName).slice(0, 200)
}

/* ------------------------------------------------------------------ records */

/** A building, with its owner's name. */
export interface FacilityItem {
  id: string
  customer_id: string | null
  customer_name: string | null
  name: string
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  notes: string | null
  assigned_to: string | null
  owner_name: string | null
  created_at: string
  /** The viewer may edit it (a sales rep sees a building only through one of their roofs otherwise). */
  editable: boolean
}

export interface RoofItem {
  id: string
  facility_id: string
  facility_name: string
  customer_id: string | null
  customer_name: string | null
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
  owner_name: string | null
  open_deficiencies: number
  created_at: string
  updated_at: string
}

export interface InspectionItem {
  id: string
  roof_asset_id: string
  kind: InspectionKind
  inspected_on: string
  inspector_id: string | null
  inspector_name: string | null
  condition_score: number | null
  summary: string | null
  created_at: string
}

export interface DeficiencyItem {
  id: string
  roof_asset_id: string
  inspection_id: string | null
  title: string
  location: string | null
  severity: Severity
  status: DeficiencyStatus
  est_cost: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

/** The Crazy Seal materials quote linked to an estimate. */
export interface LinkedQuote {
  id: string
  number: string
  status: string
  total: number
  /** The viewer may open it (a sales rep: only quotes they made). */
  visible: boolean
}

export interface EstimateItem {
  id: string
  roof_asset_id: string
  number: string
  scenario: EstimateScenario
  amount: number
  status: EstimateStatus
  deficiency_ids: string[]
  budget_year: number | null
  assumptions: string | null
  quote_id: string | null
  quote: LinkedQuote | null
  approved_at: string | null
  approval_note: string | null
  assigned_to: string | null
  owner_name: string | null
  created_at: string
  updated_at: string
}

export interface PlanItem {
  id: string
  roof_asset_id: string
  year: number
  action: PlanAction
  est_cost: number
  status: PlanStatus
  notes: string | null
  created_at: string
}

export interface DocumentItem {
  id: string
  facility_id: string | null
  roof_asset_id: string | null
  project_id: string | null
  project_name: string | null
  title: string
  kind: DocumentKind
  url: string
  mime: string | null
  bytes: number | null
  uploaded_by: string | null
  uploader_name: string | null
  created_at: string
}

/** Everything the Roofs pages show, for the roofs the viewer can see. Lists a page didn't ask for are empty. */
export interface RoofWorkspace {
  /** YYYY-MM-DD in store time, for overdue and due-soon. */
  today: string
  year: number
  facilities: FacilityItem[]
  roofs: RoofItem[]
  inspections: InspectionItem[]
  deficiencies: DeficiencyItem[]
  estimates: EstimateItem[]
  plans: PlanItem[]
  documents: DocumentItem[]
}

/** A project a roof or document can link to. */
export interface RoofProjectOption {
  id: string
  name: string
  stage: string
  sqft: number | null
}

/** A warranty registration a roof can link to. */
export interface RoofWarrantyOption {
  id: string
  name: string
  status: string
  created_at: string | null
}

/** Pickers for the Roofs forms (empty when the viewer can't edit). */
export interface RoofFormOptions {
  customers: CustomerOption[]
  team: TeamOption[]
  projects: RoofProjectOption[]
  warranties: RoofWarrantyOption[]
  /** The signed-in member: default assignee and inspector. */
  me: string | null
}

/** What the viewer may do on the Roofs pages. */
export interface RoofPerms {
  /** Add and change buildings, roofs, inspections, estimates, plans, documents (roofs.edit, not View as). */
  edit: boolean
  /** Pick who a building, roof or estimate is assigned to (sales.view_all). */
  assign: boolean
  /** Add a customer from the building form (customers.edit). */
  addCustomer: boolean
  /** Open the quote builder (quotes.create, not View as). */
  quotes: boolean
  /** Open projects (projects.view). */
  projects: boolean
  /** See warranty registrations (warranties.view). */
  warranties: boolean
  /** Open customers (customers.view). */
  customers: boolean
}

/* --------------------------------------------------------------- helpers */

/** "Northpoint DC · Main roof" */
export function roofLabel(roof: Pick<RoofItem, 'facility_name' | 'name'> | null | undefined): string {
  if (!roof) return '—'
  return `${roof.facility_name} · ${roof.name}`
}

/** "12 Oak St, Austin, TX 78701", or ''. */
export function addressLine(f: Pick<FacilityItem, 'street' | 'city' | 'state' | 'zip'> | null | undefined): string {
  if (!f) return ''
  const stateZip = [f.state, f.zip].filter(Boolean).join(' ')
  return [f.street, f.city, stateZip].filter(Boolean).join(', ')
}

/** The average condition score of the scored roofs, or null when none has been inspected. */
export function averageScore(roofs: Pick<RoofItem, 'condition_score'>[]): number | null {
  const scored = roofs.map((r) => r.condition_score).filter((s): s is number => typeof s === 'number')
  return scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null
}

/** The soonest next inspection date among roofs, or null. */
export function nextInspection(roofs: Pick<RoofItem, 'next_inspection_on'>[]): string | null {
  return (
    roofs
      .map((r) => r.next_inspection_on)
      .filter((d): d is string => Boolean(d))
      .sort()[0] ?? null
  )
}

/** "Due in 12 days", "Overdue by 3 days", "Due today". */
export function dueLabel(today: string, d: string | null | undefined): string {
  const n = daysFrom(today, d)
  if (n === null) return 'Not scheduled'
  if (n === 0) return 'Due today'
  if (n < 0) return `Overdue by ${-n} day${n === -1 ? '' : 's'}`
  return `Due in ${n} day${n === 1 ? '' : 's'}`
}

/** CSV text from a header and rows (RFC 4180 quoting). */
export function toCsv(head: string[], rows: unknown[][]): string {
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  return [head, ...rows].map((r) => r.map(esc).join(',')).join('\n')
}
