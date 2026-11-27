'use client'

import { startTransition, useActionState, useId, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { FileUp, Loader2, Plus, Save, Trash2, UploadCloud, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalResult } from '@/lib/contractor/guard'
import {
  deletePlanItem,
  deleteRoofDocument,
  finishRoofDocumentUpload,
  recordInspection,
  saveDeficiency,
  saveEstimate,
  saveFacility,
  savePlanItem,
  saveRoof,
  startRoofDocumentUpload,
  updateRoofDocument,
} from '@/lib/contractor/roof-actions'
import {
  CONDITION_COLOR,
  CONDITION_LABEL,
  DEFICIENCY_STATUS_LABEL,
  DEFICIENCY_STATUSES,
  DOC_ACCEPT,
  DOCUMENT_KINDS,
  ESTIMATE_SCENARIOS,
  INSPECTION_KINDS,
  PLAN_ACTIONS,
  PLAN_STATUS_LABEL,
  PLAN_STATUSES,
  ROOF_DECKS,
  ROOF_SLOPES,
  ROOF_SYSTEMS,
  SCENARIO_ASSUMPTIONS,
  SCENARIO_LABEL,
  SEVERITIES,
  SEVERITY_LABEL,
  addYears,
  conditionOf,
  defaultRepairArea,
  docContentType,
  docProblem,
  fileSize,
  isOpenDeficiency,
  roofLabel,
  suggestedAmount,
  suggestedPlanCost,
  titleFromFile,
  type DeficiencyItem,
  type DocumentItem,
  type DocumentKind,
  type EstimateItem,
  type EstimateScenario,
  type FacilityItem,
  type PlanAction,
  type PlanItem,
  type RoofFormOptions,
  type RoofItem,
  type RoofPerms,
  type RoofProjectOption,
} from '@/lib/contractor/roof-shared'
import { CUSTOMER_TYPES, ROOF_TYPES } from '@/lib/contractor/types'
import { money0 } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'
import { Field, FormNotice, OPTION_STYLE, teamFor, withCurrent } from '../projects/kit'
import { RunButton, ScoreRing, SeverityBadge } from './roof-kit'

/**
 * The Roofs forms (each shown in the portal's Modal): building, roof,
 * inspection with the problems found, problem, estimate, plan item, and a
 * document's upload and details. Each posts to a server action in
 * src/lib/contractor/roof-actions.ts and keeps what was typed when it comes
 * back with an error.
 */

type FormAction = (prev: PortalResult | null, fd: FormData) => Promise<PortalResult>

/** A server action as a form submit handler that keeps the fields on an error. */
function useSave(action: FormAction, onDone?: (r: PortalResult) => void) {
  const [state, formAction, pending] = useActionState<PortalResult | null, FormData>(async (prev, fd) => {
    const r = await action(prev, fd)
    if (r.ok) onDone?.(r)
    return r
  }, null)
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(() => formAction(fd))
  }
  return { state, onSubmit, pending }
}

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <fieldset className={twMerge('grid grid-cols-1 gap-3.5 sm:grid-cols-2', className)}>
      <legend className="mb-3 flex w-full items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--p-kicker,#F9EA1C)]">
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-[var(--p-line,rgba(255,255,255,0.1))] to-transparent" />
      </legend>
      {children}
    </fieldset>
  )
}

