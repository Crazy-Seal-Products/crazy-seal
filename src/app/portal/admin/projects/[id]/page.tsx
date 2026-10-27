import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getProject, nextProjectNumber } from '@/lib/portal/admin/projects'
import { PROJECT_CATEGORIES } from '@/lib/projects'
import { dateLong } from '@/lib/portal/admin/format'
import { BackLink, Badge, PageHeader } from '@/components/portal/admin/ui'
import { ProjectEditor } from '@/components/portal/admin/ProjectEditor'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  if (id === 'new') return { title: 'New project' }
  return { title: (await getProject(id))?.title ?? 'Project' }
}

export default async function AdminProjectPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const { id } = await params
  const isNew = id === 'new'
  const [project, next] = await Promise.all([isNew ? null : getProject(id), nextProjectNumber()])
  if (!isNew && !project) notFound()

  return (
    <>
      <BackLink href="/portal/admin/projects/">Projects</BackLink>
      <PageHeader
        title={
          isNew ? (
            'New project'
          ) : (
            <span className="flex flex-wrap items-center gap-2">
              #{project!.project_number} · {project!.title}
              <Badge tone={project!.published ? 'good' : 'neutral'}>{project!.published ? 'Published' : 'Hidden'}</Badge>
            </span>
          )
        }
        description={isNew ? 'Fill in the details, upload photos, then create.' : `Added ${dateLong(project!.created_at)}`}
      />
      <ProjectEditor key={project?.id ?? 'new'} project={project} nextNumber={next} categories={PROJECT_CATEGORIES} />
    </>
  )
}
