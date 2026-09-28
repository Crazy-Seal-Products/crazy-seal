/**
 * Map legacy Gravity Forms warranty transfers (form 14) from the raw archive
 * (legacy_gf_entries) into the structured warranty_transfers table, so they
 * appear in /admin/warranty > Transfers.
 *
 * Links each transfer to its warranty_registration by order number when the
 * match is unambiguous. Safe to re-run: entries whose gf_entry_id already
 * exists in warranty_transfers are skipped.
 *
 * Usage:
 *   source .env.local
 *   node scripts/map-legacy-transfers.mjs            # dry run
 *   node scripts/map-legacy-transfers.mjs --apply
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. source .env.local)')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const APPLY = process.argv.includes('--apply')
const FORM_ID = 14

function pick(data, patterns) {
  for (const pattern of patterns) {
    const key = Object.keys(data).find((k) => pattern.test(k.trim()))
    if (key && String(data[key]).trim()) return String(data[key]).trim()
  }
  return null
}

async function main() {
  console.log(`Mapping legacy form ${FORM_ID} entries into warranty_transfers`)
  if (!APPLY) console.log('DRY RUN — pass --apply to insert\n')

  const { data: entries, error } = await supabase
    .from('legacy_gf_entries')
    .select('gf_entry_id, entry_data, submitted_at, imported_at')
    .eq('gf_form_id', FORM_ID)
    .order('gf_entry_id')
  if (error) throw new Error(error.message)
  console.log(`${entries.length} legacy transfer entries found`)

  const { data: existing } = await supabase
    .from('warranty_transfers')
    .select('gf_entry_id')
    .not('gf_entry_id', 'is', null)
  const existingIds = new Set((existing || []).map((r) => r.gf_entry_id))
  console.log(`${existingIds.size} already mapped (will be skipped)`)

  const rows = []
  for (const entry of entries.filter((e) => !existingIds.has(e.gf_entry_id))) {
    const d = entry.entry_data
    const newFirst = pick(d, [/^name of new owner \(first\)$/i])
    const newLast = pick(d, [/^name of new owner \(last\)$/i])
    const origFirst = pick(d, [/^name of original owner \(first\)$/i])
    const origLast = pick(d, [/^name of original owner \(last\)$/i])
    const newOwnerEmail = pick(d, [/^email$/i])
    const orderNumber = pick(d, [/^order number$/i])

    // Link to the registration when exactly one matches the order number
    let registrationId = null
    if (orderNumber) {
      const { data: regs } = await supabase
        .from('warranty_registrations')
        .select('id')
        .eq('order_number', orderNumber)
        .limit(2)
      if (regs?.length === 1) registrationId = regs[0].id
    }

    rows.push({
      new_owner_name: [newFirst, newLast].filter(Boolean).join(' ') || newOwnerEmail || `GF Entry #${entry.gf_entry_id}`,
      new_owner_email: (newOwnerEmail || 'unknown@legacy.import').toLowerCase(),
      new_owner_phone: pick(d, [/^phone$/i]),
      original_owner_name: [origFirst, origLast].filter(Boolean).join(' ') || null,
      original_owner_email: pick(d, [/^email of original owner$/i])?.toLowerCase() || null,
      order_number: orderNumber,
      transfer_notes: pick(d, [/quick note describing the warranty transfer/i]),
      warranty_registration_id: registrationId,
      gf_entry_id: entry.gf_entry_id,
      status: 'processed',
      created_at: entry.submitted_at || entry.imported_at,
    })
  }

  console.log(`${rows.length} transfers to insert (${rows.filter((r) => r.warranty_registration_id).length} linked to a registration by order number)`)
  if (!rows.length) return

  if (!APPLY) {
    console.log('\nSample of first 2:')
    console.log(JSON.stringify(rows.slice(0, 2), null, 2))
    console.log('\nDry run complete. Re-run with --apply to insert.')
    return
  }

  const { error: insertError } = await supabase.from('warranty_transfers').insert(rows)
  if (insertError) throw new Error(insertError.message)
  console.log(`Done: ${rows.length} inserted`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
