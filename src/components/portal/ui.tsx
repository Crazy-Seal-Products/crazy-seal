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
        'relative rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 md:p-6 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.7)]',
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
      <h2 className="text-base font-bold text-white md:text-lg">{children}</h2>
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
      className="mb-7 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-end"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-highlight">{kicker}</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white md:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-blue-100/60 md:text-base">{description}</p>}
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
    <Panel className="!p-4 md:!p-5 overflow-hidden" delay={delay} as="div">
      <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="flex items-center justify-between text-xs font-medium text-blue-100/60">
        {label}
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.06] text-accent-light ring-1 ring-white/10">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-white md:text-3xl font-[family-name:var(--font-display)]">
        <CountUp value={value} prefix={prefix} suffix={suffix} />
      </p>
      {hint && <p className="mt-1 text-xs text-blue-100/50">{hint}</p>}
    </Panel>
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
        className={twMerge('h-full rounded-full bg-gradient-to-r from-accent to-highlight', barClassName)}
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
            <stop offset="0%" stopColor="#6DC015" />
            <stop offset="100%" stopColor="#F9EA1C" />
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

const PILL_STYLES: Record<string, string> = {
  new: 'bg-highlight/15 text-highlight',
  contacted: 'bg-secondary-light/20 text-blue-200',
  quoted: 'bg-white/10 text-white',
  won: 'bg-accent/20 text-accent-light',
  processing: 'bg-highlight/15 text-highlight',
  shipped: 'bg-secondary-light/20 text-blue-200',
  delivered: 'bg-accent/20 text-accent-light',
  registered: 'bg-accent/20 text-accent-light',
  pending_photos: 'bg-highlight/15 text-highlight',
  transferred: 'bg-white/10 text-white',
  live: 'bg-accent/20 text-accent-light',
  in_design: 'bg-secondary-light/20 text-blue-200',
  draft: 'bg-white/10 text-white',
  not_started: 'bg-white/10 text-blue-100/70',
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
        PILL_STYLES[status] ?? 'bg-white/10 text-white'
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {label ?? status.replace(/_/g, ' ')}
    </span>
  )
}

export const portalInput =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-blue-100/30 outline-none transition focus:border-accent/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-accent/15'

export const portalButton =
  'btn-sheen inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_-8px_rgba(91,164,17,0.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-10px_rgba(91,164,17,0.8)] disabled:opacity-50 disabled:hover:translate-y-0'

export const portalGhostButton =
  'inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.09] hover:border-white/25'

export function money(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}
