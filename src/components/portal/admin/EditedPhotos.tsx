'use client'

import React, { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { uploadPhotos } from '@/components/forms/PhotoUploadField'
import type { ActionResult } from './controls'

const IMAGE_EXT_RE = /\.(heic|heif|jpe?g|png|gif|webp|bmp|tiff?)$/i

const isImage = (f: File) => f.type.startsWith('image/') || IMAGE_EXT_RE.test(f.name)

// Marks designer files apart from the customer's originals in storage.
const editedName = (f: File) =>
  new File([f], f.name.startsWith('edited-') ? f.name : `edited-${f.name}`, { type: f.type, lastModified: f.lastModified })

/**
 * Upload / remove the designer's finished photos on a warranty registration.
 * Customer originals stay untouched; these go in edited_photo_urls.
 */
export function EditedPhotos({
  urls,
  favorites,
  save,
}: {
  urls: string[]
  favorites: string[]
  save: (urls: string[]) => Promise<ActionResult>
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, start] = useTransition()
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const busy = uploading || saving

  function persist(next: string[], okText: string) {
    start(async () => {
      const r = await save(next)
      setMessage(r.ok ? { text: okText, ok: true } : { text: r.error, ok: false })
      if (r.ok) router.refresh()
    })
  }

  async function addFiles(list: FileList | File[]) {
    const files = Array.from(list).filter(isImage).map(editedName)
    if (!files.length) return setMessage({ text: 'Choose image files (JPG, PNG, WEBP or HEIC).', ok: false })
    setUploading(true)
    setMessage(null)
    const uploaded: string[] = []
    for (const file of files) {
      const [url] = await uploadPhotos([file], 'warranty-edited')
      if (url) uploaded.push(url)
    }
    setUploading(false)
    if (!uploaded.length) return setMessage({ text: 'Upload failed. Try again.', ok: false })
    const failed = files.length - uploaded.length
    persist([...urls, ...uploaded], `Saved ${uploaded.length} edited photo${uploaded.length === 1 ? '' : 's'}.${failed ? ` ${failed} failed.` : ''}`)
  }

  return (
    <div className="grid gap-2.5 p-3">
      {favorites.length > 0 && (
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-adm-muted">Favorites to edit</p>
          <div className="flex flex-wrap gap-1.5">
            {favorites.map((u, i) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="block h-14 w-14 overflow-hidden rounded-md border border-adm-gold/50 hover:ring-2 hover:ring-adm-gold">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt={`Favorite ${i + 1}`} className="h-full w-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!busy && e.dataTransfer.files.length) void addFiles(e.dataTransfer.files)
        }}
        className={twMerge(
          'relative rounded-lg border-2 border-dashed border-adm-line transition-colors',
          busy ? 'pointer-events-none opacity-60' : 'cursor-pointer hover:border-adm-blue-bright/70',
          dragging && 'border-adm-blue-bright bg-adm-blue-bright/10',
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,image/heic,image/heif,.heic,.heif"
          multiple
          disabled={busy}
          aria-label="Upload edited photos"
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files)
            if (fileRef.current) fileRef.current.value = ''
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />
        <div className="pointer-events-none flex flex-col items-center px-4 py-5 text-center">
          {busy ? <Loader2 className="mb-1.5 h-6 w-6 animate-spin text-adm-blue-bright" /> : <Upload className="mb-1.5 h-6 w-6 text-adm-muted" />}
          <p className="text-[12.5px] text-adm-text">
            {uploading ? 'Uploading…' : saving ? 'Saving…' : 'Drop the finished photos here, or click to browse'}
          </p>
          <p className="mt-0.5 text-[11px] text-adm-faint">JPG, PNG, WEBP or HEIC</p>
        </div>
      </div>

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {urls.map((u, i) => (
            <div key={u} className="relative h-20 w-20 overflow-hidden rounded-md border border-adm-line">
              <a href={u} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt={`Edited photo ${i + 1}`} className="h-full w-full object-cover" />
              </a>
              <button
                type="button"
                disabled={busy}
                onClick={() => persist(urls.filter((x) => x !== u), 'Removed edited photo.')}
                aria-label={`Remove edited photo ${i + 1}`}
                className="absolute right-0.5 top-0.5 z-10 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 disabled:opacity-50"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <p className={twMerge('text-[11.5px]', message.ok ? 'text-adm-green' : 'text-adm-red')}>{message.text}</p>}
    </div>
  )
}
