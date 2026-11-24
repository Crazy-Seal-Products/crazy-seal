import { createAdminClient } from '@/lib/supabase/admin'
import { createZohoLead } from '@/lib/zoho/client'
import { parseRoofInputs, roofSqft, roofSummary } from '@/lib/pricing/engine'
import type { RoofInputs, ShipTo } from '@/lib/pricing/types'
import { createQuote, QuoteError } from './create'
import type { QuoteRow } from './types'

/**
 * Quotes from the public roof-only builder (/quote/). Each one is also a lead
 * (lead_type 'quote', source_page '/quote/') so it shows in the admin's Leads
 * and goes to Zoho like the site's other quote requests.
 */

const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** A ship-to address from a form body, or null when none of it was given. */
export function cleanShipTo(raw: unknown): ShipTo | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const s: ShipTo = {
    name: clip(r.name, 120) || null,
    company: clip(r.company, 160) || null,
    street: clip(r.street, 160) || null,
    street2: clip(r.street2, 160) || null,
    city: clip(r.city, 80) || null,
    state: clip(r.state, 40).toUpperCase() || null,
    zip: clip(r.zip, 10) || null,
  }
  return s.street || s.city || s.state || s.zip ? s : null
}

export interface PublicQuoteRequest {
  inputs: RoofInputs
  name: string
  email: string
  phone: string
  buyerRole: string
  timeline: string
  shipTo: ShipTo | null
  notes: string
}

export function cleanPublicQuote(body: Record<string, unknown>): PublicQuoteRequest | { error: string } {
  const inputs = parseRoofInputs(body.inputs)
  if ('error' in inputs) return inputs
  const req: PublicQuoteRequest = {
    inputs,
    name: clip(body.name, 120),
    email: clip(body.email, 160).toLowerCase(),
    phone: clip(body.phone, 40),
    buyerRole: clip(body.buyerRole, 60),
    timeline: clip(body.timeline, 60),
    shipTo: cleanShipTo(body.shipTo),
    notes: clip(body.notes, 2000),
  }
  if (!req.name) return { error: 'Add your name.' }
  if (!EMAIL_RE.test(req.email)) return { error: 'Add an email we can send your quote to.' }
  if (req.phone && req.phone.replace(/\D/g, '').length < 10) return { error: 'Check the phone number.' }
  if (req.shipTo?.zip && !/^\d{5}(-\d{4})?$/.test(req.shipTo.zip)) return { error: 'The ZIP needs 5 digits.' }
  return req
}

const PROJECT_TYPE = { rv: 'RV', commercial: 'Commercial', residential: 'Residential' } as const

export interface RequestMeta {
  visitorFingerprint?: string | null
  sessionId?: string | null
  referer?: string | null
  userAgent?: string | null
  ip?: string | null
}

/**
 * The lead a quote for a member of the public is saved as (lead_type
 * 'quote'): the public builder's (source_page '/quote/') and a staff quote
 * for a customer (source_page '/portal/admin/quotes/new/').
 */
export function quoteLeadRow(
  req: Pick<PublicQuoteRequest, 'inputs' | 'name' | 'email' | 'phone' | 'shipTo' | 'notes'>,
  opts: { sourcePage: string; intro?: string },
): Record<string, unknown> {
  return {
    name: req.name,
    email: req.email,
    phone: req.phone || null,
    location: req.shipTo?.zip || null,
    project_type: PROJECT_TYPE[req.inputs.application],
    rv_length: req.inputs.application === 'rv' ? String(req.inputs.rvLengthFt) : null,
    square_footage: String(roofSqft(req.inputs)),
    lead_type: 'quote',
    texting_consent: false,
    message: [`${opts.intro ?? 'Quote builder'}: ${roofSummary(req.inputs)}.`, req.notes].filter(Boolean).join('\n\n'),
    source_page: opts.sourcePage,
  }
}

/** Saves the lead, then the quote linked to it. */
export async function createPublicQuote(req: PublicQuoteRequest, meta: RequestMeta): Promise<QuoteRow> {
  const db = createAdminClient()

  let visitor: Record<string, unknown> | null = null
  if (meta.visitorFingerprint) {
    const { data } = await db.from('visitors').select('*').eq('fingerprint', meta.visitorFingerprint).maybeSingle()
    visitor = data
  }
  let sessionId: string | null = null
  if (meta.sessionId && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
    const { data } = await db.from('sessions').select('id').eq('id', meta.sessionId).maybeSingle<{ id: string }>()
    if (data) {
      sessionId = data.id
      await db.from('sessions').update({ converted: true, conversion_type: 'lead' }).eq('id', data.id)
    }
  }

  const { data: lead, error } = await db
    .from('leads')
    .insert({
      ...quoteLeadRow(req, { sourcePage: '/quote/' }),
      source_url: meta.referer ?? null,
      user_agent: meta.userAgent ?? null,
      user_ip: meta.ip ?? null,
      visitor_id: (visitor?.id as string | undefined) ?? null,
      session_id: sessionId,
      ...(visitor
        ? {
            first_utm_source: visitor.first_utm_source ?? null,
            first_utm_medium: visitor.first_utm_medium ?? null,
            first_utm_campaign: visitor.first_utm_campaign ?? null,
            first_gclid: visitor.first_gclid ?? null,
            first_fbclid: visitor.first_fbclid ?? null,
            first_landing_page: visitor.first_landing_page ?? null,
            first_referrer: visitor.first_referrer ?? null,
            first_seen_at: visitor.first_seen_at ?? null,
          }
        : {}),
    })
    .select('id')
    .single<{ id: string }>()
  if (error) {
    console.error('[quotes] lead insert failed', error)
    throw new QuoteError('Your quote couldn’t be saved. Try again.')
  }

  return createQuote(
    {
      audience: 'public',
      source: 'builder',
      inputs: req.inputs,
      buyer: { name: req.name, email: req.email, phone: req.phone || null, buyerRole: req.buyerRole || null, timeline: req.timeline || null, zip: req.shipTo?.zip ?? null, shipTo: req.shipTo },
      leadId: lead.id,
      notes: req.notes || null,
    },
    req.name,
  )
}

/** Sends the quote's lead to Zoho CRM and stamps it, like /api/leads does. Never throws. */
export async function pushQuoteLeadToZoho(quote: QuoteRow): Promise<void> {
  if (!quote.lead_id) return
  try {
    const [first, ...rest] = quote.name.split(' ')
    const result = await createZohoLead({
      First_Name: first || '',
      Last_Name: rest.join(' ') || quote.name,
      Email: quote.email,
      Phone: quote.phone || undefined,
      Street: quote.ship_to?.street || undefined,
      City: quote.ship_to?.city || undefined,
      State: quote.ship_to?.state || undefined,
      Zip_Code: quote.zip || undefined,
      Lead_Source: 'Website - Purchase Quote',
      Lead_Form_Comments: [`Quote ${quote.number} from the quote builder`, roofSummary(quote.inputs), `Total $${quote.total.toFixed(2)}`, quote.notes].filter(Boolean).join('\n'),
    })
    if (result) await createAdminClient().from('leads').update({ zoho_lead_id: result.id, zoho_synced_at: new Date().toISOString() }).eq('id', quote.lead_id)
  } catch (err) {
    console.error('[quotes] Zoho push failed', err)
  }
}
