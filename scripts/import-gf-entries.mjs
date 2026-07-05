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
  if (v === 'no') return false
  return null
}

async function importTechLeads() {
  console.log('--- Importing Tech Leads ---')
  const rows = await readCSV('/Users/jordanbuckingham/Downloads/tech-form-2026-04-04.csv')
  console.log(`Parsed ${rows.length} tech lead rows`)

  const BATCH = 500
  let inserted = 0
  let skipped = 0

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
        experience: clean(r['Please describe your experience and why you may be a good fit for the RV Armor family.']),
        created_at: clean(r['Entry Date']) || new Date().toISOString(),
      }
    }).filter(Boolean)

    skipped += (rows.slice(i, i + BATCH).length - batch.length)

    if (batch.length === 0) continue

    const { error } = await supabase.from('tech_leads').insert(batch)
    if (error) {
      console.error(`Batch ${i}-${i + BATCH} error:`, error.message)
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r  Inserted ${inserted} / ${rows.length}`)
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)
}

async function importTechApplications() {
  console.log('\n--- Importing Tech Applications ---')
  const rows = await readCSV('/Users/jordanbuckingham/Downloads/tech-application-2026-04-04.csv')
  console.log(`Parsed ${rows.length} tech application rows`)

  const BATCH = 100
  let inserted = 0
  let skipped = 0

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH).map(r => {
      const first = clean(r['Name (First)'])
      const last = clean(r['Name (Last)'])
      if (!first && !last) return null
      const email = clean(r['Email'])
      if (!email) return null

      const cols = Object.keys(r)

      // Employment history - 3 employers (columns repeat with same names)
      const empNameCols = cols.reduce((acc, c, idx) => {
        if (c === 'Employer name') acc.push(idx)
        return acc
      }, [])

      const work_history = []
      for (const startIdx of empNameCols) {
        const empName = clean(Object.values(r)[startIdx])
        if (!empName) continue

        const slice = Object.entries(r).slice(startIdx, startIdx + 12)
        work_history.push({
          employer_name: empName,
          street: clean(slice[1]?.[1]),
          city: clean(slice[3]?.[1]),
          state: clean(slice[4]?.[1]),
          zip: clean(slice[5]?.[1]),
          position: clean(slice[7]?.[1]),
          start_date: clean(slice[8]?.[1]),
          end_date: clean(slice[9]?.[1]),
          reason_leaving: clean(slice[10]?.[1]),
          supervisor: clean(slice[11]?.[1]),
        })
      }

      // References - 2 references (Name, Phone, Years Known pattern)
      const refNameCols = cols.reduce((acc, c, idx) => {
        if (c === 'Name' && idx > 50) acc.push(idx)
        return acc
      }, [])

      const personal_references = []
      for (const startIdx of refNameCols.slice(0, 2)) {
        const refName = clean(Object.values(r)[startIdx])
        if (!refName) continue
        const slice = Object.entries(r).slice(startIdx, startIdx + 3)
        personal_references.push({
          name: refName,
          phone: clean(slice[1]?.[1]),
          years_known: clean(slice[2]?.[1]),
        })
      }

      // Parse DOB
      let date_of_birth = null
      const dobRaw = clean(r['Date of Birth'])
      if (dobRaw) {
        const parts = dobRaw.split('-')
        if (parts.length === 3) date_of_birth = dobRaw
      }

      return {
        first_name: first,
        last_name: last,
        email: email.toLowerCase(),
        phone: clean(r['Cell Phone']),
        date_of_birth,
        street_address: clean(r['City, State, Zip Code (Required) (Street Address)']),
        city: clean(r['City, State, Zip Code (Required) (City)']),
        state: clean(r['City, State, Zip Code (Required) (State / Province)']),
        zip_code: clean(r['City, State, Zip Code (Required) (ZIP / Postal Code)']),
        construction_experience: clean(r['Do you have construction experience? Please tell us a little about you and your work experience.']),
        work_history: work_history.length > 0 ? work_history : [],
        personal_references: personal_references.length > 0 ? personal_references : [],
        can_travel: toBool(r['Are you willing to travel?']),
        travel_availability: clean(r['If yes, what part of the country?']),
        is_fulltime_rver: toBool(r["Are you currently a fulltime RV\u2019er?"]) ?? toBool(r["Are you currently a fulltime RV'er?"]),
        fulltime_rver_duration: clean(r['If yes, how long have you been full-timing?']),
        has_tools: toBool(r['Do you have your own set of basic construction tools?']),
        can_work_outdoors: toBool(r['Do you have any physical or medical conditions that prevent you from working in an outdoor environment?']) === false,
        can_lift_50lbs: toBool(r['Do you have any physical or medical conditions that prevent you from lifting 50lbs?']) === false,
        can_climb_ladders: toBool(r['Do you have any physical or medical conditions that prevent you from climbing ladders?']) === false,
        vehicle_description: clean(r['What kind of vehicle do you plan on using for your business?']),
        owns_vehicle: toBool(r['Do you currently own this vehicle?']),
        employment_type: clean(r['Are you looking for part-time or full-time?']),
        felony_conviction: toBool(r['Have you ever been convicted of a felony?']),
        felony_explanation: clean(r['If yes, please explain.']),
        has_working_capital: toBool(r['Do you have working capital to sustain your business?']),
        has_computer: toBool(r['Do you have access to a computer?']),
        computer_device: clean(r['If yes, please list your device.']),
        has_internet: toBool(r['Do you have regular access to the internet?']),
        computer_skill_level: clean(r['On a scale from 1-10 how would you rank your computer and internet skills?']),
        proficient_google_drive: toBool(r['Are you proficient in the use of Google Drive?']),
        proficient_pdf: toBool(r['Are you proficient in the use of PDF files?']),
        can_take_quality_photos: toBool(r['Can you take quality job progress pictures and upload them with proper instructions from us?']),
        has_quality_camera: toBool(r['Do you have a good quality phone camera or regular camera for taking quality pictures?']),
        final_statement: clean(r['Tell us why you believe you have the right stuff to be a part of our team.']),
        consent_background_check: toBool(r['Consent (Consent)']),
        status: 'submitted',
        created_at: clean(r['Entry Date']) || new Date().toISOString(),
      }
    }).filter(Boolean)

    skipped += (rows.slice(i, i + BATCH).length - batch.length)

    if (batch.length === 0) continue

    const { error } = await supabase.from('tech_applications').insert(batch)
    if (error) {
      console.error(`Batch ${i}-${i + BATCH} error:`, error.message)
    } else {
      inserted += batch.length
    }
    process.stdout.write(`\r  Inserted ${inserted} / ${rows.length}`)
  }

  console.log(`\nDone: ${inserted} inserted, ${skipped} skipped`)
}

async function main() {
  await importTechLeads()
  await importTechApplications()
  console.log('\nAll imports complete!')
}

main().catch(console.error)
