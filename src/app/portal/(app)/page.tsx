import type { Metadata } from 'next'
import { DashboardView } from '@/components/portal/views/DashboardView'

export const metadata: Metadata = { title: 'Dashboard' }

export default function PortalDashboardPage() {
  return <DashboardView />
}
