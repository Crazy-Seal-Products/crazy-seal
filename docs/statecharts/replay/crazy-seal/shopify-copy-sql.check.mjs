// Checks the SQL in supabase/migrations/019_shopify_copy_newest_wins.sql in PGlite (Postgres compiled to
// WebAssembly), with rows built by the real commerce-map.ts. The replays use a JavaScript copy of these
// functions (shopify-copy-sql.mjs); this is the check that the SQL itself does the same.
// PGlite isn't one of the app's packages: install it anywhere outside the repo and point PGLITE_DIR at it.
//   npm install --prefix <dir> @electric-sql/pglite
//   PGLITE_DIR=<dir> node --import ./register.mjs --test shopify-copy-sql.check.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const { customerRow, lineItemRows, orderRow } = await import('@/lib/shopify/commerce-map')

const migrations = path.resolve(import.meta.dirname, '../../../../supabase/migrations')
const sql = (name) => fs.readFileSync(path.join(migrations, name), 'utf8')

let PGlite = null
try {
  const require = createRequire(path.join(path.resolve(process.env.PGLITE_DIR ?? process.cwd()), 'noop.js'))
  ;({ PGlite } = await import(pathToFileURL(require.resolve('@electric-sql/pglite')).href))
} catch {
  console.log('skipped: set PGLITE_DIR to a folder with @electric-sql/pglite installed')
}
const run = PGlite ? test : test.skip

async function freshDb(before = async () => {}) {
  const db = new PGlite()
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;`)
  await db.exec(sql('015_shopify_commerce.sql'))
  await before(db)
  await db.exec(sql('019_shopify_copy_newest_wins.sql'))
  return db
}

const ORDER = 'gid://shopify/Order/9'
const orderNode = (updatedAt, status, items = ['a', 'b']) => ({
  id: ORDER, legacyResourceId: '9', name: '#9001', createdAt: '2026-11-01T10:00:00Z', updatedAt,
  displayFulfillmentStatus: status, displayFinancialStatus: 'PAID', tags: ['wholesale'],
  totalPriceSet: { shopMoney: { amount: '120.50', currencyCode: 'USD' } },
  customer: { id: 'gid://shopify/Customer/1', displayName: 'Ann' },
  lineItems: { nodes: items.map((i) => ({ id: `gid://shopify/LineItem/${i}`, title: `Item ${i}`, quantity: 2 })) },
})
const orderArg = (node) => [{ ...orderRow(node), line_items: lineItemRows(node.id, node.lineItems.nodes) }]
const writeOrders = async (db, nodes) =>
  (await db.query('SELECT upsert_shopify_orders($1::jsonb) AS n', [JSON.stringify(nodes.flatMap(orderArg))])).rows[0].n
const order = async (db) =>
  (await db.query(`SELECT id, fulfillment_status, shopify_updated_at, deleted_at, tags, total_price::text AS total FROM shopify_orders WHERE shopify_id = $1`, [ORDER])).rows[0]
const items = async (db) =>
  (await db.query(`SELECT shopify_id, order_id, order_shopify_id FROM shopify_order_line_items ORDER BY shopify_id`)).rows

run('writes a new order with its line items', async () => {
  const db = await freshDb()
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED')]), 1)
  const row = await order(db)
  assert.equal(row.fulfillment_status, 'UNFULFILLED')
  assert.deepEqual(row.tags, ['wholesale'])
  assert.equal(row.total, '120.50')
  assert.deepEqual((await items(db)).map((i) => [i.shopify_id, i.order_id, i.order_shopify_id]), [
    ['gid://shopify/LineItem/a', row.id, ORDER],
    ['gid://shopify/LineItem/b', row.id, ORDER],
  ])
})

run('an older version leaves the order and its line items alone', async () => {
  const db = await freshDb()
  await writeOrders(db, [orderNode('2026-11-06T09:05:00Z', 'FULFILLED', ['a', 'b'])])
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED', ['a'])]), 0)
  assert.equal((await order(db)).fulfillment_status, 'FULFILLED')
  assert.equal((await items(db)).length, 2)
})

run('a newer version replaces the order and its line items', async () => {
  const db = await freshDb()
  await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED', ['a', 'b'])])
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:05:00Z', 'FULFILLED', ['b', 'c'])]), 1)
  assert.equal((await order(db)).fulfillment_status, 'FULFILLED')
  assert.deepEqual((await items(db)).map((i) => i.shopify_id), ['gid://shopify/LineItem/b', 'gid://shopify/LineItem/c'])
})

