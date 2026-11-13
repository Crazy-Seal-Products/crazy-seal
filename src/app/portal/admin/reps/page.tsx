import type { Metadata } from 'next'
import React from 'react'
import { ExternalLink, Trophy } from 'lucide-react'
import { getAdminSections, requirePortalAdmin } from '@/lib/portal/admin/auth'
import {
  FOLLOW_UP_DAYS,
  getRepReport,
  getRepRoster,
  ORDER_TYPES,
  REP_RANGES,
  repForAdmin,
  staffLogins,
  type RepReport,
  type RepStanding,
} from '@/lib/portal/admin/reps'
import { compareLabel, periodLabel, parseDay } from '@/lib/portal/admin/sales'
import { ago, bucketLabel, dateLong, dateShort, dayKey, legacyId, money, money0, num, pct, shopifyAdminUrl, timeOfDay } from '@/lib/portal/admin/format'
import { one, pageNum, pick, type SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  CellLink,
  delta,
  Empty,
  FinancialBadge,
  FulfillmentBadge,
  KV,
  PageHeader,
  Pagination,
  Panel,
  Segmented,
  Stat,
  StatGrid,
  Table,
  Tag,
  TBody,
  Td,
  Th,
  THead,
  Toolbar,
  Tr,
  hrefWith,
} from '@/components/portal/admin/ui'
import { ColumnChart } from '@/components/portal/admin/charts'
import { BarList } from '@/components/portal/admin/BarList'
import { SERIES } from '@/components/portal/admin/series'
import { RangePicker } from '@/components/portal/admin/RangePicker'
import { RepEditor } from '@/components/portal/admin/RepEditor'

export const metadata: Metadata = { title: 'Sales reps' }

const BASE = '/portal/admin/reps/'

type Links = { order: (id: string) => string; customer: (id: string) => string; external: { orders: boolean; customers: boolean } }

/** An admin page link, or the Shopify admin in a new tab for someone who can't open that section. */
function Out({ href, external, children, className }: { href: string; external: boolean; children: React.ReactNode; className?: string }) {
  if (!external) return <CellLink href={href} className={className}>{children}</CellLink>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1 font-medium text-adm-ink hover:text-adm-blue-bright hover:underline ${className ?? ''}`}>
      {children}
      <ExternalLink aria-label="(opens Shopify)" className="h-3 w-3 shrink-0 opacity-50" />
    </a>
  )
}

function GoalBar({ value, goal }: { value: number; goal: number }) {
  const p = goal > 0 ? value / goal : 0
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-adm-ink/[0.08]" role="img" aria-label={`${pct(p)} of goal`}>
        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, Math.max(2, p * 100))}%`, background: p >= 1 ? 'var(--adm-chart-gold)' : 'var(--adm-chart-blue)' }} />
      </span>
      <span className="text-[11px] tabular-nums text-adm-muted">{pct(p)}</span>
    </span>
  )
}

