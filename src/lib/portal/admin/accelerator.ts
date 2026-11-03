import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { MODULE_COLS, moduleIcon, type ModuleRow } from '@/lib/portal/accelerator'
import {
  DEFAULT_PROGRAM,
  LESSON_KINDS,
  MODULE_ICON_NAMES,
  PORTAL_MODULES,
  RESOURCE_TYPES,
  type AcceleratorProgram,
  type Lesson,
  type LessonKind,
  type LessonResource,
} from '@/lib/portal/modules'

/**
 * Admin side of the Accelerator Program (Dealers → Accelerator Program):
 * loading, seeding, and turning the editor's form state into stored rows.
 * Writes live in accelerator-actions.ts.
 */

const SEEDED_BY = 'Built-in program'

export interface ProgramRow extends AcceleratorProgram {
  updated_at: string | null
  updated_by: string | null
}

/**
 * Every module (drafts too) and the program details. The first visit copies
 * the built-in program into the tables, so editing starts from what dealers
 * already see.
 */
export const getAcceleratorAdmin = cache(async (): Promise<{ program: ProgramRow; modules: ModuleRow[] }> => {
  const supabase = createAdminClient()
  const readModules = () => supabase.from('accelerator_modules').select(MODULE_COLS).order('position').returns<ModuleRow[]>()
  const [modules, program] = await Promise.all([
    readModules(),
    supabase.from('accelerator_program').select('name, title, description, updated_at, updated_by').maybeSingle<ProgramRow>(),
  ])
  if (modules.error) throw new Error(modules.error.message)

  let rows = modules.data
  if (!rows.length) {
    const { error } = await supabase.from('accelerator_modules').upsert(
      PORTAL_MODULES.map((m, i) => ({
        slug: m.slug,
        position: i + 1,
        eyebrow: m.eyebrow,
        title: m.title,
        summary: m.summary,
        outcome: m.outcome,
        thumbnail: m.thumbnail,
        icon: m.icon,
        public_href: m.publicHref || null,
        lessons: m.lessons,
        is_published: true,
        updated_by: SEEDED_BY,
      })),
      { onConflict: 'slug', ignoreDuplicates: true },
    )
    if (error) throw new Error(error.message)
    const again = await readModules()
    if (again.error) throw new Error(again.error.message)
    rows = again.data
  }

  let details = program.data
  if (!details) {
    const seed = { id: 1, ...DEFAULT_PROGRAM, updated_by: SEEDED_BY }
    await supabase.from('accelerator_program').upsert(seed, { onConflict: 'id', ignoreDuplicates: true })
    details = { ...DEFAULT_PROGRAM, updated_at: null, updated_by: SEEDED_BY }
  }

  return { program: details, modules: rows }
})

export async function getModuleRow(slug: string): Promise<ModuleRow | null> {
  const { data } = await createAdminClient().from('accelerator_modules').select(MODULE_COLS).eq('slug', slug).maybeSingle<ModuleRow>()
  return data ?? null
}

// ─── Editor form state ────────────────────────────────────────────────────

export interface ResourceDraft {
  label: string
  href: string
  type: LessonResource['type']
  note: string
}

export interface LessonDraft {
  /** Client-only list key. */
  uid: string
  /** Empty for a lesson that hasn't been saved yet. */
  id: string
  title: string
  kind: LessonKind
  minutes: number
  summary: string
  /** Vimeo or YouTube link (or bare id). */
  video: string
  poster: string
  /** One per line. */
  points: string
  /** One per line. */
  checklist: string
  resources: ResourceDraft[]
  question: string
  /** One per line. */
  options: string
  answer: number
  explain: string
}

export interface ModuleDraft {
  title: string
  eyebrow: string
  summary: string
  outcome: string
  thumbnail: string
  icon: string
  publicHref: string
  lessons: LessonDraft[]
}

function videoLink(l: Lesson): string {
  if (l.vimeoId) return `https://vimeo.com/${l.vimeoId}`
  if (l.youtubeId) return `https://youtu.be/${l.youtubeId}`
  return ''
}

export function toLessonDraft(l: Lesson): LessonDraft {
  return {
    uid: l.id,
    id: l.id,
    title: l.title,
    kind: l.kind,
    minutes: l.minutes,
    summary: l.summary,
    video: videoLink(l),
    poster: l.poster ?? '',
    points: (l.points ?? []).join('\n'),
    checklist: (l.checklist ?? []).join('\n'),
    resources: (l.resources ?? []).map((r) => ({ label: r.label, href: r.href, type: r.type, note: r.note ?? '' })),
    question: l.quiz?.question ?? '',
    options: (l.quiz?.options ?? []).join('\n'),
    answer: l.quiz?.answer ?? 0,
    explain: l.quiz?.explain ?? '',
  }
}

export function toModuleDraft(row: ModuleRow): ModuleDraft {
  return {
    title: row.title,
    eyebrow: row.eyebrow,
    summary: row.summary,
    outcome: row.outcome,
    thumbnail: row.thumbnail ?? '',
    icon: moduleIcon(row.icon),
    publicHref: row.public_href ?? '',
    lessons: (row.lessons ?? []).map(toLessonDraft),
  }
}

// ─── Validation ───────────────────────────────────────────────────────────

class Invalid extends Error {}

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '')
}

