import type { Metadata } from 'next'
import { WarrantyView } from '@/components/portal/views/WarrantyView'

export const metadata: Metadata = { title: 'Warranties' }

export default function PortalWarrantyViewPage() {
  return <WarrantyView />
}
