'use client'

import React, { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Loader2, Plus, Star, Trash2, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { Project } from '@/lib/projects'
import { deleteProject, saveProject, type ProjectInput } from '@/lib/portal/admin/project-actions'
import { BUTTON, inputCls, labelCls, textareaCls } from './styles'

const MAX_EDGE = 2400

/** Shrink big photos in the browser (longest edge 2400px, JPEG) before upload. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.86))
  return blob ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file
}

function slugify(number: number | null, title: string) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return number ? `project-${number}-${base}` : base
}

export function ProjectEditor({
  project,
  nextNumber,
  categories,
}: {
  project: Project | null
  nextNumber: number
  categories: { slug: string; label: string }[]
}) {
  const router = useRouter()
  const isNew = !project
  const [p, setP] = useState<ProjectInput>(() => ({
    project_number: project?.project_number ?? nextNumber,
    slug: project?.slug ?? '',
    title: project?.title ?? '',
    category: project?.category ?? 'rv',
    project_type: project?.project_type ?? '',
    products_used: project?.products_used ?? '',
    customer_type: project?.customer_type ?? '',
    location: project?.location ?? '',
    spotlight_title: project?.spotlight_title ?? '',
    story: project?.story ?? [],
    quote: project?.quote ?? '',
    photo_urls: project?.photo_urls ?? [],
    cover_photo: project?.cover_photo ?? null,
    published: project?.published ?? true,
  }))
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [saving, startSave] = useTransition()
  const [deleting, startDelete] = useTransition()
  const [uploading, setUploading] = useState(0)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<ProjectInput>) => {
    setP((x) => {
      const next = { ...x, ...patch }
      if (!slugTouched && ('title' in patch || 'project_number' in patch)) next.slug = slugify(next.project_number, next.title)
      return next
    })
    setMessage(null)
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(list.length)
    const urls: string[] = []
    const failed: string[] = []
    for (const original of list) {
      try {
        const file = await shrink(original)
        const body = new FormData()
        body.append('file', file)
        body.append('slug', p.slug || 'unsorted')
        const res = await fetch('/portal/admin/projects/upload/', { method: 'POST', body })
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.url) urls.push(json.url)
        else failed.push(`${original.name}: ${json.error ?? 'upload failed'}`)
      } catch {
        failed.push(`${original.name}: upload failed`)
      }
      setUploading((n) => n - 1)
    }
    setP((x) => ({ ...x, photo_urls: [...x.photo_urls, ...urls], cover_photo: x.cover_photo ?? urls[0] ?? null }))
    if (failed.length) setMessage({ ok: false, text: failed.join(' · ') })
    if (fileRef.current) fileRef.current.value = ''
  }

  const move = <T,>(list: T[], i: number, d: number) => {
    const j = i + d
    if (j < 0 || j >= list.length) return list
    const next = [...list]
    ;[next[i], next[j]] = [next[j], next[i]]
    return next
  }

  const save = () =>
    startSave(async () => {
      const r = await saveProject(project?.id ?? null, p)
      setMessage(r.ok ? { ok: true, text: 'Saved' } : { ok: false, text: r.error })
      if (r.ok && isNew && r.id) router.replace(`/portal/admin/projects/${r.id}/`)
      else if (r.ok) router.refresh()
    })

  const field = (key: keyof ProjectInput, label: string, placeholder?: string) => (
    <label className={labelCls}>
      <span>{label}</span>
      <input className={inputCls} value={(p[key] as string | null) ?? ''} placeholder={placeholder} onChange={(e) => set({ [key]: e.target.value } as Partial<ProjectInput>)} />
    </label>
  )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]"
    >
      <div className="grid min-w-0 content-start gap-2">
        <section className="adm-glass rounded-[10px] p-3">
          <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
            <label className={labelCls}>
              <span>Project #</span>
              <input
                className={inputCls}
                type="number"
                min={1}
                value={p.project_number ?? ''}
                onChange={(e) => set({ project_number: e.target.value ? Number(e.target.value) : null })}
              />
            </label>
            <label className={labelCls}>
              <span>Title *</span>
              <input className={inputCls} required value={p.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Class A motorhome full roof restore" />
            </label>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={labelCls}>
              <span>URL slug *</span>
              <input
                className={inputCls}
                required
                value={p.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  set({ slug: e.target.value.toLowerCase() })
                }}
              />
              <span className="block text-[10.5px] font-normal text-adm-faint">crazyseal.com/project/{p.slug || '…'}</span>
            </label>
            <label className={labelCls}>
              <span>Category</span>
              <select className={inputCls} value={p.category ?? ''} onChange={(e) => set({ category: e.target.value || null })}>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            {field('project_type', 'Project type', 'e.g. Full roof coating')}
            {field('products_used', 'Products used', 'e.g. Crazy Seal 5 gal, Crazy Tape')}
            {field('customer_type', 'Customer type', 'e.g. RV owner, contractor')}
            {field('location', 'Location', 'e.g. Tampa, FL')}
          </div>
        </section>

        <section className="adm-glass rounded-[10px] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold">Story</h2>
            <button type="button" className={BUTTON.default} onClick={() => set({ story: [...p.story, { heading: '', body: '' }] })}>
              <Plus className="h-3.5 w-3.5" /> Add section
            </button>
          </div>
          {field('spotlight_title', 'Spotlight title', 'Headline shown above the story')}
          <div className="mt-2 grid gap-2">
            {p.story.map((s, i) => (
              <div key={i} className="grid gap-1.5 rounded-lg border border-adm-line-soft p-2">
                <div className="flex items-center gap-1.5">
                  <input
                    className={inputCls}
                    placeholder="Section heading"
                    value={s.heading}
                    onChange={(e) => set({ story: p.story.map((x, k) => (k === i ? { ...x, heading: e.target.value } : x)) })}
                  />
                  <button type="button" aria-label="Move section up" className={BUTTON.default} onClick={() => set({ story: move(p.story, i, -1) })}>
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Move section down" className={BUTTON.default} onClick={() => set({ story: move(p.story, i, 1) })}>
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" aria-label="Remove section" className={BUTTON.danger} onClick={() => set({ story: p.story.filter((_, k) => k !== i) })}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <textarea
                  className={textareaCls}
                  rows={4}
                  placeholder="What happened, what was used, how it turned out…"
                  value={s.body}
                  onChange={(e) => set({ story: p.story.map((x, k) => (k === i ? { ...x, body: e.target.value } : x)) })}
                />
              </div>
            ))}
            {!p.story.length && <p className="text-[12px] text-adm-muted">No story sections yet.</p>}
          </div>
          <label className={twMerge(labelCls, 'mt-2')}>
            <span>Customer quote</span>
            <textarea className={textareaCls} rows={2} value={p.quote ?? ''} onChange={(e) => set({ quote: e.target.value })} />
          </label>
        </section>

        <section className="adm-glass rounded-[10px] p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-semibold">
              Photos <span className="font-normal text-adm-muted">· {p.photo_urls.length} · the starred one is the cover</span>
            </h2>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
            <button type="button" className={BUTTON.default} disabled={uploading > 0} onClick={() => fileRef.current?.click()}>
              {uploading > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
              {uploading > 0 ? `Uploading ${uploading}…` : 'Upload photos'}
            </button>
          </div>
          {p.photo_urls.length ? (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {p.photo_urls.map((url, i) => {
                const cover = p.cover_photo === url
                return (
                  <li key={url} className={twMerge('overflow-hidden rounded-lg border', cover ? 'border-adm-gold' : 'border-adm-line')}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-adm-head object-cover" />
                    <div className="flex items-center gap-1 p-1">
                      <button type="button" aria-label="Use as cover" title="Use as cover" className={twMerge('grid h-7 w-7 place-items-center rounded-md', cover ? 'bg-adm-gold text-adm-gold-ink' : 'text-adm-muted hover:text-adm-ink')} onClick={() => set({ cover_photo: url })}>
                        <Star className={twMerge('h-3.5 w-3.5', cover && 'fill-current')} />
                      </button>
                      <button type="button" aria-label="Move left" className="grid h-7 w-7 place-items-center rounded-md text-adm-muted hover:text-adm-ink" onClick={() => set({ photo_urls: move(p.photo_urls, i, -1) })}>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" aria-label="Move right" className="grid h-7 w-7 place-items-center rounded-md text-adm-muted hover:text-adm-ink" onClick={() => set({ photo_urls: move(p.photo_urls, i, 1) })}>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Remove photo"
                        className="ml-auto grid h-7 w-7 place-items-center rounded-md text-adm-red hover:bg-red-500/10"
                        onClick={() => set({ photo_urls: p.photo_urls.filter((u) => u !== url), cover_photo: cover ? null : p.cover_photo })}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-[12px] text-adm-muted">No photos yet. Big photos are shrunk to 2400px before upload.</p>
          )}
        </section>
      </div>

      <aside className="grid content-start gap-2">
        <section className="adm-glass grid gap-2.5 rounded-[10px] p-3 xl:sticky xl:top-16">
          <label className="flex items-center gap-2 text-[12.5px]">
            <input type="checkbox" checked={p.published} onChange={(e) => set({ published: e.target.checked })} className="h-4 w-4 accent-[#2f80d8]" />
            Published on crazyseal.com/projects
          </label>
          <button type="submit" disabled={saving || uploading > 0} className={twMerge(BUTTON.gold, 'justify-center')}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isNew ? 'Create project' : 'Save changes'}
          </button>
          {message && <p className={twMerge('text-[12px]', message.ok ? 'text-adm-green' : 'text-adm-red')}>{message.text}</p>}
          {!isNew && project.published && (
            <a href={`/project/${project.slug}/`} target="_blank" rel="noopener noreferrer" className="text-[12px] text-adm-blue-bright hover:underline">
              View the live page
            </a>
          )}
          {!isNew && (
            <button
              type="button"
              disabled={deleting}
              className={twMerge(BUTTON.danger, 'justify-center')}
              onClick={() => {
                if (!window.confirm(`Delete project #${project.project_number} "${project.title}"? This can't be undone.`)) return
                startDelete(async () => {
                  const r = await deleteProject(project.id)
                  if (r.ok) router.replace('/portal/admin/projects/')
                  else setMessage({ ok: false, text: r.error })
                })
              }}
            >
              {deleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete project
            </button>
          )}
        </section>
      </aside>
    </form>
  )
}
