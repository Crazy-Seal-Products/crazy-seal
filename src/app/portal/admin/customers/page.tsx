import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import {
  CUSTOMER_SEGMENTS,
  CUSTOMER_SORTS,
  customerName,
  getCustomerInsights,
  getCustomersPage,
} from '@/lib/portal/admin/sales'
import { dateShort, legacyId, money, money0, num, pct } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  CellLink,
  Empty,
  PageHeader,
  Pagination,
  Panel,
  SearchBox,
  Segmented,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Customers' }

const BASE = '/portal/admin/customers/'

export default async function AdminCustomersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const q = one(sp.q)
  const segment = pick(sp.segment, CUSTOMER_SEGMENTS, 'all')
  const sort = pick(sp.sort, CUSTOMER_SORTS, 'spent')
  const params = { q, segment: segment === 'all' ? undefined : segment, sort: sort === 'spent' ? undefined : sort }
  const [data, insights] = await Promise.all([getCustomersPage({ q, segment, sort, page: pageNum(sp.page) }), getCustomerInsights()])

  return (
    <>
      <PageHeader title="Customers" description="Every Shopify customer, with lifetime spend and order counts straight from Shopify.">
        <StatGrid>
          <Stat label="Customers" value={num(insights.total)} sub={`${num(insights.subscribed)} email subscribers`} tone="info" />
          <Stat label="Have purchased" value={num(insights.buyers)} sub={pct(insights.buyers / Math.max(1, insights.total)) + ' of all customers'} />
          <Stat label="Repeat buyers" value={num(insights.repeat)} sub={`${pct(insights.repeatRate)} repeat rate`} />
          <Stat label="Lifetime sales" value={money0(insights.lifetime)} sub="all-time, from Shopify" />
          <Stat label="Avg. lifetime value" value={money0(insights.avgLtv)} sub="per purchasing customer" />
          <Stat label="Dealers" value={num(insights.dealers)} sub="tagged in Shopify" tone="dealers" />
        </StatGrid>
        <Toolbar>
          <Segmented
            options={CUSTOMER_SEGMENTS.map((s) => ({ ...s, count: data.counts[s.key] }))}
            value={segment}
            param="segment"
            base={BASE}
            params={params}
          />
          <Segmented options={CUSTOMER_SORTS} value={sort} param="sort" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Name, email, phone, company, tag…" />
        </Toolbar>
      </PageHeader>

      <Panel title={`${num(data.total)} customers`} meta={`${money0(data.spent)} lifetime spend`}>
        {data.rows.length ? (
          <Table>
            <THead>
              <Th>Customer</Th>
              <Th className="hidden @2xl:table-cell">Location</Th>
              <Th align="right">Orders</Th>
              <Th align="right">Spent</Th>
              <Th className="hidden @xl:table-cell">Last order</Th>
              <Th className="hidden @3xl:table-cell">Type</Th>
              <Th className="hidden @4xl:table-cell">Email</Th>
              <Th className="hidden @4xl:table-cell">Since</Th>
            </THead>
            <TBody>
              {data.rows.map((c) => (
                <Tr key={c.shopify_id}>
                  <Td className="max-w-[16rem]">
                    <CellLink href={`${BASE}${legacyId(c.shopify_id)}/`} className="block truncate">
                      {customerName(c)}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">{c.company ?? c.email ?? c.phone ?? ''}</span>
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {[c.city, c.province].filter(Boolean).join(', ') || '—'}
                  </Td>
                  <Td align="right">{num(c.number_of_orders)}</Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money(c.amount_spent)}
                  </Td>
                  <Td muted className="hidden @xl:table-cell">
                    {dateShort(c.last_order_at)}
                  </Td>
                  <Td className="hidden @3xl:table-cell">
                    <span className="flex gap-1">
                      {c.is_dealer && <Badge tone="gold">Dealer</Badge>}
                      {c.is_commercial && <Badge tone="info">Commercial</Badge>}
                      {!c.is_dealer && !c.is_commercial && <span className="text-adm-faint">Retail</span>}
                    </span>
                  </Td>
                  <Td className="hidden @4xl:table-cell">
                    {c.email_marketing_state === 'SUBSCRIBED' ? <Badge tone="good">Subscribed</Badge> : <span className="text-adm-faint">—</span>}
                  </Td>
                  <Td muted className="hidden @4xl:table-cell">
                    {dateShort(c.shopify_created_at)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No customers match.</Empty>
        )}
        <Pagination page={data.page} pages={data.pages} total={data.total} base={BASE} params={params} noun="customers" />
      </Panel>
    </>
  )
}
