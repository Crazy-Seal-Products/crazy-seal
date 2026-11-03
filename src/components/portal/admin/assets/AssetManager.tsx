'use client'

import React, { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft,
  ChevronRight,
  Clapperboard,
  Copy,
  Folder,
  FolderInput,
  FolderPlus,
  HardDrive,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { dateTime } from '@/lib/portal/admin/format'
import { Badge, Empty, Panel } from '../ui'
import { BUTTON, inputCls } from '../styles'
import {
  createFolder,
  deleteObject,
  encodeUrl,
  errorText,
  fileType,
  formatSize,
  kindOf,
  loadListing,
  moveObjects,
  objectKeys,
  plural,
  PREFIX,
  readDrop,
  sanitizeFolder,
  splitPath,
  startVideoJob,
  videoJobStatus,
  type AssetFile,
  type DropItem,
  type Listing,
} from './lib'
import { FINISHED, updateJobs, useVideoJobs, type VideoJob } from './video-jobs'
import { DropOverlay, Lightbox, Modal, ToastView, type Toast } from './overlays'
import { CheckBox, FileCard, FileTable, FolderTile, SectionLabel, type DropTarget, type FileCtx, type FolderCtx } from './views'
import { UploadPanel, useUploadQueue } from './upload'

const BASE = '/portal/admin/assets/'
const NONE: string[] = []
const POLL_MS = 8000
const PAGE = 200

const iconBtn =
  'grid h-7 w-7 shrink-0 place-items-center rounded-md border border-adm-line bg-adm-input text-adm-soft transition hover:border-adm-blue-bright/60 hover:text-adm-ink disabled:opacity-60'
const smallBtn = (tone: keyof typeof BUTTON = 'default') => twMerge(BUTTON[tone], 'h-7 px-2')

/** Folder a new upload goes to when nobody has typed one: the open folder, or a guess from the file type at the root. */
function autoDestination(path: string, first: File | undefined): string {
  if (path || !first) return path
  if (first.type.startsWith('image/')) return 'images'
  if (first.type.startsWith('video/')) return 'video'
  if (first.type.startsWith('audio/')) return 'audio'
  return ''
}

/**
 * Site Assets: browse the site-assets/ folders in the media bucket, upload
 * (large files go straight to S3), make folders, move, delete, copy CDN
 * links, and run AWS MediaConvert on raw videos. The open folder lives in
 * ?path= so the back button and links work.
 */
export function AssetManager() {
  const segments = splitPath(useSearchParams().get('path'))
  const path = segments.join('/')
  const atRoot = segments.length === 0

  // ─── Listings (cached per folder, '' = the top-level categories) ───────
  const [listings, setListings] = useState<Record<string, Listing>>({})
  const [refreshing, setRefreshing] = useState(false)
  const [startPath] = useState(path)
  const current = listings[path]
  const categories = listings['']?.folders ?? NONE

  useEffect(() => {
    let live = true
    loadListing(path).then((l) => {
      if (live) setListings((m) => ({ ...m, [l.path]: l }))
    })
    return () => {
      live = false
    }
  }, [path])

  useEffect(() => {
    // The sidebar needs the categories even when the page opens inside a folder.
    if (!startPath) return
    loadListing('').then((l) => setListings((m) => (m[''] ? m : { ...m, '': l })))
  }, [startPath])

  // Two or more levels down, the sidebar also lists the open folder's siblings.
  const parent = segments.slice(0, -1).join('/')
  const showSiblings = segments.length > 1
  useEffect(() => {
    if (!showSiblings) return
    let live = true
    loadListing(parent).then((l) => {
      if (live) setListings((m) => (m[l.path] ? m : { ...m, [l.path]: l }))
    })
    return () => {
      live = false
    }
  }, [parent, showSiblings])
  const siblings = showSiblings ? listings[parent]?.folders : undefined

  /** Reloads the categories, the open folder and (when shown) its siblings. */
  async function refresh() {
    setRefreshing(true)
    const paths = [...new Set(['', path, showSiblings ? parent : ''])]
    const fresh = await Promise.all(paths.map(loadListing))
    setListings((m) => ({ ...m, ...Object.fromEntries(fresh.map((l) => [l.path, l])) }))
    setRefreshing(false)
  }

  const go = (next: string[]) => {
    window.history.pushState(null, '', next.length ? `${BASE}?path=${next.map(encodeURIComponent).join('/')}` : BASE)
  }

  // ─── View state ────────────────────────────────────────────────────────
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState({ path: '', q: '' })
  const query = search.path === path ? search.q : ''
  const q = query.trim().toLowerCase()
  const [sel, setSel] = useState({ path: '', keys: NONE })
  const selected = sel.path === path ? sel.keys : NONE
  const select = (keys: string[]) => setSel({ path, keys })

  const allFiles = current?.files ?? []
  const folders = (current?.folders ?? NONE).filter((f) => !q || f.toLowerCase().includes(q))
  const files = q
    ? allFiles.filter((f) => f.name.toLowerCase().includes(q) || fileType(f.name).toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
    : allFiles
  // Big folders (up to 1,000 files) render a page at a time; search, select all and the lightbox still cover every file.
  const [more, setMore] = useState({ key: '', n: PAGE })
  const pageKey = `${path}|${q}`
  const limit = more.key === pageKey ? more.n : PAGE
  const shown = files.length > limit ? files.slice(0, limit) : files
  const selectedFiles = selected.map((k) => allFiles.find((f) => f.key === k)).filter((f): f is AssetFile => !!f)
  const allSelected = files.length > 0 && files.every((f) => selected.includes(f.key))
  const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0)

  const toggle = (key: string) => select(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key])
  const toggleAll = () => select(allSelected ? NONE : files.map((f) => f.key))

  // ─── Toasts, clipboard, audio ──────────────────────────────────────────
  const [toast, setToast] = useState<Toast | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const live = useRef({ toast: 0, copy: 0, audio: null as HTMLAudioElement | null })

  useEffect(() => {
    const l = live.current
    return () => {
      window.clearTimeout(l.toast)
      window.clearTimeout(l.copy)
      l.audio?.pause()
    }
  }, [])

  const notify = (tone: Toast['tone'], title: string, details?: string[], ms = tone === 'ok' ? 4000 : 6000) => {
    window.clearTimeout(live.current.toast)
    setToast({ tone, title, details })
    if (ms) live.current.toast = window.setTimeout(() => setToast(null), ms)
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(encodeUrl(url))
      setCopied(url)
      window.clearTimeout(live.current.copy)
      live.current.copy = window.setTimeout(() => setCopied(null), 2000)
    } catch {
      notify('err', 'Copy failed', ['The browser blocked clipboard access.'])
    }
  }

  const copySelected = async () => {
    if (!selectedFiles.length) return
    try {
      await navigator.clipboard.writeText(selectedFiles.map((f) => encodeUrl(f.url)).join('\n'))
      notify('ok', `Copied ${plural(selectedFiles.length, 'link')}`, undefined, 3000)
    } catch {
      notify('err', 'Copy failed', ['The browser blocked clipboard access.'])
    }
  }

  const toggleAudio = (f: AssetFile) => {
    const l = live.current
    if (playing === f.key) {
      l.audio?.pause()
      setPlaying(null)
      return
    }
    if (!l.audio) {
      l.audio = new Audio()
      l.audio.addEventListener('ended', () => setPlaying(null))
    }
    l.audio.pause()
    l.audio.src = f.url
    setPlaying(f.key)
    l.audio.play().catch(() => setPlaying(null))
  }

  // ─── Image sizes and lightbox ──────────────────────────────────────────
  const [dims, setDims] = useState<Record<string, { w: number; h: number }>>({})
  const onDims = (key: string, w: number, h: number) => {
    if (w > 0) setDims((d) => (d[key] ? d : { ...d, [key]: { w, h } }))
  }
  const [lightbox, setLightbox] = useState<string | null>(null)
  const images = files.filter((f) => kindOf(f) === 'image')
  const lightboxIndex = lightbox ? images.findIndex((f) => f.key === lightbox) : -1

  // ─── Delete and move ───────────────────────────────────────────────────
  const [busy, setBusy] = useState<string[]>(NONE)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [dragging, setDragging] = useState<string[]>(NONE)
  const [dragOver, setDragOver] = useState<string | null>(null)

  async function runDelete() {
    const targets = selectedFiles
    setConfirmDelete(false)
    setBusy(targets.map((f) => f.key))
    const deleted: string[] = []
    const errors: string[] = []
    for (const f of targets) {
      try {
        for (const key of objectKeys(f)) await deleteObject(key)
        deleted.push(f.key)
      } catch (e) {
        errors.push(`${f.name}: ${errorText(e)}`)
      }
    }
    await refresh()
    setBusy(NONE)
    select(NONE)
    if (!errors.length) notify('ok', `${plural(deleted.length, 'file')} deleted`)
    else if (deleted.length) notify('err', `${deleted.length} deleted, ${errors.length} failed`, errors, 0)
    else notify('err', 'Delete failed', errors)
  }

  async function moveFiles(targets: AssetFile[], destination: string) {
    const target = splitPath(destination).join('/')
    if (!targets.length) return
    if (!target) return notify('err', 'Choose a folder to move to', ['Files can’t sit in the site-assets root.'])
    if (target === path) return notify('err', 'Those files are already in this folder')
    const keys = targets.flatMap(objectKeys)
    setBusy(targets.map((f) => f.key))
    try {
      const r = await moveObjects(keys, target)
      await refresh()
      select(NONE)
      const errors = r.errors ?? []
      if (!errors.length) notify('ok', `${plural(targets.length, 'file')} moved to ${PREFIX}${target}/`)
      else notify('err', `Moved ${r.movedCount} of ${keys.length} objects`, errors, 0)
    } catch (e) {
      notify('err', 'Failed to move files', [errorText(e)])
    } finally {
      setBusy(NONE)
    }
  }

  const onDragStart = (f: AssetFile, e: React.DragEvent) => {
    const keys = selected.includes(f.key) ? selected : [f.key]
    setDragging(keys)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('application/x-cs-asset', keys.join('\n'))
  }
  const onDragEnd = () => {
    setDragging(NONE)
    setDragOver(null)
  }
  /** Drop handlers that move the dragged files into `dest`. */
  const dropOn = (dest: string[]): DropTarget => {
    const id = dest.join('/')
    return {
      over: dragOver === id,
      props: {
        onDragOver: (e) => {
          if (!dragging.length || id === path) return
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
          if (dragOver !== id) setDragOver(id)
        },
        onDragLeave: () => setDragOver((o) => (o === id ? null : o)),
        onDrop: (e) => {
          if (!dragging.length || id === path) return
          e.preventDefault()
          e.stopPropagation()
          const targets = dragging.map((k) => allFiles.find((f) => f.key === k)).filter((f): f is AssetFile => !!f)
          onDragEnd()
          void moveFiles(targets, id)
        },
      },
    }
  }

  // ─── New folder ────────────────────────────────────────────────────────
  const [newFolder, setNewFolder] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const newFolderName = (newFolder ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-')

  async function runCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newFolder?.trim()) return
    setCreating(true)
    try {
      await createFolder(newFolder.trim(), segments)
      await refresh()
      setNewFolder(null)
      notify('ok', `Folder “${newFolderName}” created`, [`${PREFIX}${[...segments, newFolderName].join('/')}/`], 3000)
    } catch (err) {
      notify('err', 'Failed to create folder', [errorText(err)])
    } finally {
      setCreating(false)
    }
  }

  // ─── Upload ────────────────────────────────────────────────────────────
  const upload = useUploadQueue()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [destInput, setDestInput] = useState<string | null>(null)
  const destination = destInput ?? autoDestination(path, upload.queue[0]?.file)
  const [dropping, setDropping] = useState(false)

  useEffect(() => {
    // Files dragged in from the desktop anywhere on the page open the drop overlay.
    const onEnter = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) setDropping(true)
    }
    window.addEventListener('dragenter', onEnter)
    return () => window.removeEventListener('dragenter', onEnter)
  }, [])

  const addFiles = (items: DropItem[]) => {
    if (!items.length) return
    upload.add(items)
    setUploadOpen(true)
  }

  async function onDropFiles(dt: DataTransfer) {
    setDropping(false)
    if (upload.uploading) return notify('err', 'An upload is already running', ['Add more files once it finishes.'])
    try {
      addFiles(await readDropSafe(dt))
    } catch (e) {
      notify('err', 'Couldn’t read the dropped files', [errorText(e)])
    }
  }

  async function runUpload() {
    const dest = sanitizeFolder(destination)
    if (!upload.queue.length || !dest) return notify('err', 'Upload error', ['Choose at least one file and a destination folder.'])
    try {
      const { uploaded, errors } = await upload.start(destination)
      await refresh()
      if (!errors.length) {
        setDestInput(null)
        notify('ok', `${plural(uploaded, 'file')} uploaded`, [`to ${PREFIX}${dest}/`])
      } else if (uploaded) notify('err', `${uploaded} uploaded, ${errors.length} failed`, errors, 0)
      else notify('err', 'Upload failed', errors)
    } catch (e) {
      notify('err', 'Upload failed', [errorText(e)])
    }
  }

  // ─── MediaConvert ──────────────────────────────────────────────────────
  const jobs = useVideoJobs()
  const [starting, setStarting] = useState<string[]>(NONE)

  async function processVideo(f: AssetFile) {
    setStarting((s) => [...s, f.key])
    try {
      const r = await startVideoJob(f.key, f.name)
      if (!r.jobId) throw new Error('MediaConvert did not return a job ID')
      const job: VideoJob = { id: r.jobId, name: f.name, key: f.key, folder: f.category || path, startedAt: new Date().toISOString(), status: r.status ?? 'SUBMITTED' }
      updateJobs((prev) => [job, ...prev.filter((j) => j.id !== job.id)])
      notify('ok', 'Video processing started', [`Job ID: ${r.jobId}`, 'Outputs: thumbnail, original, 1080p, 720p', `They land in ${PREFIX}${job.folder}/processed/ in 2–5 minutes.`], 8000)
    } catch (e) {
      notify('err', 'Failed to process video', [errorText(e)])
    } finally {
      setStarting((s) => s.filter((k) => k !== f.key))
    }
  }

  const activeJobs = jobs
    .filter((j) => !FINISHED.has(j.status))
    .map((j) => j.id)
    .join(',')
  const onJobFinished = useEffectEvent(() => {
    void refresh()
  })

  useEffect(() => {
    if (!activeJobs) return
    const ids = activeJobs.split(',')
    const timer = window.setInterval(async () => {
      const results = await Promise.all(
        ids.map((id) =>
          videoJobStatus(id).then(
            (r) => ({ id, status: r.status, percent: r.percentComplete, error: r.errorMessage }),
            (e) => ({ id, status: undefined, percent: undefined, error: errorText(e) }),
          ),
        ),
      )
      let finished = false
      updateJobs((prev) =>
        prev.map((j) => {
          const r = results.find((x) => x.id === j.id)
          if (!r) return j
          // A job MediaConvert doesn't know (e.g. another AWS account or region) will never finish: stop polling it.
          const status = r.status ?? (/not found/i.test(r.error ?? '') ? 'ERROR' : j.status)
          if (FINISHED.has(status) && !FINISHED.has(j.status)) finished = true
          return { ...j, status, percent: r.percent ?? j.percent, error: r.error }
        }),
      )
      if (finished) onJobFinished()
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [activeJobs])

  // ─── Render ────────────────────────────────────────────────────────────
  const fileCtx: FileCtx = {
    selected,
    busy,
    dragging,
    copied,
    playing,
    jobs,
    starting,
    dims,
    onToggle: toggle,
    onCopy: copy,
    onPreview: (f) => setLightbox(f.key),
    onAudio: toggleAudio,
    onProcess: (f) => void processVideo(f),
    onDims,
    onDragStart,
    onDragEnd,
    onOpenFolder: (p) => go(splitPath(p)),
  }
  const folderCtx: FolderCtx = {
    open: (name) => go([...segments, name]),
    target: (name) => dropOn([...segments, name]),
  }

  const openUploadHere = () => {
    setDestInput(null)
    setUploadOpen(true)
  }

  const summary = !current
    ? 'Loading…'
    : atRoot
      ? plural(current.folders.length, 'category')
      : q
        ? `${plural(folders.length + files.length, 'match')} of ${(current.folders.length + allFiles.length).toLocaleString()}`
        : [current.folders.length && plural(current.folders.length, 'folder'), plural(allFiles.length, 'file'), allFiles.length && formatSize(totalSize)].filter(Boolean).join(' · ')

  let body: React.ReactNode
  if (!current) {
    body = (
      <p className="flex items-center justify-center gap-2 px-3 py-12 text-[12.5px] text-adm-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading {atRoot ? 'categories' : `${PREFIX}${path}/`}…
      </p>
    )
  } else if (current.error) {
    body = (
      <div className="px-3 py-10 text-center">
        <p className="text-[12.5px] font-medium text-adm-red">Couldn’t load this folder: {current.error}</p>
        <button type="button" onClick={() => void refresh()} className={twMerge(smallBtn(), 'mt-3')}>
          <RefreshCw className="h-3.5 w-3.5" /> Try again
        </button>
      </div>
    )
  } else if (!folders.length && !files.length) {
    body = q ? (
      <div className="px-3 py-10 text-center">
        <p className="text-[12.5px] text-adm-muted">No matches for “{query}” in this folder.</p>
        <button type="button" onClick={() => setSearch({ path, q: '' })} className={twMerge(smallBtn(), 'mt-3')}>
          Clear search
        </button>
      </div>
    ) : atRoot ? (
      <Empty>No folders yet. Use New folder, or upload files into a folder name.</Empty>
    ) : (
      <div className="px-3 py-10 text-center">
        <p className="text-[12.5px] text-adm-muted">Nothing in {PREFIX}{path}/ yet.</p>
        <button type="button" onClick={openUploadHere} className={twMerge(smallBtn('gold'), 'mt-3')}>
          <Upload className="h-3.5 w-3.5" /> Upload here
        </button>
      </div>
    )
  } else if (view === 'list') {
    body = <FileTable folders={folders} files={shown} ctx={fileCtx} folderCtx={folderCtx} />
  } else {
    body = (
      <div className="space-y-3 p-2.5">
        {folders.length > 0 && (
          <div>
            <SectionLabel>{atRoot ? 'Categories' : 'Folders'}</SectionLabel>
            <div className="grid grid-cols-2 gap-1.5 @xl:grid-cols-3 @4xl:grid-cols-4">
              {folders.map((name) => (
                <FolderTile key={name} name={name} ctx={folderCtx} />
              ))}
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div>
            <SectionLabel>Files</SectionLabel>
            <div className="grid grid-cols-2 gap-2 @xl:grid-cols-3 @4xl:grid-cols-4 @6xl:grid-cols-5">
              {shown.map((f) => (
                <FileCard key={f.key} file={f} ctx={fileCtx} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {/* Breadcrumb, search, upload */}
      <div className="flex flex-wrap items-center gap-2">
        <nav aria-label="Folder" className="flex min-w-0 flex-1 basis-full flex-wrap items-center gap-0.5 sm:basis-0">
          {!atRoot && (
            <button type="button" onClick={() => go(segments.slice(0, -1))} aria-label="Up one folder" title="Up one folder" className={twMerge(iconBtn, 'mr-1')}>
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
          )}
          <Crumb current={atRoot} onClick={() => go([])}>
            <HardDrive className="h-3.5 w-3.5 opacity-70" />
            site-assets
          </Crumb>
          {segments.map((s, i) => {
            const last = i === segments.length - 1
            const target = last ? null : dropOn(segments.slice(0, i + 1))
            return (
              <React.Fragment key={i}>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-adm-faint" />
                <Crumb current={last} over={target?.over} onClick={() => go(segments.slice(0, i + 1))} {...target?.props}>
                  {s}
                </Crumb>
              </React.Fragment>
            )
          })}
        </nav>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-faint" />
            <input
              value={query}
              onChange={(e) => setSearch({ path, q: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearch({ path, q: '' })
              }}
              placeholder="Search this folder…"
              aria-label="Search this folder by name, type or folder"
              className={twMerge(inputCls, 'pl-8 pr-7')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setSearch({ path, q: '' })}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-adm-faint transition hover:text-adm-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button type="button" onClick={() => setUploadOpen((o) => !o)} aria-expanded={uploadOpen} className={twMerge(BUTTON.gold, 'shrink-0')}>
            <Upload className="h-3.5 w-3.5" /> Upload
          </button>
        </div>
      </div>

      {uploadOpen && (
        <UploadPanel
          upload={upload}
          destination={destination}
          onDestination={setDestInput}
          onSubmit={() => void runUpload()}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {jobs.length > 0 && <JobsPanel jobs={jobs} onOpen={go} />}

      <div className="grid items-start gap-2.5 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <Panel title="Folders" className="hidden lg:sticky lg:top-[3.75rem] lg:flex" bodyClassName="max-h-[calc(100vh-7.5rem)] overflow-y-auto p-1.5">
          <SideLink active={atRoot} onClick={() => go([])}>
            <HardDrive className="h-3.5 w-3.5 shrink-0 opacity-70" />
            <span className="min-w-0 flex-1 truncate">All categories</span>
          </SideLink>
          {!listings[''] ? (
            <p className="flex items-center gap-2 px-2 py-2 text-[12px] text-adm-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
            </p>
          ) : (
            categories.map((c) => {
              const target = dropOn([c])
              return (
                <SideLink key={c} active={segments[0] === c} over={target.over} onClick={() => go([c])} {...target.props}>
                  <Folder className="h-3.5 w-3.5 shrink-0 fill-adm-blue-bright/15 text-adm-blue-bright" />
                  <span className="min-w-0 flex-1 truncate" title={c}>
                    {c}
                  </span>
                </SideLink>
              )
            })
          )}
          {showSiblings && (
            <div className="mt-1.5 border-t border-adm-line-soft pt-1.5">
              <p className="truncate px-2 pb-1 pt-0.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-adm-muted" title={`${PREFIX}${parent}/`}>
                In {segments[segments.length - 2]}
              </p>
              {!siblings ? (
                <p className="flex items-center gap-2 px-2 py-2 text-[12px] text-adm-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
                </p>
              ) : (
                siblings.map((s) => {
                  const dest = [...segments.slice(0, -1), s]
                  const target = dropOn(dest)
                  return (
                    <SideLink key={s} active={s === segments[segments.length - 1]} over={target.over} onClick={() => go(dest)} {...target.props}>
                      <Folder className="h-3.5 w-3.5 shrink-0 fill-adm-blue-bright/15 text-adm-blue-bright" />
                      <span className="min-w-0 flex-1 truncate" title={s}>
                        {s}
                      </span>
                    </SideLink>
                  )
                })
              )}
            </div>
          )}
        </Panel>

        <Panel
          title={atRoot ? 'All categories' : segments[segments.length - 1]}
          meta={summary}
          actions={
            <>
              <button type="button" onClick={() => void refresh()} disabled={refreshing} aria-label="Refresh" title="Refresh" className={iconBtn}>
                <RefreshCw className={twMerge('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              </button>
              <button
                type="button"
                onClick={() => setNewFolder((v) => (v === null ? '' : null))}
                aria-expanded={newFolder !== null}
                title={`New folder in ${PREFIX}${path ? `${path}/` : ''}`}
                className={smallBtn()}
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span className="hidden @md:inline">New folder</span>
              </button>
              <span className="flex rounded-md border border-adm-line bg-adm-input p-0.5" role="group" aria-label="View">
                {(
                  [
                    ['grid', LayoutGrid, 'Grid view'],
                    ['list', List, 'List view'],
                  ] as const
                ).map(([v, Icon, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setView(v)}
                    aria-pressed={view === v}
                    aria-label={label}
                    title={label}
                    className={twMerge(
                      'grid h-6 w-6 place-items-center rounded transition',
                      view === v ? 'bg-gradient-to-b from-adm-gold-bright to-adm-gold text-adm-gold-ink' : 'text-adm-soft hover:text-adm-ink',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </span>
            </>
          }
        >
          {newFolder !== null && (
            <form onSubmit={runCreate} className="flex flex-wrap items-center gap-2 border-b border-adm-line px-3 py-2">
              <FolderPlus className="h-4 w-4 shrink-0 text-adm-muted" />
              <input
                autoFocus
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setNewFolder(null)
                }}
                placeholder="Folder name"
                aria-label="New folder name"
                className={twMerge(inputCls, 'h-7 w-auto min-w-0 flex-1 basis-40')}
              />
              <span className="flex gap-1.5">
                <button type="submit" disabled={!newFolder.trim() || creating} className={smallBtn('gold')}>
                  {creating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create
                </button>
                <button type="button" onClick={() => setNewFolder(null)} className={smallBtn()}>
                  Cancel
                </button>
              </span>
              <p className="basis-full truncate text-[11px] text-adm-muted">
                {newFolderName ? `Creates ${PREFIX}${[...segments, newFolderName].join('/')}/` : 'Lowercase letters, numbers and dashes.'}
              </p>
            </form>
          )}

          {allFiles.length > 0 && !current?.error && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-adm-line bg-adm-head px-3 py-1.5">
              <button type="button" onClick={toggleAll} disabled={!files.length} className="flex items-center gap-2 text-[12px] font-medium text-adm-soft transition hover:text-adm-ink">
                <CheckBox checked={allSelected} mixed={!allSelected && selected.length > 0} />
                {selected.length ? `${selected.length.toLocaleString()} of ${allFiles.length.toLocaleString()} selected` : `Select all (${files.length.toLocaleString()})`}
              </button>
              {selected.length > 0 && (
                <>
                  <span className="hidden text-[11.5px] text-adm-faint @3xl:inline">Drag onto a folder to move</span>
                  <span className="ml-auto flex flex-wrap gap-1.5">
                    <button type="button" onClick={() => void copySelected()} className={smallBtn()}>
                      <Copy className="h-3.5 w-3.5" /> Copy {plural(selected.length, 'link')}
                    </button>
                    <button type="button" onClick={() => setMoveOpen(true)} disabled={busy.length > 0} className={smallBtn()}>
                      <FolderInput className="h-3.5 w-3.5" /> Move
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(true)} disabled={busy.length > 0} className={smallBtn('danger')}>
                      {busy.length > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      {busy.length > 0 ? 'Working…' : `Delete ${selected.length.toLocaleString()}`}
                    </button>
                  </span>
                </>
              )}
            </div>
          )}

          {current?.truncated && (
            <p className="border-b border-adm-line bg-amber-400/[0.06] px-3 py-1.5 text-[11.5px] text-adm-warn">
              This folder has more than 1,000 items. S3 lists only the first 1,000 (A to Z), so some files aren’t shown here.
            </p>
          )}

          {body}

          {shown.length < files.length && (
            <div className="flex flex-wrap items-center justify-center gap-2 border-t border-adm-line px-3 py-2.5 text-[12px] text-adm-muted">
              <span>
                Showing {shown.length.toLocaleString()} of {plural(files.length, 'file')}
              </span>
              <button type="button" onClick={() => setMore({ key: pageKey, n: limit + PAGE })} className={smallBtn()}>
                Show {Math.min(PAGE, files.length - shown.length).toLocaleString()} more
              </button>
              <button type="button" onClick={() => setMore({ key: pageKey, n: files.length })} className={smallBtn()}>
                Show all
              </button>
            </div>
          )}
        </Panel>
      </div>

      {toast && <ToastView toast={toast} onClose={() => setToast(null)} />}

      {dropping && <DropOverlay destination={`Adds them to the upload list for ${PREFIX}${sanitizeFolder(destination) || '…'}/`} onDrop={(dt) => void onDropFiles(dt)} onCancel={() => setDropping(false)} />}

      {lightboxIndex >= 0 && <Lightbox files={images} index={lightboxIndex} onIndex={(i) => setLightbox(images[i].key)} onClose={() => setLightbox(null)} onCopy={copy} copied={copied} />}

      {confirmDelete && (
        <Modal title={`Delete ${plural(selectedFiles.length, 'file')}?`} icon={<Trash2 className="h-4 w-4 shrink-0 text-adm-red" />} onClose={() => setConfirmDelete(false)}>
          <div className="space-y-2.5 px-4 py-3 text-[12.5px] text-adm-text">
            <p>
              They come off media.crazyseal.com right away, and any page that links to them will show a broken image or video. This can’t be undone.
            </p>
            {selectedFiles.some((f) => f.variants?.length) && <p className="text-adm-muted">Processed videos lose every version (original, 1080p, 720p and thumbnail).</p>}
            <ul className="max-h-36 overflow-y-auto rounded-md border border-adm-line px-2.5 py-1.5 text-[12px] text-adm-muted">
              {selectedFiles.map((f) => (
                <li key={f.key} className="truncate">
                  {f.name}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end gap-2 border-t border-adm-line px-4 py-2.5">
            <button type="button" onClick={() => setConfirmDelete(false)} className={BUTTON.default}>
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void runDelete()}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-red-600 px-3 text-[12px] font-semibold text-white transition hover:bg-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </Modal>
      )}

      {moveOpen && (
        <MoveDialog
          count={selectedFiles.length}
          segments={segments}
          folders={current?.folders ?? NONE}
          categories={categories}
          onClose={() => setMoveOpen(false)}
          onMove={(dest) => {
            setMoveOpen(false)
            void moveFiles(selectedFiles, dest)
          }}
        />
      )}
    </div>
  )
}

/**
 * Reads a drop, falling back to the plain file list if a folder can't be
 * walked. Must be called inside the drop event: readDrop takes the entries
 * before its first await.
 */
async function readDropSafe(dt: DataTransfer): Promise<DropItem[]> {
  const plain = Array.from(dt.files).map((file) => ({ file, relativePath: file.name }))
  try {
    const items = await readDrop(dt)
    return items.length ? items : plain
  } catch {
    return plain
  }
}

function Crumb({
  current,
  over,
  children,
  ...rest
}: { current?: boolean; over?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-current={current ? 'page' : undefined}
      {...rest}
      className={twMerge(
        'inline-flex min-w-0 max-w-full items-center gap-1.5 truncate rounded px-1.5 py-1 text-[12.5px] font-medium transition',
        current ? 'font-semibold text-adm-ink' : 'text-adm-soft hover:bg-adm-ink/[0.05] hover:text-adm-ink',
        over && 'bg-adm-gold/15 text-adm-ink ring-1 ring-adm-gold',
      )}
    >
      {children}
    </button>
  )
}

function SideLink({
  active,
  over,
  children,
  ...rest
}: { active: boolean; over?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      {...rest}
      className={twMerge(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] font-medium transition',
        active ? 'bg-adm-blue-bright/12 text-adm-ink' : 'text-adm-soft hover:bg-adm-ink/[0.05] hover:text-adm-ink',
        over && 'bg-adm-gold/15 text-adm-ink ring-1 ring-adm-gold',
      )}
    >
      {children}
    </button>
  )
}

const JOB_BADGE: Record<string, { tone: 'good' | 'warn' | 'bad' | 'neutral'; label: string }> = {
  SUBMITTED: { tone: 'neutral', label: 'Queued' },
  PROGRESSING: { tone: 'warn', label: 'Processing' },
  COMPLETE: { tone: 'good', label: 'Complete' },
  ERROR: { tone: 'bad', label: 'Failed' },
  CANCELED: { tone: 'bad', label: 'Canceled' },
}

function JobsPanel({ jobs, onOpen }: { jobs: VideoJob[]; onOpen: (segments: string[]) => void }) {
  const anyFinished = jobs.some((j) => FINISHED.has(j.status))
  return (
    <Panel
      title="Video processing"
      meta={<span className="hidden @xl:inline">AWS MediaConvert · status updates every few seconds</span>}
      tone="dealers"
      actions={
        anyFinished && (
          <button type="button" onClick={() => updateJobs((prev) => prev.filter((j) => !FINISHED.has(j.status)))} className={smallBtn()}>
            Clear finished
          </button>
        )
      }
    >
      <ul className="divide-y divide-adm-line-soft">
        {jobs.map((j) => {
          const badge = JOB_BADGE[j.status] ?? { tone: 'neutral' as const, label: j.status }
          return (
            <li key={j.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
              <Clapperboard className="h-4 w-4 shrink-0 text-adm-muted" />
              <span className="min-w-0 flex-1 basis-48">
                <span className="block truncate text-[12.5px] font-medium text-adm-ink" title={j.name}>
                  {j.name}
                </span>
                <span className="block truncate text-[11px] text-adm-muted" title={`Job ${j.id}`}>
                  {PREFIX}
                  {j.folder}/ · started {dateTime(j.startedAt)}
                </span>
                {j.error && <span className="block truncate text-[11px] text-adm-red" title={j.error}>{j.error}</span>}
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <Badge tone={badge.tone}>
                  {badge.label}
                  {j.status === 'PROGRESSING' && j.percent != null && ` ${j.percent}%`}
                </Badge>
                {j.status === 'COMPLETE' && (
                  <button type="button" onClick={() => onOpen([...splitPath(j.folder), 'processed'])} className={smallBtn()}>
                    Open processed
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => updateJobs((prev) => prev.filter((x) => x.id !== j.id))}
                  aria-label={`Dismiss ${j.name}`}
                  className="grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

function MoveDialog({
  count,
  segments,
  folders,
  categories,
  onClose,
  onMove,
}: {
  count: number
  segments: string[]
  folders: string[]
  categories: string[]
  onClose: () => void
  onMove: (dest: string) => void
}) {
  const [dest, setDest] = useState('')
  const here = segments.join('/')
  const picks = [
    ...(segments.length > 1 ? [{ path: segments.slice(0, -1).join('/'), label: `↑ ${segments.slice(0, -1).join('/')}` }] : []),
    ...folders.map((f) => ({ path: [...segments, f].join('/'), label: f })),
    ...categories.map((c) => ({ path: c, label: `${c} (category)` })),
  ].filter((p, i, all) => p.path !== here && all.findIndex((x) => x.path === p.path) === i)
  const target = splitPath(dest).join('/')
  return (
    <Modal title={`Move ${plural(count, 'file')}`} icon={<FolderInput className="h-4 w-4 shrink-0 text-adm-blue-bright" />} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (target && target !== here) onMove(target)
        }}
      >
        <div className="space-y-2.5 px-4 py-3">
          <label className="block space-y-1 text-[11px] font-medium text-adm-muted">
            <span>Destination folder</span>
            <span className="flex">
              <span className="inline-flex h-8 shrink-0 items-center rounded-l-md border border-r-0 border-adm-line bg-adm-head px-2 text-[12px] text-adm-muted">{PREFIX}</span>
              <input autoFocus value={dest} onChange={(e) => setDest(e.target.value)} placeholder="e.g. images/brand" className={twMerge(inputCls, 'min-w-0 rounded-l-none')} />
            </span>
          </label>
          {picks.length > 0 && (
            <div className="flex max-h-36 flex-wrap gap-1.5 overflow-y-auto">
              {picks.map((p) => (
                <button
                  key={p.path}
                  type="button"
                  onClick={() => setDest(p.path)}
                  className={twMerge(
                    'max-w-full truncate rounded px-2 py-1 text-[11.5px] font-medium ring-1 ring-inset transition',
                    target === p.path ? 'bg-adm-blue-bright/15 text-adm-ink ring-adm-blue-bright/60' : 'bg-adm-ink/[0.04] text-adm-soft ring-adm-ink/10 hover:text-adm-ink',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <p className="text-[11.5px] leading-snug text-adm-muted">
            A file with the same name in that folder is replaced. New folder names are created as you type them. Links to the old location stop working.
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-adm-line px-4 py-2.5">
          <button type="button" onClick={onClose} className={BUTTON.default}>
            Cancel
          </button>
          <button type="submit" disabled={!target || target === here} className={BUTTON.gold}>
            <FolderInput className="h-3.5 w-3.5" /> Move here
          </button>
        </div>
      </form>
    </Modal>
  )
}
