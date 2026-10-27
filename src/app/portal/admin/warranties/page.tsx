import type { Metadata } from 'next'
import { Star } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import {
  CLAIM_STATUSES,
  getClaims,
  getRegistrations,
  getTransfers,
  needsEditedPhotos,
  photosOf,
  REGISTRATION_STATUSES,
  REVIEW_FILTERS,
  TRANSFER_STATUSES,
} from '@/lib/portal/admin/warranty'
import { saveClaim, saveTransfer, setRegistrationStatus } from '@/lib/portal/admin/warranty-actions'
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
import { ReviewLauncher, StatusNotesForm } from '@/components/portal/admin/warranty-client'

export const metadata: Metadata = { title: 'Warranties' }

const BASE = '/portal/admin/warranties/'
const TABS = [
  { key: 'registrations', label: 'Registrations' },
  { key: 'claims', label: 'Claims' },
  { key: 'transfers', label: 'Transfers' },
] as const
const STATUS_FILTERS = [{ key: 'all', label: 'Any status' }, ...REGISTRATION_STATUSES] as const
const INSTALL_FILTERS = [
  { key: 'all', label: 'Any installer' },
  { key: 'contractor', label: 'Dealer / contractor' },
  { key: 'diy', label: 'DIY' },
] as const

function classificationTone(v: string | null) {
  if (!v) return 'warn' as const
  if (v === 'Repairs/Non Warranty') return 'bad' as const
  if (v === 'Use For Marketing/Website') return 'gold' as const
  if (v.startsWith('Good')) return 'good' as const
  return 'neutral' as const
}

