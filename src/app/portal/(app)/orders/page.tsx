import type { Metadata } from 'next'
import { requireAccount } from '@/lib/contractor/guard'
import { listCheckoutQuotes, loadPortalOrders, projectOptions } from '@/lib/contractor/orders'
import { can } from '@/lib/contractor/roles'
import { loadPortalWarranties, registrationForOrder } from '@/lib/contractor/warranties'
import { OrdersView } from '@/components/contractor/orders/OrdersView'

export const metadata: Metadata = { title: 'Orders' }

/**
 * Orders: the contractor's Shopify orders and the signed-in account's own (as
 * the Pro Hub showed them, with Reorder), each with its warranty, plus quotes
 * waiting at checkout.
 */
export default async function OrdersPage() {
  // viewer is null for an account on no contractor's team: just their own orders, as Pro Hub had.
  const { account, viewer } = await requireAccount('orders.view')
  const user = account.user
  const contractor = viewer?.contractor ?? null
  const canLink = Boolean(viewer && !viewer.readOnly && (can(viewer.role, 'orders.create') || can(viewer.role, 'projects.edit')))
  const [{ orders, shopifyError }, quotes, projects] = await Promise.all([
    loadPortalOrders(user, contractor),
    contractor ? listCheckoutQuotes(contractor.id) : Promise.resolve([]),
    canLink && contractor ? projectOptions(contractor.id) : Promise.resolve([]),
  ])
  const { registrations } = await loadPortalWarranties(user, contractor, { orders })

  return (
    <OrdersView
      orders={orders.map((o) => {
        const reg = registrationForOrder(o.name, registrations)
        return { ...o, certificateUrl: reg?.certificateUrl ?? null }
      })}
      quotes={quotes}
      projects={projects}
      canLink={canLink}
      canRegister={!account.readOnly && (!viewer || can(viewer.role, 'warranties.edit'))}
      canReorder={!account.readOnly}
      shopifyError={shopifyError}
    />
  )
}
