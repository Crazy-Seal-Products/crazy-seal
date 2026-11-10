import { createAdminClient } from '@/lib/supabase/admin'
import { CUSTOMER_RETENTION_DAYS, DEALER_CHAT_LIMIT, PROMPT_VERSION, REVIEW_SAMPLE_RATE, type Assistant } from './config'
import type { ChatTurn, ToolCallLog } from './providers'

/** Saving and reading assistant chats (ai_conversations / ai_messages). */

export interface Conversation {
  id: string
  assistant: Assistant
  visitor_id: string | null
  pro_user_id: string | null
  staff_email: string | null
  title: string | null
  page_url: string | null
  model: string | null
  prompt_version: string | null
  message_count: number
  sampled: boolean
  screen: { kind: 'inquiry' | 'support_issue'; reasons: string[]; summary: string } | null
  screened_at: string | null
  created_at: string
  last_message_at: string
}

export interface StoredMessage {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  sources: { title: string; url: string | null; source: string }[] | null
  tool_calls: ToolCallLog[] | null
  model: string | null
  ttft_ms: number | null
  total_ms: number | null
  input_tokens: number | null
  cached_tokens: number | null
  output_tokens: number | null
  cost_usd: number | null
  error: string | null
  created_at: string
}

export async function createConversation(input: {
  assistant: Assistant
  title: string
  model: string
  visitorId?: string | null
  proUserId?: string | null
  staffEmail?: string | null
  pageUrl?: string | null
}): Promise<Conversation> {
  const { data, error } = await createAdminClient()
    .from('ai_conversations')
    .insert({
      assistant: input.assistant,
      title: input.title.slice(0, 120),
      model: input.model,
      prompt_version: PROMPT_VERSION,
      visitor_id: input.visitorId ?? null,
      pro_user_id: input.proUserId ?? null,
      staff_email: input.staffEmail ?? null,
      page_url: input.pageUrl?.slice(0, 500) ?? null,
      sampled: input.assistant === 'customer' && Math.random() < REVIEW_SAMPLE_RATE,
    })
    .select()
    .single()
  if (error) throw new Error(`Could not start the chat: ${error.message}`)
  return data as Conversation
}

export async function getConversation(id: string): Promise<Conversation | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const { data } = await createAdminClient().from('ai_conversations').select('*').eq('id', id).maybeSingle()
  return (data as Conversation | null) ?? null
}

export async function getMessages(conversationId: string): Promise<StoredMessage[]> {
  const { data } = await createAdminClient()
    .from('ai_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(500)
  return (data ?? []) as StoredMessage[]
}

/** The last turns as model input. Failed turns are left out so the model doesn't repeat them. */
export function toHistory(messages: StoredMessage[], maxTurns = 30): ChatTurn[] {
  return messages
    .filter((m) => !m.error && m.content.trim())
    .slice(-maxTurns)
    .map((m) => ({ role: m.role, content: m.content }))
}

export async function addMessage(conversationId: string, message: Omit<StoredMessage, 'id' | 'conversation_id' | 'created_at'>): Promise<string | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('ai_messages')
    .insert({ ...message, conversation_id: conversationId })
    .select('id')
    .single()
  if (error) {
    console.error('[ai/store] message not saved', error.message)
    return null
  }
  const { count } = await supabase.from('ai_messages').select('id', { count: 'exact', head: true }).eq('conversation_id', conversationId)
  await supabase
    .from('ai_conversations')
    .update({ message_count: count ?? 0, last_message_at: new Date().toISOString() })
    .eq('id', conversationId)
  return (data as { id: string }).id
}

export function userMessage(content: string): Omit<StoredMessage, 'id' | 'conversation_id' | 'created_at'> {
  return {
    role: 'user',
    content,
    sources: null,
    tool_calls: null,
    model: null,
    ttft_ms: null,
    total_ms: null,
    input_tokens: null,
    cached_tokens: null,
    output_tokens: null,
    cost_usd: null,
    error: null,
  }
}

/** Conversations linked to a ticket that's still open are never deleted by the limits below. */
async function protectedIds(ids: string[]): Promise<Set<string>> {
  if (!ids.length) return new Set()
  const { data } = await createAdminClient()
    .from('support_tickets')
    .select('conversation_id')
    .in('conversation_id', ids)
    .not('status', 'in', '(resolved,wont_fix)')
  return new Set((data ?? []).map((r) => r.conversation_id as string))
}

/** Keeps a dealer's newest DEALER_CHAT_LIMIT chats and deletes the rest. */
export async function pruneDealerChats(proUserId: string): Promise<void> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('assistant', 'dealer')
    .eq('pro_user_id', proUserId)
    .order('last_message_at', { ascending: false })
    .range(DEALER_CHAT_LIMIT, DEALER_CHAT_LIMIT + 200)
  const old = (data ?? []).map((r) => r.id as string)
  const keep = await protectedIds(old)
  const remove = old.filter((id) => !keep.has(id))
  if (remove.length) await supabase.from('ai_conversations').delete().in('id', remove)
}

let lastCustomerPrune = 0

/** Deletes customer chats older than the retention window that never became a ticket. At most hourly per server. */
export async function pruneCustomerChats(): Promise<number> {
  if (Date.now() - lastCustomerPrune < 60 * 60 * 1000) return 0
  lastCustomerPrune = Date.now()
  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - CUSTOMER_RETENTION_DAYS * 86_400_000).toISOString()
  const { data } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('assistant', 'customer')
    .lt('last_message_at', cutoff)
    .limit(500)
  const old = (data ?? []).map((r) => r.id as string)
  if (!old.length) return 0
  const { data: ticketed } = await supabase.from('support_tickets').select('conversation_id').in('conversation_id', old)
  const keep = new Set((ticketed ?? []).map((r) => r.conversation_id as string))
  const remove = old.filter((id) => !keep.has(id))
  if (remove.length) await supabase.from('ai_conversations').delete().in('id', remove)
  return remove.length
}
