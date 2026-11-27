import type { Metadata } from 'next'
import { adminCan, requirePortalAdmin } from '@/lib/portal/admin/auth'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { getRepRoster, repForAdmin } from '@/lib/portal/admin/reps'
import { loadPricing } from '@/lib/pricing/load'
import { adminClientPricing, adminQuoteContractorContext, quoteContractorOptions } from '@/lib/quotes/admin-builder'
import { AdminQuoteBuilder } from '@/components/quotes/admin/AdminQuoteBuilder'
import { BackLink, Empty, PageHeader, Panel } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'New quote' }

/**
 * Staff build a quote for a customer or a contractor (Quotes section, so
 * Sales reps too, for any customer and any contractor). ?contractor=<id>
 * opens it on that contractor (the button on their page and on Sales reps).
 * Costs reach the browser only for roles that can open Pricing.
 */
export default async function NewAdminQuotePage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('quotes')
  const contractorParam = one((await searchParams).contractor)
  const [ctx, showCost, roster] = await Promise.all([
    loadPricing().catch((err) => {
      console.error('[admin quotes] pricing load failed', err)
      return null
    }),
    adminCan('pricing'),
    getRepRoster(),
  ])
  if (!ctx) {
    return (
      <>
        <BackLink href="/portal/admin/quotes/">Quotes</BackLink>
        <PageHeader title="New quote" />
        <Panel>
          <Empty>Prices aren’t available right now (the price book or the Shopify catalog couldn’t be read). Try again in a minute.</Empty>
        </Panel>
      </>
    )
  }

  const me = repForAdmin(admin, roster)
  const myRepId = me?.id ?? null
  const [contractors, initial] = await Promise.all([
    quoteContractorOptions(myRepId),
    contractorParam
      ? adminQuoteContractorContext(contractorParam, { ctx, showCost, roster }).catch((err) => {
          console.error('[admin quotes] contractor load failed', err)
          return null
        })
      : Promise.resolve(null),
  ])

  return (
    <AdminQuoteBuilder
      publicPricing={adminClientPricing(ctx, { audience: 'public' }, showCost)}
      showCost={showCost}
      contractors={contractors}
      initial={initial}
      myRepName={myRepId ? (me?.name ?? null) : null}
      blocked={
        admin.role === 'sales_rep' && !myRepId
          ? 'Your login isn’t linked to a sales rep yet, so a quote you save wouldn’t show in your Quotes. Ask an admin to link it on Sales reps.'
          : null
      }
    />
  )
}
