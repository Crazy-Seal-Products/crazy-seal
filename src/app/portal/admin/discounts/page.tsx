import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getDiscounts } from '@/lib/portal/admin/catalog'
import { dateShort, humanize, money0, num } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
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
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Discounts' }

const BASE = '/portal/admin/discounts/'
const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'expired', label: 'Expired & scheduled' },
] as const

export default async function AdminDiscountsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const tab = TABS.some((t) => t.key === one(sp.tab)) ? (one(sp.tab) as (typeof TABS)[number]['key']) : 'active'
  const all = await getDiscounts()
  const match = (status: string, key: string) => (key === 'all' ? true : key === 'active' ? status === 'ACTIVE' : status !== 'ACTIVE')
  const rows = all.filter((d) => match(d.status, tab)).sort((a, b) => b.sales - a.sales || (b.usageCount ?? 0) - (a.usageCount ?? 0))

  const used = all.filter((d) => d.orders > 0)
  return (
    <>
      <PageHeader title="Discounts" description="Live from Shopify. Order counts and sales come from orders in the history here that used each code.">
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Active discounts" value={num(all.filter((d) => d.status === 'ACTIVE').length)} sub={`${num(all.length)} total`} tone="info" />
          <Stat label="Codes used in history" value={num(used.length)} />
          <Stat label="Orders with a code" value={num(used.reduce((n, d) => n + d.orders, 0))} />
          <Stat label="Sales from those orders" value={money0(used.reduce((n, d) => n + d.sales, 0))} />
        </StatGrid>
        <Toolbar>
          <Segmented options={TABS.map((t) => ({ ...t, count: all.filter((d) => match(d.status, t.key)).length }))} value={tab} param="tab" base={BASE} params={{}} />
        </Toolbar>
      </PageHeader>

      <Panel>
        {rows.length ? (
          <Table>
            <THead>
              <Th>Discount</Th>
              <Th className="hidden @2xl:table-cell">Type</Th>
              <Th>Status</Th>
              <Th className="hidden @3xl:table-cell">What it does</Th>
              <Th className="hidden @xl:table-cell">Runs</Th>
              <Th align="right">Uses</Th>
              <Th align="right">Orders</Th>
              <Th align="right">Sales</Th>
            </THead>
            <TBody>
              {rows.map((d) => (
                <Tr key={d.id}>
                  <Td className="max-w-[16rem]">
                    <span className="block truncate font-semibold text-adm-ink">{d.codes[0] ?? d.title}</span>
                    {d.codes[0] && d.codes[0] !== d.title && <span className="block truncate text-[11px] text-adm-muted">{d.title}</span>}
                    {d.kind === 'automatic' && <span className="block text-[11px] text-adm-muted">Automatic</span>}
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {d.type}
                  </Td>
                  <Td>
                    <Badge tone={d.status === 'ACTIVE' ? 'good' : d.status === 'SCHEDULED' ? 'info' : 'neutral'}>{humanize(d.status)}</Badge>
                  </Td>
                  <Td muted className="hidden max-w-[18rem] truncate @3xl:table-cell">
                    {d.summary ?? '—'}
                  </Td>
                  <Td muted className="hidden @xl:table-cell">
                    {dateShort(d.startsAt)} – {d.endsAt ? dateShort(d.endsAt) : 'no end'}
                  </Td>
                  <Td align="right">{d.usageCount == null ? '—' : num(d.usageCount)}</Td>
                  <Td align="right">{num(d.orders)}</Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(d.sales)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No discounts here.</Empty>
        )}
      </Panel>
    </>
  )
}
