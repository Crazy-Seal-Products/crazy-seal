'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Loader2, Maximize2, Quote, ShieldAlert, Star, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
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

/** Classification colours: a dot at rest, a tinted card when chosen. */
const TONE_DOT: Record<string, string> = {
  marketing: 'bg-emerald-400',
  strong: 'bg-sky-400',
  good: 'bg-zinc-200',
  neutral: 'bg-zinc-500',
  reject: 'bg-rose-400',
}

const TONE_ACTIVE: Record<string, string> = {
  marketing: 'bg-emerald-400/[0.14] ring-emerald-400/60 text-emerald-50',
  strong: 'bg-sky-400/[0.14] ring-sky-400/60 text-sky-50',
  good: 'bg-white/[0.1] ring-white/50 text-white',
  neutral: 'bg-zinc-400/[0.12] ring-zinc-400/50 text-zinc-100',
  reject: 'bg-rose-400/[0.14] ring-rose-400/60 text-rose-50',
}

const LABEL_CHIP: Record<string, string> = {
  Before: 'text-amber-200 ring-amber-300/30 [&>i]:bg-amber-300',
  After: 'text-emerald-200 ring-emerald-300/30 [&>i]:bg-emerald-300',
  Photo: 'text-zinc-200 ring-white/15 [&>i]:bg-zinc-400',
}

/** Round glass button used for every icon control on the photos. */
const GLASS_ICON =
  'inline-flex items-center justify-center rounded-full bg-black/45 text-white/85 ring-1 ring-inset ring-white/15 backdrop-blur-md transition hover:bg-black/65 hover:text-white disabled:pointer-events-none disabled:opacity-0'

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

function LabelChip({ label, text }: { label: Slide['label']; text?: string }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold tracking-wide ring-1 ring-inset backdrop-blur-md',
        LABEL_CHIP[label],
      )}
    >
      <i aria-hidden="true" className="h-1.5 w-1.5 rounded-full" />
      {text ?? label}
    </span>
  )
}

