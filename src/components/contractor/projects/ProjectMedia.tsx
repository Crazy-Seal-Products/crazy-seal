'use client'

import { useCallback, useEffect, useMemo, useOptimistic, useRef, useState, useTransition } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { AlertCircle, ImageIcon, Loader2, Play, Plus, RotateCw, ShieldCheck, UploadCloud, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { deleteMedia, finishMediaUploads, startMediaUpload, updateMedia } from '@/lib/contractor/media-actions'
import {
  GALLERY_STAGES,
  MAX_BYTES,
  MEDIA_ACCEPT,
  MEDIA_STAGE_HINT,
  MEDIA_STAGE_LABEL,
  fileSize,
  isHeic,
  mediaProblem,
  resolveMedia,
  type MediaItem,
  type MediaKind,
  type MediaStage,
} from '@/lib/contractor/media-shared'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle } from '@/components/portal/ui'
import { FormNotice, tint } from './kit'
import { MEDIA_TONE, MediaLightbox } from './MediaLightbox'

/**
 * The project page's "Photos & videos": Before, Progress and After groups
 * (Claim once the project has a warranty claim), each a drop zone with an Add
 * tile. Files go straight to S3 (startMediaUpload → PUT with progress →
 * finishMediaUploads), three at a time, and the batch is logged as one
 * activity line. A thumbnail opens the lightbox: zoom, play, caption, move,
 * delete. Without edit rights (View as, or a role without projects.edit)
 * it's the gallery alone.
 */

interface Upload {
  key: string
  stage: MediaStage
  file: File
  kind: MediaKind
  preview: string | null
  progress: number
  status: 'queued' | 'uploading' | 'finishing' | 'error'
  error?: string
}

type Op = { type: 'patch'; id: string; patch: Partial<Pick<MediaItem, 'caption' | 'stage'>> } | { type: 'remove'; id: string }

function applyOp(state: MediaItem[], op: Op): MediaItem[] {
  if (op.type === 'remove') return state.filter((i) => i.id !== op.id)
  return state.map((i) => (i.id === op.id ? { ...i, ...op.patch } : i))
}

/* ------------------------------------------------------------ the upload */

const MAX_PARALLEL = 3
const MAX_ATTEMPTS = 3
let activeUploads = 0
const waiting: (() => void)[] = []

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activeUploads < MAX_PARALLEL) activeUploads++
  else await new Promise<void>((resolve) => waiting.push(resolve))
  try {
    return await fn()
  } finally {
    const next = waiting.shift()
    if (next) next()
    else activeUploads--
  }
}

