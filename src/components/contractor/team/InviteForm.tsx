'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { inviteTeamMember } from '@/lib/contractor/team-actions'
import { ROLE_INFO, type ContractorRole } from '@/lib/contractor/roles'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'

/** Invite someone to the team: they get an email to set their password and open the portal. */
export function InviteForm({ roles, onDone }: { roles: ContractorRole[]; onDone: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<ContractorRole>(roles.includes('sales_rep') ? 'sales_rep' : roles[0])
  const [pending, start] = useTransition()
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    start(async () => {
      const r = await inviteTeamMember({ email, name, role })
      if (r.ok) {
        setResult({ ok: true, text: r.message ?? 'Invite sent' })
        setEmail('')
        setName('')
        router.refresh()
      } else setResult({ ok: false, text: r.error })
    })
  }

  return (
    <form onSubmit={submit} className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-end">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoComplete="off" className={portalInput} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="First and last" maxLength={120} className={portalInput} />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-blue-100/60">Role</span>
        <select value={role} onChange={(e) => setRole(e.target.value as ContractorRole)} className={twMerge(portalInput, '[&>option]:text-gray-900')}>
          {roles.map((r) => (
            <option key={r} value={r}>
              {ROLE_INFO[r].label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending || !email} className={portalButton}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send invite
        </button>
        <button type="button" onClick={onDone} className={portalGhostButton}>
          Close
        </button>
      </div>
      <p className="text-xs text-blue-100/55 md:col-span-4">
        {ROLE_INFO[role].summary} They get an email with a link to set their password; it lands them here.
      </p>
      {result && (
        <p role="status" className={twMerge('text-sm md:col-span-4', result.ok ? 'text-accent-light' : 'text-red-300')}>
          {result.text}
        </p>
      )}
    </form>
  )
}
