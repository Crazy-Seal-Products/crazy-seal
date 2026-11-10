import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { twMerge } from 'tailwind-merge'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { dateTime } from '@/lib/portal/admin/format'
import { createAdminClient } from '@/lib/supabase/admin'
import { getConversation, getMessages } from '@/lib/ai/store'
import { listReviewers } from '@/lib/support/admin'
import {
  assignTicket,
  addKnowledgeNote,
  replyToTicket,
  saveEvalCase,
  saveResolution,
  setTicketField,
  setTicketStatus,
} from '@/lib/support/actions'
import { FIX_TYPES, getTicket, getTicketMessages, kindLabel, PRIORITIES, TICKET_CAUSES, TICKET_STATUSES } from '@/lib/support/tickets'
import { BackLink, Badge, CellLink, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { StatusSelect } from '@/components/portal/admin/controls'
import { EvalCaseForm, KnowledgeNoteForm, ReplyBox, ResolutionBox } from '@/components/portal/admin/support/forms'
import { Transcript } from '@/components/portal/admin/support/Transcript'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const t = await getTicket((await params).id)
  return { title: t ? `#${t.number} ${t.subject}` : 'Ticket' }
}

export default async function SupportTicketPage({ params }: { params: Params }) {
  await requirePortalAdmin('support')
  const ticket = await getTicket((await params).id)
  if (!ticket) notFound()

  const [thread, conversation, transcript, reviewers, pro] = await Promise.all([
    getTicketMessages(ticket.id, true),
    ticket.conversation_id ? getConversation(ticket.conversation_id) : null,
    ticket.conversation_id ? getMessages(ticket.conversation_id) : [],
    listReviewers(),
    ticket.pro_user_id
      ? createAdminClient().from('pro_users').select('id, email, display_name, business_name').eq('id', ticket.pro_user_id).maybeSingle().then((r) => r.data)
      : null,
  ])

  // Customer chats that weren't handed off are reviewed with emails and phone numbers hidden.
  const hidePii = ticket.kind === 'auto_flag' || ticket.kind === 'review_sample'
  const canReply = Boolean(ticket.pro_user_id || ticket.contact_email)
  const firstQuestion = transcript.find((m) => m.role === 'user')?.content ?? ''
  const assistant = conversation?.assistant ?? (ticket.pro_user_id ? 'dealer' : 'customer')

  return (
    <>
      <BackLink href="/portal/admin/support/">Support inbox</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-adm-muted">#{ticket.number}</span> {ticket.subject}
            <Badge tone={ticket.kind === 'customer_handoff' ? 'gold' : ticket.kind === 'auto_flag' ? 'warn' : 'info'}>{kindLabel(ticket.kind)}</Badge>
            {ticket.priority === 'high' && <Badge tone="bad">High priority</Badge>}
          </span>
        }
        description={`Opened ${dateTime(ticket.created_at)}${ticket.screen_reasons?.length ? ` · flagged for: ${ticket.screen_reasons.join(', ')}` : ''}`}
        actions={<StatusSelect value={ticket.status} options={TICKET_STATUSES} action={setTicketStatus.bind(null, ticket.id)} label="Status" />}
      />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Conversation" tone="sales" meta={`${thread.filter((m) => !m.internal).length} messages · ${thread.filter((m) => m.internal).length} notes`}>
            <ol className="divide-y divide-adm-line-soft">
              {thread.map((m) => (
                <li key={m.id} className={twMerge('px-3 py-2.5', m.internal && 'bg-adm-gold/[0.06]')}>
                  <p className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-adm-muted">
                    <span className="font-semibold text-adm-soft">
                      {m.author_name || (m.author_type === 'system' ? 'System' : m.author_email || m.author_type)}
                    </span>
                    <span>{m.author_type === 'staff' ? (m.internal ? 'internal note' : 'staff reply') : m.author_type}</span>
                    <span>{dateTime(m.created_at)}</span>
                  </p>
                  <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-adm-text">{m.body}</p>
                </li>
              ))}
            </ol>
            <div className="border-t border-adm-line">
              <ReplyBox
                action={replyToTicket.bind(null, ticket.id)}
                canReply={canReply}
                replyHint={ticket.pro_user_id ? 'Goes to their Pro Hub Support tab and by email.' : `Emailed to ${ticket.contact_email}.`}
              />
            </div>
          </Panel>

          {conversation && (
            <Panel
              title={conversation.assistant === 'customer' ? 'Chat with the site assistant' : conversation.assistant === 'dealer' ? 'Chat with the Pro Hub agent' : 'Chat with the staff assistant'}
              meta={`${conversation.model ?? ''} · prompt ${conversation.prompt_version ?? '—'}${hidePii ? ' · emails and phones hidden' : ''}`}
              actions={<CellLink href={`/portal/admin/ai/conversations/${conversation.id}/`}>Full view</CellLink>}
            >
              <Transcript messages={transcript} hidePii={hidePii} />
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Details" tone="info">
            <KV
              rows={[
                ['Owner', <StatusSelect key="a" value={ticket.assignee_email ?? ''} options={[{ key: '', label: 'Unassigned' }, ...reviewers.map((r) => ({ key: r.email, label: r.name }))]} action={assignTicket.bind(null, ticket.id)} label="Owner" />],
                ['Priority', <StatusSelect key="p" value={ticket.priority} options={PRIORITIES} action={setTicketField.bind(null, ticket.id, 'priority')} label="Priority" />],
                ['Cause', <StatusSelect key="c" value={ticket.cause ?? ''} options={TICKET_CAUSES} action={setTicketField.bind(null, ticket.id, 'cause')} label="Cause" />],
                ['Fix', <StatusSelect key="f" value={ticket.fix_type ?? ''} options={FIX_TYPES} action={setTicketField.bind(null, ticket.id, 'fix_type')} label="Fix" />],
              ]}
            />
          </Panel>

          <Panel title="Who" tone="dealers">
            <KV
              rows={[
                ...(pro
                  ? ([
                      ['Dealer', pro.business_name || pro.display_name || pro.email],
                      ['Email', <a key="e" href={`mailto:${pro.email}`} className="text-adm-blue-bright hover:underline">{pro.email}</a>],
                    ] as [string, React.ReactNode][])
                  : []),
                ...(!pro && ticket.contact_name ? ([['Name', ticket.contact_name]] as [string, string][]) : []),
                ...(!pro && ticket.contact_email
                  ? ([['Email', <a key="e" href={`mailto:${ticket.contact_email}`} className="text-adm-blue-bright hover:underline">{ticket.contact_email}</a>]] as [string, React.ReactNode][])
                  : []),
                ...(ticket.contact_phone ? ([['Phone', <a key="p" href={`tel:${ticket.contact_phone}`} className="text-adm-blue-bright hover:underline">{ticket.contact_phone}</a>]] as [string, React.ReactNode][]) : []),
                ...(ticket.staff_email ? ([['Staff', ticket.staff_email]] as [string, string][]) : []),
                ...(conversation?.page_url ? ([['Started on', conversation.page_url]] as [string, string][]) : []),
                ...(!pro && !ticket.contact_email && !ticket.staff_email ? ([['Contact', 'Anonymous site visitor (no reply possible)']] as [string, string][]) : []),
              ]}
            />
          </Panel>

          <Panel title="Resolution" meta="shown to dealers when resolved">
            <ResolutionBox initial={ticket.resolution ?? ''} action={saveResolution.bind(null, ticket.id)} />
          </Panel>

          <Panel title="Fix it: add knowledge" meta="the assistants use it from the next question">
            <KnowledgeNoteForm action={addKnowledgeNote.bind(null, ticket.id)} />
          </Panel>

          <Panel title="Keep it fixed: save a test case" meta="rerun before prompt or model changes">
            <EvalCaseForm action={saveEvalCase.bind(null, ticket.id)} defaults={{ assistant, question: firstQuestion }} />
          </Panel>
        </div>
      </div>
    </>
  )
}
