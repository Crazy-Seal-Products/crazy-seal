'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, FilePen, FileText, Plus, Send, Warehouse, XCircle } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  ESTIMATE_SCENARIOS,
  SCENARIO_LABEL,
  SCENARIO_LIFE,
  compactMoney,
  defaultRepairArea,
  isOpenDeficiency,
  roofLabel,
  suggestedAmount,
  type EstimateItem,
  type EstimateScenario,
  type EstimateStatus,
  type LinkedQuote,
  type RoofFormOptions,
  type RoofPerms,
  type RoofWorkspace,
} from '@/lib/contractor/roof-shared'
import { money0 } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, EmptyNote, Modal, OPTION_STYLE } from '../projects/kit'
import { EstimateForm } from './RoofForms'
import { EstimateDetail, EstimateTable } from './RoofTables'
import { BigEmpty, ButtonLink, StatCell, StatStrip, Tabs } from './roof-kit'

type Filter = 'all' | EstimateStatus

type ModalState = { kind: 'new'; roofId?: string; scenario?: EstimateScenario } | { kind: 'edit'; id: string } | { kind: 'detail'; id: string } | null

/**
 * Estimates: what fixing each roof would cost the customer, as Thermo's roof
 * estimates (repair, restore or replace) moving from draft to sent to
 * approved or declined, with a scenario comparison for budgeting and the
 * Crazy Seal materials quote linked to each.
 */
