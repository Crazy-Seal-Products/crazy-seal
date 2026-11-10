// Import the dealer list ("CS - Dealer List.xlsx") into contractors
// (supabase/migrations/021_contractors.sql).
//
// Every tab with a "Type" header row is read; Type "RV" is the rv segment and
// "Comm" is commercial. A row is matched on import_key (segment, email or
// name, home state), so re-running updates the list fields in place, except a
// field an admin changed (edited_fields), which it leaves alone. A row with no
// match is linked to a contractor with the same email that no other sheet row
// owns (one an admin added by hand, say); one whose company, or name and
// state, is already listed (another contact there, or the same dealer under a
// new email) is held for an admin to review instead of getting a second page. Only otherwise does it add a contractor, with a
// page address no one has or used to have (contractor_redirects). It never
// changes a page address or the white-label settings, and it never deletes:
// rows no longer on the sheet are listed at the end instead. The rules are
// modeled in docs/statecharts/contractor-records.
//
// Run:
//   node --env-file=.env.local scripts/import-contractors.mjs "path/to/CS - Dealer List.xlsx"
//
// Uses a throwaway install of `read-excel-file` so it isn't added to package.json.
import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node --env-file=.env.local scripts/import-contractors.mjs <dealer-list.xlsx>')
  process.exit(1)
}

const dir = mkdtempSync(join(tmpdir(), 'cs-xlsx-'))
// One command string through the shell, so npm (npm.cmd on Windows) is found everywhere.
const install = spawnSync(`npm install --prefix "${dir}" read-excel-file@5 --silent`, { stdio: 'inherit', shell: true })
if (install.status !== 0) process.exit(install.status ?? 1)
const reader = await import(pathToFileURL(createRequire(join(dir, 'x.js')).resolve('read-excel-file/node')).href)

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

const text = (v) => (v === null || v === undefined ? '' : String(v).trim())
const orNull = (v) => text(v) || null

function phone(v) {
  const raw = text(v)
  const digits = raw.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')
  return digits.length === 10 ? `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` : raw || null
}

function slugify(v) {
  return text(v)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '')
}

function serviceMode(notes, company) {
  const t = `${notes} ${company}`.toLowerCase()
  const shop = /\bshops?\b/.test(t)
  const mobile = /\bmobile\b/.test(t)
  return shop && mobile ? 'both' : shop ? 'shop' : mobile ? 'mobile' : null
}

const COLUMNS = {
  type: 'Type',
  first: 'First Name',
  goesBy: 'Goes By',
  last: 'Last Name',
  company: 'Company',
  phone1: 'Phone #1',
  phone2: 'Phone #2',
  email: 'Email',
  street: 'Street',
  city: 'City',
  zip: 'Zip Code',
  notes: 'Notes',
}

