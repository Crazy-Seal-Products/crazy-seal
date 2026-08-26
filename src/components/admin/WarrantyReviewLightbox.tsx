'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Star, X } from 'lucide-react'
import {
  IMAGE_TYPES,
  REVIEW_CLASSIFICATIONS,
} from '@/lib/warranty/classification'

export interface ReviewRegistration {
  id: string
  name: string
  email: string
  phone: string | null
  order_number: string | null
  customer_details: string | null
  photo_urls: string[] | null
  before_photo_urls: string[] | null
  after_photo_urls: string[] | null
  photo_display_consent: boolean | null
  status: string
  image_type: string | null
  reviews_for_marketing: string | null
  lucid_link: string | null
  experience_notes: string | null
  rating: number | null
  favorite_photo_urls?: string[] | null
}

interface Slide {
  url: string
  label: 'Before' | 'After' | 'Photo'
}

const TONE_CLASS: Record<string, string> = {
  marketing:
    'bg-emerald-500/15 text-emerald-50 border-emerald-400/30 hover:bg-emerald-500/25 hover:border-emerald-300/50',
  strong:
    'bg-sky-500/15 text-sky-50 border-sky-400/30 hover:bg-sky-500/25 hover:border-sky-300/50',
  good:
    'bg-white/8 text-white border-white/15 hover:bg-white/14 hover:border-white/30',
  neutral:
    'bg-white/5 text-white/80 border-white/10 hover:bg-white/10',
  reject:
    'bg-red-500/15 text-red-50 border-red-400/30 hover:bg-red-500/25 hover:border-red-300/50',
}

const TONE_ACTIVE: Record<string, string> = {
  marketing: 'bg-emerald-400 text-emerald-950 border-emerald-300',
  strong: 'bg-sky-300 text-sky-950 border-sky-200',
  good: 'bg-white text-zinc-900 border-white',
  neutral: 'bg-zinc-300 text-zinc-900 border-zinc-200',
  reject: 'bg-red-400 text-red-950 border-red-300',
}

function slidesFor(reg: ReviewRegistration): Slide[] {
  const before = (reg.before_photo_urls || []).filter(Boolean)
  const after = (reg.after_photo_urls || []).filter(Boolean)
  const labeled = new Set([...before, ...after])
  const unlabeled = (reg.photo_urls || []).filter((url) => url && !labeled.has(url))
  return [
    ...before.map((url) => ({ url, label: 'Before' as const })),
    ...after.map((url) => ({ url, label: 'After' as const })),
    ...unlabeled.map((url) => ({ url, label: 'Photo' as const })),
  ]
}

function assignPhotoKind(
  reg: ReviewRegistration,
  url: string,
  kind: 'Before' | 'After' | null,
): Pick<ReviewRegistration, 'before_photo_urls' | 'after_photo_urls'> {
  return {
    before_photo_urls: [
      ...(reg.before_photo_urls || []).filter((item) => item !== url),
      ...(kind === 'Before' ? [url] : []),
    ],
    after_photo_urls: [
      ...(reg.after_photo_urls || []).filter((item) => item !== url),
      ...(kind === 'After' ? [url] : []),
    ],
  }
}

function toggleFavorite(reg: ReviewRegistration, url: string): string[] {
  const current = reg.favorite_photo_urls || []
  return current.includes(url) ? current.filter((item) => item !== url) : [...current, url]
}

