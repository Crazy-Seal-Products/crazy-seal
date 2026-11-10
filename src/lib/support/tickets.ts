import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email/gmail'
import { siteOrigin } from '@/lib/pro/auth'

/**
 * The support queue (support_tickets + support_messages). Everything that
 * needs a person lands here: customer hand-offs, auto-flagged and sampled
 * customer chats, dealer support requests, feedback and feature requests.
 * Owners of the queue are the staff in support_reviewers.
 */

export const TICKET_KINDS = [
  { key: 'customer_handoff', label: 'Customer asked for a person', short: 'Hand-off', group: 'customers' },
  { key: 'auto_flag', label: 'Flagged customer chat', short: 'Auto-flag', group: 'ai' },
  { key: 'review_sample', label: 'Random review sample', short: 'Sample', group: 'ai' },
  { key: 'dealer_support', label: 'Dealer support request', short: 'Dealer', group: 'dealers' },
  { key: 'general_feedback', label: 'Feedback', short: 'Feedback', group: 'feedback' },
  { key: 'feature_request', label: 'Feature request', short: 'Feature', group: 'feedback' },
] as const
export type TicketKind = (typeof TICKET_KINDS)[number]['key']

export const TICKET_STATUSES = [
  { key: 'new', label: 'New' },
  { key: 'triaged', label: 'Triaged' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'waiting', label: 'Waiting on them' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'wont_fix', label: 'Won’t fix' },
] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]['key']
export const OPEN_STATUSES: TicketStatus[] = ['new', 'triaged', 'in_progress', 'waiting']

export const TICKET_CAUSES = [
  { key: '', label: 'Not set' },
  { key: 'missing_knowledge', label: 'Missing or outdated info' },
  { key: 'wrong_answer', label: 'AI got it wrong' },
  { key: 'wrong_source', label: 'AI used the wrong page' },
  { key: 'prompt', label: 'Instructions / tone' },
  { key: 'tool', label: 'Lookup broken' },
  { key: 'site_bug', label: 'Site or Pro Hub bug' },
  { key: 'model', label: 'Model limitation' },
  { key: 'not_ai', label: 'Not an AI problem' },
  { key: 'feature', label: 'Feature request' },
] as const

export const FIX_TYPES = [
  { key: '', label: 'Not fixed yet' },
  { key: 'knowledge', label: 'Added knowledge' },
  { key: 'prompt', label: 'Changed instructions' },
  { key: 'code', label: 'Code change' },
  { key: 'model', label: 'Changed model' },
  { key: 'none', label: 'No change needed' },
] as const

export const PRIORITIES = [
  { key: 'low', label: 'Low' },
  { key: 'normal', label: 'Normal' },
  { key: 'high', label: 'High' },
] as const

export interface Ticket {
  id: string
  number: number
  kind: TicketKind
  status: TicketStatus
  priority: 'low' | 'normal' | 'high'
  subject: string
  conversation_id: string | null
  pro_user_id: string | null
  staff_email: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  cause: string | null
  fix_type: string | null
  resolution: string | null
  assignee_email: string | null
  screen_reasons: string[] | null
  pro_unread: boolean
  created_at: string
  updated_at: string
  resolved_at: string | null
  last_reply_at: string | null
}

export interface TicketMessage {
  id: string
  ticket_id: string
  author_type: 'customer' | 'pro' | 'staff' | 'system'
  author_name: string | null
  author_email: string | null
  body: string
  internal: boolean
  created_at: string
}

export function kindLabel(kind: string): string {
  return TICKET_KINDS.find((k) => k.key === kind)?.label ?? kind
}

