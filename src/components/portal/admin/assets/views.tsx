'use client'

import React from 'react'
import {
  Check,
  ChevronRight,
  Clapperboard,
  Copy,
  File as FileIcon,
  FileText,
  Folder,
  Image as ImageIcon,
  Loader2,
  Music,
  Pause,
  Play,
  Video,
} from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { dateShort } from '@/lib/portal/admin/format'
import { Badge, Table, TBody, Td, Th, THead, Tag } from '../ui'
import { BUTTON } from '../styles'
import { canProcess, fileType, formatSize, kindOf, plural, thumbOf, type AssetFile, type Kind } from './lib'
import { FINISHED, type VideoJob } from './video-jobs'

export type DropProps = {
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
}

export type DropTarget = { over: boolean; props: DropProps }

/** What the file views need from the manager: state to show and handlers to call. */
export interface FileCtx {
  selected: string[]
  busy: string[]
  dragging: string[]
  copied: string | null
  playing: string | null
  jobs: VideoJob[]
  starting: string[]
  dims: Record<string, { w: number; h: number }>
  onToggle: (key: string) => void
  onCopy: (url: string) => void
  onPreview: (file: AssetFile) => void
  onAudio: (file: AssetFile) => void
  onProcess: (file: AssetFile) => void
  onDims: (key: string, w: number, h: number) => void
  onDragStart: (file: AssetFile, e: React.DragEvent) => void
  onDragEnd: () => void
  onOpenFolder: (path: string) => void
}

export interface FolderCtx {
  open: (name: string) => void
  target: (name: string) => DropTarget
}

// ─── Small pieces ─────────────────────────────────────────────────────────

export function Img({ alt, ...rest }: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} loading="lazy" decoding="async" draggable={false} {...rest} />
}

/** The visual box of a checkbox; the clickable element wraps it. */
export function CheckBox({ checked, mixed, className }: { checked: boolean; mixed?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={twMerge(
        'grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border transition',
        checked || mixed ? 'border-adm-blue-bright bg-adm-blue-bright text-adm-bg' : 'border-adm-faint/70 bg-adm-input',
        className,
      )}
    >
      {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : mixed ? <span className="h-0.5 w-2 rounded bg-current" /> : null}
    </span>
  )
}

export function KindIcon({ kind, className }: { kind: Kind; className?: string }) {
  const cls = twMerge('text-adm-muted', className)
  switch (kind) {
    case 'image':
      return <ImageIcon className={cls} />
    case 'video':
      return <Video className={cls} />
    case 'audio':
      return <Music className={cls} />
    case 'pdf':
      return <FileText className={twMerge(cls, 'text-adm-red')} />
    default:
      return <FileIcon className={cls} />
  }
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-adm-muted">{children}</p>
}

function CopyButton({ url, ctx, compact, className }: { url: string; ctx: FileCtx; compact?: boolean; className?: string }) {
  const done = ctx.copied === url
  return (
    <button
      type="button"
      onClick={() => ctx.onCopy(url)}
      aria-label={compact ? 'Copy link' : undefined}
      title="Copy the media.crazyseal.com link"
      className={twMerge(BUTTON.default, 'h-7 justify-center px-2', done && 'border-adm-green/50 text-adm-green hover:text-adm-green', className)}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span className={compact ? 'hidden @3xl:inline' : undefined}>{done ? 'Copied' : 'Copy link'}</span>
    </button>
  )
}

function VariantChips({ file, ctx }: { file: AssetFile; ctx: FileCtx }) {
  if (!file.variants?.length) return null
  return (
    <span className="flex flex-wrap gap-1">
      {file.variants.map((v) => {
        const done = ctx.copied === v.url
        return (
          <button
            key={v.key}
            type="button"
            onClick={() => ctx.onCopy(v.url)}
            title={`Copy the ${v.type} link${v.size ? ` (${formatSize(v.size)})` : ''}`}
            className="inline-flex items-center gap-1 rounded bg-adm-ink/[0.06] px-1.5 py-0.5 text-[10.5px] font-medium text-adm-soft ring-1 ring-inset ring-adm-ink/10 transition hover:text-adm-ink hover:ring-adm-blue-bright/50"
          >
            {done ? <Check className="h-3 w-3 text-adm-green" /> : <Copy className="h-2.5 w-2.5 opacity-60" />}
            {v.type}
          </button>
        )
      })}
    </span>
  )
}

