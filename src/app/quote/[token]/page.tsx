import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Clock, ShieldCheck } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { BuyerQuoteActions } from '@/components/quotes/BuyerQuoteActions'
import { OfferCountdown } from '@/components/quotes/OfferCountdown'
import { QuoteLines } from '@/components/quotes/QuoteLines'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { roofSummary } from '@/lib/pricing/engine'
import { discountLabel, stripCosts } from '@/lib/pricing/types'
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/pro/config'
import { getQuoteByToken } from '@/lib/quotes/data'
import { addQuoteEvent } from '@/lib/quotes/events'
import { isExpired, QUOTE_STATUS_LABEL } from '@/lib/quotes/types'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/** The buyer's private quote link: never indexed. */
export const metadata: Metadata = {
  title: 'Your Crazy Seal quote',
  robots: { index: false, follow: false, nocache: true },
}

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York', timeZoneName: 'short' })

/**
 * The buyer's quote (/quote/<token>/): the materials, the full price with the
 * live offer taken off, the offer's countdown (it ends at expires_at, then
 * "Refresh my price" prices it again) and checkout. The first time someone
 * other than staff opens it, it's stamped viewed (viewed_at and a 'viewed'
 * event).
 */
export default async function BuyerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const quote = await getQuoteByToken((await params).token)
  if (!quote) notFound()

  if (!quote.viewed_at && !(await getPortalAdmin())) {
    const { data } = await createAdminClient().from('quotes').update({ viewed_at: new Date().toISOString() }).eq('id', quote.id).is('viewed_at', null).select('id')
    if (data?.length) await addQuoteEvent(quote.id, 'viewed', 'The buyer opened the quote', { actor: quote.name })
  }

  const now = new Date().getTime()
  const expired = isExpired(quote, now)
  const active = quote.status === 'open' || quote.status === 'checkout'

  return (
    <Container size="lg" className="py-8 sm:py-12">
      <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-3xl bg-white p-5 shadow-[0_30px_60px_-30px_rgb(0_32_67/0.35)] ring-1 ring-black/5 sm:p-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Crazy Seal quote {quote.number}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">Materials for your roof</h1>
          <p className="mt-1 text-sm text-gray-500">{roofSummary(quote.inputs)}</p>
          <div className="mt-5">
            <QuoteLines lines={stripCosts(quote.lines)} totals={quote} theme="light" />
          </div>
        </section>

        <aside className="grid content-start gap-4">
          <section className="rounded-3xl bg-white p-5 shadow-[0_30px_60px_-30px_rgb(0_32_67/0.35)] ring-1 ring-black/5">
            <p className="text-sm text-gray-500">Prepared for</p>
            <p className="font-semibold text-gray-900">{quote.name}</p>
            <p className="mb-3 text-sm text-gray-500">{quote.email}</p>
            {active && (
              <div className={`mb-4 rounded-2xl px-3.5 py-3 ring-1 ${expired ? 'bg-red-50 ring-red-200' : 'bg-accent/[0.08] ring-accent/25'}`}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.16em] ${expired ? 'text-red-700' : 'text-accent-dark'}`}>
                  {quote.discount_pct > 0 ? discountLabel(quote.tier_name, quote.discount_pct) + ' off' : 'Live price'}
                </p>
                <p className={`mt-1 flex items-center gap-1.5 text-[15px] font-bold tabular-nums ${expired ? 'text-red-700' : 'text-primary'}`}>
                  <Clock className="h-4 w-4 shrink-0" />
                  <OfferCountdown expiresAt={quote.expires_at} serverNow={now} refreshOnExpire endedText={`Offer ended ${dateFmt.format(new Date(quote.expires_at))}`} />
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  {expired ? 'Refresh it for today’s price, and a new offer.' : `Your price is held until ${dateFmt.format(new Date(quote.expires_at))}. After that you can refresh it at the day’s prices.`}
                </p>
              </div>
            )}
            {!active && <p className="mb-4 text-[13px] font-semibold text-gray-700">{QUOTE_STATUS_LABEL[quote.status]}</p>}
            {quote.audience === 'contractor' ? (
              // Contractor quotes are ordered from the contractor portal, where ordering follows the team's roles.
              <a href={`/portal/quotes/${quote.id}/`} className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-110">
                Order from your contractor portal
              </a>
            ) : (
              <BuyerQuoteActions token={quote.token} status={quote.status} missing={quote.missing} handoff={quote.handoff} expired={expired} phone={quote.phone} shipTo={quote.ship_to} />
            )}
          </section>
          <p className="flex items-start gap-2 px-2 text-[12.5px] text-gray-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            Questions about coverage, colors or installing it? Call{' '}
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold text-primary">
              {SUPPORT_PHONE}
            </a>
          </p>
        </aside>
      </div>
    </Container>
  )
}
