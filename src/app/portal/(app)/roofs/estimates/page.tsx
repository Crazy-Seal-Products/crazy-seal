import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, quotesForProjects, roofFormOptions, roofPerms } from '@/lib/contractor/roofs'
import { EstimatesView } from '@/components/contractor/roofs/EstimatesView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Roof estimates' }

/**
 * Estimates: repair, restore and replace estimates on the viewer's roofs, from
 * draft to sent to approved or declined, with a scenario comparison and the
 * Crazy Seal materials quote linked to each.
 */
export default async function RoofEstimatesPage() {
  const viewer = await requirePortal('roofs.view')
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer, { estimates: true, deficiencies: true })
  if (!loaded.ready) return <RoofsSetup kicker="Estimates" title="Roof estimates" />
  const { estimates, roofs } = loaded.data
  const [options, quotesByProject] = await Promise.all([
    roofFormOptions(viewer, perms, { keep: estimates.map((e) => e.assigned_to) }),
    perms.edit ? quotesForProjects(viewer, roofs.map((r) => r.project_id)) : Promise.resolve({}),
  ])
  return <EstimatesView workspace={loaded.data} options={options} perms={perms} quotesByProject={quotesByProject} />
}
