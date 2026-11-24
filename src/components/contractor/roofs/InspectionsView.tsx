'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CalendarClock, ClipboardCheck, ClipboardList, FilePlus2, Plus, ShieldAlert, Warehouse } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  DEFICIENCY_STATUS_LABEL,
  DEFICIENCY_STATUSES,
  SEVERITIES,
  SEVERITY_LABEL,
  bySeverity,
  dayLong,
  daysFrom,
  dueLabel,
  isOpenDeficiency,
  roofLabel,
  type DeficiencyItem,
  type DeficiencyStatus,
  type RoofFormOptions,
  type RoofItem,
  type RoofPerms,
  type RoofWorkspace,
  type Severity,
} from '@/lib/contractor/roof-shared'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, DataTable, EmptyNote, Modal, OPTION_STYLE, cellCls, rowCls, rowMotion } from '../projects/kit'
import { DeficiencyForm, EstimateForm, InspectionForm } from './RoofForms'
import { DeficiencyTable, InspectionLog, OverdueStrip } from './RoofTables'
import { BigEmpty, ButtonLink, ConditionBadge, StatCell, StatStrip, Tabs } from './roof-kit'

type Tab = 'log' | 'due' | 'problems'

type ModalState = { kind: 'inspection'; roofId?: string } | { kind: 'deficiency'; deficiency?: DeficiencyItem } | { kind: 'estimate'; roofId: string; ids: string[] } | null

/**
 * Inspections: the log of every inspection (score, findings, problems
 * found), the roofs due or overdue, and the problems across all roofs, from
 * which a few on one roof can become an estimate (Thermo's inspections and
 * deficiencies view).
 */
