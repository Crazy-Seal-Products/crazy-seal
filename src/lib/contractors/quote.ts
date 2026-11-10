import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/gmail'
import { contactName, SEGMENT_LABEL, type ContractorRow } from './types'

/**
 * Quote requests from contractor pages. Each one is a row in leads
 * (lead_type 'quote', contractor_id set), so it shows in the admin's Leads
 * and on the contractor's admin page. The contractor gets an email they can
 * reply to straight to the customer; Crazy Seal's lead inbox gets a copy.
 * No auto-reply goes to the customer: the page is the contractor's brand.
 * A request that neither email reached is sent again by resendUnsentQuotes
 * (a daily cron, or Send again in the admin). Modeled in
 * docs/statecharts/quote-requests.
 */

export interface QuoteRequest {
  slug: string
  name: string
  email: string
  phone: string
  zip: string
  /** RV length in feet, or roof size in square feet for commercial. */
  size: string
  message: string
  textingConsent: boolean
}

type QuoteContractor = Pick<ContractorRow, 'id' | 'slug' | 'segment' | 'company' | 'first_name' | 'goes_by' | 'last_name' | 'email'>
const QUOTE_CONTRACTOR = 'id, slug, segment, company, first_name, goes_by, last_name, email'

export interface RecordedQuote {
  leadId: string
  contractor: QuoteContractor
  request: QuoteRequest
}

const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

