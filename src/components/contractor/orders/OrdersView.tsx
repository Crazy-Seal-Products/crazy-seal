'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calculator, ChevronDown, FolderKanban, Loader2, Package, PackageCheck, Receipt, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { linkOrderToProject } from '@/lib/contractor/order-actions'
import type { CheckoutQuote, PortalOrder, ProjectOption } from '@/lib/contractor/orders'
import { PROJECT_STAGE_LABEL, type ProjectStage } from '@/lib/contractor/types'
import { dollars, shortDate } from '@/lib/contractor/dates'
import { EASE_OUT_EXPO } from '@/components/motion'
import { Panel, PanelTitle, StatTile, StatusPill, ViewHeader } from '@/components/portal/ui'
import { portalButton } from '@/components/portal/portal-styles'

const PAYMENT_PILL: Record<string, string> = {
  PAID: 'won',
  PARTIALLY_PAID: 'processing',
  PENDING: 'processing',
  AUTHORIZED: 'processing',
  PARTIALLY_REFUNDED: 'draft',
  REFUNDED: 'draft',
  VOIDED: 'draft',
  EXPIRED: 'draft',
}

const FULFILLMENT_PILL: Record<string, string> = {
  FULFILLED: 'delivered',
  PARTIALLY_FULFILLED: 'shipped',
  UNFULFILLED: 'processing',
  IN_PROGRESS: 'processing',
  ON_HOLD: 'processing',
  SCHEDULED: 'processing',
}

const FULFILLMENT_LABEL: Record<string, string> = {
  FULFILLED: 'Shipped',
  PARTIALLY_FULFILLED: 'Partly shipped',
  UNFULFILLED: 'Not shipped yet',
}

/** Thermo's order progress, from what Shopify tells us: placed, paid, packing, shipped. */
const STEPS = ['Placed', 'Paid', 'Packing', 'Shipped'] as const
const PAID = new Set(['PAID', 'PARTIALLY_PAID', 'AUTHORIZED', 'PARTIALLY_REFUNDED'])

function stepFor(o: PortalOrder): number {
  if (o.fulfillmentStatus === 'FULFILLED') return 3
  if (o.fulfillmentStatus === 'PARTIALLY_FULFILLED' || o.fulfillmentStatus === 'IN_PROGRESS') return 2
  if (o.financialStatus && PAID.has(o.financialStatus)) return 1
  return 0
}

