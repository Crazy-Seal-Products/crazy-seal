'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import {
  GripVertical,
  Save,
  Check,
  Loader2,
  RectangleHorizontal,
  Square,
  Star,
  StarOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryPhoto {
  id: string
  filename: string
  original_name: string
  cdn_url: string
  width: number
  height: number
  installation_type: string
  featured: boolean
  display_order: number
}

export default function AdminGalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [filter, setFilter] = useState<'all' | 'landscape' | 'square'>('all')
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const fetchPhotos = useCallback(async () => {
    const res = await fetch('/api/gallery')
    const data = await res.json()
    if (Array.isArray(data)) setPhotos(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchPhotos() }, [fetchPhotos])

  const isLandscape = (p: GalleryPhoto) => p.width > p.height

  const filtered = filter === 'all'
    ? photos
    : filter === 'landscape'
      ? photos.filter(isLandscape)
      : photos.filter((p) => !isLandscape(p))

  const handleDragStart = (index: number) => {
    dragItem.current = index
  }

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index
  }

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return
    if (dragItem.current === dragOverItem.current) return

    const reordered = [...photos]
    const draggedId = filtered[dragItem.current].id
    const targetId = filtered[dragOverItem.current].id

    const fromIdx = reordered.findIndex((p) => p.id === draggedId)
    const toIdx = reordered.findIndex((p) => p.id === targetId)

    const [removed] = reordered.splice(fromIdx, 1)
    reordered.splice(toIdx, 0, removed)

    const updated = reordered.map((p, i) => ({ ...p, display_order: i + 1 }))
    setPhotos(updated)
    setDirty(true)

    dragItem.current = null
    dragOverItem.current = null
  }

  const updateField = (id: string, field: string, value: unknown) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
    setDirty(true)
  }

  const originalRef = useRef<GalleryPhoto[]>([])

  useEffect(() => {
    if (photos.length > 0 && originalRef.current.length === 0) {
      originalRef.current = photos.map((p) => ({ ...p }))
    }
  }, [photos])

  const saveOrder = async () => {
    setSaving(true)
    try {
      await fetch('/api/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: photos.map((p) => ({ id: p.id, display_order: p.display_order })),
        }),
      })

      const changed = photos.filter((p) => {
        const orig = originalRef.current.find((o) => o.id === p.id)
        return orig && (orig.installation_type !== p.installation_type || orig.featured !== p.featured)
      })

      for (const photo of changed) {
        await fetch('/api/gallery', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: photo.id,
            installation_type: photo.installation_type,
            featured: photo.featured,
          }),
        })
      }

      originalRef.current = photos.map((p) => ({ ...p }))
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  const landscapeCount = photos.filter(isLandscape).length
  const squareCount = photos.filter((p) => !isLandscape(p)).length

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            {photos.length} photos ({landscapeCount} landscape, {squareCount} square)
          </p>
        </div>
        <button
          onClick={saveOrder}
          disabled={!dirty || saving}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer',
            dirty && !saving
              ? 'bg-[#003365] text-white hover:bg-[#002244] shadow-md'
              : saved
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Saving...</>
          ) : saved ? (
            <><Check className="w-4 h-4" />Saved</>
          ) : (
            <><Save className="w-4 h-4" />Save Changes</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { key: 'all' as const, label: 'All', count: photos.length, icon: null },
          { key: 'landscape' as const, label: 'Landscape', count: landscapeCount, icon: RectangleHorizontal },
          { key: 'square' as const, label: 'Square', count: squareCount, icon: Square },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer',
              filter === f.key
                ? 'bg-[#003365] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {f.icon && <f.icon className="w-3.5 h-3.5" />}
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Drag to reorder. Your order determines how photos appear in all galleries. Tip: arrange your favorites first!
      </p>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filtered.map((photo, index) => {
          const landscape = isLandscape(photo)
          return (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#003365]/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
            >
              {/* Image */}
              <div className="relative" style={{ aspectRatio: landscape ? '16/9' : '1/1' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.cdn_url}
                  alt={photo.filename}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Drag handle overlay */}
                <div className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-1 flex items-center gap-1">
                    <GripVertical className="w-3 h-3 text-white" />
                    <span className="text-[10px] font-mono text-white">#{photo.display_order}</span>
                  </div>
                </div>
                {/* Dimension badge */}
                <div className="absolute top-1.5 right-1.5">
                  <div className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-bold',
                    landscape ? 'bg-blue-500/80 text-white' : 'bg-amber-500/80 text-white',
                  )}>
                    {photo.width}x{photo.height}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="p-2 space-y-1.5">
                <p className="text-[10px] text-gray-400 truncate" title={photo.original_name}>
                  {photo.original_name}
                </p>

                <div className="flex items-center gap-1.5">
                  <select
                    value={photo.installation_type}
                    onChange={(e) => updateField(photo.id, 'installation_type', e.target.value)}
                    className="flex-1 text-[10px] px-1.5 py-1 border border-gray-200 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#003365]"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Direct To Deck">Direct To Deck</option>
                  </select>

                  <button
                    onClick={() => updateField(photo.id, 'featured', !photo.featured)}
                    className={cn(
                      'p-1 rounded-md transition-colors cursor-pointer',
                      photo.featured
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-gray-50 text-gray-300 hover:text-amber-400',
                    )}
                    title={photo.featured ? 'Remove from featured' : 'Mark as featured'}
                  >
                    {photo.featured
                      ? <Star className="w-3.5 h-3.5 fill-current" />
                      : <StarOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
