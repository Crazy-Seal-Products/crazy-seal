import { shopifyAdminGraphql } from './admin'

export interface ShopifyVariant {
  id: string
  title: string
  sku: string | null
  price: string
  compareAtPrice: string | null
  availableForSale: boolean
  image: string | null
  /** e.g. [{ name: "Size", value: "1 Gallon" }, { name: "Color", value: "White" }] */
  selectedOptions: Array<{ name: string; value: string }>
}

export interface ShopifyProduct {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  status: string
  featuredImage: string | null
  images: string[]
  /** Option groups, e.g. [{ name: "Size", values: ["1 Gallon", "3 Gallon"] }] */
  options: Array<{ name: string; values: string[] }>
  variants: ShopifyVariant[]
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
        options {
          name
          values
        }
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
        variants(first: 100) {
          nodes {
            id
            title
            sku
            price
            compareAtPrice
            availableForSale
            image {
              url
            }
            selectedOptions {
              name
              value
            }
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
      options: Array<{ name: string; values: string[] }>
      featuredMedia: { preview: { image: { url: string } | null } | null } | null
      media: { nodes: Array<{ preview: { image: { url: string } | null } | null }> }
      variants: {
        nodes: Array<{
          id: string
          title: string
          sku: string | null
          price: string
          compareAtPrice: string | null
          availableForSale: boolean
          image: { url: string } | null
          selectedOptions: Array<{ name: string; value: string }>
        }>
      }
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
        options: node.options,
        featuredImage: node.featuredMedia?.preview?.image?.url ?? null,
        images: node.media.nodes
          .map((m) => m.preview?.image?.url)
          .filter((u): u is string => Boolean(u)),
        variants: node.variants.nodes.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          availableForSale: v.availableForSale,
          image: v.image?.url ?? null,
          selectedOptions: v.selectedOptions,
        })),
      })
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null
  } while (cursor)

  return products
}

/**
 * Build a Shopify cart permalink that pre-fills the checkout with the given
 * variant quantities. Variant IDs may be numeric IDs or gid:// strings.
 * Works with no Storefront API token — used as the checkout fallback.
 */
export function buildCartPermalink(
  items: Array<{ variantId: string; quantity: number }>
): string {
  const domain = process.env.SHOPIFY_PUBLIC_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN
  const parts = items
    .map((i) => `${i.variantId.replace('gid://shopify/ProductVariant/', '')}:${i.quantity}`)
    .join(',')
  return `https://${domain}/cart/${parts}`
}
