import { unstable_cache } from 'next/cache'
import { getShopifyProducts, type ShopifyProduct } from '@/lib/shopify/catalog'
import {
  PRODUCT_CURATION,
  HIDDEN_HANDLES,
  STORE_CATEGORIES,
  type StoreCategory,
} from './config'

export interface StoreProduct extends ShopifyProduct {
  category: StoreCategory
  displayTitle: string
  blurb: string
  order: number
  priceMin: number
  priceMax: number
}

function truncate(text: string, max = 140): string {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…'
}

function toStoreProduct(p: ShopifyProduct): StoreProduct {
  const curation = PRODUCT_CURATION.find((c) => c.handle === p.handle)
  const prices = p.variants.map((v) => parseFloat(v.price)).filter((n) => !Number.isNaN(n))
  return {
    ...p,
    category: curation?.category ?? 'extras',
    displayTitle: curation?.title ?? p.title,
    blurb: curation?.blurb ?? truncate(p.description),
    order: curation?.order ?? 999,
    priceMin: prices.length ? Math.min(...prices) : 0,
    priceMax: prices.length ? Math.max(...prices) : 0,
  }
}

const getCachedCatalog = unstable_cache(
  async () => getShopifyProducts(),
  ['shopify-catalog'],
  { revalidate: 300 }
)

/** All visible store products, curated and sorted by category order. */
export async function getStoreProducts(): Promise<StoreProduct[]> {
  const raw = await getCachedCatalog()
  const categoryRank = new Map(STORE_CATEGORIES.map((c, i) => [c.id, i]))
  return raw
    .filter((p) => p.status === 'ACTIVE' && !HIDDEN_HANDLES.has(p.handle))
    .map(toStoreProduct)
    .sort((a, b) => {
      const catDiff = (categoryRank.get(a.category) ?? 99) - (categoryRank.get(b.category) ?? 99)
      if (catDiff !== 0) return catDiff
      return a.order - b.order
    })
}

export async function getStoreProduct(handle: string): Promise<StoreProduct | null> {
  const products = await getStoreProducts()
  return products.find((p) => p.handle === handle) ?? null
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  })
}
