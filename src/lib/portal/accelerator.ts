import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  DEFAULT_PROGRAM,
  DEFAULT_THUMBNAIL,
  MODULE_ICON_NAMES,
  PORTAL_MODULES,
  type AcceleratorProgram,
  type Lesson,
  type ModuleIcon,
  type PortalModule,
} from './modules'

/**
 * The live Business Accelerator Program, edited from the admin's Dealers →
 * Accelerator Program page and stored in accelerator_program /
 * accelerator_modules (migration 017). Until the admin seeds those tables,
 * or if they can't be read, the portal shows the built-in PORTAL_MODULES.
 */

export interface ModuleRow {
  id: string
  slug: string
  position: number
  eyebrow: string
  title: string
  summary: string
  outcome: string
  thumbnail: string | null
  icon: string
  public_href: string | null
  lessons: Lesson[]
  is_published: boolean
  updated_at: string | null
  updated_by: string | null
}

export const MODULE_COLS =
  'id, slug, position, eyebrow, title, summary, outcome, thumbnail, icon, public_href, lessons, is_published, updated_at, updated_by'

export function moduleIcon(name: string): ModuleIcon {
  return (MODULE_ICON_NAMES as readonly string[]).includes(name) ? (name as ModuleIcon) : 'PlayCircle'
}

export function toPortalModule(row: ModuleRow, number: number): PortalModule {
  const lessons = row.lessons ?? []
  return {
    slug: row.slug,
    number,
    eyebrow: row.eyebrow,
    title: row.title,
    summary: row.summary,
    outcome: row.outcome,
    thumbnail: row.thumbnail || lessons.find((l) => l.poster)?.poster || DEFAULT_THUMBNAIL,
    icon: moduleIcon(row.icon),
    publicHref: row.public_href ?? '',
    lessons,
  }
}

export interface ProgramContent {
  program: AcceleratorProgram
  modules: PortalModule[]
}

/** The published program for the Pro Portal, in order. Cached per request. */
export const getProgramContent = cache(async (): Promise<ProgramContent> => {
  try {
    const supabase = createAdminClient()
    const [modules, program] = await Promise.all([
      supabase.from('accelerator_modules').select(MODULE_COLS).order('position').returns<ModuleRow[]>(),
      supabase.from('accelerator_program').select('name, title, description').maybeSingle<AcceleratorProgram>(),
    ])
    if (modules.error) throw new Error(modules.error.message)
    if (!modules.data.length) return { program: DEFAULT_PROGRAM, modules: PORTAL_MODULES }
    return {
      program: program.data ?? DEFAULT_PROGRAM,
      modules: modules.data.filter((r) => r.is_published).map((r, i) => toPortalModule(r, i + 1)),
    }
  } catch (err) {
    console.error('[accelerator] falling back to the built-in program', err)
    return { program: DEFAULT_PROGRAM, modules: PORTAL_MODULES }
  }
})
