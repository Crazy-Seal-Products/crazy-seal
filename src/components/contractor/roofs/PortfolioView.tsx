'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, Building2, CalendarClock, Gauge, Layers, MapPin, Pencil, Plus, Warehouse } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  CONDITION_COLOR,
  CONDITIONS,
  NO_SCORE_COLOR,
  addressLine,
  averageScore,
  conditionOf,
  dayLong,
  daysFrom,
  dueLabel,
  nextInspection,
  roofLabel,
  sqftLabel,
  type FacilityItem,
  type RoofFormOptions,
  type RoofItem,
  type RoofPerms,
  type RoofWorkspace,
} from '@/lib/contractor/roof-shared'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, EmptyNote, Modal, OPTION_STYLE, OwnerPill, SearchPill } from '../projects/kit'
import { FacilityForm, RoofForm } from './RoofForms'
import { BigEmpty, ConditionBar, ScoreRing, StatCell, StatStrip } from './roof-kit'

type ModalState = { kind: 'facility'; facility?: FacilityItem } | { kind: 'roof'; facilityId?: string } | null

/** Column template shared by the building rows and their header (Thermo's facility rows). */
const COLS = 'lg:grid lg:grid-cols-[minmax(0,2.3fr)_minmax(0,0.5fr)_minmax(0,0.8fr)_minmax(0,0.75fr)_minmax(0,1.1fr)_minmax(0,1.6fr)] lg:items-center lg:gap-4'

