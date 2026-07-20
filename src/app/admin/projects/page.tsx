'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PROJECT_CATEGORIES } from '@/lib/projects'
import {
  Search, Plus, Loader2, Trash2, X, ChevronUp, ChevronDown,
  Upload, Eye, EyeOff, ExternalLink, Save, Check,
} from 'lucide-react'

interface StorySection {
  heading: string
  body: string
}

interface ProjectRow {
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
  story: StorySection[]
  quote: string | null
  photo_urls: string[]
  cover_photo: string | null
  published: boolean
  created_at: string
}

type Draft = Omit<ProjectRow, 'id' | 'created_at'> & { id?: string }

const EMPTY_DRAFT: Draft = {
  project_number: null,
  slug: '',
  title: '',
  category: 'rv',
  project_type: '',
  products_used: '',
  customer_type: '',
  location: '',
  spotlight_title: '',
  story: [],
  quote: '',
  photo_urls: [],
  cover_photo: null,
  published: true,
}

function slugify(number: number | null, title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return number ? `project-${number}-${base}` : base
}

export default function AdminProjectsPage() {
  const [rows, setRows] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('project_number', { ascending: false, nullsFirst: false })
    setRows((data as ProjectRow[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRows() }, [fetchRows])

  async function saveDraft() {
    if (!draft) return
    if (!draft.title || !draft.slug) {
      setError('Title and slug are required.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const payload = {
      project_number: draft.project_number,
      slug: draft.slug,
      title: draft.title,
      category: draft.category,
      project_type: draft.project_type || null,
      products_used: draft.products_used || null,
      customer_type: draft.customer_type || null,
      location: draft.location || null,
      spotlight_title: draft.spotlight_title || null,
      story: draft.story,
      quote: draft.quote || null,
      photo_urls: draft.photo_urls,
      cover_photo: draft.cover_photo || draft.photo_urls[0] || null,
      published: draft.published,
      updated_at: new Date().toISOString(),
    }

    const result = draft.id
      ? await supabase.from('projects').update(payload).eq('id', draft.id)
      : await supabase.from('projects').insert(payload)

    setSaving(false)
    if (result.error) {
      setError(result.error.message)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setDraft(null)
    fetchRows()
  }

  async function togglePublished(row: ProjectRow) {
    const supabase = createClient()
    const { error: err } = await supabase
      .from('projects')
      .update({ published: !row.published })
      .eq('id', row.id)
    if (!err) {
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, published: !r.published } : r)))
    }
  }

  async function deleteProject(row: ProjectRow) {
    if (!confirm(`Delete Project #${row.project_number} "${row.title}"? This cannot be undone.`)) return
    const supabase = createClient()
    const { error: err } = await supabase.from('projects').delete().eq('id', row.id)
    if (!err) setRows((prev) => prev.filter((r) => r.id !== row.id))
  }

  const filtered = rows.filter((row) => {
    if (categoryFilter !== 'all' && row.category !== categoryFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      row.title.toLowerCase().includes(q) ||
      String(row.project_number || '').includes(q) ||
      (row.location || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-4 md:p-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">
            {rows.length} customer projects &middot; shown at{' '}
            <a href="/projects/" target="_blank" rel="noopener noreferrer" className="text-[#003365] underline">
              /projects
            </a>
          </p>
        </div>
        <button
          onClick={() => setDraft({ ...EMPTY_DRAFT })}
          className="inline-flex items-center gap-1.5 bg-[#003365] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#00284f] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, number, or location..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#003365]/20"
        >
          <option value="all">All categories</option>
          {PROJECT_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((row) => (
            <div
              key={row.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-colors"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {row.cover_photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.cover_photo} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  #{row.project_number} &middot; {row.title}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {[row.category, row.location, `${row.photo_urls.length} photos`]
                    .filter(Boolean)
                    .join(' \u00B7 ')}
                </p>
              </div>
              {!row.published && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full shrink-0">
                  Draft
                </span>
              )}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`/project/${row.slug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-gray-400 hover:text-[#003365] hover:bg-gray-50 transition-colors"
                  title="View live"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => togglePublished(row)}
                  className="p-2 rounded-lg text-gray-400 hover:text-[#003365] hover:bg-gray-50 transition-colors cursor-pointer"
                  title={row.published ? 'Unpublish' : 'Publish'}
                >
                  {row.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setDraft({ ...row, story: row.story || [], photo_urls: row.photo_urls || [] })}
                  className="text-sm font-semibold text-[#003365] px-3 py-1.5 rounded-lg hover:bg-[#003365]/5 transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteProject(row)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-16">No projects match.</p>
          )}
        </div>
      )}

      {saved && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-600 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg">
          <Check className="w-4 h-4" />
          Saved
        </div>
      )}

      {/* Editor */}
      {draft && (
        <ProjectEditor
          draft={draft}
          setDraft={setDraft}
          onSave={saveDraft}
          onClose={() => { setDraft(null); setError(null) }}
          saving={saving}
          error={error}
        />
      )}
    </div>
  )
}

function ProjectEditor({
  draft,
  setDraft,
  onSave,
  onClose,
  saving,
  error,
}: {
  draft: Draft
  setDraft: React.Dispatch<React.SetStateAction<Draft | null>>
  onSave: () => void
  onClose: () => void
  saving: boolean
  error: string | null
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d))

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const folder = draft.slug || 'unsorted'
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', `projects/${folder}`)
      const res = await fetch('/api/admin/assets/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        uploaded.push(url)
      }
    }
    set({ photo_urls: [...draft.photo_urls, ...uploaded] })
    setUploading(false)
  }

  function movePhoto(i: number, dir: 1 | -1) {
    const next = [...draft.photo_urls]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set({ photo_urls: next })
  }

  const input = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003365]/20 focus:border-[#003365]'
  const label = 'block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1'

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">
            {draft.id ? `Edit Project #${draft.project_number}` : 'New Project'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-[#003365] text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-[#00284f] disabled:opacity-50 transition-colors cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Project #</label>
              <input
                type="number"
                value={draft.project_number ?? ''}
                onChange={(e) => {
                  const num = e.target.value ? Number(e.target.value) : null
                  set({
                    project_number: num,
                    slug: draft.id ? draft.slug : slugify(num, draft.title),
                  })
                }}
                className={input}
              />
            </div>
            <div className="col-span-2">
              <label className={label}>Title</label>
              <input
                value={draft.title}
                onChange={(e) =>
                  set({
                    title: e.target.value,
                    slug: draft.id ? draft.slug : slugify(draft.project_number, e.target.value),
                  })
                }
                placeholder="Built to Outlast the Build"
                className={input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Slug</label>
              <input
                value={draft.slug}
                onChange={(e) => set({ slug: e.target.value })}
                className={`${input} font-mono text-xs`}
              />
            </div>
            <div>
              <label className={label}>Category</label>
              <select
                value={draft.category || ''}
                onChange={(e) => set({ category: e.target.value })}
                className={input}
              >
                {PROJECT_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Project Type</label>
              <input
                value={draft.project_type || ''}
                onChange={(e) => set({ project_type: e.target.value })}
                placeholder="RV Roof - Self-Installed DIY Restoration"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Products Used</label>
              <input
                value={draft.products_used || ''}
                onChange={(e) => set({ products_used: e.target.value })}
                placeholder="Crazy Seal Direct-to-Deck Kit"
                className={input}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Customer Type</label>
              <input
                value={draft.customer_type || ''}
                onChange={(e) => set({ customer_type: e.target.value })}
                placeholder="Self-Installed (DIY)"
                className={input}
              />
            </div>
            <div>
              <label className={label}>Location</label>
              <input
                value={draft.location || ''}
                onChange={(e) => set({ location: e.target.value })}
                placeholder="Florida"
                className={input}
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={label}>Photos ({draft.photo_urls.length})</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#003365] px-3 py-1.5 rounded-full border border-[#003365]/20 hover:bg-[#003365]/5 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {draft.photo_urls.map((url, i) => (
                <div key={url} className="relative group rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full aspect-square object-cover" />
                  {draft.cover_photo === url && (
                    <span className="absolute top-1 left-1 bg-[#003365] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      COVER
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button
                      onClick={() => movePhoto(i, -1)}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                      title="Move earlier"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => movePhoto(i, 1)}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 text-white cursor-pointer"
                      title="Move later"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => set({ cover_photo: url })}
                      className="p-1 rounded bg-white/20 hover:bg-white/40 text-white text-[9px] font-bold cursor-pointer"
                      title="Set as cover"
                    >
                      C
                    </button>
                    <button
                      onClick={() =>
                        set({
                          photo_urls: draft.photo_urls.filter((u) => u !== url),
                          cover_photo: draft.cover_photo === url ? null : draft.cover_photo,
                        })
                      }
                      className="p-1 rounded bg-white/20 hover:bg-red-500 text-white cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Story */}
          <div>
            <label className={label}>Spotlight Title</label>
            <input
              value={draft.spotlight_title || ''}
              onChange={(e) => set({ spotlight_title: e.target.value })}
              placeholder="Project Spotlight: Better Than Factory"
              className={input}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={label}>Story Sections</label>
              <button
                onClick={() => set({ story: [...draft.story, { heading: '', body: '' }] })}
                className="text-xs font-semibold text-[#003365] cursor-pointer hover:underline"
              >
                + Add section
              </button>
            </div>
            <div className="space-y-3">
              {draft.story.map((section, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={section.heading}
                      onChange={(e) => {
                        const story = [...draft.story]
                        story[i] = { ...story[i], heading: e.target.value }
                        set({ story })
                      }}
                      placeholder="Section heading"
                      className={`${input} font-semibold`}
                    />
                    <button
                      onClick={() => set({ story: draft.story.filter((_, j) => j !== i) })}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={section.body}
                    onChange={(e) => {
                      const story = [...draft.story]
                      story[i] = { ...story[i], body: e.target.value }
                      set({ story })
                    }}
                    placeholder="Section body (blank line between paragraphs)"
                    rows={4}
                    className={input}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Customer Quote</label>
            <textarea
              value={draft.quote || ''}
              onChange={(e) => set({ quote: e.target.value })}
              placeholder="This stuff is a hundred times better than..."
              rows={2}
              className={input}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(e) => set({ published: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-[#003365] focus:ring-[#003365]"
            />
            Published (visible on the site)
          </label>
        </div>
      </div>
    </div>
  )
}
