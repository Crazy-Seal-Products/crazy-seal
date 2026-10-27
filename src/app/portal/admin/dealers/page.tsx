import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getDealers } from '@/lib/portal/admin/dealers'
import { getCoverage } from '@/lib/portal/admin/sales'
import { ago, dateShort, legacyId, money0, num, pct } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  CellLink,
  Empty,
  KV,
  PageHeader,
  Panel,
  SearchBox,
  Segmented,
  Stat,
  StatGrid,
  Table,
  Tag,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'
import { BarList } from '@/components/portal/admin/BarList'
import { SERIES } from '@/components/portal/admin/series'
import { PORTAL_BADGE } from '@/components/portal/admin/portal-state'

export const metadata: Metadata = { title: 'Dealer roster' }

const BASE = '/portal/admin/dealers/'

const FILTERS = [
  { key: 'all', label: 'All dealers' },
  { key: 'recent', label: 'Ordered recently' },
  { key: 'lapsed', label: 'No recent orders' },
  { key: 'untagged', label: 'Not tagged in Shopify' },
  { key: 'portal', label: 'On Pro Hub' },
  { key: 'noportal', label: 'Not on Pro Hub' },
] as const

type Filter = (typeof FILTERS)[number]['key']

const SOURCE = {
  both: { tone: 'gold', label: 'Tag + orders' },
  tag: { tone: 'neutral', label: 'Customer tag' },
  orders: { tone: 'info', label: 'Orders only' },
} as const

