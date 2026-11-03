'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { PROJECT_CATEGORIES, type ProjectStorySection } from '@/lib/projects'
import type { ActionResult } from '@/components/portal/admin/controls'
import { requirePortalAdmin } from './auth'

export interface ProjectInput {
  project_number: number | null
  slug: string
  title: string
  category: string | null
  project_type: string | null
  products_used: string | null
  customer_type: string | null
  location: string | null
  spotlight_title: string | null
  story: ProjectStorySection[]
  quote: string | null
  photo_urls: string[]
  cover_photo: string | null
  published: boolean
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function refreshPublic(slug?: string) {
  revalidatePath('/projects')
  if (slug) revalidatePath(`/project/${slug}`)
  revalidatePath('/portal/admin/projects', 'layout')
}

export async function saveProject(id: string | null, input: ProjectInput): Promise<ActionResult & { id?: string }> {
  await requirePortalAdmin()
  const title = input.title?.trim()
  const slug = input.slug?.trim().toLowerCase()
  if (!title) return { ok: false, error: 'Title is required' }
  if (!slug || !SLUG_RE.test(slug)) return { ok: false, error: 'Slug must be lowercase letters, numbers and dashes' }
  if (input.category && !PROJECT_CATEGORIES.some((c) => c.slug === input.category)) return { ok: false, error: 'Unknown category' }
  const photos = (input.photo_urls ?? []).filter((u) => /^https?:\/\//.test(u))
  const text = (v: string | null) => v?.trim() || null
  const payload = {
    project_number: Number.isFinite(input.project_number) ? input.project_number : null,
    slug,
    title,
    category: input.category || null,
    project_type: text(input.project_type),
    products_used: text(input.products_used),
    customer_type: text(input.customer_type),
    location: text(input.location),
    spotlight_title: text(input.spotlight_title),
    story: (input.story ?? []).map((s) => ({ heading: s.heading?.trim() ?? '', body: s.body?.trim() ?? '' })).filter((s) => s.heading || s.body),
    quote: text(input.quote),
    photo_urls: photos,
    cover_photo: input.cover_photo && photos.includes(input.cover_photo) ? input.cover_photo : photos[0] ?? null,
    published: !!input.published,
  }

  const supabase = createAdminClient()
  const { data: clash } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle()
  if (clash && clash.id !== id) return { ok: false, error: 'Another project already uses that slug' }

  const res = id
    ? await supabase.from('projects').update(payload).eq('id', id).select('id').single()
    : await supabase.from('projects').insert(payload).select('id').single()
  if (res.error) return { ok: false, error: 'Could not save the project' }
  refreshPublic(slug)
  return { ok: true, message: 'Saved', id: res.data.id }
}

export async function setProjectPublished(id: string, published: boolean): Promise<ActionResult> {
  await requirePortalAdmin()
  const { data, error } = await createAdminClient().from('projects').update({ published }).eq('id', id).select('slug').single()
  if (error) return { ok: false, error: 'Could not save' }
  refreshPublic(data.slug)
  return { ok: true, message: published ? 'Published' : 'Hidden' }
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requirePortalAdmin()
  const { data, error } = await createAdminClient().from('projects').delete().eq('id', id).select('slug').single()
  if (error) return { ok: false, error: 'Could not delete' }
  refreshPublic(data.slug)
  return { ok: true, message: 'Deleted' }
}
