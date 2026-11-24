'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/contractor/activity'
import { portalAction } from '@/lib/contractor/guard'
import { seesRecord } from '@/lib/contractor/roles'
import type { ContractorViewer } from '@/lib/contractor/viewer'
import { parseRoofInputs, roofSummary, round2 } from '@/lib/pricing/engine'
import { usd, type ShipTo } from '@/lib/pricing/types'
import { createCheckout } from './checkout'
import { createQuote, QuoteError, repriceQuote, updateBuyerInfo } from './create'
import { getQuote } from './data'
import { emailStaff } from './emails'
import { requestHandoff } from './handoff'
import { cleanShipTo } from './public'
import { isExpired, type QuoteProposal, type QuoteRow } from './types'

/**
 * The contractor portal's quote writes (/portal/quotes). Creating and
 * changing a quote takes quotes.create; ordering takes orders.create. A
 * quote belongs to the viewer's contractor, and a role without
 * sales.view_all only reaches the quotes they made. View as is read-only
 * (portalAction refuses it).
 */

export type QuoteActionResult = { ok: true; message?: string; id?: string; url?: string } | { ok: false; error: string }

const actorOf = (v: ContractorViewer) => `${v.name} (${v.contractorName})`

/** The quote, if it's this contractor's and the viewer may see it. */
async function ownQuote(viewer: ContractorViewer, id: string): Promise<QuoteRow | null> {
  const quote = await getQuote(id)
  if (!quote || quote.contractor_id !== viewer.contractor.id) return null
  return seesRecord(viewer, [quote.created_by_pro_user]) ? quote : null
}

export interface PortalQuoteInput {
  inputs: unknown
  projectId?: string | null
  shipTo?: unknown
  notes?: string | null
}

export async function createPortalQuote(input: PortalQuoteInput): Promise<QuoteActionResult> {
  const g = await portalAction('quotes.create')
  if (!g.ok) return g
  const viewer = g.viewer
  const inputs = parseRoofInputs(input?.inputs)
  if ('error' in inputs) return { ok: false, error: inputs.error }
  const shipTo: ShipTo | null = cleanShipTo(input?.shipTo)
  if (shipTo?.zip && !/^\d{5}(-\d{4})?$/.test(shipTo.zip)) return { ok: false, error: 'The ship-to ZIP needs 5 digits.' }

  const db = createAdminClient()
  let project: { id: string; name: string; stage: string; assigned_to: string | null; created_by: string | null; ops_lead_id: string | null } | null = null
  if (input?.projectId) {
    const { data } = await db
      .from('contractor_projects')
      .select('id, name, stage, assigned_to, created_by, ops_lead_id')
      .eq('id', input.projectId)
      .eq('contractor_id', viewer.contractor.id)
      .maybeSingle()
    if (!data || !seesRecord(viewer, [data.assigned_to, data.created_by, data.ops_lead_id])) return { ok: false, error: 'That project isn’t one of yours.' }
    project = data
  }

  let quote: QuoteRow
  try {
    quote = await createQuote(
      {
        audience: 'contractor',
        source: 'portal',
        inputs,
        buyer: {
          name: viewer.name,
          email: viewer.email || viewer.contractor.email || '',
          phone: viewer.contractor.phone,
          company: viewer.contractorName,
          buyerRole: 'contractor',
          zip: shipTo?.zip ?? viewer.contractor.zip,
          shipTo,
        },
        contractor: viewer.contractor,
        projectId: project?.id ?? null,
        repId: viewer.contractor.rep_id,
        createdByProUser: viewer.hasAccount ? viewer.proUserId : null,
        notes: input?.notes ?? null,
      },
      actorOf(viewer),
    )
  } catch (err) {
    if (err instanceof QuoteError) return { ok: false, error: err.message }
    console.error('[portal quotes] create failed', err)
    return { ok: false, error: 'The quote couldn’t be saved. Try again.' }
  }

  await logActivity(viewer, {
    entity: 'quotes',
    entityId: quote.id,
    action: 'create',
    summary: `${viewer.name} priced materials ${project ? `for ${project.name}` : `for ${roofSummary(inputs)}`}: ${quote.number}, ${usd(quote.total)}`,
  })

  if (project?.stage === 'lead') {
    const { data: moved } = await db
      .from('contractor_projects')
      .update({ stage: 'quoted', updated_at: new Date().toISOString() })
      .eq('id', project.id)
      .eq('contractor_id', viewer.contractor.id)
      .eq('stage', 'lead')
      .select('id')
    if (moved?.length) {
      await logActivity(viewer, { entity: 'projects', entityId: project.id, action: 'update', summary: `${viewer.name} moved ${project.name} to Quoted`, changes: { stage: ['lead', 'quoted'] } })
    }
  }

  // Freight and anything the store couldn't price need staff now; terms wait until they order.
  if (quote.handoff === 'freight' || quote.handoff === 'no_access') await emailStaff(quote, `Contractor quote needs staff: ${quote.handoff === 'freight' ? 'freight to quote' : 'materials to price'}`)

  revalidatePath('/portal/quotes')
  if (project) revalidatePath(`/portal/projects/${project.id}`)
  return { ok: true, id: quote.id, message: `${quote.number} saved` }
}

