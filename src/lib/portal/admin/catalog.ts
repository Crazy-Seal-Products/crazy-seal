import { cache } from 'react'
import { shopifyAdminGraphql } from '@/lib/shopify/admin'
import { memo } from './cache'
import { allLineItems, allOrders, lineSales, lineUnits, orderSales } from './sales'
import { dayKey, monthKey } from './format'

/**
 * Live Shopify reads for the admin: products, discounts and abandoned
 * checkouts, joined with sales from the order copy. Cached for a few
 * minutes per server instance.
 */

// ─── Products ─────────────────────────────────────────────────────────────

export interface ShopifyVariant {
  id: string
  legacyResourceId: string
  title: string
  sku: string | null
  price: string
  compareAtPrice: string | null
  inventoryQuantity: number | null
}

export interface ShopifyProduct {
  id: string
  legacyResourceId: string
  title: string
  handle: string
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'UNLISTED'
  productType: string
  vendor: string
  tags: string[]
  totalInventory: number | null
  tracksInventory: boolean
  createdAt: string
  updatedAt: string
  onlineStoreUrl: string | null
  description: string
  featuredMedia: { preview?: { image?: { url: string; altText?: string | null } | null } | null } | null
  priceRangeV2: { minVariantPrice: { amount: string }; maxVariantPrice: { amount: string } }
  variantsCount: { count: number }
  variants: { nodes: ShopifyVariant[] }
}

const PRODUCT_FIELDS = `
  id legacyResourceId title handle status productType vendor tags totalInventory tracksInventory
  createdAt updatedAt onlineStoreUrl description
  featuredMedia { preview { image { url altText } } }
  priceRangeV2 { minVariantPrice { amount } maxVariantPrice { amount } }
  variantsCount { count }
  variants(first: 100) { nodes { id legacyResourceId title sku price compareAtPrice inventoryQuantity } }
`

export function getShopifyProducts(): Promise<ShopifyProduct[]> {
  return memo('shopify-products', 5 * 60_000, async () => {
    const products: ShopifyProduct[] = []
    let cursor: string | null = null
    for (let i = 0; i < 10; i++) {
      const data: { products: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: ShopifyProduct[] } } =
        await shopifyAdminGraphql(
          `query AdminProducts($cursor: String) { products(first: 100, after: $cursor, sortKey: TITLE) { pageInfo { hasNextPage endCursor } nodes { ${PRODUCT_FIELDS} } } }`,
          { cursor },
        )
      products.push(...data.products.nodes)
      if (!data.products.pageInfo.hasNextPage) break
      cursor = data.products.pageInfo.endCursor
    }
    return products
  })
}

export interface ProductStats {
  units: number
  sales: number
  orders: number
  units30: number
  sales30: number
  lastSoldAt: string | null
}

const emptyStats = (): ProductStats => ({ units: 0, sales: 0, orders: 0, units30: 0, sales30: 0, lastSoldAt: null })

async function productStatsMap() {
  const [orders, items] = await Promise.all([allOrders(), allLineItems()])
  const byId = new Map(orders.map((o) => [o.shopify_id, o]))
  const since30 = dayKey(new Date(Date.now() - 29 * 86_400_000))
  const stats = new Map<string, ProductStats & { orderIds: Set<string> }>()
  for (const li of items) {
    const o = byId.get(li.order_shopify_id)
    if (!o || o.cancelled_at || !li.product_shopify_id) continue
    const s = stats.get(li.product_shopify_id) ?? { ...emptyStats(), orderIds: new Set<string>() }
    const units = lineUnits(li)
    const sales = lineSales(li)
    s.units += units
    s.sales += sales
    s.orderIds.add(o.shopify_id)
    if (dayKey(o.shopify_created_at) >= since30) {
      s.units30 += units
      s.sales30 += sales
    }
    if (!s.lastSoldAt || o.shopify_created_at > s.lastSoldAt) s.lastSoldAt = o.shopify_created_at
    stats.set(li.product_shopify_id, s)
  }
  return new Map([...stats].map(([k, { orderIds, ...s }]) => [k, { ...s, orders: orderIds.size }]))
}

