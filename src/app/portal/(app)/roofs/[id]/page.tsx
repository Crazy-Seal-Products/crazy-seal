import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortal } from '@/lib/contractor/guard'
import { can } from '@/lib/contractor/roles'
import { getRoofRecord, roofFormOptions, roofPerms } from '@/lib/contractor/roofs'
import { getContractorViewer, type ContractorViewer } from '@/lib/contractor/viewer'
import { RoofRecordView, type RoofTab } from '@/components/contractor/roofs/RoofRecordView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

type Params = Promise<{ id: string }>
type SearchParams = Promise<Record<string, string | string[] | undefined>>

const TABS: readonly RoofTab[] = ['overview', 'inspections', 'deficiencies', 'estimates', 'plan', 'documents', 'links']

/** One read per request for the metadata and the page. */
const record = cache((viewer: ContractorViewer, id: string) => getRoofRecord(viewer, id))

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const viewer = await getContractorViewer()
  if (!viewer || !can(viewer.role, 'roofs.view')) return { title: 'Roof' }
  const loaded = await record(viewer, (await params).id)
  return { title: loaded.ready && loaded.data ? `${loaded.data.facility.name} · ${loaded.data.roof.name}` : 'Roof' }
}

/**
 * One roof's record: condition, what's on it and what's next, then its
 * inspections, problems, estimates, budget plan, documents, project and
 * warranty (?tab= opens one). Only the contractor's roofs, and for a sales
 * rep only the ones they can see; anything else is a 404.
 */
export default async function RoofRecordPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const viewer = await requirePortal('roofs.view')
  const [{ id }, sp] = await Promise.all([params, searchParams])
  const loaded = await record(viewer, id)
  if (!loaded.ready) return <RoofsSetup kicker="Roof record" title="Roof" />
  const data = loaded.data
  if (!data) notFound()
  const perms = roofPerms(viewer)
  const options = await roofFormOptions(viewer, perms, {
    customers: true,
    projects: true,
    warranties: true,
    keep: [data.roof.assigned_to, data.facility.assigned_to, ...data.workspace.estimates.map((e) => e.assigned_to), ...data.workspace.inspections.map((i) => i.inspector_id)],
  })
  const tab = TABS.find((t) => t === sp.tab) ?? 'overview'
  return <RoofRecordView key={data.roof.id} data={data} options={options} perms={perms} initialTab={tab} />
}
