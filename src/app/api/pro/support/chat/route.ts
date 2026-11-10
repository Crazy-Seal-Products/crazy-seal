import { after, NextRequest, NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { isViewingAs, VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { assistantSettings, MAX_USER_CHARS } from '@/lib/ai/config'
import { chatResponse, titleFrom } from '@/lib/ai/chat'
import { rateLimited } from '@/lib/ai/guard'
import { createConversation, getConversation, pruneDealerChats } from '@/lib/ai/store'
import { dealerTools } from '@/lib/ai/tools'

/** A message to the Pro Hub support agent. Starts a chat when no conversationId is given. */

export const maxDuration = 120

export async function POST(request: NextRequest) {
  const user = await getProUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (await isViewingAs()) return NextResponse.json({ error: VIEW_AS_READ_ONLY }, { status: 403 })
  if (rateLimited(request, `pro-chat:${user.id}`, 30, 5 * 60_000)) {
    return NextResponse.json({ error: 'You’re sending messages too quickly. Please wait a minute.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as { conversationId?: string; message?: string } | null
  const message = body?.message?.trim() ?? ''
  if (!message) return NextResponse.json({ error: 'Type a message first.' }, { status: 400 })
  if (message.length > MAX_USER_CHARS) return NextResponse.json({ error: `Please keep messages under ${MAX_USER_CHARS} characters.` }, { status: 400 })

  let conversation
  if (body?.conversationId) {
    conversation = await getConversation(body.conversationId)
    if (!conversation || conversation.assistant !== 'dealer' || conversation.pro_user_id !== user.id) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
  } else {
    conversation = await createConversation({
      assistant: 'dealer',
      title: titleFrom(message),
      model: assistantSettings('dealer').model,
      proUserId: user.id,
    })
    const proId = user.id
    after(() => pruneDealerChats(proId).catch((err) => console.error('[pro-chat] prune failed', err)))
  }

  const id = conversation.id
  const who = [user.business_name, user.display_name].filter(Boolean).join(' / ') || user.email
  return chatResponse('dealer', conversation, message, {
    tools: dealerTools(user, () => id),
    extraContext: `<dealer>Signed in as ${who}</dealer>`,
  })
}
