'use client'

import { startTransition, useActionState, useId, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Save } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { CustomerOption } from '@/lib/contractor/customers'
import type { PortalResult } from '@/lib/contractor/guard'
import { createProject, updateProject } from '@/lib/contractor/project-actions'
import { CUSTOMER_TYPES, PROJECT_SOURCES, ROOF_COLORS, ROOF_TYPES, type ProjectRow } from '@/lib/contractor/types'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'
import { Field, FormNotice, OPTION_STYLE, teamFor, withCurrent, type TeamOption } from './kit'

type CustomerMode = 'existing' | 'new' | 'none'

export interface ProjectFormProps {
  mode: 'create' | 'edit'
  project?: ProjectRow
  customers: CustomerOption[]
  team: TeamOption[]
  /** May add a customer inline (customers.edit). */
  canAddCustomer: boolean
  /** May pick who it's assigned to (sales.view_all); sales reps' projects are their own. */
  canAssign: boolean
  /** The signed-in member, the default assignee. */
  me: string | null
  defaultCustomerId?: string
  /** The project's current customer when it isn't in `customers` (someone else's). */
  currentCustomer?: { id: string; name: string } | null
  onDone?: () => void
  onCancel?: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <legend className="mb-3 flex w-full items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--p-kicker,#F9EA1C)]">
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-[var(--p-line,rgba(255,255,255,0.1))] to-transparent" />
      </legend>
      {children}
    </fieldset>
  )
}

/**
 * New project (on /portal/projects/new/) or Edit details (on the project
 * page): the customer (pick one, add one, or none yet), the roof, the sale and
 * the site address.
 */
