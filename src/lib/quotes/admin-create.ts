'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { logContractorActivity } from '@/lib/contractor/activity'
import { adminCan, requirePortalAdmin, type PortalAdmin } from '@/lib/portal/admin/auth'
import { getRepRoster, repForAdmin } from '@/lib/portal/admin/reps'
import { parseRoofInputs, roofSummary } from '@/lib/pricing/engine'
import { loadPricing } from '@/lib/pricing/load'
import { usd } from '@/lib/pricing/types'
import { adminQuoteContractorContext, quoteContractorRecord, type AdminQuoteContractorContext } from './admin-builder'
import { createQuote, QuoteError } from './create'
import { emailQuoteToBuyer } from './emails'
import { addQuoteEvent } from './events'
import { cleanShipTo, quoteLeadRow } from './public'
import type { QuoteRow } from './types'

/**
 * Staff build a quote themselves (Admin > Quotes > New quote), for a
 * customer or for a contractor, priced by createQuote exactly as the public
 * builder and the contractor portal price theirs. Takes the Quotes section,
 * so Sales reps can quote any customer and any contractor; the quote's rep
 * is the rep who made it (so it shows in their Quotes), else the
 * contractor's rep. A customer quote is also a lead, like the public
 * builder's.
 */

// A 'use server' module exports only async functions (and types).
const SOURCE_PAGE = '/portal/admin/quotes/new/'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const actorOf = (a: PortalAdmin) => `${a.name} (Crazy Seal)`

export type AdminQuoteContractorResult = { ok: true; data: AdminQuoteContractorContext } | { ok: false; error: string }

/** A contractor's details, projects and pricing for the builder's preview, when staff pick them. */
export async function loadAdminQuoteContractor(id: string): Promise<AdminQuoteContractorResult> {
  await requirePortalAdmin('quotes')
  if (!UUID_RE.test(String(id ?? ''))) return { ok: false, error: 'Pick a contractor.' }
  try {
    const [ctx, showCost, roster] = await Promise.all([loadPricing(), adminCan('pricing'), getRepRoster()])
    const data = await adminQuoteContractorContext(id, { ctx, showCost, roster })
    return data ? { ok: true, data } : { ok: false, error: 'That contractor no longer exists.' }
  } catch (err) {
    console.error('[admin quotes] contractor load failed', err)
    return { ok: false, error: 'Their prices couldn’t be loaded. Try again in a minute.' }
  }
}

export interface AdminQuoteInput {
  /** 'public': a customer (the public live-offer pricing); 'contractor': one of the contractors, at their price. */
  audience: 'public' | 'contractor'
  contractorId?: string | null
  projectId?: string | null
  inputs: unknown
  name: string
  email: string
  phone?: string | null
  company?: string | null
  shipTo?: unknown
  notes?: string | null
  /** Email the buyer their quote link once it's saved. */
  emailBuyer?: boolean
}

/** emailed: whether the buyer's email went (null when it wasn't asked for). */
export type AdminQuoteResult = { ok: true; id: string; message: string; emailed: boolean | null } | { ok: false; error: string }

