'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, Download, ImageOff, ShieldCheck, Trash2, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { CAPTION_MAX, MEDIA_STAGE_LABEL, fileSize, isHeic, type MediaItem, type MediaStage } from '@/lib/contractor/media-shared'
import { dateLong } from '@/lib/portal/admin/format'
import { portalGhostButton, portalInput } from '@/components/portal/portal-styles'
import { ChevronSelect, INSTALL_COLOR, OPTION_STYLE, STAGE_COLOR, THEME_VARS, tint, useIsClient } from './kit'

/** Each gallery group's color, from the project stages' palette. */
export const MEDIA_TONE: Record<MediaStage, string> = {
  before: STAGE_COLOR.lead,
  progress: INSTALL_COLOR,
  after: STAGE_COLOR.complete,
  claim: STAGE_COLOR.lost,
  other: 'var(--p-muted, #9DA3AB)',
}

const iconButton =
  'grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--p-line,rgba(255,255,255,0.12))] bg-white/[0.06] text-[var(--p-ink,#fff)] backdrop-blur transition duration-300 hover:bg-white/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--p-primary)]'

const SHEET_BG = { background: 'var(--p-panel), var(--p-raised, #1F2328)' } as const

export interface LightboxProps {
  /** Every photo and video in gallery order; arrows go through them all. */
  items: MediaItem[]
  openId: string | null
  onOpen: (id: string) => void
  onClose: () => void
  canEdit: boolean
  /** Stages it can be moved to. */
  stages: readonly MediaStage[]
  people: Record<string, string>
  onUpdate: (id: string, patch: { caption?: string | null; stage?: MediaStage }) => void
  onDelete: (id: string) => void
}

/**
 * The gallery's full-screen viewer: photos zoom (click or tap; drag or scroll
 * to look around), videos play, arrows and swipes go through the project's
 * media. For editors, the sheet under it sets the caption, moves it to another
 * stage and deletes it. Rendered at the end of <body> with the portal theme's
 * variables copied over, as the portal's Modal is.
 */
