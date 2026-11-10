import { NextRequest, NextResponse } from 'next/server'
import { zipPoint } from '@/lib/contractors/data'

/** The map point for a US ZIP, for the contractor finder's search. Public: ZIP centers are Census data. */
export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip')?.trim() ?? ''
  if (!/^\d{5}$/.test(zip)) return NextResponse.json({ error: 'Enter a 5-digit ZIP code.' }, { status: 400 })
  const point = await zipPoint(zip)
  if (!point) return NextResponse.json({ error: 'We couldn’t find that ZIP code.' }, { status: 404 })
  return NextResponse.json(point, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } })
}
