'use client'

import { useActionState } from 'react'
import { Loader2, UserPlus } from 'lucide-react'
import { addStaff, type AddStaffState } from '@/lib/portal/admin/staff-actions'
import { BUTTON, inputCls, labelCls } from './styles'

export function AddStaffForm() {
  const [state, action, pending] = useActionState<AddStaffState, FormData>(addStaff, null)
  return (
    <form action={action} className="grid gap-2 p-3">
      <label className={labelCls}>
        <span>Name *</span>
        <input name="name" required className={inputCls} />
      </label>
      <label className={labelCls}>
        <span>Email *</span>
        <input name="email" type="email" required placeholder="name@crazyseal.com" className={inputCls} />
      </label>
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
          Add to staff
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
