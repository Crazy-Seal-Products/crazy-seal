'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, FolderKanban, HardHat, PackageCheck, Trophy, UserRound, Users, X, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { JobSummary } from '@/lib/contractor/jobs'
import type { ProjectStage } from '@/lib/contractor/types'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'
import { ChevronSelect, EmptyNote, OPTION_STYLE, STAGE_COLOR, SearchPill } from '../projects/kit'
import { Segmented } from '../Segmented'
import { JobCard } from './JobCard'

export type JobStageFilter = 'all' | 'won' | 'ordered' | 'in_progress' | 'complete'
export type JobWho = 'all' | 'mine'

export interface JobsViewProps {
  jobs: JobSummary[]
  canViewAll: boolean
  canEdit: boolean
  canWarranty: boolean
  recentDays: number
  initial: { who: JobWho; crew: string; stage: JobStageFilter }
}

const NO_CREW = '__none__'

const TILES: { stage: Exclude<JobStageFilter, 'all'>; label: string; icon: LucideIcon; hint: string }[] = [
  { stage: 'in_progress', label: 'Installing', icon: HardHat, hint: 'Crews on the roof' },
  { stage: 'ordered', label: 'Materials ordered', icon: PackageCheck, hint: 'Ready to start' },
  { stage: 'won', label: 'Won', icon: Trophy, hint: 'To order and schedule' },
  { stage: 'complete', label: 'Complete', icon: CheckCircle2, hint: '' },
]

