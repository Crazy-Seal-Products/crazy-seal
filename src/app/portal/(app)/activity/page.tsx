import type { Metadata } from 'next'
import { listActivity } from '@/lib/contractor/activity'
import { feedItems, peopleNames } from '@/lib/contractor/dashboard'
import { requirePortal } from '@/lib/contractor/guard'
import { listTeam } from '@/lib/contractor/team-data'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { ActivityFeed } from '@/components/contractor/ActivityFeed'

export const metadata: Metadata = { title: 'Activity' }

/** What each kind of activity line is filed under (contractor_activity.entity), in the filter's order. */
const ENTITIES: { key: string; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'roofs', label: 'Roofs' },
  { key: 'customers', label: 'Customers' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'orders', label: 'Orders' },
  { key: 'warranties', label: 'Warranties' },
  { key: 'team', label: 'Team' },
  { key: 'brand', label: 'Your page' },
  { key: 'session', label: 'Sign-ins' },
]

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** Activity: everything everyone did in the portal, newest first, filterable by kind (?entity=projects) from the feed's type picker. */
export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('activity.view')
  const sp = await searchParams
  const entity = typeof sp.entity === 'string' && /^[a-z_]{1,40}$/.test(sp.entity) ? sp.entity : ''
  const [rows, team] = await Promise.all([listActivity(viewer.contractor.id, { limit: 500, entity: entity || undefined }), listTeam(viewer.contractor.id)])
  const known = ENTITIES.some((e) => e.key === entity)
  const filters = [{ key: '', label: 'All activity' }, ...ENTITIES, ...(entity && !known ? [{ key: entity, label: entity.replace(/_/g, ' ') }] : [])]

  return (
    <div>
      <ViewHeader
        kicker={entity ? `Activity · ${filters.find((f) => f.key === entity)?.label ?? entity}` : 'Activity'}
        title={`Everything at ${viewer.contractorName}`}
        description="Who did what in your portal: projects, customers, quotes, orders, warranties and your team."
      />
      <Panel>
        <ActivityFeed
          items={feedItems(rows)}
          people={peopleNames(team)}
          searchable
          filter={{ options: filters, active: entity, basePath: '/portal/activity/' }}
          emptyText={entity ? 'Nothing of this kind yet.' : 'No activity yet.'}
        />
      </Panel>
    </div>
  )
}
