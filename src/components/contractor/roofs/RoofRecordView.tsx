'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CalendarPlus,
  ClipboardCheck,
  ExternalLink,
  FilePlus2,
  FolderKanban,
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Upload,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { RoofRecordData } from '@/lib/contractor/roofs'
import { setPlanStatus } from '@/lib/contractor/roof-actions'
import {
  PLAN_STATUS_LABEL,
  PLAN_STATUSES,
  addressLine,
  bySeverity,
  dayLong,
  daysFrom,
  dueLabel,
  isOpenDeficiency,
  sqftLabel,
  type DeficiencyItem,
  type DocumentItem,
  type PlanItem,
  type RoofFormOptions,
  type RoofPerms,
} from '@/lib/contractor/roof-shared'
import { PROJECT_STAGE_LABEL, type ProjectStage } from '@/lib/contractor/types'
import { dateShort, humanize, money0 } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ActivityFeed } from '../ActivityFeed'
import { EmptyNote, MiniLabel, Modal, OwnerPill, StagePill } from '../projects/kit'
import { DeficiencyForm, DocumentEditForm, DocumentUploadForm, EstimateForm, FacilityForm, InspectionForm, PlanForm, RoofForm } from './RoofForms'
import { DeficiencyTable, DocumentTable, EstimateDetail, EstimateTable, InspectionLog, priceMaterialsHref } from './RoofTables'
import { Bars, Card, ConditionBadge, Facts, Pill, PLAN_COLOR, ScoreRing, StatusSelect, Tabs, planTone } from './roof-kit'

export type RoofTab = 'overview' | 'inspections' | 'deficiencies' | 'estimates' | 'plan' | 'documents' | 'links'

type ModalState =
  | { kind: 'roof' }
  | { kind: 'facility' }
  | { kind: 'inspection' }
  | { kind: 'deficiency'; deficiency?: DeficiencyItem }
  | { kind: 'estimate'; id?: string; deficiencyIds?: string[] }
  | { kind: 'estimate-detail'; id: string }
  | { kind: 'plan'; item?: PlanItem; year?: number }
  | { kind: 'upload' }
  | { kind: 'doc'; doc: DocumentItem }
  | null

const OPEN_PLAN = (p: PlanItem) => p.status !== 'done' && p.status !== 'deferred'

/**
 * One roof's record (Thermo's RoofRecord, as a page): its condition, what's
 * on it and what's next, then tabs for inspections, problems, estimates, the
 * budget plan, documents, and its project and warranty.
 */
