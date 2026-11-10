import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { ago, dateTime, num, pct } from '@/lib/portal/admin/format'
import { pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import { assistantSettings } from '@/lib/ai/config'
import { isAssistantConfigured } from '@/lib/ai/chat'
import { aiMetrics, causeBreakdown, knowledgeOverview, listEvalCases, listReviewers, openTicketCount, recentConversations } from '@/lib/support/admin'
import { addKnowledgeNote, refreshKnowledge, saveEvalCase, setEvalCaseActive, setKnowledgeNoteActive, updateKnowledgeNote } from '@/lib/support/actions'
import { TICKET_CAUSES } from '@/lib/support/tickets'
import { ActionButton } from '@/components/portal/admin/controls'
import { EvalCaseForm, KnowledgeNoteForm } from '@/components/portal/admin/support/forms'
import {
  Badge,
  CellLink,
  Empty,
  KV,
  PageHeader,
  Pagination,
  Panel,
  Segmented,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
} from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'AI review' }

const BASE = '/portal/admin/ai/'
const PERIODS = [
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
  { key: '90', label: '90 days' },
] as const
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'tests', label: 'Test cases' },
  { key: 'chats', label: 'Chats' },
] as const
const ASSISTANTS = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customer' },
  { key: 'dealer', label: 'Dealer' },
  { key: 'staff', label: 'Staff' },
] as const
const ASSISTANT_LABEL: Record<string, string> = { customer: 'Customer (site)', dealer: 'Dealer (Pro Hub)', staff: 'Staff (admin)' }