export async function getProductsWithStats() {
  const [products, stats] = await Promise.all([getShopifyProducts(), productStatsMap()])
  return products
    .map((p) => ({ ...p, stats: stats.get(p.id) ?? emptyStats() }))
    .sort((a, b) => b.stats.sales - a.stats.sales || a.title.localeCompare(b.title))
}

export const getProductDetail = cache(async (legacyId: string) => {
  if (!/^\d+$/.test(legacyId)) return null
  const gid = `gid://shopify/Product/${legacyId}`
  const data = await shopifyAdminGraphql<{ product: (ShopifyProduct & { media: { nodes: { preview?: { image?: { url: string } | null } | null }[] } }) | null }>(
    `query AdminProduct($id: ID!) { product(id: $id) { ${PRODUCT_FIELDS} media(first: 8) { nodes { preview { image { url } } } } } }`,
    { id: gid },
  )
  if (!data.product) return null

  const [orders, items] = await Promise.all([allOrders(), allLineItems()])
  const byId = new Map(orders.map((o) => [o.shopify_id, o]))
  const mine = items.filter((li) => li.product_shopify_id === gid)

  const variants = new Map<string, { units: number; sales: number }>()
  const months = new Map<string, { key: string; units: number; sales: number }>()
  const recent: { legacyId: string | null; name: string; created: string; customer: string | null; units: number; sales: number; variant: string | null }[] = []
  for (const li of mine) {
    const o = byId.get(li.order_shopify_id)
    if (!o || o.cancelled_at) continue
    const units = lineUnits(li)
    const sales = lineSales(li)
    const v = variants.get(li.variant_shopify_id ?? '') ?? { units: 0, sales: 0 }
    v.units += units
    v.sales += sales
    variants.set(li.variant_shopify_id ?? '', v)
    const k = monthKey(o.shopify_created_at)
    const m = months.get(k) ?? { key: k, units: 0, sales: 0 }
    m.units += units
    m.sales += sales
    months.set(k, m)
    recent.push({ legacyId: o.legacy_resource_id, name: o.name, created: o.shopify_created_at, customer: o.customer_display_name, units, sales, variant: li.variant_title })
  }
  recent.sort((a, b) => b.created.localeCompare(a.created))

  return {
    product: data.product,
    variantStats: variants,
    monthly: [...months.values()].sort((a, b) => a.key.localeCompare(b.key)),
    recent: recent.slice(0, 25),
    totals: {
      units: recent.reduce((n, r) => n + r.units, 0),
      sales: recent.reduce((n, r) => n + r.sales, 0),
      orders: new Set(recent.map((r) => r.name)).size,
    },
  }
})

// ─── Discounts ────────────────────────────────────────────────────────────

export interface DiscountRow {
  id: string
  kind: 'code' | 'automatic'
  type: string
  title: string
  status: string
  summary: string | null
  startsAt: string | null
  endsAt: string | null
  usageCount: number | null
  codes: string[]
  orders: number
  sales: number
}

const DISCOUNT_FIELDS = 'title status startsAt endsAt asyncUsageCount'
const CODE_FIELDS = `${DISCOUNT_FIELDS} summary codes(first: 5) { nodes { code } }`

