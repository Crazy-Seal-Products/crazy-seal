'use client'

import React, { useRef, useState } from 'react'
import { FolderUp, Loader2, Upload, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { uploadMultipleSiteAssetsWithPaths } from '@/lib/storage/site-assets'
import { Panel } from '../ui'
import { BUTTON, inputCls, labelCls } from '../styles'
import { formatSize, kindOf, plural, PREFIX, sanitizeFolder, type DropItem } from './lib'
import { KindIcon } from './views'

/** Files over this size go straight to S3 with a presigned link (same cut-off as lib/storage/site-assets). */
const DIRECT_TO_S3 = 4 * 1024 * 1024

type QueueStatus = 'pending' | 'uploading' | 'success' | 'error'
export type QueueItem = DropItem & { status: QueueStatus; progress: number; error?: string }

export function useUploadQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [uploading, setUploading] = useState(false)

  const patch = (relativePath: string, p: Partial<QueueItem>) =>
    setQueue((prev) => prev.map((q) => (q.relativePath === relativePath ? { ...q, ...p } : q)))

  /** Adds files, replacing any with the same path and dropping ones already uploaded. */
  const add = (items: DropItem[]) =>
    setQueue((prev) => {
      const incoming = new Map(items.map((i) => [i.relativePath, i]))
      const kept = prev.filter((q) => q.status !== 'success' && !incoming.has(q.relativePath))
      return [...kept, ...[...incoming.values()].map((i) => ({ ...i, status: 'pending' as const, progress: 0 }))]
    })

  const remove = (relativePath: string) => setQueue((prev) => prev.filter((q) => q.relativePath !== relativePath))
  const clear = () => setQueue([])

  /**
   * Uploads everything not yet uploaded, one file at a time: small files
   * through /api/admin/assets/upload, large ones to S3 via
   * /api/admin/assets/presigned. Clears the list when all succeed.
   */
  async function start(destination: string): Promise<{ uploaded: number; errors: string[] }> {
    const todo = queue.filter((q) => q.status !== 'success')
    setUploading(true)
    try {
      const results = await uploadMultipleSiteAssetsWithPaths(
        destination,
        todo.map(({ file, relativePath }) => ({ file, relativePath })),
        undefined,
        (name, status, progress) =>
          patch(name, status === 'error' ? { status } : { status, progress: status === 'success' ? 100 : (progress ?? 0), error: undefined }),
      )
      const errors: string[] = []
      results.forEach((r, i) => {
        if (!r.error) return
        errors.push(`${todo[i].relativePath}: ${r.error}`)
        patch(todo[i].relativePath, { status: 'error', error: r.error })
      })
      if (!errors.length) setQueue([])
      return { uploaded: results.length - errors.length, errors }
    } finally {
      setUploading(false)
    }
  }

  return { queue, uploading, add, remove, clear, start }
}

export type UploadQueue = ReturnType<typeof useUploadQueue>

