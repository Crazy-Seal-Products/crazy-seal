import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight, BadgePercent, CircleAlert, Clock, FolderKanban, MapPin, Truck, Wallet, type LucideIcon } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { requirePortal } from '@/lib/contractor/guard'
import { can } from '@/lib/contractor/roles'
import { getContractorViewer } from '@/lib/contractor/viewer'
import { dateLong, dateTime } from '@/lib/portal/admin/format'
import { roofSummary, round2, shippingCopy } from '@/lib/pricing/engine'
import { discountLabel, MISSING_LABEL, stripCosts, usd } from '@/lib/pricing/types'
import { listQuoteEvents } from '@/lib/quotes/events'
import { getPortalQuote, projectNames } from '@/lib/quotes/portal'
import { isExpired, QUOTE_STATUS_LABEL } from '@/lib/quotes/types'
import { OfferCountdown } from '@/components/quotes/OfferCountdown'
import { PortalQuoteActions } from '@/components/quotes/PortalQuoteActions'
import { QuoteTimeline } from '@/components/quotes/PortalQuoteParts'
import { ProposalEditor } from '@/components/quotes/ProposalEditor'
import { ProposalSheet, SheetNote } from '@/components/quotes/ProposalSheet'
import { QUOTE_PILL } from '@/components/quotes/portal-quote-rows'
import { Panel, PanelTitle, StatusPill, ViewHeader } from '@/components/portal/ui'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const viewer = await getContractorViewer()
  const quote = viewer ? await getPortalQuote(viewer, (await params).id) : null
  return { title: quote ? `Quote ${quote.number}` : 'Quote' }
}

/** Events a contractor sees (not staff notes or follow-up mechanics). */
const SHOWN = new Set(['created', 'priced', 'checkout', 'handoff', 'ordered', 'duplicate_order', 'lost', 'cancelled'])

function Fact({ icon: Icon, label, children, warn = false }: { icon: LucideIcon; label: string; children: React.ReactNode; warn?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <span
        className={twMerge(
          'mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg ring-1',
          warn ? 'bg-[rgba(255,106,61,0.12)] text-[#ff8a66] ring-[rgba(255,106,61,0.25)]' : 'bg-white/[0.05] text-[var(--p-accent)] ring-white/10',
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--p-muted)]">{label}</dt>
        <dd className={twMerge('mt-0.5 text-sm', warn ? 'text-[#ffb199]' : 'text-[var(--p-ink)]')}>{children}</dd>
      </div>
    </div>
  )
}

/**
 * One materials quote, laid out like Thermo's builder: the "Material
 * proposal" document (the full price less the quote's discount, and the live
 * offer's countdown; once it ends, "Refresh my price") with the
 * contractor's proposal to their customer under it, and a side panel with
 * the status, price, shipping, what's missing, "Place order"
 * (orders.create) and the history. Roles that order but don't sell
 * (operations) can open it from the project to order.
 */
