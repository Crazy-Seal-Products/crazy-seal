import type { Metadata } from 'next'
import { ModulesView } from '@/components/portal/views/ModulesView'

export const metadata: Metadata = { title: 'Accelerator Program' }

export default function PortalModulesPage() {
  return <ModulesView />
}
