import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { dateShort, dateTime, money, num } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import { getRepRoster, repForAdmin } from '@/lib/portal/admin/reps'
import { roofSummary } from '@/lib/pricing/engine'
import { HANDOFF_LABEL } from '@/lib/pricing/types'
import { ADMIN_AUDIENCE_FILTERS, ADMIN_STATUS_FILTERS, listAdminQuotes } from '@/lib/quotes/data'
import { isExpired, QUOTE_STATUS_LABEL, type QuoteStatus } from '@/lib/quotes/types'
import { BUTTON } from '@/components/portal/admin/styles'
import { Badge, CellLink, Empty, PageHeader, Pagination, Panel, SearchBox, Segmented, Stat, StatGrid, Table, TBody, Td, Th, THead, Toolbar, Tr } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Quotes' }

const BASE = '/portal/admin/quotes/'
const STATUS_TONE: Record<QuoteStatus, 'good' | 'warn' | 'bad' | 'neutral' | 'info' | 'gold'> = { open: 'info', checkout: 'gold', ordered: 'good', lost: 'bad', cancelled: 'neutral' }

/**
 * Every quote: the public builder's, contractors' and staff's. Needs staff
 * lists open quotes handed to staff (freight, terms, a failed checkout,
 * details missing or a buyer asking for a specialist). A Sales rep sees only
 * the quotes whose rep is them.
 */
export default async function AdminQuotesPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('quotes')
  const sp = await searchParams
  const status = pick(sp.status, ADMIN_STATUS_FILTERS, 'active')
  const audience = pick(sp.audience, ADMIN_AUDIENCE_FILTERS, 'all')
  const q = one(sp.q)
  const page = pageNum(sp.page)
  const roster = await getRepRoster()
  const repId = admin.role === 'sales_rep' ? (repForAdmin(admin, roster)?.id ?? null) : undefined
  const data = await listAdminQuotes({ status, audience, q, page, repId })
  const reps = new Map(roster.reps.filter((r) => r.id).map((r) => [r.id as string, r.name]))
  const params = { status: status === 'active' ? undefined : status, audience: audience === 'all' ? undefined : audience, q }

  return (
    <>
      <PageHeader
        title="Quotes"
        description={
          admin.role === 'sales_rep'
            ? 'Quotes on your accounts. Prices come from the price book and tiers in Pricing.'
            : 'Material quotes from the public builder, contractors’ portals and staff. Prices come from the price book and tiers in Pricing.'
        }
        actions={
          <Link href={`${BASE}new/`} className={BUTTON.gold}>
            <Plus className="h-3.5 w-3.5" /> New quote
          </Link>
        }
      >
        <StatGrid>
          <Stat hero label="Needs staff" value={num(data.counts.needs_staff)} sub="open, handed to staff" />
          <Stat label="Open" value={num(data.counts.active)} />
          <Stat label="Ordered" value={num(data.counts.ordered)} tone="info" />
          <Stat label="Lost" value={num(data.counts.lost)} tone="info" />
          <Stat label="All" value={num(data.counts.all)} tone="info" />
          <Stat label="Showing" value={num(data.total)} sub="with these filters" tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented options={ADMIN_STATUS_FILTERS.map((s) => ({ ...s, count: data.counts[s.key] }))} value={status} param="status" base={BASE} params={params} />
          <Segmented options={ADMIN_AUDIENCE_FILTERS} value={audience} param="audience" base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Q-1001, name, email, company, phone…" />
        </Toolbar>
      </PageHeader>

      <Panel>
        {data.rows.length ? (
          <Table>
            <THead>
              <Th>Created</Th>
              <Th>Quote</Th>
              <Th className="hidden @2xl:table-cell">From</Th>
              <Th className="hidden @4xl:table-cell">Roof</Th>
              <Th align="right">Total</Th>
              <Th>Status</Th>
              <Th className="hidden @3xl:table-cell">Rep</Th>
              <Th className="hidden @5xl:table-cell">Viewed</Th>
            </THead>
            <TBody>
              {data.rows.map((r) => {
                const stale = (r.status === 'open' || r.status === 'checkout') && isExpired(r)
                return (
                  <Tr key={r.id}>
                    <Td muted title={dateTime(r.created_at)}>
                      {dateShort(r.created_at)}
                    </Td>
                    <Td className="max-w-[16rem]">
                      <CellLink href={`${BASE}${r.id}/`} className="block truncate">
                        {r.number} · {r.company || r.name}
                      </CellLink>
                      <span className="block truncate text-[11px] text-adm-muted">{[r.company ? r.name : null, r.email].filter(Boolean).join(' · ')}</span>
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <Badge tone={r.audience === 'contractor' ? 'gold' : 'neutral'}>{r.audience === 'contractor' ? 'Contractor' : r.source === 'admin' ? 'Staff' : 'Builder'}</Badge>
                    </Td>
                    <Td muted className="hidden max-w-[16rem] truncate @4xl:table-cell">
                      {roofSummary(r.inputs)}
                    </Td>
                    <Td align="right">{money(r.total)}</Td>
                    <Td>
                      <span className="flex flex-wrap gap-1">
                        <Badge tone={STATUS_TONE[r.status]}>{QUOTE_STATUS_LABEL[r.status]}</Badge>
                        {r.handoff && r.status === 'open' && <Badge tone="warn">{HANDOFF_LABEL[r.handoff]}</Badge>}
                        {stale && <Badge tone="neutral">Expired</Badge>}
                      </span>
                    </Td>
                    <Td muted className="hidden @3xl:table-cell">
                      {r.rep_id ? reps.get(r.rep_id) ?? '—' : '—'}
                    </Td>
                    <Td muted className="hidden @5xl:table-cell">
                      {r.viewed_at ? dateShort(r.viewed_at) : '—'}
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Empty>{admin.role === 'sales_rep' && repId === null ? 'Your login isn’t linked to a sales rep yet, so no quotes are yours.' : 'No quotes match.'}</Empty>
        )}
        <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={params} noun="quotes" />
      </Panel>
    </>
  )
}
