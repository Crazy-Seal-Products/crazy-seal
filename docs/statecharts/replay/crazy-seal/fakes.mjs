// Fakes swapped in while Crazy Seal's real Pro Hub code runs: the database, the live Shopify
// Admin API (not reached when the local copy has the customer) and staff "view as".
export const createAdminClient = () => globalThis.__cs.db

// src/lib/shopify/admin.ts. Answers ORDER_BY_ID with the order as globalThis.__cs.shop holds it when
// asked, then waits on the next queued gate (a slow request) before returning. Anything else isn't faked.
export async function shopifyAdminGraphql(query, variables) {
  const shop = globalThis.__cs.shop
  if (!shop || !variables?.id?.includes('/Order/')) throw new Error('fake: the live Shopify Admin API is not available in replays')
  const order = shop.order ? structuredClone(shop.order) : null
  const gate = shop.gates.shift()
  if (gate) await gate
  return { order }
}

// src/lib/pro/view-as.ts
export const VIEW_AS_COOKIE = 'cs_pro_view_as'
export const VIEW_AS_READ_ONLY = 'read only'
export const NO_ACCOUNT_ID = '00000000-0000-0000-0000-000000000000'
export async function getViewAs() { return null }
export async function isViewingAs() { return false }
