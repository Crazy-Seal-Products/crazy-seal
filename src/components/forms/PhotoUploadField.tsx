'use client'

import React, { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

interface PhotoUploadFieldProps {
  label: React.ReactNode
  hint?: string
  files: File[]
  onChange: (files: File[]) => void
  inputLabel?: string
}

const IMAGE_EXT_RE = /\.(heic|heif|jpe?g|png|gif|webp|bmp|tiff?)$/i
const EXT_TO_MIME: Record<string, string> = {
  heic: 'image/heic',
  heif: 'image/heif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
}

export function PhotoUploadField({ label, hint, files, onChange, inputLabel }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function addFiles(incoming: FileList | File[]) {
    const images = Array.from(incoming).filter(isImageFile)
    if (!images.length) return
    onChange([...files, ...images])
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
        className={`
          group relative w-full cursor-pointer rounded-lg border border-dashed transition-all duration-300
          ${dragging
            ? 'border-accent bg-accent/[0.06] ring-4 ring-accent/15'
            : 'border-primary/15 bg-gradient-to-b from-slate-50/80 to-white hover:border-accent/60 hover:bg-accent/[0.03]'
          }
        `}
      >
        {/*
          Overlay the native file input instead of display:none + .click().
          iOS Safari often ignores programmatic clicks on hidden file inputs,
          so tapping "browse" did nothing on iPhone.
        */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,image/heic,image/heif,.heic,.heif"
          multiple
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            if (fileRef.current) fileRef.current.value = ''
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
          aria-label={inputLabel || 'Upload photos'}
        />
        <div className="pointer-events-none flex items-center gap-3 px-3 py-2">
          <span
            className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg shadow-sm ring-1 transition-all duration-300 ${
              dragging
                ? 'scale-110 bg-accent text-white ring-accent shadow-glow-accent'
                : 'bg-white text-primary/60 ring-primary/10 group-hover:-translate-y-0.5 group-hover:text-accent'
            }`}
          >
            <Upload className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-left text-xs text-gray-600 sm:text-sm">
            Drag and drop photos here, or <span className="font-semibold text-accent-dark underline decoration-accent/40 underline-offset-2">browse</span>
          </p>
          <p className="hidden max-w-[45%] truncate text-[11px] text-gray-400 sm:block" title={hint}>{hint || 'JPG, PNG, or HEIC'}</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${file.size}-${i}`}
              className="animate-in zoom-in-95 relative h-12 w-12 overflow-hidden rounded-lg shadow-sm ring-1 ring-primary/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-primary-dark/70 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
                aria-label={`Remove photo ${i + 1}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Some browsers report HEIC as an empty MIME, application/octet-stream, or
 * image/heic. Accept all of those when the filename looks like an image.
 */
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return IMAGE_EXT_RE.test(file.name)
}

function imageContentType(file: File): string {
  if (file.type.startsWith('image/')) return file.type
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  return EXT_TO_MIME[ext] || 'image/jpeg'
}

async function uploadViaPresign(file: File, folder: string): Promise<string | null> {
  const contentType = imageContentType(file)
  const res = await fetch('/api/upload/presign/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileType: contentType, folder }),
  })
  if (!res.ok) return null
  const { presignedUrl, publicUrl } = await res.json()

  const put = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  })
  return put.ok ? publicUrl : null
}

/**
 * Uploads image files directly to S3 via a presigned URL and returns CDN URLs.
 * Always uses S3 so Vercel's request-body limit never applies, and originals
 * are not compressed or rejected by size.
 * Returns [] if any upload fails.
 */
export async function uploadPhotos(files: File[], folder: string): Promise<string[]> {
  if (!files.length) return []
  const urls: string[] = []
  for (const file of files) {
    const url = await uploadViaPresign(file, folder)
    if (!url) return []
    urls.push(url)
  }
  return urls
}
