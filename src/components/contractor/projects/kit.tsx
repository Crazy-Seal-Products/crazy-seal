'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore, type ComponentProps, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronDown, Search, UserRound, X } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalResult } from '@/lib/contractor/guard'
import type { ProjectSite, ProjectStage } from '@/lib/contractor/types'
import { PROJECT_STAGE_LABEL } from '@/lib/contractor/types'
import { EASE_OUT_EXPO } from '@/components/motion'
import { portalInput } from '@/components/portal/ui'

/**
 * Small pieces the contractor portal's project and customer screens share,
 * modeled on Thermo's dealer-portal kit and colored by the portal theme's
 * --p-* variables: a dialog, form fields, the result line under a form, stage
 * and owner pills, a search pill, a pill select and the data table.
 */

import type { TeamOption } from '@/lib/contractor/projects'

export type { TeamOption }

/** Background for <option>s so native dropdowns stay readable on the portal's dark looks. */
export const OPTION_STYLE = { background: 'var(--p-raised, #1F2328)', color: 'var(--p-ink, #fff)' } as const

export const labelCls = 'mb-1.5 block text-xs font-semibold text-[var(--p-muted,#9DA3AB)]'

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={twMerge('block', className)}>
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-[var(--p-muted,#9DA3AB)] opacity-75">{hint}</span>}
    </label>
  )
}

/** The error (or success message) a server action returned. */
export function FormNotice({ state, className }: { state: PortalResult | null; className?: string }) {
  if (!state) return null
  if (state.ok && !state.message) return null
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
      role={state.ok ? 'status' : 'alert'}
      className={twMerge('flex items-start gap-2 rounded-xl px-3 py-2 text-xs ring-1', className)}
      style={state.ok ? tint('var(--p-primary, #6DC015)') : tint(RED)}
    >
      {state.ok ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />}
      {state.ok ? state.message : state.error}
    </motion.p>
  )
}

/* ------------------------------------------------------------------ dialog */

// The dialog renders at the end of <body>, outside the panels (their blur and
// motion would trap a fixed overlay), so it copies the theme's variables from
// the spot it was opened in. The photo lightbox (ProjectMedia) does the same.
export const THEME_VARS = [
  '--p-primary',
  '--p-primary-deep',
  '--p-primary-ink',
  '--p-primary-grad',
  '--p-glow',
  '--p-accent',
  '--p-kicker',
  '--p-surface',
  '--p-raised',
  '--p-ink',
  '--p-muted',
  '--p-panel',
  '--p-line',
  '--p-shadow',
  '--cs-primary',
  '--cs-primary-light',
  '--cs-primary-dark',
  '--color-blue-100',
  '--color-blue-200',
] as const

const subscribeNothing = () => () => {}

/** True in the browser, false while rendering on the server. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  )
}

/**
 * Thermo's modal: a glass sheet that springs up over a blurred backdrop (a
 * bottom sheet on phones). Pass `open` to keep it mounted so it can animate
 * out; without it the dialog shows whenever it's rendered.
 */
