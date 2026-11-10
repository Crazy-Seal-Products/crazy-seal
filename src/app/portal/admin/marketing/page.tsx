import type { Metadata } from 'next'
import Link from 'next/link'
import { adminCan, requirePortalAdmin } from '@/lib/portal/admin/auth'
import { adMoney, getGoogleReviews, getMarketingReport, getMetaAds } from '@/lib/portal/admin/marketing'
import { parseRange, RANGES } from '@/lib/portal/admin/sales'
import { dateLong, dateShort, dayLabel, money0, num, pct, STORE_TZ } from '@/lib/portal/admin/format'
import type { SearchParams } from '@/lib/portal/admin/params'
import {
  Badge,
  delta,
  Empty,
  ExternalButton,
  KV,
  PageHeader,
  Panel,
  Segmented,
  Stat,
  StatGrid,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '@/components/portal/admin/ui'
import { ColumnChart } from '@/components/portal/admin/charts'
import { SERIES } from '@/components/portal/admin/series'
import { BarList } from '@/components/portal/admin/BarList'

export const metadata: Metadata = { title: 'Marketing performance' }

const BASE = '/portal/admin/marketing/'

function ratio(part: number, whole: number): number | null {
  return whole ? part / whole : null
}

/** "53%", or "under 1%" for a small non-zero share. */
function share(part: number, whole: number): string {
  const r = ratio(part, whole)
  return r && r < 0.01 ? 'under 1%' : pct(r)
}

/** Only same-site paths become links (landing pages come from visitor URLs). */
function sitePath(path: string): string | null {
  return path.startsWith('/') && !path.startsWith('//') ? path : null
}

function Stars({ value }: { value: number }) {
  const n = Math.round(value)
  return (
    <span className="text-adm-gold-text" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(n)}
      <span className="text-adm-faint">{'★'.repeat(Math.max(0, 5 - n))}</span>
    </span>
  )
}

