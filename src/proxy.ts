import { NextRequest, NextResponse } from 'next/server'

// Admin-managed redirects (managed_redirects table), applied at request time
// so redirects added in /admin/redirects work without a deploy. Rules are
// cached in module scope for a minute to keep the hot path fast.
// Next 16 proxy convention (formerly middleware.ts).

interface Rule {
  source: string
  destination: string
  permanent: boolean
}

const CACHE_TTL_MS = 60_000
let cache: { rules: Map<string, Rule>; fetchedAt: number } | null = null

function normalize(path: string): string {
  const clean = path.replace(/\/+$/, '')
  return clean === '' ? '/' : clean
}

async function getRules(): Promise<Map<string, Rule>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) return cache.rules

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return new Map()

  try {
    const res = await fetch(
      `${url}/rest/v1/managed_redirects?select=source,destination,permanent&enabled=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    )
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows: Rule[] = await res.json()
    const rules = new Map(rows.map((r) => [normalize(r.source), r]))
    cache = { rules, fetchedAt: Date.now() }
    return rules
  } catch {
    // Fail open: never block page loads because the redirect lookup failed
    return cache?.rules ?? new Map()
  }
}

export async function proxy(request: NextRequest) {
  const rules = await getRules()
  if (rules.size === 0) return NextResponse.next()

  const rule = rules.get(normalize(request.nextUrl.pathname))
  if (!rule) return NextResponse.next()

  const destination = rule.destination.startsWith('http')
    ? rule.destination
    : new URL(rule.destination, request.url)
  return NextResponse.redirect(destination, rule.permanent ? 301 : 302)
}

export const config = {
  // Skip Next internals, API routes, and static files
  matcher: ['/((?!_next/|api/|admin|.*\\.).*)'],
}