/** The competition: every rep ranked by sales for the period, with the month's pace and goal. */
function Standings({
  rows,
  selected,
  hrefFor,
  showPace,
  vs,
}: {
  rows: RepStanding[]
  selected: string | null
  hrefFor: ((name: string) => string) | null
  showPace: boolean
  vs: string
}) {
  if (!rows.length) return <Empty>No reps on the roster yet.</Empty>
  const max = Math.max(1, ...rows.map((r) => r.sales))
  return (
    <Table>
      <THead>
        <Th>#</Th>
        <Th>Rep</Th>
        <Th align="right">Sales</Th>
        <Th align="right" className="hidden @md:table-cell">
          <span title={vs}>Change</span>
        </Th>
        <Th align="right" className="hidden @lg:table-cell">Orders</Th>
        <Th align="right" className="hidden @3xl:table-cell">Avg order</Th>
        <Th align="right" className="hidden @2xl:table-cell">Accounts</Th>
        <Th align="right" className="hidden @4xl:table-cell">This month</Th>
        <Th align="right" className="hidden @4xl:table-cell">
          <span title="The month’s sales so far, at the same daily pace to the end of the month">Est. month-end</span>
        </Th>
        <Th className="hidden @5xl:table-cell">Goal</Th>
      </THead>
      <TBody>
        {rows.map((r) => {
          const on = r.name === selected
          const change = r.prevSales == null ? null : delta(r.sales, r.prevSales)
          return (
            <Tr key={r.name} className={on ? 'bg-adm-gold/[0.07]' : undefined}>
              <Td className="w-8 tabular-nums">
                {r.rank === 1 && r.sales > 0 ? <Trophy aria-label="First place" className="h-3.5 w-3.5 text-adm-gold" /> : <span className="text-adm-muted">{r.rank}</span>}
              </Td>
              <Td>
                {hrefFor ? (
                  <CellLink href={hrefFor(r.name)} className={on ? 'font-semibold' : undefined}>
                    {r.name}
                  </CellLink>
                ) : (
                  <span className={on ? 'font-semibold text-adm-ink' : 'font-medium text-adm-ink'}>{r.name}</span>
                )}
                {on && hrefFor == null && <span className="ml-1.5 text-[11px] text-adm-muted">you</span>}
                {!r.active && <span className="ml-1.5 text-[11px] text-adm-faint">inactive</span>}
              </Td>
              <Td align="right">
                <span className="block font-semibold tabular-nums text-adm-ink">{money0(r.sales)}</span>
                <span className="ml-auto mt-1 block h-1 w-full max-w-[7rem] overflow-hidden rounded-full bg-adm-ink/[0.06]">
                  <span className="block h-full rounded-full" style={{ width: `${Math.max(1.5, (r.sales / max) * 100)}%`, background: on ? 'var(--adm-chart-gold)' : 'var(--adm-chart-blue)' }} />
                </span>
              </Td>
              <Td align="right" className="hidden @md:table-cell">
                {change == null ? (
                  <span className="text-adm-faint">{r.prevSales === 0 && r.sales > 0 ? 'new' : '—'}</span>
                ) : (
                  <span className={change >= 0 ? 'text-adm-blue-bright' : 'text-adm-red'}>
                    {change >= 0 ? '+' : '−'}
                    {Math.abs(change * 100).toFixed(0)}%
                  </span>
                )}
              </Td>
              <Td align="right" className="hidden @lg:table-cell">
                {num(r.orders)}
              </Td>
              <Td align="right" muted className="hidden @3xl:table-cell">
                {r.orders ? money0(r.aov) : '—'}
              </Td>
              <Td align="right" className="hidden @2xl:table-cell">
                {num(r.accounts)}
                {r.newAccounts > 0 && <span className="ml-1 text-[11px] text-adm-muted">+{r.newAccounts} new</span>}
              </Td>
              <Td align="right" className="hidden @4xl:table-cell">
                {money0(r.month.sales)}
              </Td>
              <Td align="right" muted className="hidden @4xl:table-cell">
                {showPace && r.month.projected != null ? money0(r.month.projected) : '—'}
              </Td>
              <Td className="hidden @5xl:table-cell">
                {r.month.goal ? (
                  <span className="flex flex-col gap-0.5">
                    <GoalBar value={r.month.sales} goal={r.month.goal} />
                    <span className="text-[10.5px] text-adm-faint">of {money0(r.month.goal)}</span>
                  </span>
                ) : (
                  <span className="text-adm-faint">—</span>
                )}
              </Td>
            </Tr>
          )
        })}
      </TBody>
    </Table>
  )
}

