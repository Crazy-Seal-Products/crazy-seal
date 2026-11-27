'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarRange, CheckCircle2, Download, Landmark, Plus, Scale, Warehouse } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { setPlanStatus } from '@/lib/contractor/roof-actions'
import {
  PLAN_ACTIONS,
  PLAN_STATUS_LABEL,
  PLAN_STATUSES,
  compactMoney,
  roofLabel,
  toCsv,
  type PlanAction,
  type PlanItem,
  type PlanStatus,
  type RoofItem,
  type RoofPerms,
  type RoofWorkspace,
} from '@/lib/contractor/roof-shared'
import { money0 } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, EmptyNote, Modal, OPTION_STYLE } from '../projects/kit'
import { PlanForm } from './RoofForms'
import { Bars, BigEmpty, ButtonLink, PLAN_COLOR, Pill, StatCell, StatStrip, StatusSelect, downloadText, planTone } from './roof-kit'

type ModalState = { kind: 'add'; roofId?: string; year?: number } | { kind: 'edit'; id: string } | null

/** How many years the grid shows from this year (more when items are planned further out, up to 10). */
const YEARS = 5

/**
 * Budget & planning: the multi-year roof plan (Thermo's capital plan) as a
 * grid of roofs by year, each cell the actions planned that year with their
 * cost and status, the yearly totals as bars, and every item's status one
 * click away.
 */
