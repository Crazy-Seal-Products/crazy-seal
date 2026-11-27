'use client'

import { useEffect, useMemo, useOptimistic, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutGroup, motion } from 'framer-motion'
import { CalendarClock, Columns3, FolderKanban, HardHat, List, MapPin, Plus, UserRound, Users } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { ProjectListItem } from '@/lib/contractor/projects'
import { BOARD_STAGES, INSTALL_STEP_LABEL, PROJECT_STAGE_LABEL, type ProjectStage } from '@/lib/contractor/types'
import { dateShort, money0, num } from '@/lib/portal/admin/format'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader, portalButton } from '@/components/portal/ui'
import { DataTable, EmptyNote, INSTALL_COLOR, OwnerPill, STAGE_COLOR, SearchPill, StageDot, StagePill, cellCls, placeLine, rowCls, rowMotion, tint } from './kit'
import { MoveStageSelect } from './MoveStageSelect'

export interface ProjectsViewProps {
  projects: ProjectListItem[]
  view: 'board' | 'list'
  who: 'all' | 'mine'
  showLost: boolean
  canEdit: boolean
  canViewAll: boolean
  initialQuery: string
}

/** The sales stages: the open pipeline the page title adds up (as the dashboard's Pipeline value does). */
const PIPELINE: readonly ProjectStage[] = ['lead', 'quoted', 'won']

function matches(p: ProjectListItem, q: string): boolean {
  if (!q) return true
  const hay = [p.name, p.customer_name, p.site?.street, p.site?.city, p.site?.state, p.site?.zip].filter(Boolean).join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}

type Filters = { view: 'board' | 'list'; who: 'all' | 'mine'; showLost: boolean }

/**
 * The Projects page, on Thermo's pipeline board: the open pipeline as the
 * title, Mine / Everyone and Show lost in the header, then one glass column
 * per stage (or a table with ?view=list). Cards stagger in, and a card moved
 * to another stage glides to its new column.
 */
export function ProjectsView({ projects, view, who, showLost, canEdit, canViewAll, initialQuery }: ProjectsViewProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const q = query.trim()
  const rows = useMemo(() => projects.filter((p) => matches(p, q)), [projects, q])

  // The toggles answer at once (their highlight slides over) while the page loads what they asked for.
  const [navigating, startNav] = useTransition()
  const [shown, setShown] = useOptimistic<Filters, Partial<Filters>>({ view, who, showLost }, (cur, patch) => ({ ...cur, ...patch }))

  const pipeline = projects.filter((p) => PIPELINE.includes(p.stage))
  const pipelineValue = pipeline.reduce((sum, p) => sum + p.value, 0)
  const installing = projects.filter((p) => p.stage === 'in_progress').length
  const active = projects.filter((p) => p.stage !== 'complete' && p.stage !== 'lost').length

  const href = (patch: Partial<Filters>) => {
    const next = { view, who, showLost, ...patch }
    const params = new URLSearchParams()
    if (next.view === 'list') params.set('view', 'list')
    if (canViewAll && next.who === 'mine') params.set('who', 'mine')
    if (next.showLost) params.set('lost', '1')
    if (q) params.set('q', q)
    const s = params.toString()
    return `/portal/projects/${s ? `?${s}` : ''}`
  }

  const go = (patch: Partial<Filters>) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    const target = href(patch)
    startNav(() => {
      setShown(patch)
      router.push(target, { scroll: false })
    })
  }

  const viewAllNow = canViewAll && who === 'all'

  return (
    <div>
      <ViewHeader
        kicker={viewAllNow ? 'Team pipeline' : 'My pipeline'}
        title={
          <>
            <CountUp value={Math.round(pipelineValue)} prefix="$" /> open
          </>
        }
        description={`${pipeline.length} in sales · ${active} active roof${active === 1 ? '' : 's'} · ${installing} installing`}
      >
        {canViewAll && (
          <Segmented
            id="who"
            label="Whose projects"
            items={[
              { key: 'all', label: 'Everyone', icon: Users, href: href({ who: 'all' }), onClick: go({ who: 'all' }) },
              { key: 'mine', label: 'Mine', icon: UserRound, href: href({ who: 'mine' }), onClick: go({ who: 'mine' }) },
            ]}
            active={shown.who}
          />
        )}
        <LostToggle on={shown.showLost} href={href({ showLost: !showLost })} onClick={go({ showLost: !showLost })} />
        {canEdit && (
          <Link href="/portal/projects/new/" className={portalButton}>
            <Plus className="h-4 w-4" /> New project
          </Link>
        )}
      </ViewHeader>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.08 }}
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <SearchPill value={query} onChange={setQuery} label="Search projects" placeholder="Search name, customer, city" className="w-full sm:w-80" />
        <Segmented
          id="view"
          label="Layout"
          items={[
            { key: 'board', label: 'Board', icon: Columns3, href: href({ view: 'board' }), onClick: go({ view: 'board' }) },
            { key: 'list', label: 'List', icon: List, href: href({ view: 'list' }), onClick: go({ view: 'list' }) },
          ]}
          active={shown.view}
        />
        <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
          {q ? `${rows.length} of ${projects.length}` : projects.length} project{projects.length === 1 ? '' : 's'}
        </span>
      </motion.div>

      <div className={twMerge('transition-opacity duration-300', navigating && 'opacity-60')} aria-busy={navigating || undefined}>
        {projects.length === 0 ? (
          <NoProjects canEdit={canEdit} />
        ) : shown.view === 'list' ? (
          <ProjectList rows={rows} canEdit={canEdit} />
        ) : (
          <ProjectBoard rows={rows} canEdit={canEdit} showLost={showLost} />
        )}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- controls */

