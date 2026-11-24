'use client'

import { useActionState, useEffect, useOptimistic, useRef, useState } from 'react'
import Link from 'next/link'
import { animate, motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, CalendarDays, Check, ChevronRight, HardHat, Loader2, MapPin, Package, ShieldCheck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalResult } from '@/lib/contractor/guard'
import type { JobSummary } from '@/lib/contractor/jobs'
import { moveProjectStage, setInstallStep } from '@/lib/contractor/project-actions'
import { dateLong } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'
import { FormNotice, INSTALL_COLOR, OwnerPill, StagePill, placeLine } from '../projects/kit'
import { JOB_STEPS, jobProgress, nextMove, statusLine, stepStates, type JobState } from './job-steps'

const DT = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]'

const GRADIENT_TEXT = 'bg-[linear-gradient(120deg,var(--p-primary,#6DC015),var(--p-accent,#F9EA1C))] bg-clip-text text-transparent'

/** "Dec 4, 2026" from a date column (YYYY-MM-DD), without a time-zone shift. */
function day(d: string | null): string | null {
  return d ? dateLong(`${d}T12:00:00Z`) : null
}

/** The percent, gliding from where it was to where it is. */
function TweenPercent({ value }: { value: number }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    if (reduce) return
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => {
        from.current = v
        setShown(Math.round(v))
      },
    })
    return () => controls.stop()
  }, [value, reduce])
  return <span className="tabular-nums">{reduce ? value : shown}%</span>
}

/**
 * One job, as Thermo's job card: the install stepper (four steps on the roof,
 * then the warranty) with its percent and bar, crew, operations lead, start
 * date, customer and linked orders, and the one button that moves it on
 * (the project's own stage and install-step actions). The card answers at
 * once; the server's answer replaces it.
 */
