// Scans src/app for page.tsx files and writes a manifest of every route in
// the app to src/lib/generated/route-manifest.json. Runs automatically before
// `next dev` and `next build` (see predev/prebuild in package.json) so the
// admin sitemap always reflects the real set of pages.

import { readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'

const APP_DIR = new URL('../src/app', import.meta.url).pathname
const OUT = new URL('../src/lib/generated/route-manifest.json', import.meta.url).pathname

function collectRoutes(dir, segments = []) {
  const routes = []
  const entries = readdirSync(dir, { withFileTypes: true })

  if (entries.some((e) => e.isFile() && e.name === 'page.tsx')) {
    routes.push(segments)
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_')) continue
    // Route groups add no URL segment
    const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
    routes.push(
      ...collectRoutes(join(dir, entry.name), isGroup ? segments : [...segments, entry.name]),
    )
  }
  return routes
}

const routes = collectRoutes(APP_DIR)
  .map((segments) => {
    const path = '/' + segments.join('/') + (segments.length ? '/' : '')
    return {
      path,
      dynamic: segments.some((s) => s.startsWith('[')),
      admin: segments[0] === 'admin' || segments[0] === 'pro',
    }
  })
  .sort((a, b) => a.path.localeCompare(b.path))

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(
  OUT,
  JSON.stringify({ generatedAt: new Date().toISOString(), routes }, null, 2) + '\n',
)
console.log(`route-manifest: ${routes.length} routes written`)
