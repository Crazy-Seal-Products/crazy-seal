import { NextRequest, NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { isViewingAs, VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEALER_CHAT_LIMIT } from '@/lib/ai/config'
import { isAssistantConfigured } from '@/lib/ai/chat'
import { createTicket } from '@/lib/support/tickets'

/** The dealer's Support tab: their recent chats and their requests. */
export async function GET() {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminClient()
  const [chats, tickets] = await Promise.all([
    supabase
      .from('ai_conversations')
      .select('id, title, message_count, created_at, last_message_at')
      .eq('assistant', 'dealer')
      .eq('pro_user_id', user.id)
      .order('last_message_at', { ascending: false })
      .limit(DEALER_CHAT_LIMIT),
    supabase
      .from('support_tickets')
      .select('id, number, kind, status, subject, pro_unread, created_at, updated_at, last_reply_at')
      .eq('pro_user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(100),
  ])
  return NextResponse.json({
    chats: chats.data ?? [],
    tickets: tickets.data ?? [],
    chatLimit: DEALER_CHAT_LIMIT,
    readOnly: await isViewingAs(),
    assistantOn: isAssistantConfigured('dealer'),
  })
}

/** "Send feedback": general feedback / knowledge, or a feature request. */
export async function POST(request: NextRequest) {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isViewingAs()) return NextResponse.json({ error: VIEW_AS_READ_ONLY }, { status: 403 })

  const body = (await request.json().catch(() => null)) as { kind?: string; subject?: string; body?: string } | null
  const kind = body?.kind === 'feature_request' ? 'feature_request' : 'general_feedback'
  const text = body?.body?.trim().slice(0, 4000) ?? ''
  const subject = body?.subject?.trim().slice(0, 150) || text.split('\n')[0].slice(0, 100)
  if (!text) return NextResponse.json({ error: 'Write a few words first.' }, { status: 400 })

  const ticket = await createTicket({
    kind,
    subject,
    body: text,
    author: { type: 'pro', name: user.business_name || user.display_name, email: user.email },
    proUserId: user.id,
    contact: { name: user.business_name || user.display_name, email: user.email, phone: user.phone },
  })
  if (!ticket) return NextResponse.json({ error: 'Could not send. Please try again.' }, { status: 500 })
  return NextResponse.json({ ok: true, id: ticket.id, number: ticket.number })
}