export function UploadPanel({
  upload,
  destination,
  onDestination,
  onSubmit,
  onClose,
}: {
  upload: UploadQueue
  destination: string
  onDestination: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}) {
  const filesRef = useRef<HTMLInputElement | null>(null)
  const folderRef = useRef<HTMLInputElement | null>(null)
  const { queue, uploading } = upload
  const dest = sanitizeFolder(destination)
  const todo = queue.filter((q) => q.status !== 'success')
  const total = todo.reduce((sum, q) => sum + q.file.size, 0)
  const done = queue.filter((q) => q.status === 'success').length

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = Array.from(e.target.files ?? [])
    if (list.length) upload.add(list.map((file) => ({ file, relativePath: file.webkitRelativePath || file.name })))
    e.target.value = ''
  }

  return (
    <Panel
      title="Upload files"
      meta={dest ? `to ${PREFIX}${dest}/` : 'choose a destination folder'}
      tone="sales"
      actions={
        <button type="button" onClick={onClose} aria-label="Close upload" className="grid h-7 w-7 place-items-center rounded-md text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-ink">
          <X className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid gap-3 p-3 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="min-w-0 space-y-2.5">
          <label className={labelCls}>
            <span>Destination folder</span>
            <span className="flex">
              <span className="inline-flex h-8 shrink-0 items-center rounded-l-md border border-r-0 border-adm-line bg-adm-head px-2 text-[12px] text-adm-muted">{PREFIX}</span>
              <input
                value={destination}
                onChange={(e) => onDestination(e.target.value)}
                disabled={uploading}
                placeholder="e.g. video/marketing or images/brand"
                className={twMerge(inputCls, 'min-w-0 rounded-l-none')}
              />
            </span>
          </label>
          <p className="text-[11.5px] leading-snug text-adm-muted">
            Use slashes for nested folders. Names are lowercased, and spaces or symbols become dashes. A file with the same name in that folder is replaced.
          </p>
          <div className="rounded-lg border border-dashed border-adm-line bg-adm-ink/[0.025] px-4 py-5 text-center">
            <span className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-adm-blue-bright/12 text-adm-blue-bright">
              <Upload className="h-5 w-5" />
            </span>
            <p className="text-[12.5px] font-medium text-adm-ink">Drag files or folders anywhere on this page</p>
            <p className="mb-3 text-[11.5px] text-adm-muted">Files over 4 MB go straight to S3, so large videos are fine.</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              <input ref={filesRef} type="file" multiple hidden onChange={pick} />
              <input
                ref={(el) => {
                  folderRef.current = el
                  if (el) el.webkitdirectory = true
                }}
                type="file"
                multiple
                hidden
                onChange={pick}
              />
              <button type="button" disabled={uploading} onClick={() => filesRef.current?.click()} className={BUTTON.default}>
                <Upload className="h-3.5 w-3.5" /> Choose files
              </button>
              <button type="button" disabled={uploading} onClick={() => folderRef.current?.click()} className={BUTTON.default}>
                <FolderUp className="h-3.5 w-3.5" /> Choose folder
              </button>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {queue.length ? (
            <ul className="max-h-72 divide-y divide-adm-line-soft overflow-y-auto rounded-lg border border-adm-line">
              {queue.map((q) => (
                <li key={q.relativePath} className="flex items-center gap-2.5 px-2.5 py-1.5">
                  <KindIcon kind={kindOf({ name: q.file.name })} className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] text-adm-ink" title={q.relativePath}>
                      {q.relativePath}
                    </span>
                    <span className="flex items-center gap-2 text-[11px] text-adm-muted">
                      <span className="shrink-0">
                        {formatSize(q.file.size)}
                        {q.file.size > DIRECT_TO_S3 && ' · direct to S3'}
                      </span>
                      {q.status === 'uploading' && (
                        <>
                          <span className="h-1 min-w-8 flex-1 overflow-hidden rounded-full bg-adm-ink/10">
                            <span className="block h-full rounded-full bg-adm-blue-bright transition-[width]" style={{ width: `${q.progress}%` }} />
                          </span>
                          <span className="shrink-0 tabular-nums">{q.progress}%</span>
                        </>
                      )}
                      {q.status === 'success' && <span className="text-adm-green">Uploaded</span>}
                      {q.status === 'error' && (
                        <span className="truncate text-adm-red" title={q.error}>
                          Failed{q.error ? `: ${q.error}` : ''}
                        </span>
                      )}
                    </span>
                  </span>
                  {!uploading && q.status !== 'success' && (
                    <button
                      type="button"
                      onClick={() => upload.remove(q.relativePath)}
                      aria-label={`Remove ${q.relativePath}`}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded text-adm-muted transition hover:bg-adm-ink/[0.06] hover:text-adm-red"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="grid h-full min-h-24 place-items-center rounded-lg border border-adm-line px-3 py-6 text-center text-[12.5px] text-adm-muted">
              No files chosen yet.
            </p>
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-adm-line px-3 py-2">
        <button type="button" onClick={onSubmit} disabled={!todo.length || !dest || uploading} className={BUTTON.gold}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {uploading ? 'Uploading…' : `Upload ${todo.length ? plural(todo.length, 'file') : 'files'}`}
        </button>
        {queue.length > 0 && !uploading && (
          <button type="button" onClick={upload.clear} className={BUTTON.default}>
            Clear list
          </button>
        )}
        <span className="text-[11.5px] text-adm-muted">
          {uploading ? `${done} of ${queue.length} done` : todo.length ? `${formatSize(total)} total` : ''}
        </span>
      </footer>
    </Panel>
  )
}
