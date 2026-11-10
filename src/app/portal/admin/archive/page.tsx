import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Paperclip } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { entryEmail, entryName, entrySummary, formTitle, getArchiveEntries, getArchiveOverview } from '@/lib/portal/admin/archive'
import { isWarrantyRegistrationForm } from '@/lib/warranty/legacy'
import { dateLong, dateShort, dateTime, num } from '@/lib/portal/admin/format'
import { one, pageNum, type SearchParams } from '@/lib/portal/admin/params'
import { Badge, CellLink, Empty, hrefWith, PageHeader, Pagination, Panel, SearchBox, Stat, StatGrid, Table, TBody, Td, Th, THead, Toolbar, Tr } from '@/components/portal/admin/ui'
import { FormPicker } from '@/components/portal/admin/archive/FormPicker'

export const metadata: Metadata = { title: 'Form archive' }

const BASE = '/portal/admin/archive/'
const LINK = 'text-adm-blue-bright hover:underline'

function year(iso: string | null) {
  return iso ? dateLong(iso).slice(-4) : '—'
}

export default async function AdminArchivePage({ searchParams }: { searchParams: SearchParams }) {
  await requirePortalAdmin('archive')
  const sp = await searchParams
  const overview = await getArchiveOverview()
  const formParam = Number(one(sp.form))
  const form = overview.forms.find((f) => f.id === formParam) ?? null
  const q = one(sp.q)
  const page = pageNum(sp.page)
  const data = await getArchiveEntries({ form: form?.id ?? null, q, page })
  const params = { form: form ? String(form.id) : undefined, q }
  if (page > data.pages) redirect(hrefWith(BASE, params, { page: data.pages > 1 ? String(data.pages) : undefined }))

  return (
    <>
      <PageHeader
        title="Form archive"
        description={
          <>
            Gravity Forms submissions from the old WordPress site, kept for reference. New submissions are under{' '}
            <Link href="/portal/admin/leads/" className={LINK}>
              Leads
            </Link>{' '}
            and{' '}
            <Link href="/portal/admin/warranties/" className={LINK}>
              Warranties
            </Link>
            .
          </>
        }
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat hero label="Archived entries" value={num(overview.total)} sub={`from ${num(overview.forms.length)} forms`} />
          <Stat label="Warranty registrations" value={num(overview.warranty)} sub="can resend confirmations" tone="dealers" />
          <Stat label="Other forms" value={num(overview.total - overview.warranty)} sub="contact, quotes, dealers, VIP…" tone="info" />
          <Stat label="Submitted" value={`${year(overview.oldest)}–${year(overview.newest)}`} sub={overview.newest ? `last on ${dateLong(overview.newest)}` : undefined} tone="info" />
        </StatGrid>
        <Toolbar>
          <FormPicker forms={overview.forms} value={form?.id ?? null} total={overview.total} base={BASE} params={params} />
          <SearchBox base={BASE} params={params} value={q} placeholder="Name, email, phone, order #, entry #, note…" />
        </Toolbar>
      </PageHeader>

      <Panel title={form ? form.title : 'All forms'} meta={q ? `matching “${q}”` : undefined}>
        {data.rows.length ? (
          <Table className="table-fixed">
            <THead>
              <Th className="w-[5.5rem]">Submitted</Th>
              <Th>Entry</Th>
              <Th className="hidden w-[11rem] @xl:table-cell">Form</Th>
              <Th className="hidden @4xl:table-cell">Details</Th>
              <Th className="hidden w-[4.5rem] @2xl:table-cell" align="right">
                Files
              </Th>
              <Th className="hidden w-[5.5rem] @3xl:table-cell" align="right">
                Entry #
              </Th>
            </THead>
            <TBody>
              {data.rows.map((r) => {
                const email = entryEmail(r)
                const files = r.file_urls?.length ?? 0
                return (
                  <Tr key={r.id}>
                    <Td muted title={r.submitted_at ? dateTime(r.submitted_at) : undefined}>
                      {dateShort(r.submitted_at)}
                    </Td>
                    <Td>
                      <CellLink href={`${BASE}${r.id}/`} className="block truncate">
                        {entryName(r)}
                      </CellLink>
                      <span className="block truncate text-[11px] text-adm-muted">
                        {email ?? 'No email'}
                        <span className="@xl:hidden"> · {formTitle(r)}</span>
                      </span>
                    </Td>
                    <Td className="hidden truncate @xl:table-cell">
                      <Badge tone={isWarrantyRegistrationForm(r.gf_form_id) ? 'gold' : 'neutral'} dot={false}>
                        {formTitle(r)}
                      </Badge>
                    </Td>
                    <Td muted className="hidden truncate @4xl:table-cell" title={entrySummary(r) || undefined}>
                      {entrySummary(r) || '—'}
                    </Td>
                    <Td align="right" muted className="hidden @2xl:table-cell">
                      {files ? (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip className="h-3 w-3" />
                          {files}
                        </span>
                      ) : (
                        <span className="text-adm-faint">—</span>
                      )}
                    </Td>
                    <Td align="right" muted className="hidden @3xl:table-cell">
                      #{r.gf_entry_id}
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        ) : (
          <Empty>
            {overview.total === 0 ? (
              <>
                The archive is empty. Run <code className="rounded bg-adm-ink/[0.06] px-1 text-adm-soft">scripts/import-legacy-gf.mjs</code> to import Gravity Forms exports.
              </>
            ) : (
              'No entries match.'
            )}
          </Empty>
        )}
        <Pagination page={page} pages={data.pages} total={data.total} base={BASE} params={params} noun={data.total === 1 ? 'entry' : 'entries'} />
      </Panel>
    </>
  )
}
