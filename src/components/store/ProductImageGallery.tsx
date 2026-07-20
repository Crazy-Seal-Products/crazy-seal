'use client'

import { useState } from 'react'

export function ProductImageGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-square rounded-2xl bg-gray-100" />
  }

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={alt}
          className="w-full h-full object-contain p-6"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`w-16 h-16 flex-shrink-0 rounded-lg border-2 bg-white overflow-hidden transition-colors cursor-pointer ${
                i === active ? 'border-[#003365]' : 'border-gray-200 hover:border-gray-400'
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
