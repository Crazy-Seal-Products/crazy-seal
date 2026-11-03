import { createAdminClient } from '@/lib/supabase/admin'
import { REDIRECTS } from '@/lib/redirects'

/**
 * Admin-managed redirects (the `managed_redirects` table). The live site
 * reads the enabled rows in src/proxy.ts on every request (cached for a
 * minute per server), matching on the source with trailing slashes removed.
 * Code-defined redirects live in src/lib/redirects.ts and need a deploy.
 */

export interface ManagedRedirect {
  id: string
  source: string
  destination: string
  permanent: boolean
  enabled: boolean
  notes: string | null
  created_at: string
  updated_at: string | null
}

export const REDIRECT_COLS = 'id, source, destination, permanent, enabled, notes, created_at, updated_at'

export const REDIRECT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'enabled', label: 'Live' },
  { key: 'disabled', label: 'Off' },
] as const
export type RedirectFilter = (typeof REDIRECT_FILTERS)[number]['key']

export async function getManagedRedirects(): Promise<ManagedRedirect[]> {
  const { data, error } = await createAdminClient()
    .from('managed_redirects')
    .select(REDIRECT_COLS)
    .order('created_at', { ascending: false })
    .returns<ManagedRedirect[]>()
  if (error) throw new Error(`managed_redirects: ${error.message}`)
  return data ?? []
}

export function matchesRedirect(r: { source: string; destination: string }, q: string | undefined): boolean {
  if (!q) return true
  const needle = q.toLowerCase()
  return r.source.toLowerCase().includes(needle) || r.destination.toLowerCase().includes(needle)
}

export const CODE_REDIRECTS = REDIRECTS.map((r) => ({ source: r.source, destination: r.destination, permanent: Boolean(r.permanent) }))

// ─── Validation (shared by the server actions) ─────────────────────────────

/** The same key src/proxy.ts matches on: trailing slashes off, "/" stays "/". */
export function normalizePath(path: string): string {
  const clean = path.replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

/** How the old admin stored sources: trimmed, trailing slashes removed (but "/" kept). */
export function cleanSource(source: string): string {
  return source.trim().replace(/(.)\/+$/, '$1')
}

const SITE_HOSTS = new Set(['crazyseal.com', 'www.crazyseal.com'])

/** The on-site path a destination lands on, or null for another site. */
export function localPath(destination: string): string | null {
  if (destination.startsWith('/')) return normalizePath(destination.split(/[?#]/)[0])
  try {
    const url = new URL(destination)
    return SITE_HOSTS.has(url.hostname.toLowerCase()) ? normalizePath(url.pathname) : null
  } catch {
    return null
  }
}

// Mirrors the matcher in src/proxy.ts (keep the two in step): the proxy that
// applies these redirects never runs for these paths.
const PROXY_SKIPS = /^\/(?:_next\/|api\/|admin|pro|.*\.)/

/** The checks the old Redirects page ran before saving. Returns an error message or null. */
export function validateRedirect(source: string, destination: string): string | null {
  const src = source.trim()
  const dest = destination.trim()
  if (!src || !dest) return 'Source and destination are required.'
  if (!src.startsWith('/') || src.startsWith('//')) return 'Source must be a path starting with / (e.g. /old-page).'
  if (/[\s?#]/.test(src)) return 'Source cannot contain spaces, query strings, or fragments.'
  if (!dest.startsWith('/') && !dest.startsWith('https://') && !dest.startsWith('http://')) {
    return 'Destination must be a path starting with / or a full URL.'
  }
  if (/\s/.test(dest)) return 'Destination cannot contain spaces.'
  if (src.replace(/\/+$/, '') === dest.split('?')[0].replace(/\/+$/, '') || normalizePath(src) === localPath(dest)) {
    return 'Source and destination cannot be the same.'
  }
  const codeRule = CODE_REDIRECTS.find((r) => !r.source.includes(':') && normalizePath(r.source) === normalizePath(cleanSource(src)))
  if (codeRule) {
    return `${codeRule.source} already redirects to ${codeRule.destination} in src/lib/redirects.ts, which runs first, so this one would never fire.`
  }
  if (PROXY_SKIPS.test(cleanSource(src))) {
    return 'Redirects can’t start from paths beginning with /pro (including /products and /projects), /admin, /api or /_next, or containing a dot. The site doesn’t check redirects there, so this one would never fire.'
  }
  return null
}

/**
 * Follows the other live redirects from `destination`. Returns the chain
 * (e.g. ["/a", "/b", "/a"]) when it comes back to `source`, else null.
 */
export function findLoop(source: string, destination: string, others: Pick<ManagedRedirect, 'source' | 'destination'>[]): string[] | null {
  const rules = new Map(others.map((r) => [normalizePath(r.source), r.destination]))
  const start = normalizePath(source)
  const chain = [start]
  let at = localPath(destination)
  for (let hop = 0; at && hop < 25; hop++) {
    chain.push(at)
    if (at === start) return chain
    const next = rules.get(at)
    at = next ? localPath(next) : null
  }
  return null
}
