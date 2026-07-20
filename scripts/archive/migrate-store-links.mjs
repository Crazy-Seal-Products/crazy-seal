// One-off: rewrite outbound buy.crazyseal.com / myshopify.com links to the
// internal /store routes. Run once, then archive.
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'

const files = execSync(
  `rg -l "buy\\.crazyseal\\.com|crazy-seal\\.myshopify\\.com" src`,
  { encoding: 'utf8' }
)
  .trim()
  .split('\n')

// Order matters: most specific first
const URL_REWRITES = [
  // product pages -> /store/{handle}
  [/https:\/\/buy\.crazyseal\.com\/products\/([a-z0-9-]+)\/?/g, '/store/$1'],
  // shopify "pages" -> store sections
  [/https:\/\/buy\.crazyseal\.com\/pages\/rv-roofing-kits\/?/g, '/store#rv-kits'],
  [/https:\/\/crazy-seal\.myshopify\.com\/pages\/commercial-roofing-kits\/?/g, '/store#commercial-kits'],
  [/https:\/\/buy\.crazyseal\.com\/pages\/build-your-own-kit\/?/g, '/store#products'],
  [/https:\/\/buy\.crazyseal\.com\/pages\/kits\/?/g, '/store'],
  // bare storefront root / products index -> /store
  [/https:\/\/buy\.crazyseal\.com\/?(?=["'`])/g, '/store'],
]

let totalReplacements = 0
for (const file of files) {
  let src = readFileSync(file, 'utf8')
  const before = src
  for (const [pattern, replacement] of URL_REWRITES) {
    src = src.replace(pattern, replacement)
  }

  // Remove ` external` prop from single-tag LinkButtons whose literal href is now internal
  src = src.replace(
    /<LinkButton\b([^>]*?href="\/[^"]*"[^>]*?)\sexternal(=\{true\})?([^>]*?)>/gs,
    '<LinkButton$1$3>'
  )

  if (src !== before) {
    writeFileSync(file, src)
    const count = (before.match(/buy\.crazyseal\.com|crazy-seal\.myshopify\.com/g) || []).length
    totalReplacements += count
    console.log(`${file}: ${count} links rewritten`)
  }
}
console.log(`\nDone. ${totalReplacements} links rewritten across ${files.length} files.`)