function humanize(status: string): string {
  const s = status.toLowerCase().replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const PILL_BTN =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0'
const PILL_GOOD = 'bg-[color-mix(in_oklab,var(--p-primary)_15%,transparent)] text-[var(--p-primary)] ring-[color-mix(in_oklab,var(--p-primary)_35%,transparent)] hover:shadow-[0_8px_20px_-10px_var(--p-primary)]'
const PILL_ACCENT = 'bg-[color-mix(in_oklab,var(--p-accent)_12%,transparent)] text-[var(--p-accent)] ring-[color-mix(in_oklab,var(--p-accent)_30%,transparent)] hover:shadow-[0_8px_20px_-10px_var(--p-accent)]'
const PILL_GLASS = 'bg-white/[0.05] text-[var(--p-ink)] ring-white/10 hover:bg-white/[0.1]'

const HEAD = 'px-3 pb-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)]'

export interface OrderWithWarranty extends PortalOrder {
  /** The order's warranty certificate, when it has a registration. */
  certificateUrl: string | null
}

/** The company's and the signed-in account's Shopify orders, and the quotes waiting at checkout (Thermo's orders table). */
export function OrdersView({
  orders,
  quotes,
  projects,
  canLink,
  canRegister,
  canReorder,
  shopifyError,
}: {
  orders: OrderWithWarranty[]
  quotes: CheckoutQuote[]
  projects: ProjectOption[]
  /** The viewer may link orders to projects. */
  canLink: boolean
  /** The viewer may register warranties. */
  canRegister: boolean
  /** False in View as (read-only). */
  canReorder: boolean
  shopifyError: string | null
}) {
  const live = orders.filter((o) => !o.cancelled)
  const inProgress = live.filter((o) => o.fulfillmentStatus !== 'FULFILLED').length
  const spent = live.reduce((s, o) => s + (Number(o.total) || 0), 0)
  const title = !orders.length ? 'Orders' : inProgress ? `${inProgress} order${inProgress === 1 ? '' : 's'} in progress` : 'Everything has shipped'

  return (
    <>
      <ViewHeader
        kicker="Factory-direct orders"
        title={title}
        description="Your Crazy Seal orders, with what’s paid and shipped. Reorder a kit, register its warranty, or link it to the project it’s for."
      >
        <a href="/products/" target="_blank" rel="noopener noreferrer" className={portalButton}>
          <ShoppingBag className="h-4 w-4" /> Shop Crazy Seal
        </a>
      </ViewHeader>

      {shopifyError && (
        <p className="mb-5 rounded-2xl bg-[color-mix(in_oklab,var(--p-accent)_10%,transparent)] px-4 py-3 text-sm text-[var(--p-accent)] ring-1 ring-[color-mix(in_oklab,var(--p-accent)_30%,transparent)]">
          {shopifyError}
        </p>
      )}

      {orders.length > 0 && (
        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatTile label="Orders" value={live.length} icon={Receipt} hint={`${orders.length} most recent`} />
          <StatTile label="In progress" value={inProgress} icon={Truck} hint="Not fully shipped yet" delay={0.05} />
          <StatTile label="Ordered" value={Math.round(spent)} prefix="$" icon={Package} hint="Across these orders" delay={0.1} />
        </div>
      )}

      {quotes.length > 0 && (
        <Panel className="mb-5" delay={0.05}>
          <PanelTitle>Waiting at checkout</PanelTitle>
          <ul className="grid gap-3 md:grid-cols-2">
            {quotes.map((q, i) => (
              <motion.li
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.1 + i * 0.05 }}
                className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-[var(--p-line)] bg-white/[0.03] p-4"
              >
                <div aria-hidden="true" className="pointer-events-none absolute -left-8 -top-10 h-24 w-24 rounded-full bg-[var(--p-accent)] opacity-10 blur-2xl" />
                <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-[var(--p-accent)] ring-1 ring-white/10">
                  <Calculator className="h-4 w-4" />
                </span>
                <div className="relative min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--p-ink)]">
                    <Link href={`/portal/quotes/${q.id}/`} className="font-mono text-xs hover:text-[var(--p-primary)]">
                      {q.number}
                    </Link>{' '}
                    · {q.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[var(--p-muted)]">
                    <span className="font-semibold tabular-nums text-[var(--p-ink)]">{dollars(q.total)}</span>
                    {q.checkoutAt && ` · checkout started ${shortDate(q.checkoutAt)}`}
                    {q.project && (
                      <>
                        {' · '}
                        <Link href={`/portal/projects/${q.project.id}/`} className="underline decoration-white/20 underline-offset-4 hover:text-[var(--p-ink)]">
                          {q.project.name}
                        </Link>
                      </>
                    )}
                  </p>
                </div>
                {q.invoiceUrl ? (
                  <a href={q.invoiceUrl} target="_blank" rel="noopener noreferrer" className={twMerge(portalButton, 'relative px-3.5 py-2 text-xs')}>
                    Finish checkout <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="relative text-xs text-[var(--p-muted)]">Checkout link on its way</span>
                )}
              </motion.li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel className="overflow-hidden !p-0" delay={0.1}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--p-line)] px-5 py-4">
          <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">All orders</h2>
          <p className="text-xs text-[var(--p-muted)]">{orders.length ? `${orders.length} most recent` : ''}</p>
        </div>
        {orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm text-[var(--p-ink)]">
              <thead>
                <tr className="border-b border-[var(--p-line)]">
                  <th scope="col" className={twMerge(HEAD, 'pl-5')}>
                    Order
                  </th>
                  <th scope="col" className={HEAD}>
                    Products
                  </th>
                  <th scope="col" className={HEAD}>
                    Project
                  </th>
                  <th scope="col" className={twMerge(HEAD, 'text-right')}>
                    Total
                  </th>
                  <th scope="col" className={HEAD}>
                    Status
                  </th>
                  <th scope="col" className={twMerge(HEAD, 'pr-5 text-right')}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <OrderRow key={o.shopifyId} index={i} order={o} projects={projects} canLink={canLink} canRegister={canRegister} canReorder={canReorder} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="relative overflow-hidden px-6 py-16 text-center">
            <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-6 h-40 w-40 -translate-x-1/2 rounded-full bg-[var(--p-primary)] opacity-20 blur-3xl" />
            <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)]">
              <PackageCheck className="h-6 w-6" />
            </span>
            <p className="relative mt-4 text-base font-semibold text-[var(--p-ink)]">No orders yet</p>
            <p className="relative mx-auto mt-1 max-w-md text-sm text-[var(--p-muted)]">
              Orders placed on crazyseal.com with your email (or your company’s store account) show here. Call Crazy Seal if you’ve ordered before and don’t see them.
            </p>
          </div>
        )}
      </Panel>
      {orders.length > 0 && <p className="mt-4 px-1 text-xs text-[var(--p-muted)]">Crazy Seal updates each order as it’s paid, packed and shipped.</p>}
    </>
  )
}

