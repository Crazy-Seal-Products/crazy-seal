import { NextRequest, NextResponse } from 'next/server'
import { runQuoteFollowups } from '@/lib/quotes/followups'
import { isCronRequest } from '@/lib/security/cron-auth'

/**
 * Daily, from Vercel Cron (vercel.json): reminders, and with auto_reoffer on
 * the follow-up offer, for public builder quotes nobody has checked out
 * (runQuoteFollowups in lib/quotes/followups).
 *
 * Like /api/cron/contractor-quotes/, it needs no CRON_SECRET: each quote gets
 * at most one reminder and one offer, each claimed before it's sent and only
 * once its time has come, so calling it more often sends nothing extra. If
 * CRON_SECRET is set in Vercel, only Vercel Cron can call it.
 */
export const maxDuration = 300

export async function GET(request: NextRequest) {
  if (process.env.CRON_SECRET && !isCronRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const run = await runQuoteFollowups()
    return NextResponse.json({ ok: true, ...run })
  } catch (err) {
    console.error('[cron/quote-followups]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
