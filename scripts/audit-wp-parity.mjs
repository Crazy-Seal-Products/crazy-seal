// Verifies every URL from the legacy WordPress site (see
// src/lib/generated/wp-url-inventory.json, built by build-wp-inventory.mjs)
// resolves on the new site: either 200 directly or via a redirect chain that
// ends in 200 (or an external destination like the media CDN).
//
// Usage:
//   node scripts/audit-wp-parity.mjs                          # against localhost:3004
//   node scripts/audit-wp-parity.mjs https://crazyseal.com    # against production

import { readFileSync } from 'node:fs'

const BASE = (process.argv[2] || 'http://localhost:3004').replace(/\/$/, '')
const CONCURRENCY = 10
const MAX_HOPS = 5

const inventory = JSON.parse(
  readFileSync(new URL('../src/lib/generated/wp-url-inventory.json', import.meta.url), 'utf8'),
)

async function checkUrl(path) {
  const hops = []
  let current = `${BASE}${path}`
  for (let hop = 0; hop <= MAX_HOPS; hop++) {
    if (!current.startsWith(BASE)) {
      // External destination (media CDN, Shopify, etc.) -- treat as resolved
      return { path, ok: true, status: 'external', hops, final: current }
    }
    let res
    try {
      res = await fetch(current, { redirect: 'manual', signal: AbortSignal.timeout(30000) })
    } catch (e) {
      return { path, ok: false, status: `fetch error: ${e.message}`, hops, final: current }
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('location')
      if (!location) return { path, ok: false, status: res.status, hops, final: current }
      hops.push(`${res.status} -> ${location}`)
      current = new URL(location, current).href
      continue
    }
    return { path, ok: res.status === 200, status: res.status, hops, final: current }
  }
  return { path, ok: false, status: 'too many redirects', hops, final: current }
}

const urls = inventory.urls.map((u) => u.path)
console.log(`Auditing ${urls.length} legacy URLs against ${BASE}\n`)

const results = []
for (let i = 0; i < urls.length; i += CONCURRENCY) {
  const batch = urls.slice(i, i + CONCURRENCY)
  results.push(...(await Promise.all(batch.map(checkUrl))))
  process.stdout.write(`\rChecked ${Math.min(i + CONCURRENCY, urls.length)}/${urls.length}`)
}
console.log('\n')

const failures = results.filter((r) => !r.ok)
const redirectedOk = results.filter((r) => r.ok && r.hops.length > 0)

console.log(`PASS (direct 200):        ${results.filter((r) => r.ok && r.hops.length === 0).length}`)
console.log(`PASS (redirect -> 200):   ${redirectedOk.filter((r) => r.status !== 'external').length}`)
console.log(`PASS (redirect external): ${redirectedOk.filter((r) => r.status === 'external').length}`)
console.log(`FAIL:                     ${failures.length}`)

if (failures.length) {
  console.log('\nFailures:')
  for (const f of failures) {
    console.log(`  ${f.path}`)
    f.hops.forEach((h) => console.log(`    ${h}`))
    console.log(`    final: ${f.status} ${f.final}`)
  }
  process.exit(1)
}
console.log('\nFull WordPress parity verified.')
