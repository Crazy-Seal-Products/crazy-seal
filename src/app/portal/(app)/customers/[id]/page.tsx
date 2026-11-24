import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { listActivity } from '@/lib/contractor/activity'
import { getCustomer } from '@/lib/contractor/customers'
import { feedItems, peopleNames } from '@/lib/contractor/dashboard'
import { requirePortal } from '@/lib/contractor/guard'
import { listProjects, teamOptions } from '@/lib/contractor/projects'
import { can } from '@/lib/contractor/roles'
import { listTeam, memberName } from '@/lib/contractor/team-data'
import { getContractorViewer } from '@/lib/contractor/viewer'
import { CustomerDetailView } from '@/components/contractor/customers/CustomerDetailView'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const viewer = await getContractorViewer()
  const row = viewer && can(viewer.role, 'customers.view') ? await getCustomer(viewer, (await params).id) : null
  return { title: row?.name ?? 'Customer' }
}

/** One customer with their projects and history. Only the contractor's own (a sales rep's own); anything else is a 404. */
export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePortal('customers.view')
  const { id } = await params
  const customer = await getCustomer(viewer, id)
  if (!customer) notFound()

  const team = await listTeam(viewer.contractor.id)
  const [projects, activity] = await Promise.all([
    can(viewer.role, 'projects.view') ? listProjects(viewer, { customerId: customer.id, includeLost: true, team }) : Promise.resolve([]),
    listActivity(viewer.contractor.id, { entity: 'customers', entityId: customer.id, limit: 50 }),
  ])
  const owner = customer.assigned_to ? team.find((m) => m.pro_user_id === customer.assigned_to) : undefined
  const edit = !viewer.readOnly && can(viewer.role, 'customers.edit')

  return (
    <CustomerDetailView
      customer={{ ...customer, owner_name: owner ? memberName(owner) : null }}
      projects={projects}
      activity={feedItems(activity)}
      people={peopleNames(team)}
      perms={{
        edit,
        newProject: !viewer.readOnly && can(viewer.role, 'projects.edit'),
        canAssign: can(viewer.role, 'sales.view_all'),
      }}
      team={edit ? teamOptions(team, [customer.assigned_to]) : []}
      me={viewer.hasAccount ? viewer.proUserId : null}
    />
  )
}
