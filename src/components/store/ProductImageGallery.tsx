'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { EASE_OUT_EXPO } from '@/components/motion'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  /** When set (e.g. active variant image), jump the main view to that image. */
  featuredImage?: string | null
}

export function ProductImageGallery({ images, alt, featuredImage }: ProductImageGalleryProps) {
  const [active, setActive] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!featuredImage || images.length === 0) return
    const idx = images.indexOf(featuredImage)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync gallery to variant change
    setActive(idx >= 0 ? idx : 0)
  }, [featuredImage, images])

  if (images.length === 0) {
    return <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-50 via-white to-accent/10 ring-1 ring-primary/[0.08]" />
  }

  const safeActive = Math.min(active, images.length - 1)

  return (
    <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
      {/* Frame follows the image's natural aspect ratio instead of forcing a square */}
      <div className="group relative flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-accent/10 p-2 shadow-card ring-1 ring-primary/[0.08]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 bottom-6 h-10 rounded-full bg-primary/10 blur-2xl"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={images[safeActive]}
            className="relative w-full"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeActive]}
              alt={alt}
              className="mx-auto h-auto max-h-[32rem] w-full object-contain p-2 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {images.length > 1 && (
        <div className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1">
          {images.map((img, i) => (
            <button
              key={`${img}-${i}`}
              onClick={() => setActive(i)}
              className={`h-16 w-16 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-white transition-all duration-300 ${
                i === safeActive
                  ? 'shadow-md ring-2 ring-accent'
                  : 'opacity-75 ring-1 ring-primary/10 hover:-translate-y-0.5 hover:opacity-100 hover:ring-primary/30'
              }`}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="h-full w-full object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
