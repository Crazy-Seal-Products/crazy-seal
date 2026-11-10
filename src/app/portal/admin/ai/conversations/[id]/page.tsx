import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { dateTime, num } from '@/lib/portal/admin/format'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversation, getMessages } from '@/lib/ai/store'
import { kindLabel } from '@/lib/support/tickets'
import { BackLink, Badge, CellLink, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { Transcript } from '@/components/portal/admin/support/Transcript'

type Params = Promise<{ id: string }>

export const metadata: Metadata = { title: 'Chat' }

export default async function AiConversationPage({ params }: { params: Params }) {
  await requirePortalAdmin(['ai_review', 'support'])
  const id = (await params).id
  const conversation = await getConversation(id)
  if (!conversation) notFound()
  const supabase = createAdminClient()
  const [messages, tickets, pro] = await Promise.all([
    getMessages(id),
    supabase.from('support_tickets').select('id, number, kind, status').eq('conversation_id', id).then((r) => r.data ?? []),
    conversation.pro_user_id
      ? supabase.from('pro_users').select('email, business_name, display_name').eq('id', conversation.pro_user_id).maybeSingle().then((r) => r.data)
      : null,
  ])
  const answers = messages.filter((m) => m.role === 'assistant')
  const cost = answers.reduce((s, m) => s + Number(m.cost_usd ?? 0), 0)
  // Site visitors' chats are shown with emails and phone numbers hidden unless they asked for a person.
  const hidePii = conversation.assistant === 'customer' && !tickets.some((t) => t.kind === 'customer_handoff')

  return (
    <>
      <BackLink href="/portal/admin/ai/?tab=chats">Chats</BackLink>
      <PageHeader title={conversation.title || 'Chat'} description={`Started ${dateTime(conversation.created_at)} · last message ${dateTime(conversation.last_message_at)}`} />
      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Transcript" tone="sales" meta={hidePii ? 'emails and phones hidden' : undefined}>
          <Transcript messages={messages} hidePii={hidePii} />
        </Panel>
        <div className="grid content-start gap-2">
          <Panel title="Chat" tone="info">
            <KV
              rows={[
                ['Assistant', conversation.assistant],
                ['Who', pro ? pro.business_name || pro.display_name || pro.email : conversation.staff_email || 'Site visitor'],
                ['Model', conversation.model ?? '—'],
                ['Prompt', conversation.prompt_version ?? '—'],
                ['Answers', `${num(answers.length)} (${num(answers.filter((m) => m.error).length)} failed)`],
                ['Cost', `$${cost.toFixed(4)}`],
                ['Started on', conversation.page_url || '—'],
                ['Screen', conversation.screen ? `${conversation.screen.kind}${conversation.screen.reasons.length ? `: ${conversation.screen.reasons.join(', ')}` : ''}` : '—'],
                ['Sampled', conversation.sampled ? 'Yes' : 'No'],
              ]}
            />
          </Panel>
          <Panel title="Tickets">
            {tickets.length ? (
              <ul className="divide-y divide-adm-line-soft">
                {tickets.map((t) => (
                  <li key={t.id} className="flex items-center gap-2 px-3 py-2 text-[12.5px]">
                    <CellLink href={`/portal/admin/support/${t.id}/`}>#{t.number}</CellLink>
                    <span className="flex-1 text-adm-text">{kindLabel(t.kind)}</span>
                    <Badge tone="neutral">{t.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-3 py-2.5 text-[12.5px] text-adm-muted">No tickets for this chat.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  )
}
