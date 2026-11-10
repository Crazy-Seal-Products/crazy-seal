import { createAdminClient } from '@/lib/supabase/admin'
import { memo } from '@/lib/portal/admin/cache'
import { isMissingTable } from '@/lib/portal/admin/permissions'
import { OPEN_STATUSES, TICKET_KINDS, type Ticket, type TicketKind } from './tickets'

/** Reads for the admin's Support inbox and AI review pages. */

export const QUEUES = [
  { key: 'all', label: 'All' },
  { key: 'customers', label: 'Customers' },
  { key: 'dealers', label: 'Dealers' },
  { key: 'ai', label: 'AI review' },
  { key: 'feedback', label: 'Feedback & requests' },
] as const
export type Queue = (typeof QUEUES)[number]['key']

export const STATUS_FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'new', label: 'New' },
  { key: 'mine', label: 'Assigned to me' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
] as const
export type StatusFilter = (typeof STATUS_FILTERS)[number]['key']

function kindsFor(queue: Queue): TicketKind[] | null {
  if (queue === 'all') return null
  return TICKET_KINDS.filter((k) => k.group === queue).map((k) => k.key)
}

export function countNewTickets(): Promise<number> {
  return memo('support:new-count', 30_000, async () => {
    const { count, error } = await createAdminClient().from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'new')
    if (error && !isMissingTable(error)) console.error('[support] count failed', error.message)
    return count ?? 0
  })
}

const PAGE_SIZE = 40

export async function listTickets(opts: { queue: Queue; status: StatusFilter; q?: string; page: number; me: string }) {
  const supabase = createAdminClient()
  let query = supabase.from('support_tickets').select('*', { count: 'exact' })
  const kinds = kindsFor(opts.queue)
  if (kinds) query = query.in('kind', kinds)
  if (opts.status === 'open') query = query.in('status', OPEN_STATUSES)
  else if (opts.status === 'new') query = query.eq('status', 'new')
  else if (opts.status === 'closed') query = query.in('status', ['resolved', 'wont_fix'])
  else if (opts.status === 'mine') query = query.eq('assignee_email', opts.me).in('status', OPEN_STATUSES)
  if (opts.q) {
    const n = Number(opts.q.replace(/^#/, ''))
    if (Number.isInteger(n) && n > 0) query = query.eq('number', n)
    else query = query.ilike('subject', `%${opts.q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`)
  }
  const from = (opts.page - 1) * PAGE_SIZE
  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, from + PAGE_SIZE - 1)
  if (error && !isMissingTable(error)) throw new Error(`support_tickets: ${error.message}`)
  // Within the page: open first, then high priority, then newest.
  const rank = { high: 0, normal: 1, low: 2 } as const
  const rows = ((data ?? []) as Ticket[]).sort(
    (a, b) => Number(OPEN_STATUSES.includes(b.status)) - Number(OPEN_STATUSES.includes(a.status)) || rank[a.priority] - rank[b.priority] || b.created_at.localeCompare(a.created_at),
  )
  return { rows, total: count ?? 0, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)), missing: isMissingTable(error) }
}

export async function queueCounts(): Promise<Record<Queue, number>> {
  const { data } = await createAdminClient().from('support_tickets').select('kind').in('status', OPEN_STATUSES).limit(5000)
  const counts: Record<Queue, number> = { all: 0, customers: 0, dealers: 0, ai: 0, feedback: 0 }
  for (const r of data ?? []) {
    counts.all++
    const group = TICKET_KINDS.find((k) => k.key === r.kind)?.group
    if (group) counts[group]++
  }
  return counts
}

export interface Reviewer {
  email: string
  name: string
}

export async function listReviewers(): Promise<Reviewer[]> {
  const supabase = createAdminClient()
  const { data } = await supabase.from('support_reviewers').select('staff_email')
  const emails = (data ?? []).map((r) => r.staff_email as string)
  if (!emails.length) return []
  const { data: staff } = await supabase.from('staff').select('email, name').in('email', emails)
  return emails.map((email) => ({ email, name: (staff ?? []).find((s) => (s.email as string).toLowerCase() === email)?.name || email.split('@')[0] }))
}

/** Hides email addresses and phone numbers in transcripts shown for review. */
export function redact(text: string): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[phone]')
}

// ─── AI metrics ──────────────────────────────────────────────────────────

interface MsgRow {
  conversation_id: string
  role: string
  ttft_ms: number | null
  total_ms: number | null
  cost_usd: number | null
  error: string | null
  created_at: string
}

function percentile(values: number[], p: number): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))]
}

export interface AssistantMetrics {
  conversations: number
  answers: number
  failed: number
  ttftP50: number | null
  ttftP90: number | null
  cost: number
  costPerConversation: number | null
}