export function PlanningView({ workspace, perms }: { workspace: RoofWorkspace; perms: RoofPerms }) {
  const { roofs, plans, facilities, year } = workspace
  const [facility, setFacility] = useState('all')
  const [status, setStatus] = useState<'all' | PlanStatus>('all')
  const [action, setAction] = useState<'all' | PlanAction>('all')
  const [showAll, setShowAll] = useState(false)
  const [modal, setModal] = useState<ModalState>(null)
  const close = () => setModal(null)

  const roofsById = useMemo(() => new Map(roofs.map((r) => [r.id, r])), [roofs])
  const filtered = plans.filter(
    (p) => (facility === 'all' || roofsById.get(p.roof_asset_id)?.facility_id === facility) && (status === 'all' || p.status === status) && (action === 'all' || p.action === action),
  )
  const live = filtered.filter((p) => p.status !== 'deferred')
  const lastYear = Math.min(year + 9, Math.max(year + YEARS - 1, ...filtered.map((p) => p.year)))
  const years = Array.from({ length: lastYear - year + 1 }, (_, i) => year + i)
  const earlier = filtered.filter((p) => p.year < year)

  const byYear = years.map((y) => {
    const rows = live.filter((p) => p.year === y)
    return {
      label: String(y),
      primary: rows.filter((p) => p.status !== 'proposed').reduce((s, p) => s + p.est_cost, 0),
      secondary: rows.filter((p) => p.status === 'proposed').reduce((s, p) => s + p.est_cost, 0),
    }
  })
  const fiveYear = byYear.slice(0, YEARS).reduce((s, y) => s + y.primary + y.secondary, 0)
  const thisYear = byYear[0] ? byYear[0].primary + byYear[0].secondary : 0
  const committed = live.filter((p) => p.status === 'approved' || p.status === 'funded').reduce((s, p) => s + p.est_cost, 0)
  const proposed = live.filter((p) => p.status === 'proposed').reduce((s, p) => s + p.est_cost, 0)
  const done = filtered.filter((p) => p.status === 'done')

  const withPlans = new Set(filtered.map((p) => p.roof_asset_id))
  const gridRoofs = roofs
    .filter((r) => (facility === 'all' || r.facility_id === facility) && (showAll || withPlans.has(r.id)))
    .sort((a, b) => roofLabel(a).localeCompare(roofLabel(b)))

  const editing = modal?.kind === 'edit' ? plans.find((p) => p.id === modal.id) : undefined

  function exportCsv() {
    const head = ['year', 'building', 'roof', 'tag', 'action', 'est_cost', 'status', 'notes']
    const body = [...filtered]
      .sort((a, b) => a.year - b.year)
      .map((p) => {
        const r = roofsById.get(p.roof_asset_id)
        return [p.year, r?.facility_name ?? '', r?.name ?? '', r?.tag ?? '', p.action, p.est_cost, PLAN_STATUS_LABEL[p.status], p.notes ?? '']
      })
    downloadText(`roof-budget-plan-${year}.csv`, toCsv(head, body))
  }

  return (
    <div>
      <ViewHeader
        kicker="Budget & planning"
        title={plans.length ? `${compactMoney(fiveYear)} five-year roof need` : 'Budget & planning'}
        description="What each roof needs, year by year: inspections, maintenance, repairs, a restoration. Planned before the roof fails, not after."
      >
        {plans.length > 0 && (
          <button type="button" onClick={exportCsv} className={portalGhostButton} disabled={!filtered.length}>
            <Download className="h-4 w-4" /> Export budget CSV
          </button>
        )}
        {perms.edit && roofs.length > 0 && (
          <button type="button" onClick={() => setModal({ kind: 'add' })} className={portalButton}>
            <Plus className="h-4 w-4" /> Add plan item
          </button>
        )}
      </ViewHeader>

      {roofs.length === 0 ? (
        <BigEmpty
          icon={CalendarRange}
          title="Add your first building"
          action={
            perms.edit ? (
              <ButtonLink href="/portal/roofs/portfolio/">
                <Warehouse className="h-4 w-4" /> Go to Portfolio
              </ButtonLink>
            ) : null
          }
        >
          The plan is built roof by roof. Add a building and its roofs in Portfolio, then plan what each needs and when.
        </BigEmpty>
      ) : (
        <>
          <StatStrip>
            <StatCell label={`${year} plan`} display={compactMoney(thisYear)} icon={CalendarRange} />
            <StatCell label="5-year need" display={compactMoney(fiveYear)} hint={`${year}–${year + YEARS - 1}`} icon={Landmark} delay={0.04} />
            <StatCell label="Approved & funded" display={compactMoney(committed)} hint={`${compactMoney(proposed)} still proposed`} icon={Scale} delay={0.08} />
            <StatCell label="Done" value={done.length} hint={money0(done.reduce((s, p) => s + p.est_cost, 0))} icon={CheckCircle2} tone="good" delay={0.12} />
          </StatStrip>

          <div className="mb-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
            <Panel className="min-w-0" delay={0.05}>
              <PanelTitle>Spend by year</PanelTitle>
              <p className="-mt-2 mb-4 text-xs text-[var(--p-muted,#9DA3AB)]">Each year’s planned cost, deferred items left out.</p>
              <Bars data={byYear} format={compactMoney} primaryLabel="Approved, funded or done" secondaryLabel="Proposed" />
            </Panel>
            <Panel className="min-w-0" delay={0.1}>
              <PanelTitle>How the plan works</PanelTitle>
              <ul className="space-y-2.5 text-sm text-[var(--p-muted,#9DA3AB)]">
                {PLAN_STATUSES.map((s) => (
                  <li key={s} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: PLAN_COLOR[s] }} />
                    <span>
                      <span className="font-semibold text-[var(--p-ink,#fff)]">{PLAN_STATUS_LABEL[s]}</span>
                      {s === 'proposed'
                        ? ': what you recommend. The customer hasn’t said yes yet.'
                        : s === 'approved'
                          ? ': the customer agreed to it.'
                          : s === 'funded'
                            ? ': the money is set aside in their budget.'
                            : s === 'done'
                              ? ': the work is finished.'
                              : ': pushed out. Left out of the totals.'}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <Panel delay={0.12}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <ChevronSelect value={facility} onChange={(e) => setFacility(e.target.value)} aria-label="Building" wrapperClassName="w-full sm:w-56" className="!rounded-full !py-2">
                <option value="all" style={OPTION_STYLE}>
                  All buildings
                </option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id} style={OPTION_STYLE}>
                    {f.name}
                  </option>
                ))}
              </ChevronSelect>
              <ChevronSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" wrapperClassName="w-full sm:w-44" className="!rounded-full !py-2">
                <option value="all" style={OPTION_STYLE}>
                  Every status
                </option>
                {PLAN_STATUSES.map((s) => (
                  <option key={s} value={s} style={OPTION_STYLE}>
                    {PLAN_STATUS_LABEL[s]}
                  </option>
                ))}
              </ChevronSelect>
              <ChevronSelect value={action} onChange={(e) => setAction(e.target.value as typeof action)} aria-label="Action" wrapperClassName="w-full sm:w-44" className="!rounded-full !py-2">
                <option value="all" style={OPTION_STYLE}>
                  Every action
                </option>
                {PLAN_ACTIONS.map((a) => (
                  <option key={a} value={a} style={OPTION_STYLE}>
                    {a}
                  </option>
                ))}
              </ChevronSelect>
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-[var(--p-muted,#9DA3AB)]">
                <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-4 w-4 accent-[var(--p-primary,#6DC015)]" />
                Show roofs with nothing planned
              </label>
            </div>

            {gridRoofs.length === 0 ? (
              <EmptyNote>
                {plans.length
                  ? 'No plan items match these filters.'
                  : perms.edit
                    ? 'Nothing planned yet. Add what each roof needs and when, or tick “Show roofs with nothing planned” and click a year.'
                    : 'Nothing planned yet.'}
              </EmptyNote>
            ) : (
              <PlanGrid
                roofs={gridRoofs}
                plans={filtered}
                years={years}
                perms={perms}
                onAdd={(roofId, y) => setModal({ kind: 'add', roofId, year: y })}
                onEdit={(p) => setModal({ kind: 'edit', id: p.id })}
              />
            )}
            {earlier.length > 0 && (
              <p className="mt-3 text-xs text-[var(--p-muted,#9DA3AB)]">
                {earlier.length} item{earlier.length === 1 ? '' : 's'} from before {year} aren’t in the grid; they’re on each roof’s Plan tab and in the export.
              </p>
            )}
          </Panel>

          {filtered.length > 0 && <PlanList plans={filtered} roofsById={roofsById} perms={perms} onEdit={(p) => setModal({ kind: 'edit', id: p.id })} />}
        </>
      )}

      <Modal title={editing ? 'Plan item' : 'Add to the plan'} open={modal?.kind === 'add' || Boolean(editing)} onClose={close}>
        {(modal?.kind === 'add' || editing) && (
          <PlanForm
            roofs={roofs}
            fixedRoofId={modal?.kind === 'add' ? modal.roofId : undefined}
            item={editing}
            defaultYear={modal?.kind === 'add' ? modal.year : undefined}
            year={year}
            onDone={close}
            onCancel={close}
          />
        )}
      </Modal>
    </div>
  )
}

/** Roofs down the side, years across, each cell the actions planned that year. */
function PlanGrid({
  roofs,
  plans,
  years,
  perms,
  onAdd,
  onEdit,
}: {
  roofs: RoofItem[]
  plans: PlanItem[]
  years: number[]
  perms: RoofPerms
  onAdd: (roofId: string, year: number) => void
  onEdit: (p: PlanItem) => void
}) {
  const totals = years.map((y) => plans.filter((p) => p.year === y && p.status !== 'deferred').reduce((s, p) => s + p.est_cost, 0))
  const th = 'pb-3 pr-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted,#9DA3AB)]'
  return (
    <div className="-mx-5 overflow-x-auto px-5 [color-scheme:dark] md:-mx-6 md:px-6">
      <table className="w-full table-fixed text-left text-sm text-[var(--p-ink,#F5F1EC)]" style={{ minWidth: 260 + years.length * 140 }}>
        <thead>
          <tr>
            <th scope="col" className={twMerge(th, 'w-60')}>
              Roof
            </th>
            {years.map((y, i) => (
              <th key={y} scope="col" className={twMerge(th, i === 0 && 'text-[var(--p-accent,#F9EA1C)]')}>
                {y}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roofs.map((r, ri) => (
            <motion.tr
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: Math.min(ri * 0.03, 0.4) }}
              className="border-t border-[var(--p-line,rgba(255,255,255,0.06))] align-top"
            >
              <td className="py-3 pr-3">
                <Link href={`/portal/roofs/${r.id}/`} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
                  {r.facility_name}
                </Link>
                <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">
                  {r.name} · {r.tag}
                </span>
              </td>
              {years.map((y) => {
                const items = plans.filter((p) => p.roof_asset_id === r.id && p.year === y)
                return (
                  <td key={y} className="py-2.5 pr-3">
                    <div className="group/cell flex min-h-[2.75rem] flex-col gap-1.5">
                      {items.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          disabled={!perms.edit}
                          onClick={() => onEdit(p)}
                          title={`${p.action} · ${money0(p.est_cost)} · ${PLAN_STATUS_LABEL[p.status]}${p.notes ? ` · ${p.notes}` : ''}`}
                          className={twMerge(
                            'flex w-full items-center gap-2 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.04] px-2.5 py-1.5 text-left transition',
                            perms.edit && 'hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--p-primary)_40%,transparent)] hover:bg-white/[0.07]',
                            p.status === 'deferred' && 'opacity-55',
                            !perms.edit && 'cursor-default',
                          )}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PLAN_COLOR[p.status], boxShadow: `0 0 6px ${PLAN_COLOR[p.status]}` }} />
                          <span className="min-w-0 flex-1">
                            <span className={twMerge('block truncate text-xs font-semibold', p.status === 'deferred' && 'line-through')}>{p.action}</span>
                            <span className="block text-[11px] tabular-nums text-[var(--p-muted,#9DA3AB)]">{compactMoney(p.est_cost)}</span>
                          </span>
                        </button>
                      ))}
                      {perms.edit && (
                        <button
                          type="button"
                          onClick={() => onAdd(r.id, y)}
                          aria-label={`Plan something for ${roofLabel(r)} in ${y}`}
                          className={twMerge(
                            'grid h-7 w-full place-items-center rounded-xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.12))] text-[var(--p-muted,#9DA3AB)] transition hover:border-[var(--p-primary,#6DC015)] hover:text-[var(--p-ink,#fff)]',
                            items.length ? 'opacity-0 focus:opacity-100 group-hover/cell:opacity-100' : 'opacity-60',
                          )}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )
              })}
            </motion.tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-[var(--p-line,rgba(255,255,255,0.14))]">
            <th scope="row" className="py-3 pr-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted,#9DA3AB)]">
              Total
            </th>
            {totals.map((t, i) => (
              <td key={years[i]} className="py-3 pr-3 font-bold tabular-nums">
                {t ? money0(t) : <span className="font-normal text-[var(--p-muted,#9DA3AB)]">—</span>}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

/** Every item, by year, with its status one click away (Thermo's plan list). */
function PlanList({ plans, roofsById, perms, onEdit }: { plans: PlanItem[]; roofsById: Map<string, RoofItem>; perms: RoofPerms; onEdit: (p: PlanItem) => void }) {
  const groupYears = [...new Set(plans.map((p) => p.year))].sort((a, b) => a - b)
  return (
    <Panel className="mt-6" delay={0.15}>
      <PanelTitle>Plan items</PanelTitle>
      <div className="space-y-5">
        {groupYears.map((y) => {
          const rows = plans.filter((p) => p.year === y).sort((a, b) => PLAN_ACTIONS.indexOf(a.action) - PLAN_ACTIONS.indexOf(b.action))
          const total = rows.filter((p) => p.status !== 'deferred').reduce((s, p) => s + p.est_cost, 0)
          return (
            <section key={y}>
              <div className="mb-1 flex items-baseline justify-between border-b border-[var(--p-line,rgba(255,255,255,0.1))] pb-2">
                <h3 className="text-lg font-bold tabular-nums text-[var(--p-ink,#fff)]">{y}</h3>
                <span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
                  {rows.length} item{rows.length === 1 ? '' : 's'} · {money0(total)}
                </span>
              </div>
              <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
                {rows.map((p) => {
                  const roof = roofsById.get(p.roof_asset_id)
                  return (
                    <li key={p.id} className="grid gap-2 py-3 md:grid-cols-[1.6fr_0.7fr_0.6fr_1.2fr] md:items-center">
                      <div className="min-w-0">
                        {roof ? (
                          <Link href={`/portal/roofs/${roof.id}/`} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
                            {roofLabel(roof)}
                          </Link>
                        ) : (
                          <span className="font-semibold">Roof</span>
                        )}
                        {p.notes && <p className="mt-0.5 truncate text-xs text-[var(--p-muted,#9DA3AB)]">{p.notes}</p>}
                      </div>
                      <span className="text-sm font-semibold">{p.action}</span>
                      <span className="text-sm tabular-nums">{money0(p.est_cost)}</span>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Pill tone={planTone(p.status)}>{PLAN_STATUS_LABEL[p.status]}</Pill>
                        {perms.edit && (
                          <>
                            <StatusSelect
                              action={setPlanStatus}
                              id={p.id}
                              value={p.status}
                              label={`Change the status of the ${p.year} ${p.action.toLowerCase()}`}
                              options={PLAN_STATUSES.map((s) => ({ value: s, label: s === 'deferred' ? 'Defer' : `Mark ${PLAN_STATUS_LABEL[s].toLowerCase()}` }))}
                              className="w-36"
                            />
                            <button type="button" onClick={() => onEdit(p)} className="text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </Panel>
  )
}
