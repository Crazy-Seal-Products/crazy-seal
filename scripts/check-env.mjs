// Print variable names and readiness only; never print credentials.
import { readFileSync } from 'node:fs'
import nextEnv from '@next/env'

nextEnv.loadEnvConfig(process.cwd(), true)

const template = readFileSync(new URL('../.env.local.example', import.meta.url), 'utf8')
const keys = [...template.matchAll(/^([A-Z][A-Z0-9_]*)=/gm)].map((match) => match[1])
const optional = new Set([
  'SES_FROM_EMAIL', 'ZOHO_API_DOMAIN', 'ZOHO_LEAD_OWNER_ID', 'ZOHO_TECH_LEAD_OWNER_ID',
  'SHOPIFY_WEBHOOK_SECRET', 'SHOPIFY_PUBLIC_DOMAIN', 'NEXT_PUBLIC_GTM_ID',
  'NEXT_PUBLIC_GOOGLE_ADS_ID', 'NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL',
  'NEXT_PUBLIC_META_PIXEL_ID', 'META_CAPI_ACCESS_TOKEN', 'META_TEST_EVENT_CODE',
  'NEXT_PUBLIC_CLICKCEASE_ID', 'NEXT_PUBLIC_FEATURABLE_WIDGET_ID', 'CE_OPS_SECRET',
  'WP_SITE_URL', 'WP_SFTP_HOST', 'WP_SFTP_PORT', 'WP_SFTP_USER', 'WP_SFTP_PASS',
  'DATABASE_URL',
])
const core = new Set([
  'NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_SECRET_KEY',
])
const placeholder = /your[-_ ]|abc123def|arn:aws:iam::role\/|^0+$|shared-secret-with-company-engineers/i
let missingCore = 0
let missingFeatures = 0

for (const key of keys) {
  const value = process.env[key]?.trim()
  let ready = Boolean(value) && !placeholder.test(value)
  if (key === 'PDF_SECRET' && !ready) {
    const fallback = process.env.SUPABASE_SECRET_KEY?.trim()
    ready = Boolean(fallback) && !placeholder.test(fallback)
  }
  const group = core.has(key) ? 'CORE' : optional.has(key) ? 'OPTIONAL' : 'FEATURE'
  console.log(`${group.padEnd(8)} ${(ready ? 'SET' : 'MISSING').padEnd(8)} ${key}`)
  if (!ready && core.has(key)) missingCore++
  else if (!ready && !optional.has(key)) missingFeatures++
}

console.log(`\nCore missing: ${missingCore}; feature settings missing: ${missingFeatures}.`)
console.log('Presence checks only: credentials, permissions, and live services still need verification.')
process.exitCode = missingCore || missingFeatures ? 1 : 0