/** The request with every field trimmed, or what's wrong with it. */
export function cleanQuote(body: Record<string, unknown>): QuoteRequest | { error: string } {
  const q: QuoteRequest = {
    slug: clip(body.slug, 80).toLowerCase(),
    name: clip(body.name, 120),
    email: clip(body.email, 160).toLowerCase(),
    phone: clip(body.phone, 40),
    zip: clip(body.zip, 10),
    size: clip(body.size, 40),
    message: clip(body.message, 3000),
    textingConsent: body.texting_consent === true,
  }
  if (!q.slug) return { error: 'Missing contractor.' }
  if (!q.name) return { error: 'Add your name.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email)) return { error: 'Add an email they can reply to.' }
  if (q.zip && !/^\d{5}$/.test(q.zip)) return { error: 'The ZIP needs 5 digits.' }
  return q
}

/**
 * Saves the request as a lead for the listed contractor at `slug`, linked to
 * the visitor's tracking session when there is one. Null when there's no such
 * listed contractor.
 */
export async function recordQuote(
  request: QuoteRequest,
  meta: { visitorFingerprint?: string | null; sessionId?: string | null; referer?: string | null; userAgent?: string | null; ip?: string | null },
): Promise<RecordedQuote | null> {
  const db = createAdminClient()
  const listed = (column: 'slug' | 'id', value: string) =>
    db.from('contractors').select(QUOTE_CONTRACTOR).eq(column, value).eq('is_listed', true).maybeSingle<QuoteContractor>()
  let { data: contractor } = await listed('slug', request.slug)
  if (!contractor) {
    // The visitor's page may be at an address the contractor used to have (an admin renamed it).
    const { data: moved } = await db.from('contractor_redirects').select('contractor_id').eq('slug', request.slug).maybeSingle<{ contractor_id: string }>()
    if (moved) ({ data: contractor } = await listed('id', moved.contractor_id))
  }
  if (!contractor) return null

  let visitorId: string | null = null
  if (meta.visitorFingerprint) {
    const { data } = await db.from('visitors').select('id').eq('fingerprint', meta.visitorFingerprint).maybeSingle<{ id: string }>()
    visitorId = data?.id ?? null
  }
  let sessionId: string | null = null
  if (meta.sessionId && /^[0-9a-f-]{36}$/i.test(meta.sessionId)) {
    const { data } = await db.from('sessions').select('id').eq('id', meta.sessionId).maybeSingle<{ id: string }>()
    if (data) {
      sessionId = data.id
      await db.from('sessions').update({ converted: true, conversion_type: 'lead' }).eq('id', data.id)
    }
  }

  const business = contractor.company || contactName(contractor)
  const { data: lead, error } = await db
    .from('leads')
    .insert({
      name: request.name,
      email: request.email,
      phone: request.phone || null,
      location: request.zip || null,
      project_type: contractor.segment === 'commercial' ? 'Commercial' : 'RV',
      rv_length: contractor.segment === 'rv' ? request.size || null : null,
      square_footage: contractor.segment === 'commercial' ? request.size || null : null,
      lead_type: 'quote',
      texting_consent: request.textingConsent,
      message: [`Quote request for ${business} (contractor page).`, request.message].filter(Boolean).join('\n\n'),
      source_page: `/contractor/${contractor.slug}`,
      source_url: meta.referer ?? null,
      user_agent: meta.userAgent ?? null,
      user_ip: meta.ip ?? null,
      visitor_id: visitorId,
      session_id: sessionId,
      contractor_id: contractor.id,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) throw new Error(`leads insert: ${error.message}`)

  if (visitorId) {
    await db.from('journey_events').insert({
      visitor_id: visitorId,
      session_id: sessionId,
      lead_id: lead.id,
      event_type: 'lead_created',
      event_data: { email: request.email, source_page: `/contractor/${contractor.slug}`, name: request.name },
    })
  }
  return { leadId: lead.id, contractor, request }
}

function escape(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

/** The email body: the customer's details as a small table. */
export function quoteEmailHtml({ contractor, request }: Pick<RecordedQuote, 'contractor' | 'request'>, intro: string): string {
  const sizeLabel = contractor.segment === 'commercial' ? 'Roof size (sq ft)' : 'RV length (ft)'
  const rows: [string, string][] = [
    ['Name', request.name],
    ['Email', request.email],
    ['Phone', request.phone],
    ['ZIP', request.zip],
    [sizeLabel, request.size],
    ['OK to text', request.phone ? (request.textingConsent ? 'Yes' : 'No') : ''],
    ['Message', request.message],
  ]
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;color:#555;vertical-align:top;white-space:nowrap;">${escape(k)}</td><td style="padding:6px 12px;white-space:pre-wrap;">${escape(v)}</td></tr>`,
    )
    .join('')
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111;"><p>${escape(intro)}</p><table style="border-collapse:collapse;width:100%;max-width:600px;">${body}</table></div>`
}

/**
 * Emails the contractor (reply goes to the customer) and copies Crazy Seal's
 * lead inbox, then stamps contractor_notified_at. Errors are logged, not
 * thrown: the lead is already saved.
 */
export async function notifyQuote(quote: RecordedQuote): Promise<void> {
  const { contractor, request } = quote
  const business = contractor.company || contactName(contractor)
  const db = createAdminClient()
  let sent = false

  if (contractor.email) {
    try {
      await sendEmail({
        to: contractor.email,
        replyTo: request.email,
        subject: `New quote request from ${request.name}`,
        html: quoteEmailHtml(
          quote,
          `${request.name} asked for a quote on your Crazy Seal contractor page. Reply to this email to answer them directly.`,
        ),
      })
      sent = true
      await db.from('leads').update({ contractor_notified_at: new Date().toISOString() }).eq('id', quote.leadId)
    } catch (err) {
      console.error('[contractor quote] contractor email failed', err)
    }
  }

  try {
    await sendEmail({
      to: process.env.LEAD_NOTIFICATION_EMAIL || 'info@crazyseal.com',
      replyTo: request.email,
      subject: `Contractor quote request — ${business} — ${request.name}`,
      html: quoteEmailHtml(
        quote,
        `${SEGMENT_LABEL[contractor.segment]} quote request from /contractor/${contractor.slug} for ${business}. ${
          sent
            ? `It was emailed to ${contractor.email}.`
            : contractor.email
              ? `Emailing it to ${contractor.email} failed, so please pass it on.`
              : 'They have no email on file, so please pass it on.'
        }`,
      ),
    })
    await db.from('leads').update({ quote_team_notified_at: new Date().toISOString() }).eq('id', quote.leadId)
  } catch (err) {
    console.error('[contractor quote] team copy failed', err)
  }
}

const PREFIX = /^Quote request for .* \(contractor page\)\.\n*/

interface UnsentLead {
  id: string
  name: string
  email: string
  phone: string | null
  location: string | null
  rv_length: string | null
  square_footage: string | null
  message: string | null
  texting_consent: boolean | null
  contractor_id: string
  quote_last_try_at: string | null
}

/** The least time between two tries at the same request, however often the retry is called. */
const RETRY_GAP_MS = 60 * 60_000

/**
 * Sends again each contractor quote request that neither email reached: no
 * contractor_notified_at and no quote_team_notified_at (both emails failed, or
 * the server stopped before its after() work ran). Leaves requests younger than
 * `minAgeMinutes` to the request that is still sending them, and tries each at
 * most once an hour, since the retry route can be called by anyone. A try is
 * sent only by the caller that claims it, by moving quote_last_try_at forward
 * from the value it read, so two calls at once can't both send it. With
 * `leadId` (Send again in the admin) it skips the hourly wait. Returns how many
 * it tried.
 */
export async function resendUnsentQuotes({ leadId, minAgeMinutes = 10, days = 14 }: { leadId?: string; minAgeMinutes?: number; days?: number } = {}): Promise<number> {
  const db = createAdminClient()
  let query = db
    .from('leads')
    .select('id, name, email, phone, location, rv_length, square_footage, message, texting_consent, contractor_id, quote_last_try_at')
    .not('contractor_id', 'is', null)
    .is('contractor_notified_at', null)
    .is('quote_team_notified_at', null)
  query = leadId
    ? query.eq('id', leadId)
    : query
        .lte('created_at', new Date(Date.now() - minAgeMinutes * 60_000).toISOString())
        .gte('created_at', new Date(Date.now() - days * 86_400_000).toISOString())
  const { data, error } = await query.limit(200)
  if (error) throw new Error(`leads: ${error.message}`)
  const due = ((data ?? []) as UnsentLead[])
    .filter((l) => leadId || !l.quote_last_try_at || Date.now() - new Date(l.quote_last_try_at).getTime() >= RETRY_GAP_MS)
    .slice(0, 50)

  let tried = 0
  for (const lead of due) {
    let claim = db.from('leads').update({ quote_last_try_at: new Date().toISOString() }).eq('id', lead.id)
    claim = lead.quote_last_try_at ? claim.eq('quote_last_try_at', lead.quote_last_try_at) : claim.is('quote_last_try_at', null)
    const { data: claimed, error: claimError } = await claim.select('id')
    if (claimError || !claimed?.length) continue // another call got this try
    const { data: contractor } = await db.from('contractors').select(QUOTE_CONTRACTOR).eq('id', lead.contractor_id).maybeSingle<QuoteContractor>()
    if (!contractor) continue
    tried++
    await notifyQuote({
      leadId: lead.id,
      contractor,
      request: {
        slug: contractor.slug,
        name: lead.name,
        email: lead.email,
        phone: lead.phone ?? '',
        zip: lead.location ?? '',
        size: (contractor.segment === 'commercial' ? lead.square_footage : lead.rv_length) ?? '',
        message: (lead.message ?? '').replace(PREFIX, ''),
        textingConsent: Boolean(lead.texting_consent),
      },
    })
  }
  return tried
}
