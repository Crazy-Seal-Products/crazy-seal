// Replays the Pro Hub access findings against Crazy Seal's real code: the sign-up, sign-in link,
// forgot, reset and login routes, consumeMagicLink, and what loadProContext and loadJobsForPro show.
// At main 96e6068 a stranger who signed up with a pro's email got in at once, a wildcard email was
// shown the first customer, and one link opened twice gave two sessions. These tests assert the fix.
// Run with: node --import ./register.mjs --test pro-access.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

const { POST: signup } = await import('@/app/api/pro/auth/signup/route')
const { POST: login } = await import('@/app/api/pro/auth/login/route')
const { POST: forgot } = await import('@/app/api/pro/auth/forgot/route')
const { POST: reset } = await import('@/app/api/pro/auth/reset/route')
const { GET: callback } = await import('@/app/api/pro/auth/callback/route')
const { createMagicLink, consumeMagicLink, getProUserByEmail } = await import('@/lib/pro/auth')
const { hashPassword } = await import('@/lib/pro/password')
const { loadProContext, loadJobsForPro } = await import('@/lib/pro/context')
const { getLocalCustomerByEmail } = await import('@/lib/shopify/commerce')

const MIKE = 'mike@mikesroofing.com'
const STRANGERS_PASSWORD = 'not-mikes-password-123'

function setup() {
  const db = createFakeDb({
    tables: {
      // A real pro who signs in with magic links, so has no password yet.
      pro_users: [{ id: 'pro-1', email: MIKE, password_hash: null, display_name: 'Mike', status_override: null }],
      pro_sessions: [], pro_magic_links: [],
      shopify_customers: [
        // The copy keeps emails as Shopify has them, capitals included.
        { shopify_id: 'gid://shopify/Customer/1', display_name: 'Mike Rivera', email: 'Mike@MikesRoofing.com', phone: '555-0101', tags: ['pro'], number_of_orders: 12, amount_spent: '18450.00', amount_spent_currency: 'USD', deleted_at: null },
        { shopify_id: 'gid://shopify/Customer/2', display_name: 'Dana Lopez', email: 'dana.lopez@example.com', phone: '555-0199', tags: [], number_of_orders: 1, amount_spent: '389.00', amount_spent_currency: 'USD', deleted_at: null },
      ],
      shopify_orders: [{ shopify_id: 'gid://shopify/Order/9', name: '#9001', customer_shopify_id: 'gid://shopify/Customer/1', shopify_created_at: '2026-10-01', fulfillment_status: 'FULFILLED', financial_status: 'PAID', total_price: '1290.00', currency: 'USD', deleted_at: null, shopify_order_line_items: [] }],
      // A warranty Mike filed for one of his customers: her name, phone, address and photos.
      warranty_registrations: [{ id: 'w-1', name: 'Ruth Carter', email: 'ruth@example.com', phone: '555-0144', customer_details: { address: '12 Oak St' }, installer_email: MIKE, filed_by_pro_user_id: 'pro-1', order_number: '#9001', install_type: 'rv', status: 'approved', created_at: '2026-10-05', before_photo_urls: ['before.jpg'], after_photo_urls: ['after.jpg'] }],
      warranty_claims: [], warranty_transfers: [],
    },
    unique: { pro_users: [['email']], pro_sessions: [['token_hash']], pro_magic_links: [['token_hash']] },
  })
  globalThis.__cs = { db, mail: [] }
  return db
}

// The routes read request.json() and request.nextUrl, so a standard Request with nextUrl stands in for NextRequest.
const request = (path, init) => {
  const url = `https://crazyseal.com${path}`
  return Object.assign(new Request(url, init), { nextUrl: new URL(url) })
}
const post = (route, path, body) => route(request(path, { method: 'POST', body: JSON.stringify(body) }))
const signUp = (email) => post(signup, '/api/pro/auth/signup/', { email, password: STRANGERS_PASSWORD, confirm: STRANGERS_PASSWORD })
const logIn = (email, password) => post(login, '/api/pro/auth/login/', { email, password })
const setPassword = (token, password) => post(reset, '/api/pro/auth/reset/', { token, password, confirm: password })
const tokenIn = (mail) => new URL(mail.url).searchParams.get('token')
const sessionsOf = (db, id) => db.tables.pro_sessions.filter((s) => s.pro_user_id === id)

test("a stranger who signs up with a pro's email gets no session and sets no password", async () => {
  const db = setup()
  const res = await signUp(MIKE)
  assert.equal(res.status, 200)
  assert.equal(res.headers.get('set-cookie'), null, 'no session cookie')
  assert.equal(db.tables.pro_sessions.length, 0, 'no session row')
  assert.equal((await getProUserByEmail(MIKE)).password_hash, null, "the stranger's password was not saved")
  assert.equal((await logIn(MIKE, STRANGERS_PASSWORD)).status, 401, "the stranger's password doesn't sign in")
  // The only way on is the link, and it went to Mike's inbox.
  assert.deepEqual(globalThis.__cs.mail.map((m) => [m.kind, m.to]), [['signup', MIKE]])
  assert.match(globalThis.__cs.mail[0].url, /^https:\/\/crazyseal\.com\/pro\/reset\/\?token=[0-9a-f]{64}&welcome=1$/)
})