function Footer({
  state,
  pending,
  label,
  onCancel,
  icon,
  extra,
  disabled,
}: {
  state: PortalResult | null
  pending: boolean
  label: string
  onCancel?: () => void
  icon?: ReactNode
  extra?: ReactNode
  disabled?: boolean
}) {
  return (
    <div className="space-y-3 pt-1">
      <FormNotice state={state && !state.ok ? state : null} />
      <div className="flex flex-wrap items-center justify-end gap-2">
        {extra && <div className="mr-auto">{extra}</div>}
        {onCancel && (
          <button type="button" onClick={onCancel} className={portalGhostButton}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={pending || disabled} className={portalButton}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : (icon ?? <Save className="h-4 w-4" />)}
          {label}
        </button>
      </div>
    </div>
  )
}

function Options({ items, current, none }: { items: readonly string[]; current?: string | null; none?: string }) {
  return (
    <>
      {none !== undefined && (
        <option value="" style={OPTION_STYLE}>
          {none}
        </option>
      )}
      {withCurrent(items, current).map((v) => (
        <option key={v} value={v} style={OPTION_STYLE}>
          {v}
        </option>
      ))}
    </>
  )
}

/** Roofs for a picker, by building and name. */
function sortedRoofs(roofs: RoofItem[]): RoofItem[] {
  return [...roofs].sort((a, b) => roofLabel(a).localeCompare(roofLabel(b)))
}

function RoofPicker({ roofs, value, onChange, name = 'roof_id', label = 'Roof', disabled }: { roofs: RoofItem[]; value: string; onChange: (id: string) => void; name?: string; label?: string; disabled?: boolean }) {
  return (
    <Field label={label} className="sm:col-span-2">
      <select name={name} value={value} onChange={(e) => onChange(e.target.value)} required disabled={disabled} className={portalInput}>
        <option value="" disabled style={OPTION_STYLE}>
          {roofs.length ? 'Pick a roof' : 'No roofs yet'}
        </option>
        {sortedRoofs(roofs).map((r) => (
          <option key={r.id} value={r.id} style={OPTION_STYLE}>
            {roofLabel(r)} · {r.tag}
          </option>
        ))}
      </select>
      {/* A disabled select isn't sent: keep the fixed roof in the form. */}
      {disabled && <input type="hidden" name={name} value={value} />}
    </Field>
  )
}

/** A segmented picker for a handful of choices. */
function Segment<T extends string>({ value, onChange, options, id }: { value: T; onChange: (v: T) => void; options: { key: T; label: string }[]; id: string }) {
  return (
    <div className="inline-flex w-fit flex-wrap gap-1 rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {options.map((m) => {
        const on = value === m.key
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            aria-pressed={on}
            className={twMerge(
              'relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300',
              on ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
            )}
          >
            {on && (
              <motion.span
                layoutId={`segment-${id}`}
                className="absolute inset-0 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}

function AssigneeField({ options, current, defaultValue, label = 'Assigned to' }: { options: RoofFormOptions; current?: string | null; defaultValue: string; label?: string }) {
  return (
    <Field label={label}>
      <select name="assigned_to" defaultValue={defaultValue} className={portalInput}>
        <option value="" style={OPTION_STYLE}>
          Unassigned
        </option>
        {teamFor(options.team, current).map((m) => (
          <option key={m.id} value={m.id} style={OPTION_STYLE}>
            {m.name} · {m.role}
          </option>
        ))}
      </select>
    </Field>
  )
}

/* ============================================================= building */

type OwnerMode = 'existing' | 'new' | 'none'

export function FacilityForm({
  facility,
  options,
  perms,
  onDone,
  onCancel,
}: {
  facility?: FacilityItem
  options: RoofFormOptions
  perms: RoofPerms
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(saveFacility, onDone)
  const formId = useId()
  const customers =
    facility?.customer_id && !options.customers.some((c) => c.id === facility.customer_id)
      ? [{ id: facility.customer_id, name: facility.customer_name ?? 'Customer', detail: '' }, ...options.customers]
      : options.customers
  const [mode, setMode] = useState<OwnerMode>(facility ? (facility.customer_id ? 'existing' : 'none') : customers.length || !perms.addCustomer ? 'existing' : 'new')
  const modes: { key: OwnerMode; label: string }[] = [
    { key: 'existing', label: 'Existing customer' },
    ...(perms.addCustomer ? [{ key: 'new' as const, label: 'New customer' }] : []),
    { key: 'none', label: 'No owner yet' },
  ]

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {facility && <input type="hidden" name="id" value={facility.id} />}
      <input type="hidden" name="customer_mode" value={mode} />

      <Section title="Owner">
        <div className="sm:col-span-2">
          <Segment id={`owner-${formId}`} value={mode} onChange={setMode} options={modes} />
        </div>
        {mode === 'existing' && (
          <Field label="Customer" className="sm:col-span-2" hint="The customer who owns or manages the building.">
            <select name="customer_id" defaultValue={facility?.customer_id ?? ''} required className={portalInput}>
              <option value="" disabled style={OPTION_STYLE}>
                {customers.length ? 'Pick a customer' : 'No customers yet'}
              </option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} style={OPTION_STYLE}>
                  {c.detail ? `${c.name} · ${c.detail}` : c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {mode === 'new' && (
          <>
            <Field label="Customer name *">
              <input name="customer_name" required maxLength={160} className={portalInput} />
            </Field>
            <Field label="Type">
              <select name="customer_type" defaultValue="Building owner" className={portalInput}>
                <Options items={CUSTOMER_TYPES} />
              </select>
            </Field>
            <Field label="Contact name">
              <input name="customer_contact_name" maxLength={120} className={portalInput} />
            </Field>
            <Field label="Email">
              <input name="customer_email" type="email" maxLength={200} className={portalInput} />
            </Field>
            <Field label="Phone">
              <input name="customer_phone" type="tel" maxLength={40} className={portalInput} />
            </Field>
          </>
        )}
      </Section>

      <Section title="Building">
        <Field label="Building name *" className="sm:col-span-2">
          <input name="name" required maxLength={160} defaultValue={facility?.name ?? ''} placeholder="e.g. Northpoint Distribution Center" className={portalInput} />
        </Field>
        <Field label="Street" className="sm:col-span-2">
          <input name="street" maxLength={200} defaultValue={facility?.street ?? ''} autoComplete="street-address" className={portalInput} />
        </Field>
        <Field label="City">
          <input name="city" maxLength={100} defaultValue={facility?.city ?? ''} autoComplete="address-level2" className={portalInput} />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="State">
            <input name="state" maxLength={40} defaultValue={facility?.state ?? ''} autoComplete="address-level1" className={portalInput} />
          </Field>
          <Field label="ZIP">
            <input name="zip" maxLength={20} defaultValue={facility?.zip ?? ''} autoComplete="postal-code" className={portalInput} />
          </Field>
        </div>
        {perms.assign ? <AssigneeField options={options} current={facility?.assigned_to} defaultValue={facility ? (facility.assigned_to ?? '') : (options.me ?? '')} /> : null}
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={3} maxLength={4000} defaultValue={facility?.notes ?? ''} placeholder="Access, contacts on site, hours…" className={portalInput} />
        </Field>
      </Section>

      <Footer state={state} pending={pending} label={facility ? 'Save building' : 'Add building'} onCancel={onCancel} />
    </form>
  )
}

/* ================================================================= roof */

export function RoofForm({
  roof,
  facilities,
  options,
  perms,
  defaultFacilityId,
  onDone,
  onCancel,
}: {
  roof?: RoofItem
  /** Buildings the roof can go on. */
  facilities: FacilityItem[]
  options: RoofFormOptions
  perms: RoofPerms
  defaultFacilityId?: string
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(saveRoof, onDone)
  const choices = roof && !facilities.some((f) => f.id === roof.facility_id) ? [{ id: roof.facility_id, name: roof.facility_name, customer_name: roof.customer_name }, ...facilities] : facilities
  const initialFacility = roof?.facility_id ?? (defaultFacilityId && choices.some((f) => f.id === defaultFacilityId) ? defaultFacilityId : (choices[0]?.id ?? ''))
  const projects: RoofProjectOption[] =
    roof?.project_id && !options.projects.some((p) => p.id === roof.project_id) ? [{ id: roof.project_id, name: 'Current project', stage: '', sqft: null }, ...options.projects] : options.projects
  const warranties =
    roof?.warranty_registration_id && !options.warranties.some((w) => w.id === roof.warranty_registration_id)
      ? [{ id: roof.warranty_registration_id, name: 'Current registration', status: '', created_at: null }, ...options.warranties]
      : options.warranties

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {roof && <input type="hidden" name="id" value={roof.id} />}
      <Section title="Roof">
        <Field label="Building *" className="sm:col-span-2">
          <select name="facility_id" defaultValue={initialFacility} required className={portalInput}>
            <option value="" disabled style={OPTION_STYLE}>
              {choices.length ? 'Pick a building' : 'Add a building first'}
            </option>
            {choices.map((f) => (
              <option key={f.id} value={f.id} style={OPTION_STYLE}>
                {f.customer_name ? `${f.name} · ${f.customer_name}` : f.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Roof name *" hint="The section, when a building has more than one.">
          <input name="name" required maxLength={160} defaultValue={roof?.name ?? 'Main roof'} className={portalInput} />
        </Field>
        <Field label="Asset tag" hint={roof ? undefined : 'Leave blank to number it for you (R-1001…).'}>
          <input name="tag" maxLength={40} defaultValue={roof?.tag ?? ''} placeholder={roof ? undefined : 'Automatic'} className={twMerge(portalInput, 'font-mono')} />
        </Field>
        <Field label="Roof type">
          <select name="roof_type" defaultValue={roof?.roof_type ?? ''} className={portalInput}>
            <Options items={ROOF_TYPES} current={roof?.roof_type} none="Not sure yet" />
          </select>
        </Field>
        <Field label="System on it now">
          <select name="system" defaultValue={roof?.system ?? ''} className={portalInput}>
            <Options items={ROOF_SYSTEMS} current={roof?.system} none="Not sure yet" />
          </select>
        </Field>
        <Field label="Roof area (sq ft)">
          <input name="area_sqft" type="number" inputMode="numeric" min={0} defaultValue={roof?.area_sqft ?? ''} className={portalInput} />
        </Field>
        <Field label="Year installed">
          <input name="year_installed" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={roof?.year_installed ?? ''} className={portalInput} />
        </Field>
        <Field label="Slope">
          <select name="slope" defaultValue={roof?.slope ?? ''} className={portalInput}>
            <Options items={ROOF_SLOPES} current={roof?.slope} none="—" />
          </select>
        </Field>
        <Field label="Deck">
          <select name="deck" defaultValue={roof?.deck ?? ''} className={portalInput}>
            <Options items={ROOF_DECKS} current={roof?.deck} none="—" />
          </select>
        </Field>
      </Section>

      <Section title="Condition & inspections">
        <Field label="Condition score (0–100)" hint="Usually set by recording an inspection. Leave blank until the first one.">
          <input name="condition_score" type="number" inputMode="numeric" min={0} max={100} defaultValue={roof?.condition_score ?? ''} className={portalInput} />
        </Field>
        <Field label="Last inspected">
          <input name="last_inspected_on" type="date" defaultValue={roof?.last_inspected_on ?? ''} className={portalInput} />
        </Field>
        <Field label="Next inspection">
          <input name="next_inspection_on" type="date" defaultValue={roof?.next_inspection_on ?? ''} className={portalInput} />
        </Field>
        {perms.assign ? <AssigneeField options={options} current={roof?.assigned_to} defaultValue={roof ? (roof.assigned_to ?? '') : (options.me ?? '')} /> : <div className="hidden sm:block" />}
      </Section>

      <Section title="Linked records">
        <Field label="Project" hint="The job that did (or will do) the work on this roof.">
          <select name="project_id" defaultValue={roof?.project_id ?? ''} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              No project
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} style={OPTION_STYLE}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        {perms.warranties ? (
          <Field label="Warranty registration">
            <select name="warranty_registration_id" defaultValue={roof?.warranty_registration_id ?? ''} className={portalInput}>
              <option value="" style={OPTION_STYLE}>
                No warranty
              </option>
              {warranties.map((w) => (
                <option key={w.id} value={w.id} style={OPTION_STYLE}>
                  {w.name}
                  {w.created_at ? ` · ${w.created_at.slice(0, 10)}` : ''}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={3} maxLength={4000} defaultValue={roof?.notes ?? ''} placeholder="Drainage, penetrations, access, history…" className={portalInput} />
        </Field>
      </Section>

      <Footer state={state} pending={pending} label={roof ? 'Save roof' : 'Add roof'} onCancel={onCancel} disabled={!choices.length} />
    </form>
  )
}

/* =========================================================== inspection */

interface ProblemRow {
  key: number
}

export function InspectionForm({
  roofs,
  fixedRoofId,
  options,
  today,
  onDone,
  onCancel,
}: {
  roofs: RoofItem[]
  fixedRoofId?: string
  options: RoofFormOptions
  today: string
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(recordInspection, onDone)
  const [roofId, setRoofId] = useState(fixedRoofId ?? '')
  const roof = roofs.find((r) => r.id === roofId)
  const [score, setScore] = useState(roof?.condition_score ?? 70)
  const [date, setDate] = useState(today)
  const [next, setNext] = useState(addYears(today, 1))
  const [nextTouched, setNextTouched] = useState(false)
  const [problems, setProblems] = useState<ProblemRow[]>([])
  const condition = conditionOf(score)
  const inspectors = teamFor(options.team, null)
  const defaultInspector = options.me && inspectors.some((m) => m.id === options.me) ? options.me : ''

  const addProblem = () => setProblems((rows) => [...rows, { key: rows.reduce((m, r) => Math.max(m, r.key), 0) + 1 }])

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <Section title="Inspection">
        <RoofPicker
          roofs={roofs}
          value={roofId}
          disabled={Boolean(fixedRoofId)}
          onChange={(id) => {
            setRoofId(id)
            const r = roofs.find((x) => x.id === id)
            if (r?.condition_score !== null && r?.condition_score !== undefined) setScore(r.condition_score)
          }}
        />
        <Field label="Type">
          <select name="kind" defaultValue="Routine" className={portalInput}>
            <Options items={INSPECTION_KINDS} />
          </select>
        </Field>
        <Field label="Inspected on">
          <input
            name="inspected_on"
            type="date"
            required
            max={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value)
              if (!nextTouched && e.target.value) setNext(addYears(e.target.value, 1))
            }}
            className={portalInput}
          />
        </Field>
        <Field label="Inspector">
          <select name="inspector_id" defaultValue={defaultInspector} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              —
            </option>
            {inspectors.map((m) => (
              <option key={m.id} value={m.id} style={OPTION_STYLE}>
                {m.name} · {m.role}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Next inspection" hint="A year out by default.">
          <input
            name="next_inspection_on"
            type="date"
            value={next}
            onChange={(e) => {
              setNext(e.target.value)
              setNextTouched(true)
            }}
            className={portalInput}
          />
        </Field>
        <div className="rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/15 p-4 sm:col-span-2">
          <div className="flex items-center gap-4">
            <ScoreRing score={score} size={60} />
            <div className="min-w-0 flex-1">
              <label htmlFor="roof-score" className="flex items-baseline justify-between gap-2 text-xs font-semibold text-[var(--p-muted,#9DA3AB)]">
                Condition score
                <span className="text-sm font-bold" style={{ color: `color-mix(in oklab, ${CONDITION_COLOR[condition]} 85%, white)` }}>
                  {score} · {CONDITION_LABEL[condition]}
                </span>
              </label>
              <input
                id="roof-score"
                name="condition_score"
                type="range"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="mt-2 w-full cursor-pointer"
                style={{ accentColor: CONDITION_COLOR[condition] }}
              />
              {/* The bands start at 0, 40, 60 and 80. */}
              <div aria-hidden="true" className="relative mt-1 h-3 text-[10px] uppercase tracking-[0.14em] text-[var(--p-muted,#9DA3AB)] opacity-70">
                <span className="absolute left-0">Critical</span>
                <span className="absolute left-[40%]">Poor</span>
                <span className="absolute left-[60%]">Fair</span>
                <span className="absolute left-[80%]">Good</span>
              </div>
            </div>
          </div>
        </div>
        <Field label="Findings" className="sm:col-span-2">
          <textarea name="summary" rows={3} maxLength={4000} placeholder="Membrane, seams, flashing, drains, what to do next…" className={portalInput} />
        </Field>
      </Section>

      <fieldset>
        <legend className="mb-3 flex w-full items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--p-kicker,#F9EA1C)]">
          Problems found
          <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-[var(--p-line,rgba(255,255,255,0.1))] to-transparent" />
        </legend>
        {problems.length === 0 && <p className="mb-3 text-xs text-[var(--p-muted,#9DA3AB)]">None added. Add each leak, open seam, flashing or drain problem with where it is.</p>}
        <div className="space-y-2.5">
          {problems.map((p, i) => (
            <motion.div
              key={p.key}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
              className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.02] p-2.5 sm:grid-cols-[1.5fr_0.9fr_1.3fr_0.8fr_auto]"
            >
              <input name="def_title" required maxLength={160} aria-label={`Problem ${i + 1}`} placeholder="What’s wrong" className={twMerge(portalInput, 'col-span-2 sm:col-span-1')} />
              <select name="def_severity" defaultValue="medium" aria-label="Severity" className={portalInput}>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s} style={OPTION_STYLE}>
                    {SEVERITY_LABEL[s]}
                  </option>
                ))}
              </select>
              <input name="def_location" maxLength={200} aria-label="Where" placeholder="Where (NE corner, RTU curb…)" className={portalInput} />
              <input name="def_cost" inputMode="decimal" aria-label="Estimated cost" placeholder="Est. $" className={portalInput} />
              <button
                type="button"
                aria-label="Remove this problem"
                onClick={() => setProblems((rows) => rows.filter((r) => r.key !== p.key))}
                className="grid h-10 w-10 place-items-center justify-self-end rounded-full text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </div>
        <button type="button" onClick={addProblem} className={twMerge(portalGhostButton, 'mt-3 !py-2 text-xs')}>
          <Plus className="h-3.5 w-3.5" /> Add a problem
        </button>
      </fieldset>

      <Footer state={state} pending={pending} label="Save inspection" onCancel={onCancel} disabled={!roofId} />
    </form>
  )
}

/* ============================================================= problem */

export function DeficiencyForm({
  roofs,
  fixedRoofId,
  deficiency,
  onDone,
  onCancel,
}: {
  roofs: RoofItem[]
  fixedRoofId?: string
  deficiency?: DeficiencyItem
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(saveDeficiency, onDone)
  const [roofId, setRoofId] = useState(deficiency?.roof_asset_id ?? fixedRoofId ?? '')
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {deficiency && <input type="hidden" name="id" value={deficiency.id} />}
      <Section title={deficiency ? 'Problem' : 'Log a problem'}>
        {!deficiency && <RoofPicker roofs={roofs} value={roofId} onChange={setRoofId} disabled={Boolean(fixedRoofId)} />}
        <Field label="What’s wrong *" className="sm:col-span-2">
          <input name="title" required maxLength={160} defaultValue={deficiency?.title ?? ''} placeholder="e.g. Open seam at the parapet" className={portalInput} />
        </Field>
        <Field label="Where">
          <input name="location" maxLength={200} defaultValue={deficiency?.location ?? ''} placeholder="NE corner, above suite 120…" className={portalInput} />
        </Field>
        <Field label="Severity">
          <select name="severity" defaultValue={deficiency?.severity ?? 'medium'} className={portalInput}>
            {SEVERITIES.map((s) => (
              <option key={s} value={s} style={OPTION_STYLE}>
                {SEVERITY_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estimated cost ($)">
          <input name="est_cost" inputMode="decimal" type="number" min={0} step="0.01" defaultValue={deficiency?.est_cost ?? ''} className={portalInput} />
        </Field>
        {deficiency ? (
          <Field label="Status">
            <select name="status" defaultValue={deficiency.status} className={portalInput}>
              {DEFICIENCY_STATUSES.map((s) => (
                <option key={s} value={s} style={OPTION_STYLE}>
                  {DEFICIENCY_STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={2} maxLength={4000} defaultValue={deficiency?.notes ?? ''} className={portalInput} />
        </Field>
      </Section>
      <Footer state={state} pending={pending} label={deficiency ? 'Save' : 'Log problem'} onCancel={onCancel} disabled={!roofId} />
    </form>
  )
}

/* ============================================================ estimate */

export function EstimateForm({
  roofs,
  deficiencies,
  fixedRoofId,
  estimate,
  initialScenario,
  initialDeficiencyIds,
  year,
  options,
  perms,
  onDone,
  onCancel,
}: {
  roofs: RoofItem[]
  /** The deficiencies of the roofs (any status); the form offers the open ones and those already covered. */
  deficiencies: DeficiencyItem[]
  fixedRoofId?: string
  estimate?: EstimateItem
  initialScenario?: EstimateScenario
  initialDeficiencyIds?: string[]
  year: number
  options: RoofFormOptions
  perms: RoofPerms
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(saveEstimate, onDone)
  const formId = useId()
  const [roofId, setRoofId] = useState(estimate?.roof_asset_id ?? fixedRoofId ?? '')
  const roof = roofs.find((r) => r.id === roofId)
  const roofArea = roof?.area_sqft ?? 0
  const start: EstimateScenario = estimate?.scenario ?? initialScenario ?? (initialDeficiencyIds?.length ? 'repair' : 'restore')
  const [scenario, setScenario] = useState<EstimateScenario>(start)
  const [covered, setCovered] = useState<string[]>(estimate?.deficiency_ids ?? initialDeficiencyIds ?? [])
  const [area, setArea] = useState(start === 'repair' ? defaultRepairArea(roofArea) : roofArea)
  const [amount, setAmount] = useState<string>(String(estimate ? estimate.amount : suggestedAmount(start, start === 'repair' ? defaultRepairArea(roofArea) : roofArea, roofArea)))
  const [assumptions, setAssumptions] = useState(estimate?.assumptions ?? SCENARIO_ASSUMPTIONS[start])
  const [budgetYear, setBudgetYear] = useState(String(estimate?.budget_year ?? (start === 'repair' ? year : year + 1)))

  const offered = deficiencies.filter((d) => d.roof_asset_id === roofId && (isOpenDeficiency(d) || covered.includes(d.id)))
  const coveredCost = offered.filter((d) => covered.includes(d.id)).reduce((s, d) => s + (d.est_cost ?? 0), 0)
  const suggestion = suggestedAmount(scenario, area, roofArea)
  const years = Array.from(new Set([...Array.from({ length: 10 }, (_, i) => year + i), ...(estimate?.budget_year ? [estimate.budget_year] : [])])).sort((a, b) => a - b)

  function pickScenario(next: EstimateScenario, roofAreaNow = roofArea) {
    const nextArea = next === 'repair' ? defaultRepairArea(roofAreaNow) : roofAreaNow
    setScenario(next)
    setArea(nextArea)
    setAmount(String(suggestedAmount(next, nextArea, roofAreaNow)))
    if (!assumptions.trim() || Object.values(SCENARIO_ASSUMPTIONS).includes(assumptions)) setAssumptions(SCENARIO_ASSUMPTIONS[next])
    if (!estimate) setBudgetYear(String(next === 'repair' ? year : year + 1))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {estimate && <input type="hidden" name="id" value={estimate.id} />}
      <input type="hidden" name="scenario" value={scenario} />
      {covered.map((id) => (
        <input key={id} type="hidden" name="deficiency_ids" value={id} />
      ))}

      <Section title="Estimate">
        {!estimate && (
          <RoofPicker
            roofs={roofs}
            value={roofId}
            disabled={Boolean(fixedRoofId)}
            onChange={(id) => {
              setRoofId(id)
              setCovered([])
              pickScenario(scenario, roofs.find((r) => r.id === id)?.area_sqft ?? 0)
            }}
          />
        )}
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-[var(--p-muted,#9DA3AB)]">Scenario</span>
          <Segment id={`scenario-${formId}`} value={scenario} onChange={(s) => pickScenario(s)} options={ESTIMATE_SCENARIOS.map((s) => ({ key: s, label: SCENARIO_LABEL[s] }))} />
        </div>
        <Field label={scenario === 'repair' ? 'Repair area (sq ft)' : 'Roof area (sq ft)'} hint="Only used for the suggested price.">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={area}
            onChange={(e) => setArea(Math.max(0, Number(e.target.value) || 0))}
            className={portalInput}
          />
        </Field>
        <Field label="Amount ($)" hint={`Suggested ${money0(suggestion)}${scenario === 'repair' ? ' ($18 a sq ft + $2,500)' : scenario === 'restore' ? ' ($3.10 a sq ft)' : ' ($10.50 a sq ft)'}`}>
          <div className="flex gap-2">
            <input name="amount" required inputMode="decimal" type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={portalInput} />
            <button type="button" onClick={() => setAmount(String(suggestion))} className="shrink-0 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.12))] px-3 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/[0.06] hover:text-[var(--p-ink,#fff)]">
              Use
            </button>
          </div>
        </Field>
        <Field label="Budget year">
          <select name="budget_year" value={budgetYear} onChange={(e) => setBudgetYear(e.target.value)} className={portalInput}>
            {years.map((y) => (
              <option key={y} value={y} style={OPTION_STYLE}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        {perms.assign ? <AssigneeField options={options} current={estimate?.assigned_to} defaultValue={estimate ? (estimate.assigned_to ?? '') : (options.me ?? '')} /> : <div className="hidden sm:block" />}
        <Field label="Scope & assumptions" className="sm:col-span-2">
          <textarea name="assumptions" rows={3} maxLength={4000} value={assumptions} onChange={(e) => setAssumptions(e.target.value)} className={portalInput} />
        </Field>
      </Section>

      <fieldset>
        <legend className="mb-3 flex w-full items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--p-kicker,#F9EA1C)]">
          Problems covered
          <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-[var(--p-line,rgba(255,255,255,0.1))] to-transparent" />
        </legend>
        {!roofId ? (
          <p className="text-xs text-[var(--p-muted,#9DA3AB)]">Pick a roof to see its open problems.</p>
        ) : offered.length === 0 ? (
          <p className="text-xs text-[var(--p-muted,#9DA3AB)]">No open problems on this roof. The estimate covers the whole roof.</p>
        ) : (
          <ul className="space-y-1.5">
            {offered.map((d) => {
              const on = covered.includes(d.id)
              return (
                <li key={d.id}>
                  <label
                    className={twMerge(
                      'flex cursor-pointer flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition',
                      on ? 'border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] bg-[color-mix(in_oklab,var(--p-primary)_8%,transparent)]' : 'border-[var(--p-line,rgba(255,255,255,0.08))] hover:bg-white/[0.03]',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => setCovered((ids) => (e.target.checked ? [...ids, d.id] : ids.filter((x) => x !== d.id)))}
                      className="h-4 w-4 accent-[var(--p-primary,#6DC015)]"
                    />
                    <SeverityBadge severity={d.severity} />
                    <span className="font-medium text-[var(--p-ink,#fff)]">{d.title}</span>
                    {d.location && <span className="truncate text-xs text-[var(--p-muted,#9DA3AB)]">{d.location}</span>}
                    {d.est_cost ? <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">{money0(d.est_cost)}</span> : null}
                  </label>
                </li>
              )
            })}
          </ul>
        )}
        {coveredCost > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--p-muted,#9DA3AB)]">
            The checked problems’ estimated costs add up to <span className="font-semibold text-[var(--p-ink,#fff)]">{money0(coveredCost)}</span>.
            <button type="button" onClick={() => setAmount(String(coveredCost))} className="font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
              Use as the amount
            </button>
          </p>
        )}
      </fieldset>

      <Footer state={state} pending={pending} label={estimate ? 'Save estimate' : 'Save draft estimate'} onCancel={onCancel} disabled={!roofId} />
    </form>
  )
}

/* ============================================================ plan item */

export function PlanForm({
  roofs,
  fixedRoofId,
  item,
  defaultYear,
  year,
  onDone,
  onCancel,
}: {
  roofs: RoofItem[]
  fixedRoofId?: string
  item?: PlanItem
  defaultYear?: number
  year: number
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(savePlanItem, onDone)
  const [roofId, setRoofId] = useState(item?.roof_asset_id ?? fixedRoofId ?? '')
  const roof = roofs.find((r) => r.id === roofId)
  const [action, setAction] = useState<PlanAction>(item?.action ?? 'Restore')
  const [cost, setCost] = useState(String(item ? item.est_cost : suggestedPlanCost('Restore', roof?.area_sqft)))
  const suggestion = suggestedPlanCost(action, roof?.area_sqft)
  const years = Array.from(new Set([...Array.from({ length: 11 }, (_, i) => year - 1 + i), ...(item ? [item.year] : []), ...(defaultYear ? [defaultYear] : [])])).sort((a, b) => a - b)

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Section title={item ? 'Plan item' : 'Add to the plan'}>
        {!item && (
          <RoofPicker
            roofs={roofs}
            value={roofId}
            disabled={Boolean(fixedRoofId)}
            onChange={(id) => {
              setRoofId(id)
              setCost(String(suggestedPlanCost(action, roofs.find((r) => r.id === id)?.area_sqft)))
            }}
          />
        )}
        <Field label="Year">
          <select name="year" defaultValue={String(item?.year ?? defaultYear ?? year + 1)} className={portalInput}>
            {years.map((y) => (
              <option key={y} value={y} style={OPTION_STYLE}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Action">
          <select
            name="action"
            value={action}
            onChange={(e) => {
              const next = e.target.value as PlanAction
              setAction(next)
              if (!item) setCost(String(suggestedPlanCost(next, roof?.area_sqft)))
            }}
            className={portalInput}
          >
            {PLAN_ACTIONS.map((a) => (
              <option key={a} value={a} style={OPTION_STYLE}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Estimated cost ($)" hint={roof?.area_sqft ? `Suggested ${money0(suggestion)} for ${roof.area_sqft.toLocaleString('en-US')} sq ft` : `Suggested ${money0(suggestion)}`}>
          <div className="flex gap-2">
            <input name="est_cost" inputMode="decimal" type="number" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} className={portalInput} />
            <button type="button" onClick={() => setCost(String(suggestion))} className="shrink-0 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.12))] px-3 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/[0.06] hover:text-[var(--p-ink,#fff)]">
              Use
            </button>
          </div>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={item?.status ?? 'proposed'} className={portalInput}>
            {PLAN_STATUSES.map((s) => (
              <option key={s} value={s} style={OPTION_STYLE}>
                {PLAN_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={2} maxLength={2000} defaultValue={item?.notes ?? ''} placeholder="Why now, and what it prevents" className={portalInput} />
        </Field>
      </Section>
      <Footer
        state={state}
        pending={pending}
        label={item ? 'Save' : 'Add to plan'}
        onCancel={onCancel}
        disabled={!roofId}
        extra={
          item ? (
            <RunButton action={deletePlanItem} fields={{ id: item.id }} confirm="Remove this item from the plan?" onDone={() => onDone?.({ ok: true })} className="text-[#FF9C8F] hover:text-[#FFC2B8]">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </RunButton>
          ) : null
        }
      />
    </form>
  )
}

/* ============================================================ documents */

function guessKind(fileName: string): DocumentKind {
  const type = docContentType(fileName) ?? ''
  if (type.startsWith('image/') || type.startsWith('video/')) return 'Photo set'
  if (/invoice/i.test(fileName)) return 'Invoice'
  if (/warrant/i.test(fileName)) return 'Warranty'
  if (/inspect|report|survey/i.test(fileName)) return 'Inspection report'
  if (/spec|data ?sheet|sds|pds/i.test(fileName)) return 'Spec'
  return 'Other'
}

function putFile(url: string, file: File, contentType: string, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)))
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Timed out'))
    xhr.timeout = 30 * 60 * 1000
    xhr.send(file)
  })
}

/** Building, roof and project pickers for a document. Picking a roof files it under that roof's building too. */
function DocLinks({
  facilities,
  roofs,
  projects,
  facilityId,
  roofId,
  projectId,
  onFacility,
  onRoof,
  onProject,
}: {
  facilities: FacilityItem[]
  roofs: RoofItem[]
  projects: RoofProjectOption[]
  facilityId: string
  roofId: string
  projectId: string
  onFacility: (id: string) => void
  onRoof: (id: string) => void
  onProject: (id: string) => void
}) {
  const roofChoices = sortedRoofs(facilityId ? roofs.filter((r) => r.facility_id === facilityId) : roofs)
  return (
    <>
      <Field label="Building">
        <select name="facility_id" value={facilityId} onChange={(e) => onFacility(e.target.value)} className={portalInput}>
          <option value="" style={OPTION_STYLE}>
            None
          </option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id} style={OPTION_STYLE}>
              {f.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Roof">
        <select name="roof_id" value={roofId} onChange={(e) => onRoof(e.target.value)} className={portalInput}>
          <option value="" style={OPTION_STYLE}>
            {facilityId ? 'The whole building' : 'None'}
          </option>
          {roofChoices.map((r) => (
            <option key={r.id} value={r.id} style={OPTION_STYLE}>
              {facilityId ? r.name : roofLabel(r)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Project" className="sm:col-span-2">
        <select name="project_id" value={projectId} onChange={(e) => onProject(e.target.value)} className={portalInput}>
          <option value="" style={OPTION_STYLE}>
            None
          </option>
          {projects.map((p) => (
            <option key={p.id} value={p.id} style={OPTION_STYLE}>
              {p.name}
            </option>
          ))}
        </select>
      </Field>
    </>
  )
}

function useDocLinks(roofs: RoofItem[], initial: { facilityId?: string | null; roofId?: string | null; projectId?: string | null }) {
  const [facilityId, setFacilityId] = useState(initial.facilityId ?? (initial.roofId ? (roofs.find((r) => r.id === initial.roofId)?.facility_id ?? '') : ''))
  const [roofId, setRoofId] = useState(initial.roofId ?? '')
  const [projectId, setProjectId] = useState(initial.projectId ?? '')
  return {
    facilityId,
    roofId,
    projectId,
    onFacility: (id: string) => {
      setFacilityId(id)
      if (roofId && roofs.find((r) => r.id === roofId)?.facility_id !== id) setRoofId('')
    },
    onRoof: (id: string) => {
      setRoofId(id)
      const r = roofs.find((x) => x.id === id)
      if (r) setFacilityId(r.facility_id)
    },
    onProject: setProjectId,
  }
}

export function DocumentUploadForm({
  facilities,
  roofs,
  projects,
  initial = {},
  onDone,
  onCancel,
}: {
  facilities: FacilityItem[]
  roofs: RoofItem[]
  projects: RoofProjectOption[]
  initial?: { facilityId?: string | null; roofId?: string | null; projectId?: string | null }
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const links = useDocLinks(roofs, initial)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<DocumentKind>('Other')
  const [progress, setProgress] = useState<number | null>(null)
  const [state, setState] = useState<PortalResult | null>(null)
  const [dragging, setDragging] = useState(false)
  const busy = progress !== null

  function choose(f: File | null | undefined) {
    if (!f) return
    const problem = docProblem(f.name, f.size)
    if (problem) {
      setState({ ok: false, error: problem })
      return
    }
    setState(null)
    setFile(f)
    setTitle(titleFromFile(f.name))
    setKind(guessKind(f.name))
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file || busy) return
    setState(null)
    setProgress(0)
    const start = await startRoofDocumentUpload({ fileName: file.name, bytes: file.size }).catch(() => null)
    if (!start || !start.ok) {
      setProgress(null)
      setState({ ok: false, error: start && !start.ok ? start.error : 'That didn’t upload. Check your connection and try again.' })
      return
    }
    try {
      await putFile(start.uploadUrl, file, start.contentType, setProgress)
    } catch {
      setProgress(null)
      setState({ ok: false, error: `${file.name} didn’t finish uploading. Check your connection and try again.` })
      return
    }
    setProgress(100)
    const done = await finishRoofDocumentUpload({
      key: start.key,
      fileName: file.name,
      title,
      kind,
      roofId: links.roofId || null,
      facilityId: links.facilityId || null,
      projectId: links.projectId || null,
    }).catch(() => null)
    setProgress(null)
    if (!done || !done.ok) {
      setState({ ok: false, error: done && !done.ok ? done.error : 'That didn’t save. Try again.' })
      return
    }
    onDone?.(done)
  }

  return (
    <form onSubmit={upload} className="space-y-6">
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          choose(e.dataTransfer.files?.[0])
        }}
        className={twMerge(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-4 py-8 text-center transition',
          dragging
            ? 'border-[var(--p-primary,#6DC015)] bg-[color-mix(in_oklab,var(--p-primary)_10%,transparent)]'
            : 'border-[var(--p-line,rgba(255,255,255,0.14))] bg-white/[0.02] hover:bg-white/[0.04]',
        )}
      >
        <input type="file" accept={DOC_ACCEPT} className="sr-only" disabled={busy} onChange={(e) => choose(e.target.files?.[0])} />
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/[0.06] text-[var(--p-accent,#F9EA1C)] ring-1 ring-white/10">
          {file ? <FileUp className="h-5 w-5" /> : <UploadCloud className="h-5 w-5" />}
        </span>
        {file ? (
          <>
            <span className="max-w-full truncate text-sm font-semibold text-[var(--p-ink,#fff)]">{file.name}</span>
            <span className="text-xs text-[var(--p-muted,#9DA3AB)]">{fileSize(file.size)} · click to pick another</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-[var(--p-ink,#fff)]">Drop a file here, or click to choose</span>
            <span className="text-xs text-[var(--p-muted,#9DA3AB)]">PDF, photos, Word, Excel, CSV, ZIP or video, up to 100 MB</span>
          </>
        )}
      </label>

      {busy && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuenow={progress ?? 0} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--p-primary,#6DC015)] to-[var(--p-accent,#F9EA1C)]"
            animate={{ width: `${progress ?? 0}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <Section title="Details">
        <Field label="Title *" className="sm:col-span-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} className={portalInput} />
        </Field>
        <Field label="Kind" className="sm:col-span-2">
          <select value={kind} onChange={(e) => setKind(e.target.value as DocumentKind)} className={portalInput}>
            {DOCUMENT_KINDS.map((k) => (
              <option key={k} value={k} style={OPTION_STYLE}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <DocLinks facilities={facilities} roofs={roofs} projects={projects} {...links} />
      </Section>

      <Footer state={state} pending={busy} label={busy ? 'Uploading…' : 'Upload'} icon={<UploadCloud className="h-4 w-4" />} onCancel={busy ? undefined : onCancel} disabled={!file || !title.trim()} />
    </form>
  )
}

export function DocumentEditForm({
  doc,
  facilities,
  roofs,
  projects,
  onDone,
  onCancel,
}: {
  doc: DocumentItem
  facilities: FacilityItem[]
  roofs: RoofItem[]
  projects: RoofProjectOption[]
  onDone?: (r: PortalResult) => void
  onCancel?: () => void
}) {
  const { state, onSubmit, pending } = useSave(updateRoofDocument, onDone)
  const links = useDocLinks(roofs, { facilityId: doc.facility_id, roofId: doc.roof_asset_id, projectId: doc.project_id })
  const projectChoices = doc.project_id && !projects.some((p) => p.id === doc.project_id) ? [{ id: doc.project_id, name: doc.project_name ?? 'Current project', stage: '', sqft: null }, ...projects] : projects
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <input type="hidden" name="id" value={doc.id} />
      <Section title="Document">
        <Field label="Title *" className="sm:col-span-2">
          <input name="title" defaultValue={doc.title} required maxLength={200} className={portalInput} />
        </Field>
        <Field label="Kind" className="sm:col-span-2">
          <select name="kind" defaultValue={doc.kind} className={portalInput}>
            {DOCUMENT_KINDS.map((k) => (
              <option key={k} value={k} style={OPTION_STYLE}>
                {k}
              </option>
            ))}
          </select>
        </Field>
        <DocLinks facilities={facilities} roofs={roofs} projects={projectChoices} {...links} />
      </Section>
      <Footer
        state={state}
        pending={pending}
        label="Save"
        onCancel={onCancel}
        extra={
          <RunButton
            action={deleteRoofDocument}
            fields={{ id: doc.id }}
            confirm={`Delete “${doc.title}”? It comes off every building, roof and project it’s filed under.`}
            onDone={() => onDone?.({ ok: true })}
            className="text-[#FF9C8F] hover:text-[#FFC2B8]"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </RunButton>
        }
      />
    </form>
  )
}
