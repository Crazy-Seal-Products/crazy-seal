'use client'

import { useActionState, useState } from 'react'
import { Loader2, Send, UserPlus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { inviteToProHub } from '@/lib/portal/admin/pro-actions'
import { Modal } from './modal'
import { BUTTON, inputCls, labelCls } from './styles'

const STATUSES = [
  { key: '', label: 'From their Shopify tags' },
  { key: 'pro', label: 'Pro (dealer)' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'high_volume', label: 'High volume' },
  { key: 'member', label: 'Member' },
]

/** "Invite dealer": a pop-up form that emails someone a Pro Hub sign-in link. */
export function ProInviteButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={BUTTON.gold}>
        <UserPlus className="h-3.5 w-3.5" />
        Invite dealer
      </button>
      {open && (
        <Modal title="Invite to the Pro Hub" icon={<Send className="h-4 w-4 text-adm-gold" />} onClose={() => setOpen(false)}>
          <InviteForm onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const [state, action, pending] = useActionState(inviteToProHub, null)
  return (
    <form action={action} className="grid gap-2.5 p-4">
      <label className={labelCls}>
        <span>Email *</span>
        <input name="email" type="email" required placeholder="dealer@example.com" className={inputCls} autoFocus />
      </label>
      <div className="grid gap-2.5 sm:grid-cols-2">
        <label className={labelCls}>
          <span>Name</span>
          <input name="display_name" className={inputCls} />
        </label>
        <label className={labelCls}>
          <span>Business</span>
          <input name="business_name" className={inputCls} />
        </label>
      </div>
      <label className={labelCls}>
        <span>Status on the Pro Hub</span>
        <select name="status" defaultValue="" className={inputCls}>
          {STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[11.5px] leading-snug text-adm-muted">They get an email with a sign-in link (good for 20 minutes) and can set a password once inside.</p>
      {state && (
        <p role="status" className={twMerge('text-[12px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>
          {state.ok ? state.message : state.error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {state?.ok ? 'Send another' : 'Send invite'}
        </button>
        <button type="button" onClick={onDone} className={BUTTON.default}>
          {state?.ok ? 'Done' : 'Cancel'}
        </button>
      </div>
    </form>
  )
}
