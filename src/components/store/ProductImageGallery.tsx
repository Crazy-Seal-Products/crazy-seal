'use client'

import { useState, useEffect } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  /** When set (e.g. active variant image), jump the main view to that image. */
  featuredImage?: string | null
}

export function ProductImageGallery({ images, alt, featuredImage }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!featuredImage || images.length === 0) return
    const idx = images.indexOf(featuredImage)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync gallery to variant change
    setActive(idx >= 0 ? idx : 0)
  }, [featuredImage, images])

  if (images.length === 0) {
    return <div className="aspect-square rounded-2xl bg-gray-100" />
  }

  const safeActive = Math.min(active, images.length - 1)

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[safeActive]}
          alt={alt}
          className="w-full h-full object-contain p-6"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              onClick={() => setActive(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 bg-white overflow-hidden transition-colors cursor-pointer ${
                i === safeActive ? 'border-[#003365]' : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