run('the same version writes again, and an order with no line items keeps none', async () => {
  const db = await freshDb()
  await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED', ['a'])])
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED', [])]), 1)
  assert.deepEqual(await items(db), [])
})

run('a deleted order stays deleted', async () => {
  const db = await freshDb()
  await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'UNFULFILLED')])
  await db.query(`UPDATE shopify_orders SET deleted_at = '2026-11-06T09:10:00Z' WHERE shopify_id = $1`, [ORDER])
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:20:00Z', 'FULFILLED', ['c'])]), 0)
  const row = await order(db)
  assert.equal(row.deleted_at.toISOString(), '2026-11-06T09:10:00.000Z')
  assert.equal(row.fulfillment_status, 'UNFULFILLED')
  assert.equal((await items(db)).length, 2)
})

run('two versions in one call keep the newer one, in either order', async () => {
  for (const pair of [['09:05', '09:00'], ['09:00', '09:05']]) {
    const db = await freshDb()
    await writeOrders(db, pair.map((t) => orderNode(`2026-11-06T${t}:00Z`, t === '09:05' ? 'FULFILLED' : 'UNFULFILLED')))
    assert.equal((await order(db)).fulfillment_status, 'FULFILLED')
  }
})

run('a stored row with no updated_at is replaced', async () => {
  const db = await freshDb()
  await writeOrders(db, [orderNode(null, 'UNFULFILLED')])
  assert.equal(await writeOrders(db, [orderNode('2026-11-06T09:00:00Z', 'FULFILLED')]), 1)
  assert.equal((await order(db)).fulfillment_status, 'FULFILLED')
})

run('customers: newer replaces, older and deleted are left alone', async () => {
  const db = await freshDb()
  const node = (updatedAt, name) => ({
    id: 'gid://shopify/Customer/1', legacyResourceId: 1, displayName: name, tags: ['Dealer'], numberOfOrders: '3',
    amountSpent: { amount: '99.00', currencyCode: 'USD' }, defaultEmailAddress: { emailAddress: 'ann@example.com' },
    addressesV2: { nodes: [{ city: 'Austin' }] }, updatedAt,
  })
  const write = async (n) => (await db.query('SELECT upsert_shopify_customers($1::jsonb) AS n', [JSON.stringify([customerRow(n)])])).rows[0].n
  const stored = async () => (await db.query(`SELECT display_name, is_dealer, number_of_orders, addresses FROM shopify_customers`)).rows[0]
  assert.equal(await write(node('2026-11-06T09:00:00Z', 'Ann')), 1)
  assert.deepEqual(await stored(), { display_name: 'Ann', is_dealer: true, number_of_orders: 3, addresses: [{ city: 'Austin' }] })
  assert.equal(await write(node('2026-11-06T09:05:00Z', 'Ann B')), 1)
  assert.equal(await write(node('2026-11-06T09:00:00Z', 'Ann')), 0)
  assert.equal((await stored()).display_name, 'Ann B')
  await db.exec(`UPDATE shopify_customers SET deleted_at = NOW()`)
  assert.equal(await write(node('2026-11-06T09:10:00Z', 'Ann C')), 0)
  assert.equal((await stored()).display_name, 'Ann B')
})

run('the refresh starts a week before the newest stored change, or from the beginning', async () => {
  const db = await freshDb(async (d) => {
    await d.exec(`INSERT INTO shopify_orders (shopify_id, name, shopify_updated_at) VALUES
      ('o1', '#1', '2026-11-06T09:00:00Z'), ('o2', '#2', '2026-10-01T00:00:00Z')`)
  })
  const { rows } = await db.query(`SELECT resource, cursor FROM shopify_sync_state ORDER BY resource`)
  assert.deepEqual(rows.map((r) => [r.resource, r.cursor && new Date(r.cursor).toISOString()]), [
    ['customers_refresh', null],
    ['orders_refresh', '2026-10-30T09:00:00.000Z'],
  ])
})

run('only the service role can call the functions', async () => {
  const db = await freshDb()
  for (const fn of ['upsert_shopify_customers(jsonb)', 'upsert_shopify_orders(jsonb)']) {
    const { rows } = await db.query(`SELECT has_function_privilege('anon', $1, 'EXECUTE') AS anon,
      has_function_privilege('authenticated', $1, 'EXECUTE') AS authed, has_function_privilege('service_role', $1, 'EXECUTE') AS service`, [fn])
    assert.deepEqual(rows[0], { anon: false, authed: false, service: true })
  }
})
