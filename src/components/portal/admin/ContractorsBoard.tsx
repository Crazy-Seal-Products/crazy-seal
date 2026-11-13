'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { ContractorMap, SEGMENT_PIN, type MapPoint } from '@/components/contractor/ContractorMap'
import { placeLabel, SEGMENT_LABEL } from '@/lib/contractors/types'
import type { ContractorListRow } from '@/lib/portal/admin/dealers'
import { ago, dateShort, money0, num } from '@/lib/portal/admin/format'
import { BUTTON } from './styles'
import { PORTAL_BADGE } from './portal-state'
import { Badge, CellLink, Empty, Panel, Table, TBody, Td, Th, THead } from './ui'

/** Rows in the list at a time; Show more adds this many again. */
const PAGE = 25

const faint = <span className="font-normal text-adm-faint">—</span>

/**
 * Contractors: the map and the list in sync. The map has every
 * listed contractor's pin; the list shows 25 at a time with each contractor's
 * spending. Pointing at a
 * row lights up its pin; clicking a pin opens their page in a new tab.
 */
export function ContractorsBoard({ rows, since }: { rows: ContractorListRow[]; since: string }) {
  const [hover, setHover] = useState<string | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const shown = rows.slice(0, limit)
  const points = useMemo<MapPoint[]>(
    () =>
      rows
        .filter((c) => c.lat !== null && c.lng !== null && c.isListed)
        .map((c) => ({ id: c.id, slug: c.slug, name: c.name, place: placeLabel(c), segment: c.segment, lat: c.lat!, lng: c.lng! })),
    [rows],
  )

  return (
    <div className="space-y-2">
      <Panel
        title="Contractor map"
        meta={`${points.length} listed pins · click one to open their page`}
        tone="dealers"
        actions={
          <span className="flex items-center gap-3 text-[11px] text-adm-muted">
            {(['rv', 'commercial'] as const).map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full ring-2 ring-white/70" style={{ background: SEGMENT_PIN[s] }} />
                {SEGMENT_LABEL[s]}
              </span>
            ))}
          </span>
        }
      >
        <ContractorMap points={points} selected={hover} newTab theme="admin" className="h-[420px] lg:h-[520px]" />
      </Panel>

      <Panel title="Contractors" meta={rows.length > shown.length ? `${shown.length} of ${rows.length}` : `${rows.length} shown`} tone="dealers">
        {rows.length ? (
          <Table>
            <THead>
              <Th>Contractor</Th>
              <Th className="hidden @xl:table-cell">Type</Th>
              <Th className="hidden @lg:table-cell">Location</Th>
              <Th>Pro Hub</Th>
              <Th align="right">Lifetime</Th>
              <Th align="right" className="hidden @2xl:table-cell">
                Since {since}
              </Th>
              <Th align="right" className="hidden @3xl:table-cell">
                90 days
              </Th>
              <Th className="hidden @5xl:table-cell">Last order</Th>
              <Th className="hidden @4xl:table-cell">Status</Th>
              <Th align="right" className="hidden @md:table-cell">
                Page
              </Th>
            </THead>
            <TBody>
              {shown.map((c) => (
                // A plain row with Tr's look, so it can light up the pin on hover.
                <tr
                  key={c.id}
                  onMouseEnter={() => setHover(c.id)}
                  onMouseLeave={() => setHover((h) => (h === c.id ? null : h))}
                  className="transition-colors hover:bg-adm-ink/[0.03]"
                >
                  <Td className="max-w-[16rem]">
                    <CellLink href={`/portal/admin/dealers/contractors/${c.id}/`} className="block truncate">
                      {c.name}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">
                      {[c.contact, c.email].filter(Boolean).join(' · ') || '—'}
                      {c.statuses.length > 0 && ` · ${c.statuses.join(', ')}`}
                    </span>
                    {(c.origin === 'shopify' || c.customerCount === 0) && (
                      <span className="mt-0.5 flex flex-wrap gap-1">
                        {c.origin === 'shopify' && (
                          <Badge tone="info" dot={false}>
                            From Shopify
                          </Badge>
                        )}
                        {c.customerCount === 0 && (
                          <Badge tone="neutral" dot={false}>
                            No Shopify match
                          </Badge>
                        )}
                      </span>
                    )}
                  </Td>
                  <Td className="hidden @xl:table-cell">
                    <Badge tone={c.segment === 'rv' ? 'good' : 'gold'} dot={false}>
                      {SEGMENT_LABEL[c.segment]}
                    </Badge>
                  </Td>
                  <Td muted className="hidden @lg:table-cell">
                    {placeLabel(c) || '—'}
                    {c.lat === null && <span className="block text-[11px] text-adm-warn">Not on the map: {c.zip ? 'unknown ZIP' : 'no ZIP'}</span>}
                  </Td>
                  <Td title={c.lastLoginAt ? `Last sign-in ${dateShort(c.lastLoginAt)}` : undefined}>
                    <Badge tone={PORTAL_BADGE[c.portal].tone}>{PORTAL_BADGE[c.portal].label}</Badge>
                  </Td>
                  <Td align="right" className="font-semibold text-adm-ink" title={c.customerCount ? `${num(c.lifetimeOrders)} orders since 2019` : undefined}>
                    {c.lifetime ? money0(c.lifetime) : faint}
                  </Td>
                  <Td align="right" muted className="hidden @2xl:table-cell" title={c.historyOrders ? `${num(c.historyOrders)} orders` : undefined}>
                    {c.historySales ? money0(c.historySales) : faint}
                  </Td>
                  <Td align="right" muted className="hidden @3xl:table-cell" title={c.recentOrders ? `${num(c.recentOrders)} orders` : undefined}>
                    {c.recentSales ? money0(c.recentSales) : faint}
                  </Td>
                  <Td muted className="hidden @5xl:table-cell" title={c.lastOrderAt ?? undefined}>
                    {c.lastOrderAt ? `${dateShort(c.lastOrderAt)} · ${ago(c.lastOrderAt)}` : '—'}
                  </Td>
                  <Td className="hidden @4xl:table-cell">
                    <Badge tone={c.isListed ? 'good' : 'neutral'}>{c.isListed ? 'Listed' : 'Hidden'}</Badge>
                  </Td>
                  <Td align="right" className="hidden @md:table-cell">
                    {c.isListed ? (
                      <a
                        href={`/contractor/${c.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-adm-blue-bright hover:underline"
                        title={`/contractor/${c.slug}`}
                      >
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-adm-faint">Hidden</span>
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No contractors match.</Empty>
        )}
        {rows.length > shown.length && (
          <div className="flex items-center justify-between gap-2 border-t border-adm-line px-3 py-2 text-[12px] text-adm-muted">
            <span>
              Showing {shown.length} of {rows.length}
            </span>
            <span className="flex gap-1.5">
              <button type="button" onClick={() => setLimit((n) => n + PAGE)} className={BUTTON.default}>
                Show {Math.min(PAGE, rows.length - shown.length)} more
              </button>
              <button type="button" onClick={() => setLimit(rows.length)} className={BUTTON.default}>
                Show all
              </button>
            </span>
          </div>
        )}
      </Panel>
    </div>
  )
}