type SegmentItem = { key: string; label: string; href: string; icon?: typeof List; onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }

/** A pill of links with a gradient highlight that slides to the active one. */
function Segmented({ id, label, items, active }: { id: string; label: string; items: SegmentItem[]; active: string }) {
  return (
    <nav
      aria-label={label}
      className="relative inline-flex rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      {items.map(({ key, label: text, href, icon: Icon, onClick }) => {
        const on = key === active
        return (
          <Link
            key={key}
            href={href}
            scroll={false}
            onClick={onClick}
            aria-current={on ? 'page' : undefined}
            className={twMerge(
              'relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300',
              on ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
            )}
          >
            {on && (
              <motion.span
                layoutId={`segment-${id}`}
                className="absolute inset-0 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {text}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

/** "Show lost" as a switch pill. */
function LostToggle({ on, href, onClick }: { on: boolean; href: string; onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link
      href={href}
      scroll={false}
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={twMerge(
        'inline-flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3.5 text-xs font-semibold transition-colors duration-300',
        on
          ? 'border-[#FF7A6B]/35 bg-[#FF7A6B]/10 text-[#FFC2B8]'
          : 'border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
      )}
    >
      <span className={twMerge('flex h-5 w-9 items-center rounded-full p-0.5 transition-colors duration-300', on ? 'justify-end bg-[#FF7A6B]/70' : 'justify-start bg-white/[0.12]')}>
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 34 }} className="h-4 w-4 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.4)]" />
      </span>
      Show lost
    </Link>
  )
}

function NoProjects({ canEdit }: { canEdit: boolean }) {
  return (
    <Panel className="grid place-items-center px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
        <FolderKanban className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--p-ink,#fff)]">No projects yet</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--p-muted,#9DA3AB)]">
        {canEdit
          ? 'Add one with New project, or they’ll arrive here as leads when someone requests a quote on your Crazy Seal page.'
          : 'Projects show up here as your team adds them.'}
      </p>
      {canEdit && (
        <Link href="/portal/projects/new/" className={twMerge(portalButton, 'mt-6')}>
          <Plus className="h-4 w-4" /> New project
        </Link>
      )}
    </Panel>
  )
}

/* -------------------------------------------------------------------- board */

function ProjectBoard({ rows, canEdit, showLost }: { rows: ProjectListItem[]; canEdit: boolean; showLost: boolean }) {
  const stages: ProjectStage[] = showLost ? [...BOARD_STAGES, 'lost'] : [...BOARD_STAGES]
  // Cards stagger in when the board first shows; after that a card that changes column just glides there.
  const [intro, setIntro] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setIntro(false), 1600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <LayoutGroup id="project-board">
      <motion.div
        layoutScroll
        className="-mx-5 flex snap-x gap-4 overflow-x-auto overflow-y-hidden px-5 pb-6 pt-1 [color-scheme:dark] [mask-image:linear-gradient(to_right,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] md:-mx-8 md:px-8 md:[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
      >
        {stages.map((stage, i) => (
          <BoardColumn key={stage} stage={stage} items={rows.filter((p) => p.stage === stage)} index={i} canEdit={canEdit} intro={intro} />
        ))}
      </motion.div>
    </LayoutGroup>
  )
}

function BoardColumn({ stage, items, index, canEdit, intro }: { stage: ProjectStage; items: ProjectListItem[]; index: number; canEdit: boolean; intro: boolean }) {
  const color = STAGE_COLOR[stage]
  const total = items.reduce((sum, p) => sum + p.value, 0)
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.06, 0.36) }}
      aria-label={`${PROJECT_STAGE_LABEL[stage]}: ${items.length} project${items.length === 1 ? '' : 's'}`}
      className={twMerge(
        'relative flex min-h-[32rem] w-72 shrink-0 snap-start flex-col rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] p-4 backdrop-blur-xl',
        'bg-[image:var(--p-panel)] shadow-[var(--p-shadow)]',
        stage === 'lost' && 'opacity-85 saturate-[0.85]',
      )}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-3xl opacity-[0.09]"
        style={{ background: `linear-gradient(180deg, ${color}, transparent)` }}
      />
      <header className="relative flex items-center justify-between gap-2 px-0.5">
        <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-[var(--p-ink,#fff)]">
          <StageDot stage={stage} />
          <span className="truncate">{PROJECT_STAGE_LABEL[stage]}</span>
        </h2>
        <span className="shrink-0 text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
          {items.length} · {money0(total)}
        </span>
      </header>
      <ul className="relative mt-4 flex-1 space-y-2.5">
        {items.map((p, i) => (
          <BoardCard key={p.id} p={p} canEdit={canEdit} intro={intro} delay={Math.min(0.15 + index * 0.06 + i * 0.05, 0.9)} />
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.1))] px-3 py-5 text-center text-xs text-[var(--p-muted,#9DA3AB)]">
            Nothing here
          </li>
        )}
      </ul>
    </motion.section>
  )
}