/** "Process video" for a raw upload, or where its MediaConvert job stands. */
function ProcessControl({ file, ctx, compact }: { file: AssetFile; ctx: FileCtx; compact?: boolean }) {
  if (!canProcess(file)) return null
  const job = ctx.jobs.find((j) => j.key === file.key)
  const btn = twMerge(BUTTON.default, 'h-7 justify-center px-2')
  if (ctx.starting.includes(file.key)) {
    return (
      <span className={twMerge(btn, 'pointer-events-none opacity-70')}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className={compact ? 'hidden @3xl:inline' : undefined}>Starting…</span>
      </span>
    )
  }
  if (job && !FINISHED.has(job.status)) {
    return (
      <span title={`MediaConvert job ${job.id}`} className="inline-flex justify-center">
        <Badge tone="warn">
          <span className={compact ? 'hidden @3xl:inline' : undefined}>Processing</span>
          {job.percent != null ? ` ${job.percent}%` : compact ? '…' : ''}
        </Badge>
      </span>
    )
  }
  if (job?.status === 'COMPLETE') {
    return (
      <button type="button" onClick={() => ctx.onOpenFolder(`${job.folder}/processed`)} className={twMerge(btn, 'text-adm-green')} title="Open the processed versions">
        <Check className="h-3.5 w-3.5" />
        <span className={compact ? 'hidden @3xl:inline' : undefined}>Processed</span>
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => ctx.onProcess(file)}
      aria-label={compact ? 'Process video' : undefined}
      title="Make web versions with AWS MediaConvert: thumbnail, original, 1080p and 720p"
      className={btn}
    >
      <Clapperboard className="h-3.5 w-3.5" />
      <span className={compact ? 'hidden @3xl:inline' : undefined}>{job?.status === 'ERROR' ? 'Retry processing' : 'Process video'}</span>
    </button>
  )
}

/** Thumbnail plus the matching action: zoom an image, play audio, open a video or PDF. */
function Preview({ file, ctx, variant }: { file: AssetFile; ctx: FileCtx; variant: 'card' | 'row' }) {
  const kind = kindOf(file)
  const card = variant === 'card'
  const src = kind === 'image' ? file.url : kind === 'video' ? thumbOf(file) : undefined
  const box = card
    ? 'absolute inset-0 grid place-items-center overflow-hidden'
    : 'grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded border border-adm-line bg-adm-ink/[0.04]'
  const visual = src ? (
    <Img
      src={src}
      alt=""
      onLoad={kind === 'image' ? (e) => ctx.onDims(file.key, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight) : undefined}
      className={card && kind === 'image' ? 'max-h-full max-w-full object-contain' : 'h-full w-full object-cover'}
    />
  ) : (
    <KindIcon kind={kind} className={card ? 'h-9 w-9 opacity-80' : 'h-4 w-4'} />
  )

  if (kind === 'audio') {
    const on = ctx.playing === file.key
    return (
      <span className={box}>
        <button
          type="button"
          onClick={() => ctx.onAudio(file)}
          aria-label={on ? `Pause ${file.name}` : `Play ${file.name}`}
          className={twMerge('grid place-items-center rounded-full bg-adm-blue text-white shadow transition hover:brightness-110', card ? 'h-11 w-11' : 'h-full w-full rounded')}
        >
          {on ? <Pause className={card ? 'h-5 w-5' : 'h-4 w-4'} /> : <Play className={twMerge('ml-0.5', card ? 'h-5 w-5' : 'h-4 w-4')} />}
        </button>
      </span>
    )
  }
  if (kind === 'image') {
    return (
      <button type="button" onClick={() => ctx.onPreview(file)} aria-label={`Preview ${file.name}`} className={twMerge(box, 'cursor-zoom-in', card && 'p-1.5')}>
        {visual}
      </button>
    )
  }
  if (kind === 'video' || kind === 'pdf') {
    return (
      <a href={file.url} target="_blank" rel="noopener noreferrer" draggable={false} aria-label={`Open ${file.name} in a new tab`} className={box}>
        {visual}
        {card && kind === 'video' && src && (
          <span className="absolute grid h-9 w-9 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/20">
            <Play className="ml-0.5 h-4 w-4" />
          </span>
        )}
      </a>
    )
  }
  return <span className={box}>{visual}</span>
}

