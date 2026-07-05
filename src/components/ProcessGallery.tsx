'use client'

import { useState, useCallback } from 'react'
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

  return (
    <>
      {/* Mobile: 2-col grid */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openLightbox(i)}
            className="rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer text-left"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover"
                style={{ aspectRatio: aspect }}
              />
              {showStepBadge && img.step && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {img.step}
                </div>
              )}
            </div>
            {showDescription && (img.label || img.description) && (
              <div>
                {img.label && <p className="text-xs font-bold text-[#003365] bg-gray-100 px-2 py-1">{img.label}</p>}
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
            className="group rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer hover:border-[#003365]/30 transition-colors text-left"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ aspectRatio: aspect }}
              />
              {showStepBadge && img.step && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                  {img.step}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            {showDescription && (img.label || img.description) && (
              <div>
                {img.label && <p className="text-sm font-bold text-[#003365] bg-gray-100 px-3 py-1">{img.label}</p>}
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
