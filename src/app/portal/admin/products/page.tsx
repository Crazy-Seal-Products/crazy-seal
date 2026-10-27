import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getProductsWithStats } from '@/lib/portal/admin/catalog'
import { getCoverage } from '@/lib/portal/admin/sales'
import { dateLong, dateShort, money, money0, num } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
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
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Products' }

const BASE = '/portal/admin/products/'
const STATUS = [
  { key: 'active', label: 'Active' },
  { key: 'all', label: 'All' },
  { key: 'archived', label: 'Archived & draft' },
] as const

function price(p: { priceRangeV2: { minVariantPrice: { amount: string }; maxVariantPrice: { amount: string } } }) {
  const min = Number(p.priceRangeV2.minVariantPrice.amount)
  const max = Number(p.priceRangeV2.maxVariantPrice.amount)
  return min === max ? money(min) : `${money0(min)} – ${money0(max)}`
}

export default async function AdminProductsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const status = STATUS.some((s) => s.key === one(sp.status)) ? (one(sp.status) as (typeof STATUS)[number]['key']) : 'active'
  const [all, coverage] = await Promise.all([getProductsWithStats(), getCoverage()])
  const products = all.filter((p) => (status === 'all' ? true : status === 'active' ? p.status === 'ACTIVE' : p.status !== 'ACTIVE'))

  const sales30 = all.reduce((n, p) => n + p.stats.sales30, 0)
  const units30 = all.reduce((n, p) => n + p.stats.units30, 0)
  const salesAll = all.reduce((n, p) => n + p.stats.sales, 0)
  const top = [...all].sort((a, b) => b.stats.sales30 - a.stats.sales30)[0]

  return (
    <>
      <PageHeader title="Products" description={`Live catalog from Shopify · sales from orders since ${dateLong(coverage.first)}`}>
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Active products" value={num(all.filter((p) => p.status === 'ACTIVE').length)} sub={`${num(all.length)} in the catalog`} tone="info" />
          <Stat label="Product sales · 30 days" value={money0(sales30)} sub="line items, before order-level discounts" />
          <Stat label="Units sold · 30 days" value={num(units30)} />
          <Stat label="Top seller · 30 days" value={<span className="text-[15px]">{top?.stats.sales30 ? top.title : '—'}</span>} sub={top?.stats.sales30 ? money0(top.stats.sales30) : undefined} />
        </StatGrid>
        <Toolbar>
          <Segmented
            options={STATUS.map((s) => ({
              ...s,
              count: all.filter((p) => (s.key === 'all' ? true : s.key === 'active' ? p.status === 'ACTIVE' : p.status !== 'ACTIVE')).length,
            }))}
            value={status}
            param="status"
            base={BASE}
            params={{}}
          />
        </Toolbar>
      </PageHeader>

      <Panel title={`${products.length} products`} meta={`${money0(salesAll)} product sales in the order history`}>
        {products.length ? (
          <Table>
            <THead>
              <Th>Product</Th>
              <Th className="hidden @2xl:table-cell">Status</Th>
              <Th align="right" className="hidden @xl:table-cell">Price</Th>
              <Th align="right" className="hidden @5xl:table-cell">Variants</Th>
              <Th align="right" className="hidden @6xl:table-cell">Inventory</Th>
              <Th align="right">Units 30d</Th>
              <Th align="right">Sales 30d</Th>
              <Th align="right" className="hidden @2xl:table-cell">Units all</Th>
              <Th align="right" className="hidden @2xl:table-cell">Sales all</Th>
              <Th className="hidden @3xl:table-cell">Last sold</Th>
            </THead>
            <TBody>
              {products.map((p) => {
                const img = p.featuredMedia?.preview?.image?.url
                return (
                  <Tr key={p.id}>
                    <Td className="max-w-[20rem]">
                      <span className="flex items-center gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded border border-adm-line bg-white">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={`${img}${img.includes('?') ? '&' : '?'}width=80`} alt="" className="h-full w-full object-contain" loading="lazy" />
                          ) : null}
                        </span>
                        <CellLink href={`${BASE}${p.legacyResourceId}/`} className="truncate">
                          {p.title}
                        </CellLink>
                      </span>
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <Badge tone={p.status === 'ACTIVE' ? 'good' : 'neutral'}>{p.status === 'ACTIVE' ? 'Active' : p.status === 'DRAFT' ? 'Draft' : 'Archived'}</Badge>
                    </Td>
                    <Td align="right" className="hidden @xl:table-cell">
                      {price(p)}
                    </Td>
                    <Td align="right" muted className="hidden @5xl:table-cell">
                      {p.variantsCount.count}
                    </Td>
                    <Td align="right" muted className="hidden @6xl:table-cell">
                      {p.tracksInventory ? num(p.totalInventory) : 'Not tracked'}
                    </Td>
                    <Td align="right">{num(p.stats.units30)}</Td>
                    <Td align="right" className="font-semibold text-adm-ink">
                      {money0(p.stats.sales30)}
                    </Td>
                    <Td align="right" muted className="hidden @2xl:table-cell">
                      {num(p.stats.units)}
                    </Td>
                    <Td align="right" className="hidden @2xl:table-cell">
                      {money0(p.stats.sales)}
                    </Td>
                    <Td muted className="hidden @3xl:table-cell">
                      {dateShort(p.stats.lastSoldAt)}
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Empty>No products here.</Empty>
        )}
      </Panel>
    </>
  )
}
