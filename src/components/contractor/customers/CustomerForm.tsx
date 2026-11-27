'use client'

import { startTransition, useActionState, useState } from 'react'
import { Loader2, Pencil, Plus, Save } from 'lucide-react'
import { saveCustomer } from '@/lib/contractor/customer-actions'
import type { PortalResult } from '@/lib/contractor/guard'
import type { TeamOption } from '@/lib/contractor/projects'
import { CUSTOMER_TYPES, type CustomerRow } from '@/lib/contractor/types'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'
import { Field, FormNotice, Modal, OPTION_STYLE, teamFor, withCurrent } from '../projects/kit'

export interface CustomerFormProps {
  customer?: CustomerRow
  team: TeamOption[]
  /** May pick the account owner (sales.view_all); a sales rep's customers are their own. */
  canAssign: boolean
  me: string | null
  onDone?: (result: Extract<PortalResult, { ok: true }>) => void
  onCancel?: () => void
}

/** Add or edit a customer: who they are, how to reach them, where, and who owns the account. */
export function CustomerForm({ customer, team, canAssign, me, onDone, onCancel }: CustomerFormProps) {
  const [state, formAction, pending] = useActionState<PortalResult | null, FormData>(async (prev, fd) => {
    const result = await saveCustomer(prev, fd)
    if (result.ok && onDone) onDone(result)
    return result
  }, null)

  return (
    <form
      onSubmit={(e) => {
        // Submitting by hand keeps what was typed when the server sends back an error.
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => formAction(fd))
      }}
      className="grid grid-cols-1 gap-3.5 sm:grid-cols-2"
    >
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <Field label="Customer name *" className="sm:col-span-2" hint="A person, a family, or a business.">
        <input name="name" required maxLength={160} defaultValue={customer?.name ?? ''} className={portalInput} />
      </Field>
      <Field label="Type">
        <select name="type" defaultValue={customer?.type ?? 'RV owner'} className={portalInput}>
          <option value="" style={OPTION_STYLE}>
            —
          </option>
          {withCurrent(CUSTOMER_TYPES, customer?.type).map((t) => (
            <option key={t} value={t} style={OPTION_STYLE}>
              {t}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Contact name">
        <input name="contact_name" maxLength={120} defaultValue={customer?.contact_name ?? ''} className={portalInput} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" maxLength={200} defaultValue={customer?.email ?? ''} className={portalInput} />
      </Field>
      <Field label="Phone">
        <input name="phone" type="tel" maxLength={40} defaultValue={customer?.phone ?? ''} className={portalInput} />
      </Field>
      <Field label="City">
        <input name="city" maxLength={100} defaultValue={customer?.city ?? ''} className={portalInput} />
      </Field>
      <div className="grid grid-cols-2 gap-3.5">
        <Field label="State">
          <input name="state" maxLength={40} defaultValue={customer?.state ?? ''} className={portalInput} />
        </Field>
        <Field label="ZIP">
          <input name="zip" maxLength={20} defaultValue={customer?.zip ?? ''} className={portalInput} />
        </Field>
      </div>
      {canAssign && (
        <Field label="Account owner" className="sm:col-span-2">
          <select name="assigned_to" defaultValue={customer ? (customer.assigned_to ?? '') : (me ?? '')} className={portalInput}>
            <option value="" style={OPTION_STYLE}>
              Unassigned
            </option>
            {teamFor(team, customer?.assigned_to).map((m) => (
              <option key={m.id} value={m.id} style={OPTION_STYLE}>
                {m.name} · {m.role}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Notes" className="sm:col-span-2">
        <textarea name="notes" rows={3} maxLength={4000} defaultValue={customer?.notes ?? ''} className={portalInput} />
      </Field>
      <div className="space-y-3 sm:col-span-2">
        <FormNotice state={state && !state.ok ? state : null} />
        <div className="flex flex-wrap justify-end gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className={portalGhostButton}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={pending} className={portalButton}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {customer ? 'Save changes' : 'Add customer'}
          </button>
        </div>
      </div>
    </form>
  )
}

/** A button that opens the customer form in a dialog: "Add customer", or "Edit" for `customer`. */
export function CustomerFormButton({
  customer,
  team,
  canAssign,
  me,
  className,
  onSaved,
}: Omit<CustomerFormProps, 'onDone' | 'onCancel'> & { className?: string; onSaved?: (id: string | undefined) => void }) {
  const [open, setOpen] = useState(false)
  // The dialog mounts on first use (a long customer table needn't carry one per row), then stays so it can animate out.
  const [used, setUsed] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setUsed(true)
          setOpen(true)
        }}
        className={className ?? (customer ? portalGhostButton : portalButton)}
      >
        {customer ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {customer ? 'Edit' : 'Add customer'}
      </button>
      {used && (
        <Modal title={customer ? `Edit ${customer.name}` : 'Add customer'} open={open} onClose={() => setOpen(false)} wide>
          <CustomerForm
            customer={customer}
            team={team}
            canAssign={canAssign}
            me={me}
            onCancel={() => setOpen(false)}
            onDone={(result) => {
              setOpen(false)
              onSaved?.(result.id)
            }}
          />
        </Modal>
      )}
    </>
  )
}