export function statusLabel(status: string): string {
  return TICKET_STATUSES.find((s) => s.key === status)?.label ?? status
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function paragraphs(text: string): string {
  return escapeHtml(text).split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px">${p.replace(/\n/g, '<br>')}</p>`).join('')
}

function emailShell(body: string): string {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:600px">${body}<p style="margin-top:24px;color:#666;font-size:13px">Crazy Seal · (800) 963-0131 · info@crazyseal.com</p></div>`
}

export async function reviewerEmails(): Promise<string[]> {
  const { data } = await createAdminClient().from('support_reviewers').select('staff_email')
  return (data ?? []).map((r) => r.staff_email as string)
}

/** Kinds that email the queue owners as soon as they arrive. Auto-flags and samples just wait in the queue. */
const ALERT_KINDS: TicketKind[] = ['customer_handoff', 'dealer_support', 'general_feedback', 'feature_request']

export async function createTicket(input: {
  kind: TicketKind
  subject: string
  body: string
  author: { type: TicketMessage['author_type']; name?: string | null; email?: string | null }
  conversationId?: string | null
  proUserId?: string | null
  staffEmail?: string | null
  contact?: { name?: string | null; email?: string | null; phone?: string | null }
  priority?: Ticket['priority']
  screenReasons?: string[]
}): Promise<Ticket | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      kind: input.kind,
      subject: input.subject.slice(0, 200),
      conversation_id: input.conversationId ?? null,
      pro_user_id: input.proUserId ?? null,
      staff_email: input.staffEmail ?? null,
      contact_name: input.contact?.name ?? null,
      contact_email: input.contact?.email?.toLowerCase() ?? null,
      contact_phone: input.contact?.phone ?? null,
      priority: input.priority ?? 'normal',
      screen_reasons: input.screenReasons ?? null,
    })
    .select()
    .single()
  if (error) {
    // 23505: this chat already has an automatic ticket of this kind.
    if (error.code !== '23505') console.error('[support] ticket not created', error.message)
    return null
  }
  const ticket = data as Ticket
  await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    author_type: input.author.type,
    author_name: input.author.name ?? null,
    author_email: input.author.email ?? null,
    body: input.body.slice(0, 10_000),
  })

  if (ALERT_KINDS.includes(ticket.kind)) {
    await alertReviewers(ticket, input.body).catch((err) => console.error('[support] alert failed', err))
  }
  return ticket
}

export function adminTicketUrl(id: string): string {
  return `${siteOrigin()}/portal/admin/support/${id}/`
}

async function alertReviewers(ticket: Ticket, body: string) {
  const to = await reviewerEmails()
  if (!to.length) return
  const who = ticket.contact_name || ticket.contact_email || ticket.staff_email || 'A dealer'
  await sendEmail({
    to,
    subject: `[Support #${ticket.number}] ${kindLabel(ticket.kind)}: ${ticket.subject}`,
    html: emailShell(
      `<p style="margin:0 0 12px"><strong>${escapeHtml(kindLabel(ticket.kind))}</strong> from ${escapeHtml(who)}</p>${paragraphs(body)}<p><a href="${adminTicketUrl(ticket.id)}">Open in the admin</a></p>`,
    ),
  })
}

export async function getTicket(id: string): Promise<Ticket | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await createAdminClient().from('support_tickets').select('*').eq('id', id).maybeSingle()
  return (data as Ticket | null) ?? null
}