export function JobCard({ job, canEdit, canWarranty, delay }: { job: JobSummary; canEdit: boolean; canWarranty: boolean; delay: number }) {
  const [shown, setShown] = useOptimistic<JobState, Partial<JobState>>(
    { stage: job.stage, install_step: job.install_step, warranty_registered: job.warranty_registered },
    (cur, patch) => ({ ...cur, ...patch }),
  )
  const [result, run, pending] = useActionState<PortalResult | null, FormData>(async (prev, fd) => {
    if (fd.get('kind') === 'step') {
      setShown({ install_step: fd.get('install_step') as JobState['install_step'] })
      return setInstallStep(prev, fd)
    }
    const stage = fd.get('stage') as JobState['stage']
    setShown(stage === 'in_progress' ? { stage, install_step: shown.install_step ?? 'clean_prep' } : { stage })
    return moveProjectStage(prev, fd)
  }, null)

  const states = stepStates(shown)
  const pct = jobProgress(shown)
  const move = nextMove(shown)
  const place = placeLine(job.site)
  const specs = [job.sqft ? `${job.sqft.toLocaleString('en-US')} sq ft` : null, job.roof_type, job.color].filter(Boolean).join(' · ')
  const doneCount = states.filter((s) => s === 'done').length
  const complete = shown.stage === 'complete'

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay }}
      className={twMerge(
        'group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] p-5 backdrop-blur-xl md:p-6',
        'bg-[image:var(--p-panel)] shadow-[var(--p-shadow)] transition-[border-color] duration-300 hover:border-[color-mix(in_oklab,var(--p-primary)_35%,transparent)]',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-20 h-44 w-44 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.1] blur-3xl transition-opacity duration-500 group-hover:opacity-[0.18]"
      />

      <header className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StagePill stage={shown.stage} />
            {complete && shown.warranty_registered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--p-primary,#6DC015)]">
                <ShieldCheck className="h-3.5 w-3.5" /> Warranty registered
              </span>
            )}
          </div>
          <h3 className="mt-2.5 text-lg font-bold leading-snug text-[var(--p-ink,#fff)]">
            <Link
              href={`/portal/projects/${job.id}/`}
              className="rounded-md outline-none transition-colors hover:text-[var(--p-accent,#F9EA1C)] focus-visible:ring-2 focus-visible:ring-[var(--p-primary,#6DC015)]"
            >
              {job.name}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--p-muted,#9DA3AB)]">{[job.customer_name, specs].filter(Boolean).join(' · ') || 'No roof details yet'}</p>
        </div>
        <span className={twMerge('shrink-0 text-3xl font-black md:text-[2.1rem]', GRADIENT_TEXT)} aria-label={`${pct}% done`}>
          <TweenPercent value={pct} />
        </span>
      </header>

      {/* The animated % bar */}
      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]" aria-hidden="true">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--p-primary,#6DC015)] to-[var(--p-accent,#F9EA1C)] shadow-[0_0_12px_-2px_var(--p-primary,#6DC015)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: delay + 0.15 }}
        />
      </div>

      {/* The stepper */}
      <ol className="relative mt-6 grid grid-cols-5 gap-1.5" aria-label={`${doneCount} of ${JOB_STEPS.length} steps done`}>
        {JOB_STEPS.map((s, i) => {
          const state = states[i]
          const warranty = s.key === 'warranty'
          const color = warranty ? 'var(--p-primary, #6DC015)' : INSTALL_COLOR
          return (
            <li key={s.key} className="flex min-w-0 flex-col items-center gap-2 text-center">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                <motion.div
                  className={twMerge(
                    'absolute inset-y-0 left-0 rounded-full',
                    state === 'done' && 'bg-gradient-to-r from-[var(--p-primary-deep,#3F7F0C)] to-[var(--p-primary,#6DC015)] shadow-[0_0_10px_-2px_var(--p-primary)]',
                  )}
                  style={state === 'current' ? { background: color, boxShadow: `0 0 12px ${color}` } : undefined}
                  initial={{ width: 0 }}
                  animate={{ width: state === 'done' ? '100%' : state === 'current' ? '55%' : '0%' }}
                  transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: delay + 0.2 + i * 0.1 }}
                />
              </div>
              {state === 'done' ? (
                <motion.span
                  key="done"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18, delay: delay + 0.35 + i * 0.1 }}
                  className="grid h-5 w-5 place-items-center rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[0_4px_12px_-4px_var(--p-primary)]"
                >
                  {warranty ? <ShieldCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />}
                </motion.span>
              ) : state === 'current' ? (
                <span className="relative grid h-5 w-5 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: color }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                </span>
              ) : (
                <span className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold text-[var(--p-muted,#9DA3AB)] ring-1 ring-white/15">{i + 1}</span>
              )}
              <span
                className={twMerge(
                  'text-[10.5px] leading-tight sm:text-[11px]',
                  state === 'current' ? 'font-semibold text-[var(--p-ink,#fff)]' : state === 'done' ? 'text-[var(--p-ink,#fff)] opacity-80' : 'text-[var(--p-muted,#9DA3AB)]',
                )}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="relative mt-4 text-xs text-[var(--p-muted,#9DA3AB)]">{statusLine(shown)}</p>

      <dl className="relative mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-black/15 p-3.5 text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:grid-cols-4">
        <Meta label="Crew" icon={HardHat}>
          {job.crew ?? <span className="text-[var(--p-muted,#9DA3AB)]">Not set</span>}
        </Meta>
        <div className="min-w-0">
          <dt className={DT}>Ops lead</dt>
          <dd className="mt-1">
            <OwnerPill name={job.ops_lead_name} className="max-w-full" />
          </dd>
        </div>
        <Meta label={complete ? 'Completed' : 'Start'} icon={CalendarDays}>
          {(complete ? day(job.completed_on) : day(job.start_date)) ?? <span className="text-[var(--p-muted,#9DA3AB)]">Not scheduled</span>}
        </Meta>
        {job.orders !== null ? (
          <Meta label="Orders" icon={Package}>
            {job.orders ? `${job.orders} linked` : <span className="text-[var(--p-muted,#9DA3AB)]">None linked</span>}
          </Meta>
        ) : (
          <Meta label="Site" icon={MapPin}>
            {place || <span className="text-[var(--p-muted,#9DA3AB)]">No address</span>}
          </Meta>
        )}
      </dl>

      <footer className="relative mt-auto flex flex-wrap items-center gap-2 pt-5">
        {move?.kind === 'warranty' ? (
          canWarranty && (
            <Link href={`/portal/warranties/new/?project=${encodeURIComponent(job.id)}`} className={portalButton}>
              <ShieldCheck className="h-4 w-4" /> Register warranty
            </Link>
          )
        ) : (
          move &&
          canEdit && (
            <form action={run}>
              <input type="hidden" name="id" value={job.id} />
              {move.kind === 'step' ? (
                <>
                  <input type="hidden" name="kind" value="step" />
                  <input type="hidden" name="install_step" value={move.step} />
                </>
              ) : (
                <>
                  <input type="hidden" name="kind" value="stage" />
                  <input type="hidden" name="stage" value={move.stage} />
                </>
              )}
              <button type="submit" disabled={pending} className={portalButton}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {move.label}
                {!pending && <ChevronRight className="h-4 w-4" />}
              </button>
            </form>
          )
        )}
        <Link href={`/portal/projects/${job.id}/`} className={twMerge(portalGhostButton, 'ml-auto')}>
          Open job <ArrowUpRight className="h-4 w-4" />
        </Link>
        <FormNotice state={result && !result.ok ? result : null} className="w-full" />
      </footer>
    </motion.article>
  )
}

function Meta({ label, icon: Icon, children }: { label: string; icon: typeof HardHat; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className={twMerge(DT, 'flex items-center gap-1')}>
        <Icon className="h-3 w-3" />
        {label}
      </dt>
      <dd className="mt-1 truncate font-semibold text-[var(--p-ink,#fff)]">{children}</dd>
    </div>
  )
}
