import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getLeads, LEAD_STATUS_FILTERS, LEAD_STATUSES, LEAD_TYPES, leadInterest, leadStatus, leadType } from '@/lib/portal/admin/leads'
import { setLeadStatus } from '@/lib/portal/admin/lead-actions'
import { dateShort, dateTime, num, pct } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
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
import { StatusSelect } from '@/components/portal/admin/controls'

export const metadata: Metadata = { title: 'Leads' }

const BASE = '/portal/admin/leads/'
const TYPE_BADGE = { quote: { tone: 'good', label: 'Quote' }, business: { tone: 'gold', label: 'Dealer' }, contact: { tone: 'neutral', label: 'Contact' } } as const

export default async function AdminLeadsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const type = pick(sp.type, LEAD_TYPES, 'all')
  const status = pick(sp.status, LEAD_STATUS_FILTERS, 'open')
  const q = one(sp.q)
  const page = pageNum(sp.page)
  const data = await getLeads({ type, status, q, page })
  const params = { type: type === 'all' ? undefined : type, status: status === 'open' ? undefined : status, q }

  return (
    <>
      <PageHeader
        title="Leads"
        description="Quote requests, dealer inquiries and contact messages from crazyseal.com. Each one is also sent to Zoho CRM when it arrives; the status here is the site's own follow-up flag."
      >
        <StatGrid>
          <Stat hero label="Never followed up" value={num(data.summary.untouched)} sub={`of ${num(data.summary.total)} leads · status New`} />
          <Stat label="Last 30 days" value={num(data.summary.last30)} />
          <Stat label="Purchase quotes" value={num(data.summary.quotes)} tone="info" />
          <Stat label="Dealer / partner" value={num(data.summary.business)} tone="dealers" />
          <Stat label="Sent to Zoho" value={num(data.summary.inZoho)} sub={pct(data.summary.total ? data.summary.inZoho / data.summary.total : 0)} tone="info" />
          <Stat label="Showing" value={num(data.total)} sub="with these filters" tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented options={LEAD_TYPES.map((t) => ({ ...t, count: data.typeCounts[t.key] }))} value={type} param="type" base={BASE} params={params} />
          <Segmented options={LEAD_STATUS_FILTERS.map((s) => ({ ...s, count: data.statusCounts[s.key] }))} value={status} param="status" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Name, email, phone, RV, business…" />
        </Toolbar>
      </PageHeader>

      <Panel>
        {data.rows.length ? (
          <Table>
            <THead>
              <Th>Received</Th>
              <Th>Lead</Th>
              <Th className="hidden @xl:table-cell">Type</Th>
              <Th className="hidden @3xl:table-cell">Interested in</Th>
              <Th className="hidden @4xl:table-cell">Location</Th>
              <Th className="hidden @5xl:table-cell">From page</Th>
              <Th className="hidden @2xl:table-cell">Zoho</Th>
              <Th>Status</Th>
            </THead>
            <TBody>
              {data.rows.map((r) => {
                const t = leadType(r)
                return (
                  <Tr key={r.id}>
                    <Td muted title={dateTime(r.created_at)}>
                      {dateShort(r.created_at)}
                    </Td>
                    <Td className="max-w-[16rem]">
                      <CellLink href={`${BASE}${r.id}/`} className="block truncate">
                        {r.name || r.email || 'Unnamed'}
                      </CellLink>
                      <span className="block truncate text-[11px] text-adm-muted">{[r.email, r.phone].filter(Boolean).join(' · ')}</span>
                    </Td>
                    <Td className="hidden @xl:table-cell">
                      <Badge tone={TYPE_BADGE[t].tone}>{TYPE_BADGE[t].label}</Badge>
                    </Td>
                    <Td muted className="hidden max-w-[16rem] truncate @3xl:table-cell">
                      {leadInterest(r)}
                    </Td>
                    <Td muted className="hidden max-w-[10rem] truncate @4xl:table-cell">
                      {r.location || '—'}
                    </Td>
                    <Td muted className="hidden @5xl:table-cell">
                      {r.source_page ? `/${r.source_page.replace(/^\//, '')}` : '—'}
                    </Td>
                    <Td className="hidden @2xl:table-cell">{r.zoho_lead_id ? <Badge tone="info">Synced</Badge> : <span className="text-adm-faint">—</span>}</Td>
                    <Td>
                      <StatusSelect value={leadStatus(r)} options={LEAD_STATUSES} action={setLeadStatus.bind(null, r.id)} label={`Status for ${r.name ?? 'lead'}`} />
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Empty>No leads match.</Empty>
        )}
        <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={params} noun="leads" />
      </Panel>
    </>
  )
}
