import { createReadStream } from 'fs'
import { parse } from 'csv-parse'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. source .env.local)')
  process.exit(1)
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const records = []
    createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true, relax_column_count: true, bom: true }))
      .on('data', (row) => records.push(row))
      .on('end', () => resolve(records))
      .on('error', reject)
  })
}

function clean(val) {
  if (!val || val.trim() === '') return null
  return val.trim()
}

function toBool(val) {
  if (!val) return null
  const v = val.trim().toLowerCase()
  if (v === 'yes' || v === 'checked') return true
  if (v === 'no' || v === 'not checked') return false
  return null
}

async function importContactLeads() {
  console.log('--- Importing Contact Us Leads ---')
  const rows = await readCSV('/Users/jordanbuckingham/Downloads/contact-us-2026-04-04.csv')
  console.log(`Parsed ${rows.length} lead rows`)

  const BATCH = 500
  let inserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(r => {
      const first = clean(r['Name (First)'])
      const last = clean(r['Name (Last)'])
      if (!first && !last) return null
      const email = clean(r['Email'])
      if (!email) return null

      return {
        name: [first, last].filter(Boolean).join(' '),
        email: email.toLowerCase(),
        phone: clean(r['Phone']),
        street_address: clean(r['Street Address (Not required but helpful) (Street Address)']),
        city: clean(r['City, State, Zip Code (Required) (City)']),
        state: clean(r['City, State, Zip Code (Required) (State / Province)']),
        zip_code: clean(r['City, State, Zip Code (Required) (ZIP / Postal Code)']),
        rv_year: clean(r['Year of Manufacture']),
        rv_make: clean(r['RV Make']),
        rv_model: clean(r['RV Model']),
        rv_length: clean(r['How long is your RV? (FT)']),
        roof_type: clean(r['What type of RV roof do you have?']),
        has_roof_damage: toBool(r['Do you have roof damage or an existing leak?']),
        how_heard: clean(r['How did you hear about us?']),
        travels_south: clean(r['Do you travel to a Southern state anytime November - April?']),
        travel_states: clean(r['What state / states might you travel to?']),
        message: clean(r['Additional thoughts and comments:']),
        photo_url: clean(r['If you would like to share a photo of your RV with us, you can upload it here.']),
        texting_consent: toBool(r['Texting (Consent)']),
        source_page: 'wordpress-import',
        source_url: clean(r['Source Url']),
        user_agent: clean(r['User Agent']),
        user_ip: clean(r['User IP']),
        wp_entry_id: clean(r['Entry Id']),
        created_at: clean(r['Entry Date']) || new Date().toISOString(),
      }
    }).filter(Boolean)

    skipped += (rows.slice(i, i + BATCH).length - batch.length)

    if (batch.length === 0) continue

    const { error } = await supabase.from('leads').insert(batch)
    if (error) {
      console.error(`\nBatch ${i}-${i + BATCH} error:`, error.message)
      errors++
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r  Inserted ${inserted} / ${rows.length}`)
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped, ${errors} batch errors`)
}

importContactLeads().catch(console.error)
