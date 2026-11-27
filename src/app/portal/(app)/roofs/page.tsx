import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, roofFormOptions, roofPerms } from '@/lib/contractor/roofs'
import { RoofAssetsView } from '@/components/contractor/roofs/RoofAssetsView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Roof assets' }

/**
 * Roof assets: every roof the viewer can see (a sales rep, the roofs on their
 * buildings and their own roofs), as a sortable, filterable table. Each row
 * opens the roof's record at /portal/roofs/<id>/.
 */
export default async function RoofAssetsPage() {
  const viewer = await requirePortal('roofs.view')
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer)
  if (!loaded.ready) return <RoofsSetup kicker="Roof assets" title="Roof assets" />
  const options = await roofFormOptions(viewer, perms, { projects: true, warranties: true, keep: loaded.data.roofs.map((r) => r.assigned_to) })
  return <RoofAssetsView workspace={loaded.data} options={options} perms={perms} />
}
