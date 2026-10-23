'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'
import { MoveHorizontal, PaintRoller } from 'lucide-react'

/**
 * Before/after slider with an intro: the first time it scrolls into view a
 * paint roller sweeps across the weathered roof and leaves the coated roof
 * behind it, then parks in the middle so visitors can drag it themselves.
 * Before is on the left, after on the right.
 */
export function CoatingReveal({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  className = '',
}: {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
  className?: string
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  // Position of the divider, 0–100 from the left. After is shown to its right.
  const [pos, setPos] = useState(50)
  const [sweeping, setSweeping] = useState(false)
  const [touched, setTouched] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inView = useInView(stageRef, { once: true, margin: '0px 0px -25% 0px' })
  const reduce = useReducedMotion()

  // Intro sweep: all "before" → roller coats the roof → settle at 50%.
  useEffect(() => {
    if (!inView || reduce || touched) return
    const controls = animate(100, [100, 100, 4, 4, 50], {
      duration: 3.2,
      times: [0, 0.08, 0.62, 0.72, 1],
      ease: ['linear', [0.65, 0, 0.35, 1], 'linear', [0.16, 1, 0.3, 1]],
      onUpdate: (v) => {
        setPos(v)
        setSweeping(true)
      },
      onComplete: () => setSweeping(false),
    })
    return () => controls.stop()
  }, [inView, reduce, touched])

  const moveTo = useCallback((clientX: number) => {
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  const stopIntro = () => {
    setTouched(true)
    setSweeping(false)
  }

  return (
    <div className={className}>
      <div
        ref={stageRef}
        className="group relative aspect-square w-full touch-pan-y select-none overflow-hidden rounded-3xl bg-primary-dark shadow-2xl ring-1 ring-white/15"
        onPointerDown={(e) => {
          // Mouse: click anywhere to move the line. Touch drags start from the knob.
          if (e.pointerType !== 'mouse') return
          stopIntro()
          setDragging(true)
          moveTo(e.clientX)
          ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
        }}
        onPointerMove={(e) => dragging && moveTo(e.clientX)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={beforeSrc} alt={beforeAlt} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterSrc}
          alt={afterAlt}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        />

        {/* Wet-coat sheen trailing the roller during the intro */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-white/45 via-white/10 to-transparent mix-blend-screen transition-opacity duration-500"
          style={{ left: `${pos}%`, opacity: sweeping ? 1 : 0 }}
        />

        {/* Corner labels (fade as the line passes over them) */}
        <span
          className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white backdrop-blur-sm transition-opacity duration-300"
          style={{ opacity: pos > 18 ? 1 : 0 }}
        >
          Before
        </span>
        <span
          className="pointer-events-none absolute right-3 top-3 rounded-md bg-accent px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white shadow-glow-accent transition-opacity duration-300"
          style={{ opacity: pos < 82 ? 1 : 0 }}
        >
          After
        </span>

        {/* Divider + roller knob */}
        <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
          <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_14px_rgb(255_255_255/0.9),0_0_28px_rgb(109_192_21/0.6)]" />
          <button
            type="button"
            aria-label="Drag to compare before and after"
            className="pointer-events-auto absolute top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-full bg-white text-primary shadow-2xl ring-4 ring-accent/60 transition-transform duration-200 hover:scale-110 active:scale-95"
            onPointerDown={(e) => {
              e.stopPropagation()
              stopIntro()
              setDragging(true)
              ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
            }}
            onPointerMove={(e) => dragging && moveTo(e.clientX)}
            onPointerUp={() => setDragging(false)}
            onPointerCancel={() => setDragging(false)}
          >
            {!touched && <span aria-hidden="true" className="absolute inset-0 rounded-full bg-white/60 animate-pulse-ring" />}
            <PaintRoller className="relative h-6 w-6 -rotate-90" />
          </button>
        </div>

        {/* Keyboard access */}
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(pos)}
          onChange={(e) => {
            stopIntro()
            setPos(Number(e.target.value))
          }}
          aria-label="Before and after comparison position"
          className="sr-only"
        />
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-white/65">
        <MoveHorizontal className="h-4 w-4 text-highlight" />
        Drag the roller to compare
      </p>
    </div>
  )
}
