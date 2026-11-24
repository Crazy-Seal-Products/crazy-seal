import type { Metadata } from 'next'
import { requireAccount } from '@/lib/contractor/guard'
import { getProgramContent } from '@/lib/portal/accelerator'
import { ResourcesView } from '@/components/contractor/resources/ResourcesView'

export const metadata: Metadata = { title: 'Resources' }

/** Every brochure, page, video and guide the training lessons link to, in one library. */
export default async function ResourcesPage() {
  await requireAccount('resources.view')
  const { modules } = await getProgramContent()
  return <ResourcesView modules={modules} />
}