export function InspectionsView({ workspace, options, perms, initialTab = 'log' }: { workspace: RoofWorkspace; options: RoofFormOptions; perms: RoofPerms; initialTab?: Tab }) {
  const { roofs, inspections, deficiencies, today, year } = workspace
  const [tab, setTab] = useState<Tab>(initialTab)
  const [modal, setModal] = useState<ModalState>(null)
  const [status, setStatus] = useState<'active' | 'all' | DeficiencyStatus>('active')
  const [severity, setSeverity] = useState<'all' | Severity>('all')
  const [selected, setSelected] = useState<string[]>([])
  const close = () => setModal(null)
  const roofsById = useMemo(() => new Map(roofs.map((r) => [r.id, r])), [roofs])

  const thisYear = inspections.filter((i) => i.inspected_on.startsWith(String(year)))
  const overdue = roofs.filter((r) => r.next_inspection_on && r.next_inspection_on < today)
  const dueSoon = roofs.filter((r) => {
    const d = daysFrom(today, r.next_inspection_on)
    return d !== null && d >= 0 && d <= 60
  })
  const never = roofs.filter((r) => !r.last_inspected_on && !r.next_inspection_on)
  const serious = deficiencies.filter((d) => isOpenDeficiency(d) && (d.severity === 'critical' || d.severity === 'high'))
  const due = [...roofs]
    .filter((r) => r.next_inspection_on || !r.last_inspected_on)
    .sort((a, b) => (a.next_inspection_on ?? '0000').localeCompare(b.next_inspection_on ?? '0000'))

  const problems = deficiencies
    .filter((d) => (status === 'all' ? true : status === 'active' ? isOpenDeficiency(d) : d.status === status))
    .filter((d) => severity === 'all' || d.severity === severity)
    .sort((a, b) => bySeverity(a, b) || b.created_at.localeCompare(a.created_at))
  const selectedRoof = selected.length ? deficiencies.find((d) => d.id === selected[0])?.roof_asset_id : undefined

  function toggle(d: DeficiencyItem) {
    setSelected((ids) => {
      if (ids.includes(d.id)) return ids.filter((x) => x !== d.id)
      // One estimate is for one roof: picking a problem on another roof starts over.
      const roofOf = ids.length ? deficiencies.find((x) => x.id === ids[0])?.roof_asset_id : undefined
      return roofOf === d.roof_asset_id ? [...ids, d.id] : [d.id]
    })
  }

  return (
    <div>
      <ViewHeader
        kicker="Inspections"
        title={roofs.length ? `${inspections.length} inspection${inspections.length === 1 ? '' : 's'} on record` : 'Inspections'}
        description="Record what you found on each roof. Its condition score, last inspection and next date update with it."
      >
        {perms.edit && roofs.length > 0 && (
          <>
            <button type="button" onClick={() => setModal({ kind: 'deficiency' })} className={portalGhostButton}>
              <ShieldAlert className="h-4 w-4" /> Log a problem
            </button>
            <button type="button" onClick={() => setModal({ kind: 'inspection' })} className={portalButton}>
              <Plus className="h-4 w-4" /> Record inspection
            </button>
          </>
        )}
      </ViewHeader>

      {roofs.length === 0 ? (
        <BigEmpty
          icon={ClipboardList}
          title="Add your first building"
          action={
            perms.edit ? (
              <ButtonLink href="/portal/roofs/portfolio/">
                <Warehouse className="h-4 w-4" /> Go to Portfolio
              </ButtonLink>
            ) : null
          }
        >
          Inspections are recorded on roofs. Add a building and its roofs in Portfolio, then record what you find on each visit.
        </BigEmpty>
      ) : (
        <>
          <StatStrip>
            <StatCell label={`Inspections in ${year}`} value={thisYear.length} icon={ClipboardCheck} onClick={() => setTab('log')} />
            <StatCell label="Roofs overdue" value={overdue.length} icon={CalendarClock} tone={overdue.length ? 'warn' : 'good'} delay={0.04} onClick={() => setTab('due')} />
            <StatCell label="Due in the next 60 days" value={dueSoon.length} icon={CalendarClock} delay={0.08} onClick={() => setTab('due')} />
            <StatCell
              label="Open critical / high problems"
              value={serious.length}
              icon={ShieldAlert}
              tone={serious.length ? 'bad' : 'good'}
              delay={0.12}
              onClick={() => setTab('problems')}
            />
          </StatStrip>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.08 }} className="mb-5">
            <Tabs
              id="inspections"
              value={tab}
              onChange={setTab}
              options={[
                { id: 'log', label: 'Inspection log', count: inspections.length },
                { id: 'due', label: 'Due & overdue', count: overdue.length + dueSoon.length + never.length },
                { id: 'problems', label: 'Problems', count: deficiencies.filter(isOpenDeficiency).length },
              ]}
            />
          </motion.div>

          {tab === 'log' && (
            <Panel>
              <InspectionLog
                inspections={inspections}
                roofsById={roofsById}
                deficiencies={deficiencies}
                empty={perms.edit ? 'No inspections yet. Record one to set a roof’s condition score.' : 'No inspections recorded yet.'}
              />
            </Panel>
          )}

          {tab === 'due' && (
            <Panel>
              <OverdueStrip roofs={roofs} today={today} />
              {due.length === 0 ? (
                <EmptyNote>Every roof has been inspected and none has a next date yet. Set one on the roof, or when you record its next inspection.</EmptyNote>
              ) : (
                <DataTable
                  minWidth={760}
                  head={[{ label: 'Roof' }, { label: 'Condition' }, { label: 'Last inspected' }, { label: 'Next inspection' }, ...(perms.edit ? [{ label: 'Record', srOnly: true }] : [])]}
                >
                  {due.map((r, i) => (
                    <DueRow key={r.id} roof={r} index={i} today={today} canEdit={perms.edit} onRecord={() => setModal({ kind: 'inspection', roofId: r.id })} />
                  ))}
                </DataTable>
              )}
            </Panel>
          )}

          {tab === 'problems' && (
            <Panel>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <ChevronSelect value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Status" wrapperClassName="w-full sm:w-52" className="!rounded-full !py-2">
                  <option value="active" style={OPTION_STYLE}>
                    Still open
                  </option>
                  <option value="all" style={OPTION_STYLE}>
                    Every status
                  </option>
                  {DEFICIENCY_STATUSES.map((s) => (
                    <option key={s} value={s} style={OPTION_STYLE}>
                      {DEFICIENCY_STATUS_LABEL[s]}
                    </option>
                  ))}
                </ChevronSelect>
                <ChevronSelect value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)} aria-label="Severity" wrapperClassName="w-full sm:w-44" className="!rounded-full !py-2">
                  <option value="all" style={OPTION_STYLE}>
                    Any severity
                  </option>
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s} style={OPTION_STYLE}>
                      {SEVERITY_LABEL[s]}
                    </option>
                  ))}
                </ChevronSelect>
                <span className="text-xs text-[var(--p-muted,#9DA3AB)]">{problems.length} shown</span>
                {perms.edit && (
                  <div className="ml-auto flex flex-wrap items-center gap-2">
                    {selected.length > 0 && selectedRoof && (
                      <span className="text-xs text-[var(--p-muted,#9DA3AB)]">
                        {selected.length} on {roofLabel(roofsById.get(selectedRoof))}
                      </span>
                    )}
                    <button
                      type="button"
                      disabled={!selected.length || !selectedRoof}
                      onClick={() => selectedRoof && setModal({ kind: 'estimate', roofId: selectedRoof, ids: selected })}
                      className={twMerge(portalButton, '!py-2 text-xs')}
                    >
                      <FilePlus2 className="h-3.5 w-3.5" /> Estimate the selected
                    </button>
                  </div>
                )}
              </div>
              {problems.length === 0 ? (
                <EmptyNote>{deficiencies.length ? 'No problems match these filters.' : 'No problems logged yet. They come in with inspections, or log one by itself.'}</EmptyNote>
              ) : (
                <DeficiencyTable rows={problems} roofsById={roofsById} perms={perms} onEdit={(d) => setModal({ kind: 'deficiency', deficiency: d })} selected={selected} onToggle={toggle} />
              )}
            </Panel>
          )}
        </>
      )}

      <Modal title="Record an inspection" open={modal?.kind === 'inspection'} onClose={close} wide>
        {modal?.kind === 'inspection' && (
          <InspectionForm
            roofs={roofs}
            fixedRoofId={modal.roofId}
            options={options}
            today={today}
            onDone={() => {
              close()
              setTab('log')
            }}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal title={modal?.kind === 'deficiency' && modal.deficiency ? 'Edit problem' : 'Log a problem'} open={modal?.kind === 'deficiency'} onClose={close}>
        {modal?.kind === 'deficiency' && <DeficiencyForm roofs={roofs} deficiency={modal.deficiency} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title="Estimate from problems" open={modal?.kind === 'estimate'} onClose={close} wide>
        {modal?.kind === 'estimate' && (
          <EstimateForm
            roofs={roofs}
            deficiencies={deficiencies}
            fixedRoofId={modal.roofId}
            initialDeficiencyIds={modal.ids}
            year={year}
            options={options}
            perms={perms}
            onDone={() => {
              close()
              setSelected([])
            }}
            onCancel={close}
          />
        )}
      </Modal>
    </div>
  )
}

function DueRow({ roof, index, today, canEdit, onRecord }: { roof: RoofItem; index: number; today: string; canEdit: boolean; onRecord: () => void }) {
  const days = daysFrom(today, roof.next_inspection_on)
  const late = days !== null && days < 0
  return (
    <motion.tr {...rowMotion(index)} className={rowCls}>
      <td className={twMerge(cellCls, 'min-w-[14rem]')}>
        <Link href={`/portal/roofs/${roof.id}/`} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
          {roofLabel(roof)}
        </Link>
        <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">
          {roof.tag}
          {roof.customer_name ? ` · ${roof.customer_name}` : ''}
        </span>
      </td>
      <td className={cellCls}>
        <ConditionBadge score={roof.condition_score} />
      </td>
      <td className={twMerge(cellCls, 'whitespace-nowrap text-[var(--p-muted,#9DA3AB)]')}>{roof.last_inspected_on ? dayLong(roof.last_inspected_on) : 'Never'}</td>
      <td className={twMerge(cellCls, 'whitespace-nowrap')}>
        <span className={twMerge('font-medium', late ? 'text-[#FFB877]' : 'text-[var(--p-ink,#fff)]')}>{roof.next_inspection_on ? dayLong(roof.next_inspection_on) : 'Needs a first inspection'}</span>
        {roof.next_inspection_on && <span className={twMerge('block text-xs', late ? 'text-[#FFB877]' : 'text-[var(--p-muted,#9DA3AB)]')}>{dueLabel(today, roof.next_inspection_on)}</span>}
      </td>
      {canEdit && (
        <td className={twMerge(cellCls, 'text-right')}>
          <button type="button" onClick={onRecord} className={twMerge(portalGhostButton, '!px-3 !py-1.5 text-xs')}>
            <ClipboardCheck className="h-3.5 w-3.5" /> Record
          </button>
        </td>
      )}
    </motion.tr>
  )
}
