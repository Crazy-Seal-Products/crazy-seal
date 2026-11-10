// Replays the Pro Hub access findings against Crazy Seal's real code (main 96e6068): the signup route,
// the session it creates, and what loadProContext and loadJobsForPro then show.
// Run with: node --import ./register.mjs --test pro-access.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

const { POST: signup } = await import('@/app/api/pro/auth/signup/route')
const { createMagicLink, consumeMagicLink, getProUserByEmail } = await import('@/lib/pro/auth')
const { loadProContext, loadJobsForPro } = await import('@/lib/pro/context')

function setup() {
  const db = createFakeDb({
    tables: {
      // A real pro who signs in with magic links, so has no password yet.
      pro_users: [{ id: 'pro-1', email: 'mike@mikesroofing.com', password_hash: null, display_name: 'Mike', status_override: null }],
      pro_sessions: [], pro_magic_links: [],
      shopify_customers: [
        { shopify_id: 'gid://shopify/Customer/1', display_name: 'Mike Rivera', email: 'mike@mikesroofing.com', phone: '555-0101', tags: ['pro'], number_of_orders: 12, amount_spent: '18450.00', amount_spent_currency: 'USD', deleted_at: null },
        { shopify_id: 'gid://shopify/Customer/2', display_name: 'Dana Lopez', email: 'dana@example.com', phone: '555-0199', tags: [], number_of_orders: 1, amount_spent: '389.00', amount_spent_currency: 'USD', deleted_at: null },
      ],
      shopify_orders: [{ shopify_id: 'gid://shopify/Order/9', name: '#9001', customer_shopify_id: 'gid://shopify/Customer/1', shopify_created_at: '2026-10-01', fulfillment_status: 'FULFILLED', financial_status: 'PAID', total_price: '1290.00', currency: 'USD', deleted_at: null, shopify_order_line_items: [] }],
      // A warranty Mike filed for one of his customers: her name, phone, address and photos.
      warranty_registrations: [{ id: 'w-1', name: 'Ruth Carter', email: 'ruth@example.com', phone: '555-0144', customer_details: { address: '12 Oak St' }, installer_email: 'mike@mikesroofing.com', filed_by_pro_user_id: 'pro-1', order_number: '#9001', install_type: 'rv', status: 'approved', created_at: '2026-10-05', before_photo_urls: ['before.jpg'], after_photo_urls: ['after.jpg'] }],
      warranty_claims: [], warranty_transfers: [],
    },
    unique: { pro_users: [['email']] },
  })
  globalThis.__cs = { db }
  return db
}
// The route only reads request.json(), so a standard Request stands in for NextRequest.
const signUp = (email) => signup(new Request('https://crazyseal.com/api/pro/auth/signup/', {
  method: 'POST', body: JSON.stringify({ email, password: 'not-mikes-password-123', confirm: 'not-mikes-password-123' }),
}))

test("a stranger signs up with a pro's email and sees the pro's customers", async () => {
  const db = setup()
  const res = await signUp('mike@mikesroofing.com')
  assert.equal(res.status, 200, 'no email check: the account is claimed')
  assert.match(res.headers.get('set-cookie') || '', /=/, 'and a session cookie is issued at once')
  assert.equal(db.tables.pro_sessions[0].pro_user_id, 'pro-1', "the session is Mike's account")
  const ctx = await loadProContext(await getProUserByEmail('mike@mikesroofing.com'))
  assert.equal(ctx.customer.phone, '555-0101')
  assert.equal(ctx.orders[0].name, '#9001')
  const jobs = await loadJobsForPro(ctx)
  const shown = JSON.stringify(jobs)
  for (const detail of ['Ruth Carter', '555-0144', '12 Oak St', 'before.jpg']) assert.ok(shown.includes(detail), `${detail} is shown`)
  // Mike's real login still works only by magic link, and he can no longer set a password.
  assert.equal((await signUp('mike@mikesroofing.com')).status, 409)
})

test('a wildcard email signs up and is shown the first customer in the copy', async () => {
  setup()
  const res = await signUp('%@%.%')
  assert.equal(res.status, 200, 'the server-side email check accepts % and _')
  const ctx = await loadProContext(await getProUserByEmail('%@%.%'))
  assert.equal(ctx.customer.displayName, 'Mike Rivera', 'ilike matches every customer and the lookup takes the first')
  assert.equal(ctx.orders.length, 1)
})

test('one sign-in link opened twice at once gives two sessions', async () => {
  setup()
  const { token } = await createMagicLink('mike@mikesroofing.com', { createIfMissing: false })
  assert.ok(token)
  const [a, b] = await Promise.all([consumeMagicLink(token), consumeMagicLink(token)])
  assert.equal(a?.id, 'pro-1')
  assert.equal(b?.id, 'pro-1', 'both requests got the account: the link is not single-use under overlap')
})
