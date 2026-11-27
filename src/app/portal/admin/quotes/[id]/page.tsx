import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { adminCan, requirePortalAdmin } from '@/lib/portal/admin/auth'
import { dateTime, money } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { getRepRoster, repForAdmin } from '@/lib/portal/admin/reps'
import { roofSqft, roofSummary } from '@/lib/pricing/engine'
import { HANDOFF_LABEL, MISSING_LABEL } from '@/lib/pricing/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { getQuote } from '@/lib/quotes/data'
import { listQuoteEvents } from '@/lib/quotes/events'
import { quoteUrl } from '@/lib/quotes/token'
import { isExpired, QUOTE_STATUS_LABEL, type QuoteStatus } from '@/lib/quotes/types'
import { BackLink, Badge, CellLink, ExternalButton, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { AdminQuoteLines } from '@/components/quotes/admin/AdminQuoteLines'
import { OverrideForm, QuoteNoteForm, QuoteStaffActions } from '@/components/quotes/admin/QuoteAdminActions'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const q = await getQuote((await params).id)
  return { title: q ? `${q.number} · ${q.company || q.name}` : 'Quote' }
}

const STATUS_TONE: Record<QuoteStatus, 'good' | 'warn' | 'bad' | 'neutral' | 'info' | 'gold'> = { open: 'info', checkout: 'gold', ordered: 'good', lost: 'bad', cancelled: 'neutral' }
const EVENT_TONE: Record<string, 'good' | 'warn' | 'bad' | 'neutral' | 'info' | 'gold'> = {
  ordered: 'good',
  checkout: 'gold',
  handoff: 'warn',
  duplicate_order: 'bad',
  lost: 'bad',
  cancelled: 'neutral',
  offer: 'gold',
}

/**
 * One quote for staff: lines with cost and margin (for roles with Pricing),
 * the buyer and their project, the history, and the controls: price
 * override, checkout for a handoff, resend the link, lost / cancel, link an
 * order by hand, notes.
 */