function MonthPanel({ month, goal, sales, projected, title }: { month: RepReport['month']; goal: number | null; sales: number; projected: number | null; title: string }) {
  const left = month.daysInMonth - Math.floor(month.elapsed)
  const need = goal && goal > sales && left > 0 ? (goal - sales) / left : null
  return (
    <Panel title={title} meta={`${dateShort(`${month.from}T12:00:00Z`)} – day ${Math.min(month.daysInMonth, Math.ceil(month.elapsed))} of ${month.daysInMonth}`} tone="dealers">
      <KV
        rows={[
          ['Sales so far', <span key="s" className="font-semibold text-adm-ink">{money0(sales)}</span>],
          [
            <span key="l" title="The month’s sales so far, at the same daily pace to the end of the month">
              Estimated month-end
            </span>,
            month.paceShown && projected != null ? money0(projected) : 'After the 3rd',
          ],
          ['Monthly goal', goal ? <GoalBar key="g" value={sales} goal={goal} /> : <span key="n" className="text-adm-faint">None set</span>],
          ...(goal
            ? ([
                [
                  'On pace?',
                  !month.paceShown || projected == null ? '—' : projected >= goal ? <Badge key="y" tone="good">On pace for the goal</Badge> : <Badge key="n" tone="warn">{money0(goal - projected)} short at this pace</Badge>,
                ],
                ['Needed per day', need ? `${money0(need)} for ${left} more day${left === 1 ? '' : 's'}` : sales >= goal ? 'Goal reached' : '—'],
              ] as [React.ReactNode, React.ReactNode][])
            : []),
        ]}
      />
    </Panel>
  )
}

export default async function SalesRepsPage({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requirePortalAdmin('sales_reps')
  const sp = await searchParams
  const [sections, roster] = await Promise.all([getAdminSections(), getRepRoster()])
  const me = repForAdmin(admin, roster)
  // A Sales rep sees their own numbers and the standings, not other reps' orders and accounts.
  const locked = admin.role === 'sales_rep'
  const canManage = sections.includes('users')

  const range = pick(sp.range, REP_RANGES, 'mtd')
  const day = range === 'day' ? parseDay(sp.day) : undefined
  const type = pick(sp.type, ORDER_TYPES, 'all')
  const repParam = one(sp.rep)
  const asked = repParam && repParam !== 'all' ? roster.reps.find((r) => r.name.toLowerCase() === repParam.toLowerCase())?.name ?? null : null
  const selected = locked ? me?.name ?? null : repParam ? asked : me?.name ?? null

  const [r, logins] = await Promise.all([
    getRepReport({ range, day, type, rep: selected, page: pageNum(sp.page) }),
    canManage && roster.stored ? staffLogins() : Promise.resolve([]),
  ])
  const label = periodLabel(range, r.window)
  const vs = compareLabel(range, r.window)
  const daily = range === 'day'
  const params = {
    rep: locked ? undefined : selected ?? (me || repParam === 'all' ? 'all' : undefined),
    range: range === 'mtd' ? undefined : range,
    day,
    type: type === 'all' ? undefined : type,
  }
  const hrefFor = locked ? null : (name: string) => hrefWith(BASE, params, { rep: name, page: undefined })
  const links: Links = {
    order: (id) => (sections.includes('orders') ? `/portal/admin/orders/${legacyId(id)}/` : shopifyAdminUrl('orders', id)),
    customer: (id) => (sections.includes('customers') ? `/portal/admin/customers/${legacyId(id)}/` : shopifyAdminUrl('customers', id)),
    external: { orders: !sections.includes('orders'), customers: !sections.includes('customers') },
  }
  const span = daily
    ? `${/^(Today|Yesterday)$/.test(label) ? `${label} · ` : ''}${dateLong(`${r.window.from}T12:00:00Z`)}`
    : `${label} · ${dateLong(`${r.window.from}T12:00:00Z`)} – ${dateLong(`${r.window.to}T12:00:00Z`)}`
  const typeLabel = ORDER_TYPES.find((t) => t.key === type)!.label

  return (
    <>
      <PageHeader
        title={locked ? 'My sales' : selected ? `Sales reps · ${selected}` : 'Sales reps'}
        description={
          <>
            {span}
            {type !== 'all' && ` · ${typeLabel} orders`}
            <span className="text-adm-faint"> · orders tagged with each rep’s name in Shopify</span>
          </>
        }
      >
        <Toolbar>
          {!locked && (
            <Segmented
              options={[{ key: 'all', label: 'All reps' }, ...r.standings.map((s) => ({ key: s.name, label: s.name }))]}
              value={selected ?? 'all'}
              param="rep"
              base={BASE}
              params={params}
            />
          )}
          <RangePicker
            options={REP_RANGES}
            value={range}
            day={r.window.from}
            today={dayKey(new Date())}
            min={r.firstDay}
            base={BASE}
            params={{ ...params, day: undefined }}
          />
          <Segmented options={ORDER_TYPES.map((t) => ({ ...t, count: r.typeCounts[t.key] }))} value={type} param="type" base={BASE} params={params} />
        </Toolbar>
      </PageHeader>

      {locked && !me && (
        <Panel className="mb-2">
          <Empty>Your login isn’t linked to a sales rep yet, so only the standings show. Ask an admin to link it on this page.</Empty>
        </Panel>
      )}

      {r.rep ? <RepView r={r} rep={r.rep} links={links} vs={vs} daily={daily} label={label} params={params} hrefFor={hrefFor} /> : <TeamView r={r} vs={vs} label={label} hrefFor={hrefFor} locked={locked} />}

      {canManage && (
        <Panel title="Reps" meta="who counts as a rep, their admin login and monthly goal" className="mt-2">
          {roster.stored ? (
            <>
              <RepEditor
                reps={roster.reps.map((x) => ({ id: x.id!, name: x.name, staffEmail: x.staffEmail, monthlyGoal: x.monthlyGoal, active: x.active }))}
                logins={logins}
              />
              <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] leading-snug text-adm-muted">
                The order tag must match the name reps put on their orders in Shopify. A linked login opens this page on that rep’s numbers; give the person
                the Sales rep role on Users &amp; roles and they see only their own orders and accounts, plus the standings.
              </p>
            </>
          ) : (
            <Empty>
              Run <code className="text-adm-ink">supabase/migrations/025_sales_reps.sql</code> to add reps, link their logins and set goals here. Until then the
              page uses the built-in list ({roster.reps.map((x) => x.name).join(', ')}) and matches a login to a rep by first name.
            </Empty>
          )}
        </Panel>
      )}
    </>
  )
}

