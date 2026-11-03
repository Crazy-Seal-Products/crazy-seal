import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { hasAuthSearch } from '@/lib/auth/recovery'

// Admin-managed redirects (managed_redirects table), applied at request time
// so redirects added in the admin's Redirects page work without a deploy. Rules are
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

// Staff sign in to /portal/admin with Supabase Auth. Server components can't
// write cookies, so the session is refreshed here (the @supabase/ssr proxy
// step); without it a sign-in lapses when the hour-long access token expires.
function hasStaffSession(request: NextRequest): boolean {
  return request.cookies.getAll().some((c) => c.name.startsWith('sb-') && c.name.includes('-auth-token'))
}

async function refreshStaffSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return response

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })
  await supabase.auth.getClaims().catch(() => null)
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  if (normalize(pathname) === '/' && hasAuthSearch(search)) {
    const dest = request.nextUrl.clone()
    dest.pathname = '/portal/reset-password/'
    return NextResponse.redirect(dest)
  }

  const rules = await getRules()
  const rule = rules.get(normalize(pathname))
  if (rule) {
    const destination = rule.destination.startsWith('http')
      ? rule.destination
      : new URL(rule.destination, request.url)
    return NextResponse.redirect(destination, rule.permanent ? 301 : 302)
  }

  if (pathname.startsWith('/portal/admin') && hasStaffSession(request)) return refreshStaffSession(request)
  return NextResponse.next()
}

export const config = {
  // Skip Next internals, API routes, and static files. The admin's Redirects
  // page refuses sources this skips (PROXY_SKIPS in lib/portal/admin/redirects.ts).
  matcher: ['/((?!_next/|api/|admin|pro|.*\\.).*)'],
}
