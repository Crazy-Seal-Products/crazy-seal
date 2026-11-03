'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

interface BeforeAfterSliderProps {
  beforeSrc: string
  afterSrc: string
  beforeLabel?: string
  afterLabel?: string
  aspectRatio?: string
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'BEFORE',
  afterLabel = 'AFTER',
  aspectRatio = '3/2',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [touched, setTouched] = useState(false)
  const inView = useInView(containerRef, { once: true, margin: '0px 0px -20% 0px' })
  const reduce = useReducedMotion()

  // One gentle "peek" the first time the slider scrolls into view, so it's
  // obvious the bar can be dragged. Cancelled the moment the user interacts.
  useEffect(() => {
    if (!inView || reduce || touched) return
    const controls = animate(50, [50, 32, 68, 50], {
      duration: 2.2,
      delay: 0.35,
      ease: 'easeInOut',
      times: [0, 0.3, 0.72, 1],
      onUpdate: (v) => setPosition(v),
    })
    return () => controls.stop()
  }, [inView, reduce, touched])

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setPosition(pct)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setTouched(true)
    setDragging(true)
    updatePosition(e.clientX)
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }, [updatePosition])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return
    updatePosition(e.clientX)
  }, [dragging, updatePosition])

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  useEffect(() => {
    if (!dragging) return
    const up = () => setDragging(false)
    window.addEventListener('pointerup', up)
    return () => window.removeEventListener('pointerup', up)
  }, [dragging])

  return (
    <div
      ref={containerRef}
      className="group/ba relative select-none overflow-hidden rounded-2xl cursor-col-resize touch-none bg-gray-900 shadow-lg ring-1 ring-primary/10 transition-shadow duration-500 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      style={{ aspectRatio }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Before and after comparison"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          setTouched(true)
          setPosition((p) => Math.max(0, p - 2))
        }
        if (e.key === 'ArrowRight') {
          setTouched(true)
          setPosition((p) => Math.min(100, p + 2))
        }
      }}
    >
      {/* After image (full, sits behind) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped via clip-path) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeSrc}
        alt="Before"
        className="absolute inset-0 w-full h-full object-cover saturate-[0.85]"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        draggable={false}
      />

      {/* Soft vignette so the labels always read */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/35 to-transparent" />

      {/* Labels */}
      <span
        className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm pointer-events-none transition-opacity duration-300"
        style={{ opacity: position > 12 ? 1 : 0 }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
        {beforeLabel}
      </span>
      <span
        className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-light to-accent px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-wider text-white shadow-glow-accent pointer-events-none transition-opacity duration-300"
        style={{ opacity: position < 88 ? 1 : 0 }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
        {afterLabel}
      </span>

      {/* Divider line with a soft green glow */}
      <div
        className="absolute top-0 bottom-0 z-20 w-[3px] pointer-events-none bg-white"
        style={{
          left: `${position}%`,
          transform: 'translateX(-50%)',
          boxShadow: '0 0 0 1px rgb(0 32 67 / 0.15), 0 0 14px 2px rgb(91 164 17 / 0.55)',
        }}
      />

      {/* Drag handle */}
      <div
        className="absolute top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <span className="relative grid place-items-center">
          {!touched && (
            <span className="absolute h-11 w-11 rounded-full bg-white/60 animate-pulse-ring sm:h-12 sm:w-12" />
          )}
          <span
            className={`relative grid h-11 w-11 sm:h-12 sm:w-12 place-items-center rounded-full bg-white text-primary ring-4 ring-accent/40 shadow-[0_8px_24px_-6px_rgb(0_32_67/0.55),0_0_22px_rgb(91_164_17/0.45)] transition-transform duration-300 group-hover/ba:scale-110 ${
              dragging ? 'scale-110 ring-accent/70' : ''
            }`}
          >
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M7 4L3 10L7 16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 4L17 10L13 16" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
      </div>
    </div>
  )
}