function Progress({ step, cancelled }: { step: number; cancelled: boolean }) {
  return (
    <div className="mt-2 flex gap-1" aria-label={cancelled ? 'Cancelled' : `${STEPS[step]}: step ${step + 1} of ${STEPS.length}`} role="img">
      {STEPS.map((s, i) => (
        <span key={s} className="relative h-1.5 w-7 overflow-hidden rounded-full bg-white/[0.08]">
          {!cancelled && i <= step && (
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-[var(--p-primary)] to-[var(--p-accent)] shadow-[0_0_10px_-1px_var(--p-primary)]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.25 + i * 0.12 }}
            />
          )}
        </span>
      ))}
    </div>
  )
}

function OrderRow({
  order: o,
  index,
  projects,
  canLink,
  canRegister,
  canReorder,
}: {
  order: OrderWithWarranty
  index: number
  projects: ProjectOption[]
  canLink: boolean
  canRegister: boolean
  canReorder: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [reordering, setReordering] = useState(false)
  const items = o.lines.filter((li) => li.variantId && li.quantity > 0).map((li) => ({ variantId: li.variantId as string, quantity: li.quantity }))

  // Same as the Pro Hub's Reorder: a new Shopify checkout with this order's items.
  const reorder = async () => {
    if (!items.length) return
    setReordering(true)
    setMessage(null)
    try {
      const res = await fetch('/api/store/checkout/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) })
      const data = (await res.json().catch(() => null)) as { url?: string } | null
      if (data?.url) window.location.href = data.url
      else setMessage({ ok: false, text: 'Could not start checkout for that order.' })
    } catch {
      setMessage({ ok: false, text: 'Could not start checkout for that order.' })
    } finally {
      setReordering(false)
    }
  }
  const linkedIds = new Set(o.projects.map((p) => p.id))
  const choices = projects.filter((p) => !linkedIds.has(p.id))
  const step = stepFor(o)
  const shownLines = o.lines.filter((li) => li.quantity > 0).slice(0, 2)
  const moreLines = o.lines.filter((li) => li.quantity > 0).length - shownLines.length

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: o.cancelled ? 0.6 : 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO, delay: Math.min(index, 12) * 0.035 }}
      className="border-t border-white/[0.05] align-top transition-colors first:border-t-0 hover:bg-white/[0.03]"
    >
      <td className="py-4 pl-5 pr-3">
        <p className="font-mono text-xs font-semibold">{o.name}</p>
        <p className="mt-0.5 whitespace-nowrap text-xs text-[var(--p-muted)]">{shortDate(o.createdAt)}</p>
        {o.customerName && <p className="mt-0.5 max-w-[12rem] truncate text-xs text-[var(--p-muted)]">{o.customerName}</p>}
      </td>
      <td className="max-w-[16rem] px-3 py-4 text-xs">
        {shownLines.length ? (
          <>
            {shownLines.map((li, i) => (
              <span key={`${li.title}-${i}`} className="block truncate">
                <span className="font-semibold tabular-nums">{li.quantity}</span> × {li.title}
              </span>
            ))}
            {moreLines > 0 && <span className="mt-0.5 block text-[var(--p-muted)]">+{moreLines} more</span>}
          </>
        ) : (
          <span className="text-[var(--p-muted)]">{o.itemCount ? `${o.itemCount} item${o.itemCount === 1 ? '' : 's'}` : '—'}</span>
        )}
      </td>
      <td className="px-3 py-4">
        <div className="flex flex-col items-start gap-1.5">
          {o.projects.map((p) => (
            <Link key={p.id} href={`/portal/projects/${p.id}/`} className={twMerge(PILL_BTN, PILL_GLASS, 'max-w-[14rem]')}>
              <FolderKanban className="h-3.5 w-3.5 shrink-0 text-[var(--p-accent)]" />
              <span className="truncate">{p.name}</span>
            </Link>
          ))}
          {canLink && choices.length > 0 && (
            <span className="relative inline-flex items-center gap-2">
              <span className="relative">
                <select
                  aria-label={`Link ${o.name} to a project`}
                  value=""
                  disabled={pending}
                  onChange={(e) => {
                    const projectId = e.target.value
                    if (!projectId) return
                    setMessage(null)
                    start(async () => {
                      const r = await linkOrderToProject(o.shopifyId, projectId)
                      setMessage(r.ok ? { ok: true, text: r.message ?? 'Linked' } : { ok: false, text: r.error })
                      if (r.ok) router.refresh()
                    })
                  }}
                  className="max-w-[14rem] cursor-pointer appearance-none rounded-full border border-dashed border-[var(--p-line)] bg-white/[0.03] py-1.5 pl-3 pr-7 text-xs font-semibold text-[var(--p-muted)] outline-none transition hover:border-[var(--p-primary)] hover:text-[var(--p-ink)] focus:border-[var(--p-primary)] disabled:opacity-50 [&>option]:text-gray-900"
                >
                  <option value="">{o.projects.length ? '+ Link another project' : '+ Link to project'}</option>
                  {choices.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({PROJECT_STAGE_LABEL[p.stage as ProjectStage] ?? p.stage})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--p-muted)]" />
              </span>
              {pending && <Loader2 className="h-4 w-4 animate-spin text-[var(--p-muted)]" />}
            </span>
          )}
          {!o.projects.length && !(canLink && choices.length) && <span className="text-[var(--p-muted)] opacity-60">—</span>}
          {message && <span className={twMerge('text-xs font-medium', message.ok ? 'text-[var(--p-primary)]' : 'text-red-300')}>{message.text}</span>}
        </div>
      </td>
      <td className="whitespace-nowrap px-3 py-4 text-right font-semibold tabular-nums">{dollars(o.total)}</td>
      <td className="px-3 py-4">
        {o.cancelled ? (
          <StatusPill status="cancelled" label="Cancelled" />
        ) : o.fulfillmentStatus ? (
          <StatusPill status={FULFILLMENT_PILL[o.fulfillmentStatus] ?? 'draft'} label={FULFILLMENT_LABEL[o.fulfillmentStatus] ?? humanize(o.fulfillmentStatus)} />
        ) : (
          <StatusPill status="draft" label={STEPS[step]} />
        )}
        <Progress step={step} cancelled={o.cancelled} />
        {o.financialStatus && !o.cancelled && (
          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[var(--p-muted)]">
            <span
              aria-hidden="true"
              className={twMerge(
                'h-1.5 w-1.5 rounded-full',
                PAYMENT_PILL[o.financialStatus] === 'won' ? 'bg-[var(--p-primary)] shadow-[0_0_6px_var(--p-primary)]' : PAYMENT_PILL[o.financialStatus] === 'processing' ? 'bg-[var(--p-accent)]' : 'bg-white/30',
              )}
            />
            {humanize(o.financialStatus)}
          </p>
        )}
      </td>
      <td className="py-4 pl-3 pr-5">
        <div className="flex flex-col items-end gap-1.5">
          {o.certificateUrl ? (
            <a href={o.certificateUrl} target="_blank" rel="noopener noreferrer" className={twMerge(PILL_BTN, PILL_GOOD)}>
              <ShieldCheck className="h-3.5 w-3.5" /> Certificate
            </a>
          ) : (
            canRegister &&
            !o.cancelled && (
              <Link href={`/portal/warranties/new/?order=${encodeURIComponent(o.name)}`} className={twMerge(PILL_BTN, PILL_ACCENT)}>
                <ShieldCheck className="h-3.5 w-3.5" /> Register warranty
              </Link>
            )
          )}
          {canReorder && items.length > 0 && (
            <button type="button" onClick={reorder} disabled={reordering} className={twMerge(PILL_BTN, PILL_GLASS)}>
              {reordering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Reorder
            </button>
          )}
        </div>
      </td>
    </motion.tr>
  )
}
