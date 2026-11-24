import type { Metadata } from 'next'
import { requireAccount } from '@/lib/contractor/guard'
import { loadPortalOrders, projectOptions } from '@/lib/contractor/orders'
import { listTeam } from '@/lib/contractor/team-data'
import { loadPortalWarranties, registeredProjectIds, registrationForOrder, warrantyPrefill } from '@/lib/contractor/warranties'
import { NewWarrantyView } from '@/components/contractor/warranties/NewWarrantyView'

export const metadata: Metadata = { title: 'Register a warranty' }

/**
 * Register a warranty (or `?type=claim`: file a claim), optionally for one of
 * the contractor's projects (`?project=<id>`), whose customer, roof and order
 * fill the form in, or for an order (`?order=#1234`, from Orders).
 */
export default async function NewWarrantyPage({ searchParams }: { searchParams: Promise<{ project?: string; type?: string; order?: string }> }) {
  // viewer is null for an account on no contractor's team: it files for its own orders, as on Pro Hub.
  const { account, viewer } = await requireAccount('warranties.edit')
  const sp = await searchParams
  const type = sp.type === 'claim' ? 'claim' : 'registration'
  const contractor = viewer?.contractor ?? null

  const user = account.user
  const [projects, { orders }, team, projectPrefill] = await Promise.all([
    contractor ? projectOptions(contractor.id) : Promise.resolve([]),
    loadPortalOrders(user, contractor),
    contractor ? listTeam(contractor.id) : Promise.resolve([]),
    contractor ? warrantyPrefill(contractor.id, sp.project) : Promise.resolve(null),
  ])
  const [registered, warranties] = await Promise.all([
    registeredProjectIds(projects.map((p) => p.id)),
    type === 'registration' ? loadPortalWarranties(user, contractor, { orders, team }) : Promise.resolve(null),
  ])
  const registrations = warranties?.registrations ?? []
  const projectAlreadyRegistered = Boolean(projectPrefill && registered.has(projectPrefill.projectId))
  // From Orders: the order fills in its number.
  const order = !projectPrefill && sp.order ? orders.find((o) => o.name === sp.order) : undefined
  const prefill =
    projectPrefill ??
    (order
      ? { projectId: '', firstName: '', lastName: '', email: '', phone: '', projectType: '' as const, squareFootage: '', orderNumber: order.name }
      : null)

  return (
    <NewWarrantyView
      type={type}
      projectParam={prefill?.projectId || null}
      orderParam={order?.name ?? null}
      projectAlreadyRegistered={type === 'registration' && projectAlreadyRegistered}
      projects={projects
        .filter((p) => p.stage !== 'lost')
        .map((p) => ({ id: p.id, name: p.name, registered: registered.has(p.id) }))}
      orders={orders
        .filter((o) => !o.cancelled)
        .map((o) => ({ name: o.name, hasWarranty: Boolean(registrationForOrder(o.name, registrations)) }))}
      prefill={type === 'registration' && projectAlreadyRegistered ? null : prefill}
      installer={{ name: account.name, phone: contractor?.phone ?? account.user.phone ?? '', email: account.email }}
      readOnly={account.readOnly}
    />
  )
}
