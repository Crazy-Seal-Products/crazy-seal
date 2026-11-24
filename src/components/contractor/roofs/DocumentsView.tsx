'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileCheck2, FileText, FolderOpen, HardDrive, Upload, Warehouse } from 'lucide-react'
import {
  DOCUMENT_KINDS,
  fileSize,
  roofLabel,
  type DocumentItem,
  type DocumentKind,
  type RoofPerms,
  type RoofProjectOption,
  type RoofWorkspace,
} from '@/lib/contractor/roof-shared'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader, portalButton } from '@/components/portal/ui'
import { ChevronSelect, EmptyNote, Modal, OPTION_STYLE, SearchPill } from '../projects/kit'
import { DocumentEditForm, DocumentUploadForm } from './RoofForms'
import { DocumentTable } from './RoofTables'
import { BigEmpty, ButtonLink, StatCell, StatStrip, Tabs } from './roof-kit'

type ModalState = { kind: 'upload' } | { kind: 'edit'; doc: DocumentItem } | null

/**
 * Documents: every warranty, inspection report, photo set, spec and invoice
 * kept for the contractor's buildings, roofs and projects (Thermo's document
 * repository), filterable by kind, building and roof, each a click from
 * download.
 */
export function DocumentsView({ workspace, projects, perms }: { workspace: RoofWorkspace; projects: RoofProjectOption[]; perms: RoofPerms }) {
  const { documents, facilities, roofs } = workspace
  const [kind, setKind] = useState<'all' | DocumentKind>('all')
  const [facility, setFacility] = useState('all')
  const [roof, setRoof] = useState('all')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const close = () => setModal(null)

  const roofsById = useMemo(() => new Map(roofs.map((r) => [r.id, r])), [roofs])
  const facilitiesById = useMemo(() => new Map(facilities.map((f) => [f.id, f])), [facilities])
  const q = query.trim().toLowerCase()
  const rows = documents.filter((d) => {
    if (kind !== 'all' && d.kind !== kind) return false
    if (facility !== 'all' && d.facility_id !== facility) return false
    if (roof !== 'all' && d.roof_asset_id !== roof) return false
    if (!q) return true
    const r = d.roof_asset_id ? roofsById.get(d.roof_asset_id) : undefined
    const f = d.facility_id ? facilitiesById.get(d.facility_id) : undefined
    const hay = [d.title, d.kind, d.project_name, r ? roofLabel(r) : null, f?.name].filter(Boolean).join(' ').toLowerCase()
    return q.split(/\s+/).every((w) => hay.includes(w))
  })
  const totalBytes = documents.reduce((s, d) => s + (d.bytes ?? 0), 0)
  const count = (k: DocumentKind) => documents.filter((d) => d.kind === k).length
  const roofChoices = roofs.filter((r) => facility === 'all' || r.facility_id === facility).sort((a, b) => roofLabel(a).localeCompare(roofLabel(b)))
  const canUpload = perms.edit

  return (
    <div>
      <ViewHeader
        kicker="Documents"
        title={documents.length ? `${documents.length} document${documents.length === 1 ? '' : 's'} · ${fileSize(totalBytes)}` : 'Documents'}
        description="Warranties, inspection reports, photos, specs and invoices, filed under the building, roof or project they belong to."
      >
        {canUpload && (
          <button type="button" onClick={() => setModal({ kind: 'upload' })} className={portalButton}>
            <Upload className="h-4 w-4" /> Upload document
          </button>
        )}
      </ViewHeader>

      {documents.length === 0 ? (
        <BigEmpty
          icon={FolderOpen}
          title={roofs.length || facilities.length ? 'Upload your first document' : 'Add your first building'}
          action={
            canUpload ? (
              roofs.length || facilities.length ? (
                <button type="button" onClick={() => setModal({ kind: 'upload' })} className={portalButton}>
                  <Upload className="h-4 w-4" /> Upload a document
                </button>
              ) : (
                <ButtonLink href="/portal/roofs/portfolio/">
                  <Warehouse className="h-4 w-4" /> Go to Portfolio
                </ButtonLink>
              )
            ) : null
          }
        >
          {canUpload
            ? 'Keep the warranty, inspection reports, photo sets, specs and invoices with the roof they’re for, so anyone on the team can find them in a click.'
            : 'Documents show up here as your team uploads them.'}
        </BigEmpty>
      ) : (
        <>
          <StatStrip>
            <StatCell label="Documents" value={documents.length} icon={FolderOpen} />
            <StatCell label="Inspection reports" value={count('Inspection report')} icon={FileText} delay={0.04} onClick={() => setKind('Inspection report')} />
            <StatCell label="Warranties" value={count('Warranty')} icon={FileCheck2} tone="good" delay={0.08} onClick={() => setKind('Warranty')} />
            <StatCell label="Stored" display={fileSize(totalBytes)} icon={HardDrive} delay={0.12} />
          </StatStrip>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.08 }} className="mb-4 overflow-x-auto pb-1 [color-scheme:dark] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Tabs
              id="documents"
              value={kind}
              onChange={setKind}
              className="flex-nowrap"
              options={[{ id: 'all' as const, label: 'All', count: documents.length }, ...DOCUMENT_KINDS.filter((k) => count(k) > 0).map((k) => ({ id: k, label: k, count: count(k) }))]}
            />
          </motion.div>

          <Panel delay={0.1}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <SearchPill value={query} onChange={setQuery} label="Search documents" placeholder="Search title, roof, project" className="w-full sm:w-72" />
              <ChevronSelect
                value={facility}
                onChange={(e) => {
                  setFacility(e.target.value)
                  setRoof('all')
                }}
                aria-label="Building"
                wrapperClassName="w-full sm:w-56"
                className="!rounded-full !py-2"
              >
                <option value="all" style={OPTION_STYLE}>
                  All buildings
                </option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id} style={OPTION_STYLE}>
                    {f.name}
                  </option>
                ))}
              </ChevronSelect>
              <ChevronSelect value={roof} onChange={(e) => setRoof(e.target.value)} aria-label="Roof" wrapperClassName="w-full sm:w-56" className="!rounded-full !py-2">
                <option value="all" style={OPTION_STYLE}>
                  All roofs
                </option>
                {roofChoices.map((r) => (
                  <option key={r.id} value={r.id} style={OPTION_STYLE}>
                    {facility === 'all' ? roofLabel(r) : r.name}
                  </option>
                ))}
              </ChevronSelect>
              <span className="ml-auto text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
                {rows.length === documents.length ? documents.length : `${rows.length} of ${documents.length}`}
              </span>
            </div>
            {rows.length === 0 ? (
              <EmptyNote>No documents match.</EmptyNote>
            ) : (
              <DocumentTable rows={rows} facilitiesById={facilitiesById} roofsById={roofsById} perms={perms} onEdit={(doc) => setModal({ kind: 'edit', doc })} />
            )}
          </Panel>
        </>
      )}

      <Modal title="Upload a document" open={modal?.kind === 'upload'} onClose={close} wide>
        {modal?.kind === 'upload' && (
          <DocumentUploadForm
            facilities={facilities}
            roofs={roofs}
            projects={projects}
            initial={{ facilityId: facility !== 'all' ? facility : null, roofId: roof !== 'all' ? roof : null }}
            onDone={close}
            onCancel={close}
          />
        )}
      </Modal>
      <Modal title="Document" open={modal?.kind === 'edit'} onClose={close} wide>
        {modal?.kind === 'edit' && <DocumentEditForm doc={modal.doc} facilities={facilities} roofs={roofs} projects={projects} onDone={close} onCancel={close} />}
      </Modal>
    </div>
  )
}
