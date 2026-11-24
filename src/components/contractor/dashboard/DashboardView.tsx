'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Calculator,
  FileCheck,
  FolderKanban,
  GraduationCap,
  HardHat,
  Inbox,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { CountUp } from '@/components/motion'
import { Panel, ProgressBar, StatusPill } from '@/components/portal/ui'
import { money, portalButton, portalGhostButton } from '@/components/portal/portal-styles'
import { INSTALL_STEPS, INSTALL_STEP_LABEL, PROJECT_STAGE_LABEL, type ProjectStage } from '@/lib/contractor/types'
import type { DashboardData, FeedItem } from '@/lib/contractor/dashboard'
import type { AccountSummary } from '@/lib/contractor/account-summary'
import { PRO_STATUS_LABEL, SUPPORT_PHONE_TEL, type ProStatus } from '@/lib/pro/config'

const EASE = [0.16, 1, 0.3, 1] as const

export interface MonthBar {
  label: string
  total: number
  count: number
}

export interface DashboardProps {
  firstName: string
  /** "Knoxville, TN · Crazy Seal contractor", or "Crazy Seal Pro". */
  kicker: string
  tagline: string
  roleLabel: string
  roleSummary: string
  /** The company's numbers; null for an account on no contractor's team. */
  company: DashboardData | null
  /** What Pro Hub showed this account: orders, warranties, rebates. */
  account: AccountSummary
  /** Orders by month for the last 12 months (company and account), when the role sees orders. */
  months: MonthBar[] | null
  can: { newQuote: boolean; newProject: boolean; projects: boolean; activity: boolean; training: boolean; fileWarranty: boolean; orders: boolean }
}

const STAGE_DOT: Partial<Record<ProjectStage, string>> = {
  lead: '#93ABC4',
  quoted: '#F9EA1C',
  won: '#8FD63A',
  ordered: '#4FB3FF',
  in_progress: '#6DC015',
}

const PILL: Record<ProStatus, string> = {
  member: 'bg-white/10 text-white/80 ring-white/15',
  pro: 'bg-[color-mix(in_oklab,var(--p-primary)_25%,transparent)] text-white ring-[color-mix(in_oklab,var(--p-primary)_45%,transparent)]',
  commercial: 'bg-sky-400/15 text-sky-100 ring-sky-300/30',
  high_volume: 'bg-[color-mix(in_oklab,var(--p-accent)_20%,transparent)] text-[var(--p-accent)] ring-[color-mix(in_oklab,var(--p-accent)_40%,transparent)]',
}

function ago(iso: string): string {
  const mins = Math.round((Date.now() - Date.parse(iso)) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.round(hours / 24)
  return days < 30 ? `${days}d ago` : new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--p-kicker)]">{children}</p>
}

function SectionHead({ kicker, title, sub, href, cta }: { kicker: string; title: string; sub?: string; href?: string; cta?: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <Kicker>{kicker}</Kicker>
        <h2 className="mt-1.5 text-lg font-bold text-[var(--p-ink)] md:text-xl">{title}</h2>
        {sub && <p className="mt-0.5 text-sm text-[var(--p-muted)]">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-accent)] hover:underline">
          {cta} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

interface Tile {
  label: string
  value: number
  money?: boolean
  icon: LucideIcon
  href: string
  hint?: string
  alert?: boolean
}

function WorkTile({ tile, index }: { tile: Tile; index: number }) {
  const Icon = tile.icon
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.08 + index * 0.04 }}>
      <Link
        href={tile.href}
        className="group relative block h-full overflow-hidden rounded-2xl border p-3.5 transition duration-300 hover:-translate-y-0.5"
        style={{
          borderColor: tile.alert ? 'color-mix(in oklab, var(--p-accent) 45%, transparent)' : 'var(--p-line)',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.015))',
          boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 30px -22px rgba(0,0,0,0.9)',
        }}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: tile.alert ? 'var(--p-accent)' : 'var(--p-primary)' }}
        />
        <span className="relative flex items-center justify-between text-[11px] text-[var(--p-muted)]">
          {tile.label}
          <Icon className="h-3.5 w-3.5 text-[var(--p-accent)]" />
        </span>
        <span className="relative mt-1.5 block text-xl font-bold tabular-nums text-[var(--p-ink)] md:text-2xl">
          {tile.money ? <CountUp value={tile.value} prefix="$" /> : <CountUp value={tile.value} />}
        </span>
        {tile.hint && <span className="relative mt-0.5 block text-[11px] text-[var(--p-muted)]">{tile.hint}</span>}
      </Link>
    </motion.div>
  )
}

