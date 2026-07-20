// Imports scripts/projects-scraped.json (from scrape-projects.mjs) into the
// Supabase `projects` table. Upserts on slug, so it is safe to re-run.
//
// Usage: node scripts/import-projects.mjs

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const get = (key) => env.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim()

const supabase = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SECRET_KEY'))

const projects = JSON.parse(
  readFileSync(new URL('./projects-scraped.json', import.meta.url), 'utf8')
)
console.log(`${projects.length} projects in scrape file`)

let ok = 0
let failed = 0
for (let i = 0; i < projects.length; i += 50) {
  const batch = projects.slice(i, i + 50).map((p) => ({
    project_number: p.project_number,
    slug: p.slug,
    title: p.title,
    category: p.category,
    project_type: p.project_type,
    products_used: p.products_used,
    customer_type: p.customer_type,
    location: p.location,
    spotlight_title: p.spotlight_title,
    story: p.story || [],
    quote: p.quote,
    photo_urls: p.photo_urls || [],
    cover_photo: p.cover_photo,
    published: true,
    wp_url: p.wp_url,
  }))

  const { error } = await supabase.from('projects').upsert(batch, { onConflict: 'slug' })
  if (error) {
    console.error(`Batch ${i}-${i + batch.length} failed:`, error.message)
    failed += batch.length
  } else {
    ok += batch.length
    console.log(`Upserted ${ok}/${projects.length}`)
  }
}

console.log(`DONE: ${ok} upserted, ${failed} failed`)
