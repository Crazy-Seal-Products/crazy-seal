'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FolderKanban, History, Mail, MapPin, Phone, Plus, UserRound, Users, type LucideIcon } from 'lucide-react'
import type { FeedItem } from '@/lib/contractor/dashboard'
import type { ProjectListItem, TeamOption } from '@/lib/contractor/projects'
import { INSTALL_STEP_LABEL, type CustomerRow } from '@/lib/contractor/types'
import { dateLong, dateShort, money0, num } from '@/lib/portal/admin/format'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, portalButton } from '@/components/portal/ui'
import { ActivityFeed } from '../ActivityFeed'
import { EmptyNote, INSTALL_COLOR, MiniLabel, OwnerPill, STAGE_COLOR, StagePill, initials, placeLine, rowMotion } from '../projects/kit'
import { CustomerFormButton } from './CustomerForm'

export interface CustomerDetailProps {
  customer: CustomerRow & { owner_name: string | null }
  projects: ProjectListItem[]
  activity: FeedItem[]
  people: Record<string, string>
  perms: { edit: boolean; newProject: boolean; canAssign: boolean }
  team: TeamOption[]
  me: string | null
}

function Titled({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
        <Icon className="h-4 w-4 text-[var(--p-accent,#F9EA1C)]" />
      </span>
      {children}
    </span>
  )
}

function ContactLine({ icon: Icon, href, children }: { icon: LucideIcon; href?: string; children: React.ReactNode }) {
  const body = (
    <>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.05] ring-1 ring-white/[0.06]">
        <Icon className="h-3.5 w-3.5 text-[var(--p-accent,#F9EA1C)]" />
      </span>
      <span className="min-w-0 text-sm text-[var(--p-ink,#fff)] opacity-90">{children}</span>
    </>
  )
  return href ? (
    <a href={href} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/[0.04]">
      {body}
    </a>
  ) : (
    <p className="-mx-2 flex items-center gap-3 px-2 py-1.5">{body}</p>
  )
}

