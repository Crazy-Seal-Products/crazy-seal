import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, roofFormOptions, roofPerms } from '@/lib/contractor/roofs'
import { PortfolioView } from '@/components/contractor/roofs/PortfolioView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Roof portfolio' }

/**
 * Portfolio: the contractor's buildings grouped by the customer who owns
 * them, with each building's roofs, area, average condition, open problems
 * and next inspection. Add or edit a building here.
 */
export default async function RoofPortfolioPage() {
  const viewer = await requirePortal('roofs.view')
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer)
  if (!loaded.ready) return <RoofsSetup kicker="Portfolio" title="Roof portfolio" />
  const { facilities, roofs } = loaded.data
  const options = await roofFormOptions(viewer, perms, {
    customers: true,
    projects: true,
    warranties: true,
    keep: [...facilities.map((f) => f.assigned_to), ...roofs.map((r) => r.assigned_to)],
  })
  return <PortfolioView workspace={loaded.data} options={options} perms={perms} />
}
