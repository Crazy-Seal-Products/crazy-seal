import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/gmail'
import { assistantSettings } from '@/lib/ai/config'
import { chatToken, passesHumanCheck, rateLimited, verifyChatToken } from '@/lib/ai/guard'
import { createConversation, getConversation } from '@/lib/ai/store'
import { createTicket, escapeHtml } from '@/lib/support/tickets'

/** "Talk to a person" from the site chat: files a customer_handoff ticket with the chat attached. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  if (rateLimited(request, 'site-handoff', 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Please wait a few minutes before sending another request.' }, { status: 429 })
  }
  const body = (await request.json().catch(() => null)) as {
    conversationId?: string
    token?: string
    name?: string
    email?: string
    phone?: string
    message?: string
    turnstileToken?: string
    pageUrl?: string
    website?: string
  } | null
  if (body?.website) return NextResponse.json({ ok: true, number: 0 })

  const name = body?.name?.trim().slice(0, 120) ?? ''
  const email = body?.email?.trim().toLowerCase().slice(0, 200) ?? ''
  const phone = body?.phone?.trim().slice(0, 40) || null
  const message = body?.message?.trim().slice(0, 4000) ?? ''
  if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please give your name and a valid email.' }, { status: 400 })
  if (!message) return NextResponse.json({ error: 'Tell us briefly what you need help with.' }, { status: 400 })

  let conversationId: string | null = null
  if (body?.conversationId && verifyChatToken(body.conversationId, body.token)) {
    const conversation = await getConversation(body.conversationId)
    if (conversation?.assistant === 'customer') conversationId = conversation.id
  }
  if (!conversationId) {
    // Asking for a person before chatting: verify like any public form, and
    // keep a (message-less) chat so the ticket has somewhere to show replies.
    if (!(await passesHumanCheck(body?.turnstileToken, request))) {
      return NextResponse.json({ error: 'Please complete the verification and try again.', verify: true }, { status: 403 })
    }
    const conversation = await createConversation({
      assistant: 'customer',
      title: `Hand-off: ${message.slice(0, 60)}`,
      model: assistantSettings('customer').model,
      pageUrl: body?.pageUrl ?? null,
    })
    conversationId = conversation.id
  }

  const ticket = await createTicket({
    kind: 'customer_handoff',
    subject: message.split('\n')[0].slice(0, 120),
    body: message,
    author: { type: 'customer', name, email },
    conversationId,
    contact: { name, email, phone },
  })
  if (!ticket) return NextResponse.json({ error: 'We couldn’t send that. Please call (800) 963-0131.' }, { status: 500 })

  await sendEmail({
    to: email,
    subject: `We got your message [Crazy Seal Support #${ticket.number}]`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#1a1a1a;max-width:600px"><p>Hi ${escapeHtml(name.split(' ')[0])},</p><p>Thanks for reaching out. A member of the Crazy Seal team will reply by email, usually within one business day (Mon–Fri 9AM–6PM EST). If it’s urgent, call us at (800) 963-0131.</p><p style="color:#666;font-size:13px">Your request: ${escapeHtml(message.slice(0, 500))}</p></div>`,
    replyTo: 'info@crazyseal.com',
  }).catch((err) => console.error('[site-handoff] confirmation email failed', err))

  return NextResponse.json({ ok: true, number: ticket.number, conversationId, token: chatToken(conversationId) })
}