/** "Mark as Before / After" control for a photo that has no label yet. */
function AssignToggle({ onAssign, size = 'sm' }: { onAssign: (kind: 'Before' | 'After') => void; size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center rounded-full bg-black/45 p-0.5 ring-1 ring-inset ring-white/15 backdrop-blur-md">
      <span className={twMerge('pl-2 pr-1 text-white/55', size === 'md' ? 'text-[12px]' : 'text-[11px]')}>Mark as</span>
      {(['Before', 'After'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onAssign(option)
          }}
          className={twMerge(
            'rounded-full font-semibold text-white/85 transition',
            size === 'md' ? 'px-3 py-1.5 text-[12px]' : 'px-2.5 py-1 text-[11px]',
            option === 'Before' ? 'hover:bg-amber-300 hover:text-amber-950' : 'hover:bg-emerald-300 hover:text-emerald-950',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

function FavoriteButton({ on, onToggle, className }: { on: boolean; onToggle: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      title={on ? 'Remove favorite' : 'Mark as favorite'}
      aria-pressed={on}
      className={twMerge(GLASS_ICON, 'h-8 w-8', on && 'bg-amber-300 text-amber-950 ring-amber-200 hover:bg-amber-200 hover:text-amber-950', className)}
    >
      <Star className={twMerge('h-4 w-4', on && 'fill-current')} />
    </button>
  )
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
  const shown = unlabeled ? label : slide?.label || label
  const chipLabel: Slide['label'] = shown === 'Before' || shown === 'After' ? shown : 'Photo'
  return (
    <div className="group relative flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-[radial-gradient(120%_80%_at_50%_0%,rgb(255_255_255/0.05),transparent_70%)] ring-1 ring-inset ring-white/[0.07]">
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <LabelChip label={chipLabel} text={shown} />
        {slides.length > 1 && (
          <span className="rounded-full bg-black/45 px-2 py-1 text-[11px] font-medium tabular-nums text-white/70 ring-1 ring-inset ring-white/10 backdrop-blur-md">
            {index + 1} / {slides.length}
          </span>
        )}
      </div>
      {slide && (onAssign || onFavorite) && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5">
          {onAssign && unlabeled && <AssignToggle onAssign={onAssign} />}
          {onFavorite && <FavoriteButton on={!!favorite} onToggle={onFavorite} />}
        </div>
      )}
      <button
        type="button"
        onClick={onZoom}
        className="flex min-h-0 flex-1 cursor-zoom-in items-center justify-center p-3 pt-12"
        aria-label={`Zoom ${label} photo`}
      >
        {slide ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={slide.url} alt={`${label} photo`} className="h-full w-full max-h-full max-w-full rounded-lg object-contain" />
        ) : (
          <span className="text-[13px] text-white/35">No {label.toLowerCase()} photos</span>
        )}
      </button>
      {slide && (
        <span className={twMerge(GLASS_ICON, 'pointer-events-none absolute bottom-3 right-3 h-7 w-7 opacity-0 group-hover:opacity-100')}>
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      )}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => onIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className={twMerge(GLASS_ICON, 'absolute left-3 top-1/2 h-10 w-10 -translate-y-1/2 lg:opacity-0 lg:group-hover:opacity-100')}
            aria-label={`Previous ${label} photo`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => onIndex(Math.min(slides.length - 1, index + 1))}
            disabled={index === slides.length - 1}
            className={twMerge(GLASS_ICON, 'absolute right-3 top-1/2 h-10 w-10 -translate-y-1/2 lg:opacity-0 lg:group-hover:opacity-100')}
            aria-label={`Next ${label} photo`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}

function SectionLabel({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">{children}</h3>
      {aside && <span className="text-[11px] text-zinc-500">{aside}</span>}
    </div>
  )
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={twMerge(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-white/[0.06] px-1 font-mono text-[10.5px] font-medium text-zinc-400 ring-1 ring-inset ring-white/[0.08]',
        className,
      )}
    >
      {children}
    </kbd>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-px" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={twMerge('h-3.5 w-3.5', n <= rating ? 'fill-amber-300 text-amber-300' : 'text-white/15')} />
      ))}
    </span>
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

  const favorites = current.favorite_photo_urls || []
  const zoomedList = zoom
    ? (compare
      ? (zoom.label === 'Before' ? beforeSlides : afterSlides)
      : slides)
    : []
  const zoomedAt = zoom ? zoomedList.findIndex((s) => s.url === zoom.url) : -1
  const showStrip = slides.length > 2 || (compare && unlabeledSlides.length > 0)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Review warranty photos"
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0e13] text-zinc-100 antialiased [font-feature-settings:'cv11']"
    >
      {/* Top bar: where you are in the queue, who this is, close. */}
      <header className="relative flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.06] px-3 sm:px-4">
        <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/[0.04] p-0.5 ring-1 ring-inset ring-white/[0.06]">
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={index === 0}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Previous registration"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-1 text-[12px] tabular-nums text-zinc-400">
            <span className="font-semibold text-zinc-100">{index + 1}</span> of {registrations.length}
          </span>
          <button
            type="button"
            onClick={() => setIndex((i) => Math.min(registrations.length - 1, i + 1))}
            disabled={index === registrations.length - 1}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-zinc-300 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
            aria-label="Next registration"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-[15px] font-semibold leading-tight tracking-tight">{current.name || current.email}</h2>
            {current.rating != null && <Stars rating={current.rating} />}
          </div>
          <p className="truncate text-[12px] leading-tight text-zinc-500">
            {current.email}
            {current.order_number ? ` · Order #${current.order_number.replace(/^#/, '')}` : ''}
            {slides.length ? ` · ${slides.length} photo${slides.length === 1 ? '' : 's'}` : ''}
          </p>
        </div>

        {saving && (
          <span className="hidden items-center gap-1.5 text-[12px] text-zinc-400 sm:inline-flex">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Saving
          </span>
        )}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-[18px] w-[18px]" />
        </button>

        <div className="absolute inset-x-0 -bottom-px h-[2px] bg-transparent">
          <div className="h-full bg-gradient-to-r from-amber-300 to-amber-400 transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_356px] lg:grid-rows-1">
        {/* Photos */}
        <section className="flex min-h-[42vh] min-w-0 flex-col gap-3 p-3 sm:p-4 lg:min-h-0">
          {compare ? (
            <div
              className={twMerge(
                'grid min-h-0 flex-1 gap-3 overflow-y-auto',
                unlabeledSlides.length > 0 ? 'grid-cols-1 auto-rows-[minmax(300px,1fr)] lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2',
              )}
            >
              <PhotoStage
                label="Before"
                slides={beforeSlides}
                index={Math.min(beforeIndex, Math.max(0, beforeSlides.length - 1))}
                onIndex={setBeforeIndex}
                onZoom={() => beforeSlides[beforeIndex] && setZoom(beforeSlides[beforeIndex])}
                favorite={!!beforeSlides[beforeIndex] && favorites.includes(beforeSlides[beforeIndex].url)}
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
                favorite={!!afterSlides[afterIndex] && favorites.includes(afterSlides[afterIndex].url)}
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
                  favorite={!!unlabeledSlides[safeUnlabeledIndex] && favorites.includes(unlabeledSlides[safeUnlabeledIndex].url)}
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
              favorite={!!slides[photoIndex] && favorites.includes(slides[photoIndex].url)}
              onFavorite={() => slides[photoIndex] && onUpdatePhotos(current.id, {
                favorite_photo_urls: toggleFavorite(current, slides[photoIndex].url),
              })}
              onAssign={(kind) => slides[photoIndex] && onUpdatePhotos(current.id, assignPhotoKind(current, slides[photoIndex].url, kind))}
            />
          )}

          {showStrip && (
            <div className="-mx-1 flex w-full min-w-0 shrink-0 gap-2 overflow-x-auto px-1 py-1">
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
                    aria-label={`${slide.label} photo ${i + 1}`}
                    className={twMerge(
                      'relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-inset ring-white/10 transition',
                      active ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-[#0b0e13]' : 'opacity-50 hover:opacity-100',
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={slide.url} alt="" className="h-full w-full object-cover" />
                    {favorites.includes(slide.url) && (
                      <Star className="absolute right-1 top-1 h-3 w-3 fill-amber-300 text-amber-300 drop-shadow" />
                    )}
                    {slide.label !== 'Photo' && (
                      <span
                        aria-hidden="true"
                        className={twMerge('absolute inset-x-0 bottom-0 h-[3px]', slide.label === 'Before' ? 'bg-amber-300' : 'bg-emerald-300')}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </section>

        {/* Review panel */}
        <aside className="flex min-h-0 flex-col border-t border-white/[0.06] bg-white/[0.015] lg:border-l lg:border-t-0">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {(current.experience_notes || current.customer_details || current.photo_display_consent === false) && (
              <div className="space-y-2">
                {current.photo_display_consent === false && (
                  <p className="flex items-start gap-2 rounded-xl bg-amber-400/[0.08] px-3 py-2 text-[12px] leading-snug text-amber-200 ring-1 ring-inset ring-amber-300/20">
                    <ShieldAlert className="mt-px h-3.5 w-3.5 shrink-0" />
                    Customer did not consent to showing these photos.
                  </p>
                )}
                {current.experience_notes && (
                  <figure className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-inset ring-white/[0.06]">
                    <Quote className="mb-1.5 h-3.5 w-3.5 text-zinc-500" />
                    <blockquote className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-zinc-300">
                      {current.experience_notes}
                    </blockquote>
                  </figure>
                )}
                {current.customer_details && <p className="text-[12px] leading-snug text-zinc-500">{current.customer_details}</p>}
              </div>
            )}

            <div>
              <SectionLabel>Image type</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setImageType(type)}
                    aria-pressed={imageType === type}
                    className={twMerge(
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium ring-1 ring-inset transition',
                      imageType === type
                        ? 'bg-white text-zinc-900 ring-white'
                        : 'bg-white/[0.03] text-zinc-400 ring-white/[0.08] hover:bg-white/[0.07] hover:text-zinc-100',
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel aside="Saves and moves on">Classify</SectionLabel>
              <div className="space-y-1.5">
                {REVIEW_CLASSIFICATIONS.map((option) => {
                  const active = reviews === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={saving}
                      onClick={() => classify(option.value)}
                      aria-pressed={active}
                      className={twMerge(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition disabled:opacity-50',
                        active ? TONE_ACTIVE[option.tone] : 'bg-white/[0.025] text-zinc-100 ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/[0.12]',
                      )}
                    >
                      <Kbd className={active ? 'bg-white/15 text-white' : undefined}>{option.shortcut}</Kbd>
                      <span aria-hidden="true" className={twMerge('h-2 w-2 shrink-0 rounded-full', TONE_DOT[option.tone])} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium leading-tight">{option.label}</span>
                        <span className="block truncate text-[11.5px] leading-tight text-zinc-500">{option.hint}</span>
                      </span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-2.5 border-t border-white/[0.06] p-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.05] text-[13px] font-medium text-zinc-200 ring-1 ring-inset ring-white/[0.08] transition hover:bg-white/[0.1] disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => {
                  if (index < registrations.length - 1) setIndex((i) => i + 1)
                  else onClose()
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.05] text-[13px] font-medium text-zinc-200 ring-1 ring-inset ring-white/[0.08] transition hover:bg-white/[0.1]"
              >
                Skip
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <p className="hidden flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500 lg:flex">
              <span className="inline-flex items-center gap-1"><Kbd>←</Kbd><Kbd>→</Kbd> photos</span>
              <span className="inline-flex items-center gap-1"><Kbd>1–6</Kbd> classify</span>
              <span className="inline-flex items-center gap-1"><Kbd>[</Kbd><Kbd>]</Kbd> skip</span>
              <span className="inline-flex items-center gap-1"><Kbd>Esc</Kbd> close</span>
            </p>
          </div>
        </aside>
      </div>

      {zoom && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
            <LabelChip label={zoom.label} />
            {zoom.label === 'Photo' && <AssignToggle size="md" onAssign={(option) => onUpdatePhotos(current.id, assignPhotoKind(current, zoom.url, option))} />}
          </div>
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <FavoriteButton
              on={favorites.includes(zoom.url)}
              onToggle={() => onUpdatePhotos(current.id, { favorite_photo_urls: toggleFavorite(current, zoom.url) })}
              className="h-10 w-10"
            />
            <button type="button" onClick={() => setZoom(null)} className={twMerge(GLASS_ICON, 'h-10 w-10')} aria-label="Close zoom">
              <X className="h-5 w-5" />
            </button>
          </div>
          {zoomedAt > 0 && (
            <button
              type="button"
              onClick={() => setZoom(zoomedList[zoomedAt - 1])}
              className={twMerge(GLASS_ICON, 'absolute left-4 z-10 h-12 w-12')}
              aria-label="Previous zoomed photo"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {zoomedAt >= 0 && zoomedAt < zoomedList.length - 1 && (
            <button
              type="button"
              onClick={() => setZoom(zoomedList[zoomedAt + 1])}
              className={twMerge(GLASS_ICON, 'absolute right-4 z-10 h-12 w-12')}
              aria-label="Next zoomed photo"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom.url}
            alt={`${zoom.label} full size`}
            className="max-h-[90vh] max-w-[90vw] cursor-zoom-out rounded-lg object-contain"
            onClick={() => setZoom(null)}
          />
          {zoomedList.length > 1 && zoomedAt >= 0 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-[12px] tabular-nums text-white/75 backdrop-blur-md">
              {zoomedAt + 1} / {zoomedList.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
