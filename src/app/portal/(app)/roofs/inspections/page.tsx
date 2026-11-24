import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { loadRoofWorkspace, roofFormOptions, roofPerms } from '@/lib/contractor/roofs'
import { InspectionsView } from '@/components/contractor/roofs/InspectionsView'
import { RoofsSetup } from '@/components/contractor/roofs/roof-kit'

export const metadata: Metadata = { title: 'Roof inspections' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Inspections: the log of inspections on the viewer's roofs, the roofs due or
 * overdue (?tab=due), and the problems found on them (?tab=problems).
 * Recording an inspection updates the roof's condition and dates.
 */
export default async function RoofInspectionsPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('roofs.view')
  const sp = await searchParams
  const tab = sp.tab === 'due' || sp.tab === 'problems' ? sp.tab : 'log'
  const perms = roofPerms(viewer)
  const loaded = await loadRoofWorkspace(viewer, { inspections: true, deficiencies: true })
  if (!loaded.ready) return <RoofsSetup kicker="Inspections" title="Roof inspections" />
  const options = await roofFormOptions(viewer, perms, { keep: loaded.data.inspections.map((i) => i.inspector_id) })
  return <InspectionsView workspace={loaded.data} options={options} perms={perms} initialTab={tab} />
}