export async function createAdminQuote(input: AdminQuoteInput): Promise<AdminQuoteResult> {
  const admin = await requirePortalAdmin('quotes')
  const audience = input?.audience === 'contractor' ? 'contractor' : input?.audience === 'public' ? 'public' : null
  if (!audience) return { ok: false, error: 'Choose who the quote is for.' }
  const inputs = parseRoofInputs(input?.inputs)
  if ('error' in inputs) return { ok: false, error: inputs.error }

  const name = clip(input?.name, 120)
  const email = clip(input?.email, 160).toLowerCase()
  const phone = clip(input?.phone, 40)
  const company = clip(input?.company, 160)
  const notes = clip(input?.notes, 3000)
  if (!name) return { ok: false, error: 'Add the buyer’s name.' }
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Add an email the quote can go to.' }
  if (phone && phone.replace(/\D/g, '').length < 10) return { ok: false, error: 'Check the phone number.' }
  const shipTo = cleanShipTo(input?.shipTo)
  if (shipTo?.zip && !/^\d{5}(-\d{4})?$/.test(shipTo.zip)) return { ok: false, error: 'The ship-to ZIP needs 5 digits.' }

  // A rep's quotes are theirs, so they can open this one once it's saved.
  const me = repForAdmin(admin, await getRepRoster())
  if (admin.role === 'sales_rep' && !me?.id) {
    return { ok: false, error: 'Your login isn’t linked to a sales rep yet, so you couldn’t open this quote. Ask an admin to link it on Sales reps.' }
  }
  const myRepId = me?.id ?? null

  const db = createAdminClient()
  let quote: QuoteRow
  let project: { id: string; name: string; stage: string } | null = null
  let contractorId: string | null = null
  try {
    if (audience === 'public') {
      const { data: lead, error } = await db
        .from('leads')
        .insert(quoteLeadRow({ inputs, name, email, phone, shipTo, notes }, { sourcePage: SOURCE_PAGE, intro: `Quote by ${admin.name} (Crazy Seal)` }))
        .select('id')
        .single<{ id: string }>()
      if (error) {
        console.error('[admin quotes] lead insert failed', error)
        return { ok: false, error: 'The quote couldn’t be saved. Try again.' }
      }
      quote = await createQuote(
        {
          audience: 'public',
          source: 'admin',
          inputs,
          buyer: { name, email, phone: phone || null, company: company || null, zip: shipTo?.zip ?? null, shipTo },
          leadId: lead.id,
          repId: myRepId,
          createdByStaff: admin.email,
          notes: notes || null,
        },
        actorOf(admin),
      )
    } else {
      const found = input?.contractorId ? await quoteContractorRecord(String(input.contractorId)) : null
      if (!found) return { ok: false, error: 'Pick the contractor this quote is for.' }
      const { record, contractor } = found
      contractorId = contractor.id
      if (input?.projectId) {
        const { data } = await db.from('contractor_projects').select('id, name, stage').eq('id', String(input.projectId)).eq('contractor_id', contractor.id).maybeSingle()
        if (!data) return { ok: false, error: 'That project isn’t this contractor’s.' }
        project = { id: String(data.id), name: String(data.name), stage: String(data.stage) }
      }
      quote = await createQuote(
        {
          audience: 'contractor',
          source: 'admin',
          inputs,
          buyer: {
            name,
            email,
            phone: phone || null,
            company: company || record.company || null,
            buyerRole: 'contractor',
            zip: shipTo?.zip ?? record.zip,
            shipTo,
          },
          contractor,
          projectId: project?.id ?? null,
          repId: myRepId ?? contractor.rep_id,
          createdByStaff: admin.email,
          notes: notes || null,
        },
        actorOf(admin),
      )
    }
  } catch (err) {
    if (err instanceof QuoteError) return { ok: false, error: err.message }
    console.error('[admin quotes] create failed', err)
    return { ok: false, error: 'The quote couldn’t be saved. Try again.' }
  }

  if (contractorId) {
    const staff = `${admin.name.split(' ')[0] || admin.email} (Crazy Seal)`
    await logContractorActivity(contractorId, {
      actorId: null,
      actorName: staff,
      actorRole: 'crazy_seal',
      entity: 'quotes',
      entityId: quote.id,
      action: 'create',
      summary: `${staff} priced materials ${project ? `for ${project.name}` : `for ${roofSummary(inputs)}`}: ${quote.number}, ${usd(quote.total)}`,
    })
    // Like a quote from the portal: quoting a project still in Lead moves it to Quoted.
    if (project?.stage === 'lead') {
      const { data: moved } = await db
        .from('contractor_projects')
        .update({ stage: 'quoted', updated_at: new Date().toISOString() })
        .eq('id', project.id)
        .eq('contractor_id', contractorId)
        .eq('stage', 'lead')
        .select('id')
      if (moved?.length) {
        await logContractorActivity(contractorId, {
          actorId: null,
          actorName: staff,
          actorRole: 'crazy_seal',
          entity: 'projects',
          entityId: project.id,
          action: 'update',
          summary: `${staff} moved ${project.name} to Quoted`,
          changes: { stage: ['lead', 'quoted'] },
        })
      }
    }
  }

  let message = `${quote.number} saved`
  let emailed: boolean | null = null
  if (input?.emailBuyer) {
    const sent = await emailQuoteToBuyer(quote)
    emailed = sent
    if (sent) {
      await addQuoteEvent(quote.id, 'note', `Quote link emailed to ${quote.email}`, { actor: actorOf(admin) })
      message = `${quote.number} saved and emailed to ${quote.email}`
    } else {
      message = `${quote.number} saved, but the email didn’t send. Use “Email the link again”.`
    }
  }

  revalidatePath('/portal/admin/quotes')
  revalidatePath('/portal/admin/leads')
  revalidatePath('/portal/admin/reps')
  if (contractorId) {
    revalidatePath(`/portal/admin/dealers/contractors/${contractorId}/`)
    revalidatePath('/portal/quotes')
    if (project) revalidatePath(`/portal/projects/${project.id}`)
  }
  return { ok: true, id: quote.id, message, emailed }
}