function matches(f: FacilityItem, roofs: RoofItem[], q: string): boolean {
  if (!q) return true
  const hay = [f.name, f.street, f.city, f.state, f.zip, f.customer_name, ...roofs.flatMap((r) => [r.name, r.tag, r.roof_type])].filter(Boolean).join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

/**
 * Portfolio: the buildings the contractor looks after, grouped by the
 * customer who owns them (Thermo's portfolio view): each building's average
 * roof condition, roofs, area, open problems and next inspection, with its
 * roofs one click away.
 */
export function PortfolioView({ workspace, options, perms }: { workspace: RoofWorkspace; options: RoofFormOptions; perms: RoofPerms }) {
  const router = useRouter()
  const { facilities, roofs, today } = workspace
  const [query, setQuery] = useState('')
  const [owner, setOwner] = useState('all')
  const [modal, setModal] = useState<ModalState>(null)
  const close = () => setModal(null)

  const roofsByFacility = useMemo(() => {
    const m = new Map<string, RoofItem[]>()
    for (const r of roofs) m.set(r.facility_id, [...(m.get(r.facility_id) ?? []), r])
    return m
  }, [roofs])

  const owners = useMemo(() => {
    const m = new Map<string, string>()
    for (const f of facilities) if (f.customer_id) m.set(f.customer_id, f.customer_name ?? 'Customer')
    return [...m.entries()].sort((a, b) => a[1].localeCompare(b[1]))
  }, [facilities])

  const q = query.trim()
  const shown = facilities.filter((f) => (owner === 'all' || (owner === 'none' ? !f.customer_id : f.customer_id === owner)) && matches(f, roofsByFacility.get(f.id) ?? [], q))
  const groups = useMemo(() => {
    const m = new Map<string, { key: string; name: string; facilities: FacilityItem[] }>()
    for (const f of shown) {
      const key = f.customer_id ?? 'none'
      const g = m.get(key) ?? { key, name: f.customer_name ?? 'No owner yet', facilities: [] }
      g.facilities.push(f)
      m.set(key, g)
    }
    return [...m.values()].sort((a, b) => (a.key === 'none' ? 1 : b.key === 'none' ? -1 : a.name.localeCompare(b.name)))
  }, [shown])

  const totalSqft = roofs.reduce((s, r) => s + (r.area_sqft ?? 0), 0)
  const avg = averageScore(roofs)
  const open = roofs.reduce((s, r) => s + r.open_deficiencies, 0)
  const overdue = roofs.filter((r) => r.next_inspection_on && r.next_inspection_on < today)
  const parts = [
    ...CONDITIONS.map((c) => ({ condition: c, value: roofs.filter((r) => r.condition_score !== null && conditionOf(r.condition_score) === c).reduce((s, r) => s + (r.area_sqft || 1), 0) })),
    { condition: 'none' as const, value: roofs.filter((r) => r.condition_score === null).reduce((s, r) => s + (r.area_sqft || 1), 0) },
  ]
  const upcoming = [...roofs].filter((r) => r.next_inspection_on).sort((a, b) => (a.next_inspection_on! < b.next_inspection_on! ? -1 : 1)).slice(0, 6)
  const editableFacilities = facilities.filter((f) => f.editable)

  const headerActions = perms.edit ? (
    <>
      {facilities.length > 0 && (
        <button type="button" onClick={() => setModal({ kind: 'roof' })} className={portalGhostButton} disabled={!editableFacilities.length}>
          <Plus className="h-4 w-4" /> Add roof
        </button>
      )}
      <button type="button" onClick={() => setModal({ kind: 'facility' })} className={portalButton}>
        <Building2 className="h-4 w-4" /> Add building
      </button>
    </>
  ) : null

  return (
    <div>
      <ViewHeader
        kicker="Portfolio"
        title={facilities.length ? `${facilities.length} building${facilities.length === 1 ? '' : 's'} · ${roofs.length} roof${roofs.length === 1 ? '' : 's'}` : 'Roof portfolio'}
        description="Every building your customers own and every roof on it: how each is holding up, what’s wrong, and when it’s next due."
      >
        {headerActions}
      </ViewHeader>

      {facilities.length === 0 ? (
        <BigEmpty
          title="Add your first building"
          action={
            perms.edit ? (
              <button type="button" onClick={() => setModal({ kind: 'facility' })} className={portalButton}>
                <Building2 className="h-4 w-4" /> Add a building
              </button>
            ) : null
          }
        >
          {perms.edit
            ? 'A building holds a customer’s roofs. Add one, then its roofs, and you can record inspections, log problems, price repairs and plan the budget year by year.'
            : 'Buildings show up here as your team adds them.'}
        </BigEmpty>
      ) : (
        <>
          <StatStrip>
            <StatCell label="Buildings" value={facilities.length} icon={Building2} />
            <StatCell label="Roof assets" value={roofs.length} icon={Warehouse} delay={0.04} />
            <StatCell label="Total roof area" display={sqftLabel(totalSqft)} icon={Layers} delay={0.08} />
            <StatCell
              label="Average condition"
              display={avg === null ? '—' : avg}
              hint={avg === null ? 'No inspections yet' : 'Out of 100'}
              icon={Gauge}
              tone={avg !== null && avg < 60 ? 'warn' : undefined}
              delay={0.12}
            />
            <StatCell
              label="Open problems"
              value={open}
              hint={`${overdue.length} inspection${overdue.length === 1 ? '' : 's'} overdue`}
              icon={AlertTriangle}
              tone={open ? 'warn' : 'good'}
              delay={0.16}
            />
          </StatStrip>

          <div className="mb-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
            <Panel delay={0.08} className="min-w-0">
              <PanelTitle>Condition by roof area</PanelTitle>
              <ConditionBar parts={parts} />
              <p className="mt-3 text-xs text-[var(--p-muted,#9DA3AB)]">From each roof’s latest inspection: 80 and up is good, 60–79 fair, 40–59 poor, under 40 critical.</p>
            </Panel>
            <Panel delay={0.12} className="min-w-0">
              <PanelTitle>
                <span className="inline-flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" /> Next inspections
                </span>
              </PanelTitle>
              {upcoming.length === 0 ? (
                <EmptyNote className="py-5">No inspections scheduled. Set a roof’s next inspection date, or record one.</EmptyNote>
              ) : (
                <ul className="space-y-1.5">
                  {upcoming.map((r) => {
                    const late = (daysFrom(today, r.next_inspection_on) ?? 0) < 0
                    return (
                      <li key={r.id}>
                        <Link
                          href={`/portal/roofs/${r.id}/`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.06))] bg-white/[0.02] px-3 py-2 text-sm transition hover:bg-white/[0.05]"
                        >
                          <span className="min-w-0 truncate font-medium text-[var(--p-ink,#fff)]">{roofLabel(r)}</span>
                          <span className={twMerge('shrink-0 text-xs tabular-nums', late ? 'font-semibold text-[#FFB877]' : 'text-[var(--p-muted,#9DA3AB)]')}>
                            {late ? dueLabel(today, r.next_inspection_on) : dayLong(r.next_inspection_on)}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.1 }}
            className="mb-5 flex flex-wrap items-center gap-2"
          >
            <SearchPill value={query} onChange={setQuery} label="Search buildings" placeholder="Search building, address, roof, tag" className="w-full sm:w-80" />
            <ChevronSelect value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Owner" wrapperClassName="w-full sm:w-60" className="!rounded-full !py-2">
              <option value="all" style={OPTION_STYLE}>
                All owners
              </option>
              {owners.map(([id, name]) => (
                <option key={id} value={id} style={OPTION_STYLE}>
                  {name}
                </option>
              ))}
              <option value="none" style={OPTION_STYLE}>
                No owner yet
              </option>
            </ChevronSelect>
            <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
              {shown.length === facilities.length ? facilities.length : `${shown.length} of ${facilities.length}`} building{facilities.length === 1 ? '' : 's'}
            </span>
          </motion.div>

          {groups.length === 0 ? (
            <Panel>
              <EmptyNote>No buildings match.</EmptyNote>
            </Panel>
          ) : (
            <div className="space-y-5">
              {groups.map((g, gi) => (
                <OwnerGroup
                  key={g.key}
                  name={g.name}
                  facilities={g.facilities}
                  roofsByFacility={roofsByFacility}
                  today={today}
                  perms={perms}
                  delay={Math.min(0.1 + gi * 0.05, 0.4)}
                  onEdit={(facility) => setModal({ kind: 'facility', facility })}
                  onAddRoof={(facilityId) => setModal({ kind: 'roof', facilityId })}
                />
              ))}
            </div>
          )}
        </>
      )}

      <Modal title={modal?.kind === 'facility' && modal.facility ? 'Edit building' : 'Add a building'} open={modal?.kind === 'facility'} onClose={close} wide>
        {modal?.kind === 'facility' && <FacilityForm facility={modal.facility} options={options} perms={perms} onDone={close} onCancel={close} />}
      </Modal>
      <Modal title="Add a roof" open={modal?.kind === 'roof'} onClose={close} wide>
        {modal?.kind === 'roof' && (
          <RoofForm
            facilities={editableFacilities}
            options={options}
            perms={perms}
            defaultFacilityId={modal.facilityId}
            onDone={(r) => {
              close()
              if (r.ok && r.id) router.push(`/portal/roofs/${r.id}/`)
            }}
            onCancel={close}
          />
        )}
      </Modal>
    </div>
  )
}

function OwnerGroup({
  name,
  facilities,
  roofsByFacility,
  today,
  perms,
  delay,
  onEdit,
  onAddRoof,
}: {
  name: string
  facilities: FacilityItem[]
  roofsByFacility: Map<string, RoofItem[]>
  today: string
  perms: RoofPerms
  delay: number
  onEdit: (f: FacilityItem) => void
  onAddRoof: (facilityId: string) => void
}) {
  const roofs = facilities.flatMap((f) => roofsByFacility.get(f.id) ?? [])
  const area = roofs.reduce((s, r) => s + (r.area_sqft ?? 0), 0)
  const head = 'whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em]'
  return (
    <Panel delay={delay} className="overflow-hidden !p-0">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[var(--p-line,rgba(255,255,255,0.08))] px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span aria-hidden="true" className="h-5 w-1 shrink-0 rounded-full bg-[var(--p-primary,#6DC015)] shadow-[0_0_10px_var(--p-primary,#6DC015)]" />
          <h2 className="truncate text-base font-bold text-[var(--p-ink,#fff)] md:text-lg">{name}</h2>
        </div>
        <span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
          {[
            `${facilities.length} building${facilities.length === 1 ? '' : 's'}`,
            `${roofs.length} roof${roofs.length === 1 ? '' : 's'}`,
            area ? sqftLabel(area) : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </span>
      </div>
      <div className={twMerge('hidden border-b border-[var(--p-line,rgba(255,255,255,0.06))] px-5 py-2.5 text-[var(--p-muted,#9DA3AB)]', COLS)}>
        <span className={head} title="The ring is the average condition score of the building’s roofs.">
          Building
        </span>
        <span className={head}>Roofs</span>
        <span className={head}>Area</span>
        <span className={head}>Open problems</span>
        <span className={head}>Next inspection</span>
        <span className={twMerge(head, 'text-right')}>Roofs on site</span>
      </div>
      <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
        {facilities.map((f, i) => (
          <FacilityRow key={f.id} facility={f} roofs={roofsByFacility.get(f.id) ?? []} today={today} perms={perms} index={i} onEdit={onEdit} onAddRoof={onAddRoof} />
        ))}
      </ul>
    </Panel>
  )
}

function FacilityRow({
  facility,
  roofs,
  today,
  perms,
  index,
  onEdit,
  onAddRoof,
}: {
  facility: FacilityItem
  roofs: RoofItem[]
  today: string
  perms: RoofPerms
  index: number
  onEdit: (f: FacilityItem) => void
  onAddRoof: (facilityId: string) => void
}) {
  const avg = averageScore(roofs)
  const open = roofs.reduce((s, r) => s + r.open_deficiencies, 0)
  const next = nextInspection(roofs)
  const late = next ? (daysFrom(today, next) ?? 0) < 0 : false
  const area = roofs.reduce((s, r) => s + (r.area_sqft ?? 0), 0)
  const canEdit = perms.edit && facility.editable
  const cell = (label: string, value: React.ReactNode, className?: string) => (
    <div className="flex items-baseline justify-between gap-2 lg:block">
      <span className="text-[12px] text-[var(--p-muted,#9DA3AB)] lg:hidden">{label}</span>
      <span className={twMerge('text-[15px] font-semibold tabular-nums text-[var(--p-ink,#fff)]', className)}>{value}</span>
    </div>
  )
  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.03, 0.4) }}
      className={twMerge('group space-y-3 px-5 py-4 transition-colors hover:bg-white/[0.025] lg:space-y-0', COLS)}
    >
      <div className="flex min-w-0 items-center gap-3">
        <ScoreRing score={avg} size={44} tip={roofs.length ? `Average of ${roofs.length} roof${roofs.length === 1 ? '' : 's'}.` : 'No roofs at this building yet.'} />
        <div className="min-w-0">
          <p className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-[var(--p-ink,#fff)]">{facility.name}</span>
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(facility)}
                aria-label={`Edit ${facility.name}`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[var(--p-muted,#9DA3AB)] opacity-70 transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)] group-hover:opacity-100"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </p>
          <p className="flex items-center gap-1 truncate text-[12.5px] text-[var(--p-muted,#9DA3AB)]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{addressLine(facility) || 'No address yet'}</span>
          </p>
          {facility.owner_name && <OwnerPill name={facility.owner_name} className="mt-1.5" />}
        </div>
      </div>
      {cell('Roofs', roofs.length)}
      {cell('Area', area ? sqftLabel(area) : '—')}
      {cell('Open problems', open, open ? 'text-[#FFB877]' : undefined)}
      {cell('Next inspection', next ? `${dayLong(next)}${late ? ' · overdue' : ''}` : '—', late ? 'text-[#FFB877]' : 'text-[14px]')}
      <div className="flex flex-wrap gap-1.5 lg:justify-end">
        {roofs.length === 0 && <span className="text-xs text-[var(--p-muted,#9DA3AB)]">No roofs yet.</span>}
        {roofs.map((r) => (
          <Link
            key={r.id}
            href={`/portal/roofs/${r.id}/`}
            title={`${r.name} · ${r.tag}${r.area_sqft ? ` · ${r.area_sqft.toLocaleString('en-US')} sq ft` : ''}${r.condition_score !== null ? ` · condition ${r.condition_score}/100` : ' · not inspected yet'}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.04] px-2.5 py-1 text-[12px] font-semibold text-[var(--p-ink,#fff)] transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] hover:bg-white/[0.08]"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: r.condition_score === null ? NO_SCORE_COLOR : CONDITION_COLOR[conditionOf(r.condition_score)] }}
            />
            {r.name}
          </Link>
        ))}
        {canEdit && (
          <button
            type="button"
            onClick={() => onAddRoof(facility.id)}
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-[var(--p-line,rgba(255,255,255,0.16))] px-2.5 py-1 text-[12px] font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:border-[var(--p-primary,#6DC015)] hover:text-[var(--p-ink,#fff)]"
          >
            <Plus className="h-3 w-3" /> Roof
          </button>
        )}
      </div>
    </motion.li>
  )
}
