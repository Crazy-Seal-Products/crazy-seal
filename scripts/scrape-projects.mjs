// Scrapes all /project/* posts from the live WordPress site into
// scripts/projects-scraped.json, ready for import into the Supabase
// `projects` table (see scripts/import-projects.mjs).
//
// Usage: node scripts/scrape-projects.mjs

import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const OUT = new URL('./projects-scraped.json', import.meta.url).pathname
const CDN = 'https://media.crazyseal.com/site-assets/wp-media'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function toCdn(url) {
  return url.replace(/https?:\/\/(www\.)?crazyseal\.com\/wp-content\/uploads/, CDN)
}

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
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchWithRetry(url, tries = 6) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30000) })
      if (res.status === 429) {
        await sleep(8000 * (i + 1))
        continue
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.text()
    } catch (e) {
      if (i === tries - 1) throw e
      await sleep(5000)
    }
  }
  throw new Error('unreachable')
}

function parseProject(html, wpUrl) {
  const slug = wpUrl.replace(/\/$/, '').split('/').pop()

  // Title: "Project #3236: Built to Outlast the Build" (some posts use an
  // h2.single-post-title instead of an h1, and omit the "#")
  const h1 = html.match(/<h1[^>]*>(.*?)<\/h1>/s) ||
    html.match(/<h2[^>]*class="[^"]*single-post-title[^"]*"[^>]*>(.*?)<\/h2>/s)
  const fullTitle = h1 ? stripTags(h1[1]) : slug
  const titleMatch = fullTitle.match(/(?:Project|Order)\s*#?(\d+)\s*:?\s*(.*)/i)
  const projectNumber = titleMatch ? Number(titleMatch[1]) : null
  const title = titleMatch && titleMatch[2] ? titleMatch[2].trim() : fullTitle

  // Category from body class e.g. "project-category-rv"; some posts have no
  // WP category, so fall back to inferring from the Project Type field
  const catMatch = html.match(/project-category-([a-z0-9-]+?)\s+entry/) ||
    html.match(/crazyseal\.com\/project-category\/([a-z0-9-]+)\//)
  let category = catMatch ? catMatch[1] : null

  // Details block: strip to text and pull labeled fields
  const text = decodeEntities(
    html
      .replace(/<script\b[\s\S]*?<\/script>/g, '')
      .replace(/<style\b[\s\S]*?<\/style>/g, '')
      .replace(/<[^>]+>/g, '\n')
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n +/g, '\n')
    .replace(/\n{2,}/g, '\n')

  const field = (label) => {
    const m = text.match(new RegExp(`${label}\\s*:?\\s*\\n([^\\n]+)`, 'i'))
    return m ? m[1].trim() : null
  }

  const projectType = field('Project Type')
  if (!category && projectType) {
    if (/rv|camper|motorhome/i.test(projectType)) category = 'rv'
    else if (/trailer|boat|truck|fleet|transport/i.test(projectType)) category = 'transportation'
    else if (/commercial|facility|industrial/i.test(projectType)) category = 'commercial'
    else if (/residential|home|house|porch|sunroom|lanai/i.test(projectType)) category = 'residential'
  }

  // Gallery photos: full-size lightbox links inside e-gallery-item anchors
  const photos = []
  for (const m of html.matchAll(/class="e-gallery-item[^"]*"\s+href="(https:\/\/crazyseal\.com\/wp-content\/uploads\/[^"]+)"/g)) {
    const url = toCdn(m[1])
    if (!photos.includes(url)) photos.push(url)
  }

  // Spotlight heading + story sections between the spotlight and the next
  // template section ("How to Get" / "Inspired to..." is part of story)
  let spotlightTitle = null
  const spotMatch = text.match(/\n(Project Spotlight:[^\n]*)\n/i)
  if (spotMatch) spotlightTitle = spotMatch[1].trim()

  const story = []
  let quote = null
  if (spotMatch) {
    const start = text.indexOf(spotMatch[1]) + spotMatch[1].length
    const endMatch = text.slice(start).search(/\nHow to Get a Crazy Seal|\nGet a Free Quote\n/i)
    const block = text.slice(start, endMatch > -1 ? start + endMatch : undefined)
    const lines = block.split('\n').map((l) => l.trim()).filter((l) => l && l !== '\u00A0')
    let current = null
    for (const line of lines) {
      const isQuote = /^[\u201C"]/.test(line) && /[\u201D"]!?\s*$/.test(line)
      if (isQuote) {
        quote = line.replace(/^[\u201C"]|[\u201D"]$/g, '').trim()
        continue
      }
      // Headings are short lines that don't end like prose sentences
      if (line.length < 80 && !/[.!,;:]$/.test(line)) {
        current = { heading: line, body: '' }
        story.push(current)
      } else if (current) {
        current.body = current.body ? `${current.body}\n\n${line}` : line
      } else {
        current = { heading: '', body: line }
        story.push(current)
      }
    }
  }

  return {
    project_number: projectNumber,
    slug,
    title,
    category,
    project_type: projectType,
    products_used: field('Products Used'),
    customer_type: field('Customer Type'),
    location: field('Location'),
    spotlight_title: spotlightTitle,
    story,
    quote,
    photo_urls: photos,
    cover_photo: photos.find((p) => /after/i.test(p)) || photos[0] || null,
    wp_url: wpUrl,
  }
}

// --- main ---
const sitemapXml = await fetchWithRetry('https://crazyseal.com/project-sitemap.xml')
const urls = [...sitemapXml.matchAll(/<loc><!\[CDATA\[(.*?)\]\]><\/loc>/g)].map((m) => m[1])
console.log(`${urls.length} project URLs in sitemap`)

const results = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : []
const done = new Set(results.map((r) => r.wp_url))

let i = 0
for (const url of urls) {
  i++
  if (done.has(url)) continue
  try {
    const html = await fetchWithRetry(url)
    const proj = parseProject(html, url)
    results.push(proj)
    console.log(`[${i}/${urls.length}] #${proj.project_number} ${proj.slug} (${proj.category}, ${proj.photo_urls.length} photos)`)
  } catch (e) {
    console.error(`[${i}/${urls.length}] FAILED ${url}: ${e.message}`)
  }
  writeFileSync(OUT, JSON.stringify(results, null, 2))
  await sleep(2500)
}

console.log(`DONE: ${results.length}/${urls.length} scraped -> ${OUT}`)
