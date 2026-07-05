'use client'

import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { QuoteButton } from '@/components/QuoteButton'

interface GalleryPhoto {
  id: string
  cdn_url: string
  width: number
  height: number
  filename: string
}

const PREVIEW_ROWS = 2

export function HomeGalleryPreview() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])

  useEffect(() => {
    fetch('/api/gallery?limit=40')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPhotos(data) })
      .catch(() => {})
  }, [])

  if (photos.length === 0) return null

  const allRows = buildRows(photos)
  const rows = allRows.slice(0, PREVIEW_ROWS)

  if (rows.length === 0) return null

  return (
    <div className="mt-6 md:mt-8">
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {row.photos.map((photo) => (
              <div
                key={photo.id}
                className="rounded-xl overflow-hidden ring-1 ring-white/10"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.cdn_url}
                  alt="Crazy Seal installation"
                  loading="lazy"
                  className="w-full object-cover hover:scale-105 transition-transform duration-300"
                  style={{ aspectRatio: row.aspect }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
        <QuoteButton />
        <LinkButton href="/our-work" variant="outline-white" size="md">
          View All Photos
          <ArrowRight className="w-4 h-4" />
        </LinkButton>
      </div>
    </div>
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
