import Link from 'next/link'
import { BadgePercent, Calculator, Clock, Package, Truck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { jobDiscountFor, listUnitPrice, nextJobDiscount, round2, type Discount } from '@/lib/pricing/engine'
import { bandLabel, PRODUCT_INFO, type PriceList as PriceListData, type ProductKey } from '@/lib/pricing/price-list-2027'
import { usd, type PricingSettings } from '@/lib/pricing/types'
import { Panel, ProgressBar, StatusPill } from '@/components/portal/ui'
import { portalButton } from '@/components/portal/portal-styles'

const fmt = (n: number) => n.toLocaleString('en-US')

/** The columns: retail, then each project band. */
type Column = { key: string; title: string; sub: string; basis: { kind: 'retail'; band: null } | { kind: 'project'; band: PriceListData['bands'][number] } }

const ROWS: Array<{ product: ProductKey; sizes: string }> = [
  { product: 'seal', sizes: '1, 3 and 5 gallon pails' },
  { product: 'patch', sizes: '1 gallon' },
  { product: 'caulk', sizes: 'Tube' },
  { product: 'clean', sizes: '1 gallon' },
  { product: 'tape', sizes: '25 ft roll' },
  { product: 'tote', sizes: '275 gallon tote' },
]

function why(d: Discount | null, orders: number | null): string {
  if (!d) return 'Full price on every quote.'
  if (d.kind === 'jobs') return `You have ${fmt(orders ?? 0)} Crazy Seal orders: ${d.pct}% off.`
  if (d.kind === 'tier') return `Your ${d.name} pricing: ${d.pct}% off${orders != null ? ` (you have ${fmt(orders)} orders)` : ''}.`
  if (d.kind === 'volume') return `${d.name}: ${d.pct}% off.`
  return `The live offer: ${d.pct}% off for everyone${orders != null ? ` (you have ${fmt(orders)} orders)` : ''}.`
}

/**
 * The contractor's price list (the Catalog page's Price list tab): Crazy
 * Seal's prices for each product at retail (RV roofs and roofs under the
 * first project band) and at each project band, the contractor's discount
 * and why (the single best of the live offer, their order-count level and
 * their assigned tier), how many orders to the next level, and the resulting
 * prices. The same numbers the quote builder uses (pricing_settings
 * .price_list, or the built-in 2027 sheet before migration 036). Server
 * component: `settings` holds costs and never reaches the browser.
 */
export function PriceList({
  settings,
  orders,
  discount,
  canQuote,
}: {
  settings: PricingSettings
  orders: number | null
  discount: Discount | null
  canQuote: boolean
}) {
  const list = settings.price_list
  const levels = settings.job_discounts
  const pct = discount?.pct ?? 0
  const reached = jobDiscountFor(orders, levels)
  const next = nextJobDiscount(orders, levels)
  const nextHelps = next && next.pct > pct
  const from = reached?.minOrders ?? 0
  const progress = next && orders != null ? ((orders - from) / Math.max(1, next.minOrders - from)) * 100 : 100

  const columns: Column[] = [
    { key: 'retail', title: 'Retail', sub: `RV roofs and under ${fmt(list.bands[0]?.minSqft ?? 1500)} sq ft`, basis: { kind: 'retail', band: null } },
    ...list.bands.map((b) => ({ key: `band-${b.minSqft}`, title: 'Project', sub: bandLabel(b), basis: { kind: 'project' as const, band: b } })),
  ]
  const tote = list.tote

  return (
    <>
      <p className="mb-5 max-w-3xl text-sm text-[var(--p-muted)]">
        Retail for RV roofs and roofs under {fmt(list.bands[0]?.minSqft ?? 1500)} sq ft, project pricing by roof size above. Your discount comes off the full price on every
        quote.
      </p>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel className="overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[var(--p-primary)] opacity-20 blur-3xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">Your discount</p>
              <p className="mt-1 text-4xl font-black tabular-nums text-[var(--p-ink)] md:text-5xl">{pct ? `${pct}% off` : 'Full price'}</p>
              <p className="mt-2 max-w-md text-sm text-[var(--p-ink)]">{why(discount, orders)}</p>
              {orders == null && <p className="mt-1 text-xs text-[var(--p-muted)]">We couldn’t count your orders just now; quotes count them again when you save one.</p>}
            </div>
            {discount && <StatusPill status="won" label={discount.kind === 'jobs' ? `${reached?.minOrders}+ orders` : discount.kind === 'tier' ? discount.name : 'Live offer'} />}
          </div>

          {levels.length > 0 && (
            <div className="relative mt-6">
              {nextHelps && orders != null ? (
                <>
                  <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-semibold text-[var(--p-ink)]">
                      {fmt(next.minOrders - orders)} more order{next.minOrders - orders === 1 ? '' : 's'} to {next.pct}% off
                    </span>
                    <span className="font-mono text-xs text-[var(--p-muted)]">
                      {fmt(orders)} / {fmt(next.minOrders)}
                    </span>
                  </div>
                  <ProgressBar pct={progress} />
                </>
              ) : (
                <p className="text-sm font-semibold text-[var(--p-ink)]">{reached && !next ? 'You’re at the top order level.' : 'Your discount already beats the next order level.'}</p>
              )}
              <ol className="mt-4 grid gap-2 sm:grid-cols-3">
                <li
                  className={twMerge(
                    'rounded-2xl border px-3 py-2.5 text-xs',
                    discount?.kind === 'offer' ? 'border-[var(--p-primary)] bg-[color-mix(in_oklab,var(--p-primary)_12%,transparent)]' : 'border-[var(--p-line)] bg-white/[0.03]',
                  )}
                >
                  <span className="block text-lg font-bold text-[var(--p-ink)]">{settings.offer_discount_pct}%</span>
                  <span className="text-[var(--p-muted)]">Everyone (live offer)</span>
                </li>
                {levels.map((l) => (
                  <li
                    key={l.minOrders}
                    className={twMerge(
                      'rounded-2xl border px-3 py-2.5 text-xs',
                      discount?.kind === 'jobs' && reached?.minOrders === l.minOrders
                        ? 'border-[var(--p-primary)] bg-[color-mix(in_oklab,var(--p-primary)_12%,transparent)]'
                        : 'border-[var(--p-line)] bg-white/[0.03]',
                    )}
                  >
                    <span className="block text-lg font-bold text-[var(--p-ink)]">{l.pct}%</span>
                    <span className="text-[var(--p-muted)]">{fmt(l.minOrders)}+ orders</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-[var(--p-muted)]">Discounts don’t stack: each quote gets the best one. Orders count your company’s Crazy Seal orders (cancelled ones don’t).</p>
            </div>
          )}
        </Panel>

        <Panel delay={0.06}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--p-muted)]">How quotes work</p>
          <ul className="mt-3 space-y-3 text-sm text-[var(--p-ink)]">
            <li className="flex gap-3">
              <BadgePercent className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
              <span>Every quote shows the full price with your discount taken off.</span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
              <span>A saved quote’s price is a live offer for {settings.offer_hours} hours. After that, refresh it at the day’s prices.</span>
            </li>
            <li className="flex gap-3">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
              <span>
                Free shipping from {usd(settings.free_shipping_over, false)} to {usd(settings.free_shipping_under, false)}; below that shipping is added at checkout, and larger orders ship
                freight, which Crazy Seal quotes.
              </span>
            </li>
            <li className="flex gap-3">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-[var(--p-accent)]" />
              <span>
                Jobs needing {fmt(tote.gallons)}+ gallons of Crazy Seal get whole {fmt(tote.gallons)}-gallon totes at {usd(tote.perGallon, false)}/gal (
                {usd(tote.gallons * tote.perGallon, false)}), with pails for the rest.
              </span>
            </li>
          </ul>
          {canQuote && (
            <Link href="/portal/quotes/new/" className={twMerge(portalButton, 'mt-5 w-full')}>
              <Calculator className="h-4 w-4" /> Build a quote
            </Link>
          )}
        </Panel>
      </div>

      <Panel className="mt-5 overflow-hidden !p-0" delay={0.1}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[var(--p-line)] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-[var(--p-ink)] md:text-lg">Your prices</h2>
            <p className="text-xs text-[var(--p-muted)]">{pct ? `With your ${pct}% off; the full price is struck through.` : 'Full price.'} Per unit.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm text-[var(--p-ink)]">
            <thead>
              <tr className="border-b border-[var(--p-line)]">
                <th scope="col" className="px-5 pb-3 pt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)]">
                  Product
                </th>
                {columns.map((col) => (
                  <th key={col.key} scope="col" className="px-3 pb-3 pt-4 text-right">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--p-muted)]">{col.title}</span>
                    <span className="block text-[11px] font-normal text-[var(--p-muted)] opacity-80">{col.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map(({ product, sizes }) => {
                const info = PRODUCT_INFO[product]
                return (
                  <tr key={product} className="border-t border-white/[0.05] first:border-t-0">
                    <td className="px-5 py-3.5">
                      <span className="block font-semibold">{info.name}</span>
                      <span className="block text-xs text-[var(--p-muted)]">
                        {sizes} · per {product === 'tote' ? 'gallon' : info.unit}
                      </span>
                    </td>
                    {columns.map((col) => {
                      const full = listUnitPrice(product, col.basis, list)
                      const yours = round2(full * (1 - pct / 100))
                      return (
                        <td key={col.key} className="whitespace-nowrap px-3 py-3.5 text-right tabular-nums">
                          <span className="block font-bold">{usd(yours)}</span>
                          {pct > 0 && <span className="block text-[11px] text-[var(--p-muted)] line-through">{usd(full)}</span>}
                          {product === 'tote' && <span className="block text-[11px] text-[var(--p-muted)]">{usd(round2(yours * tote.gallons), false)} a tote</span>}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-[var(--p-line)] px-5 py-3 text-[11px] text-[var(--p-muted)]">
          Project prices are by the roof’s size, so one quote uses one column. Crazy Clean and Crazy Tape have no retail price: retail quotes use the project price. Totes
          appear once a job needs {fmt(tote.gallons)} gallons.
        </p>
      </Panel>
    </>
  )
}