export function RoofRecordView({ data, options, perms, initialTab = 'overview' }: { data: RoofRecordData; options: RoofFormOptions; perms: RoofPerms; initialTab?: RoofTab }) {
  const { roof, facility, workspace, siblings } = data
  const { today, year } = workspace
  const [tab, setTab] = useState<RoofTab>(initialTab)
  const [modal, setModal] = useState<ModalState>(null)
  const [selected, setSelected] = useState<string[]>([])
  const close = () => setModal(null)

  const roofsById = useMemo(() => new Map([roof, ...siblings].map((r) => [r.id, r])), [roof, siblings])
  const facilitiesById = useMemo(() => new Map([[facility.id, facility]]), [facility])
  const deficiencies = useMemo(() => [...workspace.deficiencies].sort((a, b) => Number(isOpenDeficiency(b)) - Number(isOpenDeficiency(a)) || bySeverity(a, b)), [workspace.deficiencies])
  const openDefs = deficiencies.filter(isOpenDeficiency)
  const plans = workspace.plans
  const nextPlan = [...plans].filter(OPEN_PLAN).sort((a, b) => a.year - b.year)[0]
  const lastInspection = workspace.inspections[0]
  const nextDays = daysFrom(today, roof.next_inspection_on)
  const overdue = nextDays !== null && nextDays < 0
  const age = roof.year_installed ? year - roof.year_installed : null
  const estimateOpen = modal?.kind === 'estimate-detail' ? workspace.estimates.find((e) => e.id === modal.id) : undefined
  const estimateEditing = modal?.kind === 'estimate' && modal.id ? workspace.estimates.find((e) => e.id === modal.id) : undefined

  const tabs: { id: RoofTab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'inspections', label: 'Inspections', count: workspace.inspections.length },
    { id: 'deficiencies', label: 'Problems', count: openDefs.length },
    { id: 'estimates', label: 'Estimates', count: workspace.estimates.length },
    { id: 'plan', label: 'Plan', count: plans.filter(OPEN_PLAN).length },
    { id: 'documents', label: 'Documents', count: workspace.documents.length },
    { id: 'links', label: 'Project & warranty' },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_EXPO }} className="mb-5">
        <Link href="/portal/roofs/" className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:text-[var(--p-ink,#fff)]">
          <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" /> Roof assets
        </Link>
      </motion.div>

      {/* Header */}
      <Panel className="mb-6 overflow-hidden">
        <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.08] blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-start">
          <ScoreRing score={roof.condition_score} size={76} stroke={6} tip={roof.last_inspected_on ? `From the inspection on ${dayLong(roof.last_inspected_on)}.` : undefined} />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--p-kicker,#F9EA1C)]">
              Roof record · <span className="font-mono tracking-[0.1em]">{roof.tag}</span>
            </p>
            <h1 className="mt-1.5 text-2xl font-bold leading-tight text-[var(--p-ink,#F5F1EC)] md:text-3xl">
              {facility.name} · {roof.name}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--p-muted,#9DA3AB)]">
              {[facility.customer_name, [facility.city, facility.state].filter(Boolean).join(', '), roof.roof_type, roof.area_sqft ? sqftLabel(roof.area_sqft) : null].filter(Boolean).join(' · ') ||
                'No details yet'}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <ConditionBadge score={roof.condition_score} />
              {roof.system && <Pill tone="info">{roof.system}</Pill>}
              {openDefs.length > 0 && (
                <Pill tone="warn">
                  {openDefs.length} open problem{openDefs.length === 1 ? '' : 's'}
                </Pill>
              )}
              {overdue && <Pill tone="bad">Inspection overdue</Pill>}
            </div>
          </div>
          {perms.edit || perms.quotes ? (
            <div className="flex flex-wrap gap-2 md:max-w-[22rem] md:justify-end">
              {perms.edit && (
                <button type="button" onClick={() => setModal({ kind: 'inspection' })} className={portalButton}>
                  <CalendarPlus className="h-4 w-4" /> Record inspection
                </button>
              )}
              {perms.quotes && (
                <Link href={priceMaterialsHref(roof)} className={portalGhostButton}>
                  <Calculator className="h-4 w-4" /> Price materials
                </Link>
              )}
              {perms.edit && (
                <button type="button" onClick={() => setModal({ kind: 'roof' })} className={portalGhostButton}>
                  <Pencil className="h-4 w-4" /> Edit roof
                </button>
              )}
            </div>
          ) : null}
        </div>
        <div className="relative mt-5 max-w-full overflow-x-auto pb-1 [color-scheme:dark] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Tabs id="roof-record" value={tab} onChange={setTab} options={tabs} className="flex-nowrap" />
        </div>
      </Panel>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
        >
          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                <Card title="What’s on this roof">
                  <p className="text-lg font-semibold text-[var(--p-ink,#fff)]">{roof.system ?? 'System not recorded'}</p>
                  <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                    <Facts
                      rows={[
                        ['Roof type', roof.roof_type],
                        ['Area', roof.area_sqft ? `${roof.area_sqft.toLocaleString('en-US')} sq ft` : null],
                        ['Installed', roof.year_installed ? `${roof.year_installed}${age !== null && age >= 0 ? ` · ${age} yr${age === 1 ? '' : 's'}` : ''}` : null],
                      ]}
                    />
                    <Facts
                      rows={[
                        ['Slope', roof.slope],
                        ['Deck', roof.deck],
                        ['Tag', <span key="tag" className="font-mono text-xs">{roof.tag}</span>],
                      ]}
                    />
                  </div>
                  {roof.notes && <p className="mt-4 whitespace-pre-line border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-3 text-sm text-[var(--p-ink,#F5F1EC)]">{roof.notes}</p>}
                </Card>

                <section
                  className={twMerge(
                    'rounded-2xl border p-4',
                    nextPlan
                      ? 'border-[color-mix(in_oklab,var(--p-primary)_35%,transparent)] bg-[color-mix(in_oklab,var(--p-primary)_8%,transparent)]'
                      : 'border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.025]',
                  )}
                >
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--p-primary,#6DC015)]">Next decision</h3>
                  {nextPlan ? (
                    <>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-3xl font-black tabular-nums text-[var(--p-ink,#fff)]">{nextPlan.year}</span>
                        <span className="text-lg font-semibold text-[var(--p-ink,#fff)]">{nextPlan.action}</span>
                        <Pill tone={planTone(nextPlan.status)}>{PLAN_STATUS_LABEL[nextPlan.status]}</Pill>
                      </div>
                      <p className="mt-1 text-sm tabular-nums text-[var(--p-ink,#fff)]">{money0(nextPlan.est_cost)}</p>
                      {nextPlan.notes && <p className="mt-2 text-sm text-[var(--p-muted,#9DA3AB)]">{nextPlan.notes}</p>}
                      <button type="button" onClick={() => setTab('plan')} className="mt-3 text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                        See the whole plan →
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[var(--p-muted,#9DA3AB)]">Nothing planned yet. Add the next inspection, repair or restoration with its year and cost, so the budget is ready before the roof fails.</p>
                      {perms.edit && (
                        <button type="button" onClick={() => setModal({ kind: 'plan' })} className={twMerge(portalGhostButton, 'mt-3 !py-2 text-xs')}>
                          <Plus className="h-3.5 w-3.5" /> Add to the plan
                        </button>
                      )}
                    </>
                  )}
                </section>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <Card title="Inspections">
                  <Facts
                    rows={[
                      ['Last inspected', lastInspection ? `${dayLong(lastInspection.inspected_on)} · ${lastInspection.kind}` : dayLong(roof.last_inspected_on)],
                      ['Inspector', lastInspection?.inspector_name],
                      ['Score then', lastInspection?.condition_score ?? null],
                      [
                        'Next inspection',
                        <span key="next" className={overdue ? 'text-[#FFB877]' : undefined}>
                          {roof.next_inspection_on ? `${dayLong(roof.next_inspection_on)}${overdue ? ' · overdue' : ''}` : 'Not scheduled'}
                        </span>,
                      ],
                    ]}
                  />
                  {roof.next_inspection_on && <p className="mt-3 text-xs text-[var(--p-muted,#9DA3AB)]">{dueLabel(today, roof.next_inspection_on)}</p>}
                </Card>
                <Card
                  title="Building"
                  action={
                    perms.edit && facility.editable ? (
                      <button type="button" onClick={() => setModal({ kind: 'facility' })} className="text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                        Edit
                      </button>
                    ) : null
                  }
                >
                  <p className="font-semibold text-[var(--p-ink,#fff)]">{facility.name}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-[var(--p-muted,#9DA3AB)]">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {addressLine(facility) || 'No address yet'}
                  </p>
                  {data.customer && (
                    <div className="mt-3 border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-3 text-sm">
                      <MiniLabel className="mb-1">Owner</MiniLabel>
                      {data.customer.visible ? (
                        <Link href={`/portal/customers/${data.customer.id}/`} className="font-semibold text-[var(--p-ink,#fff)] hover:text-[var(--p-accent,#F9EA1C)]">
                          {data.customer.name}
                        </Link>
                      ) : (
                        <p className="font-semibold text-[var(--p-ink,#fff)]">{data.customer.name}</p>
                      )}
                      {data.customer.contact_name && data.customer.contact_name !== data.customer.name && <p className="text-[var(--p-muted,#9DA3AB)]">{data.customer.contact_name}</p>}
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {data.customer.phone && (
                          <a href={`tel:${data.customer.phone}`} className="inline-flex items-center gap-1 text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]">
                            <Phone className="h-3 w-3" /> {data.customer.phone}
                          </a>
                        )}
                        {data.customer.email && (
                          <a href={`mailto:${data.customer.email}`} className="inline-flex items-center gap-1 text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]">
                            <Mail className="h-3 w-3" /> {data.customer.email}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
                <Card title="Responsible">
                  <OwnerPill name={roof.owner_name} />
                  <p className="mt-3 text-xs text-[var(--p-muted,#9DA3AB)]">Added {dateShort(roof.created_at)} · updated {dateShort(roof.updated_at)}</p>
                  {siblings.length > 0 && (
                    <div className="mt-3 border-t border-[var(--p-line,rgba(255,255,255,0.06))] pt-3">
                      <MiniLabel className="mb-2">Other roofs here</MiniLabel>
                      <div className="flex flex-wrap gap-1.5">
                        {siblings.map((r) => (
                          <Link
                            key={r.id}
                            href={`/portal/roofs/${r.id}/`}
                            className="rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.04] px-2.5 py-1 text-[12px] font-semibold text-[var(--p-ink,#fff)] transition hover:bg-white/[0.08]"
                          >
                            {r.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              <Panel delay={0.05}>
                <PanelTitle>
                  <span className="inline-flex items-center gap-2">
                    <History className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" /> History
                  </span>
                </PanelTitle>
                <ActivityFeed items={data.activity} people={data.people} emptyText="Nothing recorded on this roof yet." />
              </Panel>
            </div>
          )}

          {tab === 'inspections' && (
            <Panel>
              <PanelTitle
                action={
                  perms.edit ? (
                    <button type="button" onClick={() => setModal({ kind: 'inspection' })} className={twMerge(portalButton, '!py-2 text-xs')}>
                      <ClipboardCheck className="h-3.5 w-3.5" /> Record inspection
                    </button>
                  ) : null
                }
              >
                Inspections
              </PanelTitle>
              <InspectionLog
                inspections={workspace.inspections}
                roofsById={roofsById}
                deficiencies={workspace.deficiencies}
                showRoof={false}
                empty={perms.edit ? 'No inspections yet. Record the first one to set this roof’s condition.' : 'No inspections recorded yet.'}
              />
            </Panel>
          )}

          {tab === 'deficiencies' && (
            <Panel>
              <PanelTitle
                action={
                  perms.edit ? (
                    <div className="flex flex-wrap items-center gap-2">
                      {selected.length > 0 && (
                        <button type="button" onClick={() => setModal({ kind: 'estimate', deficiencyIds: selected })} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                          <FilePlus2 className="h-3.5 w-3.5" /> Estimate {selected.length} selected
                        </button>
                      )}
                      <button type="button" onClick={() => setModal({ kind: 'deficiency' })} className={twMerge(portalButton, '!py-2 text-xs')}>
                        <AlertTriangle className="h-3.5 w-3.5" /> Log a problem
                      </button>
                    </div>
                  ) : null
                }
              >
                Problems
              </PanelTitle>
              {deficiencies.length === 0 ? (
                <EmptyNote>{perms.edit ? 'No problems logged. Add them as you find them, or record an inspection with what it found.' : 'No problems logged on this roof.'}</EmptyNote>
              ) : (
                <DeficiencyTable
                  rows={deficiencies}
                  roofsById={roofsById}
                  showRoof={false}
                  perms={perms}
                  onEdit={(d) => setModal({ kind: 'deficiency', deficiency: d })}
                  selected={selected}
                  onToggle={(d) => setSelected((ids) => (ids.includes(d.id) ? ids.filter((x) => x !== d.id) : [...ids, d.id]))}
                />
              )}
            </Panel>
          )}

          {tab === 'estimates' && (
            <Panel>
              <PanelTitle
                action={
                  <div className="flex flex-wrap gap-2">
                    {perms.quotes && (
                      <Link href={priceMaterialsHref(roof)} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                        <Calculator className="h-3.5 w-3.5" /> Price materials
                      </Link>
                    )}
                    {perms.edit && (
                      <button type="button" onClick={() => setModal({ kind: 'estimate' })} className={twMerge(portalButton, '!py-2 text-xs')}>
                        <Plus className="h-3.5 w-3.5" /> New estimate
                      </button>
                    )}
                  </div>
                }
              >
                Estimates
              </PanelTitle>
              {workspace.estimates.length === 0 ? (
                <EmptyNote>
                  {perms.edit ? 'No estimates yet. Price a repair, a Crazy Seal restoration or a replacement for the customer to approve.' : 'No estimates for this roof yet.'}
                </EmptyNote>
              ) : (
                <EstimateTable rows={workspace.estimates} roofsById={roofsById} showRoof={false} onOpen={(e) => setModal({ kind: 'estimate-detail', id: e.id })} />
              )}
            </Panel>
          )}

          {tab === 'plan' && <PlanTab plans={plans} year={year} perms={perms} onAdd={(y) => setModal({ kind: 'plan', year: y })} onEdit={(item) => setModal({ kind: 'plan', item })} />}

          {tab === 'documents' && (
            <Panel>
              <PanelTitle
                action={
                  perms.edit ? (
                    <button type="button" onClick={() => setModal({ kind: 'upload' })} className={twMerge(portalButton, '!py-2 text-xs')}>
                      <Upload className="h-3.5 w-3.5" /> Upload
                    </button>
                  ) : null
                }
              >
                Documents
              </PanelTitle>
              {workspace.documents.length === 0 ? (
                <EmptyNote>{perms.edit ? 'No documents yet. Upload the warranty, inspection reports, photos, specs and invoices for this roof.' : 'No documents for this roof yet.'}</EmptyNote>
              ) : (
                <DocumentTable rows={workspace.documents} facilitiesById={facilitiesById} roofsById={roofsById} perms={perms} onEdit={(doc) => setModal({ kind: 'doc', doc })} />
              )}
            </Panel>
          )}

          {tab === 'links' && <LinksTab data={data} perms={perms} onEdit={() => setModal({ kind: 'roof' })} />}
        </motion.div>
      </AnimatePresence>

      {/* Forms */}
      <Modal title="Edit roof" open={modal?.kind === 'roof'} onClose={close} wide>
        {modal?.kind === 'roof' && <RoofForm roof={roof} facilities={workspace.facilities.filter((f) => f.editable)} options={options} perms={perms} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title="Edit building" open={modal?.kind === 'facility'} onClose={close} wide>
        {modal?.kind === 'facility' && <FacilityForm facility={facility} options={options} perms={perms} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title="Record an inspection" open={modal?.kind === 'inspection'} onClose={close} wide>
        {modal?.kind === 'inspection' && <InspectionForm roofs={[roof]} fixedRoofId={roof.id} options={options} today={today} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title={modal?.kind === 'deficiency' && modal.deficiency ? 'Edit problem' : 'Log a problem'} open={modal?.kind === 'deficiency'} onClose={close}>
        {modal?.kind === 'deficiency' && <DeficiencyForm roofs={[roof]} fixedRoofId={roof.id} deficiency={modal.deficiency} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title={estimateEditing ? `Edit estimate ${estimateEditing.number}` : 'New estimate'} open={modal?.kind === 'estimate'} onClose={close} wide>
        {modal?.kind === 'estimate' && (
          <EstimateForm
            roofs={[roof]}
            deficiencies={workspace.deficiencies}
            fixedRoofId={roof.id}
            estimate={estimateEditing}
            initialDeficiencyIds={modal.deficiencyIds}
            year={year}
            options={options}
            perms={perms}
            onDone={() => {
              close()
              setSelected([])
              setTab('estimates')
            }}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal title={estimateOpen ? `Estimate ${estimateOpen.number}` : 'Estimate'} open={Boolean(estimateOpen)} onClose={close} wide>
        {estimateOpen && (
          <EstimateDetail
            estimate={estimateOpen}
            roof={roof}
            deficiencies={workspace.deficiencies}
            quotes={data.projectQuotes}
            perms={perms}
            onEdit={() => setModal({ kind: 'estimate', id: estimateOpen.id })}
            onClose={close}
          />
        )}
      </Modal>
      <Modal title={modal?.kind === 'plan' && modal.item ? 'Plan item' : 'Add to the plan'} open={modal?.kind === 'plan'} onClose={close}>
        {modal?.kind === 'plan' && <PlanForm roofs={[roof]} fixedRoofId={roof.id} item={modal.item} defaultYear={modal.year} year={year} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title="Upload a document" open={modal?.kind === 'upload'} onClose={close} wide>
        {modal?.kind === 'upload' && (
          <DocumentUploadForm
            facilities={[facility]}
            roofs={[roof, ...siblings]}
            projects={options.projects}
            initial={{ roofId: roof.id, facilityId: facility.id, projectId: roof.project_id }}
            onDone={close}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal title="Document" open={modal?.kind === 'doc'} onClose={close} wide>
        {modal?.kind === 'doc' && <DocumentEditForm doc={modal.doc} facilities={[facility]} roofs={[roof, ...siblings]} projects={options.projects} onDone={close} onCancel={close} />}
      </Modal>
    </div>
  )
}

/* ------------------------------------------------------------------ plan */

function PlanTab({ plans, year, perms, onAdd, onEdit }: { plans: PlanItem[]; year: number; perms: RoofPerms; onAdd: (year?: number) => void; onEdit: (p: PlanItem) => void }) {
  const live = plans.filter((p) => p.status !== 'deferred')
  const last = Math.max(year + 4, ...plans.map((p) => p.year))
  const years = Array.from({ length: Math.min(last - year + 1, 10) }, (_, i) => year + i)
  const bars = years.map((y) => {
    const rows = live.filter((p) => p.year === y)
    return {
      label: String(y),
      primary: rows.filter((p) => p.status !== 'proposed').reduce((s, p) => s + p.est_cost, 0),
      secondary: rows.filter((p) => p.status === 'proposed').reduce((s, p) => s + p.est_cost, 0),
    }
  })
  const groupYears = [...new Set(plans.map((p) => p.year))].sort((a, b) => a - b)
  const total = live.filter((p) => p.year >= year && p.year < year + 5).reduce((s, p) => s + p.est_cost, 0)

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.3fr]">
      <Panel className="min-w-0">
        <PanelTitle>Spend by year</PanelTitle>
        <p className="-mt-2 mb-4 text-xs text-[var(--p-muted,#9DA3AB)]">
          {money0(total)} over {year}–{year + 4}, deferred items left out.
        </p>
        <Bars data={bars} format={(n) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${Math.round(n)}`)} primaryLabel="Approved, funded or done" secondaryLabel="Proposed" />
      </Panel>
      <Panel className="min-w-0" delay={0.05}>
        <PanelTitle
          action={
            perms.edit ? (
              <button type="button" onClick={() => onAdd()} className={twMerge(portalButton, '!py-2 text-xs')}>
                <Plus className="h-3.5 w-3.5" /> Add to the plan
              </button>
            ) : null
          }
        >
          Budget plan
        </PanelTitle>
        {plans.length === 0 ? (
          <EmptyNote>{perms.edit ? 'Nothing planned yet. Add what this roof needs, year by year: inspections, maintenance, repairs, a restoration.' : 'Nothing planned for this roof yet.'}</EmptyNote>
        ) : (
          <div className="space-y-4">
            {groupYears.map((y) => {
              const rows = plans.filter((p) => p.year === y)
              return (
                <section key={y}>
                  <div className="mb-1.5 flex items-baseline justify-between border-b border-[var(--p-line,rgba(255,255,255,0.08))] pb-1.5">
                    <h3 className={twMerge('text-lg font-bold tabular-nums', y < year ? 'text-[var(--p-muted,#9DA3AB)]' : 'text-[var(--p-ink,#fff)]')}>{y}</h3>
                    <span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">{money0(rows.filter((p) => p.status !== 'deferred').reduce((s, p) => s + p.est_cost, 0))}</span>
                  </div>
                  <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
                    {rows.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center gap-3 py-2.5">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PLAN_COLOR[p.status] }} />
                        <span className="min-w-0 flex-1">
                          <span className="font-semibold text-[var(--p-ink,#fff)]">{p.action}</span>
                          <span className="ml-2 tabular-nums text-[var(--p-muted,#9DA3AB)]">{money0(p.est_cost)}</span>
                          {p.notes && <span className="block truncate text-xs text-[var(--p-muted,#9DA3AB)]">{p.notes}</span>}
                        </span>
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
                            <button
                              type="button"
                              onClick={() => onEdit(p)}
                              aria-label={`Edit the ${p.year} ${p.action.toLowerCase()}`}
                              className="grid h-8 w-8 place-items-center rounded-full text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </Panel>
    </div>
  )
}

/* ------------------------------------------------------ project & warranty */

function LinksTab({ data, perms, onEdit }: { data: RoofRecordData; perms: RoofPerms; onEdit: () => void }) {
  const { project, warranty, roof, projectQuotes } = data
  const stage = project?.stage as ProjectStage | undefined
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <PanelTitle>
          <span className="inline-flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" /> Project
          </span>
        </PanelTitle>
        {project ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {project.visible ? (
                <Link href={`/portal/projects/${project.id}/`} className="text-lg font-semibold text-[var(--p-ink,#fff)] hover:text-[var(--p-accent,#F9EA1C)]">
                  {project.name}
                </Link>
              ) : (
                <span className="text-lg font-semibold text-[var(--p-ink,#fff)]">{project.name}</span>
              )}
              {stage && stage in PROJECT_STAGE_LABEL ? <StagePill stage={stage} /> : null}
            </div>
            {project.sqft ? <p className="text-sm text-[var(--p-muted,#9DA3AB)]">{project.sqft.toLocaleString('en-US')} sq ft on the project</p> : null}
            {projectQuotes.length > 0 && (
              <div>
                <MiniLabel className="mb-2">Materials quotes</MiniLabel>
                <ul className="space-y-1.5">
                  {projectQuotes.map((q) => (
                    <li key={q.id}>
                      <Link
                        href={`/portal/quotes/${q.id}/`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] px-3 py-2 text-sm transition hover:bg-white/[0.04]"
                      >
                        <span className="font-semibold">{q.number}</span>
                        <span className="flex items-center gap-2 text-xs text-[var(--p-muted,#9DA3AB)]">
                          {money0(q.total)} · {humanize(q.status)} <ExternalLink className="h-3 w-3" />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {perms.quotes && (
                <Link href={priceMaterialsHref(roof)} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                  <Calculator className="h-3.5 w-3.5" /> Price materials
                </Link>
              )}
              {project.visible && (
                <Link href={`/portal/projects/${project.id}/`} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                  <ExternalLink className="h-3.5 w-3.5" /> Open project
                </Link>
              )}
            </div>
          </div>
        ) : (
          <EmptyNote className="text-left">
            No project linked. Link the job that did (or will do) the work, so its quotes, orders and photos sit with this roof.
            {perms.edit && (
              <button type="button" onClick={onEdit} className="mt-3 block font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                Link a project
              </button>
            )}
          </EmptyNote>
        )}
      </Panel>

      <Panel delay={0.05}>
        <PanelTitle>
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" /> Warranty
          </span>
        </PanelTitle>
        {!perms.warranties ? (
          <EmptyNote>{roof.warranty_registration_id ? 'This roof has a warranty registration. Your role doesn’t see warranties.' : 'Your role doesn’t see warranties.'}</EmptyNote>
        ) : warranty ? (
          <div className="space-y-3">
            <p className="text-lg font-semibold text-[var(--p-ink,#fff)]">{warranty.name}</p>
            <Facts
              rows={[
                ['Status', <Pill key="s" tone={warranty.status === 'approved' ? 'good' : warranty.status === 'flagged' ? 'bad' : 'warn'}>{warranty.status === 'submitted' ? 'Awaiting review' : humanize(warranty.status)}</Pill>],
                ['Registered', dateShort(warranty.created_at)],
              ]}
            />
            <Link href="/portal/warranties/" className={twMerge(portalGhostButton, '!py-2 text-xs')}>
              <ShieldCheck className="h-3.5 w-3.5" /> All warranties
            </Link>
          </div>
        ) : (
          <EmptyNote className="text-left">
            No warranty registration linked to this roof.
            {perms.edit && (
              <button type="button" onClick={onEdit} className="mt-3 block font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                Link a registration
              </button>
            )}
          </EmptyNote>
        )}
      </Panel>
    </div>
  )
}
