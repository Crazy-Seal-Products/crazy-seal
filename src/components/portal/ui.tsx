'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  FileCheck,
  Megaphone,
  Package,
  PlayCircle,
  Presentation,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import type { PortalModule } from '@/lib/portal/modules'

export const MODULE_ICONS: Record<PortalModule['icon'], LucideIcon> = {
  PlayCircle,
  Megaphone,
  Presentation,
  Package,
  Wrench,
  FileCheck,
}

/** Standard portal card. */
export function Panel({
  children,
  className,
  delay = 0,
  as = 'section',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'section' | 'div'
}) {
  const Tag = as === 'div' ? motion.div : motion.section
  return (
    <Tag
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT_EXPO }}
      className={twMerge(
        // Thermo's partner-portal card with depth: the theme's glass fill, hairline border and layered shadow
        // (--p-panel, --p-line, --p-shadow, set by the portal frame).
        'relative rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] p-5 backdrop-blur-xl md:p-6',
        'bg-[image:var(--p-panel,linear-gradient(160deg,rgba(18,95,151,0.3),rgba(3,40,74,0.8)))] shadow-[var(--p-shadow,0_28px_60px_-34px_rgba(0,0,0,0.85))]',
        className
      )}
    >
      {children}
    </Tag>
  )
}

export function PanelTitle({
  children,
  action,
  className,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={twMerge('mb-4 flex items-center justify-between gap-3', className)}>
      <h2 className="text-base font-bold text-[var(--p-ink,#F5F1EC)] md:text-lg">{children}</h2>
      {action}
    </div>
  )
}

export function ViewHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--p-kicker,#F9EA1C)]">{kicker}</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--p-ink,#F5F1EC)] md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-[var(--p-muted,#9DA3AB)]">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </motion.header>
  )
}

export function StatTile({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  hint,
  delay = 0,
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  hint?: string
  delay?: number
}) {
  return (
    // Thermo's workspace tile with depth: label and a glowing icon on one line, the number counting up below.
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.55, delay, ease: EASE_OUT_EXPO }}
      className="group relative overflow-hidden rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-[image:var(--p-panel)] p-4 shadow-[var(--p-shadow)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-40 blur-2xl transition-opacity duration-500 group-hover:opacity-70"
        style={{ background: 'var(--p-primary)' }}
      />
      <div className="relative flex items-center justify-between text-[11px] font-medium text-[var(--p-muted,#9DA3AB)]">
        {label}
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/[0.06] ring-1 ring-white/10">
          <Icon className="h-3.5 w-3.5 text-[var(--p-accent,#F9EA1C)]" />
        </span>
      </div>
      <p className="relative mt-2 text-2xl font-bold tabular-nums text-[var(--p-ink,#F5F1EC)] md:text-[1.7rem]">
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </p>
      {hint && <p className="relative mt-0.5 text-xs text-[var(--p-muted,#9DA3AB)]">{hint}</p>}
    </motion.div>
  )
}

export function ProgressBar({
  pct,
  className,
  barClassName,
  delay = 0.2,
}: {
  pct: number
  className?: string
  barClassName?: string
  delay?: number
}) {
  return (
    <div className={twMerge('h-1.5 overflow-hidden rounded-full bg-white/[0.08]', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 1.1, delay, ease: EASE_OUT_EXPO }}
        className={twMerge(
          'h-full rounded-full bg-gradient-to-r from-[var(--p-primary,#6DC015)] to-[var(--p-accent,#F9EA1C)] shadow-[0_0_12px_-2px_var(--p-primary,#6DC015)]',
          barClassName
        )}
      />
    </div>
  )
}

export function ProgressRing({
  pct,
  size = 120,
  stroke = 10,
  children,
  className,
}: {
  pct: number
  size?: number
  stroke?: number
  children?: React.ReactNode
  className?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const id = React.useId()
  return (
    <div className={twMerge('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--p-primary, #6DC015)" />
            <stop offset="100%" stopColor="var(--p-accent, #F9EA1C)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.max(0, Math.min(100, pct))) / 100 }}
          transition={{ duration: 1.4, ease: EASE_OUT_EXPO, delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

// Thermo's pills: the brand color for done, the accent tint for in-flight, quiet gray otherwise.
const DONE = 'bg-[image:var(--p-primary-grad)] bg-[var(--p-primary,#5BA411)] text-[var(--p-primary-ink,#fff)] shadow-[0_6px_16px_-8px_var(--p-primary)]'
const ACTIVE = 'bg-[color-mix(in_oklab,var(--p-accent,#F9EA1C)_15%,transparent)] text-[var(--p-accent,#F9EA1C)]'
const QUIET = 'bg-white/[0.06] text-[var(--p-muted,#9DA3AB)]'
const LOST = 'bg-[rgba(255,106,61,0.12)] text-[#ff8a66]'
const PILL_STYLES: Record<string, string> = {
  new: ACTIVE,
  open: ACTIVE,
  contacted: ACTIVE,
  sent: ACTIVE,
  checkout: ACTIVE,
  quoted: ACTIVE,
  processing: ACTIVE,
  shipped: ACTIVE,
  submitted: ACTIVE,
  in_review: ACTIVE,
  pending_photos: ACTIVE,
  in_design: ACTIVE,
  won: DONE,
  ordered: DONE,
  delivered: DONE,
  registered: DONE,
  approved: DONE,
  resolved: DONE,
  live: DONE,
  complete: DONE,
  lost: LOST,
  cancelled: LOST,
  denied: LOST,
  draft: QUIET,
  transferred: QUIET,
  not_started: QUIET,
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
        PILL_STYLES[status] ?? QUIET
      )}
    >
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}

export { money, portalButton, portalGhostButton, portalInput } from './portal-styles'
