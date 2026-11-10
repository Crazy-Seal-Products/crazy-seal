'use client'

import React, { useActionState, useState } from 'react'
import { Loader2, Lock, Save } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { saveRolePermissions } from '@/lib/portal/admin/staff-actions'
import type { PermissionMatrix as Matrix } from '@/lib/portal/admin/permissions'
import { ADMIN_ROLES, ADMIN_SECTIONS, TOP_ROLE } from '@/lib/portal/admin/sections'
import type { ActionResult } from './controls'
import { BUTTON } from './styles'
import { BORDER } from './ui'

/** Roles × sections. Super admins always have every box; only they can change the rest. */
export function PermissionMatrix({ matrix, canEdit, counts }: { matrix: Matrix; canEdit: boolean; counts: Record<string, number> }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(saveRolePermissions, null)
  const [dirty, setDirty] = useState(false)
  const groups = [...new Set(ADMIN_SECTIONS.map((s) => s.group))]

  return (
    <form
      action={(fd) => {
        setDirty(false)
        action(fd)
      }}
      onChange={() => setDirty(true)}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-[12.5px] text-adm-text">
          <thead>
            <tr className={twMerge('border-b bg-adm-head text-[10.5px] uppercase tracking-[0.08em] text-adm-muted', BORDER)}>
              <th scope="col" className="px-3 py-1.5 font-semibold">
                Section
              </th>
              {ADMIN_ROLES.map((r) => (
                <th key={r.key} scope="col" className="w-28 px-3 py-1.5 text-center font-semibold">
                  {r.label}
                  <span className="block text-[10px] font-medium normal-case tracking-normal text-adm-faint">
                    {counts[r.key] ?? 0} {(counts[r.key] ?? 0) === 1 ? 'person' : 'people'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((group) => (
            <tbody key={group} className="divide-y divide-adm-line-soft">
              <tr>
                <th colSpan={ADMIN_ROLES.length + 1} scope="colgroup" className="bg-adm-ink/[0.03] px-3 pb-1 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-adm-muted">
                  {group}
                </th>
              </tr>
              {ADMIN_SECTIONS.filter((s) => s.group === group).map((s) => (
                <tr key={s.key} className="transition-colors hover:bg-adm-ink/[0.03]">
                  <th scope="row" className="px-3 py-1.5 font-medium text-adm-ink">
                    {s.label}
                  </th>
                  {ADMIN_ROLES.map((r) => {
                    const top = r.key === TOP_ROLE
                    return (
                      <td key={r.key} className="px-3 py-1.5 text-center">
                        {top ? (
                          <span title="Super admins always have every section" className="inline-flex text-adm-faint">
                            <Lock className="h-3.5 w-3.5" aria-label={`${r.label} always has ${s.label}`} />
                          </span>
                        ) : (
                          <input
                            type="checkbox"
                            name={`perm:${r.key}:${s.key}`}
                            defaultChecked={matrix[r.key].includes(s.key)}
                            disabled={!canEdit || pending}
                            aria-label={`${r.label} can open ${s.label}`}
                            className="h-4 w-4 cursor-pointer accent-[#2f80d8] disabled:cursor-not-allowed"
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className={twMerge('flex flex-wrap items-center gap-2 border-t px-3 py-2', BORDER)}>
        {canEdit ? (
          <>
            <button type="submit" disabled={pending || !dirty} className={BUTTON.gold}>
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save permissions
            </button>
            {dirty && !pending && <span className="text-[11.5px] text-adm-warn">Unsaved changes</span>}
            {!dirty && state && <span className={twMerge('text-[11.5px]', state.ok ? 'text-adm-green' : 'text-adm-red')}>{state.ok ? state.message ?? 'Saved' : state.error}</span>}
          </>
        ) : (
          <span className="text-[11.5px] text-adm-muted">Only a Super admin can change these.</span>
        )}
        <span className="ml-auto text-[11px] text-adm-faint">Takes effect within a minute. Hidden sections also disappear from the sidebar.</span>
      </div>
    </form>
  )
}
