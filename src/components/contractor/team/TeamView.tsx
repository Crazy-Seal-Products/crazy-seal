'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound, Loader2, Mail, Power, Trash2, UserPlus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { changeTeamRole, removeTeamMember, resendTeamInvite, setTeamAccess } from '@/lib/contractor/team-actions'
import { ROLE_INFO, type ContractorRole } from '@/lib/contractor/roles'
import type { TeamMember } from '@/lib/contractor/types'
import { shortDate, sinceLabel } from '@/lib/contractor/dates'
import { Panel, PanelTitle, StatusPill, ViewHeader, portalButton, portalInput } from '@/components/portal/ui'
import { InviteForm } from './InviteForm'
import { RoleLegend } from './RoleLegend'

export interface TeamRow extends TeamMember {
  /** The viewer may change this person (their role allows it, and it isn't themselves). */
  manageable: boolean
}

const STATUS: Record<TeamMember['status'], { pill: string; label: string }> = {
  active: { pill: 'live', label: 'Active' },
  invited: { pill: 'pending_photos', label: 'Invited' },
  disabled: { pill: 'not_started', label: 'Access off' },
}

type Result = { ok: true; message?: string } | { ok: false; error: string }

export function TeamView({
  companyName,
  members,
  viewerId,
  assignable,
}: {
  companyName: string
  members: TeamRow[]
  viewerId: string
  /** Roles the viewer can give; empty when they can't manage the team. */
  assignable: ContractorRole[]
}) {
  const canManage = assignable.length > 0
  const [inviting, setInviting] = useState(false)
  const active = members.filter((m) => m.status === 'active').length
  const invited = members.filter((m) => m.status === 'invited').length

  return (
    <>
      <ViewHeader
        kicker="Company"
        title="Team"
        description={`Everyone at ${companyName} who can open this portal. Each person signs in with their own Pro Hub account, and their role decides what they see.`}
      >
        {canManage && !inviting && (
          <button type="button" onClick={() => setInviting(true)} className={portalButton}>
            <UserPlus className="h-4 w-4" />
            Invite someone
          </button>
        )}
      </ViewHeader>

      {inviting && (
        <Panel className="mb-5">
          <PanelTitle>Invite someone</PanelTitle>
          <InviteForm roles={assignable} onDone={() => setInviting(false)} />
        </Panel>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel className="!p-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-base font-bold md:text-lg">People</h2>
            <p className="text-xs text-blue-100/55">
              {active} active{invited ? ` · ${invited} invited` : ''}
            </p>
          </div>
          {members.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {members.map((m) => (
                <MemberItem key={m.pro_user_id} member={m} isViewer={m.pro_user_id === viewerId} roles={assignable} />
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-blue-100/55">Nobody is on the team yet.</p>
          )}
        </Panel>

        <Panel delay={0.1}>
          <PanelTitle>Roles</PanelTitle>
          <RoleLegend />
          {!canManage && <p className="mt-4 text-xs text-blue-100/50">Your company’s owner or admin adds people and changes roles.</p>}
        </Panel>
      </div>
    </>
  )
}

function MemberItem({ member: m, isViewer, roles }: { member: TeamRow; isViewer: boolean; roles: ContractorRole[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [result, setResult] = useState<Result | null>(null)
  const name = m.name?.trim() || m.email
  const status = STATUS[m.status]
  // The role picker offers what the viewer can give, plus the role they have now.
  const roleOptions = roles.includes(m.role) ? roles : [m.role, ...roles]

  const run = (action: () => Promise<Result>, confirm?: string) => {
    if (confirm && !window.confirm(confirm)) return
    setResult(null)
    start(async () => {
      const r = await action()
      setResult(r)
      if (r.ok) router.refresh()
    })
  }

  return (
    <li className="px-5 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-bold">
            {name
              .split(/[\s@]+/)
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase())
              .join('')}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span className="truncate">{name}</span>
              {isViewer && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-100/70">You</span>}
            </p>
            <p className="truncate text-xs text-blue-100/55">{m.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4 lg:w-[34rem] lg:shrink-0">
          <div className="min-w-0">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-100/40">Role</p>
            {m.manageable ? (
              <select
                aria-label={`Role for ${name}`}
                value={m.role}
                disabled={pending}
                onChange={(e) => run(() => changeTeamRole(m.pro_user_id, e.target.value))}
                className={twMerge(portalInput, 'mt-1 rounded-lg px-2 py-1.5 text-xs [&>option]:text-gray-900')}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_INFO[r].label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 font-semibold text-white" title={ROLE_INFO[m.role].summary}>
                {ROLE_INFO[m.role].label}
              </p>
            )}
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-100/40">Status</p>
            <div className="mt-1">
              <StatusPill status={status.pill} label={status.label} />
            </div>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-100/40">Last sign-in</p>
            <p className="mt-1 text-blue-50/85" title={m.last_login_at ? shortDate(m.last_login_at) : undefined}>
              {sinceLabel(m.last_login_at)}
            </p>
          </div>
          <div>
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-blue-100/40">Password</p>
            <p className={twMerge('mt-1 inline-flex items-center gap-1', m.has_password ? 'text-blue-50/85' : 'text-highlight')}>
              <KeyRound className="h-3 w-3" />
              {m.has_password ? 'Set' : 'Not yet'}
            </p>
          </div>
        </div>
      </div>

      {m.manageable && (
        <div className="mt-3 flex flex-wrap items-center gap-2 lg:pl-[3.25rem]">
          {(m.status === 'invited' || (!m.has_password && m.status !== 'disabled')) && (
            <ItemButton disabled={pending} onClick={() => run(() => resendTeamInvite(m.pro_user_id))}>
              <Mail className="h-3.5 w-3.5" /> Resend invite
            </ItemButton>
          )}
          <ItemButton
            disabled={pending}
            onClick={() =>
              m.status === 'disabled'
                ? run(() => setTeamAccess(m.pro_user_id, true))
                : run(() => setTeamAccess(m.pro_user_id, false), `Turn off ${name}’s access? They won’t be able to open the portal until it’s turned back on.`)
            }
          >
            <Power className="h-3.5 w-3.5" /> {m.status === 'disabled' ? 'Turn access on' : 'Turn access off'}
          </ItemButton>
          <ItemButton
            danger
            disabled={pending}
            onClick={() => run(() => removeTeamMember(m.pro_user_id), `Take ${name} off the team? Their Pro Hub account stays, and work assigned to them stays assigned.`)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </ItemButton>
          {pending && <Loader2 className="h-4 w-4 animate-spin text-blue-100/60" />}
          {result && (
            <span role="status" className={twMerge('text-xs', result.ok ? 'text-accent-light' : 'text-red-300')}>
              {result.ok ? result.message ?? 'Done' : result.error}
            </span>
          )}
        </div>
      )}
    </li>
  )
}

function ItemButton({ children, onClick, disabled, danger }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50',
        danger ? 'border-red-400/30 text-red-200 hover:bg-red-500/10' : 'border-white/12 text-blue-50/85 hover:bg-white/[0.08]',
      )}
    >
      {children}
    </button>
  )
}
