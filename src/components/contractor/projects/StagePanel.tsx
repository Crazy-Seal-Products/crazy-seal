'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalResult } from '@/lib/contractor/guard'
import { moveProjectStage, setInstallStep } from '@/lib/contractor/project-actions'
import {
  BOARD_STAGES,
  INSTALL_STEP_LABEL,
  INSTALL_STEPS,
  PROJECT_STAGE_LABEL,
  PROJECT_STAGES,
  type InstallStep,
  type ProjectStage,
} from '@/lib/contractor/types'
import { dateLong } from '@/lib/portal/admin/format'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, FormNotice, INSTALL_COLOR, MiniLabel, OPTION_STYLE, StagePill } from './kit'

interface StageProject {
  id: string
  name: string
  stage: ProjectStage
  install_step: InstallStep | null
  start_date: string | null
  completed_on: string | null
}

/** "Dec 4, 2026" from a date column (YYYY-MM-DD), without a time-zone shift. */
function day(d: string | null): string {
  return d ? dateLong(`${d}T12:00:00Z`) : '—'
}

/** How far along a project is, 0-100: halfway through its stage, or through the install steps while installing. */
export function progressOf(stage: ProjectStage, step: InstallStep | null): number {
  if (stage === 'complete') return 100
  if (stage === 'lost') return 0
  const i = BOARD_STAGES.indexOf(stage)
  if (i < 0) return 0
  const within = stage === 'in_progress' && step ? (INSTALL_STEPS.indexOf(step) + 1) / (INSTALL_STEPS.length + 1) : 0.5
  return Math.round(((i + within) / (BOARD_STAGES.length - 1)) * 100)
}

const GRADIENT_TEXT = 'bg-[linear-gradient(120deg,var(--p-primary,#6DC015),var(--p-accent,#F9EA1C))] bg-clip-text text-transparent'

/**
 * Where a project is, as Thermo's job card: the stage stepper (Lead to
 * Complete) with its percent, where the crew is while installing, and, for
 * people who can edit, the next step, Move to… and Mark lost.
 */
