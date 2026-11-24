import { createAdminClient } from '@/lib/supabase/admin'
import { getPricingSettings } from '@/lib/pricing/settings'
import { discountLabel, usd } from '@/lib/pricing/types'
import { QuoteError, repriceQuote } from './create'
import { toQuote } from './data'
import { emailReminder, emailReoffer } from './emails'
import { addQuoteEvent } from './events'

/**
 * Follow-ups for public builder quotes nobody has checked out (daily cron,
 * /api/cron/quote-followups/). Every quote's price is a live offer of
 * pricing_settings.offer_hours (72); then:
 *
 *   reminder: an open quote, not handed to staff, whose offer ends within
 *     reminder_hours (24) and hasn't yet, gets one reminder email
 *     (reminder_sent_at). The cron runs daily, so with reminder_hours under
 *     24 some offers end before a run sees them.
 *   re-offer: with auto_reoffer on, an open quote whose offer ended (within
 *     the last REOFFER_WINDOW_DAYS, so switching it on doesn't mail old
 *     quotes) is refreshed at today's prices, costs and discounts (a new
 *     revision and a new offer_hours window) and emailed to the buyer once
 *     (reoffered_at). After that the buyer can still refresh it themselves.
 *
 * Contractor quotes get neither: contractors work their own pipeline and
 * refresh their quotes in the portal. Each quote is claimed (its timestamp
 * set where still empty) before anything is sent, so two runs at once can't
 * both email it.
 */

const HOUR = 3_600_000
export const REOFFER_WINDOW_DAYS = 7

export interface FollowupRun {
  reminders: number
  offers: number
  skipped: number
}

export async function runQuoteFollowups(now = Date.now()): Promise<FollowupRun> {
  const db = createAdminClient()
  const settings = await getPricingSettings()
  const nowIso = new Date(now).toISOString()
  const run: FollowupRun = { reminders: 0, offers: 0, skipped: 0 }

  if (settings.reminder_hours > 0) {
    const { data: due, error } = await db
      .from('quotes')
      .select('*')
      .eq('audience', 'public')
      .eq('status', 'open')
      .is('reminder_sent_at', null)
      .is('handoff', null)
      .gt('expires_at', nowIso)
      .lte('expires_at', new Date(now + settings.reminder_hours * HOUR).toISOString())
      .order('expires_at')
      .limit(100)
    if (error) throw new Error(`quotes: ${error.message}`)

    for (const row of due ?? []) {
      const { data: claimed } = await db.from('quotes').update({ reminder_sent_at: nowIso }).eq('id', row.id).is('reminder_sent_at', null).select('*').maybeSingle()
      if (!claimed) continue
      const quote = toQuote(claimed as Record<string, unknown>)
      const sent = await emailReminder(quote)
      await addQuoteEvent(quote.id, 'reminder', sent ? `Reminder emailed to ${quote.email}: the offer ends soon` : `Reminder to ${quote.email} failed to send`, { actor: 'Follow-up', data: { sent } })
      if (sent) run.reminders++
    }
  }

  if (!settings.auto_reoffer) return run

  const { data: expired, error: expiredError } = await db
    .from('quotes')
    .select('*')
    .eq('audience', 'public')
    .eq('status', 'open')
    .is('handoff', null)
    .is('reoffered_at', null)
    .lte('expires_at', nowIso)
    .gt('expires_at', new Date(now - REOFFER_WINDOW_DAYS * 24 * HOUR).toISOString())
    .order('expires_at')
    .limit(50)
  if (expiredError) throw new Error(`quotes: ${expiredError.message}`)

  for (const row of expired ?? []) {
    const { data: claimed } = await db.from('quotes').update({ reoffered_at: nowIso }).eq('id', row.id).is('reoffered_at', null).select('*').maybeSingle()
    if (!claimed) continue
    const quote = toQuote(claimed as Record<string, unknown>)
    try {
      const offered = await repriceQuote(quote, { actor: 'Follow-up', reason: 'The offer ended; refreshed at today’s prices and offered again.' })
      const sent = await emailReoffer(offered, settings.offer_hours)
      const discount = offered.discount_pct > 0 ? discountLabel(offered.tier_name, offered.discount_pct) : 'full price'
      await addQuoteEvent(offered.id, 'offer', `Offered again for ${settings.offer_hours} hours at ${usd(offered.total)} (${discount})${sent ? `, emailed to ${offered.email}` : ' (email failed to send)'}`, {
        actor: 'Follow-up',
        data: { pct: offered.discount_pct, hours: settings.offer_hours, total: offered.total, previous_total: quote.total, sent },
      })
      if (sent) run.offers++
    } catch (err) {
      const message = err instanceof QuoteError ? err.message : String(err)
      console.error(`[quote followups] re-offer on ${quote.number} failed`, err)
      await addQuoteEvent(quote.id, 'offer', `Couldn’t offer it again: ${message}`, { actor: 'Follow-up' })
      run.skipped++
    }
  }
  return run
}