export function getDiscounts(): Promise<DiscountRow[]> {
  return memo('shopify-discounts', 5 * 60_000, async () => {
    const nodes: { id: string; discount: Record<string, unknown> & { __typename: string } }[] = []
    let cursor: string | null = null
    for (let i = 0; i < 5; i++) {
      const data: { discountNodes: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: typeof nodes } } =
        await shopifyAdminGraphql(
          `query AdminDiscounts($cursor: String) { discountNodes(first: 100, after: $cursor, reverse: true) { pageInfo { hasNextPage endCursor } nodes { id discount {
            __typename
            ... on DiscountCodeBasic { ${CODE_FIELDS} }
            ... on DiscountCodeBxgy { ${CODE_FIELDS} }
            ... on DiscountCodeFreeShipping { ${CODE_FIELDS} }
            ... on DiscountCodeApp { ${DISCOUNT_FIELDS} codes(first: 5) { nodes { code } } }
            ... on DiscountAutomaticBasic { ${DISCOUNT_FIELDS} summary }
            ... on DiscountAutomaticBxgy { ${DISCOUNT_FIELDS} summary }
            ... on DiscountAutomaticFreeShipping { ${DISCOUNT_FIELDS} summary }
            ... on DiscountAutomaticApp { ${DISCOUNT_FIELDS} }
          } } } }`,
          { cursor },
        )
      nodes.push(...data.discountNodes.nodes)
      if (!data.discountNodes.pageInfo.hasNextPage) break
      cursor = data.discountNodes.pageInfo.endCursor
    }

    const orders = await allOrders()
    const usage = new Map<string, { orders: number; sales: number }>()
    for (const o of orders) {
      if (o.cancelled_at) continue
      for (const code of new Set(o.discount_codes.map((c) => c.toUpperCase()))) {
        const u = usage.get(code) ?? { orders: 0, sales: 0 }
        u.orders += 1
        u.sales += orderSales(o)
        usage.set(code, u)
      }
    }

    return nodes.map(({ id, discount: d }) => {
      const codes = ((d.codes as { nodes?: { code: string }[] } | undefined)?.nodes ?? []).map((c) => c.code)
      const used = codes.reduce(
        (acc, c) => {
          const u = usage.get(c.toUpperCase())
          return u ? { orders: acc.orders + u.orders, sales: acc.sales + u.sales } : acc
        },
        { orders: 0, sales: 0 },
      )
      const type = d.__typename.replace(/^Discount(Code|Automatic)/, '')
      return {
        id,
        kind: d.__typename.startsWith('DiscountAutomatic') ? 'automatic' : 'code',
        type: type === 'Bxgy' ? 'Buy X get Y' : type === 'FreeShipping' ? 'Free shipping' : type === 'App' ? 'App' : 'Amount off',
        title: (d.title as string) ?? 'Untitled discount',
        status: (d.status as string) ?? 'UNKNOWN',
        summary: (d.summary as string) ?? null,
        startsAt: (d.startsAt as string) ?? null,
        endsAt: (d.endsAt as string) ?? null,
        usageCount: typeof d.asyncUsageCount === 'number' ? d.asyncUsageCount : null,
        codes,
        ...used,
      } satisfies DiscountRow
    })
  })
}

// ─── Abandoned checkouts ──────────────────────────────────────────────────

export interface AbandonedCheckout {
  id: string
  name: string
  createdAt: string
  abandonedCheckoutUrl: string | null
  totalPriceSet: { shopMoney: { amount: string } }
  customer: { legacyResourceId: string; displayName: string | null; defaultEmailAddress: { emailAddress: string | null } | null } | null
  billingAddress: { provinceCode: string | null; city: string | null } | null
  lineItems: { nodes: { title: string; quantity: number; variantTitle: string | null }[] }
}

export function getAbandonedCheckouts(): Promise<{ count: number; rows: AbandonedCheckout[]; last30: AbandonedCheckout[] }> {
  return memo('shopify-abandoned', 3 * 60_000, async () => {
    const data = await shopifyAdminGraphql<{ abandonedCheckoutsCount: { count: number }; abandonedCheckouts: { nodes: AbandonedCheckout[] } }>(
      `{ abandonedCheckoutsCount { count } abandonedCheckouts(first: 100, reverse: true, sortKey: CREATED_AT) { nodes {
          id name createdAt abandonedCheckoutUrl
          totalPriceSet { shopMoney { amount } }
          customer { legacyResourceId displayName defaultEmailAddress { emailAddress } }
          billingAddress { provinceCode city }
          lineItems(first: 10) { nodes { title quantity variantTitle } }
        } } }`,
    )
    const since = new Date(Date.now() - 30 * 86_400_000).toISOString()
    const rows = data.abandonedCheckouts.nodes
    return { count: data.abandonedCheckoutsCount.count, rows, last30: rows.filter((r) => r.createdAt >= since) }
  })
}