const secs = (ms: number | null) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)}s`)
const usd = (n: number | null) => (n == null ? '—' : n < 0.01 && n > 0 ? `$${n.toFixed(4)}` : `$${n.toFixed(2)}`)

export default async function AiReviewPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('ai_review')
  const sp = await searchParams
  const tab = pick(sp.tab, TABS, 'overview')
  const period = pick(sp.days, PERIODS, '30')
  const assistant = pick(sp.assistant, ASSISTANTS, 'all')
  const page = pageNum(sp.page)
  const params = { tab: tab === 'overview' ? undefined : tab, days: period === '30' ? undefined : period, assistant: assistant === 'all' ? undefined : assistant }

  return (
    <>
      <PageHeader
        title="AI review"
        description="How the assistants are doing, what they answer from, and the test cases that keep fixed problems fixed."
      >
        <Toolbar>
          <Segmented options={TABS} value={tab} param="tab" base={BASE} params={params} />
          {tab === 'overview' && <Segmented options={PERIODS} value={period} param="days" base={BASE} params={params} />}
          {tab === 'chats' && <Segmented options={ASSISTANTS} value={assistant} param="assistant" base={BASE} params={params} />}
        </Toolbar>
      </PageHeader>
      {tab === 'overview' && <Overview days={Number(period)} />}
      {tab === 'knowledge' && <Knowledge />}
      {tab === 'tests' && <Tests />}
      {tab === 'chats' && <Chats assistant={assistant} page={page} params={params} />}
    </>
  )
}

async function Overview({ days }: { days: number }) {
  const [m, open, causes, reviewers] = await Promise.all([aiMetrics(days), openTicketCount(), causeBreakdown(days), listReviewers()])
  if (m.missing) {
    return (
      <Panel>
        <Empty>The AI tables aren’t set up yet. Run migration 019_ai_support.sql.</Empty>
      </Panel>
    )
  }
  const causeLabel = (k: string) => TICKET_CAUSES.find((c) => c.key === k)?.label ?? k
  return (
    <div className="grid gap-2">
      <StatGrid>
        <Stat hero label="Customer chats" value={num(m.per.customer.conversations)} sub={`last ${days} days`} />
        <Stat label="Flag rate" value={m.flagRate == null ? '—' : pct(m.flagRate, 1)} sub={`${num(m.autoFlags)} auto-flagged`} tone="dealers" upIsGood={false} />
        <Stat label="Hand-off rate" value={m.handoffRate == null ? '—' : pct(m.handoffRate, 1)} sub={`${num(m.handoffs)} asked for a person`} tone="dealers" upIsGood={false} />
        <Stat label="Open tickets" value={num(open)} sub="all queues" tone="info" />
        <Stat label="Time to resolve" value={m.medianResolveHours == null ? '—' : `${m.medianResolveHours.toFixed(1)}h`} sub={`median of ${num(m.resolvedCount)}`} tone="info" />
        <Stat label="Dealer requests" value={num(m.dealerRequests)} sub={`${num(m.feedback)} feedback / features`} tone="info" />
      </StatGrid>

      <Panel title="By assistant" tone="sales">
        <Table>
          <THead>
            <Th>Assistant</Th>
            <Th>Model</Th>
            <Th align="right">Chats</Th>
            <Th align="right">Answers</Th>
            <Th align="right">Failed</Th>
            <Th align="right">First word p50</Th>
            <Th align="right">p90</Th>
            <Th align="right">Cost</Th>
            <Th align="right">Per chat</Th>
          </THead>
          <TBody>
            {(['customer', 'dealer', 'staff'] as const).map((a) => {
              const r = m.per[a]
              const s = assistantSettings(a)
              return (
                <Tr key={a}>
                  <Td>{ASSISTANT_LABEL[a]}</Td>
                  <Td>
                    <span className="text-adm-muted">{s.model} · {s.effort}</span>{' '}
                    {!isAssistantConfigured(a) && <Badge tone="bad">no API key</Badge>}
                  </Td>
                  <Td align="right">{num(r.conversations)}</Td>
                  <Td align="right">{num(r.answers)}</Td>
                  <Td align="right" className={r.failed ? 'text-adm-red' : undefined}>
                    {num(r.failed)}
                  </Td>
                  <Td align="right">{secs(r.ttftP50)}</Td>
                  <Td align="right">{secs(r.ttftP90)}</Td>
                  <Td align="right">{usd(r.cost)}</Td>
                  <Td align="right">{usd(r.costPerConversation)}</Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      </Panel>

      <div className="grid gap-2 lg:grid-cols-2">
        <Panel title="Why things went wrong" meta={`tickets with a cause, last ${days} days`}>
          {causes.length ? (
            <KV rows={causes.map((c) => [causeLabel(c.cause), num(c.count)] as [string, string])} />
          ) : (
            <Empty>No causes recorded yet. Set the Cause on tickets as you review them.</Empty>
          )}
        </Panel>
        <Panel title="How the loop works" meta={`owners: ${reviewers.map((r) => r.name).join(', ') || 'none'}`}>
          <ol className="list-decimal space-y-1 py-2.5 pl-8 pr-3 text-[12.5px] leading-relaxed text-adm-text">
            <li>Every customer chat is screened after each answer. Support issues become <CellLink href="/portal/admin/support/?queue=ai">auto-flag tickets</CellLink>; 3% of the rest are sampled at random.</li>
            <li>Customers can tap “Talk to a person”; dealers ask the Pro Hub agent or send feedback and feature requests from their Support tab.</li>
            <li>On each ticket, set the cause, then fix it: add knowledge (used from the next question), or note a prompt, code or model change.</li>
            <li>Save the question as a test case so the fix is checked before prompt or model changes ship.</li>
          </ol>
        </Panel>
      </div>
    </div>
  )
}

async function Knowledge() {
  const k = await knowledgeOverview()
  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="grid content-start gap-2">
        <Panel
          title="Website pages"
          tone="sales"
          meta={k.refreshedAt ? `${num(k.pageCount)} pages · ${num(k.pageChunks)} chunks · read ${ago(k.refreshedAt)}` : 'not read yet'}
          actions={<ActionButton action={refreshKnowledge} tone="gold">Re-read the website</ActionButton>}
        >
          <p className="px-3 py-2.5 text-[12.5px] leading-relaxed text-adm-text">
            The assistants answer from the live crazyseal.com pages (FAQ, warranty, products, installation, shipping, returns, the dealer resources and more) plus the staff notes on this page. Re-read the website after changing page content. Pages under Resources and Professional tools only go to the dealer and staff assistants.
          </p>
        </Panel>

        <Panel title="Staff notes" meta={`${k.notes.filter((n) => n.active).length} on · ${k.notes.filter((n) => !n.active).length} off`}>
          {k.notes.length === 0 ? (
            <Empty>No notes yet. Add one when a review finds something the website doesn’t say.</Empty>
          ) : (
            <ul className="divide-y divide-adm-line-soft">
              {k.notes.map((n) => (
                <li key={n.id} className={n.active ? '' : 'opacity-60'}>
                  <details>
                    <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[12.5px] text-adm-ink">
                      <span className="flex-1 font-medium">{n.title}</span>
                      {n.audience === 'dealer' && <Badge tone="gold">dealers & staff</Badge>}
                      {!n.active && <Badge tone="neutral">off</Badge>}
                      <span className="text-[11px] text-adm-muted">{n.created_by?.split('@')[0]} · {ago(n.updated_at)}</span>
                    </summary>
                    <KnowledgeNoteForm action={updateKnowledgeNote.bind(null, n.id)} initial={{ title: n.title, body: n.body, audience: n.audience }} submitLabel="Save changes" />
                    <div className="px-3 pb-3">
                      <ActionButton action={setKnowledgeNoteActive.bind(null, n.id, !n.active)} tone={n.active ? 'danger' : 'default'}>
                        {n.active ? 'Switch off' : 'Switch on'}
                      </ActionButton>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Panel title="Add a note" tone="dealers">
        <KnowledgeNoteForm action={addKnowledgeNote.bind(null, null)} />
      </Panel>
    </div>
  )
}

async function Tests() {
  const cases = await listEvalCases()
  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Panel
        title="Test cases"
        tone="sales"
        meta={`${cases.filter((c) => c.active).length} active`}
        actions={<CellLink href="/api/admin/ai/eval-cases/">Download JSON</CellLink>}
      >
        {cases.length === 0 ? (
          <Empty>No test cases yet. Save one from a ticket once its problem is fixed.</Empty>
        ) : (
          <Table>
            <THead>
              <Th>Question</Th>
              <Th>Assistant</Th>
              <Th>Should</Th>
              <Th align="right">Facts</Th>
              <Th>From</Th>
              <Th align="right"> </Th>
            </THead>
            <TBody>
              {cases.map((c) => (
                <Tr key={c.id} className={c.active ? undefined : 'opacity-50'}>
                  <Td className="max-w-[420px] truncate" title={`${c.question}\n\n${c.expected_facts.join('\n')}`}>
                    {c.question}
                  </Td>
                  <Td muted>{c.assistant}</Td>
                  <Td muted>{c.expected_behavior}</Td>
                  <Td align="right">{c.expected_facts.length}</Td>
                  <Td>{c.origin_ticket_id ? <CellLink href={`/portal/admin/support/${c.origin_ticket_id}/`}>ticket</CellLink> : <span className="text-adm-muted">—</span>}</Td>
                  <Td align="right">
                    <ActionButton action={setEvalCaseActive.bind(null, c.id, !c.active)}>{c.active ? 'Retire' : 'Restore'}</ActionButton>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Panel>
      <Panel title="Add a test case" tone="dealers">
        <EvalCaseForm action={saveEvalCase.bind(null, null)} defaults={{ assistant: 'customer', question: '' }} />
      </Panel>
    </div>
  )
}

async function Chats({ assistant, page, params }: { assistant: string; page: number; params: Record<string, string | undefined> }) {
  const data = await recentConversations({ assistant, page })
  return (
    <Panel title="Recent chats" meta={`${num(data.total)} total`} tone="sales">
      {data.rows.length === 0 ? (
        <Empty>No chats yet.</Empty>
      ) : (
        <Table>
          <THead>
            <Th>Chat</Th>
            <Th>Assistant</Th>
            <Th align="right">Messages</Th>
            <Th>Screen</Th>
            <Th align="right">Last message</Th>
          </THead>
          <TBody>
            {data.rows.map((c) => (
              <Tr key={c.id as string}>
                <Td className="max-w-[420px] truncate">
                  <CellLink href={`${BASE}conversations/${c.id}/`}>{(c.title as string) || 'Untitled'}</CellLink>
                </Td>
                <Td muted>{ASSISTANT_LABEL[c.assistant as string]}</Td>
                <Td align="right">{num(c.message_count as number)}</Td>
                <Td>
                  {(c.screen as { kind?: string } | null)?.kind === 'support_issue' ? (
                    <Badge tone="warn">support issue</Badge>
                  ) : c.screen ? (
                    <Badge tone="neutral">inquiry</Badge>
                  ) : (
                    <span className="text-adm-muted">—</span>
                  )}
                  {Boolean(c.sampled) && (
                    <span className="ml-1">
                      <Badge tone="info">sampled</Badge>
                    </span>
                  )}
                </Td>
                <Td align="right" muted title={dateTime(c.last_message_at as string)}>
                  {ago(c.last_message_at as string)}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
      <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={{ ...params, tab: 'chats' }} noun="chats" />
    </Panel>
  )
}