export function EstimatesView({
  workspace,
  options,
  perms,
  quotesByProject,
}: {
  workspace: RoofWorkspace
  options: RoofFormOptions
  perms: RoofPerms
  /** Quotes on each roof project the viewer may see, by project id. */
  quotesByProject: Record<string, LinkedQuote[]>
}) {
  const { roofs, estimates, deficiencies, year } = workspace
  const [filter, setFilter] = useState<Filter>('all')
  const [modal, setModal] = useState<ModalState>(null)
  const close = () => setModal(null)
  const roofsById = useMemo(() => new Map(roofs.map((r) => [r.id, r])), [roofs])

  const sum = (list: EstimateItem[]) => list.reduce((s, e) => s + e.amount, 0)
  const sent = estimates.filter((e) => e.status === 'sent')
  const approvedThisYear = estimates.filter((e) => e.status === 'approved' && (e.approved_at ?? e.created_at).startsWith(String(year)))
  const drafts = estimates.filter((e) => e.status === 'draft')
  const declined = estimates.filter((e) => e.status === 'declined')
  const rows = estimates.filter((e) => filter === 'all' || e.status === filter)

  const open = modal?.kind === 'detail' ? estimates.find((e) => e.id === modal.id) : undefined
  const editing = modal?.kind === 'edit' ? estimates.find((e) => e.id === modal.id) : undefined
  const openRoof = open ? roofsById.get(open.roof_asset_id) : undefined

  return (
    <div>
      <ViewHeader
        kicker="Estimates"
        title={estimates.length ? `${sent.length} awaiting approval · ${compactMoney(sum(sent))}` : 'Roof estimates'}
        description="Price a repair, a Crazy Seal restoration or a replacement, send it to the customer, and record their answer."
      >
        {perms.edit && roofs.length > 0 && (
          <button type="button" onClick={() => setModal({ kind: 'new' })} className={portalButton}>
            <Plus className="h-4 w-4" /> New estimate
          </button>
        )}
      </ViewHeader>

      {roofs.length === 0 ? (
        <BigEmpty
          icon={FileText}
          title="Add your first building"
          action={
            perms.edit ? (
              <ButtonLink href="/portal/roofs/portfolio/">
                <Warehouse className="h-4 w-4" /> Go to Portfolio
              </ButtonLink>
            ) : null
          }
        >
          Estimates are priced for a roof. Add a building and its roofs in Portfolio first.
        </BigEmpty>
      ) : (
        <>
          <StatStrip>
            <StatCell label="Awaiting approval" value={sent.length} hint={money0(sum(sent))} icon={Send} tone={sent.length ? 'warn' : undefined} onClick={() => setFilter('sent')} />
            <StatCell label={`Approved in ${year}`} value={approvedThisYear.length} hint={money0(sum(approvedThisYear))} icon={CheckCircle2} tone="good" delay={0.04} onClick={() => setFilter('approved')} />
            <StatCell label="Drafts" value={drafts.length} hint={money0(sum(drafts))} icon={FilePen} delay={0.08} onClick={() => setFilter('draft')} />
            <StatCell label="Declined" value={declined.length} hint={money0(sum(declined))} icon={XCircle} delay={0.12} onClick={() => setFilter('declined')} />
          </StatStrip>

          <Panel className="mb-6">
            <div className="mb-4">
              <Tabs
                id="estimates"
                value={filter}
                onChange={setFilter}
                options={[
                  { id: 'all', label: 'All', count: estimates.length },
                  { id: 'draft', label: 'Draft', count: drafts.length },
                  { id: 'sent', label: 'Awaiting approval', count: sent.length },
                  { id: 'approved', label: 'Approved', count: estimates.filter((e) => e.status === 'approved').length },
                  { id: 'declined', label: 'Declined', count: declined.length },
                ]}
              />
            </div>
            {rows.length === 0 ? (
              <EmptyNote>
                {estimates.length
                  ? 'No estimates here.'
                  : perms.edit
                    ? 'No estimates yet. Start one from a roof, from problems found on an inspection, or from the comparison below.'
                    : 'No roof estimates yet.'}
              </EmptyNote>
            ) : (
              <EstimateTable rows={rows} roofsById={roofsById} onOpen={(e) => setModal({ kind: 'detail', id: e.id })} />
            )}
          </Panel>

          <ScenarioCompare workspace={workspace} perms={perms} onStart={(roofId, scenario) => setModal({ kind: 'new', roofId, scenario })} />
        </>
      )}

      <Modal title={editing ? `Edit estimate ${editing.number}` : 'New roof estimate'} open={modal?.kind === 'new' || modal?.kind === 'edit'} onClose={close} wide>
        {(modal?.kind === 'new' || modal?.kind === 'edit') && (
          <EstimateForm
            roofs={roofs}
            deficiencies={deficiencies}
            fixedRoofId={modal.kind === 'new' ? modal.roofId : undefined}
            estimate={editing}
            initialScenario={modal.kind === 'new' ? modal.scenario : undefined}
            year={year}
            options={options}
            perms={perms}
            onDone={(r) => (r.ok && r.id ? setModal({ kind: 'detail', id: r.id }) : close())}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal title={open ? `Estimate ${open.number}` : 'Estimate'} open={Boolean(open)} onClose={close} wide>
        {open && (
          <EstimateDetail
            estimate={open}
            roof={openRoof}
            deficiencies={deficiencies}
            quotes={openRoof?.project_id ? (quotesByProject[openRoof.project_id] ?? []) : []}
            perms={perms}
            onEdit={() => setModal({ kind: 'edit', id: open.id })}
            onClose={close}
          />
        )}
      </Modal>
    </div>
  )
}

/** Thermo's scenario comparison: the suggested price of each scenario for one roof, and what each buys. */
function ScenarioCompare({ workspace, perms, onStart }: { workspace: RoofWorkspace; perms: RoofPerms; onStart: (roofId: string, scenario: EstimateScenario) => void }) {
  const { roofs, deficiencies } = workspace
  const sorted = useMemo(() => [...roofs].sort((a, b) => roofLabel(a).localeCompare(roofLabel(b))), [roofs])
  const firstWithIssues = sorted.find((r) => r.open_deficiencies > 0)
  const [roofId, setRoofId] = useState(firstWithIssues?.id ?? sorted[0]?.id ?? '')
  const roof = roofs.find((r) => r.id === roofId)
  if (!roof) return null
  const area = roof.area_sqft ?? 0
  const openCost = deficiencies.filter((d) => d.roof_asset_id === roof.id && isOpenDeficiency(d)).reduce((s, d) => s + (d.est_cost ?? 0), 0)

  return (
    <Panel delay={0.08}>
      <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <PanelTitle className="mb-1">Compare scenarios</PanelTitle>
          <p className="text-xs text-[var(--p-muted,#9DA3AB)]">Suggested prices for budgets and capital requests, not a quote. Every one is editable on the estimate.</p>
        </div>
        <ChevronSelect value={roofId} onChange={(e) => setRoofId(e.target.value)} aria-label="Roof to compare" wrapperClassName="w-full md:w-80">
          {sorted.map((r) => (
            <option key={r.id} value={r.id} style={OPTION_STYLE}>
              {roofLabel(r)}
            </option>
          ))}
        </ChevronSelect>
      </div>
      {!area ? (
        <EmptyNote>Add this roof’s area to compare scenarios.</EmptyNote>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {ESTIMATE_SCENARIOS.map((s, i) => {
            const repairArea = defaultRepairArea(area)
            const amount = suggestedAmount(s, repairArea, area)
            const best = s === 'restore'
            return (
              <motion.div
                key={s}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 + i * 0.06 }}
                className={twMerge(
                  'relative flex flex-col overflow-hidden rounded-2xl border p-4',
                  best
                    ? 'border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] bg-[color-mix(in_oklab,var(--p-primary)_8%,transparent)] shadow-[0_20px_40px_-28px_var(--p-primary)]'
                    : 'border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.02]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[var(--p-ink,#fff)]">{SCENARIO_LABEL[s]}</p>
                  {best && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--p-primary-ink,#fff)]">
                      <Award className="h-3 w-3" /> Best value
                    </span>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-[var(--p-ink,#fff)]">{money0(amount)}</p>
                <p className="text-xs text-[var(--p-muted,#9DA3AB)]">
                  {s === 'repair' ? `${repairArea.toLocaleString('en-US')} sq ft of repairs` : `${area.toLocaleString('en-US')} sq ft`}
                  {s === 'repair' && openCost > 0 ? ` · open problems est. ${money0(openCost)}` : ''}
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--p-accent,#F9EA1C)]">{SCENARIO_LIFE[s].life}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--p-muted,#9DA3AB)]">{SCENARIO_LIFE[s].note}</p>
                {perms.edit && (
                  <button type="button" onClick={() => onStart(roof.id, s)} className={twMerge(best ? portalButton : portalGhostButton, 'mt-4 !py-2 text-xs')}>
                    <Plus className="h-3.5 w-3.5" /> Start a {SCENARIO_LABEL[s].toLowerCase()} estimate
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
