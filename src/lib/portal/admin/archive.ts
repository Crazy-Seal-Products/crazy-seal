import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'
import { isWarrantyRegistrationForm } from '@/lib/warranty/legacy'
import { memo } from './cache'

/**
 * The Gravity Forms archive (`legacy_gf_entries`): about 15,800 submissions
 * imported from the old WordPress site. Read-only. Everything is filtered and
 * paged in Postgres, since the full table is ~17 MB of JSON.
 */

export interface LegacyEntry {
  id: string
  gf_entry_id: number
  gf_form_id: number
  form_title: string | null
  entry_data: Record<string, string>
  file_urls: string[] | null
  submitted_at: string | null
  imported_at: string
}

export interface ArchiveForm {
  id: number
  title: string
  count: number
}

const ENTRY_COLS = 'id, gf_entry_id, gf_form_id, form_title, entry_data, file_urls, submitted_at, imported_at'
const PAGE_SIZE = 50
const UUID_RE = /^[0-9a-f-]{36}$/i

/** Columns from the GF export that are metadata rather than answers. */
export const META_KEYS = /^(entry id|entry date|date created|user ip|source url|user agent|payment|transaction|created by)/i

export function formTitle(e: Pick<LegacyEntry, 'form_title' | 'gf_form_id'>): string {
  return e.form_title || `Form ${e.gf_form_id}`
}

export function entryName(entry: Pick<LegacyEntry, 'entry_data' | 'gf_entry_id'>): string {
  const d = entry.entry_data ?? {}
  const first = d['Name (First)'] || d['First'] || d['First Name'] || ''
  const last = d['Name (Last)'] || d['Last'] || d['Last Name'] || ''
  const combined = `${first} ${last}`.trim()
  if (combined) return combined
  const nameKey = Object.keys(d).find((k) => /name/i.test(k) && d[k])
  return (nameKey && String(d[nameKey])) || d['Email'] || `Entry #${entry.gf_entry_id}`
}

export function entryEmail(entry: Pick<LegacyEntry, 'entry_data'>): string | null {
  const d = entry.entry_data ?? {}
  if (d['Email']) return d['Email']
  const key = Object.keys(d).find((k) => /email/i.test(k) && String(d[k] ?? '').includes('@'))
  return key ? d[key] : null
}

/** A few words for the list: what kind of job, then the start of their note. */
export function entrySummary(entry: Pick<LegacyEntry, 'entry_data'>): string {
  const d = entry.entry_data ?? {}
  const find = (re: RegExp) => {
    const k = Object.keys(d).find((key) => re.test(key) && String(d[key] ?? '').trim())
    return k ? String(d[k]).trim() : null
  }
  const kind = find(/describes your (project|application|business) type/i)
  const note = find(/quick note|describe the content|customer details|contractor notes/i)
  return [kind, note].filter(Boolean).join(' · ')
}

/** The answers, without export metadata: name, email and phone first, long text last. */
export function entryAnswers(entry: Pick<LegacyEntry, 'entry_data'>): [string, string][] {
  const rank = (k: string, v: string) =>
    /^name \(first\)$/i.test(k) ? 0 : /^name \(last\)$/i.test(k) ? 1 : /^email$/i.test(k) ? 2 : /^phone$/i.test(k) ? 3 : v.length > 120 ? 5 : 4
  return Object.entries(entry.entry_data ?? {})
    .map(([k, v]) => [k, v == null ? '' : String(v)] as [string, string])
    .filter(([k, v]) => v.trim() && !META_KEYS.test(k))
    .sort((a, b) => rank(a[0], a[1]) - rank(b[0], b[1]))
}

/** Upload answers are stored as a URL or a JSON array of URLs; returns them, or null for any other answer. */
export function answerUrls(value: string): string[] | null {
  const v = value.trim()
  if (/^https?:\/\/\S+$/.test(v)) return [v]
  if (!v.startsWith('[')) return null
  try {
    const list: unknown = JSON.parse(v)
    return Array.isArray(list) && list.length > 0 && list.every((u) => typeof u === 'string' && /^https?:\/\/\S+$/.test(u)) ? (list as string[]) : null
  } catch {
    return null
  }
}

export function isImageUrl(url: string) {
  return /\.(jpe?g|png|gif|webp|heic|bmp)(\?|$)/i.test(url)
}

// ─── Search ────────────────────────────────────────────────────────────────

/** Who sent it: matched against every word of the search. */
const PERSON_KEYS = [
  'Name (First)',
  'Name (Last)',
  'Email',
  'Phone',
  'Order Number',
  'Crazy Seal Order Number (if available)',
  "Installer's Name",
  "Installer's Email",
  "Installer's Phone Number",
  'Business / Dealership Name (If Applicable)',
  'Business / Company Name (If Applicable)',
  'Business  Name (If Applicable)',
  'Name of New Owner (First)',
  'Name of New Owner (Last)',
  'Email of Original Owner',
  'Client Name (First)',
  'Client Name (Last)',
  'Client Email',
  'Rep Name',
]

/** What they wrote: matched against the whole search as one phrase. */
const TEXT_KEYS = [
  'Customer Details (Business Name, Etc.)',
  'Contractor Notes',
  'Please add a quick note about your experience with Crazy Seal',
  'Please add a quick note about your application so we can best assist you.',
  'Please add a quick note about your business so we can best assist you.',
  'Please add a quick note describing the warranty transfer situation.',
  'Please add a quick note about the client.',
  'Please describe the content or feature that would support you in your business.',
]

