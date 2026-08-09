// One-off: retarget /pricing links to /kit-builder and rename Instant Quote CTAs.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC = new URL('../src', import.meta.url).pathname

// Order matters: longer strings first.
const REPLACEMENTS = [
  ['href="/pricing"', 'href="/kit-builder"'],
  ["href: '/pricing'", "href: '/kit-builder'"],
  ['Get an Instant Quote Online', 'Build My Kit Online'],
  ['Get an Instant Quote', 'Build My Kit'],
  ['Instant Quote (In 10 Seconds)', 'Build My Kit (In 10 Seconds)'],
  [
    'Use our instant quote tool for a kit recommendation and pricing in under 10 seconds.',
    'Use our Kit Builder to get a complete kit recommendation and pricing in under 10 seconds.',
  ],
]

// Handled manually: deleted with the old page / nuanced copy edited by hand.
const SKIP = new Set(['InstantQuoteCalculator.tsx'])

function walk(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else if (/\.(tsx?|mjs)$/.test(entry) && !SKIP.has(entry)) files.push(full)
  }
  return files
}

let changedFiles = 0
for (const file of walk(SRC)) {
  const before = readFileSync(file, 'utf8')
  let after = before
  for (const [from, to] of REPLACEMENTS) {
    after = after.split(from).join(to)
  }
  if (after !== before) {
    writeFileSync(file, after)
    changedFiles++
    console.log(`updated ${file.replace(SRC, 'src')}`)
  }
}
console.log(`\n${changedFiles} files updated`)
