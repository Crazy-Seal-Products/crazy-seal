'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Lightbox, type LightboxImage } from '@/components/Lightbox'

interface GalleryPhoto {
  id: string
  filename: string
  cdn_url: string
  width: number
  height: number
  installation_type: string
}

interface GalleryGridProps {
  photos: GalleryPhoto[]
  initialRows?: number
}

const FILTERS = ['All', 'Standard', 'Direct To Deck'] as const
const ROW_BATCH = 8

export function GalleryGrid({ photos, initialRows = 8 }: GalleryGridProps) {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All')
  const [visibleRowCount, setVisibleRowCount] = useState(initialRows)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = filter === 'All'
    ? photos
    : photos.filter((p) => p.installation_type === filter)

  const allRows = buildRows(filtered)
  const rows = allRows.slice(0, visibleRowCount)
  const hasMore = visibleRowCount < allRows.length

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleRowCount((c) => c + ROW_BATCH)
        }
      },
      { rootMargin: '400px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, filter])

  const openLightbox = useCallback((globalIndex: number) => {
    setLightboxIndex(globalIndex)
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
      if (next < 0) return filtered.length - 1
      if (next >= filtered.length) return 0
      return next
    })
  }, [filtered.length])

  const lightboxImages: LightboxImage[] = filtered.map((p) => ({
    id: p.id,
    src: p.cdn_url,
    alt: `RV Armor installation ${p.filename}`,
  }))

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === 'All' ? photos.length : photos.filter((p) => p.installation_type === f).length
          return (
            <button
              key={f}
              onClick={() => { setFilter(f); setVisibleRowCount(initialRows) }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                filter === f
                  ? 'bg-[#003365] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f} ({count})
            </button>
          )
        })}
      </div>

      {/* Photo Rows */}
      <div className="space-y-3">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {row.photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => openLightbox(filtered.indexOf(photo))}
                className="group relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#003365] focus:ring-offset-2"
                style={{ aspectRatio: row.aspect }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.cdn_url}
                  alt={`RV Armor installation ${photo.filename}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Lazy load sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-1" />}

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

interface Row {
  photos: GalleryPhoto[]
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
      rows.push({ photos: landscapes.slice(li, li + 4), aspect: '16/9' })
      li += 4
    } else {
      li = landscapes.length
    }
    if (si + 4 <= squares.length) {
      rows.push({ photos: squares.slice(si, si + 4), aspect: '1/1' })
      si += 4
    } else {
      si = squares.length
    }
  }

  return rows
}
