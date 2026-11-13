import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { compareLabel, getSalesOverview, parseDay, parseRange, periodLabel, RANGES, type Totals } from '@/lib/portal/admin/sales'
import { countNewApplications, getContractorList, getPortalAccounts } from '@/lib/portal/admin/dealers'
import { bucketLabel, dateLong, dateShort, dayKey, legacyId, money, money0, num, pct, timeOfDay } from '@/lib/portal/admin/format'
import {
  Badge,
  CellLink,
  delta,
  Empty,
  FinancialBadge,
  FulfillmentBadge,
  KV,
  PageHeader,
  Panel,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'
import { ColumnChart } from '@/components/portal/admin/charts'
import { SERIES } from '@/components/portal/admin/series'
import { BarList } from '@/components/portal/admin/BarList'
import { RangePicker } from '@/components/portal/admin/RangePicker'

// Same route segment as the admin layout, so its title template doesn't apply here.
export const metadata: Metadata = { title: { absolute: 'Overview | Crazy Seal Admin' } }

type SP = Promise<Record<string, string | string[] | undefined>>

export default async function AdminOverviewPage({ searchParams }: { searchParams: SP }) {
  await requirePortalAdmin('overview')
  const sp = await searchParams
  const range = parseRange(sp.range)
  const day = range === 'day' ? parseDay(sp.day) : undefined
  const [o, contractors, portal, newApps] = await Promise.all([
    getSalesOverview(range, day),
    getContractorList(),
    getPortalAccounts(),
    countNewApplications(),
  ])
  const t = o.totals
  const p = o.previous
  const daily = range === 'day'
  const rangeLabel = periodLabel(range, o.window)
  const vs = p ? compareLabel(range, o.window) : undefined
  const d = (k: keyof Totals) => (p ? delta(t[k], p[k]) : null)
  const ordersHref = daily ? `/portal/admin/orders/?range=day${day ? `&day=${day}` : ''}` : '/portal/admin/orders/'

  const series = o.series.map((s) => ({
    key: s.key,
    label: bucketLabel(s.key, o.bucket),
    value: Math.round(s.sales * 100) / 100,
    detail: `${s.orders} order${s.orders === 1 ? '' : 's'}`,
  }))

  return (
    <>
      <PageHeader
        title="Overview"
        description={
          <>
            {daily
              ? `${rangeLabel === 'Today' || rangeLabel === 'Yesterday' ? `${rangeLabel} · ` : ''}${dateLong(`${o.window.from}T12:00:00Z`)} · by hour`
              : `${rangeLabel} · ${dateLong(`${o.window.from}T12:00:00Z`)} – ${dateLong(`${o.window.to}T12:00:00Z`)}`}
            {o.coverage.first && <span className="text-adm-faint"> · order history since {dateLong(o.coverage.first)}</span>}
          </>
        }
        actions={
          <RangePicker
            options={RANGES}
            value={range}
            day={o.window.from}
            today={dayKey(new Date())}
            min={o.coverage.first ? dayKey(o.coverage.first) : null}
            base="/portal/admin/"
            params={{}}
          />
        }
      />

      <StatGrid>
        <Stat hero label="Sales" value={money0(t.sales)} delta={d('sales')} deltaLabel={vs} sub={`${num(t.orders)} orders`} />
        <Stat label="Orders" value={num(t.orders)} delta={d('orders')} deltaLabel={vs} sub={`${num(t.buyers)} customers`} />
        <Stat label="Average order" value={money0(t.aov)} delta={d('aov')} deltaLabel={vs} />
        <Stat label="Units sold" value={num(t.units)} delta={d('units')} deltaLabel={vs} />
        <Stat label="Discounts given" value={money0(t.discounts)} delta={d('discounts')} deltaLabel={vs} upIsGood={false} tone="info" />
        <Stat label="Refunded" value={money0(t.refunds)} delta={d('refunds')} deltaLabel={vs} upIsGood={false} tone="info" />
      </StatGrid>

      <div className="mt-2 grid gap-2 xl:grid-cols-3">
        <Panel
          title="Sales"
          meta={`${{ hour: 'By hour', day: 'Daily', week: 'Weekly', month: 'Monthly' }[o.bucket]} · totals after refunds, incl. tax & shipping`}
          tone="sales"
          className="xl:col-span-2"
          bodyClassName="pt-2"
        >
          <ColumnChart data={series} valueLabel="Sales" color={SERIES.revenue} height={250} />
        </Panel>

        <div className="grid gap-2">
          <Panel title="Sales by channel" meta={rangeLabel}>
            <BarList
              rows={o.channels.map((c) => ({ key: c.key, label: c.label, value: c.sales, meta: `${c.orders} orders` }))}
              limit={4}
            />
          </Panel>
          <Panel
            title="Needs fulfillment"
            meta={`${o.openCount} open`}
            tone="dealers"
            actions={
              <Link href="/portal/admin/orders/?tab=open" className="text-[11.5px] font-medium text-adm-muted hover:text-adm-ink">
                View all
              </Link>
            }
          >
            {o.open.length ? (
              <ul className="divide-y divide-adm-line-soft">
                {o.open.map((r) => (
                  <li key={r.shopify_id} className="flex items-center gap-2 px-3 py-1.5 text-[12.5px]">
                    <CellLink href={`/portal/admin/orders/${legacyId(r.shopify_id)}/`}>{r.name}</CellLink>
                    <span className="min-w-0 flex-1 truncate text-adm-muted">{r.customer_display_name ?? r.email}</span>
                    <span className="text-[11px] text-adm-faint">{dateShort(r.shopify_created_at)}</span>
                    <FulfillmentBadge status={r.fulfillment_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Every order is fulfilled.</Empty>
            )}
          </Panel>
        </div>
      </div>

      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <Panel
          title="Top products"
          meta={rangeLabel}
          actions={
            <Link href="/portal/admin/products/" className="text-[11.5px] font-medium text-adm-muted hover:text-adm-ink">
              All products
            </Link>
          }
        >
          <BarList
            rows={o.products.map((r) => ({ key: r.key, label: r.label, value: r.sales, meta: `${num(r.units ?? 0)} units · ${r.orders} orders`, href: r.href }))}
            color={SERIES.volume}
            limit={8}
          />
        </Panel>

        <Panel
          title={daily ? `Orders · ${rangeLabel}` : 'Recent orders'}
          meta={daily ? `${num(o.recentCount)} placed` : undefined}
          actions={
            <Link href={ordersHref} className="text-[11.5px] font-medium text-adm-muted hover:text-adm-ink">
              {daily ? 'View all' : 'All orders'}
            </Link>
          }
        >
          {o.recent.length ? (
            <Table>
              <THead>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th className="hidden @2xl:table-cell">Items</Th>
                <Th className="hidden @sm:table-cell">Payment</Th>
                <Th align="right">Total</Th>
              </THead>
              <TBody>
                {o.recent.map((r) => (
                  <Tr key={r.shopify_id}>
                    <Td>
                      <CellLink href={`/portal/admin/orders/${legacyId(r.shopify_id)}/`}>{r.name}</CellLink>
                      <span className="ml-1.5 text-[11px] text-adm-faint">{daily ? timeOfDay(r.shopify_created_at) : dateShort(r.shopify_created_at)}</span>
                    </Td>
                    <Td className="max-w-[10rem] truncate">{r.customer_display_name ?? r.email ?? '—'}</Td>
                    <Td muted className="hidden max-w-[12rem] truncate @2xl:table-cell">
                      {r.items}
                    </Td>
                    <Td className="hidden @sm:table-cell">
                      <FinancialBadge status={r.financial_status} />
                    </Td>
                    <Td align="right" className="font-semibold text-adm-ink">
                      {money(r.current_total_price ?? r.total_price)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <Empty>{daily ? 'No orders on this day.' : 'No orders yet.'}</Empty>
          )}
        </Panel>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <Panel title="Top states" meta={`${rangeLabel} · ship-to`}>
          <BarList rows={o.states.map((s) => ({ key: s.key, label: s.label, value: s.sales, meta: `${s.orders} orders` }))} limit={6} />
        </Panel>
        <Panel title="Discount codes used" meta={rangeLabel}>
          <BarList
            rows={o.discountCodes.map((c) => ({ key: c.key, label: c.label, value: c.sales, meta: `${c.orders} orders` }))}
            limit={6}
            empty="No discount codes used in this range."
          />
        </Panel>
        <Panel
          title="Contractors"
          tone="dealers"
          actions={
            <Link href="/portal/admin/dealers/contractors/" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-adm-muted hover:text-adm-ink">
              Contractors <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <KV
            rows={[
              ['Contractors', `${num(contractors.summary.count)} · ${num(contractors.summary.listed)} listed publicly`],
              ['Contractor lifetime spend', `${money0(contractors.summary.lifetime)} (${pct(contractors.summary.lifetimeShare)})`],
              [
                `Orders tagged Dealer since ${o.coverage.first ? dateShort(o.coverage.first) : 'start'}`,
                `${money0(contractors.summary.dealerOrderSales)} (${pct(contractors.summary.dealerOrderShare)})`,
              ],
              [
                'Top rep',
                contractors.reps[0] ? `${contractors.reps[0].label} · ${num(contractors.reps[0].orders)} orders · ${money0(contractors.reps[0].sales)}` : '—',
              ],
              [`Contractor sales, last ${contractors.recentDays} days`, `${money0(contractors.summary.recentSales)} (${pct(contractors.summary.recentShare)})`],
              ['Pro Hub accounts', `${num(portal.summary.total)} · ${portal.summary.active30} active in 30 days`],
              [
                'New dealer applications',
                newApps ? (
                  <Link href="/portal/admin/dealers/applications/" className="hover:underline">
                    <Badge tone="gold">{newApps} to review</Badge>
                  </Link>
                ) : (
                  'None waiting'
                ),
              ],
            ]}
          />
        </Panel>
      </div>
    </>
  )
}
