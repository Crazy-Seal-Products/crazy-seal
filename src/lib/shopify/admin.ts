/**
 * Shopify Admin API client (Dev Dashboard app, client credentials grant).
 *
 * Tokens expire after 24h; this module exchanges the client ID/secret for a
 * token on demand and caches it until shortly before expiry.
 *
 * Required env: SHOPIFY_STORE_DOMAIN, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET
 */

const API_VERSION = '2026-07'

let cachedToken: { token: string; expiresAt: number } | null = null

export async function getShopifyAdminToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN!
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.SHOPIFY_CLIENT_ID!,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET!,
    }),
  })

  if (!res.ok) {
    throw new Error(`Shopify token exchange failed: HTTP ${res.status}`)
  }

  const data = await res.json()
  cachedToken = {
    token: data.access_token,
    // refresh 5 minutes before actual expiry
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }
  return cachedToken.token
}

export async function shopifyAdminGraphql<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!
  const token = await getShopifyAdminToken()

  const res = await fetch(`https://${domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`Shopify Admin API error: HTTP ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  }
  return json.data as T
}