const jsonCol = (key: string) => `entry_data->>"${key}"`

/** PostgREST `or` filter: every word matches a contact field (or the entry #), or the phrase is in a note. */
export function searchFilter(q: string): string | null {
  // Quotes, backslashes and wildcards would break out of the quoted filter value.
  const phrase = q.replace(/["\\*%]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!phrase) return null
  const words = phrase
    .split(' ')
    .map((w) => w.replace(/^#/, ''))
    .filter(Boolean)
    .slice(0, 4)
  const anyPerson = (w: string) => {
    const parts = PERSON_KEYS.map((k) => `${jsonCol(k)}.ilike."*${w}*"`)
    if (/^\d{1,9}$/.test(w)) parts.unshift(`gf_entry_id.eq.${w}`)
    return `or(${parts.join(',')})`
  }
  const person = words.length === 1 ? anyPerson(words[0]) : `and(${words.map(anyPerson).join(',')})`
  const text = TEXT_KEYS.map((k) => `${jsonCol(k)}.ilike."*${phrase}*"`)
  return [person, ...text].join(',')
}

// ─── Queries ───────────────────────────────────────────────────────────────

/** Forms in the archive with their entry counts, plus the date span. Cached: the archive doesn't change. */
export function getArchiveOverview() {
  return memo('archive:overview', 30 * 60_000, async () => {
    const supabase = createAdminClient()
    // Walk the distinct form ids through the gf_form_id index, one small query each.
    const forms: { id: number; title: string }[] = []
    let after = -1
    for (let i = 0; i < 100; i++) {
      const { data, error } = await supabase
        .from('legacy_gf_entries')
        .select('gf_form_id, form_title')
        .gt('gf_form_id', after)
        .order('gf_form_id')
        .limit(1)
        .maybeSingle<{ gf_form_id: number; form_title: string | null }>()
      if (error) throw new Error(`legacy_gf_entries: ${error.message}`)
      if (!data) break
      forms.push({ id: data.gf_form_id, title: data.form_title || `Form ${data.gf_form_id}` })
      after = data.gf_form_id
    }
    const head = () => supabase.from('legacy_gf_entries').select('id', { count: 'exact', head: true })
    const [counts, oldest, newest] = await Promise.all([
      Promise.all(forms.map((f) => head().eq('gf_form_id', f.id))),
      supabase.from('legacy_gf_entries').select('submitted_at').not('submitted_at', 'is', null).order('submitted_at').limit(1).maybeSingle<{ submitted_at: string }>(),
      supabase
        .from('legacy_gf_entries')
        .select('submitted_at')
        .not('submitted_at', 'is', null)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle<{ submitted_at: string }>(),
    ])
    const withCounts: ArchiveForm[] = forms.map((f, i) => ({ ...f, count: counts[i].count ?? 0 }))
    return {
      forms: withCounts,
      total: withCounts.reduce((s, f) => s + f.count, 0),
      warranty: withCounts.filter((f) => isWarrantyRegistrationForm(f.id)).reduce((s, f) => s + f.count, 0),
      oldest: oldest.data?.submitted_at ?? null,
      newest: newest.data?.submitted_at ?? null,
    }
  })
}

export async function getArchiveEntries(opts: { form: number | null; q?: string; page: number }) {
  const supabase = createAdminClient()
  const filter = opts.q ? searchFilter(opts.q) : null

  const from = (opts.page - 1) * PAGE_SIZE
  let query = supabase.from('legacy_gf_entries').select(ENTRY_COLS, { count: 'exact' })
  if (opts.form != null) query = query.eq('gf_form_id', opts.form)
  if (filter) query = query.or(filter)
  const { data, count, error } = await query
    .order('submitted_at', { ascending: false, nullsFirst: false })
    .order('gf_entry_id', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
    .returns<LegacyEntry[]>()

  let total = count ?? 0
  let rows = data ?? []
  if (error) {
    // Past the last page PostgREST answers 416; show an empty page with the real total.
    if (error.code !== 'PGRST103') throw new Error(`legacy_gf_entries: ${error.message}`)
    let countQuery = supabase.from('legacy_gf_entries').select('id', { count: 'exact', head: true })
    if (opts.form != null) countQuery = countQuery.eq('gf_form_id', opts.form)
    if (filter) countQuery = countQuery.or(filter)
    total = (await countQuery).count ?? 0
    rows = []
  }
  return { rows, total, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) }
}

export const getArchiveEntry = cache(async (id: string) => {
  if (!UUID_RE.test(id)) return null
  const supabase = createAdminClient()
  const { data: entry } = await supabase.from('legacy_gf_entries').select(ENTRY_COLS).eq('id', id).maybeSingle<LegacyEntry>()
  if (!entry) return null
  let registration: { id: string; name: string | null; status: string | null } | null = null
  if (isWarrantyRegistrationForm(entry.gf_form_id)) {
    const { data } = await supabase
      .from('warranty_registrations')
      .select('id, name, status')
      .eq('gf_entry_id', entry.gf_entry_id)
      .eq('wp_form_id', entry.gf_form_id)
      .limit(1)
      .maybeSingle<{ id: string; name: string | null; status: string | null }>()
    registration = data ?? null
  }
  return { entry, registration }
})
