import { createAdminClient } from '@/lib/supabase/admin'
import type { QuoteEventKind, QuoteEventRow } from './types'

/**
 * A quote's history (quote_events): created, priced, viewed, checkout,
 * handoff, reminder, offer, ordered, lost, cancelled, note. Ordered and
 * duplicate_order also come from the link_quote_order trigger. Writing never
 * throws: a failed history line must not fail the change it describes.
 */
export async function addQuoteEvent(
  quoteId: string,
  kind: QuoteEventKind,
  summary: string,
  opts: { actor?: string | null; data?: Record<string, unknown> | null } = {},
): Promise<void> {
  try {
    const { error } = await createAdminClient()
      .from('quote_events')
      .insert({ quote_id: quoteId, kind, actor: opts.actor?.slice(0, 160) ?? null, summary: summary.slice(0, 1000), data: opts.data ?? null })
    if (error) console.error('[quote_events] insert failed', error.message)
  } catch (err) {
    console.error('[quote_events] insert failed', err)
  }
}

export async function listQuoteEvents(quoteId: string, limit = 200): Promise<QuoteEventRow[]> {
  const { data, error } = await createAdminClient()
    .from('quote_events')
    .select('*')
    .eq('quote_id', quoteId)
    .order('at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)
  if (error) throw new Error(`quote_events: ${error.message}`)
  return (data ?? []) as QuoteEventRow[]
}
