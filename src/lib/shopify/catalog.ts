import { shopifyAdminGraphql } from './admin'

export interface ShopifyVariant {
  id: string
  title: string
  sku: string | null
  price: string
  compareAtPrice: string | null
  availableForSale: boolean
  inventoryQuantity: number | null
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  status: string
  productType: string
  tags: string[]
  featuredImage: string | null
  images: string[]
  variants: ShopifyVariant[]
  onlineStoreUrl: string | null
}

const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($cursor: String) {
    products(first: 50, after: $cursor, sortKey: TITLE) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        handle
        title
        description
        descriptionHtml
        status
        productType
        tags
        onlineStoreUrl
        featuredMedia {
          preview {
            image {
              url
            }
          }
        }
        media(first: 20) {
          nodes {
            preview {
              image {
                url
              }
            }
          }
        }
        variants(first: 50) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            availableForSale
            inventoryQuantity
          }
        }
      }
    }
  }
`

interface ProductsQueryResult {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
    nodes: Array<{
      id: string
      handle: string
      title: string
      description: string
      descriptionHtml: string
      status: string
      productType: string
      tags: string[]
      onlineStoreUrl: string | null
      featuredMedia: { preview: { image: { url: string } | null } | null } | null
      media: { nodes: Array<{ preview: { image: { url: string } | null } | null }> }
      variants: { nodes: ShopifyVariant[] }
    }>
  }
}

/** Fetch the entire product catalog from the Shopify Admin API (paginated). */
export async function getShopifyProducts(): Promise<ShopifyProduct[]> {
  const products: ShopifyProduct[] = []
  let cursor: string | null = null

  do {
    const data: ProductsQueryResult = await shopifyAdminGraphql<ProductsQueryResult>(
      PRODUCTS_QUERY,
      { cursor }
    )
    for (const node of data.products.nodes) {
      products.push({
        id: node.id,
        handle: node.handle,
        title: node.title,
        description: node.description,
        descriptionHtml: node.descriptionHtml,
        status: node.status,
        productType: node.productType,
        tags: node.tags,
        featuredImage: node.featuredMedia?.preview?.image?.url ?? null,
        images: node.media.nodes
          .map((m) => m.preview?.image?.url)
          .filter((u): u is string => Boolean(u)),
        variants: node.variants.nodes,
        onlineStoreUrl: node.onlineStoreUrl,
      })
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (cursor)

  return products
}

/**
 * Build a Shopify cart permalink that pre-fills the checkout with the given
 * variant quantities. Variant IDs may be numeric IDs or gid:// strings.
 */
export function buildCartPermalink(
  items: Array<{ variantId: string; quantity: number }>
): string {
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
  const parts = items
    .map((i) => `${i.variantId.replace('gid://shopify/ProductVariant/', '')}:${i.quantity}`)
    .join(',')
  return `https://${domain}/cart/${parts}`
}
