'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRightLeft, ArrowUpRight, FolderKanban, ShieldCheck, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import type { PortalClaim, PortalRegistration, PortalTransfer } from '@/lib/contractor/warranties'
import { shortDate } from '@/lib/contractor/dates'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, StatusPill, ViewHeader } from '@/components/portal/ui'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'

const REG_STATUS: Record<string, { pill: string; label: string }> = {
  submitted: { pill: 'processing', label: 'Submitted' },
  approved: { pill: 'registered', label: 'Approved' },
  flagged: { pill: 'draft', label: 'Under review' },
}

const CLAIM_STATUS: Record<string, { pill: string; label: string }> = {
  submitted: { pill: 'processing', label: 'Submitted' },
  in_review: { pill: 'shipped', label: 'In review' },
  resolved: { pill: 'won', label: 'Resolved' },
  denied: { pill: 'draft', label: 'Denied' },
}

const HEAD = 'px-3 pb-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)] first:pl-5 last:pr-5'
const CELL = 'px-3 py-3.5 first:pl-5 last:pr-5'

function ProjectLink({ project }: { project: { id: string; name: string } | null }) {
  if (!project) return <span className="text-[var(--p-muted)] opacity-60">—</span>
  return (
    <Link
      href={`/portal/projects/${project.id}/`}
      className="inline-flex max-w-[14rem] items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-[var(--p-ink)] ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-[var(--p-primary)]"
    >
      <FolderKanban className="h-3.5 w-3.5 shrink-0 text-[var(--p-accent)]" />
      <span className="truncate">{project.name}</span>
    </Link>
  )
}

function Badge({ icon: Icon, tone }: { icon: LucideIcon; tone: 'good' | 'active' | 'quiet' | 'warn' }) {
  return (
    <span
      className={twMerge(
        'grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1',
        tone === 'good' && 'bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)] ring-white/20',
        tone === 'active' && 'bg-[color-mix(in_oklab,var(--p-accent)_14%,transparent)] text-[var(--p-accent)] ring-[color-mix(in_oklab,var(--p-accent)_30%,transparent)]',
        tone === 'quiet' && 'bg-white/[0.05] text-[var(--p-muted)] ring-white/10',
        tone === 'warn' && 'bg-[rgba(255,106,61,0.12)] text-[#ff8a66] ring-[rgba(255,106,61,0.25)]',
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
  )
}

function Section({ title, count, delay, children, empty }: { title: string; count: number; delay: number; children: React.ReactNode; empty: React.ReactNode }) {
  return (
    <Panel className="mt-5 overflow-hidden !p-0 first:mt-0" delay={delay}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--p-line)] px-5 py-4">
        <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">{title}</h2>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-semibold tabular-nums text-[var(--p-muted)] ring-1 ring-white/10">{count}</span>
      </div>
      {count ? <div className="overflow-x-auto">{children}</div> : empty}
    </Panel>
  )
}

function Row({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: 0.1 + Math.min(index, 12) * 0.035 }}
      className="border-t border-white/[0.05] align-top transition-colors first:border-t-0 hover:bg-white/[0.03]"
    >
      {children}
    </motion.tr>
  )
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className="m-5 rounded-2xl border border-dashed border-[var(--p-line)] p-6 text-center text-sm text-[var(--p-muted)]">{children}</p>
}

