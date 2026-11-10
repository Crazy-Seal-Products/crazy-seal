'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { clearAdminCache } from '@/lib/portal/admin/cache'
import { siteOrigin } from '@/lib/pro/auth'
import type { ActionResult } from '@/components/portal/admin/controls'
import { refreshSiteKnowledge } from '@/lib/ai/knowledge'
import {
  addTicketReply,
  createTicket,
  FIX_TYPES,
  getTicket,
  notifyResolved,
  PRIORITIES,
  statusPatch,
  TICKET_CAUSES,
  TICKET_STATUSES,
  type TicketStatus,
} from './tickets'

/** Admin actions for the Support inbox and AI review pages. */

function done(message?: string): ActionResult {
  clearAdminCache()
  revalidatePath('/portal/admin', 'layout')
  return { ok: true, message }
}

export async function setTicketStatus(id: string, status: string): Promise<ActionResult> {
  await requirePortalAdmin('support')
  if (!TICKET_STATUSES.some((s) => s.key === status)) return { ok: false, error: 'Unknown status' }
  const ticket = await getTicket(id)
  if (!ticket) return { ok: false, error: 'Ticket not found' }
  const { error } = await createAdminClient().from('support_tickets').update(statusPatch(status as TicketStatus)).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  if (status === 'resolved' && ticket.status !== 'resolved') await notifyResolved(ticket, ticket.resolution)
  return done()
}

const FIELDS = {
  cause: TICKET_CAUSES.map((c) => c.key),
  fix_type: FIX_TYPES.map((f) => f.key),
  priority: PRIORITIES.map((p) => p.key),
} as const

