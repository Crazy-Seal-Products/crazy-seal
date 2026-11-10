import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getViewAsLog, getViewAsTargets, type ViewAsRow } from '@/lib/portal/admin/dealers'
import { ago, dateShort, money0, num } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import { ViewAsButton } from '@/components/portal/admin/ViewAsButton'
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
import { PORTAL_BADGE } from '@/components/portal/admin/portal-state'

export const metadata: Metadata = { title: 'View as' }

const BASE = '/portal/admin/dealers/view-as/'
const PER_PAGE = 50

const FILTERS = [
  { key: 'all', label: 'Everyone' },
  { key: 'account', label: 'Has an account' },
  { key: 'base', label: 'No account · base view' },
] as const

type Filter = (typeof FILTERS)[number]['key']

const test = (f: Filter, r: ViewAsRow) => (f === 'account' ? Boolean(r.proUserId) : f === 'base' ? !r.proUserId : true)

export default async function AdminViewAsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('view_as')
  const sp = await searchParams
  const q = one(sp.q)?.toLowerCase()
  const filter = pick(sp.filter, FILTERS, 'all')
  const [targets, log] = await Promise.all([getViewAsTargets(), getViewAsLog()])

  const searched = q ? targets.filter((r) => [r.name, r.contact, r.email, r.location].some((v) => v?.toLowerCase().includes(q))) : targets
  const rows = searched.filter((r) => test(filter, r))
  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const current = Math.min(pageNum(sp.page), pages)
  const shown = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const params = { q: one(sp.q), filter: filter === 'all' ? undefined : filter }
  const withAccount = targets.filter((r) => r.proUserId).length

  return (
    <>
      <PageHeader
        title="View as"
        description="Open the Pro Hub as any dealer, read-only, in a new tab. Dealers who haven’t made an account open in the base view: the Pro Hub built from their Shopify record, as they’d see it after signing up."
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Dealers you can view" value={num(targets.length)} sub="roster plus Pro Hub accounts" tone="dealers" />
          <Stat label="With a Pro Hub account" value={num(withAccount)} sub="opens their account" />
          <Stat label="No account yet" value={num(targets.length - withAccount)} sub="opens the base view" tone="info" />
          <Stat label="Views · 30 days" value={num(log.last30)} sub="by all admins" tone="info" />
        </StatGrid>
      </PageHeader>

      <Toolbar className="mb-2">
        <Segmented options={FILTERS.map((f) => ({ ...f, count: searched.filter((r) => test(f.key, r)).length }))} value={filter} param="filter" base={BASE} params={params} />
        <SearchBox base={BASE} params={params} value={one(sp.q)} placeholder="Dealer, email, state…" />
      </Toolbar>

      <Panel tone="dealers" className="mb-2">
        {shown.length ? (
          <>
            <Table>
              <THead>
                <Th>Dealer</Th>
                <Th>Pro Hub</Th>
                <Th className="hidden @2xl:table-cell">Pro status</Th>
                <Th className="hidden @xl:table-cell">Last sign-in</Th>
                <Th align="right" className="hidden @3xl:table-cell">Lifetime</Th>
                <Th align="right">
                  <span className="sr-only">View as</span>
                </Th>
              </THead>
              <TBody>
                {shown.map((r) => (
                  <Tr key={r.key}>
                    <Td className="max-w-[16rem]">
                      {r.customerLegacyId ? (
                        <CellLink href={`/portal/admin/customers/${r.customerLegacyId}/`} className="block truncate">
                          {r.name}
                        </CellLink>
                      ) : (
                        <span className="block truncate font-semibold text-adm-ink">{r.name}</span>
                      )}
                      <span className="block truncate text-[11px] text-adm-muted">
                        {r.contact ?? r.email ?? 'No email'}
                        {r.location !== '—' && ` · ${r.location}`}
                      </span>
                    </Td>
                    <Td>
                      <Badge tone={PORTAL_BADGE[r.portal].tone}>{PORTAL_BADGE[r.portal].label}</Badge>
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <span className="flex gap-1">
                        {r.statuses.map((s) => (
                          <Badge key={s} tone={s === 'Member' ? 'neutral' : 'gold'} dot={false}>
                            {s}
                          </Badge>
                        ))}
                      </span>
                    </Td>
                    <Td muted className="hidden @xl:table-cell">
                      {r.lastLoginAt ? `${dateShort(r.lastLoginAt)} · ${ago(r.lastLoginAt)}` : '—'}
                    </Td>
                    <Td align="right" className="hidden font-semibold text-adm-ink @3xl:table-cell">
                      {money0(r.spent)}
                    </Td>
                    <Td align="right">
                      {r.proUserId || r.email ? (
                        <ViewAsButton proUserId={r.proUserId} customerId={r.customerId} name={r.name} />
                      ) : (
                        <span className="text-[11.5px] text-adm-faint" title="The Pro Hub works off the dealer’s email, and their Shopify record has none">
                          No email
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
            <Pagination page={current} pages={pages} total={rows.length} base={BASE} params={params} noun="dealers" />
          </>
        ) : (
          <Empty>No dealers match.</Empty>
        )}
      </Panel>

      <Panel title="Recent views" meta="latest View as sessions" tone="info">
        {log.recent.length ? (
          <Table>
            <THead>
              <Th>Admin</Th>
              <Th>Viewed</Th>
              <Th>When</Th>
            </THead>
            <TBody>
              {log.recent.map((v) => (
                <Tr key={`${v.created_at}-${v.admin_email}`}>
                  <Td>{v.admin_name || v.admin_email}</Td>
                  <Td muted>
                    {v.pro_user_email}
                    {!v.pro_user_id && <span className="text-adm-faint"> · base view</span>}
                  </Td>
                  <Td muted>{`${dateShort(v.created_at)} · ${ago(v.created_at)}`}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No one has used View as yet.</Empty>
        )}
      </Panel>
    </>
  )
}
