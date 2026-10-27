import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { channelLabel, getOrdersPage, ORDER_TABS, RANGES } from '@/lib/portal/admin/sales'
import { addressLine, dateShort, legacyId, money, money0, num } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import {
  CellLink,
  Empty,
  FinancialBadge,
  FulfillmentBadge,
  PageHeader,
  Pagination,
  Panel,
  SearchBox,
  Segmented,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Orders' }

const BASE = '/portal/admin/orders/'

export default async function AdminOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const q = one(sp.q)
  const tab = pick(sp.tab, ORDER_TABS, 'all')
  const range = pick(sp.range, RANGES, 'all')
  const params = { q, tab: tab === 'all' ? undefined : tab, range: range === 'all' ? undefined : range }
  const data = await getOrdersPage({ q, tab, range, page: pageNum(sp.page) })

  return (
    <>
      <PageHeader
        title="Orders"
        description={`${num(data.total)} orders · ${money0(data.sum)} in sales${q ? ` matching “${q}”` : ''}`}
      >
        <Toolbar>
          <Segmented options={ORDER_TABS.map((t) => ({ ...t, count: data.counts[t.key] }))} value={tab} param="tab" base={BASE} params={params} />
          <Segmented options={RANGES} value={range} param="range" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Order #, customer, email, product…" />
        </Toolbar>
      </PageHeader>

      <Panel>
        {data.rows.length ? (
          <Table>
            <THead>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Customer</Th>
              <Th className="hidden @4xl:table-cell">Items</Th>
              <Th className="hidden @2xl:table-cell">Channel</Th>
              <Th className="hidden @5xl:table-cell">Ship to</Th>
              <Th>Payment</Th>
              <Th>Fulfillment</Th>
              <Th align="right">Total</Th>
            </THead>
            <TBody>
              {data.rows.map((o) => (
                <Tr key={o.shopify_id}>
                  <Td>
                    <CellLink href={`${BASE}${legacyId(o.shopify_id)}/`}>{o.name}</CellLink>
                  </Td>
                  <Td muted>{dateShort(o.shopify_created_at)}</Td>
                  <Td className="max-w-[13rem] truncate">
                    {o.customer_shopify_id ? (
                      <CellLink href={`/portal/admin/customers/${legacyId(o.customer_shopify_id)}/`} className="font-medium text-adm-text">
                        {o.customer_display_name ?? o.email}
                      </CellLink>
                    ) : (
                      o.customer_display_name ?? o.email ?? '—'
                    )}
                  </Td>
                  <Td muted className="hidden max-w-[16rem] truncate @4xl:table-cell">
                    {o.items}
                    {o.units > 0 && <span className="text-adm-faint"> · {o.units} units</span>}
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {channelLabel(o.source_name).replace(' (phone & specialists)', '')}
                  </Td>
                  <Td muted className="hidden @5xl:table-cell">
                    {addressLine({ city: o.city, provinceCode: o.province })}
                  </Td>
                  <Td>
                    <FinancialBadge status={o.financial_status} />
                  </Td>
                  <Td>
                    <FulfillmentBadge status={o.fulfillment_status} cancelled={Boolean(o.cancelled_at)} />
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money(o.cancelled_at ? 0 : o.current_total_price ?? o.total_price)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No orders match these filters.</Empty>
        )}
        <Pagination page={data.page} pages={data.pages} total={data.total} base={BASE} params={params} noun="orders" />
      </Panel>
    </>
  )
}
