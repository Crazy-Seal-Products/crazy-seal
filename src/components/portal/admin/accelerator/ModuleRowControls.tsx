'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { moveModule, setModulePublished } from '@/lib/portal/admin/accelerator-actions'
import type { ActionResult } from '../controls'

const ICON_BUTTON =
  'grid h-7 w-7 place-items-center rounded-md border border-adm-line bg-adm-input text-adm-muted transition hover:border-adm-blue-bright/60 hover:text-adm-ink disabled:pointer-events-none disabled:opacity-35'

/** Reorder arrows and the Live/Draft switch for one module row. */
export function ModuleRowControls({ slug, published, first, last }: { slug: string; published: boolean; first: boolean; last: boolean }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const run = (action: () => Promise<ActionResult>) => {
    setError(null)
    start(async () => {
      const r = await action()
      if (!r.ok) setError(r.error)
    })
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {error && <span className="hidden max-w-[14rem] text-right text-[11px] leading-tight text-adm-red @xl:block">{error}</span>}
      {pending && <Loader2 aria-label="Saving" className="h-3.5 w-3.5 animate-spin text-adm-muted" />}
      <button
        type="button"
        role="switch"
        aria-checked={published}
        disabled={pending}
        onClick={() => run(() => setModulePublished(slug, !published))}
        title={error ?? (published ? 'Live in the portal. Click to move it to drafts.' : 'Draft. Click to publish it.')}
        className="hidden items-center gap-1.5 rounded-md px-1.5 py-1 text-[11.5px] font-medium text-adm-muted transition hover:text-adm-ink sm:inline-flex"
      >
        <span className={twMerge('relative h-4 w-7 rounded-full transition', published ? 'bg-adm-blue-bright' : 'bg-adm-ink/20')}>
          <span className={twMerge('absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all', published ? 'left-3.5' : 'left-0.5')} />
        </span>
        {published ? 'Live' : 'Draft'}
      </button>
      <button type="button" aria-label="Move up" disabled={pending || first} onClick={() => run(() => moveModule(slug, 'up'))} className={ICON_BUTTON}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" aria-label="Move down" disabled={pending || last} onClick={() => run(() => moveModule(slug, 'down'))} className={ICON_BUTTON}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
