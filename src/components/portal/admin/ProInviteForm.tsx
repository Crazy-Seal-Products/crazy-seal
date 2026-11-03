'use client'

import { useActionState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { inviteToProHub } from '@/lib/portal/admin/pro-actions'
import { BUTTON, inputCls, labelCls } from './styles'

const STATUSES = [
  { key: '', label: 'From their Shopify tags' },
  { key: 'pro', label: 'Pro (dealer)' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'high_volume', label: 'High volume' },
  { key: 'member', label: 'Member' },
]

export function ProInviteForm() {
  const [state, action, pending] = useActionState(inviteToProHub, null)
  return (
    <form action={action} className="grid gap-2 p-3">
      <label className={labelCls}>
        <span>Email *</span>
        <input name="email" type="email" required placeholder="dealer@example.com" className={inputCls} />
      </label>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
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
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Send invite
        </button>
        {state && <span className={twMerge('text-[11.5px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>{state.ok ? state.message : state.error}</span>}
      </div>
      <p className="text-[11px] leading-snug text-adm-muted">They get an email with a sign-in link (good for 20 minutes) and can set a password once inside.</p>
    </form>
  )
}
