#!/usr/bin/env node
/**
 * Zoho CRM setup helper for the Crazy Seal Zoho account.
 *
 * Usage:
 *   node scripts/zoho-setup.mjs exchange <grant_code>   Exchange a Self Client grant code for a refresh token
 *   node scripts/zoho-setup.mjs verify                  Verify creds: list users, check Leads module fields
 *   node scripts/zoho-setup.mjs test-lead               Create a test lead in Zoho (marked TEST)
 *
 * Prereqs: ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET in .env.local
 * (from a Self Client at https://api-console.zoho.com while logged into the Crazy Seal Zoho account).
 *
 * Required scope when generating the grant code:
 *   ZohoCRM.modules.leads.CREATE,ZohoCRM.modules.leads.READ,ZohoCRM.settings.fields.READ,ZohoCRM.users.READ
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(import.meta.dirname, '..', '.env.local')
const env = {}
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
}

const ACCOUNTS = 'https://accounts.zoho.com'
const API = env.ZOHO_API_DOMAIN || 'https://www.zohoapis.com'

// Fields the /api/leads route pushes to Zoho (must exist in the Leads module)
const REQUIRED_FIELDS = [
  'First_Name', 'Last_Name', 'Email', 'Phone', 'Street', 'City', 'State', 'Zip_Code',
  'Lead_Source', 'Lead_Status', 'How_did_you_hear_about_us', 'Lead_Form_Comments',
  'Photo_URLS', 'UTM_Source', 'UTM_Medium', 'UTM_Campaign', 'Landing_Page', 'Referrer',
]

function requireEnv(...names) {
  const missing = names.filter((n) => !env[n])
  if (missing.length) {
    console.error(`Missing in .env.local: ${missing.join(', ')}`)
    process.exit(1)
  }
}

async function exchange(code) {
  requireEnv('ZOHO_CLIENT_ID', 'ZOHO_CLIENT_SECRET')
  const res = await fetch(`${ACCOUNTS}/oauth/v2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.ZOHO_CLIENT_ID,
      client_secret: env.ZOHO_CLIENT_SECRET,
      code,
    }),
  })
  const data = await res.json()
  if (!data.refresh_token) {
    console.error('Exchange failed:', JSON.stringify(data))
    console.error('\nGrant codes expire fast (3-10 min). Generate a fresh one and retry.')
    process.exit(1)
  }
  console.log('Success! Add this to .env.local (and Vercel):\n')
  console.log(`ZOHO_REFRESH_TOKEN=${data.refresh_token}`)
  console.log(`\napi_domain reported by Zoho: ${data.api_domain}`)
  if (data.api_domain && data.api_domain !== API) {
    console.log(`NOTE: differs from ZOHO_API_DOMAIN in .env.local (${API}) — update it.`)
  }
}

async function getAccessToken() {
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
    console.error('Token refresh failed:', JSON.stringify(data))
    process.exit(1)
  }
  return data.access_token
}

async function verify() {
  const token = await getAccessToken()
  const h = { Authorization: `Zoho-oauthtoken ${token}` }
  console.log('Token refresh: OK\n')

  const usersRes = await (await fetch(`${API}/crm/v7/users?type=ActiveUsers`, { headers: h })).json()
  console.log('Active users (pick one id for ZOHO_LEAD_OWNER_ID):')
  for (const u of usersRes.users || []) console.log(`  ${u.id}  ${u.full_name} <${u.email}>`)
  if (env.ZOHO_LEAD_OWNER_ID) {
    const found = (usersRes.users || []).some((u) => u.id === env.ZOHO_LEAD_OWNER_ID)
    console.log(`\nZOHO_LEAD_OWNER_ID=${env.ZOHO_LEAD_OWNER_ID} ${found ? 'matches an active user: OK' : 'DOES NOT match any active user!'}`)
  } else {
    console.log('\nZOHO_LEAD_OWNER_ID is empty — set it to one of the ids above (optional; Zoho defaults to the token owner).')
  }

  const fieldsRes = await (await fetch(`${API}/crm/v7/settings/fields?module=Leads`, { headers: h })).json()
  const names = new Set((fieldsRes.fields || []).map((f) => f.api_name))
  console.log(`\nLeads module has ${names.size} fields. Checking the ones the website pushes:`)
  let missing = 0
  for (const f of REQUIRED_FIELDS) {
    const ok = names.has(f)
    if (!ok) missing++
    console.log(`  ${ok ? 'OK  ' : 'MISS'} ${f}`)
  }
  if (missing) {
    console.log(`\n${missing} field(s) missing. Add them in Zoho (Setup > Customization > Modules and Fields > Leads)`)
    console.log('as single-line text fields, or leads will be REJECTED by the API.')
  } else {
    console.log('\nAll fields present. Ready to push leads.')
  }
}

async function testLead() {
  const token = await getAccessToken()
  const res = await fetch(`${API}/crm/v7/Leads`, {
    method: 'POST',
    headers: { Authorization: `Zoho-oauthtoken ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [{
        First_Name: 'Test',
        Last_Name: 'CrazySeal Website TEST - safe to delete',
        Email: 'test+crazyseal@example.com',
        Lead_Source: 'Website Lead form',
        Lead_Status: 'Not Contacted',
        Lead_Form_Comments: 'Test lead created by scripts/zoho-setup.mjs — safe to delete.',
        UTM_Source: 'test',
        UTM_Medium: 'test',
        UTM_Campaign: 'test',
        Landing_Page: '/test',
        Referrer: 'test',
        ...(env.ZOHO_LEAD_OWNER_ID ? { Owner: env.ZOHO_LEAD_OWNER_ID } : {}),
      }],
      duplicate_check_fields: ['Email'],
    }),
  })
  const data = await res.json()
  const result = data.data?.[0]
  if (result?.status === 'success') {
    console.log(`Test lead created: id ${result.details.id}`)
    console.log('Check the Crazy Seal Zoho CRM Leads list, then delete it.')
  } else {
    console.error('Test lead FAILED:', JSON.stringify(data, null, 2))
    process.exit(1)
  }
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === 'exchange' && arg) await exchange(arg)
else if (cmd === 'verify') await verify()
else if (cmd === 'test-lead') await testLead()
else {
  console.log('Usage:\n  node scripts/zoho-setup.mjs exchange <grant_code>\n  node scripts/zoho-setup.mjs verify\n  node scripts/zoho-setup.mjs test-lead')
  process.exit(1)
}
