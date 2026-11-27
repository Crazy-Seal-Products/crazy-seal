import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { listProjects } from '@/lib/contractor/projects'
import { can } from '@/lib/contractor/roles'
import { ProjectsView } from '@/components/contractor/projects/ProjectsView'

export const metadata: Metadata = { title: 'Projects' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Projects: every roof the contractor is working, as a board by stage or a
 * list (?view=list). People who see the whole company can narrow to their own
 * (?who=mine); sales reps only ever get their own. Lost projects show with
 * ?lost=1.
 */
export default async function ProjectsPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('projects.view')
  const sp = await searchParams
  const viewAll = can(viewer.role, 'sales.view_all')
  const view = sp.view === 'list' ? 'list' : 'board'
  const who = viewAll && sp.who !== 'mine' ? 'all' : 'mine'
  const showLost = sp.lost === '1'
  const q = typeof sp.q === 'string' ? sp.q.slice(0, 100) : ''

  const projects = await listProjects(viewer, { mine: who === 'mine', includeLost: showLost })

  return (
    <ProjectsView
      projects={projects}
      view={view}
      who={who}
      showLost={showLost}
      canEdit={!viewer.readOnly && can(viewer.role, 'projects.edit')}
      canViewAll={viewAll}
      initialQuery={q}
    />
  )
}
