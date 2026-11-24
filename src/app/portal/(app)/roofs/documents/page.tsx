import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, projectOptions, roofPerms } from '@/lib/contractor/roofs'
import { DocumentsView } from '@/components/contractor/roofs/DocumentsView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Roof documents' }

/** Documents: files kept for the viewer's buildings, roofs and projects, with upload, filters and download. */
export default async function RoofDocumentsPage() {
  const viewer = await requirePortal('roofs.view')
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer, { documents: true })
  if (!loaded.ready) return <RoofsSetup kicker="Documents" title="Roof documents" />
  const projects = perms.edit ? await projectOptions(viewer) : []
  return <DocumentsView workspace={loaded.data} projects={projects} perms={perms} />
}