export default async function AdminQuotePage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('quotes')
  const quote = await getQuote((await params).id)
  if (!quote) notFound()
  const roster = await getRepRoster()
  if (admin.role === 'sales_rep') {
    const me = repForAdmin(admin, roster)
    if (!me?.id || quote.rep_id !== me.id) notFound()
  }

  const db = createAdminClient()
  const [showCost, events, contractor, project, order] = await Promise.all([
    adminCan('pricing'),
    listQuoteEvents(quote.id),
    quote.contractor_id ? db.from('contractors').select('id, company, first_name, last_name, payment_terms').eq('id', quote.contractor_id).maybeSingle().then((r) => r.data) : null,
    quote.project_id ? db.from('contractor_projects').select('id, name, stage').eq('id', quote.project_id).maybeSingle().then((r) => r.data) : null,
    quote.shopify_order_id ? db.from('shopify_orders').select('legacy_resource_id, name, total_price').eq('shopify_id', quote.shopify_order_id).maybeSingle().then((r) => r.data) : null,
  ])
  const rep = quote.rep_id ? roster.reps.find((r) => r.id === quote.rep_id)?.name : null
  // Just made on New quote (?created=1, or emailed / email_failed when staff asked to email the buyer).
  const created = one((await searchParams).created)
  const active = quote.status === 'open' || quote.status === 'checkout'
  const expired = isExpired(quote)

  return (
    <>
      <BackLink href="/portal/admin/quotes/">Quotes</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {quote.number} · {quote.company || quote.name}
            <Badge tone={STATUS_TONE[quote.status]}>{QUOTE_STATUS_LABEL[quote.status]}</Badge>
            {quote.handoff && active && <Badge tone="warn">{HANDOFF_LABEL[quote.handoff]}</Badge>}
            {active && expired && <Badge tone="neutral">Offer ended</Badge>}
          </span>
        }
        description={`${roofSummary(quote.inputs)} · revision ${quote.revision}, priced ${dateTime(quote.priced_at)}`}
        actions={<ExternalButton href={quoteUrl(quote.token)}>Buyer’s page</ExternalButton>}
      />

      {created && (
        <p
          role="status"
          className={
            created === 'email_failed'
              ? 'mb-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-[12.5px] text-adm-warn'
              : 'mb-2 rounded-md border border-adm-line bg-adm-blue-bright/10 px-3 py-2 text-[12.5px] text-adm-ink'
          }
        >
          {created === 'emailed'
            ? `Saved and emailed to ${quote.email}.`
            : created === 'email_failed'
              ? 'Saved, but the email to the buyer didn’t send. Use “Email the link again” under Checkout.'
              : 'Saved. Send the buyer their link with “Email the link again” under Checkout, or share the buyer’s page.'}
        </p>
      )}

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Materials" meta={`${quote.lines.length} lines · ${roofSqft(quote.inputs).toLocaleString('en-US')} sq ft`} tone="sales">
            <AdminQuoteLines lines={quote.lines} totals={quote} showCost={showCost} />
          </Panel>

          <Panel title="Price override" meta={quote.price_override ? `by ${quote.price_override.by}, ${dateTime(quote.price_override.at)}` : 'Replaces the tier; staff only'}>
            {quote.price_override && (
              <p className="border-b border-adm-line-soft px-3 py-2 text-[12.5px] text-adm-text">
                {quote.price_override.discountPct != null && `${quote.price_override.discountPct}% off. `}
                {quote.price_override.freight != null && `Freight ${money(quote.price_override.freight)}. `}
                <span className="text-adm-muted">{quote.price_override.reason}</span>
              </p>
            )}
            <OverrideForm id={quote.id} current={quote.price_override} disabled={!active} />
          </Panel>

          <Panel title="History" meta={`${events.length}`}>
            <QuoteNoteForm id={quote.id} />
            <ul className="divide-y divide-adm-line-soft">
              {events.map((e) => (
                <li key={e.id} className="flex gap-2 px-3 py-2 text-[12.5px]">
                  <span className="w-28 shrink-0 text-[11.5px] text-adm-muted">{dateTime(e.at)}</span>
                  <span className="min-w-0 flex-1">
                    <Badge tone={EVENT_TONE[e.kind] ?? 'neutral'}>{e.kind.replace(/_/g, ' ')}</Badge> <span className="text-adm-text">{e.summary}</span>
                    {e.actor && <span className="block text-[11px] text-adm-muted">{e.actor}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Buyer" tone="info">
            <KV
              rows={[
                ['Name', quote.name],
                ['Email', <a key="e" href={`mailto:${quote.email}`} className="text-adm-blue-bright hover:underline">{quote.email}</a>],
                ['Phone', quote.phone ? <a key="p" href={`tel:${quote.phone}`} className="text-adm-blue-bright hover:underline">{quote.phone}</a> : '—'],
                ['Company', quote.company || '—'],
                ['Role', quote.buyer_role || '—'],
                ['Timeline', quote.timeline || '—'],
                [
                  'Ship to',
                  quote.ship_to?.street ? [quote.ship_to.street, quote.ship_to.street2, quote.ship_to.city, [quote.ship_to.state, quote.ship_to.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ') : quote.zip || '—',
                ],
                ...(quote.notes ? ([['Notes', quote.notes]] as [string, string][]) : []),
              ]}
            />
          </Panel>

          <Panel title="Account" tone="dealers">
            <KV
              rows={[
                ['From', quote.source === 'admin' ? `Staff${quote.created_by_staff ? ` (${quote.created_by_staff})` : ''}` : quote.audience === 'contractor' ? 'Contractor portal' : 'Public builder'],
                ['Priced as', quote.audience === 'contractor' ? 'Contractor' : 'Customer (public pricing)'],
                [
                  'Contractor',
                  contractor ? (
                    <CellLink key="c" href={`/portal/admin/dealers/contractors/${contractor.id}/`}>
                      {contractor.company || [contractor.first_name, contractor.last_name].filter(Boolean).join(' ') || 'Contractor'}
                    </CellLink>
                  ) : (
                    '—'
                  ),
                ],
                ...(contractor ? ([['Payment', contractor.payment_terms === 'terms' ? 'Terms (invoiced)' : 'Card at checkout']] as [string, string][]) : []),
                ['Project', project ? `${project.name} (${String(project.stage).replace(/_/g, ' ')})` : '—'],
                ['Sales rep', rep ?? '—'],
                ['Lead', quote.lead_id ? <CellLink key="l" href={`/portal/admin/leads/${quote.lead_id}/`}>Open lead</CellLink> : '—'],
              ]}
            />
          </Panel>

          <Panel title="Checkout" tone="sales">
            <KV
              rows={[
                ['Live offer', active ? `${expired ? 'ended ' : 'until '}${dateTime(quote.expires_at)}` : '—'],
                ['Missing', quote.missing.length ? quote.missing.map((m) => MISSING_LABEL[m]).join(', ') : 'Nothing'],
                ['Viewed', quote.viewed_at ? dateTime(quote.viewed_at) : 'Not yet'],
                ['Reminder', quote.reminder_sent_at ? dateTime(quote.reminder_sent_at) : '—'],
                ['Offered again', quote.reoffered_at ? dateTime(quote.reoffered_at) : '—'],
                [
                  'Checkout',
                  quote.invoice_url ? (
                    <a key="i" href={quote.invoice_url} target="_blank" rel="noopener noreferrer" className="text-adm-blue-bright hover:underline">
                      Invoice (revision {quote.draft_revision}){quote.draft_revision !== quote.revision ? ', out of date' : ''}
                    </a>
                  ) : (
                    '—'
                  ),
                ],
                [
                  'Order',
                  order ? (
                    <CellLink key="o" href={`/portal/admin/orders/${order.legacy_resource_id}/`}>
                      {order.name}
                      {order.total_price != null ? ` · ${money(Number(order.total_price))}` : ''}
                    </CellLink>
                  ) : quote.shopify_order_id ? (
                    'Syncing from Shopify'
                  ) : (
                    '—'
                  ),
                ],
                ...(quote.lost_reason ? ([['Lost because', quote.lost_reason]] as [string, string][]) : []),
              ]}
            />
            <QuoteStaffActions id={quote.id} status={quote.status} hasOrder={Boolean(quote.shopify_order_id)} handoff={quote.handoff} />
          </Panel>
        </div>
      </div>
    </>
  )
}
