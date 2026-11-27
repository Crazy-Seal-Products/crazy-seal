'use client'

import { useActionState, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { moveProjectStage } from '@/lib/contractor/project-actions'
import type { PortalResult } from '@/lib/contractor/guard'
import { PROJECT_STAGE_LABEL, PROJECT_STAGES, type ProjectStage } from '@/lib/contractor/types'
import { ChevronSelect, OPTION_STYLE } from './kit'

/** A compact "Move to…" dropdown for a project card: picking a stage moves it. */
export function MoveStageSelect({ projectId, projectName, stage, className }: { projectId: string; projectName: string; stage: ProjectStage; className?: string }) {
  const [state, action, pending] = useActionState<PortalResult | null, FormData>(moveProjectStage, null)
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action} className={className}>
      <input type="hidden" name="id" value={projectId} />
      <div className="relative">
        <ChevronSelect
          key={stage}
          name="stage"
          aria-label={`Move ${projectName}`}
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) formRef.current?.requestSubmit()
          }}
          className={twMerge(
            '!rounded-xl !bg-black/25 !py-1.5 !pl-3 !text-xs font-semibold text-[var(--p-muted,#9DA3AB)]',
            'hover:border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] hover:text-[var(--p-ink,#fff)] disabled:opacity-60',
          )}
        >
          <option value="" disabled style={OPTION_STYLE}>
            Move to…
          </option>
          {PROJECT_STAGES.filter((s) => s !== stage).map((s) => (
            <option key={s} value={s} style={OPTION_STYLE}>
              {s === 'lost' ? 'Mark lost' : `Move to ${PROJECT_STAGE_LABEL[s]}`}
            </option>
          ))}
        </ChevronSelect>
        {pending && <Loader2 className="absolute right-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--p-primary,#6DC015)]" />}
      </div>
      {state && !state.ok && <p className="mt-1 text-[11px] text-red-200">{state.error}</p>}
    </form>
  )
}
