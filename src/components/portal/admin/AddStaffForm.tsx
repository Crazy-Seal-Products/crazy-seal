'use client'

import { useActionState, useState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { addStaff, type AddStaffState } from '@/lib/portal/admin/staff-actions'
import { Modal } from './modal'
import { BUTTON, inputCls, labelCls } from './styles'

/** "Add staff": the form below in a pop-up, for the Users & roles header. */
export function AddStaffButton({ roles, defaultRole }: { roles: { key: string; label: string }[]; defaultRole: string }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={BUTTON.gold}>
        <UserPlus className="h-3.5 w-3.5" />
        Add staff
      </button>
      {open && (
        <Modal title="Add a staff member" icon={<UserPlus className="h-4 w-4 text-adm-gold" />} onClose={() => setOpen(false)}>
          <AddStaffForm roles={roles} defaultRole={defaultRole} />
        </Modal>
      )}
    </>
  )
}

/**
 * Adds a staff member, or gives an existing login admin access when `name`
 * and `email` are filled in. `roles` are the roles the signed-in admin can
 * hand out (just Staff for an Admin).
 */
export function AddStaffForm({
  roles,
  defaultRole,
  name,
  email,
  submitLabel = 'Add to staff',
}: {
  roles: { key: string; label: string }[]
  defaultRole: string
  name?: string
  email?: string
  submitLabel?: string
}) {
  const [state, action, pending] = useActionState<AddStaffState, FormData>(addStaff, null)
  return (
    <form action={action} className="grid gap-2 p-3">
      <label className={labelCls}>
        <span>Name *</span>
        <input name="name" required defaultValue={name} className={inputCls} />
      </label>
      {email ? (
        <input type="hidden" name="email" value={email} />
      ) : (
        <label className={labelCls}>
          <span>Email *</span>
          <input name="email" type="email" required placeholder="name@crazyseal.com" className={inputCls} />
        </label>
      )}
      {roles.length > 1 ? (
        <label className={labelCls}>
          <span>Role</span>
          <select name="role" defaultValue={defaultRole} className={inputCls}>
            {roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="role" value={roles[0]?.key ?? defaultRole} />
      )}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          {submitLabel}
        </button>
        {state && !state.ok && <span className="text-[11.5px] text-adm-red">{state.error}</span>}
      </div>
      {state?.ok && (
        <div className="rounded-md border border-adm-line bg-adm-input p-2 text-[11.5px] leading-snug text-adm-text">
          <p>{state.message}</p>
          {state.tempPassword && (
            <p className="mt-1.5 select-all font-mono text-[13px] font-semibold text-adm-ink">{state.tempPassword}</p>
          )}
        </div>
      )}
      <p className="text-[11px] leading-snug text-adm-muted">
        Staff sign in at /portal/login/. Anyone who already used the old site admin keeps their password.
      </p>
    </form>
  )
}
