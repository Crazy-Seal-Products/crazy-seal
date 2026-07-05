/**
 * Import legacy Gravity Forms entries into Supabase.
 *
 * Every entry is archived as raw JSON in `legacy_gf_entries` with file URLs
 * rewritten to media.crazyseal.com. Known forms can additionally be mapped
 * into the structured tables (warranty_registrations, etc.) with a second
 * pass once we see the export headers.
 *
 * Usage:
 *   source .env.local (or export NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY)
 *   node scripts/import-legacy-gf.mjs --file ~/Downloads/warranty-entries.csv --form-id 4 --title "Warranty Registration"
 *
 * The CSV must be a Gravity Forms entry export (Forms -> Import/Export ->
 * Export Entries) with "Entry ID" and "Entry Date" columns included.
 */
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

const args = process.argv.slice(2)
function arg(name) {
  const idx = args.indexOf(`--${name}`)
  return idx >= 0 ? args[idx + 1] : null
}

const FILE = arg('file')
const FORM_ID = arg('form-id')
const TITLE = arg('title') || `Form ${FORM_ID}`

if (!FILE || !FORM_ID) {
  console.error('Usage: node scripts/import-legacy-gf.mjs --file <export.csv> --form-id <n> [--title "Form name"]')
  process.exit(1)
}

// Matches the S3 layout: gravity-forms/{form-hash}/YYYY/MM/file and
// site-assets/wp-media/YYYY/MM/file
function rewriteUrl(url) {
  if (!url) return url
  let out = url.trim()
  out = out.replace(
    /https?:\/\/(www\.)?crazyseal\.com\/wp-content\/uploads\/gravity_forms\//i,
    'https://media.crazyseal.com/gravity-forms/'
  )
  out = out.replace(
    /https?:\/\/(www\.)?crazyseal\.com\/wp-content\/uploads\//i,
    'https://media.crazyseal.com/site-assets/wp-media/'
  )
  return out
}

function extractFileUrls(entry) {
  const urls = []
  for (const value of Object.values(entry)) {
    if (typeof value !== 'string') continue
    // GF multi-file fields store JSON arrays; single file fields store a URL
    const candidates = value.startsWith('[')
      ? (() => { try { return JSON.parse(value) } catch { return [] } })()
      : value.split(/[\n,]+/)
    for (const c of candidates) {
      if (typeof c === 'string' && /wp-content\/uploads|gf-download/i.test(c)) {
        urls.push(rewriteUrl(c))
      }
    }
  }
  return urls
}

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

async function main() {
  const rows = await readCSV(FILE)
  console.log(`Parsed ${rows.length} entries from ${FILE}`)

  const BATCH = 200
  let inserted = 0
  let failed = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map((row) => {
      // Rewrite file URLs inside the stored entry too
      const entryData = {}
      for (const [k, v] of Object.entries(row)) {
        entryData[k] = typeof v === 'string' ? rewriteUrl(v) : v
      }
      return {
        gf_entry_id: parseInt(row['Entry ID'] || row['Entry Id'] || row['id'], 10) || 0,
        gf_form_id: parseInt(FORM_ID, 10),
        form_title: TITLE,
        entry_data: entryData,
        file_urls: extractFileUrls(row),
        submitted_at: row['Entry Date'] || row['Date Created'] || null,
      }
    })

    const { error } = await supabase
      .from('legacy_gf_entries')
      .upsert(batch, { onConflict: 'gf_form_id,gf_entry_id' })

    if (error) {
      console.error(`Batch ${i}-${i + BATCH} error:`, error.message)
      failed += batch.length
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r  Upserted ${inserted} / ${rows.length}`)
  }

  console.log(`\nDone: ${inserted} upserted, ${failed} failed`)
}

main().catch(console.error)
