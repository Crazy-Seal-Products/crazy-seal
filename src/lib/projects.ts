import { createAdminClient } from '@/lib/supabase/admin'

export interface ProjectStorySection {
  heading: string
  body: string
}

export interface Project {
  id: string
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
  created_at: string
}

export const PROJECT_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'rv', label: 'RV' },
  { slug: 'commercial', label: 'Commercial' },
  { slug: 'residential', label: 'Residential' },
  { slug: 'transportation', label: 'Transportation' },
  { slug: 'direct-to-deck', label: 'Direct to Deck' },
]

export function categoryLabel(slug: string | null): string {
  return PROJECT_CATEGORIES.find((c) => c.slug === slug)?.label || 'Project'
}

export async function getPublishedProjects(category?: string): Promise<Project[]> {
  try {
    const supabase = createAdminClient()
    let query = supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('project_number', { ascending: false })
    if (category) query = query.eq('category', category)
    const { data, error } = await query
    if (error) throw error
    return (data as Project[]) || []
  } catch (e) {
    console.error('getPublishedProjects failed:', e)
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    if (error) return null
    return data as Project
  } catch (e) {
    console.error('getProjectBySlug failed:', e)
    return null
  }
}
