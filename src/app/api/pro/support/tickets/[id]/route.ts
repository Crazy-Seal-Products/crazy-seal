import { NextRequest, NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { isViewingAs, VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { createAdminClient } from '@/lib/supabase/admin'
import { addTicketReply, getTicket, getTicketMessages, kindLabel, statusLabel } from '@/lib/support/tickets'

/** One of the dealer's own requests: the thread (no internal notes), and replying to it. */

type Ctx = { params: Promise<{ id: string }> }

async function ownTicket(id: string) {
  const user = await getProUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const ticket = await getTicket(id)
  if (!ticket || ticket.pro_user_id !== user.id) return { error: NextResponse.json({ error: 'Request not found' }, { status: 404 }) }
  return { user, ticket }
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const found = await ownTicket(id)
  if (found.error) return found.error
  const { ticket } = found
  const messages = await getTicketMessages(ticket.id, false)
  if (ticket.pro_unread && !(await isViewingAs())) {
    await createAdminClient().from('support_tickets').update({ pro_unread: false }).eq('id', ticket.id)
  }
  return NextResponse.json({
    ticket: {
      id: ticket.id,
      number: ticket.number,
      kind: ticket.kind,
      kindLabel: kindLabel(ticket.kind),
      status: ticket.status,
      statusLabel: statusLabel(ticket.status),
      subject: ticket.subject,
      resolution: ticket.status === 'resolved' || ticket.status === 'wont_fix' ? ticket.resolution : null,
      conversationId: ticket.conversation_id,
      createdAt: ticket.created_at,
    },
    messages: messages.map((m) => ({
      from: m.author_type === 'staff' ? m.author_name || 'Crazy Seal Support' : m.author_type === 'pro' ? 'You' : m.author_name || 'Pro Hub assistant',
      mine: m.author_type === 'pro',
      staff: m.author_type === 'staff',
      body: m.body,
      at: m.created_at,
    })),
  })
}

export async function POST(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (await isViewingAs()) return NextResponse.json({ error: VIEW_AS_READ_ONLY }, { status: 403 })
  const found = await ownTicket(id)
  if (found.error) return found.error
  const body = (await request.json().catch(() => null)) as { body?: string } | null
  const text = body?.body?.trim().slice(0, 4000) ?? ''
  if (!text) return NextResponse.json({ error: 'Write a reply first.' }, { status: 400 })
  await addTicketReply(found.ticket, {
    authorType: 'pro',
    name: found.user.business_name || found.user.display_name,
    email: found.user.email,
    body: text,
  })
  return NextResponse.json({ ok: true })
}
