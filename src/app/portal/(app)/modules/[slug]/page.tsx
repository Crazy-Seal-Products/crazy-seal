import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProgramContent } from '@/lib/portal/accelerator'
import { findModule } from '@/lib/portal/modules'
import { ModulePlayer } from '@/components/portal/views/ModulePlayer'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const mod = findModule((await getProgramContent()).modules, slug)
  return { title: mod ? `Module ${mod.number}: ${mod.title}` : 'Module' }
}

export default async function PortalModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lesson?: string }>
}) {
  const { slug } = await params
  const { lesson } = await searchParams
  const mod = findModule((await getProgramContent()).modules, slug)
  if (!mod) notFound()
  const initialLesson = mod.lessons.some((l) => l.id === lesson) ? lesson : undefined
  return <ModulePlayer slug={slug} initialLesson={initialLesson} />
}