export async function savePortalQuoteInfo(id: string, input: { phone?: string; shipTo?: unknown }): Promise<QuoteActionResult> {
  const g = await portalAction('quotes.create')
  if (!g.ok) return g
  const quote = await ownQuote(g.viewer, id)
  if (!quote) return { ok: false, error: 'Quote not found.' }
  const phone = typeof input?.phone === 'string' ? input.phone.trim().slice(0, 40) : undefined
  if (phone && phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Check the phone number.' }
  const shipTo = input && 'shipTo' in input ? cleanShipTo(input.shipTo) : undefined
  if (shipTo?.zip && !/^\d{5}(-\d{4})?$/.test(shipTo.zip)) return { ok: false, error: 'The ZIP needs 5 digits.' }
  try {
    await updateBuyerInfo(quote, { phone, shipTo }, actorOf(g.viewer))
  } catch (err) {
    return { ok: false, error: err instanceof QuoteError ? err.message : 'Couldn’t save that. Try again.' }
  }
  await logActivity(g.viewer, { entity: 'quotes', entityId: id, action: 'update', summary: `${g.viewer.name} added shipping details to ${quote.number}` })
  revalidatePath(`/portal/quotes/${id}`)
  return { ok: true, message: 'Saved' }
}

export async function refreshPortalQuote(id: string): Promise<QuoteActionResult> {
  const g = await portalAction('quotes.create')
  if (!g.ok) return g
  const quote = await ownQuote(g.viewer, id)
  if (!quote) return { ok: false, error: 'Quote not found.' }
  // The price is a live offer: it can be refreshed once it has ended.
  if (!isExpired(quote)) return { ok: false, error: 'This offer is still live. You can refresh it once it ends.' }
  try {
    const next = await repriceQuote(quote, { actor: actorOf(g.viewer), reason: 'Refreshed from the contractor portal after the offer ended.' })
    await logActivity(g.viewer, { entity: 'quotes', entityId: id, action: 'update', summary: `${g.viewer.name} refreshed prices on ${quote.number}: ${usd(next.total)}` })
  } catch (err) {
    return { ok: false, error: err instanceof QuoteError ? err.message : 'Couldn’t refresh prices. Try again.' }
  }
  revalidatePath(`/portal/quotes/${id}`)
  return { ok: true, message: 'Price refreshed: a new live offer' }
}

/**
 * "Place order": a contractor on payment terms has Crazy Seal invoice them
 * (staff are told); everyone else gets the Shopify checkout for the quote and
 * is sent to its invoice link.
 */
export async function placePortalOrder(id: string): Promise<QuoteActionResult> {
  const g = await portalAction('orders.create')
  if (!g.ok) return g
  const viewer = g.viewer
  const quote = await getQuote(id)
  if (!quote || quote.contractor_id !== viewer.contractor.id) return { ok: false, error: 'Quote not found.' }

  if (viewer.contractor.payment_terms === 'terms') {
    await requestHandoff(quote, 'terms_order', { actor: actorOf(viewer) })
    await logActivity(viewer, { entity: 'quotes', entityId: id, action: 'update', summary: `${viewer.name} ordered ${quote.number} on terms (${usd(quote.total)})` })
    revalidatePath(`/portal/quotes/${id}`)
    return { ok: true, message: 'Sent to Crazy Seal. They’ll confirm the order and invoice you.' }
  }

  const result = await createCheckout(quote, { actor: actorOf(viewer) })
  if (!result.ok) {
    revalidatePath(`/portal/quotes/${id}`)
    return { ok: false, error: result.error }
  }
  await logActivity(viewer, { entity: 'quotes', entityId: id, action: 'update', summary: `${viewer.name} opened checkout for ${quote.number} (${usd(quote.total)})` })
  revalidatePath(`/portal/quotes/${id}`)
  return { ok: true, url: result.url }
}

export interface ProposalInput {
  customerName: string
  labor: string
  materialMarkupPct: string
  notes: string
}

/** The contractor's proposal to their own customer, on top of Crazy Seal's material price. */
export async function savePortalProposal(id: string, input: ProposalInput): Promise<QuoteActionResult> {
  const g = await portalAction('quotes.create')
  if (!g.ok) return g
  const quote = await ownQuote(g.viewer, id)
  if (!quote) return { ok: false, error: 'Quote not found.' }
  const labor = Number(String(input?.labor ?? '').replace(/[$,\s]/g, '') || 0)
  const markup = Number(String(input?.materialMarkupPct ?? '').replace(/[%,\s]/g, '') || 0)
  if (!Number.isFinite(labor) || labor < 0 || labor > 10_000_000) return { ok: false, error: 'Labor is a dollar amount.' }
  if (!Number.isFinite(markup) || markup < 0 || markup > 1000) return { ok: false, error: 'Material markup is a percent from 0 to 1000.' }
  const merchandise = round2(quote.total - (quote.shipping_total ?? 0))
  const proposal: QuoteProposal = {
    customerName: String(input?.customerName ?? '').trim().slice(0, 160) || null,
    labor: round2(labor),
    materialMarkupPct: round2(markup),
    total: round2(merchandise * (1 + markup / 100) + (quote.shipping_total ?? 0) + labor),
    notes: String(input?.notes ?? '').trim().slice(0, 4000) || null,
    updatedAt: new Date().toISOString(),
  }
  const { error } = await createAdminClient().from('quotes').update({ proposal, updated_at: proposal.updatedAt }).eq('id', id).eq('contractor_id', g.viewer.contractor.id)
  if (error) return { ok: false, error: 'Couldn’t save the proposal.' }
  await logActivity(g.viewer, { entity: 'quotes', entityId: id, action: 'update', summary: `${g.viewer.name} updated the customer proposal on ${quote.number}: ${usd(proposal.total)}` })
  revalidatePath(`/portal/quotes/${id}`)
  return { ok: true, message: 'Proposal saved' }
}
