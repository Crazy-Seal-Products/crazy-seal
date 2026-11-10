// Replays the quote request model's former bug paths against Crazy Seal's real code (uncommitted
// working tree, 2026-11-10, after the fix): the quote route, recordQuote / notifyQuote /
// resendUnsentQuotes and the cron route, with a fake database and fake Gmail. Each test asserts the
// rule now holds.
// Run with: node --import ./register-quote-requests.mjs --test quote-requests.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import { createFakeDb } from '../fake-supabase.mjs'

const { POST } = await import('@/app/api/contractors/quote/route')
const { GET: cron } = await import('@/app/api/cron/contractor-quotes/route')
const { cleanQuote, notifyQuote, recordQuote, resendUnsentQuotes } = await import('@/lib/contractors/quote')

const TEAM = process.env.LEAD_NOTIFICATION_EMAIL || 'info@crazyseal.com'

function setup() {
  const db = createFakeDb({
    tables: {
      contractors: [
        { id: 'c-1', slug: 'roadside-rv-repair', segment: 'rv', company: 'Roadside RV Repair', first_name: 'Chase', goes_by: null, last_name: 'Stiver', email: 'chase@example.com', is_listed: true },
      ],
      contractor_redirects: [], leads: [], visitors: [], sessions: [], journey_events: [],
    },
  })
  // leads.created_at defaults to now() in the database; an hour ago here, so the retry picks them up.
  db.hooks.before.push(({ table, op, query }) => {
    if (table === 'leads' && op === 'insert') query.payload = query.payload.map((r) => ({ created_at: new Date(Date.now() - 3_600_000).toISOString(), ...r }))
  })
  globalThis.__cs = { db, mail: [], mailFails: false, after: [] }
  // Cloudflare Turnstile's siteverify, the only network call the route makes before saving.
  globalThis.fetch = async () => new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json' } })
  return db
}

const form = (slug) => ({ slug, name: 'Dana Lopez', email: 'dana@example.com', zip: '35007', size: '32', message: 'Leak over the slide-out', turnstile_token: 'ok' })
const send = (slug) =>
  POST(new Request('https://crazyseal.com/api/contractors/quote/', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form(slug)) }))
const runAfter = async () => {
  for (const task of globalThis.__cs.after.splice(0)) await task()
}

test('ListedPagesTakeRequests: a visitor on the page when an admin changes its address still gets through', async () => {
  const db = setup()
  // 1. The visitor opens /contractor/roadside-rv-repair (the form holds that slug).
  // 2. An admin changes the page address; saveContractor keeps the old one as a redirect.
  db.tables.contractors[0].slug = 'roadside-rv'
  db.tables.contractor_redirects.push({ slug: 'roadside-rv-repair', contractor_id: 'c-1' })
  // 3. The visitor sends the form.
  const res = await send('roadside-rv-repair')
  assert.equal(res.status, 200)
  assert.equal(db.tables.leads.length, 1)
  assert.equal(db.tables.leads[0].contractor_id, 'c-1')
  assert.equal(db.tables.leads[0].source_page, '/contractor/roadside-rv', 'filed under the current address')
  await runAfter()
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
})

test('a hidden contractor still turns requests away (that is not this rule)', async () => {
  const db = setup()
  db.tables.contractors[0].is_listed = false
  const res = await send('roadside-rv-repair')
  assert.equal(res.status, 404)
  assert.equal(db.tables.leads.length, 0)
})

test('NoRequestIsLost: when both emails fail, the request is sent again later', async () => {
  const db = setup()
  const recorded = await recordQuote(cleanQuote(form('roadside-rv-repair')), {})
  globalThis.__cs.mailFails = true
  await notifyQuote(recorded)
  assert.equal(globalThis.__cs.mail.length, 0)
  assert.equal(db.tables.leads[0].contractor_notified_at ?? null, null)
  assert.equal(db.tables.leads[0].quote_team_notified_at ?? null, null)
  // Gmail is back; the daily cron (or Send again in the admin) runs.
  globalThis.__cs.mailFails = false
  assert.equal(await resendUnsentQuotes(), 1)
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
  assert.ok(db.tables.leads[0].contractor_notified_at)
  assert.ok(db.tables.leads[0].quote_team_notified_at)
  assert.equal(globalThis.__cs.mail[0].html.includes('Quote request for'), false, "the lead's filing note isn't repeated in the email")
  assert.equal(await resendUnsentQuotes(), 0, 'and it is sent once')
})

