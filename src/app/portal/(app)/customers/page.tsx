import type { Metadata } from 'next'
import { listCustomers } from '@/lib/contractor/customers'
import { requirePortal } from '@/lib/contractor/guard'
import { teamOptions } from '@/lib/contractor/projects'
import { can } from '@/lib/contractor/roles'
import { listTeam } from '@/lib/contractor/team-data'
import { CustomersView } from '@/components/contractor/customers/CustomersView'

export const metadata: Metadata = { title: 'Customers' }

/** Customers: everyone the contractor works for. Sales reps see only their own; operations can look but not edit. */
export default async function CustomersPage() {
  const viewer = await requirePortal('customers.view')
  const canEdit = !viewer.readOnly && can(viewer.role, 'customers.edit')
  const [customers, team] = await Promise.all([listCustomers(viewer), canEdit ? listTeam(viewer.contractor.id) : Promise.resolve([])])

  return (
    <CustomersView
      customers={customers}
      canEdit={canEdit}
      canAssign={can(viewer.role, 'sales.view_all')}
      viewAll={can(viewer.role, 'sales.view_all')}
      team={teamOptions(team, canEdit ? customers.map((c) => c.assigned_to) : [])}
      me={viewer.hasAccount ? viewer.proUserId : null}
    />
  )
}
