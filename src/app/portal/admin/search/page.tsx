import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { customerName, getCustomersPage, getOrdersPage } from '@/lib/portal/admin/sales'
import { dateShort, legacyId, money, num } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  CellLink,
  Empty,
  FinancialBadge,
  FulfillmentBadge,
  PageHeader,
  Panel,
  SearchBox,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Search' }

export default async function AdminSearchPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const q = one((await searchParams).q)
  const [orders, customers] = q
    ? await Promise.all([getOrdersPage({ q }), getCustomersPage({ q, sort: 'spent' })])
    : [null, null]

  return (
    <>
      <PageHeader title={q ? `Results for “${q}”` : 'Search'} description="Orders and customers by number, name, email, phone, company or product.">
        <SearchBox base="/portal/admin/search/" params={{}} value={q} placeholder="Search orders and customers…" className="sm:max-w-md" />
      </PageHeader>

      {q && orders && customers && (
        <div className="grid gap-2 xl:grid-cols-2">
          <Panel
            title="Orders"
            meta={`${num(orders.total)} found`}
            tone="sales"
            actions={orders.total > 10 ? <CellLink href={`/portal/admin/orders/?q=${encodeURIComponent(q)}`} className="text-[11.5px] font-medium">See all</CellLink> : undefined}
          >
            {orders.rows.length ? (
              <Table>
                <THead>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Payment</Th>
                  <Th>Fulfillment</Th>
                  <Th align="right">Total</Th>
                </THead>
                <TBody>
                  {orders.rows.slice(0, 10).map((o) => (
                    <Tr key={o.shopify_id}>
                      <Td>
                        <CellLink href={`/portal/admin/orders/${legacyId(o.shopify_id)}/`}>{o.name}</CellLink>
                        <span className="ml-1.5 text-[11px] text-adm-faint">{dateShort(o.shopify_created_at)}</span>
                      </Td>
                      <Td className="max-w-[11rem] truncate">{o.customer_display_name ?? o.email ?? '—'}</Td>
                      <Td>
                        <FinancialBadge status={o.financial_status} />
                      </Td>
                      <Td>
                        <FulfillmentBadge status={o.fulfillment_status} cancelled={Boolean(o.cancelled_at)} />
                      </Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money(o.current_total_price ?? o.total_price)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No orders match.</Empty>
            )}
          </Panel>
          <Panel
            title="Customers"
            meta={`${num(customers.total)} found`}
            tone="info"
            actions={customers.total > 10 ? <CellLink href={`/portal/admin/customers/?q=${encodeURIComponent(q)}`} className="text-[11.5px] font-medium">See all</CellLink> : undefined}
          >
            {customers.rows.length ? (
              <Table>
                <THead>
                  <Th>Customer</Th>
                  <Th className="hidden @xl:table-cell">Location</Th>
                  <Th align="right">Orders</Th>
                  <Th align="right">Spent</Th>
                </THead>
                <TBody>
                  {customers.rows.slice(0, 10).map((c) => (
                    <Tr key={c.shopify_id}>
                      <Td className="max-w-[14rem]">
                        <CellLink href={`/portal/admin/customers/${legacyId(c.shopify_id)}/`} className="block truncate">
                          {customerName(c)}
                        </CellLink>
                        <span className="flex items-center gap-1 truncate text-[11px] text-adm-muted">
                          {c.email}
                          {c.is_dealer && <Badge tone="gold">Dealer</Badge>}
                        </span>
                      </Td>
                      <Td muted className="hidden @xl:table-cell">
                        {[c.city, c.province].filter(Boolean).join(', ') || '—'}
                      </Td>
                      <Td align="right">{num(c.number_of_orders)}</Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money(c.amount_spent)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No customers match.</Empty>
            )}
          </Panel>
        </div>
      )}
    </>
  )
}
