// Replays the ShopifyCopy statechart's bug paths against Crazy Seal's real fetchAndUpsertOrder and
// markShopifyDeleted (main 96e6068), the functions the orders/* webhooks call.
// Run with: node --import ./register.mjs --test shopify-copy.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

const { fetchAndUpsertOrder, markShopifyDeleted } = await import('@/lib/shopify/sync')

const ID = 'gid://shopify/Order/9'
const node = (status, updatedAt) => ({
  id: ID, name: '#9001', createdAt: '2026-11-01T10:00:00Z', updatedAt,
  displayFulfillmentStatus: status, displayFinancialStatus: 'PAID',
  customer: { id: 'gid://shopify/Customer/1' }, lineItems: { nodes: [] },
})
function setup() {
  const db = createFakeDb({ tables: { shopify_orders: [], shopify_order_line_items: [] }, unique: { shopify_orders: [['shopify_id']] } })
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
const stored = (db) => db.tables.shopify_orders.find((r) => r.shopify_id === ID)

test('a slow update webhook writes an older order over a newer one', async () => {
  const { db, shop } = setup()
  const first = slowDelivery(shop)            // orders/updated: Shopify answers "unfulfilled"
  await new Promise((r) => setTimeout(r, 10))
  shop.order = node('FULFILLED', '2026-11-06T09:05:00Z')
  await fetchAndUpsertOrder(ID)                // orders/fulfilled arrives and is written first
  assert.equal(stored(db).shopify_updated_at, '2026-11-06T09:05:00Z')
  first.release()
  await first.run
  assert.equal(stored(db).shopify_updated_at, '2026-11-06T09:00:00Z', 'the older copy won: the order shows as not shipped again')
})

test('a slow update webhook brings a deleted order back', async () => {
  const { db, shop } = setup()
  await fetchAndUpsertOrder(ID)
  const update = slowDelivery(shop)            // orders/updated fetched the order before it was deleted
  await new Promise((r) => setTimeout(r, 10))
  shop.order = null
  await markShopifyDeleted('shopify_orders', ID) // orders/delete
  assert.ok(stored(db).deleted_at)
  update.release()
  await update.run
  assert.equal(stored(db).deleted_at, null, 'the deleted order is back in the pro\'s list and the admin counts')
})
