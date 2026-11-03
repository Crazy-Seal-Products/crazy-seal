'use client'

import React, { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { saveRedirect, type RedirectInput } from '@/lib/portal/admin/redirect-actions'
import { BUTTON, inputCls, labelCls } from '../styles'

/** Add / edit form for one managed redirect. Saves through a server action, then closes. */
export function RedirectForm({ id, initial, closeHref }: { id: string | null; initial: RedirectInput; closeHref: string }) {
  const router = useRouter()
  const [v, setV] = useState<RedirectInput>(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const set = (patch: Partial<RedirectInput>) => {
    setV((x) => ({ ...x, ...patch }))
    setError(null)
  }

  return (
    <form
      className="grid gap-2.5 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        setError(null)
        start(async () => {
          const r = await saveRedirect(id, v)
          if (r.ok) router.push(closeHref, { scroll: false })
          else setError(r.error)
        })
      }}
    >
      <div className="grid gap-2.5 @xl:grid-cols-2">
        <label className={labelCls}>
          <span>Source path</span>
          <input
            className={inputCls}
            value={v.source}
            onChange={(e) => set({ source: e.target.value })}
            placeholder="/old-page"
            autoFocus
            required
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </label>
        <label className={labelCls}>
          <span>Destination</span>
          <input
            className={inputCls}
            value={v.destination}
            onChange={(e) => set({ destination: e.target.value })}
            placeholder="/new-page or https://…"
            required
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
        </label>
        <label className={labelCls}>
          <span>Notes (optional)</span>
          <input className={inputCls} value={v.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="Why this redirect exists" />
        </label>
        <label className={labelCls}>
          <span>Type</span>
          <select className={inputCls} value={v.permanent ? '301' : '302'} onChange={(e) => set({ permanent: e.target.value === '301' })}>
            <option value="301">Permanent (301)</option>
            <option value="302">Temporary (302)</option>
          </select>
        </label>
      </div>
      <p className="text-[11.5px] leading-snug text-adm-muted">
        The source is a path on crazyseal.com; a trailing slash is ignored. Saved redirects go live within a minute.
      </p>
      {error && (
        <p role="alert" className="rounded-md bg-red-500/10 px-2.5 py-1.5 text-[12px] text-adm-red ring-1 ring-inset ring-red-400/30">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {id ? 'Save changes' : 'Create redirect'}
        </button>
        <Link href={closeHref} scroll={false} className={BUTTON.default}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
