import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getCustomerDetail } from '@/lib/portal/admin/details'
import { channelLabel, customerName } from '@/lib/portal/admin/sales'
import { ago, dateLong, dateShort, humanize, money, money0, num, shopifyAdminUrl } from '@/lib/portal/admin/format'
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
  Stat,
  StatGrid,
  Table,
  Tag,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'
import { BarList } from '@/components/portal/admin/BarList'
import { SERIES } from '@/components/portal/admin/series'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const detail = await getCustomerDetail((await params).id).catch(() => null)
  return { title: detail ? customerName(detail.row) : 'Customer' }
}

function addressText(a: MailingAddress) {
  return [a.company, [a.address1, a.address2].filter(Boolean).join(', '), [a.city, a.provinceCode || a.province, a.zip].filter(Boolean).join(', ')]
    .filter(Boolean)
    .join(' · ')
}

export default async function AdminCustomerPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const { id } = await params
  const detail = await getCustomerDetail(id)
  if (!detail) notFound()
  const { row: c, orders, products, proUser, leads, warranties } = detail
  const mirrored = orders.reduce((n, o) => n + o.sales, 0)
  const spent = c.amount_spent ?? 0
  const first = orders.at(-1)?.created
  const last = orders[0]?.created ?? c.payload.lastOrder?.createdAt ?? null

  return (
    <>
      <BackLink href="/portal/admin/customers/">Customers</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {customerName(c)}
            {c.is_dealer && <Badge tone="gold">Dealer</Badge>}
            {c.is_commercial && <Badge tone="info">Commercial</Badge>}
            {c.state === 'ENABLED' && <Badge tone="neutral">Has store account</Badge>}
          </span>
        }
        description={[c.default_address?.company, [c.default_address?.city, c.default_address?.provinceCode].filter(Boolean).join(', '), `customer since ${dateLong(c.shopify_created_at)}`]
          .filter(Boolean)
          .join(' · ')}
        actions={<ExternalButton href={shopifyAdminUrl('customers', c.shopify_id)}>Open in Shopify</ExternalButton>}
      />

      <StatGrid className="xl:grid-cols-4">
        <Stat label="Lifetime spend" value={money0(spent)} sub="all-time, per Shopify" />
        <Stat label="Orders" value={num(c.number_of_orders)} sub={`${orders.length} in the order history here`} />
        <Stat label="Average order" value={money0(c.number_of_orders ? spent / c.number_of_orders : 0)} />
        <Stat label="Last order" value={last ? dateShort(last) : '—'} sub={last ? ago(last) : 'no orders yet'} tone="info" />
      </StatGrid>

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel
            title="Orders"
            meta={orders.length ? `${money0(mirrored)} across ${orders.length} · ${dateShort(first)} – ${dateShort(orders[0]?.created)}` : undefined}
            tone="sales"
          >
            {orders.length ? (
              <Table>
                <THead>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th className="hidden @2xl:table-cell">Items</Th>
                  <Th className="hidden @3xl:table-cell">Channel</Th>
                  <Th>Payment</Th>
                  <Th>Fulfillment</Th>
                  <Th align="right">Total</Th>
                </THead>
                <TBody>
                  {orders.map((o) => (
                    <Tr key={o.shopify_id}>
                      <Td>
                        <CellLink href={`/portal/admin/orders/${o.legacy_resource_id}/`}>{o.name}</CellLink>
                      </Td>
                      <Td muted>{dateShort(o.created)}</Td>
                      <Td muted className="hidden max-w-[16rem] truncate @2xl:table-cell">
                        {o.items}
                      </Td>
                      <Td muted className="hidden @3xl:table-cell">
                        {channelLabel(o.source_name).replace(' (phone & specialists)', '')}
                      </Td>
                      <Td>
                        <FinancialBadge status={o.financial_status} />
                      </Td>
                      <Td>
                        <FulfillmentBadge status={o.fulfillment_status} />
                      </Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money(o.sales)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>
                {c.number_of_orders
                  ? `${c.number_of_orders} order${c.number_of_orders === 1 ? '' : 's'} in Shopify, all older than the order history kept here.`
                  : 'No orders yet.'}
              </Empty>
            )}
          </Panel>

          <Panel title="Products bought" meta="from orders in the history here">
            <BarList
              rows={products.map((p) => ({ key: p.title, label: p.title, value: p.sales, meta: `${num(p.units)} units` }))}
              color={SERIES.volume}
              empty="No product history yet."
            />
          </Panel>

          {(leads.length > 0 || warranties.length > 0) && (
            <Panel title="Site activity" meta="forms on crazyseal.com with this email">
              <ul className="divide-y divide-adm-line-soft text-[12.5px]">
                {leads.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                    <Badge tone={l.lead_type === 'business' ? 'gold' : 'info'}>{l.lead_type === 'business' ? 'Dealer application' : 'Quote request'}</Badge>
                    <CellLink href={`/portal/admin/leads/${l.id}/`}>{l.business_name ?? l.project_type ?? 'View lead'}</CellLink>
                    <span className="min-w-0 flex-1 truncate text-adm-muted">{l.message}</span>
                    <span className="text-[11px] text-adm-muted">{dateShort(l.created_at)}</span>
                  </li>
                ))}
                {warranties.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center gap-2 px-3 py-1.5">
                    <Badge tone="good">Warranty</Badge>
                    <CellLink href={`/portal/admin/warranties/${w.id}/`}>{w.install_type === 'contractor' ? 'Installed by a pro' : w.install_type === 'diy' ? 'DIY install' : 'Registration'}</CellLink>
                    <span className="flex-1 text-adm-muted">{humanize(w.status)}</span>
                    <span className="text-[11px] text-adm-muted">{dateShort(w.created_at)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Contact" tone="info">
            <KV
              rows={[
                ['Email', c.email ? <a key="e" href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> : '—'],
                ['Phone', c.phone ? <a key="p" href={`tel:${c.phone}`} className="hover:underline">{c.phone}</a> : '—'],
                ['Email marketing', humanize(c.email_marketing_state)],
                ['SMS marketing', humanize(c.sms_marketing_state)],
                ['Tax exempt', c.tax_exempt ? 'Yes' : 'No'],
              ]}
            />
          </Panel>
          <Panel title="Addresses" meta={`${c.addresses.length || (c.default_address ? 1 : 0)} on file`}>
            {c.addresses.length || c.default_address ? (
              <ul className="divide-y divide-adm-line-soft text-[12.5px]">
                {(c.addresses.length ? c.addresses : [c.default_address!]).map((a, i) => (
                  <li key={i} className="px-3 py-1.5 text-adm-text">
                    {i === 0 && <span className="mr-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-adm-faint">Default</span>}
                    {addressText(a)}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty>No address on file.</Empty>
            )}
          </Panel>
          <Panel title="Pro Hub" tone="dealers">
            {proUser ? (
              <KV
                rows={[
                  ['Account', proUser.email],
                  ['Last sign-in', proUser.last_login_at ? `${dateShort(proUser.last_login_at)} · ${ago(proUser.last_login_at)}` : 'Never signed in'],
                  ['Joined', dateLong(proUser.created_at)],
                  ['Password set', proUser.password_hash ? 'Yes' : 'No (email link only)'],
                ]}
              />
            ) : (
              <Empty>No Pro Hub account.</Empty>
            )}
          </Panel>
          <Panel title="Tags & notes">
            <div className="flex flex-wrap gap-1 px-3 py-2">{c.tags.length ? c.tags.map((t) => <Tag key={t}>{t}</Tag>) : <span className="text-[12.5px] text-adm-faint">No tags</span>}</div>
            {c.note && <p className="border-t border-adm-line px-3 py-2 text-[12.5px] text-adm-text">{c.note}</p>}
            <p className="border-t border-adm-line px-3 py-1.5 text-[11px] text-adm-faint">Synced {ago(c.synced_at)}</p>
          </Panel>
        </div>
      </div>
    </>
  )
}

