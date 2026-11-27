import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, roofPerms } from '@/lib/contractor/roofs'
import { PlanningView } from '@/components/contractor/roofs/PlanningView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Budget & planning' }

/** Budget & planning: each roof's plan by year, the yearly totals, and every item's status. */
export default async function RoofPlanningPage() {
  const viewer = await requirePortal('roofs.view')
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer, { plans: true })
  if (!loaded.ready) return <RoofsSetup kicker="Budget & planning" title="Budget & planning" />
  return <PlanningView workspace={loaded.data} perms={perms} />
}