function putFile(url: string, file: File, contentType: string, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
    }
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 ${xhr.status}`)))
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.ontimeout = () => reject(new Error('Timed out'))
    xhr.timeout = file.size > 100 * 1024 * 1024 ? 2 * 60 * 60 * 1000 : 10 * 60 * 1000
    xhr.send(file)
  })
}

/** Cell connections drop mid-upload often enough that each file gets retries. */
async function putWithRetry(url: string, file: File, contentType: string, onProgress: (pct: number) => void): Promise<void> {
  let lastError: unknown
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await putFile(url, file, contentType, onProgress)
    } catch (err) {
      lastError = err
      if (attempt < MAX_ATTEMPTS - 1) await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt))
    }
  }
  throw lastError
}

function hasFiles(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer?.types ?? []).includes('Files')
}

/* ------------------------------------------------------------- the panel */

export function ProjectMedia({
  projectId,
  items,
  hasClaim,
  canEdit,
  people,
  title,
  className,
  delay = 0.08,
}: {
  projectId: string
  items: MediaItem[]
  hasClaim: boolean
  canEdit: boolean
  people: Record<string, string>
  title: React.ReactNode
  className?: string
  delay?: number
}) {
  // Uploads finished in this visit, until the page's next refresh brings them in.
  const [added, setAdded] = useState<MediaItem[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragStage, setDragStage] = useState<MediaStage | null>(null)
  const [, startTransition] = useTransition()
  const previews = useRef(new Map<string, string>())

  const base = useMemo(() => {
    const ids = new Set(items.map((i) => i.id))
    return [...items, ...added.filter((a) => !ids.has(a.id))]
  }, [items, added])
  const [shown, optimistic] = useOptimistic(base, applyOp)

  useEffect(() => {
    const map = previews.current
    return () => map.forEach((url) => URL.revokeObjectURL(url))
  }, [])

  // Leaving mid-upload loses the rest: ask first.
  const busy = uploads.some((u) => u.status !== 'error')
  useEffect(() => {
    if (!busy) return
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [busy])

  const patchUpload = (key: string, patch: Partial<Upload>) => setUploads((prev) => prev.map((u) => (u.key === key ? { ...u, ...patch } : u)))
  const dropUpload = (key: string) => {
    const url = previews.current.get(key)
    if (url) {
      URL.revokeObjectURL(url)
      previews.current.delete(key)
    }
    setUploads((prev) => prev.filter((u) => u.key !== key))
  }

  /** One file: record it, PUT it to S3, check it. The media id when it made it. */
  async function uploadOne(u: Upload): Promise<string | null> {
    patchUpload(u.key, { status: 'uploading', progress: 0, error: undefined })
    const start = await startMediaUpload({ projectId, stage: u.stage, fileName: u.file.name, mime: u.file.type, bytes: u.file.size }).catch(() => null)
    if (!start?.ok) {
      patchUpload(u.key, { status: 'error', error: start?.error ?? `${u.file.name} didn’t upload. Try again.` })
      return null
    }
    try {
      await putWithRetry(start.uploadUrl, u.file, start.contentType, (progress) => patchUpload(u.key, { progress }))
    } catch {
      patchUpload(u.key, { status: 'error', error: `${u.file.name} didn’t upload. Check your connection and try again.` })
      void deleteMedia({ id: start.item.id }).catch(() => null)
      return null
    }
    patchUpload(u.key, { status: 'finishing', progress: 100 })
    const fin = await finishMediaUploads({ projectId, ids: [start.item.id] }).catch(() => null)
    const problem = !fin ? 'That didn’t save. Try again.' : !fin.ok ? fin.error : fin.failed[0]?.error
    const item = fin?.ok ? fin.items[0] : undefined
    if (problem || !item) {
      patchUpload(u.key, { status: 'error', error: problem ?? 'That didn’t save. Try again.' })
      if (fin && !fin.ok) void deleteMedia({ id: start.item.id }).catch(() => null)
      return null
    }
    setAdded((prev) => [...prev.filter((a) => a.id !== item.id), item])
    dropUpload(u.key)
    return item.id
  }

  async function runBatch(batch: Upload[]) {
    const ids = (await Promise.all(batch.map((u) => withSlot(() => uploadOne(u))))).filter((id): id is string => Boolean(id))
    if (!ids.length) return
    // One activity line for the batch, and the page refreshes (its activity feed too).
    startTransition(async () => {
      const r = await finishMediaUploads({ projectId, ids, announce: true }).catch(() => null)
      if (r && !r.ok) setNotice(r.error)
    })
  }

  function addFiles(stage: MediaStage, list: FileList | null) {
    if (!canEdit || !list?.length) return
    const problems: string[] = []
    const batch: Upload[] = []
    for (const file of Array.from(list)) {
      const problem = mediaProblem(file.name, file.type, file.size)
      const media = resolveMedia(file.name, file.type)
      if (problem || !media) {
        problems.push(problem ?? `${file.name} can’t be uploaded.`)
        continue
      }
      const key = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      const preview = URL.createObjectURL(file)
      previews.current.set(key, preview)
      batch.push({ key, stage, file, kind: media.kind, preview, progress: 0, status: 'queued' })
    }
    setNotice(problems.length ? problems.slice(0, 3).join(' ') + (problems.length > 3 ? ` (${problems.length - 3} more skipped.)` : '') : null)
    if (!batch.length) return
    setUploads((prev) => [...prev, ...batch])
    void runBatch(batch)
  }

  function retry(u: Upload) {
    patchUpload(u.key, { status: 'queued', progress: 0, error: undefined })
    void runBatch([u])
  }

  const update = (id: string, patch: { caption?: string | null; stage?: MediaStage }) => {
    startTransition(async () => {
      optimistic({ type: 'patch', id, patch })
      const r = await updateMedia({ id, ...patch }).catch(() => null)
      if (!r?.ok) setNotice(r?.error ?? 'That didn’t save. Try again.')
      else setAdded((prev) => prev.map((a) => (a.id === id ? r.item : a)))
    })
  }

  const visibleStages = GALLERY_STAGES.filter((s) => {
    if (s === 'claim') return hasClaim || shown.some((i) => i.stage === 'claim') || uploads.some((u) => u.stage === 'claim')
    if (s === 'other') return shown.some((i) => i.stage === 'other')
    return true
  })
  const moveTargets = visibleStages.filter((s) => s !== 'other')
  const ordered = visibleStages.flatMap((s) => shown.filter((i) => i.stage === s))

  const remove = (id: string) => {
    // Show the next one (or close) before it goes.
    const at = ordered.findIndex((i) => i.id === id)
    const next = ordered[at + 1] ?? ordered[at - 1]
    setOpenId(next && next.id !== id ? next.id : null)
    startTransition(async () => {
      optimistic({ type: 'remove', id })
      const r = await deleteMedia({ id }).catch(() => null)
      if (!r?.ok) setNotice(r?.error ?? 'That didn’t delete. Try again.')
      else setAdded((prev) => prev.filter((a) => a.id !== id))
    })
  }

  const closeLightbox = useCallback(() => setOpenId(null), [])
  const photos = shown.filter((i) => i.kind === 'photo').length
  const videos = shown.length - photos

  return (
    <Panel delay={delay} className={className}>
      <PanelTitle
        action={
          shown.length > 0 ? (
            <span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
              {[photos ? `${photos} photo${photos === 1 ? '' : 's'}` : null, videos ? `${videos} video${videos === 1 ? '' : 's'}` : null].filter(Boolean).join(' · ')}
            </span>
          ) : undefined
        }
      >
        {title}
      </PanelTitle>

      {canEdit && (
        <p className="-mt-2 mb-4 text-xs text-[var(--p-muted,#9DA3AB)]">
          Drag photos and videos onto a stage, or tap Add. Photos up to {fileSize(MAX_BYTES.photo)}, videos up to {fileSize(MAX_BYTES.video)}. Before and after photos fill in the warranty registration.
        </p>
      )}

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3 overflow-hidden">
            <div className="flex items-start gap-2">
              <FormNotice state={{ ok: false, error: notice }} className="flex-1" />
              <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss" className="mt-1 rounded-full p-1 text-[var(--p-muted,#9DA3AB)] transition hover:bg-white/[0.06] hover:text-[var(--p-ink,#fff)]">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!canEdit && shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.015] px-4 py-7 text-center text-sm text-[var(--p-muted,#9DA3AB)]">
          No photos or videos yet.
        </p>
      ) : (
        <LayoutGroup id={`media-${projectId}`}>
          <div className="grid gap-3 lg:grid-cols-3">
            {visibleStages.map((stage) => (
              <StageGroup
                key={stage}
                stage={stage}
                wide={stage === 'claim' || stage === 'other'}
                items={shown.filter((i) => i.stage === stage)}
                uploads={uploads.filter((u) => u.stage === stage)}
                canEdit={canEdit}
                dragging={dragStage === stage}
                onDragState={setDragStage}
                onFiles={addFiles}
                onOpen={setOpenId}
                onRetry={retry}
                onDismiss={(u) => dropUpload(u.key)}
              />
            ))}
          </div>
        </LayoutGroup>
      )}

      <MediaLightbox
        items={ordered}
        openId={openId}
        onOpen={setOpenId}
        onClose={closeLightbox}
        canEdit={canEdit}
        stages={moveTargets}
        people={people}
        onUpdate={update}
        onDelete={remove}
      />
    </Panel>
  )
}

/* -------------------------------------------------------------- a group */

function StageGroup({
  stage,
  wide,
  items,
  uploads,
  canEdit,
  dragging,
  onDragState,
  onFiles,
  onOpen,
  onRetry,
  onDismiss,
}: {
  stage: MediaStage
  wide: boolean
  items: MediaItem[]
  uploads: Upload[]
  canEdit: boolean
  dragging: boolean
  onDragState: (stage: MediaStage | null) => void
  onFiles: (stage: MediaStage, files: FileList | null) => void
  onOpen: (id: string) => void
  onRetry: (u: Upload) => void
  onDismiss: (u: Upload) => void
}) {
  const color = MEDIA_TONE[stage]
  const label = MEDIA_STAGE_LABEL[stage]
  const empty = items.length === 0 && uploads.length === 0
  const grid = wide ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-3'

  const dropHandlers = canEdit
    ? {
        onDragEnter: (e: React.DragEvent) => {
          if (!hasFiles(e)) return
          e.preventDefault()
          onDragState(stage)
        },
        onDragOver: (e: React.DragEvent) => {
          if (!hasFiles(e)) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
          if (!dragging) onDragState(stage)
        },
        onDragLeave: (e: React.DragEvent) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onDragState(null)
        },
        onDrop: (e: React.DragEvent) => {
          if (!hasFiles(e)) return
          e.preventDefault()
          onDragState(null)
          onFiles(stage, e.dataTransfer.files)
        },
      }
    : {}

  return (
    <section
      aria-label={`${label} photos and videos`}
      {...dropHandlers}
      className={twMerge(
        'relative min-w-0 rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.02] p-3 transition duration-300',
        wide && 'lg:col-span-3',
        dragging && 'border-[color-mix(in_oklab,var(--p-primary)_70%,transparent)] bg-[color-mix(in_oklab,var(--p-primary)_8%,transparent)] ring-4 ring-[color-mix(in_oklab,var(--p-primary)_18%,transparent)]',
      )}
    >
      <header className="mb-2.5 flex items-center gap-2">
        <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
        <h3 className="text-sm font-bold text-[var(--p-ink,#fff)]">{label}</h3>
        {items.length > 0 && (
          <span className="rounded-full px-1.5 py-px text-[10.5px] font-semibold tabular-nums ring-1" style={tint(color)}>
            {items.length}
          </span>
        )}
        <span className="ml-auto truncate text-[11px] text-[var(--p-muted,#9DA3AB)]">{MEDIA_STAGE_HINT[stage]}</span>
      </header>

      {empty ? (
        canEdit ? (
          <AddTile stage={stage} big onFiles={onFiles} />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.08))] px-3 py-6 text-center text-xs text-[var(--p-muted,#9DA3AB)]">
            {stage === 'claim' ? 'Photos sent with a claim stay on the claim.' : 'None yet'}
          </p>
        )
      ) : (
        <div className={twMerge('grid gap-2', grid)}>
          <AnimatePresence initial={false}>
            {items.map((item, i) => (
              <Thumb key={item.id} item={item} index={i} onOpen={() => onOpen(item.id)} />
            ))}
            {uploads.map((u) => (
              <UploadTile key={u.key} upload={u} onRetry={() => onRetry(u)} onDismiss={() => onDismiss(u)} />
            ))}
          </AnimatePresence>
          {canEdit && <AddTile stage={stage} onFiles={onFiles} />}
        </div>
      )}

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 grid place-items-center rounded-2xl bg-[color-mix(in_oklab,var(--p-primary)_10%,transparent)] backdrop-blur-[2px]"
          >
            <motion.span
              initial={{ scale: 0.9, y: 6 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] px-4 py-2 text-xs font-bold text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]"
            >
              <UploadCloud className="h-4 w-4" /> Drop to add to {label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** The Add tile (and, for an empty group, the big drop zone). The file input covers it: iOS ignores clicks on hidden inputs. */
function AddTile({ stage, big, onFiles }: { stage: MediaStage; big?: boolean; onFiles: (stage: MediaStage, files: FileList | null) => void }) {
  const label = MEDIA_STAGE_LABEL[stage].toLowerCase()
  return (
    <label
      className={twMerge(
        'group relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.12))] bg-white/[0.02] text-center text-[var(--p-muted,#9DA3AB)] transition duration-300',
        'hover:border-[color-mix(in_oklab,var(--p-primary)_60%,transparent)] hover:bg-[color-mix(in_oklab,var(--p-primary)_6%,transparent)] hover:text-[var(--p-ink,#fff)]',
        'focus-within:ring-2 focus-within:ring-[var(--p-primary)]',
        big ? 'min-h-36 px-4 py-6' : 'aspect-square',
      )}
    >
      <input
        type="file"
        multiple
        accept={MEDIA_ACCEPT}
        aria-label={`Add ${label} photos or videos`}
        onChange={(e) => {
          onFiles(stage, e.target.files)
          e.target.value = ''
        }}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      {big ? (
        <>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 transition duration-300 group-hover:-translate-y-0.5 group-hover:text-[var(--p-accent,#F9EA1C)]">
            <UploadCloud className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold text-[var(--p-ink,#fff)]">Add {label} photos or videos</span>
          <span className="text-[11px]">
            Drop them here or <span className="font-semibold text-[var(--p-primary,#6DC015)] underline decoration-[color-mix(in_oklab,var(--p-primary)_40%,transparent)] underline-offset-2">browse</span>
          </span>
        </>
      ) : (
        <>
          <Plus className="h-5 w-5 transition duration-300 group-hover:rotate-90" />
          <span className="text-[11px] font-semibold">Add</span>
        </>
      )}
    </label>
  )
}

const tileCls =
  'group relative aspect-square overflow-hidden rounded-xl bg-white/[0.04] ring-1 ring-[var(--p-line,rgba(255,255,255,0.08))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary)]'

/** A thumbnail: the photo (or the video's first frame) fading in once loaded. */
function Thumb({ item, index, onOpen }: { item: MediaItem; index: number; onOpen: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [broken, setBroken] = useState(false)
  const label = MEDIA_STAGE_LABEL[item.stage]
  // Already loaded before hydration (cached): onLoad won't fire.
  const imgRef = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true)
  }, [])
  const videoRef = useCallback((el: HTMLVideoElement | null) => {
    if (el && el.readyState >= 2) setLoaded(true)
  }, [])

  return (
    <motion.button
      type="button"
      layout
      layoutId={`media-${item.id}`}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(index * 0.03, 0.3), layout: { type: 'spring', stiffness: 380, damping: 34 } }}
      whileHover={{ y: -2 }}
      onClick={onOpen}
      aria-label={`Open ${label.toLowerCase()} ${item.kind}${item.caption ? `: ${item.caption}` : ''}`}
      className={tileCls}
    >
      {!loaded && !broken && <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-white/[0.05]" />}
      {broken ? (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[var(--p-muted,#9DA3AB)]">
          <ImageIcon className="h-5 w-5" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">{isHeic(item) ? 'HEIC' : item.kind}</span>
        </span>
      ) : item.kind === 'photo' || item.posterUrl ? (
        <motion.img
          ref={imgRef}
          src={item.kind === 'photo' ? item.url : item.posterUrl!}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          initial={false}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <motion.video
          ref={videoRef}
          src={`${item.playbackUrl ?? item.url}#t=0.1`}
          preload="metadata"
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
          onError={() => setBroken(true)}
          initial={false}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
          className="pointer-events-none h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {item.kind === 'video' && (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-black/45 ring-1 ring-white/25 backdrop-blur transition duration-300 group-hover:scale-110">
            <Play className="h-4 w-4 translate-x-px fill-current text-[var(--p-ink,#fff)]" />
          </span>
        </span>
      )}
      {(item.onRegistration || item.onClaim) && (
        <span
          title={item.onRegistration ? 'On the warranty registration' : 'On a warranty claim'}
          className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full ring-1 backdrop-blur"
          style={tint(item.onRegistration ? 'var(--p-primary, #6DC015)' : MEDIA_TONE.claim)}
        >
          <ShieldCheck className="h-3 w-3" />
        </span>
      )}
      {item.caption && (
        <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-5 text-left text-[10.5px] font-medium text-[var(--p-ink,#fff)]">
          {item.caption}
        </span>
      )}
    </motion.button>
  )
}

