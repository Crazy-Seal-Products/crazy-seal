'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Download,
  ExternalLink,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Link2,
  Pencil,
  RotateCcw,
  Send,
  Trash2,
  Unlink,
  XCircle,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { deleteEstimate, linkEstimateQuote, setDeficiencyStatus, setEstimateStatus } from '@/lib/contractor/roof-actions'
import {
  DEFICIENCY_STATUS_LABEL,
  DEFICIENCY_STATUSES,
  ESTIMATE_STATUS_LABEL,
  SCENARIO_LABEL,
  dayLong,
  fileSize,
  roofLabel,
  type DeficiencyItem,
  type DocumentItem,
  type EstimateItem,
  type FacilityItem,
  type InspectionItem,
  type LinkedQuote,
  type RoofItem,
  type RoofPerms,
} from '@/lib/contractor/roof-shared'
import { dateShort, humanize, money0 } from '@/lib/portal/admin/format'
import { EASE_OUT_EXPO } from '@/components/motion'
import { portalButton, portalGhostButton, portalInput } from '@/components/portal/ui'
import { DataTable, EmptyNote, MiniLabel, OPTION_STYLE, OwnerPill, cellCls, rowCls, rowMotion } from '../projects/kit'
import { Pill, RunButton, ScoreRing, SeverityBadge, StatusSelect, deficiencyTone, estimateTone } from './roof-kit'

/**
 * Lists the Roofs pages share between the roof record and the Inspections,
 * Estimates and Documents pages: the inspection log, the problems table, the
 * estimates table with an estimate's detail and status flow, and the
 * documents table.
 */

/** The quote builder for a roof: on its project when it has one (roof and site filled in), else blank. */
export function priceMaterialsHref(roof: Pick<RoofItem, 'project_id' | 'area_sqft'>): string {
  if (roof.project_id) return `/portal/quotes/new/?project=${roof.project_id}`
  return roof.area_sqft ? `/portal/quotes/new/?sqft=${roof.area_sqft}` : '/portal/quotes/new/'
}

function RoofLink({ roof }: { roof: RoofItem | undefined }) {
  if (!roof) return <span className="text-[var(--p-muted,#9DA3AB)]">—</span>
  return (
    <Link href={`/portal/roofs/${roof.id}/`} className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
      {roofLabel(roof)}
    </Link>
  )
}

/* ------------------------------------------------------------ inspections */

