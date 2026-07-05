'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { Lightbox, type LightboxImage } from '@/components/Lightbox'
import { QuoteButton } from '@/components/QuoteButton'

interface GalleryPhoto {
  id: string
  cdn_url: string
  width: number
  height: number
  filename: string
}

export function InsuranceGalleryPreview() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/gallery?limit=40')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPhotos(data) })
      .catch(() => {})
  }, [])

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
      if (next < 0) return photos.length - 1
      if (next >= photos.length) return 0
      return next
    })
  }, [photos.length])

  if (photos.length === 0) return null

  const allRows = buildRows(photos)
  const rows = allRows.slice(0, 2)

  const lightboxImages: LightboxImage[] = photos.map((p) => ({
    id: p.id,
    src: p.cdn_url,
    alt: `RV Armor installation ${p.filename}`,
  }))

  return (
    <div>
      <div className="space-y-3">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {row.photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(photos.indexOf(photo))}
                className="group rounded-xl overflow-hidden cursor-pointer"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.cdn_url}
                  alt="RV Armor installation"
                  loading="lazy"
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ aspectRatio: row.aspect }}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6">
        <QuoteButton />
        <LinkButton href="/our-work" variant="outline" size="md">
          See More Photos
          <ArrowRight className="w-4 h-4" />
        </LinkButton>
        <LinkButton href="tel:8557827667" variant="outline" size="md">
          <Phone className="w-4 h-4" />
          (855) 782-7667
        </LinkButton>
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
    </div>
  )
}

interface Row {
  photos: GalleryPhoto[]
  cols: number
  aspect: string
}

function buildRows(photos: GalleryPhoto[]): Row[] {
  const landscapes = photos.filter((p) => p.width > p.height)
  const squares = photos.filter((p) => p.width <= p.height)

  const rows: Row[] = []
  let li = 0
  let si = 0

  while (li < landscapes.length || si < squares.length) {
    if (li + 4 <= landscapes.length) {
      rows.push({ photos: landscapes.slice(li, li + 4), cols: 4, aspect: '16/9' })
      li += 4
    } else {
      li = landscapes.length
    }
    if (si + 4 <= squares.length) {
      rows.push({ photos: squares.slice(si, si + 4), cols: 4, aspect: '1/1' })
      si += 4
    } else {
      si = squares.length
    }
  }

  return rows
}