export async function setTicketField(id: string, field: 'cause' | 'fix_type' | 'priority', value: string): Promise<ActionResult> {
  await requirePortalAdmin('support')
  if (!(FIELDS[field] as readonly string[]).includes(value)) return { ok: false, error: 'Unknown value' }
  const { error } = await createAdminClient()
    .from('support_tickets')
    .update({ [field]: value || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  return done()
}

export async function assignTicket(id: string, email: string): Promise<ActionResult> {
  await requirePortalAdmin('support')
  const { error } = await createAdminClient()
    .from('support_tickets')
    .update({ assignee_email: email || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  return done()
}

export async function replyToTicket(id: string, body: string, internal: boolean): Promise<ActionResult> {
  const admin = await requirePortalAdmin('support')
  const text = body.trim()
  if (!text) return { ok: false, error: 'Write something first' }
  const ticket = await getTicket(id)
  if (!ticket) return { ok: false, error: 'Ticket not found' }
  if (!internal && !ticket.pro_user_id && !ticket.contact_email) {
    return { ok: false, error: 'No email on this ticket to reply to. Add an internal note instead.' }
  }
  try {
    await addTicketReply(ticket, { authorType: 'staff', name: admin.name, email: admin.email, body: text, internal })
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not send' }
  }
  if (!ticket.assignee_email) await createAdminClient().from('support_tickets').update({ assignee_email: admin.email }).eq('id', id)
  return done(internal ? 'Note added' : 'Reply sent')
}

export async function saveResolution(id: string, resolution: string): Promise<ActionResult> {
  await requirePortalAdmin('support')
  const { error } = await createAdminClient()
    .from('support_tickets')
    .update({ resolution: resolution.trim() || null, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  return done('Saved')
}

// ─── Test cases ──────────────────────────────────────────────────────────

export async function saveEvalCase(ticketId: string | null, input: {
  assistant: string
  question: string
  facts: string
  behavior: string
  notes?: string
}): Promise<ActionResult> {
  const admin = await requirePortalAdmin(['support', 'ai_review'])
  if (!['customer', 'dealer', 'staff'].includes(input.assistant)) return { ok: false, error: 'Pick an assistant' }
  if (!['answer', 'decline', 'handoff', 'tool'].includes(input.behavior)) return { ok: false, error: 'Pick the expected behavior' }
  const question = input.question.trim()
  if (!question) return { ok: false, error: 'Add the question' }
  const facts = input.facts.split('\n').map((f) => f.trim()).filter(Boolean)
  const { error } = await createAdminClient().from('ai_eval_cases').insert({
    assistant: input.assistant,
    question: question.slice(0, 2000),
    expected_facts: facts.slice(0, 20),
    expected_behavior: input.behavior,
    notes: input.notes?.trim() || null,
    origin_ticket_id: ticketId || null,
    created_by: admin.email,
  })
  if (error) return { ok: false, error: 'Could not save' }
  return done('Test case saved')
}

export async function setEvalCaseActive(id: string, active: boolean): Promise<ActionResult> {
  await requirePortalAdmin('ai_review')
  const { error } = await createAdminClient().from('ai_eval_cases').update({ active }).eq('id', id)
  if (error) return { ok: false, error: 'Could not save' }
  return done()
}

// ─── Knowledge ───────────────────────────────────────────────────────────

export async function addKnowledgeNote(ticketId: string | null, input: { title: string; body: string; audience: string }): Promise<ActionResult> {
  const admin = await requirePortalAdmin(['support', 'ai_review'])
  const title = input.title.trim()
  const body = input.body.trim()
  if (!title || !body) return { ok: false, error: 'Add a title and the facts' }
  const { error } = await createAdminClient().from('ai_knowledge').insert({
    source: 'note',
    audience: input.audience === 'dealer' ? 'dealer' : 'all',
    title: title.slice(0, 200),
    body: body.slice(0, 8000),
    created_by: admin.email,
  })
  if (error) return { ok: false, error: 'Could not save' }
  if (ticketId) {
    await createAdminClient()
      .from('support_tickets')
      .update({ fix_type: 'knowledge', updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .is('fix_type', null)
  }
  return done('Knowledge added. The assistants use it from the next question.')
}

export async function updateKnowledgeNote(id: string, input: { title: string; body: string; audience: string }): Promise<ActionResult> {
  await requirePortalAdmin('ai_review')
  const { error } = await createAdminClient()
    .from('ai_knowledge')
    .update({
      title: input.title.trim().slice(0, 200),
      body: input.body.trim().slice(0, 8000),
      audience: input.audience === 'dealer' ? 'dealer' : 'all',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('source', 'note')
  if (error) return { ok: false, error: 'Could not save' }
  return done('Saved')
}

export async function setKnowledgeNoteActive(id: string, active: boolean): Promise<ActionResult> {
  await requirePortalAdmin('ai_review')
  const { error } = await createAdminClient().from('ai_knowledge').update({ active, updated_at: new Date().toISOString() }).eq('id', id).eq('source', 'note')
  if (error) return { ok: false, error: 'Could not save' }
  return done(active ? 'Switched on' : 'Switched off')
}

export async function refreshKnowledge(): Promise<ActionResult> {
  await requirePortalAdmin('ai_review')
  try {
    const r = await refreshSiteKnowledge(siteOrigin())
    if (!r.chunks) return { ok: false, error: `No pages could be read. ${r.failed.slice(0, 3).join('; ')}` }
    return done(`Read ${r.pages} pages into ${r.chunks} chunks${r.failed.length ? ` · ${r.failed.length} skipped` : ''}`)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Refresh failed' }
  }
}

// ─── Staff feedback (from the Assistant page) ────────────────────────────

export async function sendStaffFeedback(kind: string, subject: string, body: string): Promise<ActionResult> {
  const admin = await requirePortalAdmin('assistant')
  const text = body.trim()
  if (!text) return { ok: false, error: 'Write a few words first' }
  const ticket = await createTicket({
    kind: kind === 'feature_request' ? 'feature_request' : 'general_feedback',
    subject: subject.trim().slice(0, 150) || text.split('\n')[0].slice(0, 100),
    body: text.slice(0, 4000),
    author: { type: 'staff', name: admin.name, email: admin.email },
    staffEmail: admin.email,
    contact: { name: admin.name, email: admin.email },
  })
  if (!ticket) return { ok: false, error: 'Could not send' }
  return done(`Sent as #${ticket.number}. Thanks!`)
}
