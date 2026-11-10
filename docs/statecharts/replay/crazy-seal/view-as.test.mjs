// Replays the View as model's paths (docs/statecharts/view-as) against Crazy Seal's real code: the
// View as button's route, the Pro Hub's /api/pro/me (which every Pro Hub page loads), its "Exit admin
// view" (the logout route), src/lib/pro/view-as.ts and loadProContext. One browser, a fake database.
// Each former bug path now asserts the fixed behavior (2026-11-10).
// Run with: node --import ./register-view-as.mjs --test view-as.test.mjs
import { createHash } from 'node:crypto'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

process.env.SUPABASE_SECRET_KEY = 'replay-only-secret'

const { POST: viewAs } = await import('@/app/api/admin/view-as/route')
const { GET: me } = await import('@/app/api/pro/me/route')
const { POST: exitAdminView } = await import('@/app/api/pro/auth/logout/route')
const { NO_ACCOUNT_ID, VIEW_AS_COOKIE } = await import('@/lib/pro/view-as')

const A = { email: 'amber@crazyseal.com', name: 'Amber', role: 'admin', via: 'staff' }
const B = { email: 'mike.office@crazyseal.com', name: 'Office', role: 'admin', via: 'staff' }
const MIKE = 'gid://shopify/Customer/1'
const RUTH = 'gid://shopify/Customer/2'

function setup() {
  const db = createFakeDb({
    tables: {
      // Mike has a Pro Hub account whose stored details lag the Shopify copy.
      pro_users: [{ id: 'pro-1', email: 'mike@mikesroofing.com', display_name: null, business_name: null, phone: null, shopify_customer_id: null, status_override: null, password_hash: null, created_at: '2026-01-01' }],
      pro_sessions: [],
      shopify_customers: [
        { shopify_id: MIKE, display_name: 'Mike Rivera', email: 'mike@mikesroofing.com', phone: '555-0101', company: "Mike's Roofing", tags: ['dealer'], number_of_orders: 3, amount_spent: '2400.00', amount_spent_currency: 'USD', deleted_at: null },
        // Ruth is on the dealer roster with no Pro Hub account.
        { shopify_id: RUTH, display_name: 'Ruth Carter', email: 'ruth@carterrv.com', phone: '555-0144', company: 'Carter RV', tags: ['dealer'], number_of_orders: 1, amount_spent: '900.00', amount_spent_currency: 'USD', deleted_at: null },
      ],
      shopify_orders: [{ shopify_id: 'gid://shopify/Order/9', name: '#9001', customer_shopify_id: MIKE, shopify_created_at: '2026-10-01', fulfillment_status: 'FULFILLED', financial_status: 'PAID', total_price: '1290.00', currency: 'USD', deleted_at: null, shopify_order_line_items: [] }],
      admin_view_as_log: [],
    },
  })
  globalThis.__cs = { db }
  globalThis.__vs = { jar: new Map(), admin: A, sections: ['view_as', 'portal_accounts'] }
  return db
}

const press = (field, value) => {
  const form = new FormData()
  form.set(field, value)
  return viewAs(new Request('https://crazyseal.com/api/admin/view-as/', { method: 'POST', body: form }))
}
const loadPage = async () => {
  const res = await me()
  return { status: res.status, body: await res.json() }
}
const log = (db, action) => db.tables.admin_view_as_log.filter((r) => r.action === action)

test("NothingChangesWhileViewing: a Pro Hub page load during an account view leaves the dealer's account alone", async () => {
  const db = setup()
  assert.equal((await press('pro_user_id', 'pro-1')).status, 303)
  const before = structuredClone(db.tables.pro_users[0])
  const page = await loadPage()
  assert.equal(page.status, 200)
  assert.ok(page.body.viewAs, 'the page is the admin view')
  assert.equal(page.body.user.displayName, 'Mike Rivera', 'it still shows his Shopify details')
  assert.deepEqual(db.tables.pro_users[0], before, 'and nothing was written to pro_users')
})

