'use client'

import { useActionState, useRef, useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, Hammer, Loader2, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalResult } from '@/lib/contractor/guard'
import {
  CONDITION_COLOR,
  CONDITION_HELP,
  CONDITION_LABEL,
  CONDITION_SCALE,
  NO_SCORE_COLOR,
  SEVERITY_COLOR,
  SEVERITY_HELP,
  SEVERITY_LABEL,
  conditionOf,
  type Condition,
  type DeficiencyStatus,
  type EstimateStatus,
  type PlanStatus,
  type Severity,
} from '@/lib/contractor/roof-shared'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, ViewHeader, portalButton } from '@/components/portal/ui'
import { ChevronSelect, OPTION_STYLE, Pill, tint } from '../projects/kit'

/**
 * The Roofs pages' building blocks, ported from Thermo's roofKit (condition
 * and severity badges, the score ring, the condition distribution bar, the
 * stat strip, the year bars and the segmented tabs) and colored by the
 * portal theme's --p-* variables like the rest of the contractor portal.
 */

/* ----------------------------------------------------------------- badges */

function Dot({ color }: { color: string }) {
  return <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
}

const BADGE = 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1'

/** "Fair · 64", or "Not inspected" before a roof's first inspection. */
export function ConditionBadge({ score, className }: { score: number | null; className?: string }) {
  if (score === null) {
    return (
      <span className={twMerge(BADGE, 'bg-white/[0.05] text-[var(--p-muted,#9DA3AB)] ring-white/[0.08]', className)} title="No inspection recorded yet.">
        <Dot color={NO_SCORE_COLOR} />
        Not inspected
      </span>
    )
  }
  const c = conditionOf(score)
  return (
    <span className={twMerge(BADGE, className)} style={tint(CONDITION_COLOR[c])} title={`${CONDITION_LABEL[c]} condition · ${score}/100. ${CONDITION_HELP[c]}`}>
      <Dot color="currentColor" />
      {CONDITION_LABEL[c]}
      <span className="tabular-nums opacity-80">· {score}</span>
    </span>
  )
}

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span className={twMerge(BADGE, className)} style={tint(SEVERITY_COLOR[severity])} title={`${SEVERITY_LABEL[severity]} severity. ${SEVERITY_HELP[severity]}`}>
      <Dot color="currentColor" />
      {SEVERITY_LABEL[severity]}
    </span>
  )
}

const DEFICIENCY_TONE: Record<DeficiencyStatus, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  open: 'bad',
  scoped: 'info',
  scheduled: 'warn',
  resolved: 'good',
  monitor: 'neutral',
}
export function deficiencyTone(s: DeficiencyStatus) {
  return DEFICIENCY_TONE[s]
}

const ESTIMATE_TONE: Record<EstimateStatus, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = { draft: 'neutral', sent: 'warn', approved: 'good', declined: 'bad' }
export function estimateTone(s: EstimateStatus) {
  return ESTIMATE_TONE[s]
}

const PLAN_TONE: Record<PlanStatus, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = { proposed: 'neutral', approved: 'info', funded: 'warn', done: 'good', deferred: 'bad' }
export function planTone(s: PlanStatus) {
  return PLAN_TONE[s]
}

/** Each plan status's color, for chips and the year bars. */
export const PLAN_COLOR: Record<PlanStatus, string> = {
  proposed: 'rgba(255,255,255,0.45)',
  approved: '#4CC3FF',
  funded: 'var(--p-accent, #F9EA1C)',
  done: 'var(--p-primary, #6DC015)',
  deferred: '#FF7A6B',
}

export { Pill }

/* ----------------------------------------------------------- measurements */

