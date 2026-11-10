// Builds kb.json from the public crazyseal.com pages: the same knowledge every
// model in the bake-off answers from.
//
//   node build-kb.mjs [--base https://crazyseal.com]

import { writeFileSync } from 'node:fs'
import { argValue, HERE } from './lib.mjs'

const BASE = (argValue('--base') ?? 'https://crazyseal.com').replace(/\/$/, '')
const WORDS_PER_CHUNK = Number(argValue('--chunk-words') ?? 400)
const OVERLAP_WORDS = Math.round(WORDS_PER_CHUNK * 0.15)

const PAGES = [
  '/faq', '/warranty', '/warranty-transfer',
  '/products', '/products/crazy-caulk', '/products/crazy-clean', '/products/crazy-patch',
  '/products/crazy-seal-roof-membrane', '/products/crazy-tape',
  '/technical-data', '/installation', '/installation/direct-to-deck', '/installation/membrane-roof',
  '/return-policy', '/shipping', '/ordering', '/custom-orders', '/advantages',
  '/rv-roofing', '/commercial-roofing', '/kit-builder', '/crazy-seal', '/about',
  '/professionals', '/professionals/rv', '/professionals/facilities', '/professionals/restaurants',
  '/business-accelerator-program', '/professional-tools', '/ways-to-earn',
  '/resources/sales', '/resources/sales/rv', '/resources/sales/facilities', '/resources/sales/ai-prompts',
  '/resources/warranty', '/resources/installation', '/resources/building-a-kit',
  '/resources/welcome-to-crazy-seal',
]

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', reg: '®', trade: '™', copy: '©', deg: '°' }

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
}

function htmlToText(html) {
  const main = html.match(/<main[^>]*id="site-main"[^>]*>([\s\S]*)<\/main>/)
  if (!main) return null
  const body = main[1]
    .replace(/<(script|style|noscript|svg|template)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|section|article|tr|summary|details|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
  return decode(body)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n')
}

function titleOf(html, path) {
  const t = html.match(/<title>([^<]*)<\/title>/)
  return t ? decode(t[1]).trim() : path
}

// Some pages are copies of another with a different heading (Restaurants vs
// Facilities). Keeping both just crowds the retrieval results.
function nearDuplicateOf(text, pages) {
  const lines = text.split('\n')
  for (const page of pages) {
    const known = new Set(page.text.split('\n'))
    if (lines.filter((line) => known.has(line)).length / lines.length > 0.9) return page.path
  }
  return null
}

function chunk(text) {
  const words = text.split(/\s+/)
  const chunks = []
  for (let start = 0; start < words.length; start += WORDS_PER_CHUNK - OVERLAP_WORDS) {
    chunks.push(words.slice(start, start + WORDS_PER_CHUNK).join(' '))
    if (start + WORDS_PER_CHUNK >= words.length) break
  }
  return chunks
}

async function main() {
  const pages = []
  const skipped = []
  const seen = new Set()
  for (const path of PAGES) {
    const url = `${BASE}${path}`
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        headers: { 'user-agent': 'crazy-seal-ai-bakeoff/1.0' },
        signal: AbortSignal.timeout(30_000),
      })
      const finalPath = new URL(res.url).pathname.replace(/\/$/, '')
      if (!res.ok) { skipped.push(`${path} (HTTP ${res.status})`); continue }
      if (/login|sign-?in/.test(finalPath)) { skipped.push(`${path} (redirects to ${finalPath})`); continue }
      if (seen.has(finalPath)) { skipped.push(`${path} (same page as ${finalPath})`); continue }
      seen.add(finalPath)
      const html = await res.text()
      const text = htmlToText(html)
      if (!text || text.split(/\s+/).length < 40) { skipped.push(`${path} (no main content)`); continue }
      const twin = nearDuplicateOf(text, pages)
      if (twin) { skipped.push(`${path} (near-duplicate of ${twin})`); continue }
      pages.push({ path, url, title: titleOf(html, path), text })
      console.log(`ok   ${path}  ${text.split(/\s+/).length} words`)
    } catch (err) {
      skipped.push(`${path} (${err.message})`)
    }
  }

  const chunks = pages.flatMap((page) =>
    chunk(page.text).map((text, i) => ({ id: `${page.path}#${i + 1}`, url: page.url, title: page.title, text })),
  )
  const kb = { builtAt: new Date().toISOString(), base: BASE, pages, chunks, skipped }
  writeFileSync(new URL('kb.json', HERE), JSON.stringify(kb, null, 2))
  for (const s of skipped) console.log(`skip ${s}`)
  console.log(`\n${pages.length} pages, ${chunks.length} chunks -> kb.json`)
}

await main()
process.exit(0) // don't wait on idle keep-alive sockets
