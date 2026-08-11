import type { Metadata } from 'next'
import { ApplicationPage } from '@/components/applications/ApplicationPage'
import { getApplication } from '@/lib/applications/config'

const config = getApplication('tiny-homes')!

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
}

export default function TinyHomesPage() {
  return <ApplicationPage config={config} />
}
