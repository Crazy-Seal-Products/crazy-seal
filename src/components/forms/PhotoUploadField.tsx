'use client'

import React, { useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'

interface PhotoUploadFieldProps {
  label: React.ReactNode
  hint?: string
  files: File[]
  onChange: (files: File[]) => void
}

export function PhotoUploadField({ label, hint, files, onChange }: PhotoUploadFieldProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function addFiles(incoming: FileList | File[]) {
    const images = Array.from(incoming).filter(f => f.type.startsWith('image/'))
    onChange([...files, ...images])
  }

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files) addFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
        className={`
          w-full rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${dragging
            ? 'border-[#003365] bg-blue-50'
            : 'border-gray-300 hover:border-[#003365] hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            if (fileRef.current) fileRef.current.value = ''
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
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
            <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(files.filter((_, idx) => idx !== i)) }}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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

/** Uploads image files to S3 via /api/upload and returns their CDN URLs. */
export async function uploadPhotos(files: File[], folder: string): Promise<string[]> {
  if (!files.length) return []
  const data = new FormData()
  for (const file of files) data.append('files', file)
  data.append('folder', folder)
  const res = await fetch('/api/upload', { method: 'POST', body: data })
  if (!res.ok) return []
  const { urls } = await res.json()
  return urls || []
}