/** The 0–100 condition score as a ring that fills in its condition's color; a dashed ring before the first inspection. */
export function ScoreRing({ score, size = 52, stroke = 5, tip, className }: { score: number | null; size?: number; stroke?: number; tip?: string; className?: string }) {
  const r = size / 2 - stroke
  const circ = 2 * Math.PI * r
  if (score === null) {
    return (
      <span
        title={tip ?? 'No inspection recorded yet, so there’s no condition score.'}
        className={twMerge('grid shrink-0 place-items-center rounded-full border border-dashed border-white/20 text-xs font-semibold text-[var(--p-muted,#9DA3AB)]', className)}
        style={{ width: size, height: size }}
      >
        —
      </span>
    )
  }
  const c: Condition = conditionOf(score)
  const color = CONDITION_COLOR[c]
  return (
    <span
      title={`Condition ${score}/100 · ${CONDITION_LABEL[c]}.${tip ? ` ${tip}` : ''} ${CONDITION_SCALE}`}
      className={twMerge('relative grid shrink-0 cursor-help place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - Math.max(0, Math.min(100, score)) / 100) }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.1 }}
          style={{ filter: `drop-shadow(0 0 4px color-mix(in oklab, ${color} 60%, transparent))` }}
        />
      </svg>
      <span className="absolute text-sm font-bold tabular-nums text-[var(--p-ink,#F5F1EC)]" style={size < 46 ? { fontSize: 12 } : undefined}>
        {score}
      </span>
      <span className="sr-only">Condition {score} out of 100</span>
    </span>
  )
}

/** A table cell's condition: a short bar filled to the score, in its condition's color. */
export function ConditionMeter({ score, delay = 0.15 }: { score: number | null; delay?: number }) {
  if (score === null) return <span className="text-xs text-[var(--p-muted,#9DA3AB)]">Not inspected</span>
  const c = conditionOf(score)
  const color = CONDITION_COLOR[c]
  return (
    <span className="flex min-w-[8.5rem] items-center gap-2.5" title={`${CONDITION_LABEL[c]} · ${score}/100. ${CONDITION_HELP[c]}`}>
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.span
          className="block h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 10px -2px ${color}` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(3, score)}%` }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay }}
        />
      </span>
      <span className="text-xs font-semibold tabular-nums" style={{ color: `color-mix(in oklab, ${color} 85%, white)` }}>
        {score}
      </span>
    </span>
  )
}

/** A stacked bar of how much roof sits in each condition, with a legend. */
export function ConditionBar({ parts, unit = '' }: { parts: { condition: Condition | 'none'; value: number }[]; unit?: string }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1
  const color = (c: Condition | 'none') => (c === 'none' ? NO_SCORE_COLOR : CONDITION_COLOR[c])
  const label = (c: Condition | 'none') => (c === 'none' ? 'Not inspected' : CONDITION_LABEL[c])
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-white/[0.06]">
        {parts.map((p, i) =>
          p.value > 0 ? (
            <motion.div
              key={p.condition}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ background: color(p.condition) }}
              initial={{ width: 0 }}
              animate={{ width: `${(p.value / total) * 100}%` }}
              transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.1 + i * 0.08 }}
              title={`${label(p.condition)}: ${Math.round((p.value / total) * 100)}%`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--p-muted,#9DA3AB)]">
        {parts
          .filter((p) => p.value > 0)
          .map((p) => (
            <span key={p.condition} className="inline-flex items-center gap-1.5">
              <Dot color={color(p.condition)} /> {label(p.condition)} {p.value / total < 0.01 ? '<1' : Math.round((p.value / total) * 100)}%
              {unit ? <span className="opacity-70">({p.value.toLocaleString('en-US')} {unit})</span> : null}
            </span>
          ))}
      </div>
    </div>
  )
}

/** Vertical bars by label (years): a primary and an optional stacked secondary series. */
export function Bars({
  data,
  height = 180,
  format = (n: number) => n.toLocaleString('en-US'),
  primaryLabel,
  secondaryLabel,
}: {
  data: { label: string; primary: number; secondary?: number }[]
  height?: number
  format?: (n: number) => string
  primaryLabel?: string
  secondaryLabel?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.primary + (d.secondary ?? 0)))
  return (
    <div>
      <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
        {data.map((d, i) => {
          const total = d.primary + (d.secondary ?? 0)
          return (
            <div key={d.label} className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] tabular-nums text-[var(--p-ink,#F5F1EC)] opacity-70 transition group-hover:opacity-100">{total > 0 ? format(total) : ''}</span>
              <motion.div
                className="flex w-full max-w-[52px] flex-col-reverse overflow-hidden rounded-t-lg shadow-[0_0_24px_-10px_var(--p-primary,#6DC015)]"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(total > 0 ? 2 : 0, (total / max) * 100)}%` }}
                transition={{ duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.15 + i * 0.06 }}
              >
                <div style={{ height: `${(d.primary / (total || 1)) * 100}%`, background: 'linear-gradient(180deg, var(--p-accent, #F9EA1C), var(--p-primary, #6DC015))' }} />
                {d.secondary ? <div style={{ height: `${(d.secondary / total) * 100}%`, background: 'rgba(255,255,255,0.22)' }} /> : null}
              </motion.div>
              <span className="text-[11px] tabular-nums text-[var(--p-muted,#9DA3AB)]">{d.label}</span>
            </div>
          )
        })}
      </div>
      {(primaryLabel || secondaryLabel) && (
        <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-[var(--p-muted,#9DA3AB)]">
          {primaryLabel && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-[var(--p-primary,#6DC015)]" /> {primaryLabel}
            </span>
          )}
          {secondaryLabel && (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-white/25" /> {secondaryLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ----------------------------------------------------------------- stats */

/** Thermo's stat strip: one glass card of headline numbers split by hairlines. */
export function StatStrip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.05 }}
      className={twMerge(
        'mb-6 overflow-hidden rounded-3xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-[image:var(--p-panel)] shadow-[var(--p-shadow)] backdrop-blur-xl',
        className,
      )}
    >
      <div className="-mb-px -mr-px grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] [&>*]:border-b [&>*]:border-r [&>*]:border-[var(--p-line,rgba(255,255,255,0.08))]">
        {children}
      </div>
    </motion.div>
  )
}

const TONE: Record<'good' | 'warn' | 'bad', string> = { good: 'var(--p-primary, #6DC015)', warn: '#FF9F45', bad: '#FF7A6B' }

export function StatCell({
  label,
  value,
  display,
  prefix,
  suffix,
  hint,
  icon: Icon,
  tone,
  onClick,
  delay = 0,
}: {
  label: string
  /** A number counts up; use `display` for text values. */
  value?: number
  display?: ReactNode
  prefix?: string
  suffix?: string
  hint?: string
  icon: LucideIcon
  tone?: 'good' | 'warn' | 'bad'
  onClick?: () => void
  delay?: number
}) {
  const color = tone ? TONE[tone] : 'var(--p-accent, #F9EA1C)'
  const body = (
    <>
      <span className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1" style={tint(color)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 text-[12px] font-medium leading-snug text-[var(--p-muted,#9DA3AB)]">{label}</span>
      </span>
      <span
        className="mt-2.5 block text-[1.7rem] font-bold leading-none tracking-[-0.02em] tabular-nums"
        style={{ color: tone ? `color-mix(in oklab, ${color} 85%, white)` : 'var(--p-ink, #F5F1EC)' }}
      >
        {display ?? <CountUp value={value ?? 0} prefix={prefix} suffix={suffix} />}
      </span>
      {hint && <span className="mt-1.5 block truncate text-[12px] text-[var(--p-muted,#9DA3AB)]">{hint}</span>}
      {onClick && <ArrowUpRight aria-hidden="true" className="absolute right-3 top-3 h-3.5 w-3.5 text-[var(--p-muted,#9DA3AB)] opacity-0 transition group-hover:opacity-80" />}
    </>
  )
  const cls = 'group relative block h-full w-full min-w-0 px-5 py-4 text-left'
  return (
    <motion.div className="min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 + delay }}>
      {onClick ? (
        <button type="button" onClick={onClick} className={twMerge(cls, 'transition-colors hover:bg-white/[0.03]')}>
          {body}
        </button>
      ) : (
        <div className={cls}>{body}</div>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ tabs */

/** A segmented control with a highlight that slides to the active option. */
export function Tabs<T extends string>({
  id,
  value,
  onChange,
  options,
  className,
}: {
  id: string
  value: T
  onChange: (v: T) => void
  options: { id: T; label: string; count?: number }[]
  className?: string
}) {
  return (
    <div
      role="tablist"
      className={twMerge(
        'relative inline-flex max-w-full flex-wrap gap-0.5 rounded-full border border-[var(--p-line,rgba(255,255,255,0.1))] bg-black/20 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
        className,
      )}
    >
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.id)}
            className={twMerge(
              'relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300',
              on ? 'text-[var(--p-primary-ink,#fff)]' : 'text-[var(--p-muted,#9DA3AB)] hover:text-[var(--p-ink,#fff)]',
            )}
          >
            {on && (
              <motion.span
                layoutId={`roof-tabs-${id}`}
                className="absolute inset-0 rounded-full bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] shadow-[var(--p-glow)]"
                transition={{ type: 'spring', stiffness: 480, damping: 36 }}
              />
            )}
            <span className="relative">{o.label}</span>
            {o.count !== undefined && (
              <span className={twMerge('relative rounded-full px-1.5 text-[10px] tabular-nums', on ? 'bg-black/20' : 'bg-white/[0.08]')}>{o.count}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------- empty, etc */

/** A big, friendly empty state with an icon tile and an optional call to action. */
export function BigEmpty({
  icon: Icon = Building2,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon
  title: string
  children?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <Panel className={twMerge('grid place-items-center px-6 py-16 text-center', className)}>
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-5 text-xl font-bold text-[var(--p-ink,#fff)]">{title}</h2>
      {children && <div className="mt-2 max-w-md text-sm text-[var(--p-muted,#9DA3AB)]">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </Panel>
  )
}

/** A link styled as the primary button, for empty states. */
export function ButtonLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={twMerge(portalButton, className)}>
      {children}
    </Link>
  )
}

/** A small card with an uppercase title, for the roof record. */
export function Card({ title, children, className, action }: { title: string; children: ReactNode; className?: string; action?: ReactNode }) {
  return (
    <section className={twMerge('rounded-2xl border border-[var(--p-line,rgba(255,255,255,0.08))] bg-white/[0.025] p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--p-muted,#9DA3AB)]">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Label / value rows. Empty values show as a dash. */
export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <dt className="shrink-0 text-[var(--p-muted,#9DA3AB)]">{k}</dt>
          <dd className="min-w-0 text-right font-medium text-[var(--p-ink,#F5F1EC)]">{v === undefined || v === null || v === '' ? '—' : v}</dd>
        </div>
      ))}
    </dl>
  )
}

/* -------------------------------------------------------------- actions */

type FormAction = (prev: PortalResult | null, fd: FormData) => Promise<PortalResult>

/**
 * A compact status dropdown: picking an option submits `action` with the
 * record's id and the new status (like the project board's Move to…).
 */
export function StatusSelect({
  action,
  id,
  value,
  options,
  label,
  placeholder = 'Change status…',
  extra,
  className,
}: {
  action: FormAction
  id: string
  value: string
  options: { value: string; label: string }[]
  label: string
  placeholder?: string
  /** More hidden fields to send. */
  extra?: Record<string, string>
  className?: string
}) {
  const [state, run, pending] = useActionState<PortalResult | null, FormData>(action, null)
  const formRef = useRef<HTMLFormElement>(null)
  const choices = options.filter((o) => o.value !== value)
  if (!choices.length) return null
  return (
    <form ref={formRef} action={run} className={className}>
      <input type="hidden" name="id" value={id} />
      {extra && Object.entries(extra).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <div className="relative">
        <ChevronSelect
          key={value}
          name="status"
          aria-label={label}
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) formRef.current?.requestSubmit()
          }}
          className="!rounded-xl !bg-black/25 !py-1.5 !pl-3 !text-xs font-semibold text-[var(--p-muted,#9DA3AB)] hover:border-[color-mix(in_oklab,var(--p-primary)_45%,transparent)] hover:text-[var(--p-ink,#fff)] disabled:opacity-60"
        >
          <option value="" disabled style={OPTION_STYLE}>
            {placeholder}
          </option>
          {choices.map((o) => (
            <option key={o.value} value={o.value} style={OPTION_STYLE}>
              {o.label}
            </option>
          ))}
        </ChevronSelect>
        {pending && <Loader2 className="absolute right-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-[var(--p-primary,#6DC015)]" />}
      </div>
      {state && !state.ok && <p className="mt-1 text-[11px] text-red-200">{state.error}</p>}
    </form>
  )
}

/**
 * A small text button that runs `action` with `fields` (Mark done, Defer,
 * Delete…). It isn't a form, so it can sit inside one (a form's footer).
 */
export function RunButton({
  action,
  fields,
  children,
  className,
  confirm,
  onDone,
}: {
  action: FormAction
  fields: Record<string, string>
  children: ReactNode
  className?: string
  /** Ask first (deletes). */
  confirm?: string
  onDone?: (r: PortalResult) => void
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return
          const fd = new FormData()
          for (const [k, v] of Object.entries(fields)) fd.append(k, v)
          start(async () => {
            const r = await action(null, fd)
            setError(r.ok ? null : r.error)
            if (r.ok) onDone?.(r)
          })
        }}
        className={twMerge('inline-flex items-center gap-1 text-xs font-semibold transition disabled:opacity-60', className)}
      >
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        {children}
      </button>
      {error && (
        <span role="alert" className="text-[11px] text-red-200">
          {error}
        </span>
      )}
    </span>
  )
}

/** A text link styled like Thermo's quiet "open" links. */
export function QuietLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={twMerge('group inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-primary,#6DC015)] hover:underline', className)}>
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}

/** Triggers a browser download of text (CSV export). */
export function downloadText(filename: string, text: string, type = 'text/csv;charset=utf-8'): void {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** What the Roofs pages show until the roof tables are in the database (migration 037). */
export function RoofsSetup({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <ViewHeader kicker={kicker} title={title} />
      <BigEmpty icon={Hammer} title="Roofs is being set up">
        Crazy Seal is finishing the Roofs section of your portal: buildings, roof records, inspections, estimates, budget plans and documents. Check back soon. There’s nothing
        you need to do.
      </BigEmpty>
    </div>
  )
}
