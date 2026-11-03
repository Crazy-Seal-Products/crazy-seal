import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Truck } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import {
  getOrderDetail,
  type OrderDiscountApplication,
  type OrderFulfillment,
  type OrderRefund,
  type OrderShippingLine,
  type OrderTransaction,
} from '@/lib/portal/admin/details'
import { channelLabel } from '@/lib/portal/admin/sales'
import { ago, dateTime, humanize, legacyId, money, num, shopifyAdminUrl } from '@/lib/portal/admin/format'
import type { MailingAddress } from '@/lib/shopify/commerce-map'
import {
  BackLink,
  Badge,
  CellLink,
  Empty,
  ExternalButton,
  FinancialBadge,
  FulfillmentBadge,
  KV,
  PageHeader,
  Panel,
  Table,
  Tag,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const detail = await getOrderDetail(id).catch(() => null)
  return { title: detail ? `Order ${detail.row.name}` : 'Order' }
}

function amount(bag?: { shopMoney?: { amount?: string | null } | null } | null) {
  const v = bag?.shopMoney?.amount
  return v == null ? null : Number(v)
}

function Address({ a }: { a: MailingAddress | null }) {
  if (!a) return <Empty>None on file.</Empty>
  return (
    <address className="px-3 py-2 text-[12.5px] not-italic leading-relaxed text-adm-text">
      <span className="font-semibold text-adm-ink">{a.name || [a.firstName, a.lastName].filter(Boolean).join(' ')}</span>
      {a.company && <span className="block text-adm-soft">{a.company}</span>}
      <span className="block">{[a.address1, a.address2].filter(Boolean).join(', ')}</span>
      <span className="block">{[a.city, a.provinceCode || a.province, a.zip].filter(Boolean).join(', ')}</span>
      {a.country && <span className="block text-adm-muted">{a.country}</span>}
      {a.phone && <span className="block text-adm-soft">{a.phone}</span>}
    </address>
  )
}

