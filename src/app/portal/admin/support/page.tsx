import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { ago, dateTime, num } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import { listReviewers, listTickets, QUEUES, queueCounts, STATUS_FILTERS } from '@/lib/support/admin'
import { TICKET_KINDS, statusLabel } from '@/lib/support/tickets'
import {
  Badge,
  CellLink,
  Empty,
  PageHeader,
  Pagination,
  Panel,
  SearchBox,
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

export const metadata: Metadata = { title: 'Support inbox' }

const BASE = '/portal/admin/support/'

const KIND_TONE = {
  customer_handoff: 'gold',
  auto_flag: 'warn',
  review_sample: 'neutral',
  dealer_support: 'good',
  general_feedback: 'info',
  feature_request: 'info',
} as const

const STATUS_TONE = { new: 'gold', triaged: 'info', in_progress: 'good', waiting: 'neutral', resolved: 'neutral', wont_fix: 'neutral' } as const

export default async function SupportInboxPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('support')
  const sp = await searchParams
  const queue = pick(sp.queue, QUEUES, 'all')
  const status = pick(sp.status, STATUS_FILTERS, 'open')
  const q = one(sp.q)
  const page = pageNum(sp.page)
  const [data, counts, reviewers] = await Promise.all([listTickets({ queue, status, q, page, me: admin.email }), queueCounts(), listReviewers()])
  const params = { queue: queue === 'all' ? undefined : queue, status: status === 'open' ? undefined : status, q }
  const nameOf = (email: string | null) => (email ? reviewers.find((r) => r.email === email)?.name ?? email.split('@')[0] : '—')

  return (
    <>
      <PageHeader
        title="Support inbox"
        description={`Customer hand-offs from the site chat, flagged and sampled AI chats, dealer requests from the Pro Hub, and feedback. Owners: ${reviewers.map((r) => r.name).join(', ') || 'none set'}.`}
      >
        <StatGrid>
          <Stat hero label="Open" value={num(counts.all)} sub="all queues" />
          <Stat label="Customers" value={num(counts.customers)} tone="info" />
          <Stat label="Dealers" value={num(counts.dealers)} tone="dealers" />
          <Stat label="AI review" value={num(counts.ai)} tone="info" />
          <Stat label="Feedback & requests" value={num(counts.feedback)} tone="info" />
          <Stat label="Showing" value={num(data.total)} sub="with these filters" tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented options={QUEUES.map((o) => ({ ...o, count: o.key === 'all' ? counts.all : counts[o.key] }))} value={queue} param="queue" base={BASE} params={params} />
          <Segmented options={STATUS_FILTERS} value={status} param="status" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Subject or #number…" />
        </Toolbar>
      </PageHeader>

      {data.missing ? (
        <Panel>
          <Empty>The support tables aren’t set up yet. Run migration 019_ai_support.sql.</Empty>
        </Panel>
      ) : (
        <Panel title="Tickets" meta={`${num(data.total)} total`}>
          {data.rows.length === 0 ? (
            <Empty>Nothing here. Nice.</Empty>
          ) : (
            <Table>
              <THead>
                <Th>#</Th>
                <Th>Subject</Th>
                <Th>Type</Th>
                <Th>From</Th>
                <Th>Status</Th>
                <Th>Owner</Th>
                <Th align="right">Updated</Th>
              </THead>
              <TBody>
                {data.rows.map((t) => (
                  <Tr key={t.id}>
                    <Td className="tabular-nums text-adm-muted">{t.number}</Td>
                    <Td>
                      <CellLink href={`${BASE}${t.id}/`}>{t.subject}</CellLink>
                      {t.priority === 'high' && (
                        <span className="ml-1.5">
                          <Badge tone="bad">High</Badge>
                        </span>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={KIND_TONE[t.kind]}>{TICKET_KINDS.find((k) => k.key === t.kind)?.short ?? t.kind}</Badge>
                    </Td>
                    <Td className="max-w-[180px] truncate">{t.contact_name || t.contact_email || t.staff_email || (t.kind === 'auto_flag' || t.kind === 'review_sample' ? 'Site visitor' : '—')}</Td>
                    <Td>
                      <Badge tone={STATUS_TONE[t.status]}>{statusLabel(t.status)}</Badge>
                    </Td>
                    <Td className="text-adm-muted">{nameOf(t.assignee_email)}</Td>
                    <Td align="right" className="whitespace-nowrap text-adm-muted" title={dateTime(t.updated_at)}>
                      {ago(t.updated_at)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
          <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={params} noun="tickets" />
        </Panel>
      )}
    </>
  )
}
