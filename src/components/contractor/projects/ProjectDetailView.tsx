'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  ExternalLink,
  FileText,
  History,
  Images,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Ruler,
  ShieldCheck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { CustomerOption } from '@/lib/contractor/customers'
import type { FeedItem } from '@/lib/contractor/dashboard'
import type { MediaItem } from '@/lib/contractor/media-shared'
import type { ProjectListItem, ProjectOrder, ProjectQuote, ProjectWarranty } from '@/lib/contractor/projects'
import { PROJECT_STAGE_LABEL, type CustomerRow } from '@/lib/contractor/types'
import { dateLong, dateShort, humanize, money, money0, num } from '@/lib/portal/admin/format'
import { CountUp, EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, portalButton, portalGhostButton } from '@/components/portal/ui'
import { ActivityFeed } from '../ActivityFeed'
import { EmptyNote, MiniLabel, Modal, OwnerPill, Pill, STAGE_COLOR, initials, placeLine, rowMotion, siteLine, type TeamOption } from './kit'
import { ProjectForm } from './ProjectForm'
import { ProjectMedia } from './ProjectMedia'
import { StagePanel } from './StagePanel'

export interface ProjectDetailProps {
  project: ProjectListItem
  customer: Pick<CustomerRow, 'id' | 'name' | 'type' | 'contact_name' | 'email' | 'phone' | 'city' | 'state' | 'zip'> | null
  customerVisible: boolean
  quotes: ProjectQuote[] | null
  orders: ProjectOrder[] | null
  warranty: ProjectWarranty | null
  /** Photos and videos (media_assets), and whether the project has a warranty claim (shows the Claim group). */
  media: { items: MediaItem[]; hasClaim: boolean }
  activity: FeedItem[]
  people: Record<string, string>
  perms: { edit: boolean; quotesCreate: boolean; warrantiesEdit: boolean; canAddCustomer: boolean; canAssign: boolean }
  form: { customers: CustomerOption[]; team: TeamOption[]; me: string | null }
}

/** "Dec 4, 2026" from a date column (YYYY-MM-DD), without a time-zone shift. */
function day(d: string | null): string {
  return d ? dateLong(`${d}T12:00:00Z`) : '—'
}

const QUOTE_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  open: 'info',
  checkout: 'warn',
  ordered: 'good',
  lost: 'bad',
  cancelled: 'bad',
}

const WARRANTY_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  submitted: 'warn',
  approved: 'good',
  flagged: 'bad',
  in_review: 'info',
  resolved: 'good',
  denied: 'bad',
}

function warrantyLabel(status: string): string {
  return status === 'submitted' ? 'Awaiting review' : humanize(status)
}

const linkCls = 'inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-accent,#F9EA1C)] transition hover:gap-1.5'

function MoreLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={linkCls}>
      {children} <ArrowRight className="h-3 w-3" />
    </Link>
  )
}

/** A panel title with a small glowing icon tile, like Thermo's workspace cards. */
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

function Detail({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className={twMerge(
        'rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:bg-white/[0.05]',
        wide && 'col-span-full',
      )}
    >
      <dt className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted,#9DA3AB)]">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[var(--p-ink,#fff)]">{children}</dd>
    </div>
  )
}

/** A row in a panel's list: hairline separated, lifting a little on hover. */
const listRow = '-mx-3 flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-white/[0.04]'

