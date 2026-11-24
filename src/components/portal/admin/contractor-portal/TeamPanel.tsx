'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  addContractorPerson,
  removeContractorMember,
  resendContractorInvite,
  setContractorMemberAccess,
  setContractorMemberRole,
} from '@/lib/portal/admin/contractor-portal-actions'
import { CONTRACTOR_ROLES, ROLE_INFO, type ContractorRole } from '@/lib/contractor/roles'
import type { TeamMember } from '@/lib/contractor/types'
import { shortDate, sinceLabel } from '@/lib/contractor/dates'
import { MAGIC_LINK_MINUTES } from '@/lib/pro/config'
import { ActionButton, SaveState, StatusSelect, type ActionResult } from '../controls'
import { BUTTON, inputCls, labelCls } from '../styles'
import { Badge, Empty, Panel, Table, TBody, Td, Th, THead, Tr } from '../ui'

const ROLE_OPTIONS = CONTRACTOR_ROLES.map((r) => ({ key: r, label: ROLE_INFO[r].label }))

const STATUS_BADGE: Record<TeamMember['status'], { tone: 'good' | 'warn' | 'bad'; label: string }> = {
  active: { tone: 'good', label: 'Active' },
  invited: { tone: 'warn', label: 'Invited' },
  disabled: { tone: 'bad', label: 'Access off' },
}

/**
 * The contractor's portal team in the admin: each person's role and access,
 * resend and remove, and "Add person" (usually their owner, who gets an email
 * to set a password). Actions are in contractor-portal-actions.
 */
export function TeamPanel({
  contractorId,
  members,
  suggested,
  actions,
}: {
  contractorId: string
  members: TeamMember[]
  /** Prefills Add person when the team is empty: the contact on the contractor record. */
  suggested: { email: string; name: string } | null
  actions?: React.ReactNode
}) {
  const [adding, setAdding] = useState(members.length === 0)
  const owners = members.filter((m) => m.role === 'owner' && m.status !== 'disabled').length

  return (
    <Panel
      title="Contractor portal"
      meta={members.length ? `${members.length} on the team${owners ? '' : ' · no owner yet'}` : 'nobody on the team yet'}
      tone="dealers"
      className="mb-2"
      actions={
        <>
          {actions}
          {!adding && (
            <button type="button" onClick={() => setAdding(true)} className={BUTTON.default}>
              <UserPlus className="h-3.5 w-3.5" /> Add person
            </button>
          )}
        </>
      }
    >
      {members.length ? (
        <Table>
          <THead>
            <Th>Person</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th className="hidden @2xl:table-cell">Last sign-in</Th>
            <Th className="hidden @3xl:table-cell">Password</Th>
            <Th align="right"> </Th>
          </THead>
          <TBody>
            {members.map((m) => (
              <Tr key={m.pro_user_id}>
                <Td className="max-w-[16rem]">
                  <span className="block truncate font-semibold text-adm-ink">{m.name?.trim() || m.email}</span>
                  <span className="block truncate text-[11px] text-adm-muted">{m.email}</span>
                </Td>
                <Td>
                  <StatusSelect
                    label={`Role for ${m.email}`}
                    value={m.role}
                    options={ROLE_OPTIONS}
                    action={(role) => setContractorMemberRole(contractorId, m.pro_user_id, role)}
                  />
                </Td>
                <Td>
                  <Badge tone={STATUS_BADGE[m.status].tone}>{STATUS_BADGE[m.status].label}</Badge>
                </Td>
                <Td muted className="hidden @2xl:table-cell" title={m.last_login_at ?? undefined}>
                  {m.last_login_at ? `${shortDate(m.last_login_at)} · ${sinceLabel(m.last_login_at)}` : 'Never'}
                </Td>
                <Td muted className="hidden @3xl:table-cell">
                  {m.has_password ? 'Set' : 'Not yet'}
                </Td>
                <Td align="right">
                  <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
                    {m.status !== 'disabled' && (m.status === 'invited' || !m.has_password) && (
                      <ActionButton action={() => resendContractorInvite(contractorId, m.pro_user_id)} className="h-7 px-2 text-[11.5px]">
                        Resend invite
                      </ActionButton>
                    )}
                    <ActionButton
                      action={() => setContractorMemberAccess(contractorId, m.pro_user_id, m.status === 'disabled' ? 'on' : 'off')}
                      confirm={m.status === 'disabled' ? undefined : `Turn off ${m.email}’s portal access?`}
                      className="h-7 px-2 text-[11.5px]"
                    >
                      {m.status === 'disabled' ? 'Turn on' : 'Turn off'}
                    </ActionButton>
                    <ActionButton
                      tone="danger"
                      action={() => removeContractorMember(contractorId, m.pro_user_id)}
                      confirm={`Take ${m.email} off this contractor’s team? Their Pro Hub account stays.`}
                      className="h-7 px-2 text-[11.5px]"
                    >
                      Remove
                    </ActionButton>
                  </span>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      ) : (
        <Empty>
          Nobody can open this contractor’s portal yet. Add their owner below, or they can activate it themselves with Forgot password on the Pro Hub sign-in, using the email on this record.
        </Empty>
      )}
      {adding && <AddPersonForm contractorId={contractorId} suggested={members.length ? null : suggested} onClose={members.length ? () => setAdding(false) : undefined} />}
    </Panel>
  )
}

function AddPersonForm({
  contractorId,
  suggested,
  onClose,
}: {
  contractorId: string
  suggested: { email: string; name: string } | null
  onClose?: () => void
}) {
  const router = useRouter()
  const [email, setEmail] = useState(suggested?.email ?? '')
  const [name, setName] = useState(suggested?.name ?? '')
  const [role, setRole] = useState<ContractorRole>('owner')
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setResult(null)
        start(async () => {
          const r = await addContractorPerson(contractorId, { email, name, role })
          setResult(r)
          if (r.ok) {
            setEmail('')
            setName('')
            router.refresh()
          }
        })
      }}
      className="grid gap-2 border-t border-adm-line px-3 py-2.5 @2xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_10rem_auto] @2xl:items-end"
    >
      <label className={labelCls}>
        <span>Email</span>
        <input type="email" required className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@company.com" />
      </label>
      <label className={labelCls}>
        <span>Name</span>
        <input className={inputCls} value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className={labelCls}>
        <span>Role</span>
        <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as ContractorRole)}>
          {ROLE_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <span className="flex items-center gap-1.5">
        <button type="submit" disabled={pending || !email} className={BUTTON.gold}>
          Add and email invite
        </button>
        {onClose && (
          <button type="button" onClick={onClose} className={BUTTON.default}>
            Cancel
          </button>
        )}
      </span>
      <p className={twMerge('text-[11px] text-adm-muted @2xl:col-span-4')}>
        {ROLE_INFO[role].summary} They get an email with a link to set a password, which opens their portal. The link expires after {MAGIC_LINK_MINUTES} minutes; after that, Forgot password sends a new one.
      </p>
      <span className="@2xl:col-span-4">
        <SaveState pending={pending} saved={Boolean(result?.ok)} error={result && !result.ok ? result.error : null} />
        {result?.ok && result.message && <span className="ml-1.5 text-[11.5px] text-adm-green">{result.message}</span>}
      </span>
    </form>
  )
}
