import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { customerOptions } from '@/lib/contractor/customers'
import { requirePortal } from '@/lib/contractor/guard'
import { teamOptions } from '@/lib/contractor/projects'
import { can } from '@/lib/contractor/roles'
import { listTeam } from '@/lib/contractor/team-data'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { ProjectForm } from '@/components/contractor/projects/ProjectForm'

export const metadata: Metadata = { title: 'New project' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** New project: the customer, the roof, the sale and the site. ?customer=<id> picks the customer. */
export default async function NewProjectPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('projects.edit')
  const sp = await searchParams
  const [customers, team] = await Promise.all([customerOptions(viewer), listTeam(viewer.contractor.id)])

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/projects/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-100/60 transition hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>
      <ViewHeader kicker="Projects" title="New project" description="One project per roof. It starts as a lead; move it along as you quote, win, order and install." />
      <Panel>
        {viewer.readOnly ? (
          <p className="text-sm text-blue-100/70">You’re looking at this portal with View as, so nothing can be added.</p>
        ) : (
          <ProjectForm
            mode="create"
            customers={customers}
            team={teamOptions(team)}
            canAddCustomer={can(viewer.role, 'customers.edit')}
            canAssign={can(viewer.role, 'sales.view_all')}
            me={viewer.hasAccount ? viewer.proUserId : null}
            defaultCustomerId={typeof sp.customer === 'string' ? sp.customer : undefined}
          />
        )}
      </Panel>
    </div>
  )
}
