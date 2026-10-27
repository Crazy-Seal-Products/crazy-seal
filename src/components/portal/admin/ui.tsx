import React from 'react'
import Link from 'next/link'
import { ArrowDownRight, ArrowUpRight, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { humanize } from '@/lib/portal/admin/format'

/**
 * Crazy Seal Admin building blocks. Dense on purpose: tight padding, 12–13px
 * body text, and a hairline border on every glass surface so sections read
 * as separate blocks. Colours come from the adm-* tokens in globals.css:
 * blue leads, gold marks what matters most.
 */

export const BORDER = 'border-adm-line'
export const DIVIDE = 'divide-adm-line-soft'

export function Panel({
  title,
  meta,
  actions,
  children,
  className,
  bodyClassName,
  tone,
}: {
  title?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
  tone?: 'sales' | 'dealers' | 'info'
}) {
  return (
    <section
      className={twMerge(
        // @container: tables pick their columns from the panel's width, not the
        // window's, so they still fit when the activity rail is open.
        'adm-glass @container relative flex min-w-0 flex-col overflow-hidden rounded-[10px]',
        className,
      )}
    >
      {tone && <span aria-hidden="true" className={twMerge('absolute inset-x-0 top-0 h-px', TONE_RULE[tone])} />}
      {(title || actions) && (
        <header className={twMerge('flex min-h-9 items-center gap-2 border-b px-3 py-1.5', BORDER)}>
          {title && (
            <h2 className="flex items-center gap-2 truncate text-[13px] font-semibold text-adm-ink">
              <span aria-hidden="true" className={twMerge('h-3 w-[3px] shrink-0 rounded-full', TONE_TICK[tone ?? 'info'])} />
              {title}
            </h2>
          )}
          {meta && <span className="truncate text-[11.5px] text-adm-muted">{meta}</span>}
          {actions && <div className="ml-auto flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={twMerge('min-w-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  )
}

const TONE_RULE = {
  sales: 'bg-gradient-to-r from-transparent via-adm-blue-bright/80 to-transparent',
  dealers: 'bg-gradient-to-r from-transparent via-adm-gold/80 to-transparent',
  info: 'bg-gradient-to-r from-transparent via-adm-ink/25 to-transparent',
}

const TONE_TICK = {
  sales: 'bg-adm-blue-bright',
  dealers: 'bg-adm-gold',
  info: 'bg-adm-blue/70',
}

export function PageHeader({
  title,
  description,
  actions,
  children,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="mb-3 space-y-2.5">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight tracking-tight text-adm-ink sm:text-xl">{title}</h1>
          {description && <p className="mt-0.5 text-[12.5px] leading-snug text-adm-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-adm-muted transition hover:text-adm-ink">
      <ChevronLeft className="h-3.5 w-3.5" />
      {children}
    </Link>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────

export function StatGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6', className)}>{children}</div>
}

export function Stat({
  label,
  value,
  delta,
  deltaLabel,
  sub,
  tone = 'sales',
  upIsGood = true,
  hero = false,
}: {
  label: string
  value: React.ReactNode
  /** fractional change, e.g. 0.12 for +12% */
  delta?: number | null
  deltaLabel?: string
  sub?: React.ReactNode
  tone?: 'sales' | 'dealers' | 'info'
  upIsGood?: boolean
  /** The page's headline number: deeper blue tile, gold value. */
  hero?: boolean
}) {
  const hasDelta = delta != null && Number.isFinite(delta)
  const up = hasDelta && delta! >= 0
  const good = up === upIsGood
  return (
    <div className={twMerge('adm-glass relative overflow-hidden rounded-[10px] px-3 py-2.5', hero && 'adm-hero')}>
      <span aria-hidden="true" className={twMerge('absolute inset-x-0 top-0 h-px', hero ? TONE_RULE.dealers : TONE_RULE[tone])} />
      <p className={twMerge('truncate text-[11px] font-medium', hero ? 'text-adm-hero-text' : 'text-adm-muted')}>{label}</p>
      <p className={twMerge('mt-1 truncate text-[20px] font-semibold leading-none tracking-tight tabular-nums', hero ? 'text-adm-hero-ink' : 'text-adm-ink')}>
        {value}
      </p>
      <div className="mt-1.5 flex min-h-[14px] items-center gap-1.5 text-[11px] leading-none">
        {hasDelta && (
          <span
            className={twMerge(
              'inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-semibold',
              good
                ? hero
                  ? 'bg-adm-hero-ink/12 text-adm-hero-ink'
                  : 'bg-adm-blue-bright/15 text-adm-blue-bright'
                : 'bg-red-500/15 text-adm-red',
            )}
          >
            {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta! * 100).toFixed(0)}%
          </span>
        )}
        {(deltaLabel || sub) && <span className={twMerge('truncate', hero ? 'text-adm-hero-soft' : 'text-adm-muted')}>{hasDelta ? deltaLabel : sub}</span>}
      </div>
    </div>
  )
}

export function delta(current: number, previous: number | null | undefined): number | null {
  if (previous == null || previous === 0) return null
  return (current - previous) / previous
}

// ─── Tables ───────────────────────────────────────────────────────────────

export function Table({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={twMerge('w-full border-collapse text-left text-[12.5px] text-adm-text', className)}>{children}</table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className={twMerge('border-b bg-adm-head text-[10.5px] uppercase tracking-[0.08em] text-adm-muted', BORDER)}>{children}</tr>
    </thead>
  )
}

export function Th({ children, className, align }: { children?: React.ReactNode; className?: string; align?: 'right' | 'center' }) {
  return (
    <th
      scope="col"
      className={twMerge('whitespace-nowrap px-3 py-1.5 font-semibold', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}
    >
      {children}
    </th>
  )
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody className={twMerge('divide-y', DIVIDE)}>{children}</tbody>
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={twMerge('transition-colors hover:bg-adm-ink/[0.03]', className)}>{children}</tr>
}

export function Td({
  children,
  className,
  align,
  muted,
  title,
}: {
  children?: React.ReactNode
  className?: string
  align?: 'right' | 'center'
  muted?: boolean
  title?: string
}) {
  return (
    <td
      title={title}
      className={twMerge(
        'whitespace-nowrap px-3 py-1.5 align-middle',
        align === 'right' && 'text-right tabular-nums',
        align === 'center' && 'text-center',
        muted && 'text-adm-muted',
        className,
      )}
    >
      {children}
    </td>
  )
}

export function CellLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={twMerge('font-semibold text-adm-ink underline-offset-2 hover:text-adm-blue-bright hover:underline', className)}>
      {children}
    </Link>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-3 py-6 text-center text-[12.5px] text-adm-muted">{children}</p>
}

// ─── Badges ───────────────────────────────────────────────────────────────

type BadgeTone = 'good' | 'warn' | 'bad' | 'neutral' | 'info' | 'gold'

const BADGE: Record<BadgeTone, string> = {
  good: 'bg-adm-blue-bright/12 text-adm-blue-bright ring-adm-blue-bright/30',
  warn: 'bg-amber-400/10 text-adm-warn ring-amber-400/40',
  bad: 'bg-red-500/10 text-adm-red ring-red-400/30',
  neutral: 'bg-adm-ink/[0.05] text-adm-soft ring-adm-ink/15',
  info: 'bg-adm-ink/[0.04] text-adm-text ring-adm-ink/15',
  gold: 'bg-adm-gold/10 text-adm-gold-text ring-adm-gold/45',
}

const DOT: Record<BadgeTone, string> = {
  good: 'bg-adm-blue-bright',
  warn: 'bg-amber-300',
  bad: 'bg-red-400',
  neutral: 'bg-adm-muted',
  info: 'bg-adm-soft',
  gold: 'bg-adm-gold',
}

export function Badge({ tone = 'neutral', children, dot = true }: { tone?: BadgeTone; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={twMerge('inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-[3px] text-[10.5px] font-semibold leading-none ring-1 ring-inset', BADGE[tone])}>
      {dot && <span aria-hidden="true" className={twMerge('h-1.5 w-1.5 rounded-full', DOT[tone])} />}
      {children}
    </span>
  )
}

const FINANCIAL_TONE: Record<string, BadgeTone> = {
  PAID: 'good',
  PARTIALLY_PAID: 'warn',
  PENDING: 'warn',
  AUTHORIZED: 'warn',
  PARTIALLY_REFUNDED: 'neutral',
  REFUNDED: 'neutral',
  VOIDED: 'bad',
  EXPIRED: 'bad',
}

const FULFILLMENT_TONE: Record<string, BadgeTone> = {
  FULFILLED: 'info',
  UNFULFILLED: 'gold',
  PARTIALLY_FULFILLED: 'gold',
  ON_HOLD: 'warn',
  IN_PROGRESS: 'gold',
  SCHEDULED: 'gold',
  RESTOCKED: 'neutral',
}

export function FinancialBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-adm-faint">—</span>
  return <Badge tone={FINANCIAL_TONE[status] ?? 'neutral'}>{humanize(status)}</Badge>
}

export function FulfillmentBadge({ status, cancelled }: { status: string | null; cancelled?: boolean }) {
  if (cancelled) return <Badge tone="bad">Cancelled</Badge>
  if (!status) return <span className="text-adm-faint">—</span>
  return <Badge tone={FULFILLMENT_TONE[status] ?? 'neutral'}>{humanize(status)}</Badge>
}

// ─── Filters ──────────────────────────────────────────────────────────────

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('flex flex-wrap items-center gap-2', className)}>{children}</div>
}

/** Segmented links that set one search param, keeping the rest. */
export function Segmented({
  options,
  value,
  param,
  base,
  params,
  className,
}: {
  options: readonly { key: string; label: string; count?: number }[]
  value: string
  param: string
  base: string
  params: Record<string, string | undefined>
  className?: string
}) {
  return (
    <nav className={twMerge('flex max-w-full overflow-x-auto rounded-md border bg-adm-input p-0.5 scrollbar-none', BORDER, className)}>
      {options.map((o) => {
        const active = o.key === value
        return (
          <Link
            key={o.key}
            href={hrefWith(base, params, { [param]: o.key, page: undefined })}
            scroll={false}
            aria-current={active ? 'page' : undefined}
            className={twMerge(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-2.5 py-1 text-[12px] font-medium transition',
              active
                ? 'bg-gradient-to-b from-adm-gold-bright to-adm-gold font-semibold text-adm-gold-ink shadow-[0_1px_8px_-2px_rgb(245_197_66/0.5)]'
                : 'text-adm-soft hover:text-adm-ink',
            )}
          >
            {o.label}
            {o.count != null && (
              <span className={twMerge('rounded px-1 text-[10.5px] tabular-nums', active ? 'bg-adm-gold-ink/15 text-adm-gold-ink' : 'bg-adm-ink/[0.06] text-adm-muted')}>
                {o.count.toLocaleString()}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

export function SearchBox({
  base,
  params,
  placeholder,
  value,
  className,
}: {
  base: string
  params: Record<string, string | undefined>
  placeholder: string
  value?: string
  className?: string
}) {
  // A plain GET form: works without JavaScript and keeps the other filters.
  const keep = Object.entries(params).filter(([k, v]) => v && k !== 'q' && k !== 'page')
  return (
    <form action={base} method="get" role="search" className={twMerge('relative min-w-[12rem] flex-1 sm:max-w-xs', className)}>
      {keep.map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-adm-faint" />
      <input
        type="search"
        name="q"
        defaultValue={value}
        placeholder={placeholder}
        className={twMerge(
          'h-8 w-full rounded-md border bg-adm-input pl-8 pr-2.5 text-[12.5px] text-adm-ink placeholder:text-adm-faint focus:border-adm-blue-bright focus:outline-none focus:ring-2 focus:ring-adm-blue-bright/25',
          BORDER,
        )}
      />
    </form>
  )
}

export function Pagination({
  page,
  pages,
  total,
  base,
  params,
  noun,
}: {
  page: number
  pages: number
  total: number
  base: string
  params: Record<string, string | undefined>
  noun: string
}) {
  const btn = (disabled: boolean) =>
    twMerge(
      'inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[12px] font-medium transition',
      BORDER,
      disabled ? 'pointer-events-none opacity-35' : 'text-adm-soft hover:bg-adm-ink/[0.05] hover:text-adm-ink',
    )
  return (
    <div className={twMerge('flex items-center justify-between gap-2 border-t px-3 py-1.5 text-[12px] text-adm-muted', BORDER)}>
      <span>
        {total.toLocaleString()} {noun}
        {pages > 1 && ` · page ${page} of ${pages}`}
      </span>
      {pages > 1 && (
        <span className="flex gap-1.5">
          <Link href={hrefWith(base, params, { page: String(page - 1) })} className={btn(page <= 1)} aria-disabled={page <= 1}>
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Link>
          <Link href={hrefWith(base, params, { page: String(page + 1) })} className={btn(page >= pages)} aria-disabled={page >= pages}>
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </span>
      )}
    </div>
  )
}

export function hrefWith(base: string, params: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const merged = { ...params, ...patch }
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) if (v) qs.set(k, v)
  const s = qs.toString()
  return s ? `${base}?${s}` : base
}

export function ExternalButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={twMerge(
        'inline-flex h-8 items-center gap-1.5 rounded-md border bg-adm-input px-2.5 text-[12px] font-medium text-adm-soft transition hover:border-adm-blue-bright/60 hover:text-adm-ink',
        BORDER,
      )}
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
    </a>
  )
}

// ─── Key/value lists ──────────────────────────────────────────────────────

export function KV({ rows, className }: { rows: [React.ReactNode, React.ReactNode][]; className?: string }) {
  return (
    <dl className={twMerge('divide-y text-[12.5px]', DIVIDE, className)}>
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-baseline justify-between gap-3 px-3 py-1.5">
          <dt className="shrink-0 text-adm-muted">{k}</dt>
          <dd className="min-w-0 text-right text-adm-text">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded bg-adm-ink/[0.06] px-1.5 py-0.5 text-[10.5px] font-medium text-adm-soft ring-1 ring-inset ring-adm-ink/10">{children}</span>
}
