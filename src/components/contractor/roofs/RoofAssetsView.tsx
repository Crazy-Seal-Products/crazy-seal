'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowDownUp, Building2, Download, Plus, Warehouse } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import {
  CONDITION_LABEL,
  CONDITIONS,
  ROOF_SYSTEMS,
  conditionOf,
  dayLong,
  daysFrom,
  sqftLabel,
  toCsv,
  type Condition,
  type RoofFormOptions,
  type RoofItem,
  type RoofPerms,
  type RoofWorkspace,
} from '@/lib/contractor/roof-shared'
import { ROOF_TYPES } from '@/lib/contractor/types'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ChevronSelect, DataTable, EmptyNote, Modal, OPTION_STYLE, SearchPill, cellCls, rowCls, rowMotion } from '../projects/kit'
import { RoofForm } from './RoofForms'
import { BigEmpty, ButtonLink, ConditionMeter, downloadText } from './roof-kit'

type SortKey = 'condition' | 'area' | 'next' | 'tag'

function SortHead({ label, k, sort, onSort }: { label: string; k: SortKey; sort: { key: SortKey; dir: 1 | -1 }; onSort: (k: SortKey) => void }) {
  const on = sort.key === k
  return (
    <button
      type="button"
      onClick={() => onSort(k)}
      aria-label={`Sort by ${label.toLowerCase()}`}
      aria-pressed={on}
      className={twMerge(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 transition-colors',
        on ? 'border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] bg-[color-mix(in_oklab,var(--p-primary)_12%,transparent)] text-[var(--p-ink,#fff)]' : 'border-[var(--p-line,rgba(255,255,255,0.1))] hover:text-[var(--p-ink,#fff)]',
      )}
    >
      {label} <ArrowDownUp className={twMerge('h-3 w-3', on ? 'text-[var(--p-accent,#F9EA1C)]' : 'opacity-60')} />
    </button>
  )
}

/** The values in use, in `order`'s order, then any others. */
function present(order: readonly string[], values: Array<string | null>): string[] {
  const used = new Set(values.filter((v): v is string => Boolean(v)))
  return [...order.filter((v) => used.has(v)), ...[...used].filter((v) => !order.includes(v)).sort()]
}

function matches(r: RoofItem, q: string): boolean {
  if (!q) return true
  const hay = [r.tag, r.name, r.facility_name, r.customer_name, r.roof_type, r.system].filter(Boolean).join(' ').toLowerCase()
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((w) => hay.includes(w))
}

/**
 * Roof assets: every roof the viewer can see, as Thermo's sortable roof
 * table (tag, building, type, system, area, condition, inspections, open
 * problems) with filters and a CSV export. A row opens the roof's record.
 */