/** One customer: a big header, their projects, how to reach them, and what's changed. */
export function CustomerDetailView({ customer, projects, activity, people, perms, team, me }: CustomerDetailProps) {
  const open = projects.filter((p) => p.stage !== 'complete' && p.stage !== 'lost')
  const won = projects.filter((p) => ['won', 'ordered', 'in_progress', 'complete'].includes(p.stage))
  const wonValue = won.reduce((s, p) => s + p.value, 0)
  const place = placeLine(customer)
  const hasContact = Boolean(customer.contact_name || customer.email || customer.phone || place)

  return (
    <div>
      <Link
        href="/portal/customers/"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:-translate-x-0.5 hover:text-[var(--p-ink,#fff)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Customers
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="relative mb-6 overflow-hidden rounded-[2rem] border border-[var(--p-line,rgba(255,255,255,0.08))] bg-[image:var(--p-panel)] p-6 shadow-[var(--p-shadow)] backdrop-blur-xl md:p-9"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.18] blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[var(--p-accent,#F9EA1C)] opacity-[0.06] blur-3xl"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-[var(--p-primary,#6DC015)] to-transparent"
        />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 items-center gap-5">
            <motion.span
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="hidden h-16 w-16 shrink-0 place-items-center rounded-[1.25rem] bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-xl font-black text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)] sm:grid md:h-20 md:w-20 md:text-2xl"
            >
              {initials(customer.name)}
            </motion.span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--p-kicker,#F9EA1C)]">{customer.type ?? 'Customer'}</p>
              <h1 className="mt-2 text-3xl font-extrabold leading-[1.08] tracking-tight text-[var(--p-ink,#fff)] md:text-5xl">{customer.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--p-muted,#9DA3AB)]">
                <OwnerPill name={customer.owner_name} className="py-1 text-xs" />
                <span>
                  {open.length} open project{open.length === 1 ? '' : 's'} · added {dateShort(customer.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-4 lg:items-end">
            <div className="lg:text-right">
              <MiniLabel>Won with you</MiniLabel>
              <p className="mt-1 bg-[linear-gradient(120deg,var(--p-ink,#fff)_20%,var(--p-accent,#F9EA1C))] bg-clip-text text-4xl font-black tabular-nums text-transparent md:text-5xl">
                <CountUp value={Math.round(wonValue)} prefix="$" />
              </p>
            </div>
            {(perms.edit || perms.newProject) && (
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {perms.edit && <CustomerFormButton customer={customer} team={team} canAssign={perms.canAssign} me={me} />}
                {perms.newProject && (
                  <Link href={`/portal/projects/new/?customer=${customer.id}`} className={portalButton}>
                    <Plus className="h-4 w-4" /> New project
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.45fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Panel delay={0.08}>
            <PanelTitle action={<span className="text-xs tabular-nums text-[var(--p-muted,#9DA3AB)]">{projects.length} total</span>}>
              <Titled icon={FolderKanban}>Projects</Titled>
            </PanelTitle>
            {projects.length === 0 ? (
              <EmptyNote>No projects for {customer.name} yet.</EmptyNote>
            ) : (
              <ul className="space-y-2">
                {projects.map((p, i) => {
                  const color = STAGE_COLOR[p.stage]
                  return (
                    <motion.li key={p.id} {...rowMotion(i)} whileHover={{ y: -2 }}>
                      <Link
                        href={`/portal/projects/${p.id}/`}
                        className="relative flex flex-wrap items-center gap-x-3 gap-y-2 overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(160deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] py-3 pl-4 pr-3.5 transition-[border-color,box-shadow] duration-300 hover:border-[color-mix(in_oklab,var(--p-primary)_40%,transparent)] hover:shadow-[0_18px_36px_-22px_color-mix(in_oklab,var(--p-primary)_75%,transparent)]"
                      >
                        <span aria-hidden="true" className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[var(--p-ink,#fff)]">{p.name}</span>
                          <span className="block truncate text-xs text-[var(--p-muted,#9DA3AB)]">
                            {[p.roof_type, p.sqft ? `${num(p.sqft)} sq ft` : null, placeLine(p.site), `updated ${dateShort(p.updated_at)}`].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          {p.stage === 'in_progress' && p.install_step && (
                            <span className="text-[11px]" style={{ color: `color-mix(in oklab, ${INSTALL_COLOR} 80%, white)` }}>
                              {INSTALL_STEP_LABEL[p.install_step]}
                            </span>
                          )}
                          <StagePill stage={p.stage} />
                        </span>
                        <span className="w-24 text-right text-sm font-semibold tabular-nums text-[var(--p-ink,#fff)]">{money0(p.value)}</span>
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </Panel>

          <Panel delay={0.16}>
            <PanelTitle>
              <Titled icon={History}>Activity</Titled>
            </PanelTitle>
            <ActivityFeed items={activity} people={people} emptyText="Nothing logged for this customer yet." />
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          <Panel delay={0.12}>
            <PanelTitle>
              <Titled icon={Users}>Contact</Titled>
            </PanelTitle>
            {hasContact ? (
              <div className="space-y-1">
                {customer.contact_name && <ContactLine icon={UserRound}>{customer.contact_name}</ContactLine>}
                {customer.email && (
                  <ContactLine icon={Mail} href={`mailto:${customer.email}`}>
                    <span className="break-all">{customer.email}</span>
                  </ContactLine>
                )}
                {customer.phone && (
                  <ContactLine icon={Phone} href={`tel:${customer.phone}`}>
                    {customer.phone}
                  </ContactLine>
                )}
                {place && <ContactLine icon={MapPin}>{[customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</ContactLine>}
              </div>
            ) : (
              <EmptyNote>No contact details yet.</EmptyNote>
            )}
            <dl className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]">Owner</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--p-ink,#fff)]">{customer.owner_name ?? 'Unassigned'}</dd>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]">Added</dt>
                <dd className="mt-1 text-sm font-medium text-[var(--p-ink,#fff)]">{dateLong(customer.created_at)}</dd>
              </div>
            </dl>
            {customer.notes && (
              <div className="mt-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3">
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]">Notes</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--p-ink,#fff)] opacity-90">{customer.notes}</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  )
}
