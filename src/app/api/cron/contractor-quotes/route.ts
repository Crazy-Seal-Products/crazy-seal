import { NextRequest, NextResponse } from 'next/server'
import { resendUnsentQuotes } from '@/lib/contractors/quote'
import { isCronRequest } from '@/lib/security/cron-auth'

/**
 * Daily, from Vercel Cron (vercel.json): sends again each contractor quote request from the last
 * two weeks that neither the contractor nor Crazy Seal's lead inbox received
 * (resendUnsentQuotes in lib/contractors/quote).
 *
 * It needs no CRON_SECRET. Anyone can call it, but it only touches requests nobody was told about
 * and tries each at most once an hour, so calling it more often sends nothing extra. If CRON_SECRET
 * is ever set in Vercel, only Vercel Cron can call it.
 */
export const maxDuration = 120

export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && !isCronRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const tried = await resendUnsentQuotes()
    return NextResponse.json({ ok: true, tried })
  } catch (err) {
    console.error('[cron/contractor-quotes]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
