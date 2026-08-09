import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const BATCH_LIMIT = 30

// Checks a batch of site paths and reports the final HTTP status after
// following redirects. Used by the /admin/sitemap health check.
export async function POST(request: NextRequest) {
  const { paths } = await request.json()

  if (
    !Array.isArray(paths) ||
    paths.length === 0 ||
    paths.length > BATCH_LIMIT ||
    paths.some((p) => typeof p !== 'string' || !p.startsWith('/') || p.startsWith('//'))
  ) {
    return NextResponse.json({ error: 'Invalid paths' }, { status: 400 })
  }

  const origin = request.nextUrl.origin
  const results = await Promise.all(
    paths.map(async (path: string) => {
      try {
        const res = await fetch(new URL(path, origin), {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(15000),
        })
        return { path, status: res.status, redirected: res.redirected, finalUrl: res.url }
      } catch {
        return { path, status: 0, redirected: false, finalUrl: null }
      }
    }),
  )

  return NextResponse.json({ results })
}
