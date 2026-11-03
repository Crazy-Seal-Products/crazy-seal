import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getAcceleratorAdmin, toModuleDraft } from '@/lib/portal/admin/accelerator'
import { BackLink } from '@/components/portal/admin/ui'
import { ModuleEditor } from '@/components/portal/admin/accelerator/ModuleEditor'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const { modules } = await getAcceleratorAdmin().catch(() => ({ modules: [] }))
  return { title: modules.find((m) => m.slug === slug)?.title ?? 'Module' }
}

export default async function AdminAcceleratorModulePage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const { slug } = await params
  const { modules } = await getAcceleratorAdmin()
  const index = modules.findIndex((m) => m.slug === slug)
  if (index < 0) notFound()
  const row = modules[index]
  const number = row.is_published ? modules.slice(0, index + 1).filter((m) => m.is_published).length : null

  return (
    <>
      <BackLink href="/portal/admin/dealers/accelerator/">Accelerator Program</BackLink>
      <ModuleEditor slug={row.slug} number={number} published={row.is_published} initial={toModuleDraft(row)} />
    </>
  )
}
