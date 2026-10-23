'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from 'framer-motion'
import { twMerge } from 'tailwind-merge'

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

/** Fades and lifts its children into place the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
  ...rest
}: {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'span'
} & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduce = useReducedMotion()
  const Tag = motion[as] as typeof motion.div
  return (
    <Tag
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT_EXPO }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const staggerParent: Variants = {
  hidden: {},
  show: (stagger: number) => ({ transition: { staggerChildren: stagger } }),
}

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
}

/** Parent that staggers any `StaggerItem` children as the group enters view. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      custom={stagger}
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  ...rest
}: { children: React.ReactNode; className?: string } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  return (
    <motion.div variants={staggerChild} className={className} {...rest}>
      {children}
    </motion.div>
  )
}

/** Counts from 0 to `value` once it scrolls into view. */
export function CountUp({
  value,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()
  // Server HTML (and no-JS visitors / crawlers) get the real number; the
  // count from zero only starts once the element scrolls into view.
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!inView || reduce) return
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setDisplay(v),
    })
    return () => controls.stop()
  }, [inView, value, duration, reduce])

  return (
    <span ref={ref} className={twMerge('tabular-nums', className)}>
      {prefix}
      {display.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/** Infinite horizontal ticker. Content is duplicated so the loop is seamless. */
export function Marquee({
  children,
  duration = 40,
  className,
  reverse = false,
}: {
  children: React.ReactNode
  duration?: number
  className?: string
  reverse?: boolean
}) {
  return (
    <div className={twMerge('group relative overflow-hidden mask-fade-x', className)}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={
          {
            '--marquee-duration': `${duration}s`,
            animationDirection: reverse ? 'reverse' : undefined,
          } as React.CSSProperties
        }
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

/** Soft blurred colour orb for dark hero backgrounds. Purely decorative. */
export function GlowOrb({
  className,
  color = 'rgb(26 123 196 / 0.55)',
}: {
  className?: string
  color?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={twMerge('pointer-events-none absolute rounded-full blur-3xl animate-drift', className)}
      style={{ background: color }}
    />
  )
}