const callCron = (headers = {}) => cron(new Request('https://crazyseal.com/api/cron/contractor-quotes/', { headers }))

test('NoRequestIsLost: when the server stops before its after() work, the daily job sends it (no CRON_SECRET needed)', async () => {
  const db = setup()
  const res = await send('roadside-rv-repair')
  assert.equal(res.status, 200)
  globalThis.__cs.after.length = 0 // the server stopped: the queued emails never run
  assert.equal(globalThis.__cs.mail.length, 0)
  delete process.env.CRON_SECRET
  const ran = await callCron()
  assert.deepEqual(await ran.json(), { ok: true, tried: 1 })
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
  assert.ok(db.tables.leads[0].contractor_notified_at)
  assert.deepEqual(await (await callCron()).json(), { ok: true, tried: 0 }, 'calling it again sends nothing')
})

test('anyone can call the job, but it tries each unsent request at most once an hour', async () => {
  const db = setup()
  const recorded = await recordQuote(cleanQuote(form('roadside-rv-repair')), {})
  globalThis.__cs.mailFails = true
  await notifyQuote(recorded)
  const afterFirst = globalThis.__cs.attempts
  assert.deepEqual(await (await callCron()).json(), { ok: true, tried: 1 }, 'the first call tries it')
  assert.equal(globalThis.__cs.attempts, afterFirst + 2, 'the contractor email and the team copy')
  for (let i = 0; i < 5; i++) assert.deepEqual(await (await callCron()).json(), { ok: true, tried: 0 })
  assert.equal(globalThis.__cs.attempts, afterFirst + 2, 'five more calls in the same hour send nothing')
  // An hour later, with Gmail back:
  db.tables.leads[0].quote_last_try_at = new Date(Date.now() - 61 * 60_000).toISOString()
  globalThis.__cs.mailFails = false
  assert.deepEqual(await (await callCron()).json(), { ok: true, tried: 1 })
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
})

test('two calls at once send a request once', async () => {
  setup()
  await recordQuote(cleanQuote(form('roadside-rv-repair')), {})
  const [a, b] = await Promise.all([callCron(), callCron()])
  const tried = (await a.json()).tried + (await b.json()).tried
  assert.equal(tried, 1, 'only the call that claimed the try sends it')
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
})

test('if CRON_SECRET is ever set, only Vercel Cron can call the job', async () => {
  setup()
  process.env.CRON_SECRET = 'replay-secret'
  try {
    assert.equal((await callCron()).status, 401)
    assert.equal((await callCron({ authorization: 'Bearer replay-secret' })).status, 200)
  } finally {
    delete process.env.CRON_SECRET
  }
})

test('Send again in the admin skips the hourly wait', async () => {
  const db = setup()
  const recorded = await recordQuote(cleanQuote(form('roadside-rv-repair')), {})
  db.tables.leads[0].quote_last_try_at = new Date().toISOString() // the job just tried it
  assert.equal(await resendUnsentQuotes(), 0)
  assert.equal(await resendUnsentQuotes({ leadId: recorded.leadId }), 1)
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), ['chase@example.com', TEAM])
})

test('a request the team was told about is not sent again (the team passes it on)', async () => {
  const db = setup()
  db.tables.contractors[0].email = null
  const recorded = await recordQuote(cleanQuote(form('roadside-rv-repair')), {})
  await notifyQuote(recorded)
  assert.deepEqual(globalThis.__cs.mail.map((m) => m.to), [TEAM])
  assert.ok(db.tables.leads[0].quote_team_notified_at)
  assert.equal(await resendUnsentQuotes(), 0)
})
