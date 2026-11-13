import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, CircleCheck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { linkContractorCustomer, resendQuote, unlinkContractorCustomer } from '@/lib/portal/admin/contractor-actions'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getContractorDetail } from '@/lib/portal/admin/dealers'
import { customerName, getCoverage, orderSales } from '@/lib/portal/admin/sales'
import { ago, dateShort, legacyId, money0, num } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { listContractorLeads } from '@/lib/contractors/data'
import { placeLabel, SEGMENT_LABEL, type ContractorSource } from '@/lib/contractors/types'
import { ContractorEditor } from '@/components/portal/admin/ContractorEditor'
import { ActionButton } from '@/components/portal/admin/controls'
import { ContractorLinkForm } from '@/components/portal/admin/ContractorLinkForm'
import { PORTAL_BADGE } from '@/components/portal/admin/portal-state'
import { BUTTON } from '@/components/portal/admin/styles'
import { ViewAsButton } from '@/components/portal/admin/ViewAsButton'
import { BackLink, Badge, CellLink, Empty, PageHeader, Panel, Stat, StatGrid, Table, Tag, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Contractor' }

const ORIGIN: Record<ContractorSource, string> = {
  list: 'On the dealer list',
  admin: 'Added by hand',
  shopify: 'From the Shopify dealer roster',
}

/** Orders shown on the page; the totals above count them all. */
const ORDER_ROWS = 25

export default async function AdminContractorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requirePortalAdmin('contractors')
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()
  const [detail, leads, coverage, sp] = await Promise.all([getContractorDetail(id), listContractorLeads(id), getCoverage(), searchParams])
  if (!detail) notFound()
  const { contractor: c, customers, orders, recentDays } = detail
  const since = coverage.first ? dateShort(coverage.first) : 'the start of the history'
  const placed = orders.filter((o) => !o.cancelled_at)
  const nameOf = new Map(customers.map((x) => [x.shopify_id, customerName(x)]))

  return (
    <>
      <BackLink href="/portal/admin/dealers/contractors/">Contractors</BackLink>
      <PageHeader
        title={c.name}
        description={[SEGMENT_LABEL[c.segment], placeLabel(c), c.contact, ORIGIN[c.origin]].filter(Boolean).join(' · ')}
        actions={
          <>
            {(c.proUserId || c.primaryCustomerEmail) && <ViewAsButton proUserId={c.proUserId} customerId={c.primaryCustomerId} name={c.name} className="h-8" />}
            {c.isListed && (
              <a href={`/contractor/${c.slug}/`} target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
                Open their page <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </a>
            )}
          </>
        }
      >
        <StatGrid>
          <Stat hero label="Lifetime spend" value={money0(c.lifetime)} sub={`${num(c.lifetimeOrders)} orders since 2019, from Shopify`} />
          <Stat label={`Since ${since}`} value={money0(c.historySales)} sub={`${num(c.historyOrders)} orders in the history`} tone="dealers" />
          <Stat label={`Last ${recentDays} days`} value={money0(c.recentSales)} sub={`${num(c.recentOrders)} orders`} tone="dealers" />
          <Stat label="Orders tagged Dealer" value={money0(c.dealerSales)} sub={c.reps.length ? `${num(c.dealerOrders)} · ${c.reps.join(', ')}` : `${num(c.dealerOrders)} orders`} />
          <Stat label="Last order" value={c.lastOrderAt ? dateShort(c.lastOrderAt) : '—'} sub={c.lastOrderAt ? ago(c.lastOrderAt) : 'none on record'} tone="info" />
          <Stat
            label="Pro Hub"
            value={PORTAL_BADGE[c.portal].label}
            sub={c.lastLoginAt ? `Last sign-in ${dateShort(c.lastLoginAt)}` : c.proUserId ? 'Invited, never signed in' : 'View as shows the base view'}
            tone="info"
          />
        </StatGrid>
      </PageHeader>
      {one(sp.added) && (
        <p className="mb-2 flex items-center gap-2 rounded-md border border-adm-line bg-adm-blue-bright/10 px-3 py-2 text-[12.5px] text-adm-ink">
          <CircleCheck className="h-4 w-4 text-adm-blue-bright" />
          {c.isListed ? `Added. Their page is live at /contractor/${c.slug}.` : 'Added. Their page stays hidden until you tick Listed publicly.'}
        </p>
      )}

      <Panel title="Shopify customers" meta={customers.length ? `${customers.length} linked · their orders are this contractor’s spending` : 'none linked'} tone="dealers" className="mb-2">
        {customers.length ? (
          <Table>
            <THead>
              <Th>Customer</Th>
              <Th className="hidden @2xl:table-cell">Location</Th>
              <Th align="right" className="hidden @lg:table-cell">
                Orders
              </Th>
              <Th align="right">Lifetime</Th>
              <Th className="hidden @3xl:table-cell">Last order</Th>
              <Th align="right"> </Th>
            </THead>
            <TBody>
              {customers.map((x) => (
                <Tr key={x.shopify_id}>
                  <Td className="max-w-[16rem]">
                    <CellLink href={`/portal/admin/customers/${x.legacy_resource_id ?? legacyId(x.shopify_id)}/`} className="block truncate">
                      {customerName(x)}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">{[x.company, x.email].filter(Boolean).join(' · ') || '—'}</span>
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {[x.city, x.province].filter(Boolean).join(', ') || '—'}
                  </Td>
                  <Td align="right" muted className="hidden @lg:table-cell">
                    {num(x.number_of_orders)}
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(x.amount_spent ?? 0)}
                  </Td>
                  <Td muted className="hidden @3xl:table-cell">
                    {x.last_order_at ? `${dateShort(x.last_order_at)} · ${ago(x.last_order_at)}` : '—'}
                  </Td>
                  <Td align="right">
                    <ActionButton
                      action={unlinkContractorCustomer.bind(null, c.id, x.shopify_id)}
                      confirm={`Unlink ${customerName(x)} from ${c.name}? Their orders stop counting as this contractor’s, and the Shopify sync won’t link them here again.`}
                      className="h-7 px-2 text-[11.5px]"
                    >
                      Unlink
                    </ActionButton>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No Shopify customer is linked, so there’s no spending to show. Link one by the email on their Shopify record.</Empty>
        )}
        <ContractorLinkForm action={linkContractorCustomer.bind(null, c.id)} />
      </Panel>

      <Panel title="Orders" meta={`since ${since} · ${num(placed.length)} placed`} tone="dealers" className="mb-2">
        {placed.length ? (
          <Table>
            <THead>
              <Th>Order</Th>
              <Th className="hidden @xl:table-cell">Date</Th>
              {customers.length > 1 && <Th className="hidden @2xl:table-cell">Customer</Th>}
              <Th className="hidden @lg:table-cell">Tags</Th>
              <Th align="right">Total</Th>
            </THead>
            <TBody>
              {placed.slice(0, ORDER_ROWS).map((o) => (
                <Tr key={o.shopify_id}>
                  <Td>
                    <CellLink href={`/portal/admin/orders/${o.legacy_resource_id ?? legacyId(o.shopify_id)}/`}>{o.name}</CellLink>
                    <span className="ml-1.5 text-[11px] text-adm-faint @xl:hidden">{dateShort(o.shopify_created_at)}</span>
                  </Td>
                  <Td muted className="hidden @xl:table-cell" title={o.shopify_created_at}>
                    {dateShort(o.shopify_created_at)}
                  </Td>
                  {customers.length > 1 && (
                    <Td muted className="hidden max-w-[12rem] truncate @2xl:table-cell">
                      {(o.customer_shopify_id && nameOf.get(o.customer_shopify_id)) || '—'}
                    </Td>
                  )}
                  <Td className="hidden @lg:table-cell">
                    <span className="flex flex-wrap gap-1">
                      {o.tags.length ? o.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>) : <span className="text-adm-faint">—</span>}
                    </span>
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(orderSales(o))}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>{customers.length ? `No orders since ${since}.` : 'Link a Shopify customer to see their orders.'}</Empty>
        )}
        {placed.length > ORDER_ROWS && (
          <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] text-adm-muted">
            Showing the newest {ORDER_ROWS} of {num(placed.length)}. Each customer’s page has the rest.
          </p>
        )}
      </Panel>

      <ContractorEditor key={c.updatedAt} contractor={c} />

      <Panel title="Quote requests" meta="from the form on their page" tone="dealers" className="mt-2">
        {leads.length ? (
          <Table>
            <THead>
              <Th>Customer</Th>
              <Th className="hidden @lg:table-cell">ZIP</Th>
              <Th className="hidden @2xl:table-cell">{c.segment === 'commercial' ? 'Roof sq ft' : 'RV length'}</Th>
              <Th>Sent to them</Th>
              <Th>Received</Th>
            </THead>
            <TBody>
              {leads.map((l) => (
                <Tr key={l.id}>
                  <Td className="max-w-[16rem]">
                    <CellLink href={`/portal/admin/leads/${l.id}/`} className="block truncate">
                      {l.name}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">{[l.email, l.phone].filter(Boolean).join(' · ')}</span>
                  </Td>
                  <Td muted className="hidden @lg:table-cell">
                    {l.location || '—'}
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {(c.segment === 'commercial' ? l.square_footage : l.rv_length) || '—'}
                  </Td>
                  <Td>
                    {l.contractor_notified_at ? (
                      <Badge tone="good">Emailed</Badge>
                    ) : l.quote_team_notified_at ? (
                      <Badge tone="warn" dot={false}>
                        Team told to pass it on
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Badge tone="bad" dot={false}>
                          Not sent
                        </Badge>
                        <form action={resendQuote.bind(null, l.id)}>
                          <button type="submit" className={twMerge(BUTTON.default, 'h-6 px-2 text-[11px]')} title="Email it to the contractor and Crazy Seal again">
                            Send again
                          </button>
                        </form>
                      </span>
                    )}
                  </Td>
                  <Td muted title={l.created_at}>
                    {`${dateShort(l.created_at)} · ${ago(l.created_at)}`}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No quote requests yet.</Empty>
        )}
      </Panel>
    </>
  )
}
