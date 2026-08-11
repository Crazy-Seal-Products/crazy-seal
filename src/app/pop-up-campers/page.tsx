import type { Metadata } from 'next'
import { ApplicationPage } from '@/components/applications/ApplicationPage'
import { getApplication } from '@/lib/applications/config'

const config = getApplication('pop-up-campers')!

export const metadata: Metadata = {
  title: config.metaTitle,
  description: config.metaDescription,
}

export default function PopUpCampersPage() {
  return <ApplicationPage config={config} />
}
