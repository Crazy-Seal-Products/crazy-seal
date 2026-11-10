import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/admin/require-staff'
import { assistantSettings, MAX_USER_CHARS } from '@/lib/ai/config'
import { chatResponse, titleFrom } from '@/lib/ai/chat'
import { createConversation, getConversation } from '@/lib/ai/store'
import { staffTools } from '@/lib/ai/tools'

/** The staff Assistant in the Crazy Seal Admin. */

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const staff = await requireStaff('assistant')
  if (!staff) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = (await request.json().catch(() => null)) as { conversationId?: string; message?: string } | null
  const message = body?.message?.trim() ?? ''
  if (!message) return NextResponse.json({ error: 'Type a message first.' }, { status: 400 })
  if (message.length > MAX_USER_CHARS) return NextResponse.json({ error: `Please keep messages under ${MAX_USER_CHARS} characters.` }, { status: 400 })

  const email = staff.email.toLowerCase()
  let conversation
  if (body?.conversationId) {
    conversation = await getConversation(body.conversationId)
    if (!conversation || conversation.assistant !== 'staff' || conversation.staff_email !== email) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
  } else {
    conversation = await createConversation({ assistant: 'staff', title: titleFrom(message), model: assistantSettings('staff').model, staffEmail: email })
  }

  return chatResponse('staff', conversation, message, {
    tools: staffTools(),
    extraContext: `<staff>Signed in as ${staff.name || email}</staff>`,
  })
}
