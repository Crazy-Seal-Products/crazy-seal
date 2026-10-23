import type { Metadata } from 'next'
import { LeadsView } from '@/components/portal/views/LeadsView'

export const metadata: Metadata = { title: 'Leads' }

export default function PortalLeadsViewPage() {
  return <LeadsView />
}