/** One project: a big header, its progress, details, customer, quotes, orders, warranty and history. */
export function ProjectDetailView({ project, customer, customerVisible, quotes, orders, warranty, media, activity, people, perms, form }: ProjectDetailProps) {
  const [editing, setEditing] = useState(false)
  const site = siteLine(project.site)
  const place = placeLine(project.site)
  const color = STAGE_COLOR[project.stage]

  return (
    <div>
      <Link
        href="/portal/projects/"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--p-muted,#9DA3AB)] transition hover:-translate-x-0.5 hover:text-[var(--p-ink,#fff)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Projects
      </Link>

      {/* The big header: stage as the kicker, the project's name, and what it's worth. */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="relative mb-6 overflow-hidden rounded-[2rem] border border-[var(--p-line,rgba(255,255,255,0.08))] bg-[image:var(--p-panel)] p-6 shadow-[var(--p-shadow)] backdrop-blur-xl md:p-9"
      >
        <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: color }} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[var(--p-primary,#6DC015)] opacity-[0.10] blur-3xl"
        />
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--p-kicker,#F9EA1C)]">
              <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 12px ${color}` }} />
              {PROJECT_STAGE_LABEL[project.stage]}
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-[1.08] tracking-tight text-[var(--p-ink,#fff)] md:text-5xl">{project.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--p-muted,#9DA3AB)]">
              {project.customer_name && <Fact icon={Users}>{project.customer_name}</Fact>}
              {project.roof_type && <Fact icon={FileText}>{project.roof_type}</Fact>}
              {project.sqft ? <Fact icon={Ruler}>{num(project.sqft)} sq ft</Fact> : null}
              {place && <Fact icon={MapPin}>{place}</Fact>}
              <OwnerPill name={project.assignee_name} className="py-1 text-xs" />
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-4 lg:items-end">
            <div className="lg:text-right">
              <MiniLabel>Project value</MiniLabel>
              <p className="mt-1 bg-[linear-gradient(120deg,var(--p-ink,#fff)_20%,var(--p-accent,#F9EA1C))] bg-clip-text text-4xl font-black tabular-nums text-transparent md:text-5xl">
                <CountUp value={Math.round(project.value)} prefix="$" />
              </p>
              {project.expected_close && ['lead', 'quoted', 'won'].includes(project.stage) && (
                <p className="mt-1 text-xs text-[var(--p-muted,#9DA3AB)]">Expected close {day(project.expected_close)}</p>
              )}
            </div>
            {(perms.edit || perms.quotesCreate) && (
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {perms.edit && (
                  <button type="button" onClick={() => setEditing(true)} className={portalGhostButton}>
                    <Pencil className="h-4 w-4" /> Edit details
                  </button>
                )}
                {perms.quotesCreate && (
                  <Link href={`/portal/quotes/new/?project=${project.id}`} className={portalButton}>
                    <Calculator className="h-4 w-4" /> New materials quote
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <StagePanel project={project} canEdit={perms.edit} />

      <ProjectMedia
        projectId={project.id}
        items={media.items}
        hasClaim={media.hasClaim}
        canEdit={perms.edit}
        people={people}
        title={<Titled icon={Images}>Photos &amp; videos</Titled>}
        className="mt-6"
      />

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-6">
          <Panel delay={0.1}>
            <PanelTitle>
              <Titled icon={FileText}>Details</Titled>
            </PanelTitle>
            <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              <Detail label="Value">{money0(project.value)}</Detail>
              <Detail label="Expected close">{day(project.expected_close)}</Detail>
              <Detail label="Assigned to">{project.assignee_name ?? 'Unassigned'}</Detail>
              <Detail label="Roof">{project.roof_type ?? '—'}</Detail>
              <Detail label="Roof area">{project.sqft ? `${num(project.sqft)} sq ft` : '—'}</Detail>
              <Detail label="Seams">{project.seams ? `${num(project.seams)} ft` : '—'}</Detail>
              <Detail label="Color">{project.color ?? '—'}</Detail>
              <Detail label="Source">{project.source ?? '—'}</Detail>
              <Detail label="Operations lead">{project.ops_lead_id ? (people[project.ops_lead_id] ?? '—') : '—'}</Detail>
              <Detail label="Crew">{project.crew ?? '—'}</Detail>
              <Detail label="Start date">{day(project.start_date)}</Detail>
              <Detail label="Added">{dateLong(project.created_at)}</Detail>
              <Detail label="Site address" wide>
                {site ? (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-[var(--p-accent,#F9EA1C)]"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--p-primary,#6DC015)]" /> {site}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                ) : (
                  '—'
                )}
              </Detail>
              {project.notes && (
                <Detail label="Notes" wide>
                  <span className="whitespace-pre-wrap font-normal opacity-90">{project.notes}</span>
                </Detail>
              )}
            </dl>
          </Panel>

          {quotes && (
            <Panel delay={0.15}>
              <PanelTitle action={<MoreLink href="/portal/quotes/">All quotes</MoreLink>}>
                <Titled icon={Calculator}>Materials quotes</Titled>
              </PanelTitle>
              {quotes.length === 0 ? (
                <EmptyNote>
                  No quotes yet.
                  {perms.quotesCreate && (
                    <>
                      {' '}
                      <Link href={`/portal/quotes/new/?project=${project.id}`} className="font-semibold text-[var(--p-accent,#F9EA1C)] hover:underline">
                        Price the materials
                      </Link>{' '}
                      for this roof.
                    </>
                  )}
                </EmptyNote>
              ) : (
                <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
                  {quotes.map((q, i) => (
                    <motion.li key={q.id} {...rowMotion(i)}>
                      <Link href={`/portal/quotes/${q.id}/`} className={listRow}>
                        <span className="rounded-lg bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-[var(--p-muted,#9DA3AB)]">{q.number}</span>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--p-ink,#fff)]">{q.name}</span>
                        <Pill tone={QUOTE_TONE[q.status] ?? 'neutral'}>{humanize(q.status)}</Pill>
                        <span className="w-24 text-right text-sm font-semibold tabular-nums text-[var(--p-ink,#fff)]">{money(q.total)}</span>
                        <span className="hidden w-16 text-right text-xs text-[var(--p-muted,#9DA3AB)] sm:block">{dateShort(q.created_at)}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          {orders && (
            <Panel delay={0.2}>
              <PanelTitle action={<MoreLink href="/portal/orders/">All orders</MoreLink>}>
                <Titled icon={Package}>Orders</Titled>
              </PanelTitle>
              {orders.length === 0 ? (
                <EmptyNote>No orders yet. An order placed from one of this project’s quotes shows up here.</EmptyNote>
              ) : (
                <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
                  {orders.map((o, i) => (
                    <motion.li key={o.shopify_order_id} {...rowMotion(i)} className={`${listRow} flex-wrap gap-y-1.5`}>
                      <span className="text-sm font-semibold text-[var(--p-ink,#fff)]">{o.name}</span>
                      <span className="text-xs text-[var(--p-muted,#9DA3AB)]">{dateShort(o.created_at)}</span>
                      <span className="flex flex-1 flex-wrap justify-end gap-1.5">
                        {o.cancelled ? (
                          <Pill tone="bad">Cancelled</Pill>
                        ) : (
                          <>
                            {o.financial_status && <Pill tone={o.financial_status === 'PAID' ? 'good' : 'warn'}>{humanize(o.financial_status)}</Pill>}
                            {o.fulfillment_status && <Pill tone={o.fulfillment_status === 'FULFILLED' ? 'info' : 'neutral'}>{humanize(o.fulfillment_status)}</Pill>}
                          </>
                        )}
                      </span>
                      <span className="w-24 text-right text-sm font-semibold tabular-nums text-[var(--p-ink,#fff)]">{money(o.total)}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Panel>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <Panel delay={0.12}>
            <PanelTitle
              action={
                customer && customerVisible ? (
                  <Link href={`/portal/customers/${customer.id}/`} className={linkCls}>
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                ) : undefined
              }
            >
              <Titled icon={Users}>Customer</Titled>
            </PanelTitle>
            {customer ? (
              <div>
                <div className="flex items-center gap-3.5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--p-primary,#5BA411)] bg-[image:var(--p-primary-grad)] text-base font-black text-[var(--p-primary-ink,#fff)] shadow-[var(--p-glow)]">
                    {initials(customer.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-bold text-[var(--p-ink,#fff)]">{customer.name}</p>
                    {customer.type && <p className="text-xs text-[var(--p-muted,#9DA3AB)]">{customer.type}</p>}
                  </div>
                </div>
                <div className="mt-5 space-y-1">
                  {customer.contact_name && customer.contact_name !== customer.name && <ContactLine icon={UserRound}>{customer.contact_name}</ContactLine>}
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
                  {placeLine(customer) && <ContactLine icon={MapPin}>{placeLine(customer)}</ContactLine>}
                </div>
              </div>
            ) : (
              <EmptyNote>No customer yet.{perms.edit ? ' Add one with Edit details.' : ''}</EmptyNote>
            )}
          </Panel>

          {warranty && (
            <Panel delay={0.17}>
              <PanelTitle
                action={
                  perms.warrantiesEdit && warranty.registrations.length === 0 ? (
                    <Link href={`/portal/warranties/new/?project=${project.id}`} className={`${portalButton} !px-3.5 !py-2 !text-xs`}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Register warranty
                    </Link>
                  ) : (
                    <MoreLink href="/portal/warranties/">All warranties</MoreLink>
                  )
                }
              >
                <Titled icon={ShieldCheck}>Warranty</Titled>
              </PanelTitle>
              {warranty.registrations.length === 0 && warranty.claims.length === 0 ? (
                <EmptyNote>
                  Not registered yet.{project.stage === 'complete' ? ' Register the warranty now that the roof is done.' : ' Register it once the roof is done.'}
                </EmptyNote>
              ) : (
                <ul className="divide-y divide-[var(--p-line,rgba(255,255,255,0.06))]">
                  {warranty.registrations.map((r, i) => (
                    <motion.li key={r.id} {...rowMotion(i)} className={listRow}>
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--p-primary,#6DC015)]" />
                      <span className="min-w-0 flex-1 text-sm text-[var(--p-ink,#fff)]">Warranty registration{r.name ? ` · ${r.name}` : ''}</span>
                      <Pill tone={WARRANTY_TONE[r.status] ?? 'neutral'}>{warrantyLabel(r.status)}</Pill>
                      <span className="hidden w-16 text-right text-xs text-[var(--p-muted,#9DA3AB)] sm:block">{dateShort(r.created_at)}</span>
                    </motion.li>
                  ))}
                  {warranty.claims.map((c, i) => (
                    <motion.li key={c.id} {...rowMotion(warranty.registrations.length + i)} className={listRow}>
                      <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--p-accent,#F9EA1C)]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[var(--p-ink,#fff)]">Claim{c.summary ? `: ${c.summary}` : ''}</span>
                      <Pill tone={WARRANTY_TONE[c.status] ?? 'neutral'}>{warrantyLabel(c.status)}</Pill>
                      <span className="hidden w-16 text-right text-xs text-[var(--p-muted,#9DA3AB)] sm:block">{dateShort(c.created_at)}</span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </Panel>
          )}

          <Panel delay={0.22}>
            <PanelTitle>
              <Titled icon={History}>Activity</Titled>
            </PanelTitle>
            <ActivityFeed items={activity} people={people} emptyText="Nothing logged for this project yet." />
          </Panel>
        </div>
      </div>

      {perms.edit && (
        <Modal title="Edit project" open={editing} onClose={() => setEditing(false)} wide>
          <ProjectForm
            mode="edit"
            project={project}
            customers={form.customers}
            team={form.team}
            canAddCustomer={perms.canAddCustomer}
            canAssign={perms.canAssign}
            me={form.me}
            currentCustomer={customer ? { id: customer.id, name: customer.name } : null}
            onDone={() => setEditing(false)}
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </div>
  )
}

function Fact({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 ring-1 ring-white/[0.06]">
      <Icon className="h-3.5 w-3.5 text-[var(--p-accent,#F9EA1C)]" />
      <span className="text-[var(--p-ink,#fff)] opacity-85">{children}</span>
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
