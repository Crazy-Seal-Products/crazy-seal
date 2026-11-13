// Consolidate the Shopify dealer roster into contractors: link each
// contractor's Shopify customers (for their spending), and add Shopify dealers
// who aren't contractors yet, hidden from the public site. The same sync the
// admin's Contractors page runs; the rules are in src/lib/contractors/shopify-match.ts.
//
// Run:
//   node --env-file=.env.local scripts/sync-shopify-contractors.mjs --dry-run
//   node --env-file=.env.local scripts/sync-shopify-contractors.mjs
//
// Needs Node 22.18+ (it loads the app's TypeScript directly) and migration
// 026_contractor_shopify_links.sql.
import { register } from 'node:module'
import { createClient } from '@supabase/supabase-js'

// The app's imports leave off ".ts"; add it for files under src.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      import { existsSync } from 'node:fs'
      import { fileURLToPath } from 'node:url'
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith('.') && context.parentURL?.endsWith('.ts')) {
          const url = new URL(specifier + '.ts', context.parentURL)
          if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true }
        }
        return next(specifier, context)
      }
    `),
)

const dryRun = process.argv.includes('--dry-run')
const { syncShopifyContractors } = await import('../src/lib/contractors/shopify-sync.ts')
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const report = await syncShopifyContractors(db, { dryRun })

const verb = dryRun ? 'Would' : 'Did'
console.log(`${verb} link ${report.linked.length} Shopify customers, add ${report.added.length} contractors (hidden), leave ${report.ambiguous.length} for an admin.`)
const byHow = Object.groupBy(report.linked, (l) => l.how)
for (const [how, rows] of Object.entries(byHow)) {
  console.log(`\nLinked by ${how} (${rows.length}):`)
  for (const l of rows) console.log(`  ${l.customer}  →  ${l.contractor}`)
}
if (report.added.length) {
  console.log(`\nAdded (${report.added.length}), hidden until listed:`)
  for (const a of report.added)
    console.log(`  ${a.name}  /contractor/${a.slug}${a.customers.length > 1 ? `  (${a.customers.length} Shopify records: ${a.customers.join(', ')})` : ''}`)
}
if (report.ambiguous.length) {
  console.log(`\nMatches more than one contractor; link by hand on the contractor's page (${report.ambiguous.length}):`)
  for (const a of report.ambiguous) console.log(`  ${a.customer}  →  ${a.contractors.join(', ')}`)
}
