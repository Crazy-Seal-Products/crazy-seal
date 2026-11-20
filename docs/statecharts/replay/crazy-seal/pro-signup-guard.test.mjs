// Bot screening and flags for Pro Hub sign-up (passesTurnstile in the routes, src/lib/pro/signup-guard.ts,
// src/lib/pro/signup-flags.ts),
// run through the real sign-up and sign-in link routes against a fake database and a fake Gmail.
// From Oct 27 to Nov 20, 2026 a bot used sign-up to make 220 accounts with harvested emails.
// Run with: node --import ./register.mjs --test pro-signup-guard.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

const { POST: signup } = await import('@/app/api/pro/auth/signup/route')
const { POST: requestLink } = await import('@/app/api/pro/auth/request/route')
const { gmailInbox, hasScatteredDots } = await import('@/lib/pro/signup-flags')

const CUSTOMER = 'mike@mikesroofing.com'

function setup() {
  const db = createFakeDb({
    tables: {
      pro_users: [], pro_sessions: [], pro_magic_links: [],
      shopify_customers: [{ shopify_id: 'gid://shopify/Customer/1', email: 'Mike@MikesRoofing.com', deleted_at: null }],
      warranty_registrations: [{ id: 'w-1', email: 'ruth@example.com', installer_email: 'Installer@Example.com' }],
    },
    unique: { pro_users: [['email']], pro_magic_links: [['token_hash']] },
  })
  // The real table stamps created_at on insert.
  db.hooks.before.push(({ table, op, query }) => {
    if (table === 'pro_users' && op === 'insert') for (const row of query.payload) row.created_at ??= new Date().toISOString()
  })
  globalThis.__cs = { db, mail: [] }
  return db
}

let ipSeq = 0
const freshIp = () => `203.0.113.${++ipSeq}`
const call = (route, path, body, ip = freshIp()) => {
  const url = `https://crazyseal.com${path}`
  const req = new Request(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'x-forwarded-for': ip, 'user-agent': 'test-agent' },
  })
  return route(Object.assign(req, { nextUrl: new URL(url) }))
}
const signUp = (email, extra = {}, ip) => call(signup, '/api/pro/auth/signup/', { email, ...extra }, ip)
const askForLink = (email, extra = {}, ip) => call(requestLink, '/api/pro/auth/request/', { email, ...extra }, ip)
const user = (db, email) => db.tables.pro_users.find((u) => u.email === email)

test('a filled honeypot looks like it worked but creates nothing and sends nothing', async () => {
  const db = setup()
  for (const send of [signUp, askForLink]) {
    const res = await send('someone@example.com', { website: 'http://spam.example' })
    assert.equal(res.status, 200)
    assert.equal((await res.json()).success, true)
  }
  assert.equal(db.tables.pro_users.length, 0)
  assert.equal(db.tables.pro_magic_links.length, 0)
  assert.deepEqual(globalThis.__cs.mail, [])
})

test('in production, sign-up and sign-in links need a Turnstile pass', async (t) => {
  const env = process.env.NODE_ENV
  const realFetch = globalThis.fetch
  t.after(() => { process.env.NODE_ENV = env; globalThis.fetch = realFetch })
  process.env.NODE_ENV = 'production'
  let verdict = false
  const seen = []
  globalThis.fetch = async (url, init) => {
    assert.match(String(url), /turnstile\/v0\/siteverify/)
    seen.push(JSON.parse(init.body).response)
    return new Response(JSON.stringify({ success: verdict }))
  }
  const db = setup()

  assert.equal((await signUp('new.pro@shop.example')).status, 403, 'no token')
  assert.equal((await signUp('new.pro@shop.example', { turnstileToken: 'bad' })).status, 403, 'rejected token')
  assert.equal((await askForLink('new.pro@shop.example', { turnstileToken: 'bad' })).status, 403)
  assert.equal(db.tables.pro_users.length, 0)
  assert.deepEqual(globalThis.__cs.mail, [])

  verdict = true
  assert.equal((await signUp('new.pro@shop.example', { turnstileToken: 'good' })).status, 200)
  assert.deepEqual(globalThis.__cs.mail.map((m) => [m.kind, m.to]), [['signup', 'new.pro@shop.example']])
  assert.deepEqual(seen, ['bad', 'bad', 'good'], 'a missing token never reaches Cloudflare')
})

