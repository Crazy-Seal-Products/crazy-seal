'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2, Plus } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { saveRep, type RepInput } from '@/lib/portal/admin/rep-actions'
import { BUTTON, inputCls } from './styles'

export interface RepEditorRow {
  id: string
  name: string
  staffEmail: string | null
  monthlyGoal: number | null
  active: boolean
}

type Login = { email: string; name: string; role: string | null }

const cell = 'px-2 py-1.5 align-middle'

/** One editable rep: name (their order tag), linked login, monthly goal, active. */
function RepRow({ rep, logins, taken }: { rep: RepEditorRow | null; logins: Login[]; taken: Set<string> }) {
  const router = useRouter()
  const initial: RepInput = {
    name: rep?.name ?? '',
    staffEmail: rep?.staffEmail ?? '',
    monthlyGoal: rep?.monthlyGoal != null ? String(rep.monthlyGoal) : '',
    active: rep?.active ?? true,
  }
  const [v, setV] = useState<RepInput>(initial)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const dirty = JSON.stringify(v) !== JSON.stringify(initial)
  const set = (patch: Partial<RepInput>) => {
    setV((x) => ({ ...x, ...patch }))
    setSaved(false)
    setError(null)
  }

  return (
    <tr className={twMerge('border-t border-adm-line-soft', !v.active && 'opacity-60')}>
      <td className={cell}>
        <input
          className={twMerge(inputCls, 'min-w-[7rem]')}
          aria-label="Name as tagged on orders"
          value={v.name}
          placeholder={rep ? undefined : 'New rep’s tag'}
          onChange={(e) => set({ name: e.target.value })}
          spellCheck={false}
          autoComplete="off"
        />
      </td>
      <td className={cell}>
        <select className={twMerge(inputCls, 'min-w-[11rem]')} aria-label="Admin login" value={v.staffEmail} onChange={(e) => set({ staffEmail: e.target.value })}>
          <option value="">Not linked</option>
          {logins.map((l) => (
            <option key={l.email} value={l.email} disabled={taken.has(l.email) && l.email !== rep?.staffEmail}>
              {l.name} · {l.email}
              {l.role === 'sales_rep' ? ' (Sales rep)' : ''}
            </option>
          ))}
        </select>
      </td>
      <td className={cell}>
        <input
          className={twMerge(inputCls, 'w-28 text-right tabular-nums')}
          aria-label="Monthly goal in dollars"
          inputMode="decimal"
          placeholder="No goal"
          value={v.monthlyGoal}
          onChange={(e) => set({ monthlyGoal: e.target.value })}
        />
      </td>
      <td className={twMerge(cell, 'text-center')}>
        <input type="checkbox" aria-label="Active" checked={v.active} onChange={(e) => set({ active: e.target.checked })} className="h-4 w-4 accent-[var(--adm-chart-gold)]" />
      </td>
      <td className={twMerge(cell, 'whitespace-nowrap')}>
        <span className="inline-flex items-center gap-2">
          <button
            type="button"
            disabled={pending || !dirty || !v.name.trim()}
            className={rep ? BUTTON.default : BUTTON.gold}
            onClick={() =>
              start(async () => {
                const r = await saveRep(rep?.id ?? null, v)
                if (!r.ok) return setError(r.error)
                setSaved(true)
                if (!rep) setV({ name: '', staffEmail: '', monthlyGoal: '', active: true })
                router.refresh()
              })
            }
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : rep ? null : <Plus className="h-3.5 w-3.5" />}
            {rep ? 'Save' : 'Add rep'}
          </button>
          {saved && !dirty && <Check aria-label="Saved" className="h-3.5 w-3.5 text-adm-green" />}
          {error && <span className="max-w-[16rem] whitespace-normal text-[11px] leading-snug text-adm-red">{error}</span>}
        </span>
      </td>
    </tr>
  )
}

/** The roster: each rep's order tag, their admin login, an optional monthly goal. */
export function RepEditor({ reps, logins }: { reps: RepEditorRow[]; logins: Login[] }) {
  const taken = new Set(reps.map((r) => r.staffEmail).filter(Boolean) as string[])
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[12.5px]">
        <thead>
          <tr className="text-[10.5px] font-semibold uppercase tracking-wider text-adm-muted">
            <th className={cell}>Order tag</th>
            <th className={cell}>Admin login</th>
            <th className={twMerge(cell, 'text-right')}>Monthly goal</th>
            <th className={twMerge(cell, 'text-center')}>Active</th>
            <th className={cell}>
              <span className="sr-only">Save</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reps.map((r) => (
            <RepRow key={`${r.id}:${r.name}:${r.staffEmail}:${r.monthlyGoal}:${r.active}`} rep={r} logins={logins} taken={taken} />
          ))}
          <RepRow key={`new:${reps.length}`} rep={null} logins={logins} taken={taken} />
        </tbody>
      </table>
    </div>
  )
}