export async function aiMetrics(days: number) {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const [convs, msgs, tickets, resolved] = await Promise.all([
    supabase.from('ai_conversations').select('id, assistant').gte('created_at', since).limit(20_000),
    supabase.from('ai_messages').select('conversation_id, role, ttft_ms, total_ms, cost_usd, error, created_at').eq('role', 'assistant').gte('created_at', since).limit(50_000),
    supabase.from('support_tickets').select('kind, status').gte('created_at', since).limit(10_000),
    supabase.from('support_tickets').select('created_at, resolved_at').not('resolved_at', 'is', null).gte('resolved_at', since).limit(10_000),
  ])

  const assistantOf = new Map((convs.data ?? []).map((c) => [c.id as string, c.assistant as string]))
  const per: Record<string, AssistantMetrics> = {}
  for (const a of ['customer', 'dealer', 'staff']) {
    const rows = ((msgs.data ?? []) as MsgRow[]).filter((m) => assistantOf.get(m.conversation_id) === a)
    const conversations = (convs.data ?? []).filter((c) => c.assistant === a).length
    const cost = rows.reduce((s, m) => s + Number(m.cost_usd ?? 0), 0)
    const ttfts = rows.map((m) => m.ttft_ms).filter((v): v is number => typeof v === 'number')
    per[a] = {
      conversations,
      answers: rows.length,
      failed: rows.filter((m) => m.error).length,
      ttftP50: percentile(ttfts, 50),
      ttftP90: percentile(ttfts, 90),
      cost,
      costPerConversation: conversations ? cost / conversations : null,
    }
  }

  const t = tickets.data ?? []
  const customerConversations = per.customer.conversations
  const hours = (resolved.data ?? []).map((r) => (Date.parse(r.resolved_at as string) - Date.parse(r.created_at as string)) / 3_600_000)

  return {
    per,
    handoffs: t.filter((r) => r.kind === 'customer_handoff').length,
    autoFlags: t.filter((r) => r.kind === 'auto_flag').length,
    samples: t.filter((r) => r.kind === 'review_sample').length,
    dealerRequests: t.filter((r) => r.kind === 'dealer_support').length,
    feedback: t.filter((r) => r.kind === 'general_feedback' || r.kind === 'feature_request').length,
    flagRate: customerConversations ? t.filter((r) => r.kind === 'auto_flag').length / customerConversations : null,
    handoffRate: customerConversations ? t.filter((r) => r.kind === 'customer_handoff').length / customerConversations : null,
    resolvedCount: hours.length,
    medianResolveHours: percentile(hours, 50),
    missing: isMissingTable(convs.error),
  }
}

export async function openTicketCount(): Promise<number> {
  const { count } = await createAdminClient().from('support_tickets').select('id', { count: 'exact', head: true }).in('status', OPEN_STATUSES)
  return count ?? 0
}

export async function causeBreakdown(days: number): Promise<{ cause: string; count: number }[]> {
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const { data } = await createAdminClient().from('support_tickets').select('cause').not('cause', 'is', null).gte('created_at', since).limit(10_000)
  const counts = new Map<string, number>()
  for (const r of data ?? []) counts.set(r.cause as string, (counts.get(r.cause as string) ?? 0) + 1)
  return [...counts.entries()].map(([cause, count]) => ({ cause, count })).sort((a, b) => b.count - a.count)
}

export async function recentConversations(opts: { assistant: string; page: number }) {
  let query = createAdminClient().from('ai_conversations').select('*', { count: 'exact' })
  if (opts.assistant !== 'all') query = query.eq('assistant', opts.assistant)
  const from = (opts.page - 1) * PAGE_SIZE
  const { data, count } = await query.gt('message_count', 0).order('last_message_at', { ascending: false }).range(from, from + PAGE_SIZE - 1)
  return { rows: data ?? [], total: count ?? 0, pages: Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE)) }
}

export async function knowledgeOverview() {
  const supabase = createAdminClient()
  const [pages, notes] = await Promise.all([
    supabase.from('ai_knowledge').select('url, updated_at').eq('source', 'page').order('updated_at', { ascending: false }).limit(2000),
    supabase.from('ai_knowledge').select('*').eq('source', 'note').order('updated_at', { ascending: false }).limit(500),
  ])
  const pageRows = pages.data ?? []
  return {
    pageChunks: pageRows.length,
    pageCount: new Set(pageRows.map((r) => r.url)).size,
    refreshedAt: (pageRows[0]?.updated_at as string | undefined) ?? null,
    notes: (notes.data ?? []) as { id: string; title: string; body: string; audience: string; active: boolean; created_by: string | null; updated_at: string }[],
  }
}

export async function listEvalCases() {
  const { data } = await createAdminClient().from('ai_eval_cases').select('*').order('created_at', { ascending: false }).limit(1000)
  return (data ?? []) as {
    id: string
    assistant: string
    question: string
    expected_facts: string[]
    expected_behavior: string
    notes: string | null
    origin_ticket_id: string | null
    active: boolean
    created_by: string | null
    created_at: string
  }[]
}
