import type { Metadata } from 'next'
import { OrdersView } from '@/components/portal/views/OrdersView'

export const metadata: Metadata = { title: 'Orders & Rewards' }

export default function PortalOrdersViewPage() {
  return <OrdersView />
}
