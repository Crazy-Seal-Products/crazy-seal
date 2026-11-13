import React from 'react'
import type { Metadata } from 'next'
import { ChevronDown, Star } from 'lucide-react'
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
import { saveClaim, saveClaimDetails, saveTransfer, saveTransferDetails, setRegistrationStatus } from '@/lib/portal/admin/warranty-actions'
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
import { DetailsForm, ReviewLauncher, StatusNotesForm } from '@/components/portal/admin/warranty-client'

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

type Tone = React.ComponentProps<typeof Badge>['tone']
const CLAIM_TONE: Record<string, Tone> = { submitted: 'warn', in_review: 'gold', resolved: 'good', denied: 'bad' }
const TRANSFER_TONE: Record<string, Tone> = { submitted: 'warn', processed: 'good', denied: 'bad' }

function orderLabel(order: string | null) {
  return order ? `Order #${order.replace(/^#/, '')}` : null
}

/** Label/value pairs in two tight columns; empty values are skipped. */
function Facts({ rows }: { rows: [string, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-1 text-[12px]">
      {rows
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => (
          <React.Fragment key={k}>
            <dt className="text-adm-muted">{k}</dt>
            <dd className="min-w-0 truncate text-adm-text">{v}</dd>
          </React.Fragment>
        ))}
    </dl>
  )
}

/**
 * One claim or transfer: a single compact line (status, who, what, photos,
 * date) that opens in place to the full record and its forms. The whole line
 * is the toggle.
 */
function CaseRow({
  status,
  statuses,
  tones,
  title,
  sub,
  summary,
  photos,
  at,
  side,
  children,
}: {
  status: string
  statuses: readonly { key: string; label: string }[]
  tones: Record<string, Tone>
  title: string
  sub: string
  summary: string | null
  photos?: string[]
  at: string
  side: React.ReactNode
  children: React.ReactNode
}) {
  const label = statuses.find((x) => x.key === status)?.label ?? status
  return (
    <details className="group/case border-b border-adm-line-soft last:border-b-0 open:bg-adm-ink/[0.025]">
      <summary className="grid cursor-pointer list-none grid-cols-[5.75rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 px-3 py-2 transition-colors hover:bg-adm-blue-bright/[0.06] @3xl:grid-cols-[5.75rem_minmax(9rem,15rem)_minmax(0,1fr)_4.5rem_4.5rem_auto] [&::-webkit-details-marker]:hidden">
        <span>
          <Badge tone={tones[status] ?? 'neutral'}>{label}</Badge>
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[12.5px] font-semibold text-adm-ink">{title}</span>
          <span className="block truncate text-[11px] text-adm-muted">{sub}</span>
        </span>
        <span className="hidden truncate text-[12px] text-adm-muted @3xl:block">{summary}</span>
        <span className="hidden items-center @3xl:flex">
          {photos?.slice(0, 3).map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" loading="lazy" className={`h-6 w-6 rounded-md object-cover ring-2 ring-adm-bg ${i ? '-ml-2' : ''}`} />
          ))}
          {(photos?.length ?? 0) > 3 && <span className="ml-1 text-[11px] text-adm-muted">+{photos!.length - 3}</span>}
        </span>
        <span className="text-right text-[11.5px] tabular-nums text-adm-muted" title={dateTime(at)}>
          {dateShort(at)}
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-adm-faint transition-transform group-open/case:rotate-180" />
      </summary>
      <div className="grid gap-4 px-3 pb-3 pt-1 @3xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-3">{children}</div>
        <div className="space-y-2.5 rounded-lg border border-adm-line bg-adm-input/60 p-3">{side}</div>
      </div>
    </details>
  )
}

