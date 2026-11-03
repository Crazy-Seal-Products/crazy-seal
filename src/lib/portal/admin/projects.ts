import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Project } from '@/lib/projects'

/**
 * Project spotlights (the `projects` table) behind crazyseal.com/projects and
 * each /project/<slug> page. Same table the site admin's project editor uses.
 */

export type { Project }

export async function getAllProjects(): Promise<Project[]> {
  const { data, error } = await createAdminClient()
    .from('projects')
    .select('*')
    .order('project_number', { ascending: false, nullsFirst: false })
    .limit(2000)
  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}

export const getProject = cache(async (id: string): Promise<Project | null> => {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await createAdminClient().from('projects').select('*').eq('id', id).maybeSingle<Project>()
  return data ?? null
})

export async function nextProjectNumber(): Promise<number> {
  const { data } = await createAdminClient().from('projects').select('project_number').order('project_number', { ascending: false, nullsFirst: false }).limit(1)
  return ((data?.[0]?.project_number as number | null) ?? 0) + 1
}

export function projectSlug(number: number | null, title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return number ? `project-${number}-${base}` : base
}