export async function getTicketMessages(ticketId: string, includeInternal: boolean): Promise<TicketMessage[]> {
  let query = createAdminClient().from('support_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })
  if (!includeInternal) query = query.eq('internal', false)
  const { data } = await query
  return (data ?? []) as TicketMessage[]
}

async function proEmail(proUserId: string): Promise<{ email: string; name: string | null } | null> {
  const { data } = await createAdminClient().from('pro_users').select('email, display_name, business_name').eq('id', proUserId).maybeSingle()
  return data ? { email: data.email as string, name: (data.business_name || data.display_name) as string | null } : null
}

/**
 * Adds a reply to a ticket. A public staff reply emails the customer or
 * dealer and marks the ticket "Waiting on them"; a reply from the customer
 * or dealer moves it back to "In progress" and tells the assignee.
 */
export async function addTicketReply(
  ticket: Ticket,
  reply: { authorType: TicketMessage['author_type']; name?: string | null; email?: string | null; body: string; internal?: boolean },
): Promise<void> {
  const supabase = createAdminClient()
  const internal = reply.authorType === 'staff' && Boolean(reply.internal)
  const { error } = await supabase.from('support_messages').insert({
    ticket_id: ticket.id,
    author_type: reply.authorType,
    author_name: reply.name ?? null,
    author_email: reply.email ?? null,
    body: reply.body.slice(0, 10_000),
    internal,
  })
  if (error) throw new Error(`Could not save the reply: ${error.message}`)

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = { updated_at: now }
  if (!internal) patch.last_reply_at = now

  if (reply.authorType === 'staff' && !internal) {
    if (OPEN_STATUSES.includes(ticket.status)) patch.status = 'waiting'
    if (ticket.pro_user_id) patch.pro_unread = true
    await supabase.from('support_tickets').update(patch).eq('id', ticket.id)
    await emailRequester(ticket, reply.body, reply.name ?? 'Crazy Seal Support').catch((err) => console.error('[support] reply email failed', err))
    return
  }

  if (reply.authorType === 'customer' || reply.authorType === 'pro') {
    if (ticket.status === 'waiting' || ticket.status === 'resolved') patch.status = 'in_progress'
    if (ticket.status === 'resolved') patch.resolved_at = null
    await supabase.from('support_tickets').update(patch).eq('id', ticket.id)
    const to = ticket.assignee_email ? [ticket.assignee_email] : await reviewerEmails()
    if (to.length) {
      await sendEmail({
        to,
        subject: `[Support #${ticket.number}] New reply: ${ticket.subject}`,
        html: emailShell(`${paragraphs(reply.body)}<p><a href="${adminTicketUrl(ticket.id)}">Open in the admin</a></p>`),
      }).catch((err) => console.error('[support] assignee email failed', err))
    }
    return
  }

  await supabase.from('support_tickets').update(patch).eq('id', ticket.id)
}

async function emailRequester(ticket: Ticket, body: string, fromName: string) {
  if (ticket.pro_user_id) {
    const pro = await proEmail(ticket.pro_user_id)
    if (!pro) return
    await sendEmail({
      to: pro.email,
      subject: `Re: ${ticket.subject} [Support #${ticket.number}]`,
      html: emailShell(
        `<p style="margin:0 0 12px">${escapeHtml(fromName)} replied to your support request:</p>${paragraphs(body)}<p><a href="${siteOrigin()}/pro/support/?ticket=${ticket.id}">View and reply in your Pro Hub</a></p>`,
      ),
    })
    return
  }
  if (ticket.contact_email) {
    await sendEmail({
      to: ticket.contact_email,
      subject: `Re: ${ticket.subject} [Crazy Seal Support #${ticket.number}]`,
      html: emailShell(
        `<p style="margin:0 0 12px">Hi${ticket.contact_name ? ` ${escapeHtml(ticket.contact_name.split(' ')[0])}` : ''},</p>${paragraphs(body)}<p style="margin:0 0 12px">— ${escapeHtml(fromName)}, Crazy Seal Support</p><p style="color:#666;font-size:13px">Just reply to this email to answer us.</p>`,
      ),
      replyTo: 'info@crazyseal.com',
    })
  }
}

/** Sets status, and the resolved time when it closes or reopens. */
export function statusPatch(status: TicketStatus): Record<string, unknown> {
  const closed = status === 'resolved' || status === 'wont_fix'
  return { status, updated_at: new Date().toISOString(), resolved_at: closed ? new Date().toISOString() : null }
}

/** Emails the dealer that their request was resolved (they see it in the Support tab too). */
export async function notifyResolved(ticket: Ticket, resolution: string | null): Promise<void> {
  if (!ticket.pro_user_id) return
  const pro = await proEmail(ticket.pro_user_id)
  if (!pro) return
  await sendEmail({
    to: pro.email,
    subject: `Resolved: ${ticket.subject} [Support #${ticket.number}]`,
    html: emailShell(
      `<p style="margin:0 0 12px">Your ${escapeHtml(kindLabel(ticket.kind).toLowerCase())} has been marked resolved.</p>${resolution ? paragraphs(resolution) : ''}<p><a href="${siteOrigin()}/pro/support/?ticket=${ticket.id}">View it in your Pro Hub</a></p>`,
    ),
  }).catch((err) => console.error('[support] resolved email failed', err))
}