function details(file: AssetFile, ctx: FileCtx): string | null {
  const d = ctx.dims[file.key]
  if (d) return `${d.w} × ${d.h}`
  if (file.variants?.length) return plural(file.variants.length, 'version')
  return null
}

// ─── Folders ──────────────────────────────────────────────────────────────

export function FolderTile({ name, ctx }: { name: string; ctx: FolderCtx }) {
  const { over, props } = ctx.target(name)
  return (
    <button
      type="button"
      onClick={() => ctx.open(name)}
      {...props}
      className={twMerge(
        'flex h-10 min-w-0 items-center gap-2 rounded-lg border border-adm-line bg-adm-head px-2.5 text-left text-[12.5px] font-medium text-adm-text transition hover:border-adm-blue-bright/60 hover:text-adm-ink',
        over && 'border-adm-gold bg-adm-gold/10 text-adm-ink ring-1 ring-adm-gold',
      )}
    >
      <Folder className="h-4 w-4 shrink-0 fill-adm-blue-bright/15 text-adm-blue-bright" />
      <span className="min-w-0 flex-1 truncate" title={name}>
        {name}
      </span>
      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-adm-faint" />
    </button>
  )
}

// ─── Grid ─────────────────────────────────────────────────────────────────

export function FileCard({ file, ctx }: { file: AssetFile; ctx: FileCtx }) {
  const selected = ctx.selected.includes(file.key)
  const busy = ctx.busy.includes(file.key)
  const info = details(file, ctx)
  return (
    <div
      draggable={selected && !busy}
      onDragStart={(e) => ctx.onDragStart(file, e)}
      onDragEnd={ctx.onDragEnd}
      className={twMerge(
        'relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-adm-line bg-adm-head transition',
        selected && 'cursor-grab border-adm-blue-bright ring-1 ring-adm-blue-bright',
        (busy || ctx.dragging.includes(file.key)) && 'opacity-50',
        busy && 'pointer-events-none',
      )}
    >
      <div className="relative aspect-[4/3] bg-adm-ink/[0.04]">
        <Preview file={file} ctx={ctx} variant="card" />
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          aria-label={`Select ${file.name}`}
          onClick={() => ctx.onToggle(file.key)}
          className="absolute left-0 top-0 p-1.5"
        >
          <CheckBox checked={selected} className={twMerge('h-[18px] w-[18px] shadow-sm', !selected && 'bg-adm-bg/80')} />
        </button>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-2">
        <p className="line-clamp-2 text-[12.5px] font-medium leading-tight text-adm-ink [overflow-wrap:anywhere]" title={file.name}>
          {file.name}
        </p>
        <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] leading-none text-adm-muted">
          <Tag>{fileType(file.name)}</Tag>
          <span>{formatSize(file.size)}</span>
          {info && <span>· {info}</span>}
        </p>
        <VariantChips file={file} ctx={ctx} />
        <div className="mt-auto grid gap-1.5 pt-0.5">
          <CopyButton url={file.url} ctx={ctx} className="w-full" />
          <ProcessControl file={file} ctx={ctx} />
        </div>
      </div>
    </div>
  )
}

// ─── List ─────────────────────────────────────────────────────────────────

const ROW = 'transition-colors hover:bg-adm-ink/[0.03]'
const NAME = 'block max-w-[10.5rem] truncate @md:max-w-[13rem] @2xl:max-w-[16rem] @5xl:max-w-[22rem]'