export function StagePanel({ project, canEdit }: { project: StageProject; canEdit: boolean }) {
  const [moveState, move, moving] = useActionState<PortalResult | null, FormData>(moveProjectStage, null)
  const [stepState, step, stepping] = useActionState<PortalResult | null, FormData>(setInstallStep, null)
  const current = BOARD_STAGES.indexOf(project.stage)
  const lost = project.stage === 'lost'
  const complete = project.stage === 'complete'
  const next = !lost && current >= 0 ? BOARD_STAGES[current + 1] : undefined
  const pct = progressOf(project.stage, project.install_step)
  const installing = project.stage === 'in_progress'
  const stepIndex = project.install_step ? INSTALL_STEPS.indexOf(project.install_step) : -1
  const hereFill = installing ? `${Math.max(12, Math.round(((stepIndex + 1) / (INSTALL_STEPS.length + 1)) * 100))}%` : '55%'

  return (
    <Panel delay={0.05} className="overflow-hidden">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.12] blur-3xl"
      />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <MiniLabel>Progress</MiniLabel>
          <h2 className="mt-1.5 text-lg font-bold text-[var(--p-ink,#fff)] md:text-xl">
            {lost ? 'Lost' : PROJECT_STAGE_LABEL[project.stage]}
            {installing && project.install_step && <span className="text-[var(--p-muted,#9DA3AB)]"> · {INSTALL_STEP_LABEL[project.install_step]}</span>}
          </h2>
          {(project.start_date || (complete && project.completed_on)) && (
            <p className="mt-1 text-xs text-[var(--p-muted,#9DA3AB)]">
              {project.start_date && <>Started {day(project.start_date)}</>}
              {project.start_date && complete && project.completed_on && ' · '}
              {complete && project.completed_on && <>Completed {day(project.completed_on)}</>}
            </p>
          )}
        </div>
        {lost ? (
          <StagePill stage="lost" className="px-3 py-1.5 text-xs" />
        ) : (
          <span className={twMerge('text-3xl font-black tabular-nums md:text-4xl', GRADIENT_TEXT)}>
            <CountUp value={pct} suffix="%" />
          </span>
        )}
      </div>

      {lost && (
        <p className="relative mt-5 flex items-center gap-2 rounded-2xl border border-[#FF7A6B]/25 bg-[#FF7A6B]/10 px-4 py-3 text-sm text-[#FFC2B8]">
          <XCircle className="h-4 w-4 shrink-0" /> This project was lost. {canEdit ? 'Move it back to a stage to reopen it.' : ''}
        </p>
      )}

      <ol className={twMerge('relative mt-7 grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-6', lost && 'opacity-40 grayscale')}>
        {BOARD_STAGES.map((s, i) => {
          const done = !lost && (i < current || complete)
          const here = !lost && i === current && !complete
          return (
            <li key={s} className="flex flex-col items-center gap-2.5 text-center">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  className={twMerge(
                    'absolute inset-y-0 left-0 rounded-full',
                    here
                      ? 'bg-[var(--p-accent,#F9EA1C)] shadow-[0_0_12px_var(--p-accent)]'
                      : 'bg-gradient-to-r from-[var(--p-primary-deep,#3F7F0C)] to-[var(--p-primary,#6DC015)] shadow-[0_0_10px_-2px_var(--p-primary)]',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : here ? hereFill : '0%' }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.25 + i * 0.12 }}
                />
              </div>
              {done ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.45 + i * 0.12 }}>
                  <CheckCircle2 className="h-4 w-4 text-[var(--p-primary,#6DC015)] drop-shadow-[0_0_6px_var(--p-primary)]" />
                </motion.span>
              ) : here ? (
                <span className="relative grid h-4 w-4 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[var(--p-accent,#F9EA1C)] opacity-40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--p-accent,#F9EA1C)] shadow-[0_0_10px_var(--p-accent)]" />
                </span>
              ) : (
                <Circle className="h-4 w-4 text-white/15" />
              )}
              <span
                className={twMerge(
                  'text-[11px] leading-tight',
                  here ? 'font-semibold text-[var(--p-ink,#fff)]' : done ? 'text-[var(--p-ink,#fff)] opacity-80' : 'text-[var(--p-muted,#9DA3AB)]',
                )}
              >
                {PROJECT_STAGE_LABEL[s]}
              </span>
            </li>
          )
        })}
      </ol>

      {installing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.5 }}
          className="relative mt-7 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <MiniLabel className="text-[var(--p-kicker,#F9EA1C)]">On the roof</MiniLabel>
            <span className="text-xs text-[var(--p-muted,#9DA3AB)]">
              {stepIndex >= 0 ? `Step ${stepIndex + 1} of ${INSTALL_STEPS.length}` : canEdit ? 'Where’s the crew? Pick a step.' : 'Not started yet'}
            </span>
          </div>
          <ol className="relative mt-5 grid grid-cols-4 gap-2">
            <span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[15px] h-1 rounded-full bg-white/[0.08]">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, var(--p-primary, #6DC015), ${INSTALL_COLOR})`, boxShadow: `0 0 12px ${INSTALL_COLOR}` }}
                initial={{ width: 0 }}
                animate={{ width: stepIndex > 0 ? `${(stepIndex / (INSTALL_STEPS.length - 1)) * 100}%` : '0%' }}
                transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.6 }}
              />
            </span>
            {INSTALL_STEPS.map((s, i) => {
              const active = project.install_step === s
              const done = stepIndex > i
              const node = (
                <span
                  className={twMerge(
                    'relative grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition duration-300',
                    done && 'bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[0_6px_16px_-6px_var(--p-primary)]',
                    active && 'text-[#1d1300]',
                    !done && !active && 'bg-white/[0.06] text-[var(--p-muted,#9DA3AB)] ring-1 ring-white/10',
                  )}
                  style={active ? { background: INSTALL_COLOR, boxShadow: `0 0 0 4px color-mix(in oklab, ${INSTALL_COLOR} 25%, transparent), 0 0 18px ${INSTALL_COLOR}` } : undefined}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
              )
              const label = (
                <span
                  className={twMerge(
                    'text-[11px] leading-tight',
                    active ? 'font-semibold text-[var(--p-ink,#fff)]' : done ? 'text-[var(--p-ink,#fff)] opacity-80' : 'text-[var(--p-muted,#9DA3AB)]',
                  )}
                >
                  {INSTALL_STEP_LABEL[s]}
                </span>
              )
              return (
                <li key={s} className="relative flex flex-col items-center text-center">
                  {canEdit ? (
                    <form action={step} className="contents">
                      <input type="hidden" name="id" value={project.id} />
                      <input type="hidden" name="install_step" value={s} />
                      <button
                        type="submit"
                        disabled={stepping || active}
                        aria-pressed={active}
                        aria-label={`Crew is on: ${INSTALL_STEP_LABEL[s]}`}
                        className="group flex flex-col items-center gap-2 rounded-xl px-1 pb-1 outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[var(--p-primary,#6DC015)] disabled:cursor-default disabled:hover:translate-y-0"
                      >
                        {node}
                        {label}
                      </button>
                    </form>
                  ) : (
                    <span className="flex flex-col items-center gap-2 px-1 pb-1">
                      {node}
                      {label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          {stepping && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[var(--p-muted,#9DA3AB)]">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving…
            </p>
          )}
          <FormNotice state={stepState && !stepState.ok ? stepState : null} className="mt-3" />
        </motion.div>
      )}

      {canEdit && (
        <div className="relative mt-7 flex flex-wrap items-center gap-2 border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-5">
          {next && (
            <form action={move}>
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="stage" value={next} />
              <button type="submit" disabled={moving} className={portalButton}>
                {moving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Move to {PROJECT_STAGE_LABEL[next]}
              </button>
            </form>
          )}
          <form action={move} className="flex items-center gap-2">
            <input type="hidden" name="id" value={project.id} />
            <ChevronSelect key={project.stage} name="stage" defaultValue="" required aria-label="Move to stage" className="!w-auto !rounded-full !py-2 !text-sm">
              <option value="" disabled style={OPTION_STYLE}>
                Move to…
              </option>
              {PROJECT_STAGES.filter((s) => s !== project.stage && s !== 'lost').map((s) => (
                <option key={s} value={s} style={OPTION_STYLE}>
                  {PROJECT_STAGE_LABEL[s]}
                </option>
              ))}
            </ChevronSelect>
            <button type="submit" disabled={moving} className={portalGhostButton}>
              Move
            </button>
          </form>
          {!lost && (
            <form action={move} className="sm:ml-auto">
              <input type="hidden" name="id" value={project.id} />
              <input type="hidden" name="stage" value="lost" />
              <button
                type="submit"
                disabled={moving}
                className="inline-flex items-center gap-2 rounded-full border border-[#FF7A6B]/30 px-4 py-2.5 text-sm font-semibold text-[#FFB4A8] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FF7A6B]/10 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                <XCircle className="h-4 w-4" /> Mark lost
              </button>
            </form>
          )}
          <FormNotice state={moveState && !moveState.ok ? moveState : null} className="w-full" />
        </div>
      )}
    </Panel>
  )
}