/** The contractor's warranty registrations, claims and transfers (Thermo's warranties table). */
export function WarrantiesView({
  registrations,
  claims,
  transfers,
  canEdit,
}: {
  registrations: PortalRegistration[]
  claims: PortalClaim[]
  transfers: PortalTransfer[]
  canEdit: boolean
}) {
  const approved = registrations.filter((r) => r.status === 'approved').length
  const inReview = registrations.length - approved
  const openClaims = claims.filter((c) => c.status === 'submitted' || c.status === 'in_review').length
  const title = registrations.length ? `${approved} approved · ${inReview} in review` : 'Warranties'

  return (
    <>
      <ViewHeader
        kicker="50 year warranties"
        title={title}
        description="Every warranty your company has registered, and any claims. Register each finished roof so the owner gets their certificate."
      >
        {canEdit && (
          <>
            <Link href="/portal/warranties/new/" className={portalButton}>
              <ShieldCheck className="h-4 w-4" /> Register a warranty
            </Link>
            <Link href="/portal/warranties/new/?type=claim" className={portalGhostButton}>
              <AlertTriangle className="h-4 w-4" /> File a claim
            </Link>
          </>
        )}
      </ViewHeader>

      <div>
        <Section
          title="Registrations"
          count={registrations.length}
          delay={0.05}
          empty={<EmptyNote>No warranties registered yet. Register a finished roof and the owner gets their 50 year certificate by email.</EmptyNote>}
        >
          <table className="w-full min-w-[820px] text-left text-sm text-[var(--p-ink)]">
            <thead>
              <tr className="border-b border-[var(--p-line)]">
                <th scope="col" className={HEAD}>
                  Owner
                </th>
                <th scope="col" className={HEAD}>
                  Order
                </th>
                <th scope="col" className={HEAD}>
                  Project
                </th>
                <th scope="col" className={HEAD}>
                  Filed
                </th>
                <th scope="col" className={HEAD}>
                  Status
                </th>
                <th scope="col" className={twMerge(HEAD, 'text-right')}>
                  Certificate
                </th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r, i) => {
                const status = REG_STATUS[r.status] ?? { pill: 'draft', label: r.status }
                return (
                  <Row key={r.id} index={i}>
                    <td className={CELL}>
                      <div className="flex items-center gap-3">
                        <Badge icon={ShieldCheck} tone={r.status === 'approved' ? 'good' : r.status === 'submitted' ? 'active' : 'quiet'} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{r.name}</span>
                          {r.email && <span className="block max-w-[14rem] truncate text-xs text-[var(--p-muted)]">{r.email}</span>}
                        </span>
                      </div>
                    </td>
                    <td className={twMerge(CELL, 'font-mono text-xs')}>{r.orderNumber || <span className="text-[var(--p-muted)] opacity-60">—</span>}</td>
                    <td className={CELL}>
                      <ProjectLink project={r.project} />
                    </td>
                    <td className={twMerge(CELL, 'whitespace-nowrap')}>
                      {shortDate(r.createdAt)}
                      {r.filedBy && <span className="block text-xs text-[var(--p-muted)]">by {r.filedBy}</span>}
                    </td>
                    <td className={CELL}>
                      <StatusPill status={status.pill} label={status.label} />
                    </td>
                    <td className={twMerge(CELL, 'text-right')}>
                      <a
                        href={r.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[color-mix(in_oklab,var(--p-primary)_15%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--p-primary)] ring-1 ring-[color-mix(in_oklab,var(--p-primary)_35%,transparent)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-10px_var(--p-primary)]"
                      >
                        View <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </Row>
                )
              })}
            </tbody>
          </table>
        </Section>

        <Section title={openClaims ? `Claims · ${openClaims} open` : 'Claims'} count={claims.length} delay={0.1} empty={<EmptyNote>No claims. Good news.</EmptyNote>}>
          <table className="w-full min-w-[820px] text-left text-sm text-[var(--p-ink)]">
            <thead>
              <tr className="border-b border-[var(--p-line)]">
                <th scope="col" className={HEAD}>
                  Claim
                </th>
                <th scope="col" className={HEAD}>
                  Order
                </th>
                <th scope="col" className={HEAD}>
                  Project
                </th>
                <th scope="col" className={HEAD}>
                  Filed
                </th>
                <th scope="col" className={twMerge(HEAD, 'text-right')}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c, i) => {
                const status = CLAIM_STATUS[c.status] ?? { pill: 'draft', label: c.status }
                return (
                  <Row key={c.id} index={i}>
                    <td className={twMerge(CELL, 'max-w-[22rem]')}>
                      <div className="flex items-start gap-3">
                        <Badge icon={AlertTriangle} tone={c.status === 'resolved' ? 'good' : c.status === 'denied' ? 'quiet' : 'warn'} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{c.name}</span>
                          {c.summary && <span className="mt-0.5 line-clamp-2 text-xs text-[var(--p-muted)]">{c.summary}</span>}
                        </span>
                      </div>
                    </td>
                    <td className={twMerge(CELL, 'font-mono text-xs')}>{c.orderNumber || <span className="text-[var(--p-muted)] opacity-60">—</span>}</td>
                    <td className={CELL}>
                      <ProjectLink project={c.project} />
                    </td>
                    <td className={twMerge(CELL, 'whitespace-nowrap')}>
                      {shortDate(c.createdAt)}
                      {c.filedBy && <span className="block text-xs text-[var(--p-muted)]">by {c.filedBy}</span>}
                    </td>
                    <td className={twMerge(CELL, 'text-right')}>
                      <StatusPill status={status.pill} label={status.label} />
                    </td>
                  </Row>
                )
              })}
            </tbody>
          </table>
        </Section>

        {transfers.length > 0 && (
          <Section title="Transfers" count={transfers.length} delay={0.15} empty={null}>
            <table className="w-full min-w-[640px] text-left text-sm text-[var(--p-ink)]">
              <thead>
                <tr className="border-b border-[var(--p-line)]">
                  <th scope="col" className={HEAD}>
                    New owner
                  </th>
                  <th scope="col" className={HEAD}>
                    Order
                  </th>
                  <th scope="col" className={HEAD}>
                    Requested
                  </th>
                  <th scope="col" className={twMerge(HEAD, 'text-right')}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t, i) => {
                  const status = REG_STATUS[t.status] ?? { pill: 'draft', label: t.status.replace(/_/g, ' ') }
                  return (
                    <Row key={t.id} index={i}>
                      <td className={CELL}>
                        <div className="flex items-center gap-3">
                          <Badge icon={ArrowRightLeft} tone={t.status === 'approved' ? 'good' : 'active'} />
                          <span className="min-w-0">
                            <span className="block truncate font-semibold">To {t.newOwnerName}</span>
                            <span className="block max-w-[16rem] truncate text-xs text-[var(--p-muted)]">{t.newOwnerEmail}</span>
                          </span>
                        </div>
                      </td>
                      <td className={twMerge(CELL, 'font-mono text-xs')}>{t.orderNumber || <span className="text-[var(--p-muted)] opacity-60">—</span>}</td>
                      <td className={twMerge(CELL, 'whitespace-nowrap')}>{shortDate(t.createdAt)}</td>
                      <td className={twMerge(CELL, 'text-right')}>
                        <StatusPill status={status.pill} label={status.label} />
                      </td>
                    </Row>
                  )
                })}
              </tbody>
            </table>
          </Section>
        )}
      </div>
      <p className="mt-4 px-1 text-xs text-[var(--p-muted)]">Crazy Seal’s warranty team reviews each registration and claim, and emails the owner.</p>
    </>
  )
}
