import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requirePortal } from '@/lib/contractor/guard'
import { can } from '@/lib/contractor/roles'
import { clientPricing, loadPricing } from '@/lib/pricing/load'
import { contractorOrderCount } from '@/lib/pricing/order-count'
import { SUPPORT_PHONE } from '@/lib/pro/config'
import { listContractorQuotes } from '@/lib/quotes/data'
import { contractorPriceLabel, projectNames, quotableProjects } from '@/lib/quotes/portal'
import { PortalQuoteBuilder } from '@/components/quotes/PortalQuoteBuilder'
import { PortalQuotesTable } from '@/components/quotes/PortalQuoteParts'
import { quoteListRows } from '@/components/quotes/portal-quote-rows'
import { Panel, ViewHeader } from '@/components/portal/ui'

export const metadata: Metadata = { title: 'New quote' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/** How many of the latest quotes show under the builder. */
const RECENT = 6

/**
 * A new materials quote (Thermo's quote builder layout). ?project=<id> opens
 * it on that project, with the roof and site filled in. Prices come from the
 * price list (retail or the roof's project band) less the contractor's best
 * discount: the live offer, their order-count level (their Crazy Seal orders)
 * or their assigned tier (contractors.pricing_tier_id). The latest quotes
 * show under the builder.
 */
export default async function NewPortalQuotePage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('quotes.create')
  const sp = await searchParams
  const projectParam = typeof sp.project === 'string' ? sp.project : null
  const seesQuotes = can(viewer.role, 'quotes.view')
  const mine = !can(viewer.role, 'sales.view_all')

  const [ctx, orderCount, projects, quotes] = await Promise.all([
    loadPricing().catch((err) => {
      console.error('[portal quotes] pricing load failed', err)
      return null
    }),
    // Only the preview's discount depends on it; the server counts again when the quote is saved.
    contractorOrderCount(viewer.contractor).catch((err) => {
      console.error('[portal quotes] order count failed', err)
      return null
    }),
    quotableProjects(viewer),
    seesQuotes
      ? listContractorQuotes(viewer.contractor.id, { createdBy: mine ? viewer.proUserId : null, limit: RECENT }).catch((err) => {
          console.error('[portal quotes] recent quotes failed', err)
          return []
        })
      : Promise.resolve([]),
  ])
  if (!ctx) {
    return (
      <>
        <ViewHeader kicker="Quote builder" title="Spec a roof in minutes" />
        <Panel>
          <p className="text-sm text-[var(--p-muted)]">Prices aren’t available right now. Try again in a minute, or call Crazy Seal at {SUPPORT_PHONE}.</p>
        </Panel>
      </>
    )
  }

  const c = viewer.contractor
  const pricing = clientPricing(ctx, { audience: 'contractor', contractorTierId: c.pricing_tier_id, paymentTerms: c.payment_terms, orderCount })
  const names = quotes.length ? await projectNames(c.id, quotes.map((q) => q.project_id ?? '')) : new Map<string, string>()

  return (
    <PortalQuoteBuilder
      pricing={pricing}
      projects={projects}
      initialProjectId={projects.some((p) => p.id === projectParam) ? projectParam : null}
      tierLabel={contractorPriceLabel(c, ctx.tiers, ctx.settings, orderCount)}
      terms={c.payment_terms === 'terms'}
      readOnly={viewer.readOnly}
      contractorName={viewer.contractorName}
      recent={
        quotes.length > 0 ? (
          <Panel className="overflow-hidden !p-0" delay={0.15}>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--p-line)] px-5 py-4">
              <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">Recent quotes</h2>
              <Link href="/portal/quotes/" className="group inline-flex items-center gap-1 text-xs font-semibold text-[var(--p-primary)] hover:underline">
                All quotes <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
            <PortalQuotesTable rows={quoteListRows(quotes, names, new Date().getTime())} />
          </Panel>
        ) : null
      }
    />
  )
}