export default async function AdminMarketingPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('marketing')
  const range = parseRange((await searchParams).range)
  const [r, reviews, canWarranties] = await Promise.all([getMarketingReport(range), getGoogleReviews(), adminCan('warranties')])
  const ads = await getMetaAds(r)
  const adsOn = ads.status === 'ok'
  const spend0 = adMoney(ads.status === 'ok' ? ads.account.currency : 'USD', 0)
  const spend2 = adMoney(ads.status === 'ok' ? ads.account.currency : 'USD', 2)
  const t = r.totals
  const p = r.prev
  const c = r.customers
  const w = r.warranty
  const rangeLabel = RANGES.find((x) => x.key === range)!.label
  const vs = p ? `vs prior ${r.window.days} days` : undefined
  const tick = (key: string) => (r.bucket === 'day' ? dayLabel(key) : `Wk ${dayLabel(key)}`)
  const per = r.bucket === 'day' ? 'Daily' : 'Weekly'

  return (
    <>
      <PageHeader
        title="Marketing performance"
        description={
          <>
            {rangeLabel} · {dateLong(`${r.window.from}T12:00:00Z`)} – {dateLong(`${r.window.to}T12:00:00Z`)}
            {r.trackingSince && <span className="text-adm-faint"> · site visit tracking since {dateLong(r.trackingSince)}</span>}
          </>
        }
        actions={<Segmented options={RANGES} value={range} param="range" base={BASE} params={{}} />}
      />

      {/* Eight tiles with Meta connected, so four to a row. */}
      <StatGrid className={adsOn ? 'md:grid-cols-4 xl:grid-cols-4' : undefined}>
        <Stat hero label="Site visits" value={num(t.visits)} delta={p ? delta(t.visits, p.visits) : null} deltaLabel={vs} sub={`${num(r.window.days)} days`} />
        <Stat label="Visits from paid ads" value={num(t.paidVisits)} sub={`${pct(ratio(t.paidVisits, t.visits))} of visits`} />
        <Stat label="Leads" value={num(t.leads)} delta={p ? delta(t.leads, p.leads) : null} deltaLabel={vs} sub={`${num(t.leadsTracked)} with a tracked visit`} />
        <Stat label="Lead rate" value={pct(t.leadRate, 2)} delta={p ? delta(t.leadRate, p.leadRate) : null} deltaLabel={vs} sub="leads per visit" />
        {ads.status === 'ok' && (
          <>
            <Stat
              label="Meta ad spend"
              value={spend0(ads.totals.spend)}
              sub={`${pct(ads.totals.ctr, 2)} CTR · ${spend2(ads.totals.cpc)} per click`}
              tone="dealers"
            />
            <Stat
              label="Meta cost per lead"
              value={spend2(ads.totals.costPerLead)}
              sub={`${num(ads.totals.siteLeads)} site leads · Meta counts ${num(ads.totals.metaLeads)}`}
              tone="dealers"
            />
          </>
        )}
        <Stat label="Email subscribers" value={num(c.email_subscribed)} sub={`+${num(c.new_email_subscribers)} opted in · ${rangeLabel.toLowerCase()}`} tone="info" />
        <Stat
          label="Google rating"
          value={reviews ? `${reviews.rating.toFixed(1)} ★` : '—'}
          sub={reviews ? `${num(reviews.count)} reviews` : 'Reviews feed unavailable'}
          tone="info"
        />
      </StatGrid>

      <div className="mt-2 grid gap-2 xl:grid-cols-2">
        <Panel title="Site visits" meta={`${per} · every tracked visit`} tone="sales" bodyClassName="pt-2">
          <ColumnChart
            data={r.series.map((s) => ({ key: s.key, label: tick(s.key), value: s.visits, detail: `${num(s.leads)} lead${s.leads === 1 ? '' : 's'}` }))}
            valueLabel="Visits"
            format="int"
            color={SERIES.revenue}
          />
        </Panel>
        <Panel title="Leads" meta={`${per} · quote, dealer and contact forms`} tone="dealers" bodyClassName="pt-2">
          <ColumnChart
            data={r.series.map((s) => ({ key: s.key, label: tick(s.key), value: s.leads, detail: `${num(s.visits)} visits` }))}
            valueLabel="Leads"
            format="int"
            color={SERIES.volume}
          />
        </Panel>
      </div>

      <Panel title="Channels" meta="where each visit came from · leads counted on the visit that sent the form" className="mt-2" tone="sales">
        {r.channels.length ? (
          <Table>
            <THead>
              <Th>Channel</Th>
              <Th align="right">Visits</Th>
              <Th align="right" className="hidden @md:table-cell">Share</Th>
              <Th align="right">Leads</Th>
              <Th align="right">Lead rate</Th>
            </THead>
            <TBody>
              {r.channels.map((ch) => (
                <Tr key={ch.key}>
                  <Td>
                    <span className="font-medium text-adm-ink">{ch.label}</span>
                    {ch.paid && (
                      <span className="ml-1.5">
                        <Badge tone="gold" dot={false}>
                          Paid
                        </Badge>
                      </span>
                    )}
                    <span className="ml-2 hidden text-[11px] text-adm-faint @2xl:inline">{ch.hint}</span>
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {num(ch.visits)}
                  </Td>
                  <Td align="right" muted className="hidden @md:table-cell">
                    {pct(ratio(ch.visits, t.visits))}
                  </Td>
                  <Td align="right">{num(ch.leads)}</Td>
                  <Td align="right" muted>
                    {ch.visits ? pct(ratio(ch.leads, ch.visits), 2) : '—'}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No tracked visits in this range.</Empty>
        )}
      </Panel>

      {/* With Meta spend the Campaigns table needs the full width; Landing pages then gets its own row. */}
      <div className={adsOn ? 'mt-2 grid gap-2' : 'mt-2 grid gap-2 xl:grid-cols-2'}>
        <Panel
          title="Campaigns"
          meta={
            ads.status === 'ok' ? (
              <>
                visits with a campaign tag · spend from Meta Ads ({ads.account.name})
                {ads.account.timezone !== STORE_TZ && <> · Meta days in {ads.account.timezone}</>}
              </>
            ) : (
              <>
                visits with a campaign tag · Meta tags campaigns by ID
                <span className="text-adm-faint" title={ads.status === 'error' ? ads.message : undefined}>
                  {ads.status === 'error' ? ' · Meta Ads unavailable' : ' · Meta Ads not connected'}
                </span>
              </>
            )
          }
        >
          {ads.campaigns.length ? (
            <Table>
              <THead>
                <Th>Campaign</Th>
                <Th className={adsOn ? 'hidden @4xl:table-cell' : 'hidden @lg:table-cell'}>Channel</Th>
                {adsOn && (
                  <>
                    <Th align="right">Spend</Th>
                    <Th align="right" className="hidden @2xl:table-cell">Impr.</Th>
                    <Th align="right" className="hidden @2xl:table-cell">Clicks</Th>
                    <Th align="right" className="hidden @3xl:table-cell">CTR</Th>
                    <Th align="right" className="hidden @3xl:table-cell">CPC</Th>
                  </>
                )}
                <Th align="right" className={adsOn ? 'hidden @md:table-cell' : undefined}>Visits</Th>
                <Th align="right">Leads</Th>
                {adsOn && <Th align="right">Cost / lead</Th>}
                <Th align="right" className={adsOn ? 'hidden @xl:table-cell' : 'hidden @sm:table-cell'}>Rate</Th>
              </THead>
              <TBody>
                {ads.campaigns.map((cp) => {
                  const a = cp.ads
                  const named = cp.name !== cp.campaign
                  return (
                    <Tr key={cp.campaign}>
                      <Td
                        className={adsOn ? 'max-w-[22rem] truncate' : 'max-w-[16rem] truncate'}
                        title={`${named ? `${cp.name} · ` : ''}${cp.campaign} · ${cp.src ?? '—'} / ${cp.med ?? '—'}`}
                      >
                        <span className={!named && /^\d{6,}$/.test(cp.campaign) ? 'font-mono text-[11.5px] text-adm-ink' : 'font-medium text-adm-ink'}>{cp.name}</span>
                      </Td>
                      <Td muted className={adsOn ? 'hidden @4xl:table-cell' : 'hidden @lg:table-cell'}>
                        {cp.channelLabel}
                      </Td>
                      {adsOn && (
                        <>
                          <Td align="right" className="font-semibold text-adm-ink">
                            {a ? spend0(a.spend) : '—'}
                          </Td>
                          <Td align="right" muted className="hidden @2xl:table-cell">
                            {a ? num(a.impressions) : '—'}
                          </Td>
                          <Td align="right" muted className="hidden @2xl:table-cell">
                            {a ? num(a.clicks) : '—'}
                          </Td>
                          <Td align="right" muted className="hidden @3xl:table-cell">
                            {a ? pct(a.ctr, 2) : '—'}
                          </Td>
                          <Td align="right" muted className="hidden @3xl:table-cell">
                            {a ? spend2(a.cpc) : '—'}
                          </Td>
                        </>
                      )}
                      <Td align="right" className={adsOn ? 'hidden @md:table-cell' : 'font-semibold text-adm-ink'}>
                        {num(cp.visits)}
                      </Td>
                      <Td align="right">{num(cp.leads)}</Td>
                      {adsOn && (
                        <Td align="right" className="font-semibold text-adm-ink" title={a ? `Meta counts ${num(a.metaLeads)} leads` : undefined}>
                          {a && cp.leads ? spend2(a.spend / cp.leads) : '—'}
                        </Td>
                      )}
                      <Td align="right" muted className={adsOn ? 'hidden @xl:table-cell' : 'hidden @sm:table-cell'}>
                        {cp.visits == null ? '—' : pct(ratio(cp.leads ?? 0, cp.visits), 2)}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          ) : (
            <Empty>No campaign-tagged visits in this range.</Empty>
          )}
        </Panel>

        <Panel title="Landing pages" meta="first page of each visit">
          {r.landing.length ? (
            <Table>
              <THead>
                <Th>Page</Th>
                <Th align="right">Visits</Th>
                <Th align="right">Leads</Th>
                <Th align="right" className="hidden @sm:table-cell">Rate</Th>
              </THead>
              <TBody>
                {r.landing.map((l) => {
                  const href = sitePath(l.path)
                  return (
                    <Tr key={l.path}>
                      <Td className="max-w-[18rem] truncate" title={l.path}>
                        {href ? (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-adm-ink hover:text-adm-blue-bright hover:underline">
                            {l.path}
                          </a>
                        ) : (
                          <span className="font-medium text-adm-ink">{l.path}</span>
                        )}
                      </Td>
                      <Td align="right" className="font-semibold text-adm-ink">
                        {num(l.visits)}
                      </Td>
                      <Td align="right">{num(l.leads)}</Td>
                      <Td align="right" muted className="hidden @sm:table-cell">
                        {pct(ratio(l.leads, l.visits), 2)}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          ) : (
            <Empty>No tracked visits in this range.</Empty>
          )}
        </Panel>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-3">
        <Panel title="Referring sites" meta="other sites and apps that sent visits">
          <BarList
            rows={r.referrers.map((h) => ({ key: h.host, label: h.host, value: h.visits, meta: `${num(h.leads)} leads` }))}
            format="int"
            limit={10}
          />
        </Panel>
        <Panel title="Devices">
          <BarList
            rows={r.devices.map((d) => ({
              key: d.device,
              label: d.device[0].toUpperCase() + d.device.slice(1),
              value: d.visits,
              meta: `${num(d.leads)} leads · ${pct(ratio(d.leads, d.visits), 2)}`,
            }))}
            format="int"
            color={SERIES.volume}
          />
        </Panel>
        <Panel title="Lead types" meta={rangeLabel}>
          <BarList rows={r.leadTypes.map((l) => ({ key: l.key, label: l.label, value: l.leads, href: '/portal/admin/leads/' }))} format="int" color={SERIES.volume} />
        </Panel>
      </div>

      <Panel
        title="Leads that became sales"
        meta="by each person's first visit · their orders on or after the lead, matched by email, any channel"
        className="mt-2"
        tone="dealers"
      >
        {r.leadSales.length ? (
          <Table>
            <THead>
              <Th>First came from</Th>
              <Th align="right">People</Th>
              <Th align="right">Bought</Th>
              <Th align="right" className="hidden @md:table-cell">Close rate</Th>
              <Th align="right" className="hidden @md:table-cell">Orders</Th>
              <Th align="right">Sales</Th>
            </THead>
            <TBody>
              {r.leadSales.map((row) => (
                <Tr key={row.key}>
                  <Td className="font-medium text-adm-ink">{row.label}</Td>
                  <Td align="right">{num(row.people)}</Td>
                  <Td align="right">{num(row.buyers)}</Td>
                  <Td align="right" muted className="hidden @md:table-cell">
                    {pct(ratio(row.buyers, row.people), 1)}
                  </Td>
                  <Td align="right" muted className="hidden @md:table-cell">
                    {num(row.orders)}
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink">
                    {money0(row.revenue)}
                  </Td>
                </Tr>
              ))}
              <Tr className="bg-adm-ink/[0.03] font-semibold text-adm-ink">
                <Td>All leads</Td>
                <Td align="right">{num(r.leadSalesTotals.people)}</Td>
                <Td align="right">{num(r.leadSalesTotals.buyers)}</Td>
                <Td align="right" className="hidden @md:table-cell">
                  {pct(ratio(r.leadSalesTotals.buyers, r.leadSalesTotals.people), 1)}
                </Td>
                <Td align="right" className="hidden @md:table-cell">
                  {num(r.leadSalesTotals.orders)}
                </Td>
                <Td align="right">{money0(r.leadSalesTotals.revenue)}</Td>
              </Tr>
            </TBody>
          </Table>
        ) : (
          <Empty>No leads in this range.</Empty>
        )}
      </Panel>

      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <Panel title="Online orders by first source" meta={`${num(r.orders.tagged)} of ${num(r.orders.online)} online orders tracked`}>
          {r.orderSources.length ? (
            <BarList rows={r.orderSources.map((o) => ({ key: o.key, label: o.label, value: o.revenue, meta: `${num(o.orders)} orders` }))} />
          ) : (
            <>
              <Empty>
                Starts with the next online checkout. Carts now carry the shopper’s site visitor ID, so each new order can be traced to the visit that first
                brought them in.
              </Empty>
              <KV
                rows={[
                  ['Online store orders', `${num(r.orders.online)} · ${money0(r.orders.online_revenue)}`],
                  ['All orders, incl. draft orders', `${num(r.orders.total)} · ${money0(r.orders.revenue)}`],
                ]}
                className="border-t border-adm-line"
              />
            </>
          )}
        </Panel>

        <Panel title="Discount codes" meta={`orders placed with a code · ${rangeLabel.toLowerCase()}`}>
          {r.codes.length ? (
            <Table>
              <THead>
                <Th>Code</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Sales</Th>
                <Th align="right" className="hidden @sm:table-cell">Discount</Th>
              </THead>
              <TBody>
                {r.codes.map((code) => (
                  <Tr key={code.code}>
                    <Td className="font-mono text-[11.5px] font-semibold text-adm-ink">{code.code}</Td>
                    <Td align="right">{num(code.orders)}</Td>
                    <Td align="right" className="font-semibold text-adm-ink">
                      {money0(code.sales)}
                    </Td>
                    <Td align="right" muted className="hidden @sm:table-cell">
                      {money0(code.discount)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <Empty>No discount codes used in this range.</Empty>
          )}
        </Panel>
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-2">
        <Panel title="Email & SMS list" meta="Shopify customers">
          <KV
            rows={[
              ['Customers', num(c.total)],
              ['Email subscribers', `${num(c.email_subscribed)} · ${share(c.email_subscribed, c.total)}`],
              ['SMS subscribers', `${num(c.sms_subscribed)} · ${share(c.sms_subscribed, c.total)}`],
              [`New customers · ${rangeLabel.toLowerCase()}`, num(c.new_customers)],
              [`New email opt-ins · ${rangeLabel.toLowerCase()}`, num(c.new_email_subscribers)],
            ]}
          />
        </Panel>

        <Panel title="Reviews" actions={reviews?.writeUrl ? <ExternalButton href={reviews.writeUrl}>Google review link</ExternalButton> : undefined}>
          <KV
            rows={[
              ['Google', reviews ? <><Stars value={reviews.rating} /> {reviews.rating.toFixed(1)} · {num(reviews.count)} reviews</> : 'Feed unavailable'],
              [
                `Warranty ratings · ${rangeLabel.toLowerCase()}`,
                w.rated ? <><Stars value={w.avg_rating ?? 0} /> {Number(w.avg_rating ?? 0).toFixed(2)} · {num(w.rated)} rated</> : 'None yet',
              ],
              [
                'Marketing-ready photo sets',
                canWarranties ? (
                  <Link href="/portal/admin/warranties/?review=marketing" className="font-medium text-adm-ink hover:text-adm-blue-bright hover:underline">
                    {num(w.marketing_ready)} in range · {num(r.marketingReadyAll)} total
                  </Link>
                ) : (
                  `${num(w.marketing_ready)} in range · ${num(r.marketingReadyAll)} total`
                ),
              ],
            ]}
          />
          {reviews?.latest.length ? (
            <ul className="divide-y divide-adm-line-soft border-t border-adm-line">
              {reviews.latest.map((rv) => (
                <li key={rv.id} className="px-3 py-2 text-[12.5px]">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-adm-ink">{rv.author}</span>
                    <Stars value={rv.rating} />
                    <span className="ml-auto shrink-0 text-[11px] text-adm-faint">{dateShort(rv.publishedAt)}</span>
                  </div>
                  {rv.text && <p className="mt-0.5 line-clamp-2 text-adm-muted">{rv.text}</p>}
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>
      </div>
    </>
  )
}
