'use client'

import React, { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  FolderOpen,
  ListChecks,
  Loader2,
  Plus,
  Trash2,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { deleteModule, saveModule, setModulePublished } from '@/lib/portal/admin/accelerator-actions'
import type { LessonDraft, ModuleDraft, ResourceDraft } from '@/lib/portal/admin/accelerator'
import { LESSON_KINDS, MODULE_ICON_NAMES, RESOURCE_TYPES, type LessonKind } from '@/lib/portal/modules'
import { Badge, PageHeader, Panel } from '../ui'
import { BUTTON, inputCls, labelCls, textareaCls } from '../styles'
import { MODULE_ICON_META, previewHref } from './icons'

const KIND_ICONS: Record<LessonKind, LucideIcon> = { video: Video, assets: FolderOpen, checklist: ListChecks, quiz: CircleHelp }

const ICON_BUTTON =
  'grid h-7 w-7 shrink-0 place-items-center rounded-md border border-adm-line bg-adm-input text-adm-muted transition hover:border-adm-blue-bright/60 hover:text-adm-ink disabled:pointer-events-none disabled:opacity-35'

const hint = 'text-[11px] font-normal text-adm-faint'

function blankLesson(): LessonDraft {
  return {
    uid: crypto.randomUUID(),
    id: '',
    title: '',
    kind: 'video',
    minutes: 5,
    summary: '',
    video: '',
    poster: '',
    points: '',
    checklist: '',
    resources: [],
    question: '',
    options: '',
    answer: 0,
    explain: '',
  }
}

function looksLikeImage(src: string) {
  return /^(https?:\/\/|\/)\S+$/.test(src.trim())
}

/**
 * Editor for one Accelerator Program module: its details and its lessons,
 * saved together. Lessons open one at a time; their ids (used in dealers'
 * saved progress and lesson links) are set on first save and never change.
 */
export function ModuleEditor({
  slug,
  number,
  published,
  initial,
}: {
  slug: string
  number: number | null
  published: boolean
  initial: ModuleDraft
}) {
  const router = useRouter()
  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [openUid, setOpenUid] = useState<string | null>(null)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, start] = useTransition()
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const set = (patch: Partial<ModuleDraft>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setStatus(null)
  }
  const setLesson = (uid: string, patch: Partial<LessonDraft>) =>
    set({ lessons: draft.lessons.map((l) => (l.uid === uid ? { ...l, ...patch } : l)) })
  const moveLesson = (from: number, to: number) => {
    const lessons = [...draft.lessons]
    ;[lessons[from], lessons[to]] = [lessons[to], lessons[from]]
    set({ lessons })
  }
  const addLesson = () => {
    const lesson = blankLesson()
    set({ lessons: [...draft.lessons, lesson] })
    setOpenUid(lesson.uid)
  }

  const save = () =>
    start(async () => {
      const r = await saveModule(slug, draft)
      if (r.ok && r.draft) {
        // Keep the open lesson open: saved lessons are keyed by their id.
        const open = draft.lessons.findIndex((l) => l.uid === openUid)
        setDraft(r.draft)
        setSaved(r.draft)
        setOpenUid(open >= 0 ? (r.draft.lessons[open]?.uid ?? null) : null)
        setStatus({ ok: true, text: 'Saved. Dealers see it on their next page load.' })
      } else if (!r.ok) setStatus({ ok: false, text: r.error })
    })

  const togglePublished = () =>
    start(async () => {
      const r = await setModulePublished(slug, !published)
      setStatus(r.ok ? { ok: true, text: r.message ?? 'Done' } : { ok: false, text: r.error })
    })

  const remove = () => {
    if (!window.confirm(`Delete “${saved.title}” and its ${saved.lessons.length} lessons? This can’t be undone.`)) return
    start(async () => {
      const r = await deleteModule(slug)
      if (r.ok) router.push('/portal/admin/dealers/accelerator/')
      else setStatus({ ok: false, text: r.error })
    })
  }

  const minutes = draft.lessons.reduce((n, l) => n + (Number(l.minutes) || 0), 0)
  const ModuleIcon = MODULE_ICON_META[draft.icon as keyof typeof MODULE_ICON_META]?.icon ?? Video

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {saved.title || 'Untitled module'}
            {published ? <Badge tone="good">Live · Module {number}</Badge> : <Badge tone="warn">Draft</Badge>}
          </span>
        }
        description={
          published
            ? `${draft.lessons.length} lessons · ${minutes} min · dealers see this in the Pro Portal`
            : `${draft.lessons.length} lessons · ${minutes} min · hidden from dealers until you publish it`
        }
        actions={
          <>
            {published && (
              <a href={previewHref(slug)} target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
                Preview <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}
            <button
              type="button"
              onClick={togglePublished}
              disabled={pending || dirty}
              title={dirty ? 'Save your changes first' : undefined}
              className={BUTTON.default}
            >
              {published ? 'Move to drafts' : 'Publish'}
            </button>
            <button type="button" onClick={remove} disabled={pending} className={BUTTON.danger}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </>
        }
      />

      <div className="grid gap-2 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Panel title="Module details" tone="dealers" className="self-start">
          <div className="grid gap-2.5 p-3">
            <label className={labelCls}>
              <span>Title</span>
              <input className={inputCls} value={draft.title} onChange={(e) => set({ title: e.target.value })} required maxLength={120} />
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2.5">
              <label className={labelCls}>
                <span>
                  Short label <span className={hint}>e.g. Marketing</span>
                </span>
                <input className={inputCls} value={draft.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} maxLength={40} />
              </label>
              <label className={labelCls}>
                <span>Icon</span>
                <span className="flex items-center gap-1.5">
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-adm-gold/12 text-adm-gold-text ring-1 ring-inset ring-adm-gold/35">
                    <ModuleIcon className="h-4 w-4" />
                  </span>
                  <select className={twMerge(inputCls, 'w-auto')} value={draft.icon} onChange={(e) => set({ icon: e.target.value })}>
                    {MODULE_ICON_NAMES.map((name) => (
                      <option key={name} value={name}>
                        {MODULE_ICON_META[name].label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            </div>
            <label className={labelCls}>
              <span>Summary</span>
              <textarea className={textareaCls} rows={2} value={draft.summary} onChange={(e) => set({ summary: e.target.value })} maxLength={300} />
            </label>
            <label className={labelCls}>
              <span>
                Outcome <span className={hint}>what a dealer can do after it</span>
              </span>
              <textarea className={textareaCls} rows={2} value={draft.outcome} onChange={(e) => set({ outcome: e.target.value })} maxLength={300} />
            </label>
            <label className={labelCls}>
              <span>
                Thumbnail image <span className={hint}>link</span>
              </span>
              <input className={inputCls} value={draft.thumbnail} onChange={(e) => set({ thumbnail: e.target.value })} placeholder="https://media.crazyseal.com/…" spellCheck={false} />
            </label>
            {looksLikeImage(draft.thumbnail) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.thumbnail} alt="" className="aspect-video w-full rounded-md object-cover ring-1 ring-adm-line" />
            )}
            <label className={labelCls}>
              <span>
                Public page <span className={hint}>optional, e.g. /resources/sales/</span>
              </span>
              <input className={inputCls} value={draft.publicHref} onChange={(e) => set({ publicHref: e.target.value })} spellCheck={false} />
            </label>
            <p className="text-[11px] text-adm-faint">Link id: {slug}</p>
          </div>
        </Panel>

        <Panel
          title="Lessons"
          meta={`${draft.lessons.length} · in order`}
          tone="dealers"
          actions={
            <button type="button" onClick={addLesson} className={twMerge(BUTTON.default, 'h-7 px-2 text-[11.5px]')}>
              <Plus className="h-3.5 w-3.5" />
              Add lesson
            </button>
          }
        >
          {draft.lessons.length ? (
            <ol className="divide-y divide-adm-line-soft">
              {draft.lessons.map((lesson, i) => (
                <LessonItem
                  key={lesson.uid}
                  lesson={lesson}
                  index={i}
                  count={draft.lessons.length}
                  open={openUid === lesson.uid}
                  onToggle={() => setOpenUid(openUid === lesson.uid ? null : lesson.uid)}
                  onChange={(patch) => setLesson(lesson.uid, patch)}
                  onMove={(to) => moveLesson(i, to)}
                  onRemove={() => set({ lessons: draft.lessons.filter((l) => l.uid !== lesson.uid) })}
                />
              ))}
            </ol>
          ) : (
            <div className="px-3 py-8 text-center">
              <p className="text-[12.5px] text-adm-muted">No lessons yet.</p>
              <button type="button" onClick={addLesson} className={twMerge(BUTTON.gold, 'mt-3')}>
                <Plus className="h-3.5 w-3.5" />
                Add the first lesson
              </button>
            </div>
          )}
        </Panel>
      </div>

      <div className="sticky bottom-2 z-10 mt-2">
        <div className="adm-glass flex flex-wrap items-center gap-2 rounded-[10px] px-3 py-2 shadow-lg">
          <p role="status" className={twMerge('min-w-0 flex-1 text-[12px]', status ? (status.ok ? 'text-adm-green' : 'text-adm-red') : 'text-adm-muted')}>
            {status?.text ?? (dirty ? 'You have unsaved changes.' : 'All changes saved.')}
          </p>
          {dirty && (
            <button
              type="button"
              onClick={() => {
                setDraft(saved)
                setStatus(null)
              }}
              disabled={pending}
              className={BUTTON.default}
            >
              Discard
            </button>
          )}
          <button type="button" onClick={save} disabled={pending || !dirty} className={BUTTON.gold}>
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}

function LessonItem({
  lesson,
  index,
  count,
  open,
  onToggle,
  onChange,
  onMove,
  onRemove,
}: {
  lesson: LessonDraft
  index: number
  count: number
  open: boolean
  onToggle: () => void
  onChange: (patch: Partial<LessonDraft>) => void
  onMove: (to: number) => void
  onRemove: () => void
}) {
  const Icon = KIND_ICONS[lesson.kind]
  const kind = LESSON_KINDS.find((k) => k.key === lesson.kind)?.label
  const options = lesson.options
    .split('\n')
    .map((o) => o.trim())
    .filter(Boolean)
  const setResource = (i: number, patch: Partial<ResourceDraft>) =>
    onChange({ resources: lesson.resources.map((r, j) => (j === i ? { ...r, ...patch } : r)) })

  return (
    <li className={twMerge(open && 'bg-adm-ink/[0.025]')}>
      <div className="flex items-center gap-2 px-3 py-2">
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-adm-ink/[0.06] text-[11px] font-bold text-adm-soft">{index + 1}</span>
          <Icon className="h-4 w-4 shrink-0 text-adm-blue-bright" />
          <span className="min-w-0 flex-1">
            <span className={twMerge('block truncate text-[13px] font-medium', lesson.title ? 'text-adm-ink' : 'italic text-adm-muted')}>
              {lesson.title || 'Untitled lesson'}
            </span>
            <span className="block truncate text-[11px] text-adm-muted">
              {kind} · {lesson.minutes || 0} min{!lesson.id && ' · new'}
            </span>
          </span>
          <ChevronDown className={twMerge('h-4 w-4 shrink-0 text-adm-muted transition', open && 'rotate-180')} />
        </button>
        <button type="button" aria-label="Move up" disabled={index === 0} onClick={() => onMove(index - 1)} className={ICON_BUTTON}>
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
        <button type="button" aria-label="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)} className={ICON_BUTTON}>
          <ArrowDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {open && (
        <div className="grid gap-2.5 border-t border-adm-line-soft px-3 pb-3 pt-2.5">
          <div className="grid gap-2.5 @xl:grid-cols-[minmax(0,1fr)_150px_90px]">
            <label className={labelCls}>
              <span>Lesson title</span>
              <input className={inputCls} value={lesson.title} onChange={(e) => onChange({ title: e.target.value })} maxLength={120} autoFocus={!lesson.id} />
            </label>
            <label className={labelCls}>
              <span>Type</span>
              <select className={inputCls} value={lesson.kind} onChange={(e) => onChange({ kind: e.target.value as LessonKind })}>
                {LESSON_KINDS.map((k) => (
                  <option key={k.key} value={k.key}>
                    {k.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              <span>Minutes</span>
              <input className={inputCls} type="number" min={0} max={240} value={lesson.minutes} onChange={(e) => onChange({ minutes: Number(e.target.value) })} />
            </label>
          </div>
          <label className={labelCls}>
            <span>Summary</span>
            <textarea className={textareaCls} rows={2} value={lesson.summary} onChange={(e) => onChange({ summary: e.target.value })} maxLength={600} />
          </label>

          {lesson.kind === 'video' && (
            <div className="grid gap-2.5 @xl:grid-cols-2">
              <label className={labelCls}>
                <span>Video link</span>
                <input
                  className={inputCls}
                  value={lesson.video}
                  onChange={(e) => onChange({ video: e.target.value })}
                  placeholder="https://vimeo.com/… or https://youtu.be/…"
                  spellCheck={false}
                />
              </label>
              <label className={labelCls}>
                <span>
                  Cover image <span className={hint}>optional link</span>
                </span>
                <input className={inputCls} value={lesson.poster} onChange={(e) => onChange({ poster: e.target.value })} spellCheck={false} />
              </label>
            </div>
          )}

          {lesson.kind === 'checklist' && (
            <label className={labelCls}>
              <span>
                Checklist <span className={hint}>one item per line</span>
              </span>
              <textarea className={textareaCls} rows={5} value={lesson.checklist} onChange={(e) => onChange({ checklist: e.target.value })} />
            </label>
          )}

          {lesson.kind === 'quiz' && (
            <div className="grid gap-2.5">
              <label className={labelCls}>
                <span>Question</span>
                <input className={inputCls} value={lesson.question} onChange={(e) => onChange({ question: e.target.value })} maxLength={300} />
              </label>
              <div className="grid gap-2.5 @xl:grid-cols-[minmax(0,1fr)_220px]">
                <label className={labelCls}>
                  <span>
                    Answers <span className={hint}>one per line, 2 to 6</span>
                  </span>
                  <textarea className={textareaCls} rows={3} value={lesson.options} onChange={(e) => onChange({ options: e.target.value })} />
                </label>
                <label className={labelCls}>
                  <span>Right answer</span>
                  <select className={inputCls} value={lesson.answer} onChange={(e) => onChange({ answer: Number(e.target.value) })}>
                    {options.length ? (
                      options.map((o, i) => (
                        <option key={i} value={i}>
                          {o}
                        </option>
                      ))
                    ) : (
                      <option value={0}>Add answers first</option>
                    )}
                  </select>
                </label>
              </div>
              <label className={labelCls}>
                <span>
                  Explanation <span className={hint}>shown after they answer</span>
                </span>
                <input className={inputCls} value={lesson.explain} onChange={(e) => onChange({ explain: e.target.value })} maxLength={400} />
              </label>
            </div>
          )}

          <label className={labelCls}>
            <span>
              Key points <span className={hint}>optional, one per line</span>
            </span>
            <textarea className={textareaCls} rows={3} value={lesson.points} onChange={(e) => onChange({ points: e.target.value })} />
          </label>

          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-adm-muted">
              Downloads and links <span className={hint}>PDFs, pages, image packs</span>
            </p>
            {lesson.resources.map((r, i) => (
              <div key={i} className="grid gap-1.5 rounded-md border border-adm-line-soft p-1.5 @xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_110px_auto]">
                <input className={inputCls} aria-label="Link name" placeholder="Name" value={r.label} onChange={(e) => setResource(i, { label: e.target.value })} />
                <input
                  className={inputCls}
                  aria-label="Link address"
                  placeholder="https://… or /page/"
                  value={r.href}
                  onChange={(e) => setResource(i, { href: e.target.value })}
                  spellCheck={false}
                />
                <select className={inputCls} aria-label="Link type" value={r.type} onChange={(e) => setResource(i, { type: e.target.value as ResourceDraft['type'] })}>
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Remove link"
                  onClick={() => onChange({ resources: lesson.resources.filter((_, j) => j !== i) })}
                  className={twMerge(ICON_BUTTON, 'h-8 w-8 justify-self-end')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onChange({ resources: [...lesson.resources, { label: '', href: '', type: 'pdf', note: '' }] })}
              className={twMerge(BUTTON.default, 'h-7 px-2 text-[11.5px]')}
            >
              <Plus className="h-3.5 w-3.5" />
              Add link
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-adm-line-soft pt-2.5">
            <span className="text-[11px] text-adm-faint">{lesson.id ? `Link id: ${lesson.id}` : 'New lesson: its link id is set when you save.'}</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Remove “${lesson.title || 'this lesson'}”? It’s gone for good once you save.`)) onRemove()
              }}
              className={twMerge(BUTTON.danger, 'h-7 px-2 text-[11.5px]')}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove lesson
            </button>
          </div>
        </div>
      )}
    </li>
  )
}
