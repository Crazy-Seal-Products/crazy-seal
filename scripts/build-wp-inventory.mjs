// Builds a complete inventory of public URLs on the legacy WordPress site
// (crazyseal.com) so the new site can prove full parity before launch.
//
// Sources:
//   - Pages:              /wp-json/wp/v2/pages (all published pages)
//   - Projects:           /project-sitemap.xml
//   - Project categories: /project-category-sitemap.xml
//   - GravityView pages:  /gravityview-sitemap.xml
//   - Category archives:  /wp-json/wp/v2/categories
//
// Output: src/lib/generated/wp-url-inventory.json
//   [{ path, title, type }] sorted by type then path.
//
// Usage: node scripts/build-wp-inventory.mjs

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const WP = 'https://crazyseal.com'
const OUT = new URL('../src/lib/generated/wp-url-inventory.json', import.meta.url).pathname

function decodeEntities(s) {
  return s
    .replace(/&#8211;|&ndash;/g, '\u2013')
    .replace(/&#8212;|&mdash;/g, '\u2014')
    .replace(/&#8217;|&rsquo;/g, '\u2019')
    .replace(/&#8216;|&lsquo;/g, '\u2018')
    .replace(/&#8220;|&ldquo;/g, '\u201C')
    .replace(/&#8221;|&rdquo;/g, '\u201D')
    .replace(/&#038;|&amp;/g, '&')
    .replace(/&#8230;|&hellip;/g, '\u2026')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function toPath(url) {
  const u = new URL(url)
  let path = u.pathname
  if (!path.endsWith('/')) path += '/'
  return path
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

async function fetchAllPaged(endpoint) {
  const items = []
  for (let page = 1; ; page++) {
    const res = await fetch(`${WP}${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=100&page=${page}`, {
      signal: AbortSignal.timeout(30000),
    })
    if (res.status === 400) break // past last page
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${endpoint} page ${page}`)
    const batch = await res.json()
    items.push(...batch)
    const totalPages = Number(res.headers.get('x-wp-totalpages') || '1')
    if (page >= totalPages) break
  }
  return items
}

async function fetchSitemapUrls(sitemap) {
  const res = await fetch(`${WP}/${sitemap}.xml`, { signal: AbortSignal.timeout(30000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${sitemap}.xml`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc><!\[CDATA\[([^\]]+)\]\]><\/loc>/g)].map((m) => m[1])
}

async function main() {
  const entries = []

  // Published WordPress pages (includes pages excluded from the XML sitemap)
  const pages = await fetchAllPaged('/wp-json/wp/v2/pages?_fields=link,title,status')
  for (const p of pages) {
    entries.push({
      path: toPath(p.link),
      title: decodeEntities(p.title?.rendered || ''),
      type: 'page',
    })
  }
  console.log(`pages: ${pages.length}`)

  // Project posts
  const projectUrls = await fetchSitemapUrls('project-sitemap')
  for (const url of projectUrls) {
    entries.push({ path: toPath(url), title: '', type: 'project' })
  }
  console.log(`projects: ${projectUrls.length}`)

  // Project category archives
  const projectCatUrls = await fetchSitemapUrls('project-category-sitemap')
  for (const url of projectCatUrls) {
    entries.push({ path: toPath(url), title: '', type: 'project-category' })
  }
  console.log(`project categories: ${projectCatUrls.length}`)

  // GravityView pages
  const gvUrls = await fetchSitemapUrls('gravityview-sitemap')
  for (const url of gvUrls) {
    entries.push({ path: toPath(url), title: '', type: 'gravityview' })
  }
  console.log(`gravityview: ${gvUrls.length}`)

  // Blog category archives (site has zero blog posts, but the URLs exist)
  const categories = await fetchJson(`${WP}/wp-json/wp/v2/categories?per_page=100&_fields=link,name`)
  for (const c of categories) {
    entries.push({ path: toPath(c.link), title: decodeEntities(c.name || ''), type: 'category' })
  }
  console.log(`categories: ${categories.length}`)

  // De-dupe (e.g. /store/ appears as a page and could appear elsewhere)
  const seen = new Set()
  const deduped = entries.filter((e) => {
    if (seen.has(e.path)) return false
    seen.add(e.path)
    return true
  })

  deduped.sort((a, b) => a.type.localeCompare(b.type) || a.path.localeCompare(b.path))

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), source: WP, urls: deduped }, null, 2) + '\n')
  console.log(`\nWrote ${deduped.length} URLs to ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