const rows = []
for (const sheet of await reader.readSheetNames(file)) {
  const cells = await reader.default(file, { sheet })
  const headerAt = cells.findIndex((r) => text(r[0]) === COLUMNS.type)
  if (headerAt < 0) continue
  const header = cells[headerAt].map(text)
  const at = (name) => header.indexOf(name)
  const states = header.map((h, i) => (/^ST #\d+$/.test(h) ? i : -1)).filter((i) => i >= 0)
  for (const r of cells.slice(headerAt + 1)) {
    const get = (key) => r[at(COLUMNS[key])]
    if (!text(get('first')) && !text(get('company'))) continue
    const segment = /^comm/i.test(text(get('type'))) ? 'commercial' : 'rv'
    const serviceStates = [...new Set(states.map((i) => text(r[i]).toUpperCase()).filter((s) => /^[A-Z]{2}$/.test(s)))]
    const zip = text(get('zip')).replace(/\D/g, '')
    const email = text(get('email')).toLowerCase() || null
    const name = [text(get('first')), text(get('last'))].filter(Boolean).join(' ')
    rows.push({
      sheet,
      key: `${segment}:${(email ?? name).toLowerCase()}:${(serviceStates[0] ?? '').toLowerCase()}`,
      record: {
        segment,
        company: orNull(get('company')),
        first_name: orNull(get('first')),
        goes_by: orNull(get('goesBy')),
        last_name: orNull(get('last')),
        phone: phone(get('phone1')),
        phone_alt: phone(get('phone2')),
        email,
        street: orNull(get('street')),
        city: orNull(get('city')),
        state: serviceStates[0] ?? null,
        zip: zip ? zip.padStart(5, '0').slice(0, 5) : null,
        service_states: serviceStates,
        service_mode: serviceMode(text(get('notes')), text(get('company'))),
        notes: orNull(get('notes')),
      },
    })
  }
}

const CONTRACTOR_COLUMNS = 'id, slug, import_key, email, company, first_name, last_name, state, edited_fields'
const { data: existing, error: readError } = await supabase.from('contractors').select(CONTRACTOR_COLUMNS)
if (readError) throw new Error(readError.message)
const { data: redirects, error: redirectError } = await supabase.from('contractor_redirects').select('slug')
if (redirectError) throw new Error(redirectError.message)
const byKey = new Map(existing.map((c) => [c.import_key, c]))
// Addresses no new contractor may take: those in use and those that redirect to someone.
const taken = new Set([...existing.map((c) => c.slug), ...redirects.map((r) => r.slug)])
const sheetKeys = new Set(rows.map((r) => r.key))
const sameText = (a, b) => Boolean(a && b) && text(a).toLowerCase() === text(b).toLowerCase()

function uniqueSlug(rec) {
  const base = slugify(rec.company) || slugify([rec.goes_by || rec.first_name, rec.last_name].join(' ')) || 'contractor'
  const tries = [base, `${base}-${slugify(rec.goes_by || rec.first_name)}`, `${base}-${slugify(rec.city)}`]
  for (let n = 2; tries.length < 20; n++) tries.push(`${base}-${n}`)
  const slug = tries.find((s) => s && !s.endsWith('-') && !taken.has(s))
  taken.add(slug)
  return slug
}

// The sheet's fields for a contractor, without the ones an admin has changed.
function sheetFields(contractor, record) {
  const edited = new Set(contractor.edited_fields ?? [])
  return Object.fromEntries(Object.entries(record).filter(([field]) => !edited.has(field)))
}

let inserted = 0
let updated = 0
let linked = 0
const held = []
const seen = new Set()
for (const { key, record } of rows) {
  if (seen.has(key)) {
    console.warn(`Skipped a second row for ${key}`)
    continue
  }
  seen.add(key)
  const now = new Date().toISOString()
  const found = byKey.get(key)
  if (found) {
    const { error } = await supabase.from('contractors').update({ ...sheetFields(found, record), updated_at: now }).eq('id', found.id)
    if (error) throw new Error(`${key}: ${error.message}`)
    updated++
    continue
  }
  // Same person, no key of their own on this sheet: link this row to them.
  const sameEmail = existing.find((c) => sameText(c.email, record.email) && !(c.import_key && sheetKeys.has(c.import_key)))
  if (sameEmail) {
    const { error } = await supabase.from('contractors').update({ ...sheetFields(sameEmail, record), import_key: key, updated_at: now }).eq('id', sameEmail.id)
    if (error) throw new Error(`${key}: ${error.message}`)
    byKey.delete(sameEmail.import_key)
    sameEmail.import_key = key
    byKey.set(key, sameEmail)
    linked++
    continue
  }
  // The same company, or the same name in the same state, already has a page: another contact
  // there, or this dealer under a new email. An admin decides.
  const lookalike = existing.find(
    (c) => sameText(c.company, record.company) || (sameText(c.first_name, record.first_name) && sameText(c.last_name, record.last_name) && sameText(c.state, record.state)),
  )
  if (lookalike) {
    held.push(`${key} (looks like /contractor/${lookalike.slug})`)
    continue
  }
  const slug = uniqueSlug(record)
  const { data: added, error } = await supabase
    .from('contractors')
    .insert({ ...record, slug, import_key: key })
    .select(CONTRACTOR_COLUMNS)
    .single()
  if (error) throw new Error(`${key}: ${error.message}`)
  existing.push(added)
  byKey.set(key, added)
  inserted++
}

const gone = existing.filter((c) => c.import_key && !seen.has(c.import_key))
console.log(`${rows.length} rows read: ${inserted} added, ${updated} updated, ${linked} linked to an existing contractor, ${held.length} held for review`)
if (held.length)
  console.log(
    `Held for review. If it's the same dealer under a new email, change the email on their page in the admin and the next import links them; if it's someone else, add them by hand:\n  ${held.join('\n  ')}`,
  )
if (gone.length) console.log(`On the site but not on this sheet (left as they are): ${gone.map((c) => c.slug).join(', ')}`)