const NO_CLOSE: readonly ProjectStage[] = ['complete', 'lost', 'in_progress', 'ordered']

function BoardCard({ p, canEdit, intro, delay }: { p: ProjectListItem; canEdit: boolean; intro: boolean; delay: number }) {
  const color = STAGE_COLOR[p.stage]
  const specs = [p.sqft ? `${num(p.sqft)} sq ft` : null, p.roof_type].filter(Boolean).join(' · ')
  const place = placeLine(p.site)
  const showClose = Boolean(p.expected_close) && !NO_CLOSE.includes(p.stage)

  return (
    <motion.li
      layoutId={`project-${p.id}`}
      initial={intro ? { opacity: 0, y: 14, scale: 0.98 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{
        duration: 0.5,
        ease: EASE_OUT_EXPO,
        delay: intro ? delay : 0,
        layout: { type: 'spring', stiffness: 360, damping: 34 },
      }}
      className={twMerge(
        'group relative overflow-hidden rounded-2xl border border-white/[0.07] p-3.5 pl-4',
        'bg-[linear-gradient(160deg,rgba(255,255,255,0.085),rgba(255,255,255,0.025))] shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_12px_28px_-20px_rgba(0,0,0,0.9)]',
        'transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--p-primary)_40%,transparent)] hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_22px_40px_-22px_color-mix(in_oklab,var(--p-primary)_75%,transparent)]',
      )}
    >
      <span aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
      <Link href={`/portal/projects/${p.id}/`} className="block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary,#6DC015)]">
        <p className="text-[13.5px] font-semibold leading-snug text-[var(--p-ink,#fff)]">{p.name}</p>
        {p.customer_name && <p className="mt-0.5 truncate text-xs text-[var(--p-muted,#9DA3AB)]">{p.customer_name}</p>}
        <p className="mt-1.5 text-[12px] text-[var(--p-muted,#9DA3AB)]">
          {p.value ? <span className="font-semibold text-[var(--p-ink,#fff)]">{money0(p.value)}</span> : null}
          {p.value && specs ? ' · ' : null}
          {specs}
          {!p.value && !specs ? 'No details yet' : null}
        </p>
        {p.stage === 'in_progress' && p.install_step && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1" style={tint(INSTALL_COLOR)}>
            <HardHat className="h-3 w-3" />
            {INSTALL_STEP_LABEL[p.install_step]}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2">
          <OwnerPill name={p.assignee_name} />
          {showClose ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[var(--p-muted,#9DA3AB)]">
              <CalendarClock className="h-3 w-3" />
              Close {dateShort(`${p.expected_close}T12:00:00Z`)}
            </span>
          ) : (
            place && (
              <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-[var(--p-muted,#9DA3AB)]">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{place}</span>
              </span>
            )
          )}
        </div>
      </Link>
      {canEdit && <MoveStageSelect projectId={p.id} projectName={p.name} stage={p.stage} className="mt-3" />}
    </motion.li>
  )
}

/* --------------------------------------------------------------------- list */

function ProjectList({ rows, canEdit }: { rows: ProjectListItem[]; canEdit: boolean }) {
  if (!rows.length) {
    return (
      <Panel>
        <EmptyNote>No projects match.</EmptyNote>
      </Panel>
    )
  }
  return (
    <Panel>
      <DataTable
        minWidth={canEdit ? 1040 : 880}
        head={[
          { label: 'Project' },
          { label: 'Stage' },
          { label: 'Value', align: 'right' },
          { label: 'Roof' },
          { label: 'Location' },
          { label: 'Owner' },
          { label: 'Updated' },
          ...(canEdit ? [{ label: 'Move', className: 'w-44' }] : []),
        ]}
      >
        {rows.map((p, i) => (
          <motion.tr key={p.id} {...rowMotion(i)} className={rowCls}>
            <td className={cellCls}>
              <Link href={`/portal/projects/${p.id}/`} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
                {p.name}
              </Link>
              {p.customer_name && <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">{p.customer_name}</span>}
            </td>
            <td className={cellCls}>
              <StagePill stage={p.stage} />
              {p.stage === 'in_progress' && p.install_step && (
                <span className="mt-1.5 block text-[11px]" style={{ color: `color-mix(in oklab, ${INSTALL_COLOR} 80%, white)` }}>
                  {INSTALL_STEP_LABEL[p.install_step]}
                </span>
              )}
            </td>
            <td className={twMerge(cellCls, 'text-right font-semibold tabular-nums')}>{money0(p.value)}</td>
            <td className={cellCls}>
              <span className="block">{p.roof_type ?? '—'}</span>
              {p.sqft ? <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">{num(p.sqft)} sq ft</span> : null}
            </td>
            <td className={twMerge(cellCls, 'text-[var(--p-muted,#9DA3AB)]')}>{placeLine(p.site) || '—'}</td>
            <td className={cellCls}>
              <OwnerPill name={p.assignee_name} />
            </td>
            <td className={twMerge(cellCls, 'whitespace-nowrap text-[var(--p-muted,#9DA3AB)]')}>{dateShort(p.updated_at)}</td>
            {canEdit && (
              <td className={twMerge(cellCls, 'py-2.5')}>
                <MoveStageSelect projectId={p.id} projectName={p.name} stage={p.stage} className="w-44" />
              </td>
            )}
          </motion.tr>
        ))}
      </DataTable>
    </Panel>
  )
}