function matches(j: JobSummary, q: string): boolean {
  if (!q) return true
  const hay = [j.name, j.customer_name, j.crew, j.ops_lead_name, j.site?.street, j.site?.city, j.site?.state, j.site?.zip].filter(Boolean).join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

/** Keeps the filters in the address, so a reload or a shared link opens the same view. */
function remember(next: { who: JobWho; crew: string; stage: JobStageFilter }, canViewAll: boolean) {
  const params = new URLSearchParams()
  if (canViewAll && next.who === 'mine') params.set('who', 'mine')
  if (next.crew) params.set('crew', next.crew)
  if (next.stage !== 'all') params.set('stage', next.stage)
  const s = params.toString()
  window.history.replaceState(window.history.state, '', `/portal/jobs/${s ? `?${s}` : ''}`)
}

/**
 * The Jobs page, Thermo's Jobs view: every roof past the sale as a card with
 * its install stepper. Tiles count each stage and filter to it; Mine /
 * Everyone (roles that see the whole company), crew and search narrow the
 * cards in place.
 */
export function JobsView({ jobs, canViewAll, canEdit, canWarranty, recentDays, initial }: JobsViewProps) {
  const [who, setWho] = useState<JobWho>(canViewAll ? initial.who : 'all')
  const [crew, setCrew] = useState(initial.crew)
  const [stage, setStage] = useState<JobStageFilter>(initial.stage)
  const [query, setQuery] = useState('')

  const update = (patch: Partial<{ who: JobWho; crew: string; stage: JobStageFilter }>) => {
    const next = { who, crew, stage, ...patch }
    if (patch.who !== undefined) setWho(patch.who)
    if (patch.crew !== undefined) setCrew(patch.crew)
    if (patch.stage !== undefined) setStage(patch.stage)
    remember(next, canViewAll)
  }

  const crews = useMemo(() => [...new Set(jobs.map((j) => j.crew).filter((c): c is string => Boolean(c)))].sort((a, b) => a.localeCompare(b)), [jobs])
  const hasNoCrew = jobs.some((j) => !j.crew)
  // Before the stage filter: the tiles count what the other filters leave.
  const scoped = useMemo(
    () =>
      jobs.filter(
        (j) => (who === 'all' || j.mine) && (!crew || (crew === NO_CREW ? !j.crew : j.crew === crew)) && matches(j, query.trim()),
      ),
    [jobs, who, crew, query],
  )
  const shown = stage === 'all' ? scoped : scoped.filter((j) => j.stage === stage)
  const count = (s: ProjectStage) => scoped.filter((j) => j.stage === s).length
  const inMotion = jobs.filter((j) => j.stage !== 'complete').length
  const filtered = who === 'mine' || Boolean(crew) || stage !== 'all' || Boolean(query.trim())

  return (
    <div>
      <ViewHeader
        kicker="Jobs"
        title={`${inMotion} roof${inMotion === 1 ? '' : 's'} in motion`}
        description={`Won through installed and registered. Complete jobs stay here for ${recentDays} days; every job lives on in your pipeline.`}
      >
        {canViewAll && (
          <Segmented
            id="jobs-who"
            label="Whose jobs"
            value={who}
            onChange={(v) => update({ who: v })}
            options={[
              { key: 'all', label: 'Everyone', icon: Users },
              { key: 'mine', label: 'Mine', icon: UserRound },
            ]}
          />
        )}
        <Link href="/portal/projects/" className={portalGhostButton}>
          <FolderKanban className="h-4 w-4" /> Pipeline
        </Link>
      </ViewHeader>

      {jobs.length === 0 ? (
        <NoJobs recentDays={recentDays} />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {TILES.map((t, i) => (
              <StageTile
                key={t.stage}
                label={t.label}
                hint={t.stage === 'complete' ? `Last ${recentDays} days` : t.hint}
                icon={t.icon}
                value={count(t.stage)}
                color={STAGE_COLOR[t.stage]}
                active={stage === t.stage}
                delay={0.04 + i * 0.05}
                onClick={() => update({ stage: stage === t.stage ? 'all' : t.stage })}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.12 }}
            className="mb-6 flex flex-wrap items-center gap-2"
          >
            <SearchPill value={query} onChange={setQuery} label="Search jobs" placeholder="Search job, customer, crew, city" className="w-full sm:w-80" />
            {(crews.length > 0 || hasNoCrew) && (
              <ChevronSelect
                aria-label="Crew"
                value={crew}
                onChange={(e) => update({ crew: e.target.value })}
                wrapperClassName="w-full sm:w-52"
                className="!rounded-full !py-2 !text-sm"
              >
                <option value="" style={OPTION_STYLE}>
                  All crews
                </option>
                {crews.map((c) => (
                  <option key={c} value={c} style={OPTION_STYLE}>
                    {c}
                  </option>
                ))}
                {hasNoCrew && (
                  <option value={NO_CREW} style={OPTION_STYLE}>
                    No crew set
                  </option>
                )}
                {crew && crew !== NO_CREW && !crews.includes(crew) && (
                  <option value={crew} style={OPTION_STYLE}>
                    {crew}
                  </option>
                )}
              </ChevronSelect>
            )}
            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  update({ who: 'all', crew: '', stage: 'all' })
                }}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:text-[var(--p-ink,#fff)]"
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </button>
            )}
            <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
              {shown.length === jobs.length ? jobs.length : `${shown.length} of ${jobs.length}`} job{jobs.length === 1 ? '' : 's'}
            </span>
          </motion.div>

          {shown.length === 0 ? (
            <Panel>
              <EmptyNote>
                No jobs match these filters.{' '}
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    update({ who: 'all', crew: '', stage: 'all' })
                  }}
                  className="font-semibold text-[var(--p-primary,#6DC015)] hover:underline"
                >
                  Show every job
                </button>
              </EmptyNote>
            </Panel>
          ) : (
            <motion.div layout className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
              <AnimatePresence initial={false}>
                {shown.map((j, i) => (
                  <JobCard key={j.id} job={j} canEdit={canEdit} canWarranty={canWarranty} delay={Math.min(0.1 + i * 0.06, 0.5)} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

/** A stage's count, Thermo's workspace tile, that filters to the stage. */
function StageTile({
  label,
  hint,
  icon: Icon,
  value,
  color,
  active,
  delay,
  onClick,
}: {
  label: string
  hint: string
  icon: LucideIcon
  value: number
  color: string
  active: boolean
  delay: number
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT_EXPO }}
      className={twMerge(
        'group relative overflow-hidden rounded-2xl border bg-[image:var(--p-panel)] p-4 text-left shadow-[var(--p-shadow)] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[var(--p-primary,#6DC015)]',
        active ? 'border-[color-mix(in_oklab,var(--p-primary)_60%,transparent)]' : 'border-[var(--p-line,rgba(255,255,255,0.08))]',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: color }}
      />
      <span className="relative flex items-center justify-between text-[11px] font-medium text-[var(--p-muted,#9DA3AB)]">
        {label}
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
        </span>
      </span>
      <span className="relative mt-2 block text-2xl font-bold text-[var(--p-ink,#F5F1EC)] md:text-[1.7rem]">
        <CountUp value={value} />
      </span>
      <span className="relative mt-0.5 block text-xs text-[var(--p-muted,#9DA3AB)]">{active ? 'Showing only these' : hint}</span>
    </motion.button>
  )
}

function NoJobs({ recentDays }: { recentDays: number }) {
  return (
    <Panel className="grid place-items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
        <HardHat className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--p-ink,#fff)]">No jobs yet</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--p-muted,#9DA3AB)]">
        A project becomes a job when it’s won. Move one to Won in your pipeline and it shows up here with its install steps, through the warranty.
        Completed jobs stay {recentDays} days.
      </p>
      <Link href="/portal/projects/" className={twMerge(portalButton, 'mt-6')}>
        <FolderKanban className="h-4 w-4" /> Open the pipeline
      </Link>
    </Panel>
  )
}
