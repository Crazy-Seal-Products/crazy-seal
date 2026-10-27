'use client'

import React, { useState, useTransition } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { BUTTON } from './styles'

/**
 * Small interactive pieces for admin pages: they call server actions passed
 * in as props (already bound to the record id) and show saving / saved state.
 */

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string }

export function SaveState({ pending, saved, error }: { pending: boolean; saved: boolean; error: string | null }) {
  if (pending) return <Loader2 aria-label="Saving" className="h-3.5 w-3.5 shrink-0 animate-spin text-adm-muted" />
  if (error) return <span className="text-[11px] text-adm-red">{error}</span>
  if (saved) return <Check aria-label="Saved" className="h-3.5 w-3.5 shrink-0 text-adm-green" />
  return null
}

/** A select that saves as soon as it changes. */
export function StatusSelect({
  value,
  options,
  action,
  label,
  className,
}: {
  value: string
  options: readonly { key: string; label: string }[]
  action: (value: string) => Promise<ActionResult>
  label: string
  className?: string
}) {
  const [current, setCurrent] = useState(value)
  const [pending, start] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <span className={twMerge('inline-flex items-center gap-1.5', className)}>
      <select
        aria-label={label}
        value={current}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value
          const prev = current
          setCurrent(next)
          setSaved(false)
          setError(null)
          start(async () => {
            const r = await action(next)
            if (r.ok) setSaved(true)
            else {
              setCurrent(prev)
              setError(r.error)
            }
          })
        }}
        className="h-7 rounded-md border border-adm-line bg-adm-input px-1.5 text-[12px] text-adm-ink focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25 disabled:opacity-60"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <SaveState pending={pending} saved={saved} error={error} />
    </span>
  )
}

/** A button that runs one server action and reports the result next to it. */
export function ActionButton({
  action,
  children,
  confirm,
  tone = 'default',
  className,
}: {
  action: () => Promise<ActionResult>
  children: React.ReactNode
  confirm?: string
  tone?: 'default' | 'gold' | 'danger'
  className?: string
}) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return
          setResult(null)
          start(async () => setResult(await action()))
        }}
        className={twMerge(BUTTON[tone], className)}
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
      {result && <span className={twMerge('text-[11.5px]', result.ok ? 'text-adm-green' : 'text-adm-red')}>{result.ok ? result.message ?? 'Done' : result.error}</span>}
    </span>
  )
}