function PhotoStage({
  label,
  slides,
  index,
  onIndex,
  onZoom,
  favorite,
  onFavorite,
  onAssign,
}: {
  label: string
  slides: Slide[]
  index: number
  onIndex: (next: number) => void
  onZoom: () => void
  favorite?: boolean
  onFavorite?: () => void
  onAssign?: (kind: 'Before' | 'After' | null) => void
}) {
  const slide = slides[index]
  const unlabeled = slide?.label === 'Photo'
  return (
    <div className="relative min-h-0 h-full flex-1 flex flex-col rounded-2xl overflow-hidden bg-zinc-950 ring-1 ring-white/10">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className={`text-[11px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm px-2.5 py-1 rounded-full ${
          (unlabeled ? label : slide?.label) === 'Before'
            ? 'bg-amber-400 text-amber-950'
            : (unlabeled ? label : slide?.label) === 'After'
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-black/70'
        }`}>
          {unlabeled ? label : slide?.label || label}
        </span>
        {slides.length > 1 && (
          <span className="text-[11px] text-white/70 bg-black/50 px-2 py-1 rounded-full">
            {index + 1}/{slides.length}
          </span>
        )}
      </div>
      {slide && (onAssign || onFavorite) && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {onAssign && unlabeled && (
            <div className="flex rounded-full overflow-hidden bg-black/70 text-[11px] font-bold uppercase tracking-[0.12em]">
              {(['Before', 'After'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAssign(option) }}
                  className={`px-2.5 py-1 ${
                    option === 'Before'
                      ? 'hover:bg-amber-400 hover:text-amber-950'
                      : 'hover:bg-emerald-400 hover:text-emerald-950'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          {onFavorite && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFavorite() }}
              title={favorite ? 'Remove favorite' : 'Mark as favorite'}
              className={`p-1.5 rounded-full ${
                favorite ? 'bg-amber-400 text-amber-950' : 'bg-black/70 text-white/80 hover:text-white'
              }`}
            >
              <Star className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onZoom}
        className="flex-1 min-h-0 flex items-center justify-center p-3"
        aria-label={`Zoom ${label} photo`}
      >
        {slide ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={slide.url}
            alt={`${label} photo`}
            className="h-full w-full max-h-full max-w-full object-contain drop-shadow-2xl"
          />
        ) : (
          <p className="text-sm text-white/40">No {label.toLowerCase()} photos</p>
        )}
      </button>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 hover:bg-black/80 disabled:opacity-20"
            aria-label={`Previous ${label} photo`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => onIndex(Math.min(slides.length - 1, index + 1))}
            disabled={index === slides.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/55 hover:bg-black/80 disabled:opacity-20"
            aria-label={`Next ${label} photo`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  )
}

export function WarrantyReviewLightbox({
  registrations,
  startId,
  onClose,
  onSave,
  onUpdatePhotos,
}: {
  registrations: ReviewRegistration[]
  startId: string
  onClose: () => void
  onSave: (
    id: string,
    patch: { image_type: string | null; reviews_for_marketing: string | null; status: string; lucid_link: string | null }
  ) => Promise<void>
  onUpdatePhotos: (
    id: string,
    patch: Partial<Pick<ReviewRegistration, 'before_photo_urls' | 'after_photo_urls' | 'favorite_photo_urls'>>
  ) => Promise<void>
}) {
  const startIndex = Math.max(0, registrations.findIndex((r) => r.id === startId))
  const [index, setIndex] = useState(startIndex)
  const [beforeIndex, setBeforeIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [unlabeledIndex, setUnlabeledIndex] = useState(0)
  const [zoom, setZoom] = useState<Slide | null>(null)
  const [saving, setSaving] = useState(false)
  const [imageType, setImageType] = useState('RV')
  const [reviews, setReviews] = useState('')
  const current = registrations[index]
  const savingRef = useRef(false)
  const indexRef = useRef(index)
  const currentRef = useRef(current)
  const imageTypeRef = useRef(imageType)
  const classifyRef = useRef<(value: string) => Promise<void>>(async () => {})
  indexRef.current = index
  currentRef.current = current
  imageTypeRef.current = imageType

  const slides = useMemo(() => (current ? slidesFor(current) : []), [current])
  const beforeSlides = slides.filter((s) => s.label === 'Before')
  const afterSlides = slides.filter((s) => s.label === 'After')
  const unlabeledSlides = slides.filter((s) => s.label === 'Photo')
  const compare = beforeSlides.length > 0 || afterSlides.length > 0
  const safeUnlabeledIndex = Math.min(unlabeledIndex, Math.max(0, unlabeledSlides.length - 1))
  const progress = registrations.length ? ((index + 1) / registrations.length) * 100 : 0

  useEffect(() => {
    if (!current) return
    setImageType(current.image_type || 'RV')
    setReviews(current.reviews_for_marketing || '')
    setBeforeIndex(0)
    setAfterIndex(0)
    setPhotoIndex(0)
    setUnlabeledIndex(0)
    setZoom(null)
  }, [current])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (zoom) setZoom(null)
        else onClose()
        return
      }
      if (savingRef.current) return
      const shortcut = REVIEW_CLASSIFICATIONS.find((c) => c.shortcut === e.key)
      if (shortcut && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        void classifyRef.current(shortcut.value)
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (zoom) {
          const list = zoom.label === 'Before' ? beforeSlides : zoom.label === 'After' ? afterSlides : slides
          const at = list.findIndex((s) => s.url === zoom.url)
          if (list[at + 1]) setZoom(list[at + 1])
          return
        }
        if (compare) setAfterIndex((i) => Math.min(Math.max(afterSlides.length - 1, 0), i + 1))
        else setPhotoIndex((i) => Math.min(slides.length - 1, i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (zoom) {
          const list = zoom.label === 'Before' ? beforeSlides : zoom.label === 'After' ? afterSlides : slides
          const at = list.findIndex((s) => s.url === zoom.url)
          if (list[at - 1]) setZoom(list[at - 1])
          return
        }
        if (compare) setAfterIndex((i) => Math.max(0, i - 1))
        else setPhotoIndex((i) => Math.max(0, i - 1))
      } else if (e.key === 'ArrowDown' || e.key === ']') {
        e.preventDefault()
        setIndex((i) => Math.min(registrations.length - 1, i + 1))
      } else if (e.key === 'ArrowUp' || e.key === '[') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [afterSlides, beforeSlides, compare, onClose, registrations.length, slides, zoom])

  async function classify(value: string) {
    const entry = currentRef.current
    const i = indexRef.current
    if (!entry || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setReviews(value)
    const type = imageTypeRef.current || 'RV'
    setImageType(type)
    const nextStatus =
      value === 'Repairs/Non Warranty'
        ? 'flagged'
        : entry.status === 'submitted'
          ? 'approved'
          : entry.status
    try {
      await onSave(entry.id, {
        image_type: type,
        reviews_for_marketing: value,
        status: nextStatus,
        lucid_link: entry.lucid_link,
      })
      if (i < registrations.length - 1) setIndex(i + 1)
      else onClose()
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  classifyRef.current = classify

  if (!current) return null

  const zoomedList = zoom
    ? (compare
      ? (zoom.label === 'Before' ? beforeSlides : afterSlides)
      : slides)
    : []
  const zoomedAt = zoom ? zoomedList.findIndex((s) => s.url === zoom.url) : -1

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review warranty photos"
      className="fixed inset-0 z-50 bg-[#070b12] text-white flex flex-col"
    >
      <header className="shrink-0 px-4 sm:px-6 pt-4 pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              Photo review · {index + 1} of {registrations.length}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight truncate mt-0.5">
              {current.name}
            </h2>
            <p className="text-sm text-white/55 truncate mt-0.5">
              {current.email}
              {current.order_number ? ` · #${current.order_number}` : ''}
              {current.rating != null && (
                <span className="inline-flex items-center gap-1 ml-2 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {current.rating}/5
                </span>
              )}
            </p>
            {current.customer_details && (
              <p className="text-xs text-white/40 truncate mt-1">{current.customer_details}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/8 hover:bg-white/16 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-white/80 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 px-4 sm:px-5 pb-4">
        <section className="flex-1 min-h-[42vh] lg:min-h-0 min-w-0 flex flex-col gap-2">
          {compare ? (
            <div className={`flex-1 min-h-0 overflow-y-auto grid gap-3 ${
              unlabeledSlides.length > 0
                ? 'grid-cols-1 lg:grid-cols-3 auto-rows-[minmax(320px,1fr)]'
                : 'grid-cols-1 sm:grid-cols-2'
            }`}>
              <PhotoStage
                label="Before"
                slides={beforeSlides}
                index={Math.min(beforeIndex, Math.max(0, beforeSlides.length - 1))}
                onIndex={setBeforeIndex}
                onZoom={() => beforeSlides[beforeIndex] && setZoom(beforeSlides[beforeIndex])}
                favorite={!!beforeSlides[beforeIndex] && (current.favorite_photo_urls || []).includes(beforeSlides[beforeIndex].url)}
                onFavorite={() => beforeSlides[beforeIndex] && onUpdatePhotos(current.id, {
                  favorite_photo_urls: toggleFavorite(current, beforeSlides[beforeIndex].url),
                })}
              />
              <PhotoStage
                label="After"
                slides={afterSlides}
                index={Math.min(afterIndex, Math.max(0, afterSlides.length - 1))}
                onIndex={setAfterIndex}
                onZoom={() => afterSlides[afterIndex] && setZoom(afterSlides[afterIndex])}
                favorite={!!afterSlides[afterIndex] && (current.favorite_photo_urls || []).includes(afterSlides[afterIndex].url)}
                onFavorite={() => afterSlides[afterIndex] && onUpdatePhotos(current.id, {
                  favorite_photo_urls: toggleFavorite(current, afterSlides[afterIndex].url),
                })}
              />
              {unlabeledSlides.length > 0 && (
                <PhotoStage
                  label="Unlabeled"
                  slides={unlabeledSlides}
                  index={safeUnlabeledIndex}
                  onIndex={setUnlabeledIndex}
                  onZoom={() => unlabeledSlides[safeUnlabeledIndex] && setZoom(unlabeledSlides[safeUnlabeledIndex])}
                  favorite={!!unlabeledSlides[safeUnlabeledIndex] && (current.favorite_photo_urls || []).includes(unlabeledSlides[safeUnlabeledIndex].url)}
                  onFavorite={() => unlabeledSlides[safeUnlabeledIndex] && onUpdatePhotos(current.id, {
                    favorite_photo_urls: toggleFavorite(current, unlabeledSlides[safeUnlabeledIndex].url),
                  })}
                  onAssign={(kind) => unlabeledSlides[safeUnlabeledIndex] && onUpdatePhotos(current.id, assignPhotoKind(current, unlabeledSlides[safeUnlabeledIndex].url, kind))}
                />
              )}
            </div>
          ) : (
            <PhotoStage
              label="Photos"
              slides={slides}
              index={photoIndex}
              onIndex={setPhotoIndex}
              onZoom={() => slides[photoIndex] && setZoom(slides[photoIndex])}
              favorite={!!slides[photoIndex] && (current.favorite_photo_urls || []).includes(slides[photoIndex].url)}
              onFavorite={() => slides[photoIndex] && onUpdatePhotos(current.id, {
                favorite_photo_urls: toggleFavorite(current, slides[photoIndex].url),
              })}
              onAssign={(kind) => slides[photoIndex] && onUpdatePhotos(current.id, assignPhotoKind(current, slides[photoIndex].url, kind))}
            />
          )}

          {(slides.length > 2 || (compare && unlabeledSlides.length > 0)) && (
            <div className="flex gap-2 overflow-x-auto pb-1 w-full min-w-0">
              {slides.map((slide, i) => {
                const active = compare
                  ? (slide.label === 'Before' && beforeSlides[beforeIndex]?.url === slide.url)
                    || (slide.label === 'After' && afterSlides[afterIndex]?.url === slide.url)
                    || (slide.label === 'Photo' && unlabeledSlides[safeUnlabeledIndex]?.url === slide.url)
                  : i === photoIndex
                return (
                  <button
                    key={`${slide.label}-${slide.url}-${i}`}
                    type="button"
                    onClick={() => {
                      if (slide.label === 'Before') setBeforeIndex(beforeSlides.indexOf(slide))
                      else if (slide.label === 'After') setAfterIndex(afterSlides.indexOf(slide))
                      else if (compare) setUnlabeledIndex(unlabeledSlides.indexOf(slide))
                      else setPhotoIndex(i)
                    }}
                    className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden ring-2 transition ${
                      active ? 'ring-white' : 'ring-transparent opacity-55 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.url} alt="" className="w-full h-full object-cover" />
                    {(current.favorite_photo_urls || []).includes(slide.url) && (
                      <Star className="absolute top-0.5 right-0.5 w-3 h-3 text-amber-300 fill-amber-300" />
                    )}
                    {slide.label !== 'Photo' && (
                      <span
                        className={`absolute bottom-0.5 left-0.5 text-[8px] font-bold uppercase tracking-wide px-1 py-px rounded ${
                          slide.label === 'Before'
                            ? 'bg-amber-400 text-amber-950'
                            : 'bg-emerald-400 text-emerald-950'
                        }`}
                      >
                        {slide.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <aside className="lg:w-[340px] shrink-0 flex flex-col gap-3 lg:overflow-y-auto lg:max-h-full">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2">Image type</p>
            <div className="flex flex-wrap gap-1.5">
              {IMAGE_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setImageType(type)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    imageType === type
                      ? 'bg-white text-zinc-900'
                      : 'bg-white/8 text-white/75 hover:bg-white/14'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 mb-2">
              Classify · tap to save & next
            </p>
            <div className="grid grid-cols-2 gap-2">
              {REVIEW_CLASSIFICATIONS.map((option) => {
                const active = reviews === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    disabled={saving}
                    onClick={() => classify(option.value)}
                    className={`text-left rounded-xl border px-3 py-2.5 transition disabled:opacity-50 ${
                      active ? TONE_ACTIVE[option.tone] : TONE_CLASS[option.tone]
                    } ${option.tone === 'marketing' || option.tone === 'reject' ? 'col-span-2' : ''}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm leading-tight">{option.label}</span>
                      <kbd className={`text-[11px] font-mono px-1.5 py-0.5 rounded shrink-0 ${active ? 'bg-black/15' : 'bg-black/30 text-white/70'}`}>
                        {option.shortcut}
                      </kbd>
                    </span>
                    <span className={`block text-[11px] mt-0.5 ${active ? 'opacity-70' : 'opacity-55'}`}>
                      {option.hint}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {current.photo_display_consent === false && (
            <p className="text-xs text-amber-200 bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2">
              Customer did not consent to photo display.
            </p>
          )}
          {current.experience_notes && (
            <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
              {current.experience_notes}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm font-medium hover:bg-white/14 disabled:opacity-30"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                if (index < registrations.length - 1) setIndex((i) => i + 1)
                else onClose()
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/8 text-sm font-medium hover:bg-white/14"
            >
              Skip
            </button>
          </div>
          <p className="text-[11px] text-white/35 pb-2">
            {saving ? 'Saving…' : '← → photos · 1–6 classify · [ ] skip · Esc close'}
          </p>
        </aside>
      </div>

      {zoom && (
        <div className="absolute inset-0 z-20 bg-black/92 flex items-center justify-center">
          {zoom.label === 'Photo' && (
            <div className="absolute top-4 left-4 z-10 flex rounded-full overflow-hidden bg-black/70 text-[11px] font-bold uppercase tracking-[0.12em]">
              {(['Before', 'After'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdatePhotos(current.id, assignPhotoKind(current, zoom.url, option))}
                  className={`px-3 py-1.5 ${
                    option === 'Before'
                      ? 'hover:bg-amber-400 hover:text-amber-950'
                      : 'hover:bg-emerald-400 hover:text-emerald-950'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => onUpdatePhotos(current.id, { favorite_photo_urls: toggleFavorite(current, zoom.url) })}
            className={`absolute top-4 right-16 p-2.5 rounded-full ${
              (current.favorite_photo_urls || []).includes(zoom.url)
                ? 'bg-amber-400 text-amber-950'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label="Toggle favorite"
          >
            <Star className={`w-5 h-5 ${(current.favorite_photo_urls || []).includes(zoom.url) ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setZoom(null)}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 hover:bg-white/20"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>
          {zoomedAt > 0 && (
            <button
              type="button"
              onClick={() => setZoom(zoomedList[zoomedAt - 1])}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Previous zoomed photo"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}
          {zoomedAt >= 0 && zoomedAt < zoomedList.length - 1 && (
            <button
              type="button"
              onClick={() => setZoom(zoomedList[zoomedAt + 1])}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Next zoomed photo"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.url}
            alt={`${zoom.label} full size`}
            className="max-h-[92vh] max-w-[92vw] object-contain"
            onClick={() => setZoom(null)}
          />
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-white/70">
            {zoom.label}
          </span>
        </div>
      )}
    </div>
  )
}
