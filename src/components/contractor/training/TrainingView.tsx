'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react'
import { currentModule, moduleMinutes, moduleProgress, programProgress } from '@/lib/portal/modules'
import { TRAINING_LABEL } from '@/lib/contractor/nav'
import { Panel, ProgressBar, ViewHeader } from '@/components/portal/ui'
import { portalButton } from '@/components/portal/portal-styles'
import { useTraining } from './TrainingProvider'

/**
 * Training (the Accelerator Program's modules), as a plain list in the
 * portal's Thermo look: one row per module with its lessons, time and this
 * person's progress, and a Resume button. Progress is kept in their browser.
 */
export function TrainingView() {
  const { program, modules, completed } = useTraining()

  if (!modules.length) {
    return (
      <>
        <ViewHeader kicker={TRAINING_LABEL} title={program.title} description={program.description} />
        <Panel>
          <p className="py-8 text-center text-sm text-[var(--p-muted)]">No modules are published yet. Check back soon.</p>
        </Panel>
      </>
    )
  }

  const progress = programProgress(modules, completed)
  const current = currentModule(modules, completed)
  const done = progress.pct === 100

  return (
    <>
      <ViewHeader kicker={TRAINING_LABEL} title={program.title} description={program.description}>
        {!done && (
          <Link href={`/portal/training/${current.slug}/`} className={portalButton}>
            <PlayCircle className="h-4 w-4" /> {progress.done ? 'Resume' : 'Start'}: Module {current.number}
          </Link>
        )}
      </ViewHeader>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--p-primary)]">Your progress</p>
          <p className="text-sm text-[var(--p-muted)]">
            {progress.done} of {progress.total} lessons · {progress.pct}%
          </p>
        </div>
        <ProgressBar pct={progress.pct} />

        <ul className="mt-6 divide-y divide-white/[0.06]">
          {modules.map((m) => {
            const p = moduleProgress(m, completed)
            const complete = p.pct === 100
            return (
              <li key={m.slug}>
                <Link href={`/portal/training/${m.slug}/`} className="group flex items-center gap-4 py-4">
                  <span
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums"
                    style={
                      complete
                        ? { background: 'var(--p-primary)', color: 'var(--p-primary-ink)' }
                        : { background: 'rgba(255,255,255,0.06)', color: 'var(--p-muted)' }
                    }
                  >
                    {complete ? <CheckCircle2 className="h-4 w-4" /> : m.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-[var(--p-ink)]">{m.title}</span>
                    <span className="mt-0.5 block truncate text-sm text-[var(--p-muted)]">{m.summary}</span>
                  </span>
                  <span className="hidden w-40 shrink-0 sm:block">
                    <span className="flex justify-between text-xs text-[var(--p-muted)]">
                      <span>
                        {m.lessons.length} lessons · {moduleMinutes(m)} min
                      </span>
                      <span className="tabular-nums">
                        {p.done}/{p.total}
                      </span>
                    </span>
                    <ProgressBar pct={p.pct} className="mt-1.5" delay={0} />
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[var(--p-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--p-ink)]" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Panel>
    </>
  )
}