function TeamView({ r, vs, label, hrefFor, locked }: { r: RepReport; vs: string; label: string; hrefFor: ((name: string) => string) | null; locked: boolean }) {
  const t = r.team
  const leader = r.standings[0]
  const series = t.series.map((s) => ({ key: s.key, label: bucketLabel(s.key, r.bucket), value: Math.round(s.sales * 100) / 100, detail: `${s.orders} order${s.orders === 1 ? '' : 's'}` }))
  return (
    <>
      <StatGrid>
        <Stat hero label="Rep sales" value={money0(t.sales)} delta={t.prevSales != null ? delta(t.sales, t.prevSales) : null} deltaLabel={vs} sub={`${num(t.orders)} orders`} />
        <Stat label="Orders" value={num(t.orders)} sub={label} />
        <Stat label="Average order" value={t.orders ? money0(t.aov) : '—'} />
        <Stat
          label="This month"
          value={money0(t.month.sales)}
          sub={r.month.paceShown && t.month.projected != null ? `est. ${money0(t.month.projected)} by month-end` : 'estimate after the 3rd'}
          tone="dealers"
        />
        <Stat
          label="Leader"
          value={leader && leader.sales > 0 ? leader.name : '—'}
          sub={leader && leader.sales > 0 ? `${money0(leader.sales)} · ${pct(leader.share)} of rep sales` : 'no rep sales yet'}
          tone="dealers"
        />
        <Stat label="Draft orders with no rep" value={num(t.untagged.orders)} sub={t.untagged.orders ? `${money0(t.untagged.sales)} no one gets credit for` : 'every one is tagged'} tone="info" upIsGood={false} />
      </StatGrid>

      <Panel title="Standings" meta={`${label} · ranked by sales`} tone="dealers" className="mt-2">
        <Standings rows={r.standings} selected={null} hrefFor={hrefFor} showPace={r.month.paceShown} vs={vs} />
        <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] leading-snug text-adm-muted">
          Sales are order totals after refunds, including tax and shipping, for orders tagged with the rep’s name. Estimated month-end carries this
          month’s daily pace to the last day. Change compares with the {vs.replace(/^vs /, '')}.
          {!locked && ' Pick a rep above for their orders, accounts and who to follow up with.'}
        </p>
      </Panel>

      <div className="mt-2 grid gap-2 xl:grid-cols-3">
        <Panel title="Rep sales" meta={`${{ hour: 'By hour', day: 'Daily', week: 'Weekly', month: 'Monthly' }[r.bucket]} · all reps`} tone="sales" className="xl:col-span-2" bodyClassName="pt-2">
          <ColumnChart data={series} valueLabel="Sales" color={SERIES.revenue} height={230} />
        </Panel>
        <Panel title="Top products" meta={`${label} · rep orders`}>
          <BarList rows={t.products.map((p) => ({ key: p.key, label: p.label, value: p.sales, meta: `${num(p.units ?? 0)} units` }))} color={SERIES.volume} />
        </Panel>
      </div>
    </>
  )
}

