// Plain rows for the contractor portal's quote tables (no costs, no buyer
// details), built on the server and handed to PortalQuotesTable. Plain
// module: no 'use client', so server pages can call it.

import { dateShort } from '@/lib/portal/admin/format'
import { roofSummary } from '@/lib/pricing/engine'
import { isExpired, QUOTE_STATUS_LABEL, type QuoteRow, type QuoteStatus } from '@/lib/quotes/types'
import type { QuoteListRow } from './PortalQuoteParts'

export const QUOTE_PILL: Record<QuoteStatus, string> = { open: 'new', checkout: 'processing', ordered: 'won', lost: 'not_started', cancelled: 'draft' }

/** Saved this recently, a quote's row flashes in on the list. */
const FRESH_MS = 3 * 60_000

export function quoteListRows(quotes: QuoteRow[], projects: Map<string, string>, now: number): QuoteListRow[] {
  return quotes.map((q) => {
    const stale = (q.status === 'open' || q.status === 'checkout') && isExpired(q, now)
    const projectName = q.project_id ? projects.get(q.project_id) : undefined
    return {
      id: q.id,
      number: q.number,
      roof: roofSummary(q.inputs),
      project: q.project_id && projectName ? { id: q.project_id, name: projectName } : null,
      total: q.total,
      pill: stale ? 'not_started' : QUOTE_PILL[q.status],
      label: stale ? 'Offer ended' : QUOTE_STATUS_LABEL[q.status],
      created: dateShort(q.created_at),
      fresh: now - Date.parse(q.created_at) < FRESH_MS,
    }
  })
}
