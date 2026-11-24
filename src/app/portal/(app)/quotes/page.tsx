import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requirePortal } from '@/lib/contractor/guard'
import { can } from '@/lib/contractor/roles'
import { listContractorQuotes } from '@/lib/quotes/data'
import { projectNames } from '@/lib/quotes/portal'
import { isExpired, type QuoteRow } from '@/lib/quotes/types'
import { Panel, ViewHeader } from '@/components/portal/ui'
import { portalButton } from '@/components/portal/portal-styles'
import { PortalQuotesTable, QuotesEmpty, QuoteStats } from '@/components/quotes/PortalQuoteParts'
import { quoteListRows } from '@/components/quotes/portal-quote-rows'

export const metadata: Metadata = { title: 'Quotes' }

/**
 * Crazy Seal's material quotes for this contractor, newest first (Thermo's
 * "All quotes" table). A sales rep sees the quotes they made; roles that see
 * the whole company see all.
 */
export default async function PortalQuotesPage() {
  const viewer = await requirePortal('quotes.view')
  const mine = !can(viewer.role, 'sales.view_all')
  const quotes = await listContractorQuotes(viewer.contractor.id, { createdBy: mine ? viewer.proUserId : null })
  const projects = await projectNames(viewer.contractor.id, quotes.map((q) => q.project_id ?? ''))
  const canCreate = !viewer.readOnly && can(viewer.role, 'quotes.create')
  const now = new Date().getTime()

  const live = quotes.filter((q) => (q.status === 'open' || q.status === 'checkout') && !isExpired(q, now))
  const ordered = quotes.filter((q) => q.status === 'ordered')
  const sum = (list: QuoteRow[]) => list.reduce((s, q) => s + (Number(q.total) || 0), 0)

  return (
    <>
      <ViewHeader
        kicker="Material quotes"
        title={live.length ? `${live.length} open quote${live.length === 1 ? '' : 's'}` : 'All quotes'}
        description="Crazy Seal’s price for the materials on each roof, at your tier. Order straight from a quote."
      >
        {canCreate && (
          <Link href="/portal/quotes/new/" className={portalButton}>
            <Plus className="h-4 w-4" /> New quote
          </Link>
        )}
      </ViewHeader>

      {quotes.length > 0 && <QuoteStats open={live.length} openValue={sum(live)} ordered={ordered.length} orderedValue={sum(ordered)} />}

      <Panel className="overflow-hidden !p-0" delay={0.1}>
        <div className="flex items-center justify-between gap-3 border-b border-[var(--p-line)] px-5 py-4">
          <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">All quotes</h2>
          {quotes.length > 0 && <p className="text-xs text-[var(--p-muted)]">{quotes.length} total</p>}
        </div>
        <PortalQuotesTable
          rows={quoteListRows(quotes, projects, now)}
          empty={
            <QuotesEmpty canCreate={canCreate}>
              {canCreate && (
                <Link href="/portal/quotes/new/" className={portalButton}>
                  <Plus className="h-4 w-4" /> New quote
                </Link>
              )}
            </QuotesEmpty>
          }
        />
      </Panel>
    </>
  )
}
