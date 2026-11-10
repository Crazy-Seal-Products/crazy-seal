import { after, NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assistantSettings, MAX_USER_CHARS } from '@/lib/ai/config'
import { chatResponse, titleFrom } from '@/lib/ai/chat'
import { chatToken, passesHumanCheck, rateLimited, verifyChatToken } from '@/lib/ai/guard'
import { screenCustomerConversation } from '@/lib/ai/screen'
import { createConversation, getConversation, getMessages, pruneCustomerChats } from '@/lib/ai/store'

/** The public site chat (crazyseal.com). */

export const maxDuration = 120

export async function POST(request: NextRequest) {
  if (rateLimited(request, 'site-chat', 20, 5 * 60_000)) {
    return NextResponse.json({ error: 'You’re sending messages too quickly. Please wait a minute.' }, { status: 429 })
  }
  const body = (await request.json().catch(() => null)) as {
    conversationId?: string
    token?: string
    message?: string
    turnstileToken?: string
    pageUrl?: string
    visitorId?: string
  } | null
  const message = body?.message?.trim() ?? ''
  if (!message) return NextResponse.json({ error: 'Type a message first.' }, { status: 400 })
  if (message.length > MAX_USER_CHARS) return NextResponse.json({ error: `Please keep messages under ${MAX_USER_CHARS} characters.` }, { status: 400 })

  let conversation
  let token: string | undefined
  if (body?.conversationId) {
    if (!verifyChatToken(body.conversationId, body.token)) return NextResponse.json({ error: 'This chat has expired. Start a new one.' }, { status: 403 })
    conversation = await getConversation(body.conversationId)
    if (!conversation || conversation.assistant !== 'customer') return NextResponse.json({ error: 'This chat has expired. Start a new one.' }, { status: 404 })
  } else {
    if (!(await passesHumanCheck(body?.turnstileToken, request))) {
      return NextResponse.json({ error: 'Please complete the verification and try again.', verify: true }, { status: 403 })
    }
    conversation = await createConversation({
      assistant: 'customer',
      title: titleFrom(message),
      model: assistantSettings('customer').model,
      visitorId: body?.visitorId?.slice(0, 64) ?? null,
      pageUrl: body?.pageUrl ?? null,
    })
    token = chatToken(conversation.id)
  }

  const id = conversation.id
  after(async () => {
    await screenCustomerConversation(id).catch((err) => console.error('[site-chat] screen failed', err))
    await pruneCustomerChats().catch((err) => console.error('[site-chat] prune failed', err))
  })

  return chatResponse('customer', conversation, message, { token })
}

/** Reopening the widget: the chat so far, plus any replies from the support team. */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('conversationId') ?? ''
  const token = request.nextUrl.searchParams.get('token')
  if (!verifyChatToken(id, token)) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const conversation = await getConversation(id)
  if (!conversation || conversation.assistant !== 'customer') return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const messages = await getMessages(id)
  const { data: tickets } = await createAdminClient()
    .from('support_tickets')
    .select('id, number, status')
    .eq('conversation_id', id)
    .eq('kind', 'customer_handoff')
  const ticketIds = (tickets ?? []).map((t) => t.id as string)
  const { data: replies } = ticketIds.length
    ? await createAdminClient()
        .from('support_messages')
        .select('body, author_name, created_at')
        .in('ticket_id', ticketIds)
        .eq('author_type', 'staff')
        .eq('internal', false)
        .order('created_at')
    : { data: [] }

  return NextResponse.json({
    messages: messages
      .filter((m) => m.content || m.error)
      .map((m) => ({ role: m.role, content: m.content, failed: Boolean(m.error) && !m.content, at: m.created_at })),
    handoff: tickets?.[0] ? { number: tickets[0].number, status: tickets[0].status } : null,
    replies: (replies ?? []).map((r) => ({ body: r.body, from: r.author_name, at: r.created_at })),
  })
}
