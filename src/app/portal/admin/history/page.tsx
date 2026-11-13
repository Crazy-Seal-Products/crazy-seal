import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { bucketKey, customerName, getCoverage, getCustomerInsights, getHistory, type HistoryBucket } from '@/lib/portal/admin/sales'
import { dateShort, dayKey, dayLabel, legacyId, money0, monthLabel, num, pct, weekdayLabel } from '@/lib/portal/admin/format'
import { pick, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  CellLink,
  Empty,
  PageHeader,
  Panel,
  Segmented,
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

export const metadata: Metadata = { title: 'Sales history' }

const BASE = '/portal/admin/history/'

const VIEWS = [
  { key: 'day', label: 'Daily' },
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
] as const

/** Daily shows this many days; weeks and months go back to the start of the history. */
const DAILY_DAYS = 90

const NOUN: Record<HistoryBucket, { one: string; title: string }> = {
  day: { one: 'day', title: 'Daily' },
  week: { one: 'week', title: 'Weekly' },
  month: { one: 'month', title: 'Monthly' },
}

export default async function AdminHistoryPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('history')
  const view: HistoryBucket = pick((await searchParams).view, VIEWS, 'month')
  const [all, insights, coverage] = await Promise.all([getHistory(view), getCustomerInsights(), getCoverage()])
  const periods = view === 'day' ? all.slice(-DAILY_DAYS) : all
  const firstDay = coverage.first ? dayKey(coverage.first) : null
  const today = dayKey(new Date())
  const current = view === 'month' ? today.slice(0, 7) : bucketKey(today, view)
  const first = firstDay ? (view === 'month' ? firstDay.slice(0, 7) : bucketKey(firstDay, view)) : null
  const startsMidway = firstDay != null && (view === 'month' ? !firstDay.endsWith('-01') : view === 'week' && first !== firstDay)
  const partial = (key: string) =>
    key === current ? (view === 'day' ? 'so far' : 'to date') : key === first && startsMidway ? `from ${dateShort(coverage.first)}` : null
  const label = (key: string) => (view === 'day' ? weekdayLabel(key) : view === 'week' ? `Week of ${dayLabel(key)}` : monthLabel(key))
  const tick = (key: string) => (view === 'day' ? dayLabel(key) : view === 'week' ? `Wk ${dayLabel(key)}` : monthLabel(key))
  const best = [...all].sort((a, b) => b.sales - a.sales)[0]
  const sales = all.reduce((n, m) => n + m.sales, 0)
  const orders = all.reduce((n, m) => n + m.orders, 0)
  const months = new Set(all.map((m) => m.key.slice(0, 7))).size
  const noun = NOUN[view]

  return (
    <>
      <PageHeader
        title="Sales history"
        description="Orders by day, week or month from the history kept here, plus all-time customer value straight from Shopify (back to 2019)."
        actions={<Segmented options={VIEWS} value={view} param="view" base={BASE} params={{}} />}
      >
        <StatGrid>
          <Stat label="All-time customer sales" value={money0(insights.lifetime)} sub={`${num(insights.buyers)} purchasing customers`} />
          <Stat label="Avg. lifetime value" value={money0(insights.avgLtv)} sub="per purchasing customer" />
          <Stat label="Repeat rate" value={pct(insights.repeatRate)} sub={`${num(insights.repeat)} repeat buyers`} />
          <Stat label="Orders in history" value={num(orders)} sub={`${money0(sales)} · ${months} months`} tone="info" />
          <Stat label={`Best ${noun.one}`} value={best?.sales ? label(best.key) : '—'} sub={best?.sales ? money0(best.sales) : undefined} tone="info" />
          <Stat label="Avg. order (history)" value={money0(orders ? sales / orders : 0)} tone="info" />
        </StatGrid>
      </PageHeader>

      <div className="grid gap-2 xl:grid-cols-2">
        <Panel
          title={`Sales by ${noun.one}`}
          meta={view === 'day' ? `last ${DAILY_DAYS} days` : 'orders in the history here'}
          tone="sales"
          bodyClassName="pt-2"
        >
          {periods.length ? (
            <ColumnChart
              data={periods.map((m) => ({ key: m.key, label: tick(m.key), value: Math.round(m.sales * 100) / 100, detail: `${m.orders} orders` }))}
              valueLabel="Sales"
              color={SERIES.revenue}
            />
          ) : (
            <Empty>No orders yet.</Empty>
          )}
        </Panel>
        <Panel title="New customers by month" meta="last 24 months · all Shopify customers" tone="info" bodyClassName="pt-2">
          <ColumnChart
            data={insights.acquisition.map((m) => ({ key: m.key, label: monthLabel(m.key), value: m.customers, detail: `${m.buyers} have purchased` }))}
            valueLabel="New customers"
            format="int"
            color={SERIES.volume}
          />
        </Panel>
      </div>

      <Panel title={`${noun.title} breakdown`} meta={view === 'day' ? `last ${DAILY_DAYS} days, newest first` : undefined} className="mt-2">
        <Table>
          <THead>
            <Th>{view === 'day' ? 'Day' : view === 'week' ? 'Week' : 'Month'}</Th>
            <Th align="right">Orders</Th>
            <Th align="right">Sales</Th>
            <Th align="right">Avg. order</Th>
            <Th align="right" className="hidden @xl:table-cell">Units</Th>
            <Th align="right" className="hidden @2xl:table-cell">Customers</Th>
            <Th align="right" className="hidden @3xl:table-cell">Discounts</Th>
            <Th align="right" className="hidden @3xl:table-cell">Refunds</Th>
          </THead>
          <TBody>
            {[...periods].reverse().map((m) => (
              <Tr key={m.key}>
                <Td className="font-medium text-adm-ink">
                  {label(m.key)}
                  {partial(m.key) && <span className="ml-1.5 text-[11px] font-normal text-adm-faint">{partial(m.key)}</span>}
                </Td>
                <Td align="right">{num(m.orders)}</Td>
                <Td align="right" className="font-semibold text-adm-ink">
                  {money0(m.sales)}
                </Td>
                <Td align="right">{money0(m.aov)}</Td>
                <Td align="right" muted className="hidden @xl:table-cell">
                  {num(m.units)}
                </Td>
                <Td align="right" muted className="hidden @2xl:table-cell">
                  {num(m.buyers)}
                </Td>
                <Td align="right" muted className="hidden @3xl:table-cell">
                  {money0(m.discounts)}
                </Td>
                <Td align="right" muted className="hidden @3xl:table-cell">
                  {money0(m.refunds)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Panel>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <Panel title="Customers by year joined" meta="lifetime spend of each cohort">
          <Table>
            <THead>
              <Th>Year</Th>
              <Th align="right">Customers</Th>
              <Th align="right" className="hidden @sm:table-cell">Bought</Th>
              <Th align="right">Lifetime spend</Th>
            </THead>
            <TBody>
              {[...insights.years].reverse().map((y) => (
                <Tr key={y.key}>
                  <Td className="font-medium text-adm-ink">{y.key}</Td>
                  <Td align="right">{num(y.customers)}</Td>
                  <Td align="right" muted className="hidden @sm:table-cell">
                    {num(y.buyers)}
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(y.spent)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </Panel>
        <Panel title="Lifetime value spread" meta="purchasing customers">
          <BarList rows={insights.ltv.map((b) => ({ key: b.key, label: b.label, value: b.customers, meta: money0(b.spent) }))} format="int" color={SERIES.volume} />
        </Panel>
        <Panel title="Top states" meta="by customer lifetime spend">
          <BarList rows={insights.states.map((s) => ({ key: s.key, label: s.label, value: s.spent, meta: `${num(s.customers)} customers` }))} limit={8} />
        </Panel>
      </div>

      <Panel title="Top customers of all time" className="mt-2" tone="dealers">
        <Table>
          <THead>
            <Th>Customer</Th>
            <Th className="hidden @2xl:table-cell">Location</Th>
            <Th className="hidden @xl:table-cell">Type</Th>
            <Th align="right">Orders</Th>
            <Th align="right">Lifetime spend</Th>
          </THead>
          <TBody>
            {insights.top.map((c) => (
              <Tr key={c.shopify_id}>
                <Td>
                  <CellLink href={`/portal/admin/customers/${legacyId(c.shopify_id)}/`}>{customerName(c)}</CellLink>
                  {c.company && <span className="ml-1.5 text-[11px] text-adm-muted">{c.company}</span>}
                </Td>
                <Td muted className="hidden @2xl:table-cell">
                  {[c.city, c.province].filter(Boolean).join(', ') || '—'}
                </Td>
                <Td className="hidden @xl:table-cell">{c.is_dealer ? <Badge tone="gold">Dealer</Badge> : c.is_commercial ? <Badge tone="info">Commercial</Badge> : <span className="text-adm-faint">Retail</span>}</Td>
                <Td align="right">{num(c.number_of_orders)}</Td>
                <Td align="right" className="font-semibold text-adm-ink">
                  {money0(c.amount_spent)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Panel>
    </>
  )
}
