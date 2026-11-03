'use client'

import React, { useEffect, useEffectEvent, useState } from 'react'
import { AlertCircle, Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, ExternalLink, Upload, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { AdminPortal, useEscape } from '../modal'
import { BUTTON } from '../styles'
import type { AssetFile } from './lib'

export { Modal } from '../modal'

// ─── Toast ────────────────────────────────────────────────────────────────

export type Toast = { tone: 'ok' | 'err'; title: string; details?: string[] }

export function ToastView({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const ok = toast.tone === 'ok'
  const details = toast.details ?? []
  return (
    <AdminPortal>
      <div
        role={ok ? 'status' : 'alert'}
        className="adm-glass fixed right-3 top-3 z-[70] flex w-[min(24rem,calc(100vw-1.5rem))] items-start gap-2.5 overflow-hidden rounded-lg p-3 pl-3.5"
      >
        <span aria-hidden="true" className={twMerge('absolute inset-y-0 left-0 w-[3px]', ok ? 'bg-adm-green' : 'bg-adm-red')} />
        {ok ? <CheckCircle2 className="mt-px h-4 w-4 shrink-0 text-adm-green" /> : <AlertCircle className="mt-px h-4 w-4 shrink-0 text-adm-red" />}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold leading-snug text-adm-ink">{toast.title}</p>
          {details.slice(0, 6).map((d, i) => (
            <p key={i} className="mt-0.5 break-words text-[12px] leading-snug text-adm-muted">
              {d}
            </p>
          ))}
          {details.length > 6 && <p className="mt-0.5 text-[12px] text-adm-muted">…and {details.length - 6} more</p>}
        </div>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="-m-1 grid h-6 w-6 shrink-0 place-items-center rounded text-adm-muted transition hover:text-adm-ink">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </AdminPortal>
  )
}

// ─── Drop overlay ─────────────────────────────────────────────────────────

/** Covers the window while files are dragged in from the desktop, so a drop anywhere lands here. */
export function DropOverlay({ destination, onDrop, onCancel }: { destination: string; onDrop: (dt: DataTransfer) => void; onCancel: () => void }) {
  useEscape(onCancel)
  return (
    <AdminPortal>
      <div
        className="fixed inset-0 z-[60] grid place-items-center bg-adm-bg/75 p-4 backdrop-blur-sm"
        onDragOver={(e) => {
          e.preventDefault()
          e.dataTransfer.dropEffect = 'copy'
        }}
        onDragLeave={(e) => {
          if (!e.relatedTarget || !e.currentTarget.contains(e.relatedTarget as Node)) onCancel()
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDrop(e.dataTransfer)
        }}
        onClick={onCancel}
      >
        <div className="pointer-events-none w-full max-w-md rounded-2xl border-2 border-dashed border-adm-blue-bright/70 bg-adm-bg p-8 text-center shadow-2xl">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-adm-blue-bright/15 text-adm-blue-bright">
            <Upload className="h-6 w-6" />
          </span>
          <p className="text-[15px] font-semibold text-adm-ink">Drop files or folders to upload</p>
          <p className="mt-1 break-words text-[12.5px] text-adm-muted">{destination}</p>
        </div>
      </div>
    </AdminPortal>
  )
}

// ─── Image lightbox ───────────────────────────────────────────────────────

const lightBtn = 'grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white ring-1 ring-white/15 transition hover:bg-black/75'

export function Lightbox({
  files,
  index,
  onIndex,
  onClose,
  onCopy,
  copied,
}: {
  files: AssetFile[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
  onCopy: (url: string) => void
  copied: string | null
}) {
  const file = files[index]
  const n = files.length
  const [size, setSize] = useState<{ url: string; w: number; h: number } | null>(null)
  const step = (d: number) => onIndex((index + d + n) % n)
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowLeft' && n > 1) step(-1)
    else if (e.key === 'ArrowRight' && n > 1) step(1)
  })
  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])
  if (!file) return null
  const dims = size?.url === file.url ? size : null

  return (
    <AdminPortal>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Preview of ${file.name}`}
        className="fixed inset-0 z-[60] flex flex-col bg-black/90 text-white"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium" title={file.name}>
            {file.name}
            {dims && <span className="ml-2 text-white/60">{dims.w} × {dims.h}</span>}
          </p>
          {n > 1 && (
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-[12px] tabular-nums text-white/80">
              {index + 1} of {n}
            </span>
          )}
          <button type="button" onClick={onClose} aria-label="Close preview" className={lightBtn}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={file.url}
            src={file.url}
            alt={file.name}
            draggable={false}
            onLoad={(e) => setSize({ url: file.url, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="max-h-full max-w-full object-contain"
          />
          {n > 1 && (
            <>
              <button type="button" onClick={() => step(-1)} aria-label="Previous image" className={twMerge(lightBtn, 'absolute left-2 top-1/2 -translate-y-1/2 sm:left-4')}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next image" className={twMerge(lightBtn, 'absolute right-2 top-1/2 -translate-y-1/2 sm:right-4')}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 px-3 py-3">
          <button type="button" onClick={() => onCopy(file.url)} className={BUTTON.gold}>
            {copied === file.url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied === file.url ? 'Copied' : 'Copy link'}
          </button>
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white/10 px-2.5 text-[12px] font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            Open original <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>
        </div>
      </div>
    </AdminPortal>
  )
}
