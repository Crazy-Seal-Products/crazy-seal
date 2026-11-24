import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { customerOptions } from '@/lib/contractor/customers'
import { feedItems, peopleNames } from '@/lib/contractor/dashboard'
import { requirePortal } from '@/lib/contractor/guard'
import { listProjectMedia } from '@/lib/contractor/media'
import { getProjectDetail, getProjectRow, teamOptions } from '@/lib/contractor/projects'
import { can } from '@/lib/contractor/roles'
import { getContractorViewer } from '@/lib/contractor/viewer'
import { ProjectDetailView } from '@/components/contractor/projects/ProjectDetailView'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const viewer = await getContractorViewer()
  const row = viewer && can(viewer.role, 'projects.view') ? await getProjectRow(viewer, (await params).id) : null
  return { title: row?.name ?? 'Project' }
}

/**
 * One project: stage and install step, photos and videos, details, customer,
 * materials quotes, orders, warranty and its activity. Only the contractor's own projects (and
 * for a sales rep, only theirs); anything else is a 404.
 */
export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePortal('projects.view')
  const { id } = await params
  const detail = await getProjectDetail(viewer, id)
  if (!detail) notFound()

  const edit = !viewer.readOnly && can(viewer.role, 'projects.edit')
  const [customers, media] = await Promise.all([edit ? customerOptions(viewer) : Promise.resolve([]), listProjectMedia(viewer.contractor.id, detail.project.id)])
  const c = detail.customer

  return (
    <ProjectDetailView
      project={detail.project}
      customer={c ? { id: c.id, name: c.name, type: c.type, contact_name: c.contact_name, email: c.email, phone: c.phone, city: c.city, state: c.state, zip: c.zip } : null}
      customerVisible={detail.customerVisible}
      quotes={detail.quotes}
      orders={detail.orders}
      warranty={detail.warranty}
      media={media}
      activity={feedItems(detail.activity)}
      people={peopleNames(detail.team)}
      perms={{
        edit,
        quotesCreate: !viewer.readOnly && can(viewer.role, 'quotes.create'),
        warrantiesEdit: !viewer.readOnly && can(viewer.role, 'warranties.edit'),
        canAddCustomer: can(viewer.role, 'customers.edit'),
        canAssign: can(viewer.role, 'sales.view_all'),
      }}
      form={{ customers, team: edit ? teamOptions(detail.team, [detail.project.assigned_to, detail.project.ops_lead_id]) : [], me: viewer.hasAccount ? viewer.proUserId : null }}
    />
  )
}
