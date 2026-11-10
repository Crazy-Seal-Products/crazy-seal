// Replays the ContractorRecords statechart's former bug paths against Crazy Seal's real code (the
// uncommitted working tree, 2026-11-10, after the fixes): scripts/import-contractors.mjs,
// createContractor and saveContractor, and getPublicContractor / currentAddressFor, the lookups
// behind /contractor/<page address>. Each test now asserts the rule holds.
// Run with: node --import ./contractor-records.register.mjs --test contractor-records.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createFakeDb } from '../fake-supabase.mjs'

const { createContractor, saveContractor } = await import('@/lib/portal/admin/contractor-actions')
const { currentAddressFor, getPublicContractor } = await import('@/lib/contractors/data')
const script = pathToFileURL(path.resolve(import.meta.dirname, '../../../../scripts/import-contractors.mjs')).href

// The import is a script that does its work when it loads, so each run loads a fresh copy. It
// returns what the script printed.
let runs = 0
async function runImport() {
  process.argv[2] = 'CS - Dealer List.xlsx'
  const log = console.log
  const printed = []
  console.log = (...args) => printed.push(args.join(' '))
  try {
    await import(`${script}?run=${++runs}`)
  } finally {
    console.log = log
  }
  return printed.join('\n')
}

// The dealer list's rows for the two contacts at Fiberglass Worx (the real list has both).
const ahmed = (over = {}) => ({
  Type: 'RV', 'First Name': 'Ahmed', 'Last Name': 'Hussin', Company: 'Fiberglass Worx', 'Phone #1': 3035550101,
  Email: 'ahmed@fiberglassworx.com', City: 'Commerce City', 'ST #1': 'CO', 'Zip Code': 80022, ...over,
})
const jeffRow = { ...ahmed(), 'First Name': 'Jeff', 'Last Name': 'Vickery', 'Phone #1': 3035550102, Email: 'jeff@fiberglassworx.com' }

function setup(sheet) {
  const db = createFakeDb({
    tables: { contractors: [], contractor_redirects: [], zip_centroids: [] },
    unique: { contractors: [['slug']], contractor_redirects: [['slug']] },
  })
  // The columns' defaults in 021_contractors.sql and 023_contractor_fixes.sql.
  db.hooks.before.push(({ table, op, query }) => {
    if (table === 'contractors' && op === 'insert')
      query.payload = query.payload.map((r) => ({ is_listed: true, theme: 'seal', service_states: [], edited_fields: [], import_key: null, ...r }))
  })
  globalThis.__cs = { db, sheet }
  return db
}

// What the admin editor sends for a row, with some fields changed.
const input = (r, over = {}) => ({
  slug: r.slug ?? '', isListed: r.is_listed ?? true, segment: r.segment ?? 'rv', company: r.company ?? '',
  firstName: r.first_name ?? '', goesBy: r.goes_by ?? '', lastName: r.last_name ?? '', phone: r.phone ?? '', phoneAlt: r.phone_alt ?? '',
  email: r.email ?? '', street: r.street ?? '', city: r.city ?? '', state: r.state ?? '', zip: r.zip ?? '', serviceStates: '',
  serviceMode: r.service_mode ?? '', notes: r.notes ?? '', theme: r.theme ?? 'seal', primary: r.color_primary ?? '',
  accent: r.color_accent ?? '', logoUrl: r.logo_url ?? '', tagline: r.tagline ?? '', ...over,
})

test("AdminEditsStick: a later import keeps an admin's change and still updates the other fields", async () => {
  const db = setup([ahmed()])
  await runImport()
  const [row] = db.tables.contractors
  assert.deepEqual(await saveContractor(row.id, input(row, { phone: '303-555-0199' })), { ok: true, message: 'Saved' })
  assert.deepEqual(db.tables.contractors[0].edited_fields, ['phone'], 'only the field the admin changed is marked')
  globalThis.__cs.sheet = [ahmed({ City: 'Denver' })]
  await runImport()
  assert.equal(db.tables.contractors[0].phone, '(303) 555-0199', "the admin's phone stays")
  assert.equal(db.tables.contractors[0].city, 'Denver', 'a field the admin never touched still follows the sheet')
})

test("OnePagePerDealer: when the sheet row's email changes, the import holds it until an admin updates the email, then links it", async () => {
  const db = setup([ahmed()])
  await runImport()
  globalThis.__cs.sheet = [ahmed({ Email: 'ahmed@fwx-roofing.com' })]
  assert.match(await runImport(), /1 held for review/)
  assert.deepEqual(db.tables.contractors.map((r) => r.slug), ['fiberglass-worx'], 'no second page')
  const [row] = db.tables.contractors
  assert.equal((await saveContractor(row.id, input(row, { email: 'ahmed@fwx-roofing.com' }))).ok, true)
  assert.match(await runImport(), /1 linked to an existing contractor/)
  assert.deepEqual(db.tables.contractors.map((r) => r.slug), ['fiberglass-worx'])
  assert.equal(db.tables.contractors[0].import_key, 'rv:ahmed@fwx-roofing.com:co', 'the next import matches on its own')
})