export default async function AdminWarrantiesPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin()
  const sp = await searchParams
  const tab = pick(sp.tab, TABS, 'registrations')
  const review = pick(sp.review, REVIEW_FILTERS, 'needs_review')
  const status = pick(sp.status, STATUS_FILTERS, 'all')
  const install = pick(sp.install, INSTALL_FILTERS, 'all')
  const q = one(sp.q)
  const page = pageNum(sp.page)

  const [data, claims, transfers] = await Promise.all([getRegistrations({ review, status, install, q, page }), getClaims(), getTransfers()])
  const s = data.summary
  const openClaims = claims.filter((c) => c.status === 'submitted' || c.status === 'in_review').length
  const openTransfers = transfers.filter((t) => t.status === 'submitted').length
  const params = {
    tab: tab === 'registrations' ? undefined : tab,
    review: review === 'needs_review' ? undefined : review,
    status: status === 'all' ? undefined : status,
    install: install === 'all' ? undefined : install,
    q,
  }

  return (
    <>
      <PageHeader
        title="Warranties"
        description="Warranty registrations from crazyseal.com and the Pro Hub, plus claims and transfers. Review each registration's photos and mark what can be used for marketing."
      >
        <StatGrid>
          <Stat hero label="Registrations to review" value={num(s.needsReview)} sub={`of ${num(s.total)} registrations`} />
          <Stat label="Last 30 days" value={num(s.last30)} />
          <Stat label="Marketing-ready" value={num(s.marketing)} sub={`${num(s.needsEdits)} still need edited photos`} tone="dealers" />
          <Stat label="Average rating" value={s.avgRating ? `${s.avgRating.toFixed(1)} / 5` : '—'} />
          <Stat label="Installed by a pro" value={pct(s.contractorShare)} sub="dealer or contractor" tone="info" />
          <Stat label="Open claims · transfers" value={`${num(openClaims)} · ${num(openTransfers)}`} sub={`${num(claims.length)} claims · ${num(transfers.length)} transfers`} tone="info" />
        </StatGrid>
        <Toolbar>
          <Segmented
            options={TABS.map((t) => ({ ...t, count: t.key === 'claims' ? claims.length : t.key === 'transfers' ? transfers.length : s.total }))}
            value={tab}
            param="tab"
            base={BASE}
            params={{}}
          />
        </Toolbar>
      </PageHeader>

      {tab === 'registrations' && (
        <>
          <Toolbar className="mb-2">
            <Segmented options={REVIEW_FILTERS.map((f) => ({ ...f, count: data.reviewCounts[f.key] }))} value={review} param="review" base={BASE} params={params} />
            <Segmented options={STATUS_FILTERS} value={status} param="status" base={BASE} params={params} />
            <Segmented options={INSTALL_FILTERS} value={install} param="install" base={BASE} params={params} />
            <SearchBox base={BASE} params={params} value={q} placeholder="Name, email, order #, installer…" />
          </Toolbar>
          <Panel
            title={`${num(data.total)} registrations`}
            meta={data.pages > 1 ? `page ${page} of ${data.pages}` : undefined}
            actions={<ReviewLauncher registrations={data.rows}>Review photos on this page</ReviewLauncher>}
          >
            {data.rows.length ? (
              <Table>
                <THead>
                  <Th>Registered</Th>
                  <Th>Customer</Th>
                  <Th className="hidden @5xl:table-cell">Order</Th>
                  <Th className="hidden @3xl:table-cell">Installed by</Th>
                  <Th className="hidden @6xl:table-cell">Rating</Th>
                  <Th className="hidden @5xl:table-cell" align="right">Photos</Th>
                  <Th className="hidden @2xl:table-cell">Review</Th>
                  <Th>Status</Th>
                </THead>
                <TBody>
                  {data.rows.map((r) => (
                    <Tr key={r.id}>
                      <Td muted title={dateTime(r.created_at)}>
                        {dateShort(r.created_at)}
                      </Td>
                      <Td className="max-w-[15rem]">
                        <CellLink href={`${BASE}${r.id}/`} className="block truncate">
                          {r.name || r.email}
                        </CellLink>
                        <span className="block truncate text-[11px] text-adm-muted">
                          {r.email}
                          {r.source === 'pro_hub' && ' · via Pro Hub'}
                          {r.gf_entry_id ? ' · WordPress import' : ''}
                        </span>
                      </Td>
                      <Td muted className="hidden @5xl:table-cell">
                        {r.order_number ? `#${r.order_number.replace(/^#/, '')}` : '—'}
                      </Td>
                      <Td className="hidden max-w-[12rem] truncate @3xl:table-cell">
                        {r.install_type === 'contractor' ? (
                          <span>
                            <Badge tone="info">Pro</Badge> <span className="text-adm-muted">{r.installer_name ?? ''}</span>
                          </span>
                        ) : r.install_type === 'diy' ? (
                          <span className="text-adm-muted">DIY</span>
                        ) : (
                          <span className="text-adm-faint">—</span>
                        )}
                      </Td>
                      <Td className="hidden @6xl:table-cell">
                        {r.rating ? (
                          <span className="inline-flex items-center gap-0.5 text-adm-gold-text" aria-label={`${r.rating} out of 5`}>
                            <Star className="h-3 w-3 fill-current" />
                            {r.rating}
                          </span>
                        ) : (
                          <span className="text-adm-faint">—</span>
                        )}
                      </Td>
                      <Td align="right" muted className="hidden @5xl:table-cell">
                        {photosOf(r).length || '—'}
                      </Td>
                      <Td className="hidden @2xl:table-cell">
                        <span className="flex flex-wrap gap-1">
                          <Badge tone={classificationTone(r.reviews_for_marketing)}>{r.reviews_for_marketing ?? 'Needs review'}</Badge>
                          {r.image_type && <Badge tone="neutral" dot={false}>{r.image_type}</Badge>}
                          {needsEditedPhotos(r) && <Badge tone="warn" dot={false}>Needs edits</Badge>}
                        </span>
                      </Td>
                      <Td>
                        <StatusSelect value={r.status} options={REGISTRATION_STATUSES} action={setRegistrationStatus.bind(null, r.id)} label={`Status for ${r.name}`} />
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            ) : (
              <Empty>No registrations match.</Empty>
            )}
            <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={params} noun="registrations" />
          </Panel>
        </>
      )}

      {tab === 'claims' && (
        <Panel title={`${num(claims.length)} warranty claims`} meta={`${num(openClaims)} open`} tone="dealers">
          {claims.length ? (
            <ul className="divide-y divide-adm-line-soft">
              {claims.map((c) => (
                <li key={c.id} className="grid gap-2 px-3 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-[12px] text-adm-muted">{[c.email, c.phone, c.order_number ? `order #${c.order_number.replace(/^#/, '')}` : null].filter(Boolean).join(' · ')}</span>
                    <span className="ml-auto text-[11.5px] text-adm-muted">{dateTime(c.created_at)}</span>
                  </div>
                  {c.failure_description && <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-adm-text">{c.failure_description}</p>}
                  {(c.photo_urls?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {c.photo_urls!.map((src) => (
                        <a key={src} href={src} target="_blank" rel="noopener noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={src} alt="" loading="lazy" className="h-16 w-16 rounded-md border border-adm-line object-cover" />
                        </a>
                      ))}
                    </div>
                  )}
                  <StatusNotesForm action={saveClaim.bind(null, c.id)} status={c.status} statuses={CLAIM_STATUSES} notes={c.resolution_notes} notesName="resolution_notes" notesLabel="Resolution notes" />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No claims yet.</Empty>
          )}
        </Panel>
      )}

      {tab === 'transfers' && (
        <Panel title={`${num(transfers.length)} warranty transfers`} meta={`${num(openTransfers)} waiting`} tone="info">
          {transfers.length ? (
            <ul className="divide-y divide-adm-line-soft">
              {transfers.map((t) => (
                <li key={t.id} className="grid gap-2 px-3 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-semibold">{t.new_owner_name}</span>
                    <span className="text-[12px] text-adm-muted">
                      {[t.new_owner_email, t.new_owner_phone, t.order_number ? `order #${t.order_number.replace(/^#/, '')}` : null].filter(Boolean).join(' · ')}
                    </span>
                    <span className="ml-auto text-[11.5px] text-adm-muted">{dateTime(t.created_at)}</span>
                  </div>
                  <p className="text-[12px] text-adm-muted">From original owner {t.original_owner_email ?? 'not given'}</p>
                  <StatusNotesForm action={saveTransfer.bind(null, t.id)} status={t.status} statuses={TRANSFER_STATUSES} notes={t.transfer_notes} notesName="transfer_notes" notesLabel="Transfer notes" />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No transfers yet.</Empty>
          )}
        </Panel>
      )}
    </>
  )
}