test('one IP gets five tries in ten minutes, then waits', async () => {
  setup()
  const ip = freshIp()
  const statuses = []
  for (let i = 0; i < 6; i++) statuses.push((await signUp(`p${i}@shop.example`, {}, ip)).status)
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429])
})

test('a known customer signing up is recorded but not flagged', async () => {
  const db = setup()
  assert.equal((await signUp(CUSTOMER, {}, '198.51.100.7')).status, 200)
  const u = user(db, CUSTOMER)
  assert.equal(u.signup_ip, '198.51.100.7')
  assert.equal(u.signup_user_agent, 'test-agent')
  assert.equal(u.flagged_at, undefined)
})

test('an installer named on a warranty, in any capitalisation, is known', async () => {
  const db = setup()
  await signUp('installer@example.com')
  assert.equal(user(db, 'installer@example.com').flagged_at, undefined)
})

test("the bot's addresses are flagged: scattered Gmail dots, unknown to us", async () => {
  const db = setup()
  await signUp('j.o.h.n.s.m.i.t.h.7@gmail.com')
  const u = user(db, 'j.o.h.n.s.m.i.t.h.7@gmail.com')
  assert.ok(u.flagged_at)
  assert.deepEqual(u.flag_reasons, ['dotted_gmail', 'unknown_email'])
})

test('a second account for the same Gmail inbox is flagged', async () => {
  const db = setup()
  await signUp('johnsmith7@gmail.com')
  await signUp('john.smith7+pro@googlemail.com')
  assert.ok(user(db, 'john.smith7+pro@googlemail.com').flag_reasons.includes('same_inbox'))
})

test('the third sign-up from one IP in a day is flagged', async () => {
  const db = setup()
  const ip = freshIp()
  for (const e of ['a@one.example', 'b@two.example', 'c@three.example']) await signUp(e, {}, ip)
  assert.ok(!(user(db, 'b@two.example').flag_reasons ?? []).includes('same_ip'))
  assert.ok(user(db, 'c@three.example').flag_reasons.includes('same_ip'))
})

test('the fifth sign-up across the site within an hour is flagged', async () => {
  const db = setup()
  for (let i = 1; i <= 5; i++) await signUp(`burst${i}@shop${i}.example`)
  assert.ok(!(user(db, 'burst4@shop4.example').flag_reasons ?? []).includes('burst'))
  assert.ok(user(db, 'burst5@shop5.example').flag_reasons.includes('burst'))
})

test('a sign-in link request that creates an account is flagged the same way; one for an existing account is not recorded again', async () => {
  const db = setup()
  await askForLink('x.y.z.w@gmail.com', {}, '192.0.2.10')
  const u = user(db, 'x.y.z.w@gmail.com')
  assert.deepEqual(u.flag_reasons, ['dotted_gmail', 'unknown_email'])
  assert.equal(u.signup_ip, '192.0.2.10')
  u.last_magic_link_at = null // past the one-minute cooldown
  await askForLink('x.y.z.w@gmail.com', {}, '192.0.2.99')
  assert.equal(user(db, 'x.y.z.w@gmail.com').signup_ip, '192.0.2.10')
})

test('a sign-up still goes through when the flag columns are missing (before migration 034)', async () => {
  const db = setup()
  db.hooks.before.push(({ table, op, query }) => {
    if (table === 'pro_users' && op === 'update' && 'signup_ip' in query.payload) throw Object.assign(new Error('column "signup_ip" does not exist'), { code: '42703' })
  })
  const res = await signUp('late@shop.example')
  assert.equal(res.status, 200)
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['late@shop.example'])
})

test('Gmail helpers', () => {
  assert.equal(gmailInbox('J.Ohn.Smith+x@GoogleMail.com'), 'johnsmith@gmail.com')
  assert.equal(gmailInbox('john@outlook.com'), null)
  assert.equal(hasScatteredDots('john.smith@gmail.com'), false)
  assert.equal(hasScatteredDots('john.m.smith@gmail.com'), false)
  assert.equal(hasScatteredDots('j.ohn.sm.ith@gmail.com'), true)
  assert.equal(hasScatteredDots('k..lynn@gmail.com'), true)
  assert.equal(hasScatteredDots('a.b.c.d@company.com'), false)
})
