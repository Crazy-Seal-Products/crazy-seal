'use client'

import { useState, useCallback } from 'react'
import { Maximize2 } from 'lucide-react'
import { Lightbox, type LightboxImage } from '@/components/Lightbox'

interface ProcessImage {
  src: string
  alt: string
  label?: string
  description?: string
  step?: number
}

interface ProcessGalleryProps {
  images: ProcessImage[]
  aspect?: string
  cols?: number
  showStepBadge?: boolean
  showDescription?: boolean
}

export function ProcessGallery({
  images,
  aspect = '1/1',
  cols = 4,
  showStepBadge = false,
  showDescription = false,
}: ProcessGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
    document.body.style.overflow = ''
  }, [])

  const navigate = useCallback((dir: 1 | -1) => {
    setLightboxIndex((prev) => {
      if (prev === null) return null
      const next = prev + dir
      if (next < 0) return images.length - 1
      if (next >= images.length) return 0
      return next
    })
  }, [images.length])

  const lightboxImages: LightboxImage[] = images.map((img, i) => ({
    id: `process-${i}`,
    src: img.src,
    alt: img.alt,
  }))

  const stepBadge = (step: number) => (
    <div className="absolute top-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-accent-light to-accent-dark text-xs font-extrabold text-white shadow-glow-accent ring-2 ring-white/80">
      {step}
    </div>
  )

  return (
    <>
      {/* Mobile: 2-col grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-primary/[0.08] cursor-pointer"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover"
                style={{ aspectRatio: aspect }}
              />
              {showStepBadge && img.step && stepBadge(img.step)}
            </div>
            {showDescription && (img.label || img.description) && (
              <div>
                {img.label && <p className="text-xs font-bold text-primary bg-slate-50 px-2 py-1">{img.label}</p>}
                {img.description && <p className="text-xs text-gray-600 leading-snug px-2 py-1.5">{img.description}</p>}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Desktop: grid */}
      <div
        className="hidden sm:grid gap-3"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="group overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-primary/[0.08] cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                style={{ aspectRatio: aspect }}
              />
              {showStepBadge && img.step && stepBadge(img.step)}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/50 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-primary shadow-lg opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                <Maximize2 className="h-4 w-4" />
              </span>
            </div>
            {showDescription && (img.label || img.description) && (
              <div>
                {img.label && <p className="text-sm font-bold text-primary bg-slate-50 px-3 py-1.5">{img.label}</p>}
                {img.description && <p className="text-sm text-gray-600 leading-relaxed px-3 py-2">{img.description}</p>}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && lightboxImages[lightboxIndex] && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigate}
          onJump={setLightboxIndex}
        />
      )}
    </>
  )
}