export function RoofAssetsView({ workspace, options, perms }: { workspace: RoofWorkspace; options: RoofFormOptions; perms: RoofPerms }) {
  const router = useRouter()
  const { roofs, facilities, today } = workspace
  const [query, setQuery] = useState('')
  const [condition, setCondition] = useState<Condition | 'none' | 'all'>('all')
  const [roofType, setRoofType] = useState('all')
  const [system, setSystem] = useState('all')
  const [facility, setFacility] = useState('all')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'condition', dir: 1 })
  const [adding, setAdding] = useState(false)
  const editableFacilities = facilities.filter((f) => f.editable)

  // The filter offers the types and systems the roofs have, in the forms' order.
  const types = useMemo(() => present(ROOF_TYPES, roofs.map((r) => r.roof_type)), [roofs])
  const systems = useMemo(() => present(ROOF_SYSTEMS, roofs.map((r) => r.system)), [roofs])

  const q = query.trim()
  const rows = useMemo(() => {
    const list = roofs.filter(
      (r) =>
        matches(r, q) &&
        (condition === 'all' || (condition === 'none' ? r.condition_score === null : r.condition_score !== null && conditionOf(r.condition_score) === condition)) &&
        (roofType === 'all' || r.roof_type === roofType) &&
        (system === 'all' || r.system === system) &&
        (facility === 'all' || r.facility_id === facility),
    )
    const val = (r: RoofItem): number | string => {
      if (sort.key === 'condition') return r.condition_score ?? (sort.dir === 1 ? 999 : -1)
      if (sort.key === 'area') return r.area_sqft ?? 0
      if (sort.key === 'next') return r.next_inspection_on ?? (sort.dir === 1 ? '9999' : '0000')
      return r.tag
    }
    return [...list].sort((a, b) => {
      const x = val(a)
      const y = val(b)
      return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true })) * sort.dir
    })
  }, [roofs, q, condition, roofType, system, facility, sort])

  const totalArea = rows.reduce((s, r) => s + (r.area_sqft ?? 0), 0)
  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'area' ? -1 : 1 }))

  function exportCsv() {
    const head = ['tag', 'building', 'roof', 'owner', 'roof_type', 'system', 'area_sqft', 'slope', 'deck', 'year_installed', 'condition_score', 'last_inspected', 'next_inspection', 'open_problems']
    const body = rows.map((r) => [
      r.tag,
      r.facility_name,
      r.name,
      r.customer_name ?? '',
      r.roof_type ?? '',
      r.system ?? '',
      r.area_sqft ?? '',
      r.slope ?? '',
      r.deck ?? '',
      r.year_installed ?? '',
      r.condition_score ?? '',
      r.last_inspected_on ?? '',
      r.next_inspection_on ?? '',
      r.open_deficiencies,
    ])
    downloadText(`roof-assets-${today}.csv`, toCsv(head, body))
  }

  return (
    <div>
      <ViewHeader
        kicker="Roof assets"
        title={roofs.length ? `${rows.length} roof${rows.length === 1 ? '' : 's'} · ${sqftLabel(totalArea)}` : 'Roof assets'}
        description="Every roof you look after, worst condition first. Open one for its inspections, problems, estimates, plan and documents."
      >
        {roofs.length > 0 && (
          <button type="button" onClick={exportCsv} className={portalGhostButton} disabled={!rows.length}>
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
        {perms.edit && facilities.length > 0 && (
          <button type="button" onClick={() => setAdding(true)} className={portalButton} disabled={!editableFacilities.length}>
            <Plus className="h-4 w-4" /> Add roof
          </button>
        )}
      </ViewHeader>

      {roofs.length === 0 ? (
        <BigEmpty
          icon={Warehouse}
          title={facilities.length ? 'Add your first roof' : 'Add your first building'}
          action={
            perms.edit ? (
              facilities.length ? (
                <button type="button" onClick={() => setAdding(true)} className={portalButton} disabled={!editableFacilities.length}>
                  <Plus className="h-4 w-4" /> Add a roof
                </button>
              ) : (
                <ButtonLink href="/portal/roofs/portfolio/">
                  <Building2 className="h-4 w-4" /> Add a building
                </ButtonLink>
              )
            ) : null
          }
        >
          {perms.edit
            ? facilities.length
              ? 'Each roof (or roof section) on a building gets its own record: what’s on it, how it’s holding up, and what it needs.'
              : 'Roofs live on buildings. Add the building in Portfolio first, then its roofs.'
            : 'Roofs show up here as your team adds them.'}
        </BigEmpty>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.08 }}
            className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5"
          >
            <SearchPill value={query} onChange={setQuery} label="Search roofs" placeholder="Search tag, building, owner" />
            <ChevronSelect value={condition} onChange={(e) => setCondition(e.target.value as Condition | 'none' | 'all')} aria-label="Condition" className="!rounded-full !py-2">
              <option value="all" style={OPTION_STYLE}>
                All conditions
              </option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c} style={OPTION_STYLE}>
                  {CONDITION_LABEL[c]}
                </option>
              ))}
              <option value="none" style={OPTION_STYLE}>
                Not inspected
              </option>
            </ChevronSelect>
            <ChevronSelect value={roofType} onChange={(e) => setRoofType(e.target.value)} aria-label="Roof type" className="!rounded-full !py-2">
              <option value="all" style={OPTION_STYLE}>
                All roof types
              </option>
              {types.map((t) => (
                <option key={t} value={t} style={OPTION_STYLE}>
                  {t}
                </option>
              ))}
            </ChevronSelect>
            <ChevronSelect value={system} onChange={(e) => setSystem(e.target.value)} aria-label="System" className="!rounded-full !py-2">
              <option value="all" style={OPTION_STYLE}>
                All systems
              </option>
              {systems.map((s) => (
                <option key={s} value={s} style={OPTION_STYLE}>
                  {s}
                </option>
              ))}
            </ChevronSelect>
            <ChevronSelect value={facility} onChange={(e) => setFacility(e.target.value)} aria-label="Building" className="!rounded-full !py-2">
              <option value="all" style={OPTION_STYLE}>
                All buildings
              </option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id} style={OPTION_STYLE}>
                  {f.name}
                </option>
              ))}
            </ChevronSelect>
          </motion.div>

          <Panel delay={0.1}>
            {rows.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold text-[var(--p-muted,#9DA3AB)]">
                <span className="uppercase tracking-[0.14em] opacity-70">Sort</span>
                <SortHead label="Condition" k="condition" sort={sort} onSort={toggleSort} />
                <SortHead label="Area" k="area" sort={sort} onSort={toggleSort} />
                <SortHead label="Next inspection" k="next" sort={sort} onSort={toggleSort} />
                <SortHead label="Tag" k="tag" sort={sort} onSort={toggleSort} />
                <span className="ml-auto tabular-nums">
                  {rows.length === roofs.length ? roofs.length : `${rows.length} of ${roofs.length}`} roof{roofs.length === 1 ? '' : 's'}
                </span>
              </div>
            )}
            {rows.length === 0 ? (
              <EmptyNote>No roofs match these filters.</EmptyNote>
            ) : (
              <DataTable
                minWidth={1080}
                head={[
                  { label: 'Tag' },
                  { label: 'Roof' },
                  { label: 'Type' },
                  { label: 'System' },
                  { label: 'Area', align: 'right' },
                  { label: 'Condition' },
                  { label: 'Last inspected' },
                  { label: 'Next inspection' },
                  { label: 'Open problems', align: 'right' },
                ]}
              >
                {rows.map((r, i) => {
                  const days = daysFrom(today, r.next_inspection_on)
                  const late = days !== null && days < 0
                  return (
                    <motion.tr
                      key={r.id}
                      {...rowMotion(i)}
                      onClick={() => router.push(`/portal/roofs/${r.id}/`)}
                      className={twMerge(rowCls, 'cursor-pointer')}
                    >
                      <td className={twMerge(cellCls, 'whitespace-nowrap font-mono text-xs text-[var(--p-muted,#9DA3AB)]')}>{r.tag}</td>
                      <td className={twMerge(cellCls, 'min-w-[15rem]')}>
                        <Link href={`/portal/roofs/${r.id}/`} onClick={(e) => e.stopPropagation()} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
                          {r.facility_name}
                        </Link>
                        <span className="block text-xs text-[var(--p-muted,#9DA3AB)]">
                          {r.name}
                          {r.customer_name ? ` · ${r.customer_name}` : ''}
                        </span>
                      </td>
                      <td className={twMerge(cellCls, 'text-[var(--p-muted,#9DA3AB)]')}>{r.roof_type ?? '—'}</td>
                      <td className={twMerge(cellCls, 'max-w-[12rem] text-xs text-[var(--p-muted,#9DA3AB)]')}>{r.system ?? '—'}</td>
                      <td className={twMerge(cellCls, 'whitespace-nowrap text-right tabular-nums')}>{r.area_sqft ? r.area_sqft.toLocaleString('en-US') : '—'}</td>
                      <td className={cellCls}>
                        <ConditionMeter score={r.condition_score} delay={Math.min(0.15 + i * 0.03, 0.6)} />
                      </td>
                      <td className={twMerge(cellCls, 'whitespace-nowrap text-[var(--p-muted,#9DA3AB)]')}>{dayLong(r.last_inspected_on)}</td>
                      <td className={twMerge(cellCls, 'whitespace-nowrap font-medium', late ? 'text-[#FFB877]' : '')}>
                        {r.next_inspection_on ? `${dayLong(r.next_inspection_on)}${late ? ' · overdue' : ''}` : <span className="font-normal text-[var(--p-muted,#9DA3AB)]">Not scheduled</span>}
                      </td>
                      <td className={twMerge(cellCls, 'text-right font-semibold tabular-nums', r.open_deficiencies ? 'text-[#FFB877]' : 'text-[var(--p-muted,#9DA3AB)]')}>{r.open_deficiencies}</td>
                    </motion.tr>
                  )
                })}
              </DataTable>
            )}
          </Panel>
        </>
      )}

      <Modal title="Add a roof" open={adding} onClose={() => setAdding(false)} wide>
        {adding && (
          <RoofForm
            facilities={editableFacilities}
            options={options}
            perms={perms}
            defaultFacilityId={facility !== 'all' ? facility : undefined}
            onDone={(r) => {
              setAdding(false)
              if (r.ok && r.id) router.push(`/portal/roofs/${r.id}/`)
            }}
            onCancel={() => setAdding(false)}
          />
        )}
      </Modal>
    </div>
  )
}
