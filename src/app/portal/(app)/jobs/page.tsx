import type { Metadata } from 'next'
import { requirePortal } from '@/lib/contractor/guard'
import { jobSummary, listJobs, RECENT_COMPLETE_DAYS } from '@/lib/contractor/jobs'
import { can } from '@/lib/contractor/roles'
import { JobsView, type JobStageFilter } from '@/components/contractor/jobs/JobsView'

export const metadata: Metadata = { title: 'Jobs' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const STAGE_FILTERS: readonly JobStageFilter[] = ['all', 'won', 'ordered', 'in_progress', 'complete']

/**
 * Jobs: every roof past the sale (won, materials ordered, installing, and
 * complete in the last 60 days) with its install steps and the button that
 * moves it on. Filters (?who=mine, ?crew=, ?stage=) start the page where it
 * was left. Sales reps only see their own jobs; View as hides the buttons.
 */
export default async function JobsPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('projects.view')
  const sp = await searchParams
  const viewAll = can(viewer.role, 'sales.view_all')
  const jobs = await listJobs(viewer)
  const stage = typeof sp.stage === 'string' && (STAGE_FILTERS as readonly string[]).includes(sp.stage) ? (sp.stage as JobStageFilter) : 'all'

  return (
    <JobsView
      jobs={jobs.map((j) => jobSummary(j, viewer))}
      canViewAll={viewAll}
      canEdit={!viewer.readOnly && can(viewer.role, 'projects.edit')}
      canWarranty={!viewer.readOnly && can(viewer.role, 'warranties.edit')}
      recentDays={RECENT_COMPLETE_DAYS}
      initial={{
        who: viewAll && sp.who === 'mine' ? 'mine' : 'all',
        crew: typeof sp.crew === 'string' ? sp.crew.slice(0, 120) : '',
        stage,
      }}
    />
  )
}
