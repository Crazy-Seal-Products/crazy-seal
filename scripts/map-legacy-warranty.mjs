/**
 * Map legacy Gravity Forms warranty registrations (form 4) from the raw
 * archive (legacy_gf_entries) into the structured warranty_registrations
 * table, so they appear in /admin/warranty and get certificate pages.
 *
 * Safe to re-run: entries whose gf_entry_id already exists in
 * warranty_registrations are skipped.
 *
 * Usage:
 *   source .env.local   (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY)
 *   node scripts/map-legacy-warranty.mjs            # dry run: shows mapping + samples
 *   node scripts/map-legacy-warranty.mjs --apply    # actually insert
 *
 * Options:
 *   --form-id <n>   Gravity Forms form id (default 4)
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. source .env.local)')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const FORM_ID = Number(args[args.indexOf('--form-id') + 1]) || 4

/**
 * GF entry exports use the field *labels* as column headers. Match them
 * loosely so small label edits over the years still map. First match wins.
 */
const FIELD_PATTERNS = {
  first_name: [/^name \(first\)$/i, /^first name$/i, /^first$/i],
  last_name: [/^name \(last\)$/i, /^last name$/i, /^last$/i],
  full_name: [/^name$/i],
  email: [/^email$/i, /^email address$/i],
  phone: [/^phone$/i, /^phone number$/i],
  customer_details: [/customer details/i],
  order_number: [/^order number$/i, /order #/i],
  order_number_alt: [/crazy seal order number/i, /order number/i],
  project_type: [/project type/i, /describes your project/i],
  rv_length: [/how long is your rv/i, /rv length/i],
  square_footage: [/square footage/i],
  install_type: [/how was your kit installed/i, /installed\?$/i],
  installer_name: [/installer'?s? name/i],
  installer_phone: [/installer'?s? phone/i],
  installer_email: [/installer'?s? email/i],
  experience_notes: [/experience with crazy seal/i, /note about your experience/i],
  contractor_notes: [/contractor notes/i],
  photo_display_consent: [/display.*photos|photos.*display|show(ing)? off your work/i],
}

function buildMapping(sampleEntries) {
  // Collect every header seen across the sample
  const headers = new Set()
  for (const entry of sampleEntries) {
    Object.keys(entry.entry_data).forEach((h) => headers.add(h))
  }

  const mapping = {} // our field -> header
  const used = new Set()
  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      const header = [...headers].find((h) => !used.has(h) && pattern.test(h.trim()))
      if (header) {
        mapping[field] = header
        used.add(header)
        break
      }
    }
  }
  const unmapped = [...headers].filter(
    (h) => !used.has(h) && !/^(entry id|entry date|date created|user ip|source url|user agent|payment|transaction|created by)/i.test(h)
  )
  return { mapping, unmapped }
}

function toRegistration(entry, mapping) {
  const d = entry.entry_data
  const get = (field) => {
    const v = mapping[field] ? d[mapping[field]] : null
    return v && String(v).trim() ? String(v).trim() : null
  }

  const name = [get('first_name'), get('last_name')].filter(Boolean).join(' ')
    || get('full_name')
    || get('email')
    || `GF Entry #${entry.gf_entry_id}`

  const installRaw = (get('install_type') || '').toLowerCase()
  const install_type = !installRaw ? null
    : /self|diy/.test(installRaw) ? 'diy'
    : 'contractor'

  const detailLines = [
    get('customer_details'),
    get('project_type') ? `Project type: ${get('project_type')}` : null,
    get('rv_length') ? `RV length: ${get('rv_length')} ft` : null,
    get('square_footage') ? `Square footage: ${get('square_footage')}` : null,
  ].filter(Boolean)

  return {
    name,
    email: (get('email') || 'unknown@legacy.import').toLowerCase(),
    phone: get('phone'),
    customer_details: detailLines.join('\n') || null,
    order_number: get('order_number') || get('order_number_alt'),
    install_type,
    installer_name: get('installer_name'),
    installer_phone: get('installer_phone'),
    installer_email: get('installer_email'),
    photo_urls: entry.file_urls || [],
    experience_notes: get('experience_notes'),
    contractor_notes: get('contractor_notes'),
    warranty_consent: true,
    photo_display_consent: true,
    gf_entry_id: entry.gf_entry_id,
    wp_form_id: entry.gf_form_id,
    status: 'approved',
    admin_notes: `Imported from Gravity Forms entry #${entry.gf_entry_id}`,
    created_at: entry.submitted_at || entry.imported_at,
  }
}

async function fetchAll(table, filters) {
  const PAGE = 1000
  const rows = []
  for (let from = 0; ; from += PAGE) {
    let query = supabase.from(table).select(filters.select).range(from, from + PAGE - 1)
    if (filters.eq) query = query.eq(...filters.eq)
    if (filters.notNull) query = query.not(filters.notNull, 'is', null)
    const { data, error } = await query
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...data)
    if (data.length < PAGE) break
  }
  return rows
}

async function main() {
  console.log(`Mapping legacy form ${FORM_ID} entries into warranty_registrations`)
  if (!APPLY) console.log('DRY RUN — pass --apply to insert\n')

  const entries = await fetchAll('legacy_gf_entries', {
    select: 'gf_entry_id, gf_form_id, entry_data, file_urls, submitted_at, imported_at',
    eq: ['gf_form_id', FORM_ID],
  })
  console.log(`${entries.length} legacy entries found for form ${FORM_ID}`)
  if (!entries.length) {
    console.log('Nothing to map. Did you run scripts/import-legacy-gf.mjs first?')
    return
  }

  const existing = await fetchAll('warranty_registrations', {
    select: 'gf_entry_id',
    notNull: 'gf_entry_id',
  })
  const existingIds = new Set(existing.map((r) => r.gf_entry_id))
  console.log(`${existingIds.size} already mapped (will be skipped)`)

  const { mapping, unmapped } = buildMapping(entries.slice(0, 50))
  console.log('\nResolved field mapping:')
  for (const [field, header] of Object.entries(mapping)) {
    console.log(`  ${field.padEnd(22)} <- "${header}"`)
  }
  if (unmapped.length) {
    console.log('\nUnmapped export columns (review — add patterns if any matter):')
    unmapped.forEach((h) => console.log(`  "${h}"`))
  }

  const toInsert = entries
    .filter((e) => !existingIds.has(e.gf_entry_id))
    .map((e) => toRegistration(e, mapping))

  console.log(`\n${toInsert.length} entries to insert`)
  if (!toInsert.length) return

  if (!APPLY) {
    console.log('\nSample of first 3 mapped registrations:')
    console.log(JSON.stringify(toInsert.slice(0, 3), null, 2))
    console.log('\nDry run complete. Re-run with --apply to insert.')
    return
  }

  const BATCH = 200
  let inserted = 0
  let failed = 0
  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)
    const { error } = await supabase.from('warranty_registrations').insert(batch)
    if (error) {
      console.error(`\nBatch ${i}-${i + BATCH} error: ${error.message}`)
      failed += batch.length
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r  Inserted ${inserted} / ${toInsert.length}`)
  }
  console.log(`\nDone: ${inserted} inserted, ${failed} failed`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
