'use client'

import React, { useRef, useState } from 'react'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { uploadPhotos } from '@/components/forms/PhotoUploadField'

const IMAGE_EXT_RE = /\.(heic|heif|jpe?g|png|gif|webp|bmp|tiff?)$/i

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return IMAGE_EXT_RE.test(file.name)
}

function prefixEditedName(file: File): File {
  const name = file.name.startsWith('edited-') ? file.name : `edited-${file.name}`
  return new File([file], name, { type: file.type, lastModified: file.lastModified })
}

export function EditedPhotosField({
  urls,
  favoriteUrls,
  onSave,
}: {
  urls: string[]
  favoriteUrls?: string[]
  onSave: (urls: string[]) => Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  async function persist(next: string[], okMessage?: string) {
    setSaving(true)
    setMessage(null)
    try {
      await onSave(next)
      if (okMessage) setMessage({ text: okMessage, ok: true })
    } catch (error) {
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to save edited photos.',
        ok: false,
      })
    } finally {
      setSaving(false)
    }
  }

  async function addFiles(incoming: FileList | File[]) {
    const images = Array.from(incoming).filter(isImageFile).map(prefixEditedName)
    if (!images.length) {
      setMessage({ text: 'Choose image files (JPG, PNG, WEBP, or HEIC).', ok: false })
      return
    }

    setUploading(true)
    setMessage(null)
    const uploaded: string[] = []
    let failed = 0
    for (const file of images) {
      const [url] = await uploadPhotos([file], 'warranty-edited')
      if (url) uploaded.push(url)
      else failed += 1
    }
    setUploading(false)

    if (!uploaded.length) {
      setMessage({ text: 'Upload failed. Try again.', ok: false })
      return
    }

    const suffix = failed ? ` ${failed} file${failed === 1 ? '' : 's'} failed.` : ''
    await persist(
      [...urls, ...uploaded],
      `Saved ${uploaded.length} edited photo${uploaded.length === 1 ? '' : 's'}.${suffix}`,
    )
  }

  async function removeUrl(url: string) {
    await persist(urls.filter((item) => item !== url), 'Removed edited photo.')
  }

  const busy = uploading || saving
  const favorites = (favoriteUrls || []).filter(Boolean)

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Edited photos</p>
          <p className="text-xs text-gray-500 mt-1">
            Upload the designer&apos;s finished images. Customer originals stay on the entry.
          </p>
        </div>
        {urls.length > 0 && (
          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
            {urls.length} final
          </span>
        )}
      </div>

      {favorites.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
            Favorites to edit
          </p>
          <div className="flex flex-wrap gap-2">
            {favorites.map((url, i) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-14 h-14 rounded-lg overflow-hidden border border-amber-200 hover:ring-2 hover:ring-amber-400"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Favorite ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          if (!busy && e.dataTransfer.files.length) void addFiles(e.dataTransfer.files)
        }}
        className={`
          relative w-full rounded-xl border-2 border-dashed transition-colors
          ${busy ? 'opacity-60 pointer-events-none' : 'cursor-pointer'}
          ${dragging ? 'border-[#003365] bg-blue-50' : 'border-gray-300 hover:border-[#003365] hover:bg-gray-50'}
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*,image/heic,image/heif,.heic,.heif"
          multiple
          disabled={busy}
          onChange={(e) => {
            if (e.target.files) void addFiles(e.target.files)
            if (fileRef.current) fileRef.current.value = ''
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          aria-label="Upload edited photos"
        />
        <div className="pointer-events-none flex flex-col items-center justify-center py-7 px-4 text-center">
          {busy ? (
            <Loader2 className="w-7 h-7 mb-2 text-[#003365] animate-spin" />
          ) : (
            <Upload className={`w-7 h-7 mb-2 ${dragging ? 'text-[#003365]' : 'text-gray-400'}`} />
          )}
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading…' : saving ? 'Saving…' : (
              <>Drag finished photos here, or <span className="text-[#003365] font-medium">browse</span></>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, or HEIC</p>
        </div>
      </div>

      {urls.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group">
              <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Edited photo ${i + 1}`} className="w-full h-full object-cover" />
              </a>
              <button
                type="button"
                onClick={() => void removeUrl(url)}
                disabled={busy}
                className="absolute top-0.5 right-0.5 z-10 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 disabled:opacity-50"
                aria-label={`Remove edited photo ${i + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-gray-400">
          <ImageIcon className="w-3.5 h-3.5" />
          No edited photos yet.
        </p>
      )}

      {message && (
        <p className={`text-xs ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>
      )}
    </div>
  )
}
