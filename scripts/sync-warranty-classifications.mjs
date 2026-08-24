#!/usr/bin/env node
/**
 * Copy Image_Type and Reviews_for_Marketing from Zoho Contacts
 * onto matching warranty_registrations (by email).
 *
 *   node scripts/sync-warranty-classifications.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(resolve(import.meta.dirname, '..', '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const ACCOUNTS = 'https://accounts.zoho.com'
const API = env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'

function requireEnv(...names) {
  const missing = names.filter((n) => !env[n])
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(', ')}`)
    process.exit(1)
  }
}

function normalize(value) {
  if (!value) return null
  const trimmed = String(value).trim()
  if (!trimmed || trimmed === '-None-') return null
  return trimmed
}

function normalizeWebsite(value) {
  if (!value) return null
  if (typeof value === 'object') return normalize(value.url || value.Url)
  return normalize(value)
}

async function accessToken() {
  requireEnv('ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET', 'ZOHO_REFRESH_TOKEN')
  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      refresh_token: env.ZOHO_REFRESH_TOKEN,
    }),
  })
  const data = await res.json()
  if (!data.access_token) {
    console.error('Token refresh failed:', data.error || data.error_description || 'unknown')
    process.exit(1)
  }
  return data.access_token
}

async function fetchClassifiedContacts(token) {
  const classified = new Map()
  let scanned = 0
  const headers = { Authorization: `Zoho-oauthtoken ${token}` }
  let page = 1
  let pageToken = null

  while (true) {
    const params = new URLSearchParams({
      fields: 'Email,Image_Type,Reviews_for_Marketing,Lucid_Link',
      per_page: '200',
    })
    if (pageToken) params.set('page_token', pageToken)
    else params.set('page', String(page))

    const res = await fetch(`${API}/crm/v7/Contacts?${params}`, { headers })
    const json = await res.json()
    if (!res.ok) {
      console.error('Contacts page failed:', res.status, json.code || json.message || 'unknown')
      process.exit(1)
    }
    const rows = json.data || []
    scanned += rows.length
    if (scanned % 1000 === 0 || !json.info?.more_records) {
      console.log(`zoho_contacts_scanned ${scanned}`)
    }
    for (const row of rows) {
      const email = normalize(row.Email)?.toLowerCase()
      const imageType = normalize(row.Image_Type)
      const reviews = normalize(row.Reviews_for_Marketing)
      const lucidLink = normalizeWebsite(row.Lucid_Link)
      if (!email || (!imageType && !reviews && !lucidLink)) continue
      const prev = classified.get(email)
      if (!prev || (reviews && !prev.reviews_for_marketing) || (lucidLink && !prev.lucid_link)) {
        classified.set(email, {
          zoho_record_id: String(row.id),
          image_type: imageType || prev?.image_type || null,
          reviews_for_marketing: reviews || prev?.reviews_for_marketing || null,
          lucid_link: lucidLink || prev?.lucid_link || null,
        })
      }
    }
    if (!json.info?.more_records) break
    if (json.info.next_page_token && (pageToken || page >= 10)) {
      pageToken = json.info.next_page_token
      continue
    }
    page += 1
  }

  return { scanned, classified }
}

async function fetchAllRegistrations(supabase) {
  const rows = []
  const pageSize = 1000
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from('warranty_registrations')
      .select('id, email, image_type, reviews_for_marketing, lucid_link, zoho_record_id')
      .range(from, from + pageSize - 1)
    if (error) {
      console.error('Load registrations failed:', error.message)
      process.exit(1)
    }
    rows.push(...(data || []))
    if (!data || data.length < pageSize) break
  }
  return rows
}

async function main() {
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SECRET_KEY')
  const token = await accessToken()
  const { scanned, classified } = await fetchClassifiedContacts(token)
  console.log(`zoho_contacts_scanned ${scanned}`)
  console.log(`zoho_contacts_classified ${classified.size}`)
  let lucidFilled = 0
  for (const crm of classified.values()) {
    if (crm.lucid_link) lucidFilled += 1
  }
  console.log(`zoho_contacts_with_lucid_link ${lucidFilled}`)

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY)
  const registrations = await fetchAllRegistrations(supabase)
  console.log(`warranty_registrations ${registrations.length}`)

  let matched = 0
  let updated = 0
  let unchanged = 0
  const now = new Date().toISOString()

  const byEmail = new Map()
  for (const row of registrations) {
    const email = normalize(row.email)?.toLowerCase()
    if (!email) continue
    if (!byEmail.has(email)) byEmail.set(email, [])
    byEmail.get(email).push(row)
  }

  for (const [email, crm] of classified) {
    const matches = byEmail.get(email)
    if (!matches?.length) continue
    matched += matches.length
    for (const row of matches) {
      const nextImage = crm.image_type ?? row.image_type
      const nextReviews = crm.reviews_for_marketing ?? row.reviews_for_marketing
      const nextLucid = crm.lucid_link ?? row.lucid_link
      const same =
        row.image_type === nextImage &&
        row.reviews_for_marketing === nextReviews &&
        row.lucid_link === nextLucid &&
        row.zoho_record_id === crm.zoho_record_id
      if (same) {
        unchanged += 1
        continue
      }
      const { error } = await supabase
        .from('warranty_registrations')
        .update({
          image_type: nextImage,
          reviews_for_marketing: nextReviews,
          lucid_link: nextLucid,
          zoho_record_id: crm.zoho_record_id,
          zoho_synced_at: now,
        })
        .eq('id', row.id)
      if (error) {
        console.error('Update failed:', error.message)
        process.exit(1)
      }
      updated += 1
    }
  }

  let unmatchedCrm = 0
  for (const email of classified.keys()) {
    if (!byEmail.has(email)) unmatchedCrm += 1
  }

  console.log(`matched_registrations ${matched}`)
  console.log(`updated ${updated}`)
  console.log(`already_in_sync ${unchanged}`)
  console.log(`classified_contacts_without_registration ${unmatchedCrm}`)
}

await main()
