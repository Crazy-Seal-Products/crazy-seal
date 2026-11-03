'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { saveProgram } from '@/lib/portal/admin/accelerator-actions'
import type { AcceleratorProgram } from '@/lib/portal/modules'
import type { ActionResult } from '../controls'
import { BUTTON, inputCls, labelCls, textareaCls } from '../styles'

/** Name, headline and intro shown above the modules in the Pro Portal. */
export function ProgramForm({ initial }: { initial: AcceleratorProgram }) {
  const [v, setV] = useState(initial)
  const [result, setResult] = useState<ActionResult | null>(null)
  const [pending, start] = useTransition()
  const set = (patch: Partial<AcceleratorProgram>) => {
    setV((x) => ({ ...x, ...patch }))
    setResult(null)
  }
  const dirty = v.name !== initial.name || v.title !== initial.title || v.description !== initial.description

  return (
    <form
      className="grid gap-2.5 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => setResult(await saveProgram(v)))
      }}
    >
      <label className={labelCls}>
        <span>Program name</span>
        <input className={inputCls} value={v.name} onChange={(e) => set({ name: e.target.value })} required maxLength={80} />
      </label>
      <label className={labelCls}>
        <span>Headline</span>
        <input className={inputCls} value={v.title} onChange={(e) => set({ title: e.target.value })} required maxLength={120} />
      </label>
      <label className={labelCls}>
        <span>Intro</span>
        <textarea className={textareaCls} rows={3} value={v.description} onChange={(e) => set({ description: e.target.value })} maxLength={400} />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={pending || !dirty} className={BUTTON.gold}>
          {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Save details
        </button>
        {result && <span className={twMerge('text-[11.5px]', result.ok ? 'text-adm-green' : 'text-adm-red')}>{result.ok ? result.message : result.error}</span>}
      </div>
    </form>
  )
}
