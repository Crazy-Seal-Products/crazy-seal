// Replays the ShopifyCopy statechart's bug paths against Crazy Seal's real fetchAndUpsertOrder and
// markShopifyDeleted (what the orders/* webhooks call) and the real admin refresh, with a fake Shopify
// and a fake database whose .rpc() runs a JavaScript copy of the SQL functions in migration 019.
// Every test asserts the fixed behavior; against main at 96e6068, each one fails.
// Run with: node --import ./register.mjs --test shopify-copy.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'
import { withSqlFunctions } from './shopify-copy-sql.mjs'

const { fetchAndUpsertOrder, markShopifyDeleted, upsertShopifyOrder } = await import('@/lib/shopify/sync')
const { refreshFromShopify } = await import('@/lib/portal/admin/refresh')

const ID = 'gid://shopify/Order/9'
const node = (status, updatedAt, id = ID) => ({
  id, name: `#${id.split('/').pop()}`, createdAt: '2026-11-01T10:00:00Z', updatedAt,
  displayFulfillmentStatus: status, displayFinancialStatus: 'PAID',
  customer: { id: 'gid://shopify/Customer/1' }, lineItems: { nodes: [] },
})
function setup() {
  const db = withSqlFunctions(createFakeDb({
    tables: { shopify_orders: [], shopify_order_line_items: [], shopify_sync_state: [] },
    unique: { shopify_orders: [['shopify_id']] },
  }))
  // Shopify, as the Admin API would answer at the moment it is asked; a gate holds one answer back.
  const shop = { order: node('UNFULFILLED', '2026-11-06T09:00:00Z'), gates: [] }
  globalThis.__cs = { db, shop }
  return { db, shop }
}
// A webhook delivery that asks Shopify now, then is slow to write (a cold start, a busy database).
function slowDelivery(shop) {
  let release
  shop.gates.push(new Promise((r) => (release = r)))
  return { run: fetchAndUpsertOrder(ID), release: () => release() }
}
const stored = (db, id = ID) => db.tables.shopify_orders.find((r) => r.shopify_id === id)

test('a slow update webhook does not write an older order over a newer one', async () => {
  const { db, shop } = setup()
  const first = slowDelivery(shop)            // orders/updated: Shopify answers "unfulfilled"
  await new Promise((r) => setTimeout(r, 10))
  shop.order = node('FULFILLED', '2026-11-06T09:05:00Z')
  await fetchAndUpsertOrder(ID)                // orders/fulfilled arrives and is written first
  assert.equal(stored(db).shopify_updated_at, '2026-11-06T09:05:00Z')
  first.release()
  await first.run
  assert.equal(stored(db).shopify_updated_at, '2026-11-06T09:05:00Z', 'the older copy must not win')
  assert.equal(stored(db).fulfillment_status, 'FULFILLED')
})

test('a slow update webhook does not bring a deleted order back', async () => {
  const { db, shop } = setup()
  await fetchAndUpsertOrder(ID)
  const update = slowDelivery(shop)            // orders/updated fetched the order before it was deleted
  await new Promise((r) => setTimeout(r, 10))
  shop.order = null
  await markShopifyDeleted('shopify_orders', ID) // orders/delete
  assert.ok(stored(db).deleted_at)
  update.release()
  await update.run
  assert.ok(stored(db).deleted_at, 'the deleted order must stay out of the pro\'s list and the admin counts')
})