export default async function AdminWarrantiesPage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('warranties')
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
            <div>
              {claims.map((c) => {
                const photos = c.photo_urls?.filter(Boolean) ?? []
                return (
                  <CaseRow
                    key={c.id}
                    status={c.status}
                    statuses={CLAIM_STATUSES}
                    tones={CLAIM_TONE}
                    title={c.name}
                    sub={[c.email, orderLabel(c.order_number)].filter(Boolean).join(' · ')}
                    summary={c.failure_description}
                    photos={photos}
                    at={c.created_at}
                    side={
                      <>
                        <StatusNotesForm action={saveClaim.bind(null, c.id)} status={c.status} statuses={CLAIM_STATUSES} notes={c.resolution_notes} notesName="resolution_notes" notesLabel="Resolution notes" />
                        <DetailsForm
                          className="border-t border-adm-line-soft pt-2.5"
                          action={saveClaimDetails.bind(null, c.id)}
                          fields={[
                            { name: 'name', label: 'Name', value: c.name, required: true },
                            { name: 'email', label: 'Email', value: c.email, type: 'email', required: true },
                            { name: 'phone', label: 'Phone', value: c.phone, type: 'tel' },
                            { name: 'order_number', label: 'Order number', value: c.order_number },
                            { name: 'failure_description', label: 'What failed', value: c.failure_description, multiline: true },
                          ]}
                        />
                      </>
                    }
                  >
                    <Facts
                      rows={[
                        ['Email', <a key="e" href={`mailto:${c.email}`} className="text-adm-blue-bright hover:underline">{c.email}</a>],
                        ['Phone', c.phone ? <a key="p" href={`tel:${c.phone}`} className="text-adm-blue-bright hover:underline">{c.phone}</a> : null],
                        ['Order', orderLabel(c.order_number)],
                        ['Submitted', dateTime(c.created_at)],
                      ]}
                    />
                    {c.failure_description && (
                      <div>
                        <p className="mb-1 text-[11px] font-medium text-adm-muted">What failed</p>
                        <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-adm-text">{c.failure_description}</p>
                      </div>
                    )}
                    {photos.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-[11px] font-medium text-adm-muted">Photos · {photos.length}</p>
                        <div className="flex flex-wrap gap-2">
                          {photos.map((src) => (
                            <a
                              key={src}
                              href={src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group/ph block h-24 w-24 overflow-hidden rounded-lg ring-1 ring-inset ring-adm-line transition hover:ring-adm-blue-bright"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover/ph:scale-105" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CaseRow>
                )
              })}
            </div>
          ) : (
            <Empty>No claims yet.</Empty>
          )}
        </Panel>
      )}

      {tab === 'transfers' && (
        <Panel title={`${num(transfers.length)} warranty transfers`} meta={`${num(openTransfers)} waiting`} tone="info">
          {transfers.length ? (
            <div>
              {transfers.map((t) => (
                <CaseRow
                  key={t.id}
                  status={t.status}
                  statuses={TRANSFER_STATUSES}
                  tones={TRANSFER_TONE}
                  title={t.new_owner_name}
                  sub={[t.new_owner_email, orderLabel(t.order_number)].filter(Boolean).join(' · ')}
                  summary={t.original_owner_email ? `From ${t.original_owner_email}` : 'Original owner not given'}
                  at={t.created_at}
                  side={
                    <>
                      <StatusNotesForm action={saveTransfer.bind(null, t.id)} status={t.status} statuses={TRANSFER_STATUSES} notes={t.transfer_notes} notesName="transfer_notes" notesLabel="Transfer notes" />
                      <DetailsForm
                        className="border-t border-adm-line-soft pt-2.5"
                        action={saveTransferDetails.bind(null, t.id)}
                        fields={[
                          { name: 'new_owner_name', label: 'New owner name', value: t.new_owner_name, required: true },
                          { name: 'new_owner_email', label: 'New owner email', value: t.new_owner_email, type: 'email', required: true },
                          { name: 'new_owner_phone', label: 'New owner phone', value: t.new_owner_phone, type: 'tel' },
                          { name: 'original_owner_email', label: 'Original owner email', value: t.original_owner_email, type: 'email' },
                          { name: 'order_number', label: 'Order number', value: t.order_number },
                        ]}
                      />
                    </>
                  }
                >
                  <Facts
                    rows={[
                      ['New owner', t.new_owner_name],
                      ['Email', <a key="e" href={`mailto:${t.new_owner_email}`} className="text-adm-blue-bright hover:underline">{t.new_owner_email}</a>],
                      ['Phone', t.new_owner_phone ? <a key="p" href={`tel:${t.new_owner_phone}`} className="text-adm-blue-bright hover:underline">{t.new_owner_phone}</a> : null],
                      ['Original owner', t.original_owner_email],
                      ['Order', orderLabel(t.order_number)],
                      ['Submitted', dateTime(t.created_at)],
                    ]}
                  />
                </CaseRow>
              ))}
            </div>
          ) : (
            <Empty>No transfers yet.</Empty>
          )}
        </Panel>
      )}
    </>
  )
}
