// One-off: dump live Shopify variants for kit-builder mapping design.
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const domain = env.SHOPIFY_STORE_DOMAIN
const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.SHOPIFY_CLIENT_ID,
    client_secret: env.SHOPIFY_CLIENT_SECRET,
  }),
})
const { access_token } = await tokenRes.json()

const query = `
  query Products($cursor: String) {
    products(first: 50, after: $cursor, sortKey: TITLE) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle title status
        options { name values }
        variants(first: 100) {
          nodes { id title sku price availableForSale selectedOptions { name value } }
        }
      }
    }
  }
`

const products = []
let cursor = null
do {
  const res = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': access_token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { cursor } }),
  })
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  products.push(...json.data.products.nodes)
  cursor = json.data.products.pageInfo.hasNextPage ? json.data.products.pageInfo.endCursor : null
} while (cursor)

const interesting = new Set([
  'single-layer-kit', 'double-layer-kit', 'direct-to-deck-kit',
  'rv-roofing-kit', 'direct-to-deck-rv-roofing-kit',
  'crazy-seal', 'crazy-patch', 'crazy-caulk', 'crazy-clean', 'crazy-cloth',
  '500-sq-ft-commercial-kit', '1000-sq-ft-commercial-kit', '1-500-sq-ft-commercial-kit',
  '2000-sq-ft-commercial-kit', '2500-sq-ft-commercial-kit', '3000-sq-ft-commercial-kit',
])

for (const p of products) {
  if (!interesting.has(p.handle)) continue
  console.log(`\n=== ${p.handle} (${p.status}) — ${p.title}`)
  console.log(`    options: ${p.options.map((o) => `${o.name}: [${o.values.join(', ')}]`).join(' | ')}`)
  for (const v of p.variants.nodes) {
    console.log(`    ${v.id.replace('gid://shopify/ProductVariant/', '')}  "${v.title}"  $${v.price}  sku=${v.sku}  avail=${v.availableForSale}`)
  }
}
