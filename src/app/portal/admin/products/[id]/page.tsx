import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getProductDetail } from '@/lib/portal/admin/catalog'
import { dateLong, dateShort, money, money0, monthLabel, num, shopifyAdminUrl } from '@/lib/portal/admin/format'
import {
  BackLink,
  Badge,
  CellLink,
  Empty,
  ExternalButton,
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
import { ColumnChart } from '@/components/portal/admin/charts'
import { SERIES } from '@/components/portal/admin/series'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const detail = await getProductDetail((await params).id).catch(() => null)
  return { title: detail?.product.title ?? 'Product' }
}

export default async function AdminProductPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const { id } = await params
  const detail = await getProductDetail(id)
  if (!detail) notFound()
  const { product: p, variantStats, monthly, recent, totals } = detail
  const images = p.media.nodes.map((m) => m.preview?.image?.url).filter(Boolean) as string[]

  return (
    <>
      <BackLink href="/portal/admin/products/">Products</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {p.title}
            <Badge tone={p.status === 'ACTIVE' ? 'good' : 'neutral'}>{p.status === 'ACTIVE' ? 'Active' : p.status === 'DRAFT' ? 'Draft' : 'Archived'}</Badge>
          </span>
        }
        description={`${p.vendor}${p.productType ? ` · ${p.productType}` : ''} · created ${dateLong(p.createdAt)} · updated ${dateLong(p.updatedAt)}`}
        actions={
          <>
            {p.onlineStoreUrl && <ExternalButton href={p.onlineStoreUrl}>Store page</ExternalButton>}
            <ExternalButton href={shopifyAdminUrl('products', p.id)}>Open in Shopify</ExternalButton>
          </>
        }
      />

      <StatGrid className="xl:grid-cols-4">
        <Stat label="Sales" value={money0(totals.sales)} sub="in the order history here" />
        <Stat label="Units sold" value={num(totals.units)} />
        <Stat label="Orders" value={num(totals.orders)} />
        <Stat label="Price" value={money(Number(p.priceRangeV2.minVariantPrice.amount))} sub={p.variantsCount.count > 1 ? `from · ${p.variantsCount.count} variants` : undefined} tone="info" />
      </StatGrid>

      <div className="mt-2 grid gap-2 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Sales by month" tone="sales" bodyClassName="pt-2">
            {monthly.length ? (
              <ColumnChart
                data={monthly.map((m) => ({ key: m.key, label: monthLabel(m.key), value: Math.round(m.sales * 100) / 100, detail: `${m.units} units` }))}
                valueLabel="Product sales"
                color={SERIES.revenue}
                height={160}
              />
            ) : (
              <Empty>No sales in the order history yet.</Empty>
            )}
          </Panel>

          <Panel title="Variants" meta={`${p.variantsCount.count}`}>
            <Table>
              <THead>
                <Th>Variant</Th>
                <Th className="hidden @xl:table-cell">SKU</Th>
                <Th align="right">Price</Th>
                <Th align="right" className="hidden @2xl:table-cell">Inventory</Th>
                <Th align="right">Units sold</Th>
                <Th align="right">Sales</Th>
              </THead>
              <TBody>
                {p.variants.nodes.map((v) => {
                  const s = variantStats.get(v.id)
                  return (
                    <Tr key={v.id}>
                      <Td className="font-medium text-adm-ink">{v.title === 'Default Title' ? p.title : v.title}</Td>
                      <Td muted className="hidden @xl:table-cell">
                        {v.sku || '—'}
                      </Td>
                      <Td align="right">
                        {money(Number(v.price))}
                        {v.compareAtPrice && Number(v.compareAtPrice) > Number(v.price) && (
                          <span className="ml-1 text-[11px] text-adm-faint line-through">{money(Number(v.compareAtPrice))}</span>
                        )}
                      </Td>
                      <Td align="right" muted className="hidden @2xl:table-cell">
                        {p.tracksInventory ? num(v.inventoryQuantity) : '—'}
                      </Td>
                      <Td align="right">{num(s?.units ?? 0)}</Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money0(s?.sales ?? 0)}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          </Panel>

          <Panel title="Recent orders" meta={`latest ${recent.length}`}>
            {recent.length ? (
              <Table>
                <THead>
                  <Th>Order</Th>
                  <Th>Date</Th>
                  <Th>Customer</Th>
                  <Th className="hidden @2xl:table-cell">Variant</Th>
                  <Th align="right">Units</Th>
                  <Th align="right">Sales</Th>
                </THead>
                <TBody>
                  {recent.map((r, i) => (
                    <Tr key={`${r.name}-${i}`}>
                      <Td>
                        <CellLink href={`/portal/admin/orders/${r.legacyId}/`}>{r.name}</CellLink>
                      </Td>
                      <Td muted>{dateShort(r.created)}</Td>
                      <Td className="max-w-[12rem] truncate">{r.customer ?? '—'}</Td>
                      <Td muted className="hidden max-w-[14rem] truncate @2xl:table-cell">
                        {r.variant && r.variant !== 'Default Title' ? r.variant : '—'}
                      </Td>
                      <Td align="right">{num(r.units)}</Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {money(r.sales)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No orders yet.</Empty>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-2">
          {images.length > 0 && (
            <Panel title="Media" meta={`${images.length}`}>
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {images.map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={`${src}${src.includes('?') ? '&' : '?'}width=240`} alt="" className="aspect-square w-full rounded border border-adm-line bg-white object-contain" loading="lazy" />
                ))}
              </div>
            </Panel>
          )}
          <Panel title="Details" tone="info">
            <KV
              rows={[
                ['Handle', p.handle],
                ['Inventory', p.tracksInventory ? num(p.totalInventory) : 'Not tracked'],
                ['Tags', p.tags.length ? <span className="flex flex-wrap justify-end gap-1">{p.tags.map((t) => <Tag key={t}>{t}</Tag>)}</span> : '—'],
              ]}
            />
            {p.description && <p className="border-t border-adm-line px-3 py-2 text-[12.5px] leading-relaxed text-adm-text">{p.description}</p>}
          </Panel>
        </div>
      </div>
    </>
  )
}