test('OnePagePerDealer: a dealer with no company under a new email is held too, not given a second page', async () => {
  const db = setup([{ Type: 'RV', 'First Name': 'Aaron', 'Last Name': 'Johnson', Email: 'aaron@example.com', City: 'Summerdale', 'ST #1': 'AL' }])
  await runImport()
  globalThis.__cs.sheet = [{ Type: 'RV', 'First Name': 'Aaron', 'Last Name': 'Johnson', Email: 'aaron.j@example.com', City: 'Summerdale', 'ST #1': 'AL' }]
  assert.match(await runImport(), /1 held for review/)
  assert.equal(db.tables.contractors.length, 1)
})

test('OnePagePerDealer: the import links a dealer an admin added by hand instead of adding a second page', async () => {
  const db = setup([ahmed()])
  const added = await createContractor(
    input({}, { company: 'Fiberglass Worx', firstName: 'Ahmed', lastName: 'Hussin', email: 'ahmed@fiberglassworx.com', phone: '3035550188', city: 'Commerce City', state: 'CO', zip: '80022' }),
  )
  assert.equal(added.ok, true)
  await runImport()
  assert.equal(db.tables.contractors.length, 1)
  assert.equal(db.tables.contractors[0].import_key, 'rv:ahmed@fiberglassworx.com:co', 'the sheet row now matches the hand-added page')
  assert.equal(db.tables.contractors[0].phone, '(303) 555-0188', 'what the admin typed stays')
})

test('SharedLinksKeepWorking: a renamed address keeps leading to the contractor and is never given away', async () => {
  const db = setup([ahmed()])
  await runImport()
  const [row] = db.tables.contractors
  assert.equal((await getPublicContractor('fiberglass-worx'))?.contact, 'Ahmed Hussin', 'the address someone shared')
  assert.deepEqual(await saveContractor(row.id, input(row, { slug: 'fiberglass-worx-co' })), { ok: true, message: 'Saved' })
  assert.equal(await currentAddressFor('fiberglass-worx'), 'fiberglass-worx-co', 'the shared address redirects to the new one')
  const typed = await createContractor(input({}, { slug: 'fiberglass-worx', company: 'Fiberglass Worx', firstName: 'Jeff', lastName: 'Vickery', state: 'CO' }))
  assert.equal(typed.ok, false, 'an address that redirects is taken')
  const jeff = await createContractor(input({}, { company: 'Fiberglass Worx', firstName: 'Jeff', lastName: 'Vickery', email: 'jeff@fiberglassworx.com', state: 'CO' }))
  assert.equal(jeff.ok, true)
  assert.notEqual(db.tables.contractors.find((r) => r.id === jeff.id).slug, 'fiberglass-worx')
  assert.equal(await currentAddressFor('fiberglass-worx'), 'fiberglass-worx-co', "the shared link still opens Ahmed's page")
  // Renaming back to an address of their own takes it back.
  assert.deepEqual(await saveContractor(row.id, input({ ...row, slug: 'fiberglass-worx-co' }, { slug: 'fiberglass-worx' })), { ok: true, message: 'Saved' })
  assert.equal((await getPublicContractor('fiberglass-worx'))?.contact, 'Ahmed Hussin')
  assert.equal(await currentAddressFor('fiberglass-worx-co'), 'fiberglass-worx')
})

test("the fix's cost: a new contact at a listed company is held for review, not given a page", async () => {
  const db = setup([ahmed()])
  await runImport()
  globalThis.__cs.sheet = [ahmed(), jeffRow]
  const printed = await runImport()
  assert.match(printed, /1 held for review/)
  assert.equal(db.tables.contractors.length, 1)
})

test('one email listed in two states keeps two pages (the email link only takes a row no sheet row owns)', async () => {
  const db = setup([
    { Type: 'RV', 'First Name': 'Bill', 'Last Name': 'Perry', Company: 'The Mobile RV Roofer', Email: 'mobilervroofer@example.com', City: 'Tucson', 'ST #1': 'AZ' },
    { Type: 'RV', 'First Name': 'Bill', 'Last Name': 'Peery', Company: 'West Texas Friendly RV Park', Email: 'mobilervroofer@example.com', City: 'Big Spring', 'ST #1': 'TX' },
  ])
  await runImport()
  await runImport()
  assert.deepEqual(db.tables.contractors.map((r) => r.slug).sort(), ['the-mobile-rv-roofer', 'west-texas-friendly-rv-park'])
})