/** `base`, or `base-2`, `base-3`… when taken. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base
  for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`
  return slug
}

function text(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max)
}

function lines(value: unknown, max: number): string[] {
  return String(value ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max)
}

/** A path on crazyseal.com (/…) or a full http(s) link; '' when blank. */
function link(value: unknown, what: string): string {
  const s = String(value ?? '').trim()
  if (!s) return ''
  if (s.startsWith('/') && !s.startsWith('//')) return s
  try {
    // Stored as typed: toString() would percent-encode characters like ×.
    const url = new URL(s)
    if (url.protocol === 'https:' || url.protocol === 'http:') return s
  } catch {}
  throw new Invalid(`${what} needs a full link (https://…) or a path on crazyseal.com starting with /.`)
}

export function parseVideo(value: string, lesson: string): Pick<Lesson, 'vimeoId' | 'youtubeId'> {
  const s = value.trim()
  if (!s) return {}
  if (/^\d{6,12}$/.test(s)) return { vimeoId: s }
  const vimeo = s.match(/vimeo\.com\/(?:[^?#]*\/)?(\d{6,12})/)
  if (vimeo) return { vimeoId: vimeo[1] }
  const youtube = s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/)
  if (youtube) return { youtubeId: youtube[1] }
  if (/^[\w-]{11}$/.test(s)) return { youtubeId: s }
  throw new Invalid(`“${lesson}”: the video needs a Vimeo or YouTube link.`)
}

/**
 * Saved lessons keep their id (dealer progress is stored against it); new
 * ones get one from their title that no other lesson in the module uses.
 */
function cleanLesson(d: LessonDraft, taken: Set<string>, reserved: Set<string>): Lesson {
  const title = text(d.title, 120)
  if (!title) throw new Invalid('Every lesson needs a title.')
  const kind = LESSON_KINDS.some((k) => k.key === d.kind) ? d.kind : 'video'
  const own = SLUG_RE.test(d.id) && !taken.has(d.id) ? d.id : ''
  const id = own || uniqueSlug(slugify(title) || 'lesson', new Set([...taken, ...reserved]))
  taken.add(id)

  const lesson: Lesson = {
    id,
    title,
    kind,
    minutes: Math.min(240, Math.max(0, Math.round(Number(d.minutes) || 0))),
    summary: text(d.summary, 600),
  }

  if (kind === 'video') {
    const video = parseVideo(String(d.video ?? ''), title)
    if (!video.vimeoId && !video.youtubeId) throw new Invalid(`“${title}” is a video lesson: add its Vimeo or YouTube link.`)
    Object.assign(lesson, video)
    const poster = link(d.poster, `“${title}”: the cover image`)
    if (poster) lesson.poster = poster
  }

  const points = lines(d.points, 12)
  if (points.length) lesson.points = points

  if (kind === 'checklist') {
    const checklist = lines(d.checklist, 20)
    if (!checklist.length) throw new Invalid(`“${title}” is a checklist: add at least one item.`)
    lesson.checklist = checklist
  }

  if (kind === 'quiz') {
    const question = text(d.question, 300)
    const options = lines(d.options, 6)
    if (!question) throw new Invalid(`“${title}” is a quick check: add the question.`)
    if (options.length < 2) throw new Invalid(`“${title}”: a quick check needs at least two answers.`)
    const answer = Math.round(Number(d.answer))
    if (!(answer >= 0 && answer < options.length)) throw new Invalid(`“${title}”: pick which answer is right.`)
    lesson.quiz = { question, options, answer, explain: text(d.explain, 400) }
  }

  const resources: LessonResource[] = []
  for (const r of (d.resources ?? []).slice(0, 12)) {
    const label = text(r.label, 80)
    const href = link(r.href, `“${title}”: the link “${label || 'untitled'}”`)
    if (!label && !href) continue
    if (!label || !href) throw new Invalid(`“${title}”: each link needs a name and an address.`)
    const type = RESOURCE_TYPES.some((t) => t.key === r.type) ? r.type : 'page'
    const note = text(r.note, 60)
    resources.push(note ? { label, href, type, note } : { label, href, type })
  }
  if (resources.length) lesson.resources = resources

  return lesson
}

export interface ModuleFields {
  title: string
  eyebrow: string
  summary: string
  outcome: string
  thumbnail: string | null
  icon: string
  public_href: string | null
  lessons: Lesson[]
}

export function cleanModule(d: ModuleDraft): { ok: true; value: ModuleFields } | { ok: false; error: string } {
  try {
    const title = text(d.title, 120)
    if (!title) throw new Invalid('The module needs a title.')
    const lessonDrafts = d.lessons ?? []
    if (lessonDrafts.length > 30) throw new Invalid('Keep a module to 30 lessons or fewer.')
    const taken = new Set<string>()
    const reserved = new Set(lessonDrafts.map((l) => l.id).filter((id) => SLUG_RE.test(id)))
    const lessons = lessonDrafts.map((l) => cleanLesson(l, taken, reserved))
    return {
      ok: true,
      value: {
        title,
        eyebrow: text(d.eyebrow, 40) || title.slice(0, 40),
        summary: text(d.summary, 300),
        outcome: text(d.outcome, 300),
        thumbnail: link(d.thumbnail, 'The thumbnail') || null,
        icon: (MODULE_ICON_NAMES as readonly string[]).includes(d.icon) ? d.icon : 'PlayCircle',
        public_href: link(d.publicHref, 'The public page') || null,
        lessons,
      },
    }
  } catch (err) {
    if (err instanceof Invalid) return { ok: false, error: err.message }
    throw err
  }
}
