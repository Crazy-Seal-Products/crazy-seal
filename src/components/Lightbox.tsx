'use client'

import { useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export interface LightboxImage {
  id: string
  src: string
  alt: string
}

interface LightboxProps {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onNavigate: (dir: 1 | -1) => void
  onJump: (i: number) => void
}

export function Lightbox({ images, index, onClose, onNavigate, onJump }: LightboxProps) {
  const thumbRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = thumbRef.current?.children[index] as HTMLElement | undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [index])

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  const image = images[index]

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-in fade-in duration-200"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowLeft') { e.preventDefault(); onNavigate(-1) }
        if (e.key === 'ArrowRight') { e.preventDefault(); onNavigate(1) }
      }}
      role="dialog"
      tabIndex={0}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-white/50 text-sm font-medium">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main image area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-4">
        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(-1) }}
          className="absolute left-2 sm:left-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image.id}
          src={image.src}
          alt={image.alt}
          className="max-w-full max-h-full object-contain rounded-lg animate-in fade-in zoom-in-95 duration-200"
        />

        <button
          onClick={(e) => { e.stopPropagation(); onNavigate(1) }}
          className="absolute right-2 sm:right-6 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        ref={thumbRef}
        className="flex gap-1.5 px-4 py-3 overflow-x-auto shrink-0 scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => onJump(i)}
            className={`shrink-0 rounded-md overflow-hidden transition-all duration-200 cursor-pointer ${
              i === index
                ? 'ring-2 ring-white opacity-100 scale-105'
                : 'opacity-40 hover:opacity-70'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.src}
              alt=""
              loading="lazy"
              className="w-14 h-10 sm:w-16 sm:h-12 object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