export default async function PortalQuotePage({ params }: { params: Params }) {
  const viewer = await requirePortal()
  if (!can(viewer.role, 'quotes.view') && !can(viewer.role, 'orders.create')) notFound()
  const quote = await getPortalQuote(viewer, (await params).id)
  if (!quote) notFound()

  const [events, projects] = await Promise.all([listQuoteEvents(quote.id, 50), projectNames(viewer.contractor.id, quote.project_id ? [quote.project_id] : [])])
  const projectName = quote.project_id ? projects.get(quote.project_id) : null
  const now = new Date().getTime()
  const expired = isExpired(quote, now)
  const active = quote.status === 'open' || quote.status === 'checkout'
  const canEdit = !viewer.readOnly && can(viewer.role, 'quotes.create')
  const canOrder = !viewer.readOnly && can(viewer.role, 'orders.create')
  const seesQuotes = can(viewer.role, 'quotes.view')
  const terms = viewer.contractor.payment_terms === 'terms'
  const merchandise = round2(quote.total - (quote.shipping_total ?? 0))
  const termsOrder = events.find((e) => e.kind === 'handoff' && (e.data as { request?: string } | null)?.request === 'terms_order')
  const shipTo = quote.ship_to?.street ? [quote.ship_to.street, quote.ship_to.city, [quote.ship_to.state, quote.ship_to.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') : null
  const place = [quote.ship_to?.city, quote.ship_to?.state].filter(Boolean).join(', ')
  const pill = active && expired ? 'not_started' : QUOTE_PILL[quote.status]
  const pillLabel = active && expired ? 'Offer ended' : QUOTE_STATUS_LABEL[quote.status]
  // Only what the document shows: never the quote row itself (it carries costs).
  const totals = {
    subtotal_full: quote.subtotal_full,
    discount_pct: quote.discount_pct,
    discount_total: quote.discount_total,
    tier_name: quote.tier_name,
    shipping: quote.shipping,
    shipping_total: quote.shipping_total,
    total: quote.total,
  }

  return (
    <>
      <Link
        href={projectName ? `/portal/projects/${quote.project_id}/` : '/portal/quotes/'}
        className="group mb-4 inline-flex items-center gap-1.5 text-sm text-[var(--p-muted)] transition hover:text-[var(--p-ink)]"
      >
        <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> {projectName ?? 'All quotes'}
      </Link>
      <ViewHeader kicker={`Material quote · revision ${quote.revision}`} title={quote.number} description={roofSummary(quote.inputs)}>
        <StatusPill status={pill} label={pillLabel} />
      </ViewHeader>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <div className="grid min-w-0 content-start gap-5">
          <ProposalSheet
            brandName={viewer.contractorName}
            preparedFor={projectName ?? quote.proposal?.customerName ?? 'Materials for this roof'}
            subtitle={roofSummary(quote.inputs) + (place ? ` · ships to ${place}` : '')}
            meta={[`Ref. ${quote.number}`, `Priced ${dateLong(quote.priced_at)}`]}
            lines={stripCosts(quote.lines)}
            totals={totals}
            offer={
              active && !expired ? (
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="h-3.5 w-3.5" />
                  <OfferCountdown expiresAt={quote.expires_at} serverNow={now} refreshOnExpire />
                </span>
              ) : null
            }
            notices={
              active && expired ? (
                <SheetNote tone="warn" icon={<Clock className="h-3.5 w-3.5" />}>
                  This offer ended {dateTime(quote.expires_at)}. Refresh my price to order at today’s prices, with a new live offer.
                </SheetNote>
              ) : null
            }
          />

          {seesQuotes && (
            <Panel delay={0.12}>
              <PanelTitle>Proposal to your customer</PanelTitle>
              <ProposalEditor quoteId={quote.id} merchandise={merchandise} shipping={quote.shipping_total ?? 0} proposal={quote.proposal} canEdit={canEdit} />
            </Panel>
          )}
        </div>

        <div className="grid min-w-0 content-start gap-5">
          <Panel delay={0.06} className="overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[var(--p-primary)] opacity-20 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">Order</p>
                <p className="mt-1 text-lg font-bold text-[var(--p-ink)]">{quote.status === 'ordered' ? 'Ordered' : active ? 'Ready when you are' : 'Closed'}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">Total</p>
                <p className="mt-1 text-2xl font-black tabular-nums text-[var(--p-ink)] md:text-3xl">{usd(quote.total)}</p>
              </div>
            </div>

            <dl className="relative mt-5 divide-y divide-[var(--p-line)] overflow-hidden rounded-2xl border border-[var(--p-line)] bg-black/15">
              <Fact icon={BadgePercent} label="Your price">
                {quote.discount_pct > 0 ? `${discountLabel(quote.tier_name, quote.discount_pct)} off the full ${usd(quote.subtotal_full)}` : 'Full price'}
              </Fact>
              <Fact icon={Truck} label="Shipping">
                {quote.shipping_total != null && quote.shipping_total > 0 ? `Freight ${usd(quote.shipping_total)}` : shippingCopy(quote)}
              </Fact>
              {active && (
                <Fact icon={Clock} label="Live offer" warn={expired}>
                  <OfferCountdown expiresAt={quote.expires_at} serverNow={now} refreshOnExpire endedText={`Ended ${dateTime(quote.expires_at)}`} className="tabular-nums" />
                  {!expired && <span className="block text-xs text-[var(--p-muted)]">Until {dateTime(quote.expires_at)}</span>}
                </Fact>
              )}
              {shipTo && (
                <Fact icon={MapPin} label="Ship to">
                  {shipTo}
                </Fact>
              )}
              {active && quote.missing.length > 0 && (
                <Fact icon={CircleAlert} label="Still needed" warn>
                  {quote.missing.map((m) => MISSING_LABEL[m]).join(' and ')}
                </Fact>
              )}
              {terms && (
                <Fact icon={Wallet} label="Payment">
                  On terms: Crazy Seal will invoice you
                </Fact>
              )}
            </dl>

            <div className="relative mt-5">
              <PortalQuoteActions
                quoteId={quote.id}
                status={quote.status}
                missing={quote.missing}
                handoff={quote.handoff}
                expired={expired}
                terms={terms}
                canOrder={canOrder}
                canEdit={canEdit}
                phone={quote.phone}
                shipTo={quote.ship_to}
                invoiceUrl={quote.draft_revision === quote.revision ? quote.invoice_url : null}
                orderRequestedAt={termsOrder?.at ?? null}
              />
            </div>
            {viewer.readOnly && <p className="relative mt-3 text-xs font-medium text-[var(--p-accent)]">Admin view is read-only.</p>}
          </Panel>

          {projectName && (
            <Panel delay={0.1} className="!p-0">
              <Link href={`/portal/projects/${quote.project_id}/`} className="group flex items-center gap-3 rounded-3xl px-5 py-4 transition hover:bg-white/[0.03]">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--p-primary)] bg-[image:var(--p-primary-grad)] text-white shadow-[var(--p-glow)]">
                  <FolderKanban className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--p-muted)]">Project</span>
                  <span className="block truncate text-sm font-semibold text-[var(--p-ink)]">{projectName}</span>
                </span>
                <ArrowRight className="h-4 w-4 text-[var(--p-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--p-ink)]" />
              </Link>
            </Panel>
          )}

          <Panel delay={0.14}>
            <PanelTitle>History</PanelTitle>
            <QuoteTimeline
              events={events
                .filter((e) => SHOWN.has(e.kind))
                .map((e) => ({ id: e.id, summary: e.summary, when: dateTime(e.at), actor: e.actor, kind: String(e.kind) }))}
            />
          </Panel>
        </div>
      </div>
    </>
  )
}