// The refresh tests run without webhooks: Shopify's orders change and only the refresh copies them.
const ago = (minutes) => new Date(Math.floor((Date.now() - minutes * 60_000) / 1000) * 1000).toISOString().replace('.000Z', 'Z')
function shopWithOrders(db, nodes) {
  const orders = new Map(nodes.map((n) => [n.id, n]))
  const shop = {
    orders,
    answer(query, variables) {
      if (variables?.id) return { order: structuredClone(orders.get(variables.id) ?? null) }
      const key = query.includes('AdminCustomersSince') ? 'customers' : 'orders'
      const size = Number(/first: (\d+)/.exec(query)[1])
      const since = /updated_at:>='([^']+)'/.exec(variables?.query ?? '')?.[1]
      const list = (key === 'orders' ? [...orders.values()] : [])
        .filter((n) => !since || Date.parse(n.updatedAt) >= Date.parse(since))
        .sort((a, b) => Date.parse(a.updatedAt) - Date.parse(b.updatedAt) || a.id.localeCompare(b.id))
      const start = Number(variables?.cursor ?? 0)
      return { [key]: {
        nodes: structuredClone(list.slice(start, start + size)),
        pageInfo: { hasNextPage: start + size < list.length, endCursor: String(start + size) },
      } }
    },
  }
  globalThis.__cs = { db, shop }
  return shop
}
const O = 'gid://shopify/Order/1'
const N = 'gid://shopify/Order/2'
// The copy as the last refresh, two hours ago, left it: O at its version from three hours ago.
async function copiedTwoHoursAgo() {
  const { db } = setup()
  await upsertShopifyOrder(node('UNFULFILLED', ago(180), O))
  db.tables.shopify_sync_state.push(
    { resource: 'orders_refresh', cursor: ago(121) },
    { resource: 'customers_refresh', cursor: ago(121) },
  )
  return db
}

test('staff opening a new order does not move the refresh past an older change', async () => {
  const db = await copiedTwoHoursAgo()
  shopWithOrders(db, [node('FULFILLED', ago(90), O), node('UNFULFILLED', ago(10), N)])
  await fetchAndUpsertOrder(N)                 // details.ts: staff open N before any refresh copied it
  assert.ok(stored(db, N))
  const result = await refreshFromShopify()
  assert.equal(result.error, null)
  assert.equal(stored(db, O).fulfillment_status, 'FULFILLED', 'the refresh must still fetch O, changed before N')
})

test('a refresh that fails partway does not skip the order it failed on', async () => {
  const db = await copiedTwoHoursAgo()
  shopWithOrders(db, [node('FULFILLED', ago(30), O), node('UNFULFILLED', ago(20), N)])
  let failed = false
  const writesO = ({ op, args, query }) =>
    (op === 'rpc' && args?.p_orders?.some((o) => o.shopify_id === O)) || (op === 'upsert' && query.payload.some((r) => r.shopify_id === O))
  db.hooks.before.push((call) => {
    if (!failed && writesO(call)) {
      failed = true
      throw new Error('database timed out')
    }
  })
  const first = await refreshFromShopify()      // O fails; N, in the same batch, is written
  assert.ok(first.error)
  assert.ok(stored(db, N))
  assert.equal(stored(db, O).fulfillment_status, 'UNFULFILLED')
  await refreshFromShopify()
  assert.equal(stored(db, O).fulfillment_status, 'FULFILLED', 'the next refresh must fetch O again')
})

test('a refresh that stops at its page cap continues where it stopped', async () => {
  const db = await copiedTwoHoursAgo()
  const many = Array.from({ length: 12 * 25 + 7 }, (_, i) => node('FULFILLED', ago(100 - i * 0.25), `gid://shopify/Order/${100 + i}`))
  shopWithOrders(db, many)
  const first = await refreshFromShopify()
  assert.equal(first.hasMore, true)
  assert.equal(db.tables.shopify_orders.length, 1 + 300)
  const start = () => db.tables.shopify_sync_state.find((r) => r.resource === 'orders_refresh').cursor
  assert.equal(start(), many[299].updatedAt, 'the next run starts at the last change this one wrote')
  const second = await refreshFromShopify()
  assert.equal(second.hasMore, false)
  assert.equal(db.tables.shopify_orders.length, 1 + many.length)
  assert.ok(Date.now() - Date.parse(start()) >= 60_000, 'the next run starts a minute before this one asked Shopify')
})