export function MediaLightbox({ items, openId, onOpen, onClose, canEdit, stages, people, onUpdate, onDelete }: LightboxProps) {
  const anchor = useRef<HTMLSpanElement>(null)
  const isClient = useIsClient()
  const index = openId ? items.findIndex((i) => i.id === openId) : -1
  const item = index >= 0 ? items[index] : null
  const open = Boolean(item)

  const go = useCallback(
    (delta: number) => {
      if (index < 0 || items.length < 2) return
      onOpen(items[(index + delta + items.length) % items.length].id)
    },
    [index, items, onOpen],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)
      if (e.key === 'Escape') {
        // In the caption field, Escape leaves the field (which saves it); otherwise it closes.
        if (typing) (e.target as HTMLElement).blur()
        else onClose()
      } else if (!typing && e.key === 'ArrowLeft') go(-1)
      else if (!typing && e.key === 'ArrowRight') go(1)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose, go])

  const adoptTheme = useCallback((el: HTMLDivElement | null) => {
    if (!el || !anchor.current) return
    const from = getComputedStyle(anchor.current)
    for (const name of THEME_VARS) {
      const value = from.getPropertyValue(name).trim()
      if (value) el.style.setProperty(name, value)
    }
    el.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <span ref={anchor} hidden />
      {isClient &&
        createPortal(
          <AnimatePresence>
            {item && (
              <motion.div
                key="lightbox"
                ref={adoptTheme}
                role="dialog"
                aria-modal="true"
                aria-label={`${MEDIA_STAGE_LABEL[item.stage]} ${item.kind}`}
                tabIndex={-1}
                className="fixed inset-0 z-[70] flex flex-col font-sans text-[var(--p-ink,#F5F1EC)] antialiased outline-none [color-scheme:dark]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/85 backdrop-blur-xl" onClick={onClose} />

                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1" style={tint(MEDIA_TONE[item.stage])}>
                      {MEDIA_STAGE_LABEL[item.stage]}
                    </span>
                    {items.length > 1 && (
                      <span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">
                        {index + 1} / {items.length}
                      </span>
                    )}
                    {item.fileName && <span className="hidden truncate text-sm font-medium opacity-90 sm:block">{item.fileName}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="Open the original" title="Open the original">
                      <Download className="h-4 w-4" />
                    </a>
                    <button type="button" onClick={onClose} className={twMerge(iconButton, 'hover:rotate-90')} aria-label="Close">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="relative z-0 flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
                      className="flex h-full w-full items-center justify-center"
                    >
                      {item.kind === 'video' ? <VideoView item={item} /> : <PhotoView item={item} onSwipe={go} onBackdrop={onClose} />}
                    </motion.div>
                  </AnimatePresence>
                  {items.length > 1 && (
                    <>
                      <button type="button" onClick={() => go(-1)} className={twMerge(iconButton, 'absolute left-3 top-1/2 hidden -translate-y-1/2 sm:grid')} aria-label="Previous">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button type="button" onClick={() => go(1)} className={twMerge(iconButton, 'absolute right-3 top-1/2 hidden -translate-y-1/2 sm:grid')} aria-label="Next">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                <motion.div
                  initial={{ y: 48, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 36, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.9 }}
                  className="relative z-10 mx-auto w-full max-w-3xl px-3 pb-3 pt-2 sm:pb-5"
                >
                  <div className="rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.1))] p-4 shadow-[var(--p-shadow)] backdrop-blur-xl" style={SHEET_BG}>
                    <Details key={item.id} item={item} canEdit={canEdit} stages={stages} people={people} onUpdate={onUpdate} onDelete={onDelete} />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

/** A photo that zooms on click/tap; zoomed, drag (mouse) or scroll (touch, trackpad) to look around. Swipe for the next one. */
function PhotoView({ item, onSwipe, onBackdrop }: { item: MediaItem; onSwipe: (delta: number) => void; onBackdrop: () => void }) {
  /** The zoomed photo's width in px (2.5 times its fitted size), or null when it fits the screen. */
  const [zoomWidth, setZoomWidth] = useState<number | null>(null)
  const [broken, setBroken] = useState(false)
  const zoomed = zoomWidth !== null
  const box = useRef<HTMLDivElement>(null)
  const pan = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null)
  const swiped = useRef(false)

  if (broken) return <Unviewable item={item} />

  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation()
    const moved = pan.current?.moved || swiped.current
    pan.current = null
    if (moved) return
    const el = box.current
    if (zoomed || !el) {
      setZoomWidth(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    const fy = (e.clientY - rect.top) / rect.height
    setZoomWidth(Math.round(rect.width * 2.5))
    requestAnimationFrame(() => {
      el.scrollLeft = fx * el.scrollWidth - el.clientWidth / 2
      el.scrollTop = fy * el.scrollHeight - el.clientHeight / 2
    })
  }

  const onSwipeEnd = (_e: unknown, info: PanInfo) => {
    if (info.offset.x < -70 || info.velocity.x < -500) onSwipe(1)
    else if (info.offset.x > 70 || info.velocity.x > 500) onSwipe(-1)
    // The click that follows a swipe mustn't zoom.
    window.setTimeout(() => {
      swiped.current = false
    }, 0)
  }

  return (
    <div
      ref={box}
      onClick={(e) => {
        if (e.target === e.currentTarget && !zoomed) onBackdrop()
      }}
      onPointerDown={(e) => {
        const el = box.current
        if (!zoomed || !el || e.pointerType !== 'mouse') return
        pan.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false }
      }}
      onPointerMove={(e) => {
        const p = pan.current
        const el = box.current
        if (!p || !el) return
        const dx = e.clientX - p.x
        const dy = e.clientY - p.y
        if (Math.abs(dx) + Math.abs(dy) > 4) p.moved = true
        el.scrollLeft = p.left - dx
        el.scrollTop = p.top - dy
      }}
      onPointerLeave={() => {
        pan.current = null
      }}
      className={twMerge(
        'h-full w-full [scrollbar-width:none]',
        zoomed ? 'cursor-grab overflow-auto overscroll-contain active:cursor-grabbing' : 'flex items-center justify-center overflow-hidden',
      )}
    >
      <motion.div
        drag={zoomed ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        dragSnapToOrigin
        onDragStart={() => {
          swiped.current = true
        }}
        onDragEnd={onSwipeEnd}
        className={zoomed ? 'flex min-h-full w-max min-w-full items-center justify-center' : 'flex max-h-full max-w-full items-center justify-center'}
      >
        <motion.img
          layout
          src={item.url}
          alt={item.caption ?? `${MEDIA_STAGE_LABEL[item.stage]} photo`}
          draggable={false}
          onClick={onImageClick}
          onError={() => setBroken(true)}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          className={twMerge(
            'select-none',
            zoomed
              ? 'block max-w-none cursor-zoom-out'
              : 'max-h-[calc(100dvh-15rem)] max-w-full cursor-zoom-in rounded-2xl object-contain shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]',
          )}
          style={zoomWidth ? { width: zoomWidth, maxWidth: 'none' } : undefined}
        />
      </motion.div>
    </div>
  )
}

function VideoView({ item }: { item: MediaItem }) {
  const [broken, setBroken] = useState(false)
  if (broken) return <Unviewable item={item} />
  return (
    <video
      src={item.playbackUrl ?? item.url}
      poster={item.posterUrl ?? undefined}
      controls
      autoPlay
      playsInline
      preload="metadata"
      onError={() => setBroken(true)}
      className="max-h-[calc(100dvh-15rem)] max-w-full rounded-2xl bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
    />
  )
}

/** HEIC in a browser that can't draw it, or a video format it can't play: offer the file. */
function Unviewable({ item }: { item: MediaItem }) {
  const heic = item.kind === 'photo' && isHeic(item)
  return (
    <div className="max-w-sm rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.1))] p-6 text-center shadow-[var(--p-shadow)]" style={SHEET_BG}>
      <ImageOff className="mx-auto h-8 w-8 text-[var(--p-accent,#F9EA1C)]" />
      <p className="mt-3 text-sm font-semibold">{heic ? 'This browser can’t show HEIC photos' : item.kind === 'video' ? 'This video can’t play in this browser' : 'This photo didn’t load'}</p>
      <p className="mt-1 text-xs text-[var(--p-muted,#9DA3AB)]">{heic ? 'Safari and the Photos app can. The original is safe.' : 'The original is safe. Download it to view it.'}</p>
      <a href={item.url} target="_blank" rel="noopener noreferrer" download className={twMerge(portalGhostButton, 'mt-4 !py-2 !text-xs')}>
        <Download className="h-3.5 w-3.5" /> Download the original
      </a>
    </div>
  )
}

/** Caption, who added it and when, and (for editors) move and delete. Keyed by item, so the draft resets per photo. */
function Details({
  item,
  canEdit,
  stages,
  people,
  onUpdate,
  onDelete,
}: {
  item: MediaItem
  canEdit: boolean
  stages: readonly MediaStage[]
  people: Record<string, string>
  onUpdate: LightboxProps['onUpdate']
  onDelete: LightboxProps['onDelete']
}) {
  const [draft, setDraft] = useState(item.caption ?? '')
  const [confirming, setConfirming] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const dirty = draft.trim() !== (item.caption ?? '')
  const who = item.uploadedByStaff ? 'Crazy Seal' : item.uploadedBy ? (people[item.uploadedBy] ?? null) : null
  const meta = [dateLong(item.createdAt), who ? `by ${who}` : null, fileSize(item.bytes)].filter(Boolean).join(' · ')
  const targets = stages.includes(item.stage) ? stages : [item.stage, ...stages]

  const save = () => {
    if (dirty) onUpdate(item.id, { caption: draft.trim() || null })
  }

  return (
    <div className="space-y-3">
      {canEdit ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            input.current?.blur()
          }}
          className="relative"
        >
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            maxLength={CAPTION_MAX}
            placeholder="Add a caption: what it shows, where on the roof"
            aria-label="Caption"
            className={twMerge(portalInput, 'pr-24')}
          />
          <AnimatePresence>
            {dirty && (
              <motion.span
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--p-muted,#9DA3AB)]"
              >
                Enter to save
              </motion.span>
            )}
          </AnimatePresence>
        </form>
      ) : (
        item.caption && <p className="text-sm">{item.caption}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-[var(--p-muted,#9DA3AB)]">
          <span>{meta}</span>
          {item.onRegistration && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1" style={tint('var(--p-primary, #6DC015)')}>
              <ShieldCheck className="h-3 w-3" /> On the warranty registration
            </span>
          )}
          {item.onClaim && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ring-1" style={tint(MEDIA_TONE.claim)}>
              <ShieldCheck className="h-3 w-3" /> On a warranty claim
            </span>
          )}
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <ChevronSelect
              value={item.stage}
              onChange={(e) => onUpdate(item.id, { stage: e.target.value as MediaStage })}
              aria-label="Move to another stage"
              wrapperClassName="w-44"
              className="!rounded-full !py-2 !text-xs font-semibold"
            >
              {targets.map((s) => (
                <option key={s} value={s} style={OPTION_STYLE}>
                  {s === item.stage ? `In ${MEDIA_STAGE_LABEL[s]}` : `Move to ${MEDIA_STAGE_LABEL[s]}`}
                </option>
              ))}
            </ChevronSelect>
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <button type="button" onClick={() => onDelete(item.id)} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition hover:brightness-125" style={tint(MEDIA_TONE.claim)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete {item.kind}
                  </button>
                  <button type="button" onClick={() => setConfirming(false)} className={twMerge(portalGhostButton, '!px-3.5 !py-2 !text-xs')}>
                    Keep
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="delete"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirming(true)}
                  className={twMerge(portalGhostButton, '!px-3.5 !py-2 !text-xs')}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      {canEdit && confirming && (item.onRegistration || item.onClaim) && (
        <p className="text-[11px] text-[var(--p-muted,#9DA3AB)]">It comes off the project; the warranty keeps its copy.</p>
      )}
    </div>
  )
}