function RepView({
  r,
  rep,
  links,
  vs,
  daily,
  label,
  params,
  hrefFor,
}: {
  r: RepReport
  rep: NonNullable<RepReport['rep']>
  links: Links
  vs: string
  daily: boolean
  label: string
  params: Record<string, string | undefined>
  hrefFor: ((name: string) => string) | null
}) {
  const t = rep.totals
  const p = rep.previous
  const s = rep.standing
  const series = rep.series.map((x) => ({ key: x.key, label: bucketLabel(x.key, r.bucket), value: Math.round(x.sales * 100) / 100, detail: `${x.orders} order${x.orders === 1 ? '' : 's'}` }))
  const standingSub = !s
    ? 'not on the roster'
    : rep.above
      ? `${money0(rep.above.sales - s.sales)} behind ${rep.above.name}`
      : rep.below
        ? `${money0(s.sales - rep.below.sales)} ahead of ${rep.below.name}`
        : 'the only rep'

  return (
    <>
      <StatGrid>
        <Stat hero label="Sales" value={money0(t.sales)} delta={p ? delta(t.sales, p.sales) : null} deltaLabel={vs} sub={`${num(t.orders)} orders`} />
        <Stat label="Orders" value={num(t.orders)} delta={p ? delta(t.orders, p.orders) : null} deltaLabel={vs} sub={label} />
        <Stat label="Average order" value={t.orders ? money0(t.aov) : '—'} delta={p && p.orders ? delta(t.aov, p.aov) : null} deltaLabel={vs} />
        <Stat label="Accounts" value={num(t.accounts)} sub={t.newAccounts ? `${num(t.newAccounts)} new to Shopify` : 'customers with an order'} />
        <Stat label="Awaiting payment" value={money0(t.unpaid)} sub={`${num(t.unpaidOrders)} order${t.unpaidOrders === 1 ? '' : 's'} · ${num(t.toShip)} to ship`} tone="info" />
        <Stat label="Standing" value={s ? `#${s.rank} of ${r.standings.length}` : '—'} sub={standingSub} tone="dealers" />
      </StatGrid>

      <div className="mt-2 grid gap-2 xl:grid-cols-3">
        <Panel title={`${rep.name}’s sales`} meta={`${{ hour: 'By hour', day: 'Daily', week: 'Weekly', month: 'Monthly' }[r.bucket]} · ${label}`} tone="sales" className="xl:col-span-2" bodyClassName="pt-2">
          <ColumnChart data={series} valueLabel="Sales" color={SERIES.revenue} height={230} />
        </Panel>
        <MonthPanel title="This month" month={r.month} goal={s?.month.goal ?? null} sales={s?.month.sales ?? 0} projected={s?.month.projected ?? null} />
      </div>

      <Panel title="Standings" meta={`${label} · ranked by sales`} tone="dealers" className="mt-2">
        <Standings rows={r.standings} selected={rep.name} hrefFor={hrefFor} showPace={r.month.paceShown} vs={vs} />
      </Panel>

      <div className="mt-2 grid gap-2 xl:grid-cols-3">
        <Panel title="Accounts" meta={`${label} · ${num(rep.accounts.length)} with orders`} className="xl:col-span-2">
          {rep.accounts.length ? (
            <Table>
              <THead>
                <Th>Account</Th>
                <Th className="hidden @3xl:table-cell">Contact</Th>
                <Th className="hidden @2xl:table-cell">Location</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Sales</Th>
                <Th className="hidden @xl:table-cell">Last order</Th>
              </THead>
              <TBody>
                {rep.accounts.slice(0, 25).map((a) => (
                  <Tr key={a.key}>
                    <Td className="max-w-[15rem]">
                      {a.customerId ? (
                        <Out href={links.customer(a.customerId)} external={links.external.customers} className="truncate">
                          {a.name}
                        </Out>
                      ) : (
                        <span className="font-medium text-adm-ink">{a.name}</span>
                      )}
                      <span className="mt-0.5 flex flex-wrap gap-1">
                        {a.isDealer && <Badge tone="gold">Dealer</Badge>}
                        {a.isNew && <Badge tone="good">New</Badge>}
                        {a.contact && <span className="truncate text-[11px] text-adm-muted">{a.contact}</span>}
                      </span>
                    </Td>
                    <Td muted className="hidden max-w-[14rem] @3xl:table-cell">
                      {a.email ? (
                        <a href={`mailto:${a.email}`} className="block truncate hover:text-adm-ink hover:underline">
                          {a.email}
                        </a>
                      ) : null}
                      {a.phone ? (
                        <a href={`tel:${a.phone}`} className="block truncate text-[11px] hover:text-adm-ink hover:underline">
                          {a.phone}
                        </a>
                      ) : null}
                      {!a.email && !a.phone && '—'}
                    </Td>
                    <Td muted className="hidden @2xl:table-cell">
                      {a.location}
                    </Td>
                    <Td align="right">{num(a.orders)}</Td>
                    <Td align="right" className="font-semibold text-adm-ink">
                      {money0(a.sales)}
                    </Td>
                    <Td muted className="hidden @xl:table-cell">
                      {daily ? timeOfDay(a.lastOrderAt) : dateShort(a.lastOrderAt)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <Empty>No orders in this period.</Empty>
          )}
          {rep.accounts.length > 25 && <p className="border-t border-adm-line-soft px-3 py-2 text-[12px] text-adm-muted">The 25 biggest of {num(rep.accounts.length)} accounts.</p>}
        </Panel>
        <div className="grid content-start gap-2">
          <Panel title="Top products" meta={label}>
            <BarList rows={rep.products.map((x) => ({ key: x.key, label: x.label, value: x.sales, meta: `${num(x.units ?? 0)} units` }))} color={SERIES.volume} limit={6} />
          </Panel>
          <Panel title="Ship-to states" meta={label}>
            <BarList rows={rep.states.map((x) => ({ key: x.key, label: x.label, value: x.sales, meta: `${x.orders} orders` }))} limit={6} />
          </Panel>
        </div>
      </div>

      <Panel
        title="Follow up"
        meta={`accounts ${rep.name} sold to with no order from anyone in ${FOLLOW_UP_DAYS}+ days${rep.followUpCount > rep.followUps.length ? ` · top ${rep.followUps.length} of ${num(rep.followUpCount)}` : ''}`}
        tone="dealers"
        className="mt-2"
      >
        {rep.followUps.length ? (
          <Table>
            <THead>
              <Th>Account</Th>
              <Th className="hidden @2xl:table-cell">Contact</Th>
              <Th className="hidden @xl:table-cell">Location</Th>
              <Th align="right">Sold through {rep.name}</Th>
              <Th>Last order</Th>
            </THead>
            <TBody>
              {rep.followUps.map((f) => (
                <Tr key={f.key}>
                  <Td className="max-w-[15rem]">
                    {f.customerId ? (
                      <Out href={links.customer(f.customerId)} external={links.external.customers} className="truncate">
                        {f.name}
                      </Out>
                    ) : (
                      <span className="font-medium text-adm-ink">{f.name}</span>
                    )}
                    {f.contact && <span className="block truncate text-[11px] text-adm-muted">{f.contact}</span>}
                  </Td>
                  <Td muted className="hidden max-w-[14rem] @2xl:table-cell">
                    {f.email ? (
                      <a href={`mailto:${f.email}`} className="block truncate hover:text-adm-ink hover:underline">
                        {f.email}
                      </a>
                    ) : null}
                    {f.phone ? (
                      <a href={`tel:${f.phone}`} className="block truncate text-[11px] hover:text-adm-ink hover:underline">
                        {f.phone}
                      </a>
                    ) : null}
                    {!f.email && !f.phone && '—'}
                  </Td>
                  <Td muted className="hidden @xl:table-cell">
                    {f.location}
                  </Td>
                  <Td align="right">
                    <span className="font-semibold text-adm-ink">{money0(f.repSales)}</span>
                    <span className="ml-1 text-[11px] text-adm-muted">· {num(f.repOrders)}</span>
                  </Td>
                  <Td muted title={f.lastOrderAt}>
                    {dateShort(f.lastOrderAt)} · {ago(f.lastOrderAt)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>Everyone {rep.name} has sold to has ordered in the last {FOLLOW_UP_DAYS} days.</Empty>
        )}
      </Panel>

      <Panel title="Orders" meta={`${label} · ${num(rep.orders.total)} orders`} className="mt-2">
        {rep.orders.rows.length ? (
          <Table>
            <THead>
              <Th>Order</Th>
              <Th>{daily ? 'Time' : 'Date'}</Th>
              <Th>Customer</Th>
              <Th className="hidden @4xl:table-cell">Items</Th>
              <Th className="hidden @3xl:table-cell">Type</Th>
              <Th className="hidden @md:table-cell">Payment</Th>
              <Th className="hidden @2xl:table-cell">Fulfillment</Th>
              <Th align="right">Total</Th>
            </THead>
            <TBody>
              {rep.orders.rows.map((o) => (
                <Tr key={o.shopify_id}>
                  <Td>
                    <Out href={links.order(o.shopify_id)} external={links.external.orders}>
                      {o.name}
                    </Out>
                  </Td>
                  <Td muted>{daily ? timeOfDay(o.shopify_created_at) : dateShort(o.shopify_created_at)}</Td>
                  <Td className="max-w-[12rem] truncate">{o.customer_display_name ?? o.email ?? '—'}</Td>
                  <Td muted className="hidden max-w-[16rem] truncate @4xl:table-cell">
                    {o.items}
                    {o.units > 0 && <span className="text-adm-faint"> · {o.units} units</span>}
                  </Td>
                  <Td className="hidden @3xl:table-cell">
                    <span className="flex flex-wrap gap-1">{o.types.length ? o.types.map((x) => <Tag key={x}>{x}</Tag>) : <span className="text-adm-faint">—</span>}</span>
                  </Td>
                  <Td className="hidden @md:table-cell">
                    <FinancialBadge status={o.financial_status} />
                  </Td>
                  <Td className="hidden @2xl:table-cell">
                    <FulfillmentBadge status={o.fulfillment_status} />
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money(o.current_total_price ?? o.total_price)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No orders tagged {rep.name} in this period.</Empty>
        )}
        <Pagination page={rep.orders.page} pages={rep.orders.pages} total={rep.orders.total} base={BASE} params={params} noun="orders" />
      </Panel>
    </>
  )
}
