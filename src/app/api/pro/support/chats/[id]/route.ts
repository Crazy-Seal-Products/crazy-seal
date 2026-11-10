import { NextRequest, NextResponse } from 'next/server'
import { getProUser } from '@/lib/pro/auth'
import { isViewingAs, VIEW_AS_READ_ONLY } from '@/lib/pro/view-as'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversation, getMessages } from '@/lib/ai/store'

type Ctx = { params: Promise<{ id: string }> }

async function own(id: string) {
  const user = await getProUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const conversation = await getConversation(id)
  if (!conversation || conversation.assistant !== 'dealer' || conversation.pro_user_id !== user.id) {
    return { error: NextResponse.json({ error: 'Chat not found' }, { status: 404 }) }
  }
  return { conversation }
}

export async function GET(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  const found = await own(id)
  if (found.error) return found.error
  const messages = await getMessages(id)
  return NextResponse.json({
    chat: { id, title: found.conversation.title },
    messages: messages
      .filter((m) => m.content || m.error)
      .map((m) => ({ role: m.role, content: m.content, failed: Boolean(m.error) && !m.content, at: m.created_at })),
  })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (await isViewingAs()) return NextResponse.json({ error: VIEW_AS_READ_ONLY }, { status: 403 })
  const found = await own(id)
  if (found.error) return found.error
  // A chat attached to a request stays for the team; it just leaves the dealer's list.
  const supabase = createAdminClient()
  const { count } = await supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('conversation_id', id)
  if (count) {
    await supabase.from('ai_conversations').update({ pro_user_id: null }).eq('id', id)
  } else {
    await supabase.from('ai_conversations').delete().eq('id', id)
  }
  return NextResponse.json({ ok: true })
}
