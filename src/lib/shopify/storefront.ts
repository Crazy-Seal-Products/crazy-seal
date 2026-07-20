import { buildCartPermalink } from './catalog'

/**
 * Storefront API cart creation. Returns Shopify's hosted checkout URL for the
 * given line items. Requires SHOPIFY_STOREFRONT_TOKEN (a Storefront API access
 * token from the Dev Dashboard app). When the token is not configured, falls
 * back to a cart permalink, which lands on the same checkout.
 */

const API_VERSION = '2026-07'

export interface CheckoutLineItem {
  /** Shopify variant gid, e.g. gid://shopify/ProductVariant/123 */
  variantId: string
  quantity: number
}

export async function createCheckoutUrl(items: CheckoutLineItem[]): Promise<string> {
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN
  if (!token) {
    return buildCartPermalink(items)
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN!
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: /* GraphQL */ `
        mutation CartCreate($input: CartInput!) {
          cartCreate(input: $input) {
            cart {
              checkoutUrl
            }
            userErrors {
              message
            }
          }
        }
      `,
      variables: {
        input: {
          lines: items.map((i) => ({
            merchandiseId: i.variantId.startsWith('gid://')
              ? i.variantId
              : `gid://shopify/ProductVariant/${i.variantId}`,
            quantity: i.quantity,
          })),
        },
      },
    }),
  })

  if (!res.ok) {
    return buildCartPermalink(items)
  }

  const json = await res.json()
  const checkoutUrl: string | undefined = json?.data?.cartCreate?.cart?.checkoutUrl
  return checkoutUrl || buildCartPermalink(items)
}