export function InspectionLog({
  inspections,
  roofsById,
  deficiencies,
  showRoof = true,
  empty,
}: {
  inspections: InspectionItem[]
  roofsById: Map<string, RoofItem>
  deficiencies: DeficiencyItem[]
  showRoof?: boolean
  empty: React.ReactNode
}) {
  if (!inspections.length) return <EmptyNote>{empty}</EmptyNote>
  return (
    <ul className="space-y-3">
      {inspections.map((i, k) => {
        const found = deficiencies.filter((d) => d.inspection_id === i.id)
        return (
          <motion.li
            key={i.id}
            {...rowMotion(k)}
            className="flex flex-col gap-4 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.04] sm:flex-row sm:items-start"
          >
            <ScoreRing score={i.condition_score} size={52} tip="The score recorded at this inspection." />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {showRoof ? <RoofLink roof={roofsById.get(i.roof_asset_id)} /> : <span className="font-semibold text-[var(--p-ink,#fff)]">{i.kind} inspection</span>}
                {showRoof && <Pill tone="info">{i.kind}</Pill>}
              </div>
              <p className="mt-1 text-xs text-[var(--p-muted,#9DA3AB)]">
                {dayLong(i.inspected_on)}
                {i.inspector_name ? ` · ${i.inspector_name}` : ''}
              </p>
              {i.summary && <p className="mt-2 whitespace-pre-line text-sm text-[var(--p-ink,#F5F1EC)]">{i.summary}</p>}
              {found.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {found.slice(0, 6).map((d) => (
                    <span key={d.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-[11px] text-[var(--p-muted,#9DA3AB)] ring-1 ring-white/[0.06]">
                      <SeverityBadge severity={d.severity} className="!px-1.5 !py-0 !ring-0" />
                      {d.title}
                    </span>
                  ))}
                  {found.length > 6 && <span className="text-[11px] text-[var(--p-muted,#9DA3AB)]">+{found.length - 6} more</span>}
                </div>
              )}
            </div>
            <span className="shrink-0 self-start text-[11px] tabular-nums text-[var(--p-muted,#9DA3AB)]">
              {found.length} problem{found.length === 1 ? '' : 's'} found
            </span>
          </motion.li>
        )
      })}
    </ul>
  )
}

/* -------------------------------------------------------------- problems */

export function DeficiencyTable({
  rows,
  roofsById,
  showRoof = true,
  perms,
  onEdit,
  selected,
  onToggle,
}: {
  rows: DeficiencyItem[]
  roofsById: Map<string, RoofItem>
  showRoof?: boolean
  perms: RoofPerms
  onEdit?: (d: DeficiencyItem) => void
  /** Checkboxes for "Estimate the selected". */
  selected?: string[]
  onToggle?: (d: DeficiencyItem) => void
}) {
  const selectable = Boolean(selected && onToggle && perms.edit)
  return (
    <DataTable
      minWidth={showRoof ? 980 : 820}
      head={[
        ...(selectable ? [{ label: 'Select', srOnly: true, className: 'w-8' }] : []),
        { label: 'Severity' },
        { label: 'Problem' },
        ...(showRoof ? [{ label: 'Roof' }] : []),
        { label: 'Est. cost', align: 'right' as const },
        { label: 'Status' },
        { label: 'Logged' },
        ...(perms.edit ? [{ label: 'Change', className: 'w-44' }] : []),
      ]}
    >
      {rows.map((d, i) => (
        <motion.tr key={d.id} {...rowMotion(i)} className={rowCls}>
          {selectable && (
            <td className={cellCls}>
              {d.status === 'open' || d.status === 'scoped' ? (
                <input
                  type="checkbox"
                  aria-label={`Select ${d.title}`}
                  checked={selected!.includes(d.id)}
                  onChange={() => onToggle!(d)}
                  className="mt-1 h-4 w-4 accent-[var(--p-primary,#6DC015)]"
                />
              ) : null}
            </td>
          )}
          <td className={cellCls}>
            <SeverityBadge severity={d.severity} />
          </td>
          <td className={twMerge(cellCls, 'min-w-[14rem]')}>
            <span className="block font-semibold">{d.title}</span>
            {(d.location || d.notes) && <span className="mt-0.5 block max-w-[22rem] text-xs text-[var(--p-muted,#9DA3AB)]">{[d.location, d.notes].filter(Boolean).join(' · ')}</span>}
          </td>
          {showRoof && (
            <td className={cellCls}>
              <RoofLink roof={roofsById.get(d.roof_asset_id)} />
            </td>
          )}
          <td className={twMerge(cellCls, 'text-right tabular-nums')}>{d.est_cost ? money0(d.est_cost) : '—'}</td>
          <td className={cellCls}>
            <Pill tone={deficiencyTone(d.status)}>{DEFICIENCY_STATUS_LABEL[d.status]}</Pill>
          </td>
          <td className={twMerge(cellCls, 'whitespace-nowrap text-[var(--p-muted,#9DA3AB)]')}>{dateShort(d.created_at)}</td>
          {perms.edit && (
            <td className={cellCls}>
              <div className="flex items-center gap-2">
                <StatusSelect
                  action={setDeficiencyStatus}
                  id={d.id}
                  value={d.status}
                  label={`Change the status of ${d.title}`}
                  options={DEFICIENCY_STATUSES.map((s) => ({ value: s, label: s === 'resolved' ? 'Mark resolved' : s === 'monitor' ? 'Just monitor it' : `Mark ${DEFICIENCY_STATUS_LABEL[s].toLowerCase()}` }))}
                  className="w-40"
                />
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(d)}
                    aria-label={`Edit ${d.title}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </td>
          )}
        </motion.tr>
      ))}
    </DataTable>
  )
}

/* ------------------------------------------------------------- estimates */

export function EstimateTable({
  rows,
  roofsById,
  showRoof = true,
  onOpen,
}: {
  rows: EstimateItem[]
  roofsById: Map<string, RoofItem>
  showRoof?: boolean
  onOpen: (e: EstimateItem) => void
}) {
  return (
    <DataTable
      minWidth={showRoof ? 960 : 760}
      head={[
        { label: 'Estimate' },
        ...(showRoof ? [{ label: 'Roof' }] : []),
        { label: 'Scenario' },
        { label: 'Amount', align: 'right' as const },
        { label: 'Budget year' },
        { label: 'Status' },
        { label: 'Materials quote' },
        { label: 'Created' },
      ]}
    >
      {rows.map((e, i) => (
        <motion.tr
          key={e.id}
          {...rowMotion(i)}
          tabIndex={0}
          onClick={() => onOpen(e)}
          onKeyDown={(ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault()
              onOpen(e)
            }
          }}
          className={twMerge(rowCls, 'cursor-pointer focus:bg-white/[0.04] focus:outline-none')}
        >
          <td className={twMerge(cellCls, 'whitespace-nowrap font-mono text-xs text-[var(--p-muted,#9DA3AB)]')}>{e.number}</td>
          {showRoof && (
            <td className={cellCls} onClick={(ev) => ev.stopPropagation()}>
              <RoofLink roof={roofsById.get(e.roof_asset_id)} />
            </td>
          )}
          <td className={cellCls}>{SCENARIO_LABEL[e.scenario]}</td>
          <td className={twMerge(cellCls, 'text-right font-semibold tabular-nums')}>{money0(e.amount)}</td>
          <td className={twMerge(cellCls, 'tabular-nums')}>{e.budget_year ?? '—'}</td>
          <td className={cellCls}>
            <Pill tone={estimateTone(e.status)}>{ESTIMATE_STATUS_LABEL[e.status]}</Pill>
          </td>
          <td className={twMerge(cellCls, 'text-xs text-[var(--p-muted,#9DA3AB)]')}>{e.quote ? `${e.quote.number} · ${money0(e.quote.total)}` : '—'}</td>
          <td className={twMerge(cellCls, 'whitespace-nowrap text-[var(--p-muted,#9DA3AB)]')}>{dateShort(e.created_at)}</td>
        </motion.tr>
      ))}
    </DataTable>
  )
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.02] px-3 py-2.5">
      <p className="text-[11px] text-[var(--p-muted,#9DA3AB)]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[var(--p-ink,#fff)]">{children}</p>
    </div>
  )
}

/**
 * An estimate's detail (in a modal): amount, scope, the problems it covers,
 * the customer's answer, the linked materials quote, and the status flow
 * draft -> sent -> approved / declined.
 */
export function EstimateDetail({
  estimate,
  roof,
  deficiencies,
  quotes,
  perms,
  onEdit,
  onClose,
}: {
  estimate: EstimateItem
  roof: RoofItem | undefined
  deficiencies: DeficiencyItem[]
  /** Quotes on the roof's project the viewer may see. */
  quotes: LinkedQuote[]
  perms: RoofPerms
  onEdit: () => void
  onClose: () => void
}) {
  const [note, setNote] = useState('')
  const [quoteId, setQuoteId] = useState('')
  const covered = deficiencies.filter((d) => estimate.deficiency_ids.includes(d.id))
  const e = estimate
  const fields = (status: string, extra: Record<string, string> = {}) => ({ id: e.id, status, ...extra })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {roof ? (
            <Link href={`/portal/roofs/${roof.id}/`} className="text-lg font-semibold text-[var(--p-ink,#fff)] hover:underline">
              {roofLabel(roof)}
            </Link>
          ) : (
            <p className="text-lg font-semibold">Roof</p>
          )}
          <p className="mt-0.5 text-sm text-[var(--p-muted,#9DA3AB)]">
            {[roof?.customer_name, SCENARIO_LABEL[e.scenario], roof?.area_sqft ? `${roof.area_sqft.toLocaleString('en-US')} sq ft` : null].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold tabular-nums text-[var(--p-ink,#fff)]">{money0(e.amount)}</p>
          <Pill tone={estimateTone(e.status)}>{ESTIMATE_STATUS_LABEL[e.status]}</Pill>
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Info label="Budget year">{e.budget_year ?? '—'}</Info>
        <Info label="Prepared">{dateShort(e.created_at)}</Info>
        <Info label="Owner">{e.owner_name ?? 'Unassigned'}</Info>
      </div>

      {e.assumptions && (
        <div>
          <MiniLabel className="mb-1.5">Scope & assumptions</MiniLabel>
          <p className="whitespace-pre-line text-sm text-[var(--p-ink,#F5F1EC)]">{e.assumptions}</p>
        </div>
      )}

      <div>
        <MiniLabel className="mb-2">Problems covered</MiniLabel>
        {covered.length === 0 ? (
          <p className="text-sm text-[var(--p-muted,#9DA3AB)]">The whole roof.</p>
        ) : (
          <ul className="space-y-1.5">
            {covered.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--p-line,rgba(255,255,255,0.08))] px-3 py-2 text-sm">
                <SeverityBadge severity={d.severity} />
                <span className="font-medium">{d.title}</span>
                {d.location && <span className="text-xs text-[var(--p-muted,#9DA3AB)]">{d.location}</span>}
                <span className="ml-auto text-xs text-[var(--p-muted,#9DA3AB)]">{DEFICIENCY_STATUS_LABEL[d.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {e.approved_at && (
        <div className="rounded-xl border border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.02] p-3 text-sm">
          <p>
            {e.status === 'declined' ? 'Declined' : 'Approved'} on <span className="font-semibold">{dateShort(e.approved_at)}</span>
          </p>
          {e.approval_note && <p className="mt-1 text-[var(--p-muted,#9DA3AB)]">“{e.approval_note}”</p>}
        </div>
      )}

      {/* The Crazy Seal materials quote */}
      <div className="rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/15 p-4">
        <MiniLabel className="mb-2">Materials quote</MiniLabel>
        {e.quote ? (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Calculator className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" />
            <span className="font-semibold">{e.quote.number}</span>
            <span className="tabular-nums text-[var(--p-muted,#9DA3AB)]">{money0(e.quote.total)}</span>
            <Pill tone={e.quote.status === 'ordered' ? 'good' : e.quote.status === 'open' ? 'info' : 'neutral'}>{humanize(e.quote.status)}</Pill>
            {e.quote.visible && (
              <Link href={`/portal/quotes/${e.quote.id}/`} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline">
                Open <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {perms.edit && (
              <RunButton action={linkEstimateQuote} fields={{ id: e.id, quote_id: '' }} className="ml-auto text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]">
                <Unlink className="h-3.5 w-3.5" /> Unlink
              </RunButton>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-[var(--p-muted,#9DA3AB)]">
              {roof?.project_id
                ? 'Price the Crazy Seal materials on the roof’s project, then link the quote here.'
                : 'Price the Crazy Seal materials in the quote builder. Link the roof to a project to attach the quote to this estimate.'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {perms.quotes && roof && (
                <Link href={priceMaterialsHref(roof)} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                  <Calculator className="h-3.5 w-3.5" /> Price materials
                </Link>
              )}
              {perms.edit && roof?.project_id && quotes.length > 0 && (
                <>
                  <select value={quoteId} onChange={(ev) => setQuoteId(ev.target.value)} aria-label="Quote to link" className={twMerge(portalInput, '!w-auto !py-2 text-xs')}>
                    <option value="" style={OPTION_STYLE}>
                      Pick a quote…
                    </option>
                    {quotes.map((q) => (
                      <option key={q.id} value={q.id} style={OPTION_STYLE}>
                        {q.number} · {money0(q.total)} · {humanize(q.status)}
                      </option>
                    ))}
                  </select>
                  {quoteId && (
                    <RunButton action={linkEstimateQuote} fields={{ id: e.id, quote_id: quoteId }} className="text-[var(--p-primary,#6DC015)]">
                      <Link2 className="h-3.5 w-3.5" /> Link quote
                    </RunButton>
                  )}
                </>
              )}
              {perms.edit && roof?.project_id && quotes.length === 0 && <span className="text-xs text-[var(--p-muted,#9DA3AB)]">No quotes on the project yet.</span>}
            </div>
          </div>
        )}
      </div>

      {perms.edit && (
        <div className="space-y-3 border-t border-[var(--p-line,rgba(255,255,255,0.08))] pt-4">
          {e.status === 'sent' && (
            <input value={note} onChange={(ev) => setNote(ev.target.value)} maxLength={2000} placeholder="What the customer said (optional)" className={portalInput} />
          )}
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {e.status === 'draft' && (
              <RunButton action={deleteEstimate} fields={{ id: e.id }} confirm={`Delete draft estimate ${e.number}?`} onDone={onClose} className="mr-auto text-[#FF9C8F] hover:text-[#FFC2B8]">
                <Trash2 className="h-3.5 w-3.5" /> Delete draft
              </RunButton>
            )}
            {(e.status === 'draft' || e.status === 'sent') && (
              <button type="button" onClick={onEdit} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {e.status === 'draft' && (
              <RunButton action={setEstimateStatus} fields={fields('sent')} className={twMerge(portalButton, '!py-2 text-xs')}>
                <Send className="h-3.5 w-3.5" /> Mark sent to customer
              </RunButton>
            )}
            {e.status === 'sent' && (
              <>
                <RunButton action={setEstimateStatus} fields={fields('draft')} className="text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]">
                  <RotateCcw className="h-3.5 w-3.5" /> Back to draft
                </RunButton>
                <RunButton action={setEstimateStatus} fields={fields('declined', { approval_note: note })} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                  <XCircle className="h-3.5 w-3.5" /> Customer declined
                </RunButton>
                <RunButton action={setEstimateStatus} fields={fields('approved', { approval_note: note })} className={twMerge(portalButton, '!py-2 text-xs')}>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Customer approved
                </RunButton>
              </>
            )}
            {e.status === 'approved' && (
              <RunButton action={setEstimateStatus} fields={fields('sent')} className="text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]">
                <RotateCcw className="h-3.5 w-3.5" /> Reopen
              </RunButton>
            )}
            {e.status === 'declined' && (
              <RunButton action={setEstimateStatus} fields={fields('draft')} className={twMerge(portalGhostButton, '!py-2 text-xs')}>
                <RotateCcw className="h-3.5 w-3.5" /> Back to draft
              </RunButton>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- documents */

function DocIcon({ mime }: { mime: string | null }) {
  const m = mime ?? ''
  const Icon = m.startsWith('image/') ? FileImage : m.startsWith('video/') ? FileVideo : /sheet|excel|csv/.test(m) ? FileSpreadsheet : FileText
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[var(--p-accent,#F9EA1C)] ring-1 ring-white/10">
      <Icon className="h-4 w-4" />
    </span>
  )
}

export function DocumentTable({
  rows,
  facilitiesById,
  roofsById,
  perms,
  onEdit,
  showLinks = true,
}: {
  rows: DocumentItem[]
  facilitiesById: Map<string, FacilityItem>
  roofsById: Map<string, RoofItem>
  perms: RoofPerms
  onEdit?: (d: DocumentItem) => void
  showLinks?: boolean
}) {
  return (
    <DataTable
      minWidth={showLinks ? 900 : 700}
      head={[{ label: 'Document' }, { label: 'Kind' }, ...(showLinks ? [{ label: 'Filed under' }] : []), { label: 'Size', align: 'right' as const }, { label: 'Uploaded' }, { label: 'Actions', srOnly: true }]}
    >
      {rows.map((d, i) => {
        const roof = d.roof_asset_id ? roofsById.get(d.roof_asset_id) : undefined
        const facility = d.facility_id ? facilitiesById.get(d.facility_id) : undefined
        return (
          <motion.tr key={d.id} {...rowMotion(i)} className={rowCls}>
            <td className={twMerge(cellCls, 'min-w-[16rem]')}>
              <span className="flex items-center gap-3">
                <DocIcon mime={d.mime} />
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-semibold transition-colors hover:text-[var(--p-accent,#F9EA1C)]">
                  {d.title}
                </a>
              </span>
            </td>
            <td className={cellCls}>
              <Pill tone={d.kind === 'Warranty' ? 'good' : d.kind === 'Inspection report' ? 'info' : d.kind === 'Invoice' ? 'warn' : 'neutral'}>{d.kind}</Pill>
            </td>
            {showLinks && (
              <td className={twMerge(cellCls, 'text-xs')}>
                {roof ? (
                  <Link href={`/portal/roofs/${roof.id}/`} className="font-semibold text-[var(--p-ink,#fff)] hover:text-[var(--p-accent,#F9EA1C)]">
                    {roofLabel(roof)}
                  </Link>
                ) : facility ? (
                  <span className="font-semibold text-[var(--p-ink,#fff)]">{facility.name}</span>
                ) : null}
                {d.project_name && (
                  <span className="block text-[var(--p-muted,#9DA3AB)]">
                    {perms.projects && d.project_id ? (
                      <Link href={`/portal/projects/${d.project_id}/`} className="hover:underline">
                        Project: {d.project_name}
                      </Link>
                    ) : (
                      `Project: ${d.project_name}`
                    )}
                  </span>
                )}
                {!roof && !facility && !d.project_name && <span className="text-[var(--p-muted,#9DA3AB)]">Not filed</span>}
              </td>
            )}
            <td className={twMerge(cellCls, 'whitespace-nowrap text-right tabular-nums text-[var(--p-muted,#9DA3AB)]')}>{fileSize(d.bytes)}</td>
            <td className={twMerge(cellCls, 'whitespace-nowrap text-xs')}>
              <OwnerPill name={d.uploader_name} />
              <span className="mt-1 block text-[var(--p-muted,#9DA3AB)]">{dateShort(d.created_at)}</span>
            </td>
            <td className={twMerge(cellCls, 'whitespace-nowrap text-right')}>
              <span className="inline-flex items-center gap-1">
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  aria-label={`Download ${d.title}`}
                  className="grid h-8 w-8 place-items-center rounded-full text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                {perms.edit && onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(d)}
                    aria-label={`Edit ${d.title}`}
                    className="grid h-8 w-8 place-items-center rounded-full text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </span>
            </td>
          </motion.tr>
        )
      })}
    </DataTable>
  )
}

/* --------------------------------------------------------------- misc */

/** A highlighted strip of roofs past their inspection date. */
export function OverdueStrip({ roofs, today }: { roofs: RoofItem[]; today: string }) {
  const overdue = roofs.filter((r) => r.next_inspection_on && r.next_inspection_on < today)
  if (!overdue.length) return null
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
      className="mb-4 flex items-start gap-2.5 rounded-2xl border border-[#FF9F45]/25 bg-[#FF9F45]/[0.07] p-3 text-xs text-[var(--p-ink,#fff)]"
    >
      <ClipboardCheck className="mt-px h-4 w-4 shrink-0 text-[#FFB877]" />
      <p>
        <span className="font-semibold text-[#FFB877]">
          {overdue.length} roof{overdue.length === 1 ? ' is' : 's are'} past their inspection date:
        </span>{' '}
        {overdue.slice(0, 6).map((r, i) => (
          <span key={r.id}>
            {i > 0 && ', '}
            <Link href={`/portal/roofs/${r.id}/`} className="underline-offset-2 hover:underline">
              {roofLabel(r)}
            </Link>
          </span>
        ))}
        {overdue.length > 6 && ` and ${overdue.length - 6} more`}
      </p>
    </motion.div>
  )
}
