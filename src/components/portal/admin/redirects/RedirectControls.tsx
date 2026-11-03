'use client'

import React, { useState, useTransition } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { deleteRedirect, setRedirectEnabled } from '@/lib/portal/admin/redirect-actions'

/** On/off switch for one managed redirect (only enabled rows go live). */
export function EnabledSwitch({ id, enabled, label }: { id: string; enabled: boolean; label: string }) {
  const [on, setOn] = useState(enabled)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={pending}
        onClick={() => {
          const next = !on
          setOn(next)
          setError(null)
          start(async () => {
            const r = await setRedirectEnabled(id, next)
            if (!r.ok) {
              setOn(!next)
              setError(r.error)
            }
          })
        }}
        className={twMerge(
          'relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full ring-1 ring-inset transition disabled:opacity-60',
          on ? 'bg-adm-blue-bright ring-adm-blue-bright' : 'bg-adm-ink/15 ring-adm-ink/20',
        )}
      >
        <span
          aria-hidden="true"
          className={twMerge(
            'inline-block h-3.5 w-3.5 rounded-full bg-adm-bg shadow-sm ring-1 ring-adm-ink/20 transition-transform',
            on ? 'translate-x-[15px]' : 'translate-x-[2px]',
          )}
        />
      </button>
      <span className={twMerge('w-6 text-[11.5px] font-medium', on ? 'text-adm-blue-bright' : 'text-adm-muted')}>
        {pending ? <Loader2 aria-label="Saving" className="h-3.5 w-3.5 animate-spin" /> : on ? 'Live' : 'Off'}
      </span>
      {error && <span className="basis-full text-[11px] text-adm-red">{error}</span>}
    </span>
  )
}

/** Deletes one managed redirect after a confirm. */
export function DeleteRedirectButton({ id, source, destination }: { id: string; source: string; destination: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      disabled={pending}
      title="Delete"
      aria-label={`Delete redirect ${source}`}
      onClick={() => {
        if (!window.confirm(`Delete redirect ${source} → ${destination}?`)) return
        start(async () => {
          const r = await deleteRedirect(id)
          if (!r.ok) window.alert(r.error)
        })
      }}
      className="inline-grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-red-500/10 hover:text-adm-red disabled:opacity-60"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  )
}