export function ProjectForm({
  mode,
  project,
  customers,
  team,
  canAddCustomer,
  canAssign,
  me,
  defaultCustomerId,
  currentCustomer,
  onDone,
  onCancel,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState<PortalResult | null, FormData>(async (prev, fd) => {
    const result = mode === 'create' ? await createProject(prev, fd) : await updateProject(prev, fd)
    if (result.ok && onDone) onDone()
    return result
  }, null)

  const options = currentCustomer && !customers.some((c) => c.id === currentCustomer.id) ? [{ ...currentCustomer, detail: '' }, ...customers] : customers
  const initialCustomer = project?.customer_id ?? (defaultCustomerId && options.some((c) => c.id === defaultCustomerId) ? defaultCustomerId : '')
  const [customerMode, setCustomerMode] = useState<CustomerMode>(
    mode === 'edit' ? (project?.customer_id ? 'existing' : 'none') : options.length || !canAddCustomer ? 'existing' : 'new',
  )
  const [customerId, setCustomerId] = useState(initialCustomer)
  const [newName, setNewName] = useState('')
  const [roofType, setRoofType] = useState(project?.roof_type ?? '')
  const formId = useId()

  const customerName = customerMode === 'existing' ? options.find((c) => c.id === customerId)?.name : customerMode === 'new' ? newName.trim() : ''
  const namePlaceholder = `${customerName || 'Customer'}: ${roofType || 'roof'}`
  const site = project?.site ?? null
  const modes: { key: CustomerMode; label: string }[] = [
    { key: 'existing', label: 'Existing customer' },
    ...(canAddCustomer ? [{ key: 'new' as const, label: 'New customer' }] : []),
    { key: 'none', label: 'No customer yet' },
  ]

  return (
    <form
      onSubmit={(e) => {
        // Submitting by hand keeps what was typed when the server sends back an error.
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => formAction(fd))
      }}
      className="space-y-7"
    >
      {project && <input type="hidden" name="id" value={project.id} />}
      <input type="hidden" name="customer_mode" value={customerMode} />

      <Section title="Customer">
        <div className="inline-flex w-fit flex-wrap gap-1 rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-2">
          {modes.map((m) => {
            const on = customerMode === m.key
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setCustomerMode(m.key)}
                aria-pressed={on}
                className={twMerge(
                  'relative rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300',
                  on ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
                )}
              >
                {on && (
                  <motion.span
                    layoutId={`customer-mode-${formId}`}
                    className="absolute inset-0 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                    transition={{ type: 'spring', stiffness: 480, damping: 36 }}
                  />
                )}
                <span className="relative">{m.label}</span>
              </button>
            )
          })}
        </div>
        {customerMode === 'existing' && (
          <Field label="Customer" className="sm:col-span-2">
            <select name="customer_id" value={customerId} onChange={(e) => setCustomerId(e.target.value)} required className={portalInput}>
              <option value="" disabled style={OPTION_STYLE}>
                {options.length ? 'Pick a customer' : 'No customers yet'}
              </option>
              {options.map((c) => (
                <option key={c.id} value={c.id} style={OPTION_STYLE}>
                  {c.detail ? `${c.name} · ${c.detail}` : c.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {customerMode === 'new' && (
          <>
            <Field label="Customer name *">
              <input name="customer_name" required maxLength={160} value={newName} onChange={(e) => setNewName(e.target.value)} className={portalInput} />
            </Field>
            <Field label="Type">
              <select name="customer_type" defaultValue="RV owner" className={portalInput}>
                {CUSTOMER_TYPES.map((t) => (
                  <option key={t} value={t} style={OPTION_STYLE}>
                    {t}
                  </option>
                ))}
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

      <Section title="Project">
        <Field label={mode === 'edit' ? 'Project name *' : 'Project name'} className="sm:col-span-2" hint={mode === 'create' ? 'Leave blank to use the customer and roof.' : undefined}>
          <input name="name" maxLength={160} required={mode === 'edit'} defaultValue={project?.name ?? ''} placeholder={namePlaceholder} className={portalInput} />
        </Field>
        <Field label="Roof type">
          <select name="roof_type" value={roofType} onChange={(e) => setRoofType(e.target.value)} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              Not sure yet
            </option>
            {withCurrent(ROOF_TYPES, project?.roof_type).map((r) => (
              <option key={r} value={r} style={OPTION_STYLE}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Color">
          <select name="color" defaultValue={project?.color ?? ''} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              Not picked yet
            </option>
            {withCurrent(ROOF_COLORS, project?.color).map((c) => (
              <option key={c} value={c} style={OPTION_STYLE}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Roof area (sq ft)">
          <input name="sqft" inputMode="numeric" min={0} type="number" defaultValue={project?.sqft ?? ''} className={portalInput} />
        </Field>
        <Field label="Seams (ft)">
          <input name="seams" inputMode="numeric" min={0} type="number" defaultValue={project?.seams ?? ''} className={portalInput} />
        </Field>
        <Field label="Value ($)" hint="What the job is worth to you.">
          <input name="value" inputMode="decimal" min={0} step="0.01" type="number" defaultValue={project?.value || ''} className={portalInput} />
        </Field>
        <Field label="Expected close">
          <input name="expected_close" type="date" defaultValue={project?.expected_close ?? ''} className={portalInput} />
        </Field>
        <Field label="Source">
          <select name="source" defaultValue={project?.source ?? ''} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              —
            </option>
            {withCurrent(PROJECT_SOURCES, project?.source).map((s) => (
              <option key={s} value={s} style={OPTION_STYLE}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        {canAssign ? (
          <Field label="Assigned to">
            <select name="assigned_to" defaultValue={mode === 'edit' ? (project?.assigned_to ?? '') : (me ?? '')} className={portalInput}>
              <option value="" style={OPTION_STYLE}>
                Unassigned
              </option>
              {teamFor(team, mode === 'edit' ? project?.assigned_to : null).map((m) => (
                <option key={m.id} value={m.id} style={OPTION_STYLE}>
                  {m.name} · {m.role}
                </option>
              ))}
            </select>
          </Field>
        ) : (
          <div className="hidden sm:block" />
        )}
        {mode === 'edit' && (
          <>
            <Field label="Crew">
              <input name="crew" maxLength={120} defaultValue={project?.crew ?? ''} className={portalInput} />
            </Field>
            <Field label="Start date">
              <input name="start_date" type="date" defaultValue={project?.start_date ?? ''} className={portalInput} />
            </Field>
            <Field label="Operations lead">
              <select name="ops_lead_id" defaultValue={project?.ops_lead_id ?? ''} className={portalInput}>
                <option value="" style={OPTION_STYLE}>
                  —
                </option>
                {teamFor(team, project?.ops_lead_id).map((m) => (
                  <option key={m.id} value={m.id} style={OPTION_STYLE}>
                    {m.name} · {m.role}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <Field label="Notes" className="sm:col-span-2">
          <textarea name="notes" rows={3} maxLength={4000} defaultValue={project?.notes ?? ''} className={portalInput} />
        </Field>
      </Section>

      <Section title="Site address">
        <Field label="Street" className="sm:col-span-2">
          <input name="site_street" maxLength={200} defaultValue={site?.street ?? ''} autoComplete="street-address" className={portalInput} />
        </Field>
        <Field label="City">
          <input name="site_city" maxLength={100} defaultValue={site?.city ?? ''} autoComplete="address-level2" className={portalInput} />
        </Field>
        <div className="grid grid-cols-2 gap-3.5">
          <Field label="State">
            <input name="site_state" maxLength={40} defaultValue={site?.state ?? ''} autoComplete="address-level1" className={portalInput} />
          </Field>
          <Field label="ZIP">
            <input name="site_zip" maxLength={20} defaultValue={site?.zip ?? ''} autoComplete="postal-code" className={portalInput} />
          </Field>
        </div>
      </Section>

      <div className="space-y-3">
        <FormNotice state={state && !state.ok ? state : null} />
        <div className="flex flex-wrap justify-end gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className={portalGhostButton}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={pending} className={portalButton}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === 'create' ? 'Create project' : 'Save changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