export function Modal({
  title,
  open = true,
  onClose,
  children,
  wide = false,
}: {
  title: string
  open?: boolean
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  const anchor = useRef<HTMLSpanElement>(null)
  const isClient = useIsClient()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  const adoptTheme = useCallback((el: HTMLDivElement | null) => {
    if (!el || !anchor.current) return
    const from = getComputedStyle(anchor.current)
    for (const name of THEME_VARS) {
      const value = from.getPropertyValue(name).trim()
      if (value) el.style.setProperty(name, value)
    }
  }, [])

  const focusDialog = useCallback((el: HTMLDivElement | null) => {
    el?.focus({ preventScroll: true })
  }, [])

  return (
    <>
      <span ref={anchor} hidden />
      {isClient &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="modal"
                ref={adoptTheme}
                className="fixed inset-0 z-[60] flex items-end justify-center font-sans antialiased [color-scheme:dark] sm:items-center sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <button type="button" aria-label="Close" className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-md" onClick={onClose} />
                <motion.div
                  ref={focusDialog}
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  tabIndex={-1}
                  className={twMerge(
                    'relative max-h-[92vh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-[var(--p-line,rgba(255,255,255,0.1))] p-6 text-[var(--p-ink,#F5F1EC)] outline-none sm:rounded-3xl md:p-7',
                    'shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_50px_120px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(0,0,0,0.2)]',
                    wide ? 'max-w-3xl' : 'max-w-lg',
                  )}
                  style={{ background: 'var(--p-panel), var(--p-raised, #1F2328)' }}
                  initial={{ y: 56, opacity: 0, scale: 0.97 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: 36, opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 360, damping: 32, mass: 0.9 }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--p-primary,#6DC015)] to-transparent opacity-70"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.12] blur-3xl"
                  />
                  <div className="relative mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold md:text-xl">{title}</h2>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.04] text-[var(--p-muted,#9DA3AB)] transition duration-300 hover:rotate-90 hover:bg-white/10 hover:text-[var(--p-ink,#fff)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="relative">{children}</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}

/* ------------------------------------------------------------------ helpers */

/** The list's options, plus the value already saved when it isn't one of them (older records). */
export function withCurrent(options: readonly string[], current: string | null | undefined): string[] {
  return current && !options.includes(current) ? [...options, current] : [...options]
}

/**
 * A team picker's options: people with access, plus whoever the record is
 * assigned to now even if their access is off or they left (teamOptions marks
 * them inactive), so saving the form doesn't quietly clear the assignment.
 */
export function teamFor(options: TeamOption[], current: string | null | undefined): TeamOption[] {
  return options.filter((o) => !o.inactive || o.id === current)
}

/** "Austin, TX" from a site or customer, or ''. */
export function placeLine(p: { city?: string | null; state?: string | null; zip?: string | null } | null | undefined): string {
  if (!p) return ''
  const town = [p.city, p.state].filter(Boolean).join(', ')
  return town || p.zip || ''
}

/** "12 Oak St, Austin, TX 78701" from a project site, or ''. */
export function siteLine(site: ProjectSite | null | undefined): string {
  if (!site) return ''
  const stateZip = [site.state, site.zip].filter(Boolean).join(' ')
  return [site.street, site.city, stateZip].filter(Boolean).join(', ')
}

export function initials(name: string | null | undefined): string {
  return (
    (name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  )
}

/* ------------------------------------------------------------------- pills */

const RED = '#FF7A6B'
const SKY = '#4CC3FF'

/** A soft tint of a color: its wash, its text and a hairline ring. */
export function tint(color: string): CSSProperties {
  return {
    background: `color-mix(in oklab, ${color} 15%, transparent)`,
    color: `color-mix(in oklab, ${color} 80%, white)`,
    ['--tw-ring-color' as string]: `color-mix(in oklab, ${color} 30%, transparent)`,
  }
}

/** Each stage's color: board column dots, the stepper and stage pills. */
export const STAGE_COLOR: Record<ProjectStage, string> = {
  lead: 'var(--p-accent, #F9EA1C)',
  quoted: SKY,
  won: '#A3E635',
  ordered: '#B794F6',
  in_progress: '#FF9F45',
  complete: 'var(--p-primary, #6DC015)',
  lost: RED,
}

/** The orange used for where the crew is while installing. */
export const INSTALL_COLOR = STAGE_COLOR.in_progress

export function StageDot({ stage, className }: { stage: ProjectStage; className?: string }) {
  const c = STAGE_COLOR[stage]
  return <span aria-hidden="true" className={twMerge('h-2 w-2 shrink-0 rounded-full', className)} style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
}

const PILL = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1'

export function StagePill({ stage, className }: { stage: ProjectStage; className?: string }) {
  if (stage === 'complete') {
    return (
      <span
        className={twMerge(
          PILL,
          'bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[0_6px_16px_-8px_var(--p-primary)] ring-white/15',
          className,
        )}
      >
        <CheckCircle2 className="h-3 w-3" />
        {PROJECT_STAGE_LABEL[stage]}
      </span>
    )
  }
  return (
    <span className={twMerge(PILL, className)} style={tint(STAGE_COLOR[stage])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_6px_currentColor]" />
      {PROJECT_STAGE_LABEL[stage]}
    </span>
  )
}

const TONE_COLOR = {
  good: 'var(--p-primary, #6DC015)',
  warn: 'var(--p-accent, #F9EA1C)',
  bad: RED,
  info: SKY,
} as const

/** A pill for statuses from other tables (quotes, orders, warranties). */
export function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  if (tone === 'neutral') {
    return <span className={twMerge(PILL, 'bg-white/[0.06] text-[var(--p-muted,#9DA3AB)] ring-white/[0.06]')}>{children}</span>
  }
  return (
    <span className={PILL} style={tint(TONE_COLOR[tone])}>
      {children}
    </span>
  )
}

/** Who owns a record: Thermo's quiet owner pill, with initials. */
export function OwnerPill({ name, className }: { name: string | null | undefined; className?: string }) {
  return (
    <span
      className={twMerge(
        'inline-flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full bg-white/[0.06] py-0.5 pl-0.5 pr-2.5 text-[11px] font-semibold text-[var(--p-muted,#9DA3AB)] ring-1 ring-white/[0.06]',
        className,
      )}
    >
      {name ? (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[9px] font-bold text-[var(--p-primary-ink,#fff)]">
          {initials(name)}
        </span>
      ) : (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.08]">
          <UserRound className="h-3 w-3" />
        </span>
      )}
      <span className="truncate">{name ?? 'Unassigned'}</span>
    </span>
  )
}

/* ------------------------------------------------------------- inputs, etc */

/** Thermo's search pill: a rounded field with a search icon and a clear button. */
export function SearchPill({
  value,
  onChange,
  placeholder = 'Search',
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
  className?: string
}) {
  return (
    <label
      className={twMerge(
        'group flex min-w-0 items-center gap-2 rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 px-3.5 py-2 text-sm text-[var(--p-muted,#9DA3AB)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition',
        'focus-within:border-[color-mix(in_oklab,var(--p-primary)_60%,transparent)] focus-within:ring-4 focus-within:ring-[color-mix(in_oklab,var(--p-primary)_18%,transparent)]',
        className,
      )}
    >
      <Search className="h-4 w-4 shrink-0 transition-colors group-focus-within:text-[var(--p-primary,#6DC015)]" />
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-[var(--p-ink,#fff)] outline-none placeholder:text-[var(--p-muted,#9DA3AB)] placeholder:opacity-60"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 hover:text-[var(--p-ink,#fff)]"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </label>
  )
}

/** A native select drawn as a portal field with its own chevron. */
export function ChevronSelect({ className, wrapperClassName, ...props }: ComponentProps<'select'> & { wrapperClassName?: string }) {
  return (
    <div className={twMerge('relative', wrapperClassName)}>
      <select {...props} className={twMerge(portalInput, 'cursor-pointer appearance-none pr-9', className)} />
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--p-muted,#9DA3AB)]" />
    </div>
  )
}

/** Thermo's data table: uppercase, tracked column heads in the muted color over hairline rows. */
export function DataTable({
  head,
  children,
  minWidth = 640,
}: {
  head: { label: string; align?: 'right'; className?: string; srOnly?: boolean }[]
  children: React.ReactNode
  minWidth?: number
}) {
  return (
    <div className="-mx-5 overflow-x-auto overflow-y-hidden px-5 [color-scheme:dark] md:-mx-6 md:px-6">
      <table className="w-full text-left text-sm text-[var(--p-ink,#F5F1EC)]" style={{ minWidth }}>
        <thead>
          <tr className="text-[11px] uppercase tracking-[0.14em] text-[var(--p-muted,#9DA3AB)]">
            {head.map((h, i) => (
              <th key={i} scope="col" className={twMerge('pb-3 pr-4 font-semibold last:pr-0', h.align === 'right' && 'text-right', h.className)}>
                {h.srOnly ? <span className="sr-only">{h.label}</span> : h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

/** A table row's classes, and how each row fades in (staggered by index, capped). */
export const rowCls = 'border-t border-[var(--p-line,rgba(255,255,255,0.06))] align-top transition-colors hover:bg-white/[0.025]'
export const cellCls = 'py-3.5 pr-4 last:pr-0'
export function rowMotion(i: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(i * 0.03, 0.45) },
  }
}

/** A little uppercase label, for definition lists and sub-sections. */
export function MiniLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={twMerge('text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]', className)}>{children}</p>
}

export function EmptyNote({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={twMerge(
        'rounded-2xl border border-dashed border-[var(--p-line,rgba(255,255,255,0.1))] bg-white/[0.015] px-4 py-7 text-center text-sm text-[var(--p-muted,#9DA3AB)]',
        className,
      )}
    >
      {children}
    </p>
  )
}