test('NoBaseViewOnceTheyHaveAnAccount: after the dealer signs up, the open view shows their account', async () => {
  const db = setup()
  await press('customer_id', RUTH)
  let page = await loadPage()
  assert.equal(page.body.user.id, NO_ACCOUNT_ID, 'the base view while she has no account')
  assert.equal(page.body.viewAs.hasAccount, false)
  // Ruth signs up in her own browser.
  db.tables.pro_users.push({ id: 'pro-2', email: 'ruth@carterrv.com', display_name: 'Ruth Carter', business_name: 'Carter RV', phone: null, shopify_customer_id: RUTH, status_override: 'pro', password_hash: 'x', created_at: '2026-11-10' })
  page = await loadPage()
  assert.equal(page.body.user.id, 'pro-2', 'the next page load shows her account')
  assert.equal(page.body.viewAs.hasAccount, true, 'and the banner no longer says she has none')
})

test('ExitEndsTheView: Exit admin view while signed out of the admin still ends the view', async () => {
  const db = setup()
  await press('pro_user_id', 'pro-1')
  globalThis.__vs.admin = null // the admin signs out in another tab
  const res = await exitAdminView()
  assert.equal(res.status, 200)
  assert.equal((await res.json()).viewAsEnded, true)
  assert.ok(!globalThis.__vs.jar.has(VIEW_AS_COOKIE), 'the view cookie is gone')
  const exit = log(db, 'exit')
  assert.equal(exit.length, 1, 'and the exit is logged')
  assert.equal(exit[0].admin_email, A.email, 'for the admin the cookie named')
  globalThis.__vs.admin = A // signing back in within the hour
  assert.equal((await loadPage()).status, 401, 'does not bring the view back')
})

test('LogShowsEveryView: pressing View as again logs the end of the view it replaces', async () => {
  const db = setup()
  await press('pro_user_id', 'pro-1')
  await press('customer_id', RUTH)
  assert.equal(log(db, 'start').length, 2)
  assert.equal(log(db, 'exit').length, 1, "Mike's view ended when Ruth's replaced it")
  assert.equal(log(db, 'exit')[0].pro_user_email, 'mike@mikesroofing.com')
  const res = await exitAdminView()
  assert.equal((await res.json()).viewAsEnded, true)
  assert.equal(log(db, 'exit').length, 2, 'every start has an end')
  assert.equal(log(db, 'exit')[1].pro_user_id, null, "Ruth's base view has no account id")
})

test('holds: only the admin who started the view, signed in and allowed, sees through it', async () => {
  setup()
  await press('pro_user_id', 'pro-1')
  globalThis.__vs.admin = B // another admin signs in on the same browser
  assert.equal((await loadPage()).status, 401)
  globalThis.__vs.admin = A
  globalThis.__vs.sections = ['portal_accounts'] // A's role loses View as
  assert.equal((await loadPage()).status, 401)
  globalThis.__vs.admin = null
  globalThis.__vs.sections = []
  assert.equal((await loadPage()).status, 401, 'a dealer, or anyone without an admin session, gets nothing from the cookie')
})

test("a dealer's own sign-out still signs them out when there is no view cookie", async () => {
  const db = setup()
  globalThis.__vs.admin = null
  const token = 'mikes-session-token'
  db.tables.pro_sessions.push({ id: 's-1', pro_user_id: 'pro-1', token_hash: createHash('sha256').update(token).digest('hex'), expires_at: '2099-01-01' })
  globalThis.__vs.jar.set('cs_pro_session', token)
  const res = await exitAdminView()
  const body = await res.json()
  assert.equal(body.success, true)
  assert.equal(body.viewAsEnded, undefined, 'it took the Pro Hub sign-out path')
  assert.equal(db.tables.pro_sessions.length, 0, 'his session is gone')
  assert.match(res.headers.get('set-cookie') || '', /Max-Age=0|Expires=Thu, 01 Jan 1970/i, 'and the session cookie is cleared')
  assert.equal(log(db, 'exit').length, 0, 'nothing logged as a view')
})
