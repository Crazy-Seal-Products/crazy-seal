'use client'

/**
 * Client-side motion moments for the system / product / installation pages:
 * a numbered step timeline whose connectors draw in, a pointer-tilt card,
 * and a scroll-filled chapter rail for the installation video library.
 */
import React, { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { EASE_OUT_EXPO } from '@/components/motion'

/* ───────────────────────── Step timeline ───────────────────────── */

export interface TimelineStep {
  title: string
  desc?: React.ReactNode
  /** Small label above the title, e.g. "Step 1". */
  label?: string
  /** Rendered icon element shown in the node instead of the number. */
  icon?: React.ReactNode
  image?: string
  imageAlt?: string
  link?: { label: string; href: string }
}

const MD_COLS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
}

/**
 * Numbered steps. Vertical on mobile, horizontal from md up. Each node pops
 * in and the connector to the next step draws itself once in view.
 */
export function StepTimeline({
  steps,
  variant = 'light',
  className,
}: {
  steps: TimelineStep[]
  variant?: 'light' | 'dark'
  className?: string
}) {
  const reduce = useReducedMotion()
  const dark = variant === 'dark'
  const n = steps.length
  const view = { once: true, margin: '0px 0px -12% 0px' } as const

  return (
    <ol className={twMerge('grid grid-cols-1 gap-8 md:gap-6', MD_COLS[n] ?? 'md:grid-cols-3', className)}>
      {steps.map((step, i) => {
        const isExternal = step.link?.href.startsWith('http')
        return (
          <li key={step.title} className="relative pl-16 md:flex md:flex-col md:pl-0">
            {i < n - 1 && (
              <>
                {/* tracks */}
                <span
                  aria-hidden="true"
                  className={twMerge(
                    'absolute left-6 top-14 -bottom-6 w-0.5 rounded-full md:hidden',
                    dark ? 'bg-white/10' : 'bg-primary/10'
                  )}
                />
                <span
                  aria-hidden="true"
                  className={twMerge(
                    'absolute left-16 -right-4 top-6 hidden h-0.5 rounded-full md:block',
                    dark ? 'bg-white/10' : 'bg-primary/10'
                  )}
                />
                {/* drawn fills */}
                <motion.span
                  aria-hidden="true"
                  className="absolute left-6 top-14 -bottom-6 w-0.5 origin-top rounded-full bg-gradient-to-b from-accent to-secondary-light md:hidden"
                  initial={reduce ? false : { scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={view}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.35, ease: EASE_OUT_EXPO }}
                />
                <motion.span
                  aria-hidden="true"
                  className="absolute left-16 -right-4 top-6 hidden h-0.5 origin-left rounded-full bg-gradient-to-r from-accent to-secondary-light md:block"
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={view}
                  transition={{ duration: 0.9, delay: 0.35 + i * 0.35, ease: EASE_OUT_EXPO }}
                />
              </>
            )}

            <motion.span
              className="absolute left-0 top-0 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-lg font-extrabold text-white shadow-glow-accent md:relative"
              initial={reduce ? false : { scale: 0.5, opacity: 0, rotate: -12 }}
              whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
              viewport={view}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.35 }}
            >
              {step.icon ?? <span className="font-[family-name:var(--font-display)]">{i + 1}</span>}
            </motion.span>

            <div className="md:mt-5 md:flex md:flex-1 md:flex-col">
              {step.label && (
                <p
                  className={twMerge(
                    'text-[11px] font-bold uppercase tracking-[0.18em] mb-1',
                    dark ? 'text-highlight' : 'text-accent-dark'
                  )}
                >
                  {step.label}
                </p>
              )}
              <h3 className={twMerge('text-lg md:text-xl font-extrabold leading-snug', dark ? 'text-white' : 'text-primary')}>
                {step.title}
              </h3>
              {step.desc && (
                <div className={twMerge('mt-2 text-sm md:text-[15px] leading-relaxed', dark ? 'text-white/70' : 'text-gray-600')}>
                  {step.desc}
                </div>
              )}
              {step.image && (
                <div className="pt-4 md:mt-auto">
                  <div className="group overflow-hidden rounded-2xl shadow-md ring-1 ring-primary/[0.08]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={step.image}
                      alt={step.imageAlt ?? step.title}
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    />
                  </div>
                </div>
              )}
              {step.link && (
                <a
                  href={step.link.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className={twMerge(
                    'group mt-3 inline-flex self-start items-center gap-1 text-sm font-bold transition-colors md:mt-auto md:pt-3',
                    dark ? 'text-highlight hover:text-white' : 'text-accent-dark hover:text-primary'
                  )}
                >
                  {step.link.label}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

/* ─────────────────────────── Layer meter ─────────────────────────── */

/**
 * Membrane thickness bar: each layer fills in turn when scrolled into view.
 * Values are the page's own figures (e.g. 20 + 20 mils).
 */
export function LayerMeter({
  title,
  layers,
  total,
  note,
  className,
}: {
  title: string
  layers: { label: string; value: number }[]
  total: string
  note?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  const sum = layers.reduce((acc, l) => acc + l.value, 0)
  const fills = ['from-secondary to-secondary-light', 'from-accent to-accent-light', 'from-highlight-dark to-highlight']

  return (
    <div
      className={twMerge(
        'rounded-2xl bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-primary/[0.08] shadow-sm',
        className
      )}
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">{title}</p>
        <p className="text-sm font-extrabold text-primary">{total}</p>
      </div>
      <div className="flex h-5 w-full gap-1 overflow-hidden rounded-full bg-primary/[0.06] p-0.5">
        {layers.map((layer, i) => (
          <motion.span
            key={layer.label}
            className={twMerge('h-full origin-left rounded-full bg-gradient-to-r', fills[i % fills.length])}
            style={{ width: `${(layer.value / sum) * 100}%` }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.9, delay: 0.2 + i * 0.6, ease: EASE_OUT_EXPO }}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-1">
        {layers.map((layer) => (
          <p
            key={layer.label}
            className="text-xs font-semibold text-gray-500"
            style={{ width: `${(layer.value / sum) * 100}%` }}
          >
            {layer.label} · <span className="text-primary">{layer.value} mils</span>
          </p>
        ))}
      </div>
      {note && <p className="mt-3 text-xs text-gray-500 leading-relaxed">{note}</p>}
    </div>
  )
}

/* ─────────────────────────── Tilt card ─────────────────────────── */

/**
 * Wrapper that tilts its content toward the pointer (mouse only). The outer
 * element stays transform-free so the site scroll-reveal can animate it.
 */
export function TiltCard({
  children,
  className,
  wrapperClassName,
  max = 7,
}: {
  children: React.ReactNode
  className?: string
  wrapperClassName?: string
  max?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const rotateX = useSpring(rx, { stiffness: 220, damping: 18 })
  const rotateY = useSpring(ry, { stiffness: 220, damping: 18 })

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * max * 2)
    rx.set(-py * max * 2)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div className={twMerge('h-full [perspective:1000px]', wrapperClassName)}>
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={twMerge('h-full', className)}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ──────────────────────── Scroll chapter rail ──────────────────────── */

export interface Chapter {
  /** Short node label, e.g. "1" or "Go". */
  node: React.ReactNode
  eyebrow: string
  title: string
  children: React.ReactNode
}

/**
 * Vertical chapter list with a rail that fills as the reader scrolls
 * through it.
 */
export function ChapterRail({ chapters, className }: { chapters: Chapter[]; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 })

  return (
    <div ref={ref} className={twMerge('relative', className)}>
      <span aria-hidden="true" className="absolute left-5 top-2 bottom-2 w-0.5 rounded-full bg-primary/10 md:left-6" />
      <motion.span
        aria-hidden="true"
        className="absolute left-5 top-2 bottom-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-accent via-secondary-light to-accent md:left-6"
        style={{ scaleY: reduce ? 1 : fill }}
      />
      <ol className="space-y-10 md:space-y-12">
        {chapters.map((chapter, i) => (
          <li key={chapter.title} className="relative pl-14 md:pl-20">
            <motion.span
              className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-sm font-extrabold text-white shadow-glow-accent ring-4 ring-white md:h-12 md:w-12 md:rounded-2xl md:text-base"
              initial={reduce ? false : { scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i === 0 ? 0.1 : 0 }}
            >
              {chapter.node}
            </motion.span>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-dark">{chapter.eyebrow}</p>
            <h3 className="mb-4 text-xl md:text-2xl font-extrabold text-primary">{chapter.title}</h3>
            {chapter.children}
          </li>
        ))}
      </ol>
    </div>
  )
}
