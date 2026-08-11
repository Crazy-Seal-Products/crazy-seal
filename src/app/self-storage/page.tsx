import type { Metadata } from 'next'
import { ApplicationPage } from '@/components/applications/ApplicationPage'
import { getApplication } from '@/lib/applications/config'

const config = getApplication('self-storage')!

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
}

export default function SelfStoragePage() {
  return <ApplicationPage config={config} />
}
