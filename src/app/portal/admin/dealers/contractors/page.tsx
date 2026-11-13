import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Plus, RefreshCw } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { syncContractorsFromShopify } from '@/lib/portal/admin/contractor-actions'
import { getContractorList, type ContractorListRow } from '@/lib/portal/admin/dealers'
import { getCoverage, customerName } from '@/lib/portal/admin/sales'
import { dateShort, money0, num, pct } from '@/lib/portal/admin/format'
import { one, pick, type SearchParams } from '@/lib/portal/admin/params'
import { ActionButton } from '@/components/portal/admin/controls'
import { BarList } from '@/components/portal/admin/BarList'
import { ContractorsBoard } from '@/components/portal/admin/ContractorsBoard'
import { HelpTip } from '@/components/portal/admin/HelpTip'
import { SERIES } from '@/components/portal/admin/series'
import { BUTTON } from '@/components/portal/admin/styles'
import {
  CellLink,
  PageHeader,
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

export const metadata: Metadata = { title: 'Contractors' }

const BASE = '/portal/admin/dealers/contractors/'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'account', label: 'On the Pro Hub' },
  { key: 'noaccount', label: 'No account' },
  { key: 'recent', label: 'Ordered in 90 days' },
  { key: 'lapsed', label: 'No recent orders' },
  { key: 'shopify', label: 'From Shopify' },
  { key: 'nomatch', label: 'No Shopify match' },
  { key: 'hidden', label: 'Hidden' },
  { key: 'unmapped', label: 'Not on the map' },
] as const

const TYPES = [
  { key: 'all', label: 'All types' },
  { key: 'rv', label: 'RV' },
  { key: 'commercial', label: 'Commercial' },
] as const

const SORTS = [
  { key: 'lifetime', label: 'Lifetime spend' },
  { key: 'history', label: 'Spend in history' },
  { key: 'recent', label: '90 days' },
  { key: 'last', label: 'Last order' },
  { key: 'name', label: 'Name' },
] as const

type Filter = (typeof FILTERS)[number]['key']
type Sort = (typeof SORTS)[number]['key']

const test = (f: Filter, d: ContractorListRow) =>
  f === 'account'
    ? d.portal !== 'none'
    : f === 'noaccount'
      ? d.portal === 'none'
      : f === 'recent'
        ? d.recentOrders > 0
        : f === 'lapsed'
          ? d.recentOrders === 0
          : f === 'shopify'
            ? d.origin === 'shopify'
            : f === 'nomatch'
              ? d.customerCount === 0
              : f === 'hidden'
                ? !d.isListed
                : f === 'unmapped'
                  ? d.lat === null
                  : true

const SORT: Record<Sort, (a: ContractorListRow, b: ContractorListRow) => number> = {
  lifetime: (a, b) => b.lifetime - a.lifetime,
  history: (a, b) => b.historySales - a.historySales,
  recent: (a, b) => b.recentSales - a.recentSales,
  last: (a, b) => (b.lastOrderAt ?? '').localeCompare(a.lastOrderAt ?? ''),
  name: () => 0,
}

