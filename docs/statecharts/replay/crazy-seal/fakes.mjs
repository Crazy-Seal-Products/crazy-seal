// Fakes swapped in while Crazy Seal's real Pro Hub code runs: the database, the live Shopify
// Admin API, Gmail and staff "view as".
export const createAdminClient = () => globalThis.__cs.db

// src/lib/shopify/admin.ts. Answers ORDER_BY_ID with the order as globalThis.__cs.shop holds it when
// asked, then waits on the next queued gate (a slow request) before returning. Answers a customer
// search with every customer in shop.customers, the way Shopify's fuzzy search can return near
// matches. Anything else isn't faked, unless shop.answer(query, variables) stands in for the whole
// Admin API.
export async function shopifyAdminGraphql(query, variables) {
  const shop = globalThis.__cs.shop
  if (shop?.answer) return shop.answer(query, structuredClone(variables))
  if (shop?.customers && String(variables?.query ?? '').startsWith('email:'))
    return { customers: { nodes: structuredClone(shop.customers) } }
  if (!shop || !variables?.id?.includes('/Order/')) throw new Error('fake: the live Shopify Admin API is not available in replays')
  const order = shop.order ? structuredClone(shop.order) : null
  const gate = shop.gates.shift()
  if (gate) await gate
  return { order }
}

// src/lib/email/gmail.ts: records each email in globalThis.__cs.mail instead of sending it.
const record = (kind) => async (to, url) => {
  ;(globalThis.__cs.mail ??= []).push({ kind, to, url })
}
export const sendProSignupLink = record('signup')
export const sendProMagicLink = record('sign-in')
export const sendProPasswordReset = record('reset')

// src/lib/pro/view-as.ts
export const VIEW_AS_COOKIE = 'cs_pro_view_as'
export const VIEW_AS_READ_ONLY = 'read only'
export async function getViewAs() { return null }
