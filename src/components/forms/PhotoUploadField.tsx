'use client'

import React, { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

interface PhotoUploadFieldProps {
  label: React.ReactNode
  hint?: string
  files: File[]
  onChange: (files: File[]) => void
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

export function PhotoUploadField({ label, hint, files, onChange }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function addFiles(incoming: FileList | File[]) {
    const images = Array.from(incoming).filter(isImageFile)
    if (!images.length) return
    onChange([...files, ...images])
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
        className={`
          relative w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${dragging
            ? 'border-[#003365] bg-blue-50'
            : 'border-gray-300 hover:border-[#003365] hover:bg-gray-50'
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
          aria-label="Upload photos"
        />
        <div className="pointer-events-none flex flex-col items-center justify-center py-10 px-4 text-center">
          <Upload className={`w-8 h-8 mb-2 ${dragging ? 'text-[#003365]' : 'text-gray-400'}`} />
          <p className="text-sm text-gray-600">
            Drag and drop photos here, or <span className="text-[#003365] font-medium">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{hint || 'JPG, PNG, or HEIC'}</p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-3">
          {files.map((file, i) => (
            <div key={`${file.name}-${file.size}-${i}`} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 z-20 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
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

// Serverless routes reject bodies over ~4.5MB, so larger files must be
// compressed below this or uploaded directly to S3.
const UPLOAD_LIMIT = 4 * 1024 * 1024

/**
 * Re-encodes an oversized photo as a downscaled JPEG so it fits within the
 * serverless upload limit. Returns null if the browser can't decode the file
 * (e.g. HEIC on some non-Safari browsers).
 */
async function compressImage(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const MAX_DIM = 2400
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85))
    if (!blob) return null
    const name = file.name.replace(/\.\w+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return null
  }
}

async function uploadViaPresign(file: File, folder: string): Promise<string | null> {
  const contentType = imageContentType(file)
  const res = await fetch('/api/upload/presign/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: file.name, fileType: contentType, fileSize: file.size, folder }),
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

async function uploadViaApi(file: File, folder: string): Promise<string | null> {
  const data = new FormData()
  data.append('files', file)
  data.append('folder', folder)
  const res = await fetch('/api/upload/', { method: 'POST', body: data })
  if (!res.ok) return null
  const { urls } = await res.json()
  return urls?.[0] || null
}

/**
 * Uploads image files to S3 and returns their CDN URLs.
 * Files are uploaded one at a time. Oversized photos are compressed in the
 * browser to fit the serverless request-body limit; if the browser can't
 * re-encode them they fall back to a presigned direct-to-S3 PUT.
 * Returns [] if any upload fails.
 */
export async function uploadPhotos(files: File[], folder: string): Promise<string[]> {
  if (!files.length) return []
  const urls: string[] = []
  for (const original of files) {
    let file = original
    if (file.size > UPLOAD_LIMIT) {
      file = (await compressImage(file)) ?? file
    }
    const url = file.size > UPLOAD_LIMIT
      ? await uploadViaPresign(file, folder)
      : await uploadViaApi(file, folder)
    if (!url) return []
    urls.push(url)
  }
  return urls
}