export function FileTable({ folders, files, ctx, folderCtx }: { folders: string[]; files: AssetFile[]; ctx: FileCtx; folderCtx: FolderCtx }) {
  return (
    <Table>
      <THead>
        <Th className="w-0 pr-0">
          <span className="sr-only">Select</span>
        </Th>
        <Th>Name</Th>
        <Th className="hidden @xl:table-cell">Type</Th>
        <Th className="hidden @xl:table-cell" align="right">
          Size
        </Th>
        <Th className="hidden @5xl:table-cell">Details</Th>
        <Th className="hidden @3xl:table-cell">Modified</Th>
        <Th align="right">
          <span className="sr-only">Actions</span>
        </Th>
      </THead>
      <TBody>
        {folders.map((name) => {
          const { over, props } = folderCtx.target(name)
          return (
            <tr key={`folder:${name}`} {...props} className={twMerge(ROW, over && 'bg-adm-gold/10')}>
              <Td className="pr-0" />
              <Td>
                <button type="button" onClick={() => folderCtx.open(name)} className="flex items-center gap-2.5 text-left font-semibold text-adm-ink hover:text-adm-blue-bright">
                  <span className={twMerge('grid h-8 w-8 shrink-0 place-items-center rounded border border-adm-line bg-adm-head', over && 'border-adm-gold')}>
                    <Folder className="h-4 w-4 fill-adm-blue-bright/15 text-adm-blue-bright" />
                  </span>
                  <span className={NAME} title={name}>
                    {name}
                  </span>
                </button>
              </Td>
              <Td muted className="hidden @xl:table-cell">
                Folder
              </Td>
              <Td className="hidden @xl:table-cell" />
              <Td className="hidden @5xl:table-cell" />
              <Td className="hidden @3xl:table-cell" />
              <Td align="right">
                <ChevronRight className="ml-auto h-4 w-4 text-adm-faint" />
              </Td>
            </tr>
          )
        })}
        {files.map((file) => {
          const selected = ctx.selected.includes(file.key)
          const busy = ctx.busy.includes(file.key)
          const info = details(file, ctx)
          return (
            <tr
              key={file.key}
              draggable={selected && !busy}
              onDragStart={(e) => ctx.onDragStart(file, e)}
              onDragEnd={ctx.onDragEnd}
              className={twMerge(
                ROW,
                selected && 'cursor-grab bg-adm-blue-bright/[0.07] hover:bg-adm-blue-bright/10',
                (busy || ctx.dragging.includes(file.key)) && 'opacity-50',
                busy && 'pointer-events-none',
              )}
            >
              <Td className="pr-0">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  aria-label={`Select ${file.name}`}
                  onClick={() => ctx.onToggle(file.key)}
                  className="-m-1.5 grid p-1.5"
                >
                  <CheckBox checked={selected} />
                </button>
              </Td>
              <Td>
                <span className="flex items-center gap-2.5">
                  <Preview file={file} ctx={ctx} variant="row" />
                  <span className="min-w-0">
                    <span className={twMerge(NAME, 'font-medium text-adm-ink')} title={file.name}>
                      {file.name}
                    </span>
                    <span className={twMerge(NAME, 'text-[11px] text-adm-muted @xl:hidden')}>
                      {fileType(file.name)} · {formatSize(file.size)}
                      {info && ` · ${info}`}
                    </span>
                    {file.variants?.length ? (
                      <span className="mt-1 block @5xl:hidden">
                        <VariantChips file={file} ctx={ctx} />
                      </span>
                    ) : null}
                  </span>
                </span>
              </Td>
              <Td className="hidden @xl:table-cell">
                <Tag>{fileType(file.name)}</Tag>
              </Td>
              <Td muted align="right" className="hidden @xl:table-cell">
                {formatSize(file.size)}
              </Td>
              <Td muted className="hidden @5xl:table-cell">
                {file.variants?.length ? <VariantChips file={file} ctx={ctx} /> : (info ?? '—')}
              </Td>
              <Td muted className="hidden @3xl:table-cell">
                {dateShort(file.lastModified)}
              </Td>
              <Td align="right">
                <span className="inline-flex items-center justify-end gap-1">
                  <ProcessControl file={file} ctx={ctx} compact />
                  <CopyButton url={file.url} ctx={ctx} compact />
                </span>
              </Td>
            </tr>
          )
        })}
      </TBody>
    </Table>
  )
}