function OrdersChart({ months }: { months: MonthBar[] }) {
  const max = Math.max(1, ...months.map((m) => m.total))
  const year = months.reduce((s, m) => s + m.total, 0)
  return (
    <Panel delay={0.15}>
      <SectionHead kicker="Orders" title={`${money(year)} in the last 12 months`} sub={`${months.reduce((s, m) => s + m.count, 0)} orders`} href="/portal/orders/" cta="All orders" />
      <div className="mt-6 flex h-52 items-end gap-2">
        {months.map((m, i) => (
          <div key={m.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] tabular-nums text-[var(--p-ink)] opacity-0 transition group-hover:opacity-100">{money(m.total)}</span>
            <motion.div
              className="w-full rounded-t-lg"
              style={{
                background: 'linear-gradient(180deg, var(--p-accent), var(--p-primary) 55%, var(--p-primary-deep))',
                boxShadow: '0 -6px 20px -8px color-mix(in oklab, var(--p-primary) 80%, transparent)',
                minHeight: m.total ? 6 : 2,
                opacity: m.total ? 1 : 0.25,
              }}
              initial={{ height: 0 }}
              animate={{ height: `${(m.total / max) * 100}%` }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.04 }}
            />
            <span className="text-[10px] text-[var(--p-muted)]">{m.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function AccountPanel({ account, canFile }: { account: AccountSummary; canFile: boolean }) {
  const pct = account.rebate?.next ? Math.min(100, Math.round((account.rebate.current / account.rebate.next) * 100)) : 100
  return (
    <Panel delay={0.2}>
      <SectionHead kicker="Your Crazy Seal account" title="Orders, warranties & rewards" href="/portal/rewards/" cta="Rewards" />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {account.statuses.map((s) => (
          <span key={s} className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${PILL[s]}`}>
            {PRO_STATUS_LABEL[s]}
          </span>
        ))}
      </div>
      {account.shopifyError && <p className="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-300/20">{account.shopifyError}</p>}
      {account.rebate && account.rebate.remaining > 0 && (
        <div className="mt-5">
          <p className="flex justify-between text-sm">
            <span className="text-[var(--p-ink)]">
              {account.rebate.remaining} more kit {account.rebate.remaining === 1 ? 'order' : 'orders'} to your next rebate
            </span>
            <span className="tabular-nums text-[var(--p-muted)]">
              {account.rebate.current}/{account.rebate.next}
            </span>
          </p>
          <ProgressBar pct={pct} className="mt-2 h-2" />
        </div>
      )}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">
          {account.missingOrders.length ? 'Orders missing a warranty' : 'Warranties'}
        </p>
        {account.missingOrders.length ? (
          <ul className="space-y-2">
            {account.missingOrders.map((o, i) => (
              <motion.li
                key={o.name}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06, ease: EASE }}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--p-line)] bg-white/[0.03] px-4 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--p-ink)]">{o.name}</span>
                  <span className="block truncate text-[11px] text-[var(--p-muted)]">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.firstItem || 'Kit'}
                  </span>
                </span>
                {canFile && (
                  <Link href={`/portal/warranties/new/?order=${encodeURIComponent(o.name)}`} className="shrink-0 text-xs font-bold text-[var(--p-accent)] hover:underline">
                    File warranty
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        ) : account.stats.orderCount ? (
          <p className="text-sm text-[var(--p-muted)]">Every order has its warranty filed. Nice work.</p>
        ) : (
          <p className="text-sm text-[var(--p-muted)]">No Crazy Seal orders on this email yet.</p>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {canFile && (
          <Link href="/portal/warranties/new/" className={portalButton}>
            <FileCheck className="h-4 w-4" /> File a warranty
          </Link>
        )}
        <Link href="/portal/orders/" className={portalGhostButton}>
          <ShoppingCart className="h-4 w-4" /> Reorder
        </Link>
        <a href={`tel:${SUPPORT_PHONE_TEL}`} className={portalGhostButton}>
          <Phone className="h-4 w-4" /> Call Crazy Seal
        </a>
      </div>
    </Panel>
  )
}

function ActivityList({ items }: { items: FeedItem[] }) {
  return (
    <ul className="mt-4 space-y-1">
      {items.map((a, i) => (
        <motion.li
          key={a.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.05, ease: EASE }}
          className="flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.03]"
        >
          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--p-primary)] shadow-[0_0_10px_var(--p-primary)]" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-[var(--p-ink)]">{a.summary}</span>
            <span className="block text-[11px] text-[var(--p-muted)]">
              {a.actor_name}
              {a.role_label ? ` · ${a.role_label}` : ''} · {ago(a.at)}
            </span>
          </span>
        </motion.li>
      ))}
    </ul>
  )
}

/**
 * The portal home, laid out like Thermo's dealer dashboard in Crazy Seal
 * colors: a welcome header, the "My workspace" tiles (the company's numbers
 * and the person's own Pro Hub numbers), the Projects section with stage
 * totals and installs underway, the orders chart beside their account
 * (rewards, orders missing a warranty, reorder), and recent quotes and
 * activity. For an account on no contractor's team: the Pro Hub home in the
 * same design.
 */
export function DashboardView({ firstName, kicker, tagline, roleLabel, roleSummary, company, account, months, can }: DashboardProps) {
  const thisYear = account.stats.orderCountThisYear
  const tiles: Tile[] = []
  if (company?.pipeline) tiles.push({ label: 'Open pipeline', value: company.pipeline.value, money: true, icon: FolderKanban, href: '/portal/projects/', hint: `${company.pipeline.count} projects` })
  if (company?.customers != null) tiles.push({ label: 'Customers', value: company.customers, icon: Users, href: '/portal/customers/' })
  if (company?.openQuotes != null) tiles.push({ label: 'Quotes out', value: company.openQuotes, icon: Calculator, href: '/portal/quotes/' })
  if (company?.installing != null) tiles.push({ label: 'Installing now', value: company.installing, icon: HardHat, href: '/portal/projects/' })
  if (company?.newRequests) tiles.push({ label: 'New website requests', value: company.newRequests.length, icon: Inbox, href: '/portal/projects/', alert: company.newRequests.length > 0 })
  if (company?.warrantiesAwaiting != null) tiles.push({ label: 'Warranties in review', value: company.warrantiesAwaiting, icon: ShieldCheck, href: '/portal/warranties/' })
  if (company?.team != null) tiles.push({ label: 'Team members', value: company.team, icon: UsersRound, href: '/portal/team/' })
  // What Pro Hub's home showed, for every account.
  tiles.push({ label: 'Orders this year', value: thisYear, icon: Package, href: '/portal/orders/', hint: `${account.stats.orderCount} all time` })
  tiles.push({ label: 'Warranties filed', value: account.stats.warrantiesFiled, icon: FileCheck, href: '/portal/warranties/' })
  tiles.push({
    label: 'Missing a warranty',
    value: account.stats.warrantiesMissing,
    icon: ShieldCheck,
    href: '/portal/warranties/new/',
    hint: account.stats.warrantiesMissing ? 'File from Orders' : 'All caught up',
    alert: account.stats.warrantiesMissing > 0,
  })
  if (!company && account.rebate) tiles.push({ label: 'Orders to next rebate', value: account.rebate.remaining, icon: Trophy, href: '/portal/rewards/' })

  const stages = company?.stages ?? null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
          <Kicker>{kicker}</Kicker>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--p-ink)] md:text-[2.6rem]">Welcome back, {firstName}.</h1>
          <p className="mt-1 text-sm text-[var(--p-muted)]">{tagline}</p>
        </motion.div>
        <motion.div className="flex flex-wrap gap-2" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}>
          {can.newProject && (
            <Link href="/portal/projects/new/" className={portalGhostButton}>
              <FolderKanban className="h-4 w-4" /> New project
            </Link>
          )}
          {can.newQuote ? (
            <Link href="/portal/quotes/new/" className={portalButton}>
              New quote <ArrowUpRight className="h-4 w-4" />
            </Link>
          ) : (
            can.fileWarranty && (
              <Link href="/portal/warranties/new/" className={portalButton}>
                File a warranty <ArrowUpRight className="h-4 w-4" />
              </Link>
            )
          )}
        </motion.div>
      </div>

      {/* My workspace */}
      <Panel className="!p-4 md:!p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Kicker>
            My workspace · {roleLabel}
          </Kicker>
          <p className="text-xs text-[var(--p-muted)]">{roleSummary}</p>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {tiles.map((t, i) => (
            <WorkTile key={t.label} tile={t} index={i} />
          ))}
        </div>
      </Panel>

      {/* Projects: Thermo's big "roof programs" section */}
      {company && can.projects && stages && (
        <Panel delay={0.1}>
          <SectionHead kicker="Projects" title="Every roof, from the first request to the warranty" sub="Your open projects by stage. Website requests from your Crazy Seal page land here on their own." href="/portal/projects/" cta="Open the board" />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {stages.map((s, i) => (
              <motion.div
                key={s.stage}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05, ease: EASE }}
                className="rounded-2xl border border-[var(--p-line)] bg-black/15 p-3.5"
              >
                <p className="flex items-center gap-2 text-[11px] text-[var(--p-muted)]">
                  <span className="h-2 w-2 rounded-full" style={{ background: STAGE_DOT[s.stage] ?? 'var(--p-muted)', boxShadow: `0 0 10px ${STAGE_DOT[s.stage] ?? 'transparent'}` }} />
                  {PROJECT_STAGE_LABEL[s.stage]}
                </p>
                <p className="mt-1.5 text-2xl font-bold tabular-nums text-[var(--p-ink)]">
                  <CountUp value={s.count} />
                </p>
                <p className="text-[11px] tabular-nums text-[var(--p-muted)]">{money(s.value)}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--p-ink)]">Installs underway</p>
              {company.underway?.length ? (
                <ul className="space-y-4">
                  {company.underway.map((p, i) => {
                    const step = p.install_step ? INSTALL_STEPS.indexOf(p.install_step) + 1 : 0
                    const pct = p.stage === 'ordered' ? 8 : Math.round(((step - 0.5) / INSTALL_STEPS.length) * 100)
                    return (
                      <li key={p.id}>
                        <Link href={`/portal/projects/${p.id}/`} className="group block">
                          <span className="flex justify-between gap-3 text-sm">
                            <span className="truncate font-medium text-[var(--p-ink)] group-hover:underline">{p.name}</span>
                            <span className="shrink-0 text-xs text-[var(--p-muted)]">
                              {p.stage === 'ordered' ? 'Materials ordered' : p.install_step ? INSTALL_STEP_LABEL[p.install_step] : 'Installing'}
                            </span>
                          </span>
                          <ProgressBar pct={pct} className="mt-2 h-1.5" delay={0.4 + i * 0.08} />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-[var(--p-line)] p-5 text-center text-sm text-[var(--p-muted)]">No installs underway right now.</p>
              )}
            </div>
            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--p-ink)]">New website requests</p>
              {company.newRequests?.length ? (
                <ul className="space-y-2">
                  {company.newRequests.slice(0, 5).map((p, i) => (
                    <motion.li key={p.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06, ease: EASE }}>
                      <Link href={`/portal/projects/${p.id}/`} className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--p-line)] bg-white/[0.03] px-4 py-2.5 transition hover:bg-white/[0.06]">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-[var(--p-ink)]">{p.customer_name || p.name}</span>
                          <span className="block truncate text-[11px] text-[var(--p-muted)]">
                            {p.roof_type || 'Roof'}
                            {p.sqft ? ` · ${p.sqft.toLocaleString()} sq ft` : ''} · {ago(p.created_at)}
                          </span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[color-mix(in_oklab,var(--p-accent)_18%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--p-accent)]">New</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-2xl border border-dashed border-[var(--p-line)] p-5 text-center text-sm text-[var(--p-muted)]">
                  Quote requests from your Crazy Seal page show up here.
                </p>
              )}
            </div>
          </div>
        </Panel>
      )}

      {/* Orders chart beside the person's own account (Pro Hub) */}
      <div className={`grid gap-6 ${months ? 'xl:grid-cols-[1.4fr_1fr]' : ''}`}>
        {months && <OrdersChart months={months} />}
        <AccountPanel account={account} canFile={can.fileWarranty} />
      </div>

      {/* Recent quotes and activity, or for an account on no team its recent orders */}
      {company ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          {company.recentQuotes && (
            <Panel delay={0.25}>
              <SectionHead kicker="Quotes" title="Recent quotes" href="/portal/quotes/" cta="View all" />
              {company.recentQuotes.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-[0.14em] text-[var(--p-muted)]">
                      <tr>
                        <th className="pb-2 font-semibold">Quote</th>
                        <th className="pb-2 font-semibold">For</th>
                        <th className="pb-2 text-right font-semibold">Total</th>
                        <th className="pb-2 text-right font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.recentQuotes.map((q) => (
                        <tr key={q.id} className="border-t border-[var(--p-line)] text-[var(--p-ink)]">
                          <td className="py-3 font-mono text-xs text-[var(--p-muted)]">
                            <Link href={`/portal/quotes/${q.id}/`} className="hover:text-[var(--p-ink)]">
                              {q.number}
                            </Link>
                          </td>
                          <td className="py-3 font-medium">{q.name}</td>
                          <td className="py-3 text-right tabular-nums">{money(q.total)}</td>
                          <td className="py-3 text-right">
                            <StatusPill status={q.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 rounded-2xl border border-dashed border-[var(--p-line)] p-5 text-center text-sm text-[var(--p-muted)]">
                  No quotes yet. Price a roof in a minute with the quote builder.
                </p>
              )}
            </Panel>
          )}
          <Panel delay={0.3}>
            {company.activity ? (
              <>
                <SectionHead kicker="Activity" title="What your team did" href={can.activity ? '/portal/activity/' : undefined} cta="All activity" />
                {company.activity.length ? <ActivityList items={company.activity} /> : <p className="mt-4 text-sm text-[var(--p-muted)]">Nothing yet.</p>}
              </>
            ) : (
              <>
                <SectionHead kicker="Training" title="Grow with Crazy Seal" href={can.training ? '/portal/training/' : undefined} cta="Open training" />
                <p className="mt-3 text-sm text-[var(--p-muted)]">Short modules on marketing, selling, building kits, installing and filing warranties.</p>
              </>
            )}
          </Panel>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <Panel delay={0.25}>
            <SectionHead kicker="Orders" title="Recent orders" href="/portal/orders/" cta="All orders" />
            {account.recentOrders.length ? (
              <ul className="mt-4 divide-y divide-[var(--p-line)]">
                {account.recentOrders.map((o) => (
                  <li key={o.name} className="flex items-center justify-between gap-3 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--p-ink)]">{o.name}</span>
                      <span className="block truncate text-xs text-[var(--p-muted)]">
                        {new Date(o.createdAt).toLocaleDateString()} · {o.firstItem || 'Kit'}
                      </span>
                    </span>
                    {o.hasWarranty ? (
                      <span className="text-[11px] font-bold text-[var(--p-primary)]">Warranty filed</span>
                    ) : (
                      <Link href={`/portal/warranties/new/?order=${encodeURIComponent(o.name)}`} className="text-[11px] font-bold text-[var(--p-accent)] hover:underline">
                        File warranty
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[var(--p-line)] p-6 text-center">
                <RefreshCw className="mx-auto mb-2 h-6 w-6 text-[var(--p-muted)]" />
                <p className="text-sm font-semibold text-[var(--p-ink)]">No Crazy Seal orders on this email yet</p>
                <Link href="/kit-builder/" className="mt-2 inline-block text-sm font-semibold text-[var(--p-accent)]">
                  Build a kit
                </Link>
              </div>
            )}
          </Panel>
          <Panel delay={0.3}>
            <SectionHead kicker="Training" title="Grow with Crazy Seal" href="/portal/training/" cta="Open training" />
            <p className="mt-3 text-sm text-[var(--p-muted)]">Short modules on marketing, selling, building kits, installing and filing warranties.</p>
            <Link href="/portal/training/" className={`${portalGhostButton} mt-4`}>
              <GraduationCap className="h-4 w-4" /> Start training
            </Link>
            {account.memberOnly && (
              <Link href="/professionals/#start-a-conversation" className="mt-4 block rounded-2xl border border-[var(--p-line)] bg-white/[0.03] p-4 transition hover:bg-white/[0.06]">
                <Kicker>Become a Pro</Kicker>
                <p className="mt-1 text-sm font-semibold text-[var(--p-ink)]">Install for customers and unlock filing on their behalf, tools, and volume perks.</p>
              </Link>
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}