export default async function AdminContractorsPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('contractors')
  const sp = await searchParams
  const q = one(sp.q)?.toLowerCase()
  const filter = pick(sp.filter, FILTERS, 'all')
  const type = pick(sp.type, TYPES, 'all')
  const sort = pick(sp.sort, SORTS, 'lifetime')
  const [{ contractors, summary: s, reps, pending, recentDays }, coverage] = await Promise.all([getContractorList(), getCoverage()])
  const since = coverage.first ? dateShort(coverage.first) : 'the start of the history'

  const searched = contractors.filter(
    (d) =>
      (type === 'all' || d.segment === type) &&
      (!q || [d.name, d.contact, d.email, d.city, d.state, d.zip, d.slug, ...d.reps].some((v) => v?.toLowerCase().includes(q))),
  )
  // Names are already in order; the spending sorts keep that order for ties.
  const rows = searched.filter((d) => test(filter, d)).sort((a, b) => SORT[sort](a, b) || a.name.localeCompare(b.name))
  const params = {
    q: one(sp.q),
    filter: filter === 'all' ? undefined : filter,
    type: type === 'all' ? undefined : type,
    sort: sort === 'lifetime' ? undefined : sort,
  }
  const compare: [string, number, number][] = [
    ['Lifetime, from Shopify (since 2019)', s.lifetime, s.allLifetime],
    [`In the order history here (since ${since})`, s.historySales, s.allHistory],
    [`Last ${recentDays} days`, s.recentSales, s.allRecent],
    [`Orders tagged “Dealer” (since ${since})`, s.dealerOrderSales, s.allHistory],
  ]

  return (
    <>
      <PageHeader
        title={
          <HelpTip id="contractors-help" title="Contractors">
            Every Crazy Seal contractor in one list: the dealer list, contractors added here, and the Shopify dealer roster consolidated in (customers tagged
            Dealer, Pro or Professional, or with an order tagged Dealer). Each one is linked to their Shopify customer records for their spending, and to their
            Pro Hub account when they have one. Listed contractors have a white-label page at /contractor/&lt;their name&gt; with a quote request form, and a
            pin on the public finder. Click a pin or a name to open one.
          </HelpTip>
        }
        actions={
          <>
            <a href="/contractor/" target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
              Public finder <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
            <Link href="/portal/admin/dealers/contractors/new/" className={BUTTON.gold}>
              <Plus className="h-3.5 w-3.5" /> Add contractor
            </Link>
          </>
        }
      >
        <StatGrid>
          <Stat label="Contractors" value={num(s.count)} sub={`${num(s.listed)} listed publicly · ${num(s.fromShopify)} from Shopify`} tone="dealers" />
          <Stat hero label="Contractor lifetime spend" value={money0(s.lifetime)} sub={`${pct(s.lifetimeShare)} of all customer sales since 2019`} />
          <Stat label={`Contractor spend since ${since}`} value={money0(s.historySales)} sub={`${pct(s.historyShare)} of sales in the history`} tone="dealers" />
          <Stat label={`Last ${recentDays} days`} value={money0(s.recentSales)} sub={`${num(s.orderedRecently)} contractors ordered · ${pct(s.recentShare)} of sales`} />
          <Stat label="On the Pro Hub" value={num(s.onPortal)} sub={`${num(s.noAccount)} with no account`} tone="info" />
          <Stat label="Linked to Shopify" value={num(s.withShopify)} sub={`${num(s.count - s.withShopify)} with no Shopify match`} tone="info" />
        </StatGrid>
      </PageHeader>

      {(pending.adds > 0 || pending.links > 0) && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-adm-line bg-adm-blue-bright/10 px-3 py-2 text-[12.5px] text-adm-ink">
          <span>
            Shopify has{' '}
            {[
              pending.adds > 0 && `${num(pending.adds)} dealer${pending.adds === 1 ? '' : 's'} who aren’t contractors yet`,
              pending.links > 0 && `${num(pending.links)} customer record${pending.links === 1 ? '' : 's'} that match a contractor`,
            ]
              .filter(Boolean)
              .join(' and ')}
            . New contractors come in hidden until you list them.
          </span>
          <ActionButton action={syncContractorsFromShopify} tone="gold">
            <RefreshCw className="h-3.5 w-3.5" /> Add and link
          </ActionButton>
        </div>
      )}

      <div className="mb-2 grid gap-2 lg:grid-cols-2">
        <Panel
          title="Contractor spending vs. all sales"
          tone="dealers"
          actions={
            <Link href="/portal/admin/history/" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-adm-muted hover:text-adm-ink">
              Sales history <ArrowRight className="h-3 w-3" />
            </Link>
          }
        >
          <Table>
            <THead>
              <Th>Period</Th>
              <Th align="right">Contractors</Th>
              <Th align="right" className="hidden @md:table-cell">
                All sales
              </Th>
              <Th align="right">Share</Th>
            </THead>
            <TBody>
              {compare.map(([label, theirs, all]) => (
                <Tr key={label}>
                  <Td>{label}</Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(theirs)}
                  </Td>
                  <Td align="right" muted className="hidden @md:table-cell">
                    {money0(all)}
                  </Td>
                  <Td align="right">{pct(all ? theirs / all : 0)}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] leading-snug text-adm-muted">
            Lifetime is Shopify’s total for each linked customer, back to 2019. The order history kept here starts {since}, so the other rows are orders
            since then. A contractor’s spending counts every order from their linked customers, tagged “Dealer” or not.
          </p>
        </Panel>
        <Panel title="Orders tagged “Dealer”, by sales rep" meta={`since ${since}`} tone="dealers">
          <BarList rows={reps.map((r) => ({ key: r.key, label: r.label, value: r.sales, meta: `${num(r.orders)} orders` }))} color={SERIES.volume} limit={6} empty="No orders tagged Dealer yet." />
        </Panel>
      </div>

      {pending.ambiguous.length > 0 && (
        <Panel title="Shopify customers to link by hand" meta="each matches more than one contractor" tone="dealers" className="mb-2">
          <ul className="divide-y divide-adm-line-soft text-[12.5px]">
            {pending.ambiguous.map(({ customer, contractors: matches }) => (
              <li key={customer.shopify_id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2">
                <CellLink href={`/portal/admin/customers/${customer.legacy_resource_id ?? customer.shopify_id.split('/').pop()}/`}>{customerName(customer)}</CellLink>
                <span className="text-adm-muted">{customer.email ?? 'no email'} · could be</span>
                {matches.map((m, i) => (
                  <span key={m.id}>
                    <CellLink href={`/portal/admin/dealers/contractors/${m.id}/`}>{m.name}</CellLink>
                    {m.contact && <span className="text-adm-muted"> ({m.contact})</span>}
                    {i < matches.length - 1 && <span className="text-adm-muted"> or</span>}
                  </span>
                ))}
                <span className="text-[11.5px] text-adm-faint">Link them on the right contractor’s page.</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Toolbar className="mb-2">
        <Segmented options={FILTERS.map((f) => ({ ...f, count: searched.filter((d) => test(f.key, d)).length }))} value={filter} param="filter" base={BASE} params={params} />
        <Segmented options={TYPES} value={type} param="type" base={BASE} params={params} />
        <Segmented options={SORTS} value={sort} param="sort" base={BASE} params={params} />
        <SearchBox base={BASE} params={params} value={one(sp.q)} placeholder="Contractor, city, state, ZIP, rep…" />
      </Toolbar>

      {/* Keyed so a new filter, sort or search starts the list back at the top. */}
      <ContractorsBoard key={`${filter}:${type}:${sort}:${q ?? ''}`} rows={rows} since={since} />
    </>
  )
}
