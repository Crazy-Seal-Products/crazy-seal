import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getAbandonedCheckouts } from '@/lib/portal/admin/catalog'
import { dateShort, dateTime, money, money0, num } from '@/lib/portal/admin/format'
import { CellLink, Empty, PageHeader, Panel, Stat, StatGrid, Table, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Abandoned carts' }

export default async function AdminAbandonedPage() {
  await requirePortalAdmin()
  const { count, rows, last30 } = await getAbandonedCheckouts()
  const value = rows.reduce((n, r) => n + Number(r.totalPriceSet.shopMoney.amount), 0)
  const known = rows.filter((r) => r.customer?.defaultEmailAddress?.emailAddress)

  return (
    <>
      <PageHeader title="Abandoned carts" description="Checkouts started on buy.crazyseal.com that never became an order. Live from Shopify.">
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Abandoned checkouts" value={num(count)} sub="Shopify keeps recent ones" tone="info" />
          <Stat label="Value of listed carts" value={money0(value)} sub={`${rows.length} shown`} />
          <Stat label="Last 30 days" value={num(last30.length)} sub={money0(last30.reduce((n, r) => n + Number(r.totalPriceSet.shopMoney.amount), 0))} />
          <Stat label="With a known customer" value={num(known.length)} sub="can be followed up" tone="dealers" />
        </StatGrid>
      </PageHeader>

      <Panel>
        {rows.length ? (
          <Table>
            <THead>
              <Th>Started</Th>
              <Th>Customer</Th>
              <Th className="hidden @2xl:table-cell">Location</Th>
              <Th className="hidden @3xl:table-cell">Cart</Th>
              <Th align="right">Value</Th>
              <Th className="hidden @xl:table-cell">Recovery link</Th>
            </THead>
            <TBody>
              {rows.map((r) => {
                const email = r.customer?.defaultEmailAddress?.emailAddress
                return (
                  <Tr key={r.id}>
                    <Td muted title={dateTime(r.createdAt)}>
                      {dateShort(r.createdAt)}
                    </Td>
                    <Td className="max-w-[14rem]">
                      {r.customer ? (
                        <CellLink href={`/portal/admin/customers/${r.customer.legacyResourceId}/`} className="block truncate">
                          {r.customer.displayName ?? email}
                        </CellLink>
                      ) : (
                        <span className="text-adm-faint">Guest</span>
                      )}
                      {email && <span className="block truncate text-[11px] text-adm-muted">{email}</span>}
                    </Td>
                    <Td muted className="hidden @2xl:table-cell">
                      {[r.billingAddress?.city, r.billingAddress?.provinceCode].filter(Boolean).join(', ') || '—'}
                    </Td>
                    <Td muted className="hidden max-w-[22rem] truncate @3xl:table-cell">
                      {r.lineItems.nodes
                        .map((li) => `${li.quantity}× ${li.title}${li.variantTitle && li.variantTitle !== 'Default Title' ? ` (${li.variantTitle})` : ''}`)
                        .join(', ')}
                    </Td>
                    <Td align="right" className="font-semibold text-adm-ink">
                      {money(Number(r.totalPriceSet.shopMoney.amount))}
                    </Td>
                    <Td className="hidden @xl:table-cell">
                      {r.abandonedCheckoutUrl ? (
                        <a href={r.abandonedCheckoutUrl} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium text-adm-blue-bright hover:underline">
                          Open cart
                        </a>
                      ) : (
                        '—'
                      )}
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Empty>No abandoned checkouts.</Empty>
        )}
      </Panel>
    </>
  )
}