test('whoever reads the inbox chooses the password and sees the account', async () => {
  const db = setup()
  await signUp(MIKE)
  const res = await setPassword(tokenIn(globalThis.__cs.mail[0]), 'mikes-own-password')
  assert.equal(res.status, 200)
  assert.match(res.headers.get('set-cookie') || '', /cs_pro_session=[0-9a-f]{64}/)
  assert.equal(sessionsOf(db, 'pro-1').length, 1)
  assert.equal((await logIn(MIKE, 'mikes-own-password')).status, 200, 'his password works from now on')
  assert.equal((await signUp(MIKE)).status, 409, 'and sign-up now says to sign in instead')
  const ctx = await loadProContext(await getProUserByEmail(MIKE))
  assert.equal(ctx.customer.displayName, 'Mike Rivera', 'his customer is still found when Shopify has his email in capitals')
  assert.equal(ctx.orders[0].name, '#9001')
  const shown = JSON.stringify(await loadJobsForPro(ctx))
  for (const detail of ['Ruth Carter', '555-0144', '12 Oak St', 'before.jpg']) assert.ok(shown.includes(detail), `${detail} is shown to Mike`)
})

test('a new pro signs up through the emailed link', async () => {
  const db = setup()
  assert.equal((await signUp('new@pro.com')).status, 200)
  const user = await getProUserByEmail('new@pro.com')
  assert.ok(!user.password_hash, 'the account waits for the link')
  assert.equal((await setPassword(tokenIn(globalThis.__cs.mail[0]), 'brand-new-password')).status, 200)
  assert.equal(sessionsOf(db, user.id).length, 1)
  assert.ok((await getProUserByEmail('new@pro.com')).password_hash)
})

test('an invited pro still signs in with an emailed link', async () => {
  const db = setup()
  const { token } = await createMagicLink(MIKE, { createIfMissing: false })
  const res = await callback(request(`/api/pro/auth/callback/?token=${token}`))
  assert.equal(res.headers.get('location'), 'https://crazyseal.com/pro/')
  assert.match(res.headers.get('set-cookie') || '', /cs_pro_session=/)
  assert.equal(sessionsOf(db, 'pro-1').length, 1)
  assert.equal((await getProUserByEmail(MIKE)).password_hash, null, 'signing in by link sets no password')
})

test('a wildcard email is refused, and the customer lookups only take an exact match', async () => {
  setup()
  assert.equal((await signUp('%@%.%')).status, 400, 'sign-up rejects %')
  assert.equal(await getLocalCustomerByEmail('%@%.%'), null, 'the copy is never matched as a pattern')
  assert.equal(await getLocalCustomerByEmail('dana_lopez@example.com'), null, '_ is not a wildcard either')
  assert.equal((await getLocalCustomerByEmail('DANA.LOPEZ@example.com')).displayName, 'Dana Lopez', 'case still does not matter')
  // An account whose email matches no customer (e.g. one made by asking for a sign-in link), when
  // Shopify's live search answers with a near match: it is not taken.
  globalThis.__cs.shop = { customers: [{ id: 'gid://shopify/Customer/2', displayName: 'Dana Lopez', email: 'dana.lopez@example.com', tags: [], numberOfOrders: 1 }], gates: [] }
  const ctx = await loadProContext({ id: 'pro-x', email: '%@%.%', display_name: null, status_override: null })
  assert.equal(ctx.customer, null)
  assert.deepEqual(ctx.orders, [])
})

test('one link opened twice at once signs in once', async () => {
  const db = setup()
  const { token } = await createMagicLink(MIKE, { createIfMissing: false })
  const [a, b] = await Promise.all([consumeMagicLink(token), consumeMagicLink(token)])
  assert.deepEqual([a?.id ?? null, b?.id ?? null].sort(), ['pro-1', null].sort(), 'exactly one request wins the link')
  // The same race through two reset requests: one sets the password and signs in, the other is turned away.
  await db.from('pro_users').update({ last_magic_link_at: null }).eq('id', 'pro-1')
  const second = await createMagicLink(MIKE, { createIfMissing: false })
  const results = await Promise.all([setPassword(second.token, 'first-tab-password'), setPassword(second.token, 'second-tab-password')])
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 400])
  assert.equal(sessionsOf(db, 'pro-1').length, 1)
})

test('a password reset signs out every other session', async () => {
  const db = setup()
  // Mike's account as a stranger left it before the fix: their password and two of their sessions.
  await db.from('pro_users').update({ password_hash: await hashPassword(STRANGERS_PASSWORD) }).eq('id', 'pro-1')
  await db.from('pro_sessions').insert([
    { pro_user_id: 'pro-1', token_hash: 'stranger-1', expires_at: '2099-01-01' },
    { pro_user_id: 'pro-1', token_hash: 'stranger-2', expires_at: '2099-01-01' },
  ])
  assert.equal((await post(forgot, '/api/pro/auth/forgot/', { email: MIKE })).status, 200)
  const mail = globalThis.__cs.mail.at(-1)
  assert.deepEqual([mail.kind, mail.to], ['reset', MIKE])
  assert.equal((await setPassword(tokenIn(mail), 'mikes-own-password')).status, 200)
  const left = sessionsOf(db, 'pro-1').map((s) => s.token_hash)
  assert.equal(left.length, 1, "only Mike's new session is left")
  assert.ok(!left.includes('stranger-1') && !left.includes('stranger-2'))
  assert.equal((await logIn(MIKE, STRANGERS_PASSWORD)).status, 401, "the stranger's password no longer works")
})

test('loadJobsForPro never pastes the email into an .or() filter', async () => {
  const db = setup()
  const from = db.from
  db.from = (table) => Object.assign(from(table), { or: () => { throw new Error(`.or() on ${table}`) } })
  // An address that would read as filter syntax inside .or(): it must only ever match itself.
  const ctx = { user: { id: 'pro-x', email: 'x",installer_email.neq."y@evil.com' }, orders: [] }
  const jobs = await loadJobsForPro(ctx)
  assert.deepEqual(jobs, { registrations: [], claims: [], transfers: [] })
})
