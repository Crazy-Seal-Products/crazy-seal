import type { Metadata } from 'next'
import { ResourcesView } from '@/components/portal/views/ResourcesView'

export const metadata: Metadata = { title: 'Resource Library' }

export default function PortalResourcesViewPage() {
  return <ResourcesView />
}
