import type { Metadata } from 'next'
import { WhiteLabelStudio } from '@/components/portal/views/WhiteLabelStudio'

export const metadata: Metadata = { title: 'White Label Studio' }

export default function PortalWhiteLabelStudioPage() {
  return <WhiteLabelStudio />
}