/** A file on its way up: its preview, then a progress bar, then "Saving…"; or what went wrong, with Retry. */
function UploadTile({ upload, onRetry, onDismiss }: { upload: Upload; onRetry: () => void; onDismiss: () => void }) {
  const [previewBroken, setPreviewBroken] = useState(false)
  const failed = upload.status === 'error'
  const status = upload.status === 'queued' ? 'Waiting…' : upload.status === 'finishing' ? 'Saving…' : `${upload.progress}%`

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className={tileCls}
      title={upload.file.name}
    >
      {upload.preview && !previewBroken && !(upload.kind === 'photo' && isHeic({ mime: upload.file.type, url: upload.file.name })) ? (
        upload.kind === 'photo' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={upload.preview} alt="" draggable={false} onError={() => setPreviewBroken(true)} className="h-full w-full object-cover opacity-45" />
        ) : (
          <video src={upload.preview} muted playsInline preload="metadata" onError={() => setPreviewBroken(true)} className="h-full w-full object-cover opacity-45" />
        )
      ) : (
        <span className="absolute inset-0 grid place-items-center text-[var(--p-muted,#9DA3AB)]">
          <ImageIcon className="h-5 w-5" />
        </span>
      )}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      {failed ? (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 p-2 text-center">
          <AlertCircle className="h-4 w-4 shrink-0" style={{ color: MEDIA_TONE.claim }} />
          <p className="line-clamp-3 text-[10px] leading-tight text-[var(--p-ink,#fff)]">{upload.error}</p>
          <div className="flex gap-1">
            <button type="button" onClick={onRetry} aria-label={`Try ${upload.file.name} again`} className="grid h-6 w-6 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <RotateCw className="h-3 w-3" />
            </button>
            <button type="button" onClick={onDismiss} aria-label={`Dismiss ${upload.file.name}`} className="grid h-6 w-6 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <X className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-2 bottom-2">
          <p className="mb-1 flex items-center gap-1 text-[10.5px] font-semibold tabular-nums text-[var(--p-ink,#fff)]">
            {upload.status === 'finishing' && <Loader2 className="h-3 w-3 animate-spin" />}
            {status}
          </p>
          <div className="h-1 overflow-hidden rounded-full bg-white/15">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--p-primary,#6DC015)] to-[var(--p-accent,#F9EA1C)] shadow-[0_0_10px_-1px_var(--p-primary,#6DC015)]"
              initial={{ width: 0 }}
              animate={{ width: `${upload.status === 'queued' ? 0 : upload.progress}%` }}
              transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}