export default async function AdminDealersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const q = one(sp.q)?.toLowerCase()
  const filter: Filter = FILTERS.some((f) => f.key === one(sp.filter)) ? (one(sp.filter) as Filter) : 'all'
  const [{ dealers, summary, reps, recentDays }, coverage] = await Promise.all([getDealers(), getCoverage()])
  const since = coverage.first ? dateShort(coverage.first) : 'the start of the history'

  const searched = q
    ? dealers.filter((d) => [d.name, d.company, d.email, d.location, ...d.tags, ...d.reps].some((v) => v?.toLowerCase().includes(q)))
    : dealers
  const test = (f: Filter, d: (typeof dealers)[number]) =>
    f === 'recent'
      ? d.recentOrders > 0
      : f === 'lapsed'
        ? d.recentOrders === 0
        : f === 'untagged'
          ? d.source === 'orders'
          : f === 'portal'
            ? d.portal !== 'none'
            : f === 'noportal'
              ? d.portal === 'none'
              : true
  const rows = searched.filter((d) => test(filter, d))
  const params = { q: one(sp.q), filter: filter === 'all' ? undefined : filter }
  const noRep = reps.find((r) => r.key === 'No rep tag')

  return (
    <>
      <PageHeader
        title="Dealer roster"
        description="Customers tagged Dealer, Pro or Professional in Shopify, plus everyone with an order the sales team tagged “Dealer”, matched to their Pro Hub accounts."
      >
        <StatGrid>
          <Stat label="Dealers" value={num(summary.count)} sub={`${num(summary.tagged)} tagged · ${num(summary.fromOrdersOnly)} from orders`} tone="dealers" />
          <Stat hero label={`Dealer-order sales since ${since}`} value={money0(summary.dealerOrderSales)} sub={`${pct(summary.dealerOrderShare)} of all sales`} />
          <Stat label="Dealer orders" value={num(summary.dealerOrders)} sub={`since ${since}`} tone="dealers" />
          <Stat label={`Ordered in ${recentDays} days`} value={num(summary.orderedRecently)} sub={`of ${num(summary.count)} dealers`} />
          <Stat label="On the Pro Hub" value={num(summary.onPortal)} sub={`${num(summary.count - summary.onPortal)} without an account`} tone="info" />
          <Stat label="Dealer lifetime spend" value={money0(summary.spent)} sub={`${pct(summary.share, 1)} of all customer sales`} tone="info" />
        </StatGrid>
      </PageHeader>

      <div className="mb-2 grid gap-2 lg:grid-cols-2">
        <Panel title="Dealer orders by sales rep" meta={`since ${since}`} tone="dealers">
          <BarList rows={reps.map((r) => ({ key: r.key, label: r.label, value: r.sales, meta: `${num(r.orders)} orders` }))} color={SERIES.volume} limit={6} empty="No dealer orders yet." />
        </Panel>
        <Panel title="How this list is built">
          <KV
            rows={[
              ['Tagged Dealer, Pro or Professional on the Shopify customer', num(summary.tagged)],
              ['Found only through orders tagged “Dealer”', num(summary.fromOrdersOnly)],
              ['Dealer orders with no rep tag', num(noRep?.orders ?? 0)],
            ]}
          />
          <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] leading-snug text-adm-muted">
            Reps tag each dealer order “Dealer” plus their name, but usually not the customer. Tagging the customer in Shopify too would also catch dealers whose
            orders are older than the history kept here.
          </p>
        </Panel>
      </div>

      <Toolbar className="mb-2">
        <Segmented options={FILTERS.map((f) => ({ ...f, count: searched.filter((d) => test(f.key, d)).length }))} value={filter} param="filter" base={BASE} params={params} />
        <SearchBox base={BASE} params={params} value={one(sp.q)} placeholder="Dealer, company, state, rep…" />
      </Toolbar>

      <Panel tone="dealers">
        {rows.length ? (
          <Table>
            <THead>
              <Th>Dealer</Th>
              <Th className="hidden @2xl:table-cell">Location</Th>
              <Th className="hidden @3xl:table-cell">Rep</Th>
              <Th className="hidden @4xl:table-cell">Found by</Th>
              <Th align="right" className="hidden @xl:table-cell">Dealer orders</Th>
              <Th align="right">Dealer sales</Th>
              <Th align="right" className="hidden @2xl:table-cell">Lifetime</Th>
              <Th className="hidden @6xl:table-cell">Last order</Th>
              <Th>Pro Hub</Th>
              <Th align="right" className="hidden @6xl:table-cell">Warranties</Th>
            </THead>
            <TBody>
              {rows.map((d) => (
                <Tr key={d.key}>
                  <Td className="max-w-[16rem]">
                    <CellLink href={`/portal/admin/customers/${legacyId(d.key)}/`} className="block truncate">
                      {d.company || d.name}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">
                      {d.company ? d.name : d.email}
                      {d.statuses.length > 0 && ` · ${d.statuses.join(', ')}`}
                    </span>
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {d.location}
                  </Td>
                  <Td className="hidden @3xl:table-cell">
                    <span className="flex flex-wrap gap-1">{d.reps.length ? d.reps.map((r) => <Tag key={r}>{r}</Tag>) : <span className="text-adm-faint">—</span>}</span>
                  </Td>
                  <Td className="hidden @4xl:table-cell">
                    <Badge tone={SOURCE[d.source].tone}>{SOURCE[d.source].label}</Badge>
                  </Td>
                  <Td align="right" className="hidden @xl:table-cell">
                    {d.dealerOrders ? num(d.dealerOrders) : <span className="text-adm-faint">—</span>}
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {d.dealerSales ? money0(d.dealerSales) : <span className="font-normal text-adm-faint">—</span>}
                  </Td>
                  <Td align="right" muted className="hidden @2xl:table-cell">
                    {money0(d.spent)}
                  </Td>
                  <Td muted className="hidden @6xl:table-cell" title={d.lastOrderAt ?? undefined}>
                    {d.lastOrderAt ? `${dateShort(d.lastOrderAt)} · ${ago(d.lastOrderAt)}` : '—'}
                  </Td>
                  <Td title={d.lastLoginAt ? `Last sign-in ${dateShort(d.lastLoginAt)}` : undefined}>
                    <Badge tone={PORTAL_BADGE[d.portal].tone}>{PORTAL_BADGE[d.portal].label}</Badge>
                  </Td>
                  <Td align="right" muted className="hidden @6xl:table-cell">
                    {d.warranties || '—'}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No dealers match.</Empty>
        )}
      </Panel>
    </>
  )
}
