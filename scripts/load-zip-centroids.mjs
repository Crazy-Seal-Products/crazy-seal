// Load ZIP centroids for the contractor maps (supabase/migrations/021_contractors.sql).
// Source: Census Bureau 2024 ZCTA Gazetteer, unzipped:
//   https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip
// Run:
//   node --env-file=.env.local scripts/load-zip-centroids.mjs path/to/2024_Gaz_zcta_national.txt
// Upserts, so it's safe to re-run with a newer gazetteer.
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const file = process.argv[2]
if (!file) {
  console.error('Usage: node --env-file=.env.local scripts/load-zip-centroids.mjs <gazetteer.txt>')
  process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
})

const lines = readFileSync(file, 'utf8').split(/\r?\n/)
const header = lines[0].split('\t').map((h) => h.trim())
const col = (name) => header.indexOf(name)
const [iZip, iLat, iLng] = [col('GEOID'), col('INTPTLAT'), col('INTPTLONG')]
if (iZip < 0 || iLat < 0 || iLng < 0) throw new Error(`Unexpected header: ${header.join(', ')}`)

const rows = []
const prefixes = new Map()
for (const line of lines.slice(1)) {
  const cells = line.split('\t').map((c) => c.trim())
  const zip = cells[iZip]
  const lat = Number(cells[iLat])
  const lng = Number(cells[iLng])
  if (!/^\d{5}$/.test(zip) || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
  rows.push({ zip, lat, lng })
  const p = prefixes.get(zip.slice(0, 3)) ?? { lat: 0, lng: 0, n: 0 }
  p.lat += lat
  p.lng += lng
  p.n += 1
  prefixes.set(zip.slice(0, 3), p)
}
for (const [zip, p] of prefixes) rows.push({ zip, lat: p.lat / p.n, lng: p.lng / p.n })

console.log(`${rows.length - prefixes.size} ZIPs and ${prefixes.size} prefixes to load`)
for (let i = 0; i < rows.length; i += 1000) {
  const { error } = await supabase.from('zip_centroids').upsert(rows.slice(i, i + 1000), { onConflict: 'zip' })
  if (error) throw new Error(`Batch at ${i}: ${error.message}`)
}
const { count } = await supabase.from('zip_centroids').select('zip', { count: 'exact', head: true })
console.log(`zip_centroids now has ${count} rows`)
