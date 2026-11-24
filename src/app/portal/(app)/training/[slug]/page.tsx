import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAccount } from '@/lib/contractor/guard'
import { getProgramContent } from '@/lib/portal/accelerator'
import { findModule } from '@/lib/portal/modules'
import { TRAINING_LABEL } from '@/lib/contractor/nav'
import { ModulePlayer } from '@/components/contractor/training/ModulePlayer'

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const mod = findModule((await getProgramContent()).modules, slug)
  return { title: mod ? `Module ${mod.number}: ${mod.title}` : TRAINING_LABEL }
}

/** One training module; `?lesson=<id>` opens that lesson. */
export default async function TrainingModulePage({ params, searchParams }: { params: Params; searchParams: Promise<{ lesson?: string }> }) {
  await requireAccount('training.view')
  const { slug } = await params
  const { lesson } = await searchParams
  const mod = findModule((await getProgramContent()).modules, slug)
  if (!mod) notFound()
  const initialLesson = mod.lessons.some((l) => l.id === lesson) ? lesson : undefined
  return <ModulePlayer slug={slug} initialLesson={initialLesson} />
}
