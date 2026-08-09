// Builds the merged data behind /admin/sitemap: every route on the new site
// (static pages, projects, store products) plus every URL from the legacy
// WordPress site with its disposition (live match, redirected, or missing).

import { REDIRECTS } from '@/lib/redirects'
import routeManifest from '@/lib/generated/route-manifest.json'
import wpInventory from '@/lib/generated/wp-url-inventory.json'
import { getPublishedProjects } from '@/lib/projects'
import { getStoreProducts } from '@/lib/store/products'

export type SitemapSource = 'page' | 'project' | 'store' | 'admin' | 'legacy'
export type SitemapStatus = 'live' | 'redirected' | 'missing'

export interface SitemapEntry {
  path: string
  source: SitemapSource
  status: SitemapStatus
  title?: string
  /** Original WordPress content type for legacy entries. */
  legacyType?: string
  /** Final internal/external destination for redirected legacy URLs. */
  redirectTo?: string
  /** True when this live URL also existed on the WordPress site. */
  wasWordPress?: boolean
}

export interface RedirectRule {
  source: string
  destination: string
}

function normalize(path: string): string {
  const clean = path.split('?')[0].replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

/**
 * Matches a path against a Next.js-style redirect source (exact, `:param`,
 * or `:path*`) and returns the destination with params substituted, or null.
 */
export function matchRedirect(path: string, rules: RedirectRule[]): string | null {
  const clean = normalize(path)
  for (const rule of rules) {
    if (!rule.source.includes(':')) {
      if (clean === rule.source) return rule.destination
      continue
    }
    const paramNames = [...rule.source.matchAll(/:([A-Za-z0-9_]+)(\*?)/g)].map((m) => m[1])
    const pattern = rule.source
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      // :path* matches zero or more segments (its leading slash is optional)
      .replace(/\/:([A-Za-z0-9_]+)\*/g, '(?:/(.*))?')
      .replace(/:([A-Za-z0-9_]+)/g, '([^/]+)')
    const match = clean.match(new RegExp(`^${pattern}$`))
    if (!match) continue
    let dest = rule.destination
    paramNames.forEach((name, i) => {
      dest = dest.replace(new RegExp(`:${name}\\*?`, 'g'), match[i + 1] ?? '')
    })
    return dest.replace(/\/+$/, '/') || '/'
  }
  return null
}

/** Follows internal redirect hops (max 5) to the final destination. */
function resolveRedirectChain(path: string, rules: RedirectRule[]): string | null {
  let current = matchRedirect(path, rules)
  if (!current) return null
  for (let hop = 0; hop < 5; hop++) {
    if (current.startsWith('http')) return current
    const next = matchRedirect(current, rules)
    if (!next) return current
    current = next
  }
  return current
}

export async function buildSitemapEntries(
  managedRedirects: RedirectRule[] = [],
): Promise<SitemapEntry[]> {
  const [projects, storeProducts] = await Promise.all([
    getPublishedProjects(),
    getStoreProducts().catch(() => []),
  ])

  const entries: SitemapEntry[] = []
  const livePaths = new Set<string>()

  for (const route of routeManifest.routes) {
    if (route.dynamic) continue
    livePaths.add(normalize(route.path))
    entries.push({
      path: route.path,
      source: route.admin ? 'admin' : 'page',
      status: 'live',
    })
  }

  for (const p of projects) {
    const path = `/project/${p.slug}/`
    livePaths.add(normalize(path))
    entries.push({ path, source: 'project', status: 'live', title: p.title })
  }

  for (const p of storeProducts) {
    const path = `/store/${p.handle}/`
    livePaths.add(normalize(path))
    entries.push({ path, source: 'store', status: 'live', title: p.title })
  }

  const allRules: RedirectRule[] = [
    ...REDIRECTS.map((r) => ({ source: r.source, destination: r.destination })),
    ...managedRedirects,
  ]

  const legacyPaths = new Set(wpInventory.urls.map((u) => normalize(u.path)))
  for (const entry of entries) {
    if (legacyPaths.has(normalize(entry.path))) entry.wasWordPress = true
  }

  for (const legacy of wpInventory.urls) {
    const path = legacy.path
    if (livePaths.has(normalize(path))) {
      // Same URL exists on the new site; already listed as a live entry
      continue
    }
    const dest = resolveRedirectChain(path, allRules)
    if (dest) {
      const destLive = dest.startsWith('http') || livePaths.has(normalize(dest))
      entries.push({
        path,
        source: 'legacy',
        legacyType: legacy.type,
        title: legacy.title || undefined,
        status: destLive ? 'redirected' : 'missing',
        redirectTo: dest,
      })
    } else {
      entries.push({
        path,
        source: 'legacy',
        legacyType: legacy.type,
        title: legacy.title || undefined,
        status: 'missing',
      })
    }
  }

  return entries
}