export default async function AdminOrderPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const { id } = await params
  const detail = await getOrderDetail(id)
  if (!detail) notFound()
  const { row: o, items, customer } = detail
  const p = o.payload

  const fulfillments = (p.fulfillments ?? []) as OrderFulfillment[]
  const transactions = (p.transactions ?? []) as OrderTransaction[]
  const refunds = (p.refunds ?? []) as OrderRefund[]
  const shippingLines = (p.shippingLines?.nodes ?? []) as OrderShippingLine[]
  const discounts = (p.discountApplications?.nodes ?? []) as OrderDiscountApplication[]
  const attributes = (p.customAttributes ?? []).filter((a) => a.key && a.value)
  const net = o.cancelled_at ? 0 : o.current_total_price ?? o.total_price

  return (
    <>
      <BackLink href="/portal/admin/orders/">Orders</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {o.name}
            <FinancialBadge status={o.financial_status} />
            <FulfillmentBadge status={o.fulfillment_status} cancelled={Boolean(o.cancelled_at)} />
          </span>
        }
        description={`${dateTime(o.shopify_created_at)} · ${channelLabel(o.source_name)}${o.po_number ? ` · PO ${o.po_number}` : ''}`}
        actions={<ExternalButton href={shopifyAdminUrl('orders', o.shopify_id)}>Open in Shopify</ExternalButton>}
      />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Items" meta={`${num(items.reduce((n, i) => n + Number(i.current_quantity ?? i.quantity ?? 0), 0))} units`} tone="sales">
            <Table>
              <THead>
                <Th>Product</Th>
                <Th className="hidden @xl:table-cell">SKU</Th>
                <Th align="right">Qty</Th>
                <Th align="right">Unit</Th>
                <Th align="right">Total</Th>
              </THead>
              <TBody>
                {items.map((li) => {
                  const refunded = Number(li.quantity ?? 0) - Number(li.current_quantity ?? li.quantity ?? 0)
                  return (
                    <Tr key={li.shopify_id}>
                      <Td className="max-w-[22rem] whitespace-normal">
                        {li.product_shopify_id ? (
                          <CellLink href={`/portal/admin/products/${legacyId(li.product_shopify_id)}/`}>{li.title}</CellLink>
                        ) : (
                          <span className="font-semibold text-adm-ink">{li.title}</span>
                        )}
                        {li.variant_title && li.variant_title !== 'Default Title' && (
                          <span className="block text-[11.5px] text-adm-muted">{li.variant_title}</span>
                        )}
                      </Td>
                      <Td muted className="hidden @xl:table-cell">
                        {li.sku ?? '—'}
                      </Td>
                      <Td align="right">
                        {num(li.quantity)}
                        {refunded > 0 && <span className="block text-[10.5px] text-adm-red">−{refunded} refunded</span>}
                        {Number(li.unfulfilled_quantity ?? 0) > 0 && (
                          <span className="block text-[10.5px] text-adm-warn">{li.unfulfilled_quantity} to ship</span>
                        )}
                      </Td>
                      <Td align="right" muted>
                        {money(li.discounted_unit_price ?? li.original_unit_price)}
                        {li.original_unit_price != null && li.discounted_unit_price != null && li.discounted_unit_price < li.original_unit_price && (
                          <span className="block text-[10.5px] line-through">{money(li.original_unit_price)}</span>
                        )}
                      </Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money(li.discounted_total)}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
            <KV
              className="border-t border-adm-line"
              rows={[
                ['Subtotal', money(o.subtotal_price)],
                ...(Number(o.total_discounts ?? 0) > 0
                  ? ([[`Discounts${o.discount_codes.length ? ` (${o.discount_codes.join(', ')})` : ''}`, `−${money(o.total_discounts)}`]] as [string, string][])
                  : []),
                [`Shipping${shippingLines[0]?.title ? ` · ${shippingLines[0].title}` : ''}`, money(o.total_shipping)],
                ['Tax', money(o.total_tax)],
                [<span key="t" className="font-semibold text-adm-ink">Order total</span>, <span key="v" className="font-semibold text-adm-ink">{money(o.total_price)}</span>],
                ...(Number(o.total_refunded ?? 0) > 0 ? ([['Refunded', `−${money(o.total_refunded)}`]] as [string, string][]) : []),
                [<span key="n" className="font-semibold text-adm-gold-text">Net sales</span>, <span key="nv" className="font-semibold text-adm-gold-text">{money(net)}</span>],
                ...(Number(o.total_outstanding ?? 0) > 0 ? ([['Balance due', money(o.total_outstanding)]] as [string, string][]) : []),
              ]}
            />
          </Panel>

          <Panel title="Fulfillment" meta={`${fulfillments.length} shipment${fulfillments.length === 1 ? '' : 's'}`}>
            {fulfillments.length ? (
              <ul className="divide-y divide-adm-line-soft">
                {fulfillments.map((f) => (
                  <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[12.5px]">
                    <Truck className="h-4 w-4 text-adm-blue-bright" />
                    <Badge tone={f.status === 'SUCCESS' ? 'info' : 'neutral'}>{humanize(f.displayStatus ?? f.status)}</Badge>
                    <span className="text-adm-muted">{dateTime(f.createdAt)}</span>
                    {f.deliveredAt && <span className="text-adm-muted">Delivered {dateTime(f.deliveredAt)}</span>}
                    {(f.trackingInfo ?? []).map((t, i) =>
                      t.url ? (
                        <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="font-medium text-adm-blue-bright hover:underline">
                          {t.company ?? 'Tracking'} {t.number}
                        </a>
                      ) : (
                        <span key={i} className="text-adm-text">
                          {t.company} {t.number}
                        </span>
                      ),
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>Not shipped yet.</Empty>
            )}
          </Panel>

          <Panel title="Payments" meta={(o.payment_gateway_names ?? []).map(humanize).join(', ') || undefined}>
            {transactions.length ? (
              <Table>
                <THead>
                  <Th>When</Th>
                  <Th>Kind</Th>
                  <Th>Gateway</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount</Th>
                </THead>
                <TBody>
                  {transactions.map((t) => (
                    <Tr key={t.id}>
                      <Td muted>{dateTime(t.processedAt)}</Td>
                      <Td>{humanize(t.kind)}</Td>
                      <Td muted>{t.formattedGateway ?? humanize(t.gateway)}</Td>
                      <Td>
                        <Badge tone={t.status === 'SUCCESS' ? 'good' : t.status === 'FAILURE' || t.status === 'ERROR' ? 'bad' : 'warn'}>
                          {humanize(t.status)}
                        </Badge>
                      </Td>
                      <Td align="right" className={t.kind === 'REFUND' ? 'text-adm-red' : 'text-adm-ink'}>
                        {t.kind === 'REFUND' ? '−' : ''}
                        {money(amount(t.amountSet))}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No payment transactions recorded (manual or draft payment).</Empty>
            )}
            {refunds.length > 0 && (
              <KV
                className="border-t border-adm-line"
                rows={refunds.map((r) => [`Refund · ${dateTime(r.createdAt)}${r.note ? ` · ${r.note}` : ''}`, `−${money(amount(r.totalRefundedSet))}`])}
              />
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Customer" tone="info">
            {customer ? (
              <KV
                rows={[
                  [
                    'Name',
                    <CellLink key="c" href={`/portal/admin/customers/${customer.legacy_resource_id}/`}>
                      {customer.display_name ?? customer.email}
                    </CellLink>,
                  ],
                  ['Email', o.email ?? customer.email ?? '—'],
                  ['Phone', o.phone ?? o.shipping_address?.phone ?? '—'],
                  ['Orders', num(customer.number_of_orders)],
                  ['Lifetime spend', money(customer.amount_spent)],
                  ...(customer.tags.length
                    ? ([['Tags', <span key="t" className="flex flex-wrap justify-end gap-1">{customer.tags.map((t) => <Tag key={t}>{t}</Tag>)}</span>]] as [string, ReactNode][])
                    : []),
                ]}
              />
            ) : (
              <KV rows={[['Email', o.email ?? '—'], ['Phone', o.phone ?? '—']]} />
            )}
          </Panel>
          <Panel title="Ship to">
            <Address a={o.shipping_address} />
          </Panel>
          <Panel title="Bill to">
            <Address a={o.billing_address} />
          </Panel>
          <Panel title="Details">
            <KV
              rows={[
                ['Channel', channelLabel(o.source_name)],
                ['Discounts', discounts.length ? discounts.map((d) => d.code ?? d.title).filter(Boolean).join(', ') : '—'],
                ['Tags', o.tags.length ? <span className="flex flex-wrap justify-end gap-1">{o.tags.map((t) => <Tag key={t}>{t}</Tag>)}</span> : '—'],
                ['Return status', humanize(o.return_status)],
                ...(o.cancelled_at ? ([['Cancelled', `${dateTime(o.cancelled_at)} · ${humanize(o.cancel_reason)}`]] as [string, string][]) : []),
                ...(o.closed_at ? ([['Closed', dateTime(o.closed_at)]] as [string, string][]) : []),
                ...attributes.map((a) => [a.key!, a.value!] as [string, string]),
                ['Synced', ago(o.synced_at)],
              ]}
            />
            {o.note && <p className="border-t border-adm-line px-3 py-2 text-[12.5px] text-adm-text">{o.note}</p>}
          </Panel>
        </div>
      </div>
    </>
  )
}
