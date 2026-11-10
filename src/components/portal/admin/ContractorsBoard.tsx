'use client'

import { useMemo, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { ContractorMap, SEGMENT_PIN, type MapPoint } from '@/components/contractor/ContractorMap'
import { brandColors } from '@/lib/contractors/theme'
import { placeLabel, SEGMENT_LABEL, SERVICE_MODE_LABEL, type AdminContractor } from '@/lib/contractors/types'
import { BUTTON } from './styles'
import { Badge, CellLink, Empty, Panel, Table, TBody, Td, Th, THead } from './ui'

/** Rows in the list at a time; Show more adds this many again. */
const PAGE = 10

/**
 * Dealers → Contractors: the map and the list in sync. The map has every pin;
 * the list shows 10 at a time. Pointing at a row lights up its pin; clicking
 * a pin opens their page in a new tab.
 */
export function ContractorsBoard({ rows }: { rows: AdminContractor[] }) {
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
        meta={`${points.length} pins · click one to open their page`}
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
        <ContractorMap points={points} selected={hover} newTab theme="admin" className="h-[480px] lg:h-[600px]" />
      </Panel>

      <Panel title="Contractors" meta={rows.length > shown.length ? `${shown.length} of ${rows.length}` : `${rows.length} shown`} tone="dealers">
        {rows.length ? (
          <Table>
            <THead>
              <Th>Contractor</Th>
              <Th className="hidden @xl:table-cell">Type</Th>
              <Th>Location</Th>
              <Th className="hidden @3xl:table-cell">Service</Th>
              <Th className="hidden @2xl:table-cell">Brand</Th>
              <Th className="hidden @lg:table-cell">Status</Th>
              <Th align="right">Page</Th>
            </THead>
            <TBody>
              {shown.map((c) => {
                const colors = brandColors(c.brand)
                return (
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
                      <span className="block truncate text-[11px] text-adm-muted">{[c.contact, c.email].filter(Boolean).join(' · ') || '—'}</span>
                    </Td>
                    <Td className="hidden @xl:table-cell">
                      <Badge tone={c.segment === 'rv' ? 'good' : 'gold'} dot={false}>
                        {SEGMENT_LABEL[c.segment]}
                      </Badge>
                    </Td>
                    <Td muted>
                      {placeLabel(c) || '—'}
                      {c.lat === null && <span className="block text-[11px] text-adm-warn">Not on the map: {c.zip ? 'unknown ZIP' : 'no ZIP'}</span>}
                    </Td>
                    <Td muted className="hidden @3xl:table-cell">
                      {c.serviceMode ? SERVICE_MODE_LABEL[c.serviceMode] : '—'}
                    </Td>
                    <Td className="hidden @2xl:table-cell">
                      <span className="flex items-center gap-1.5" title={c.brand.logoUrl ? 'Has a logo' : 'No logo yet'}>
                        <span className="h-4 w-4 rounded-full ring-1 ring-adm-line" style={{ background: colors.primary }} />
                        <span className="-ml-2.5 h-4 w-4 rounded-full ring-1 ring-adm-line" style={{ background: colors.accent }} />
                        {c.brand.logoUrl && <span className="text-[11px] text-adm-muted">Logo</span>}
                      </span>
                    </Td>
                    <Td className="hidden @lg:table-cell">
                      <Badge tone={c.isListed ? 'good' : 'neutral'}>{c.isListed ? 'Listed' : 'Hidden'}</Badge>
                    </Td>
                    <Td align="right">
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
                )
              })}
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
