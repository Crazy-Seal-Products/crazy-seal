import type { Metadata } from 'next'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getApplications } from '@/lib/portal/admin/dealers'
import { dateShort, num } from '@/lib/portal/admin/format'
import { LEAD_STATUSES, leadStatus } from '@/lib/portal/admin/leads'
import { setLeadStatus } from '@/lib/portal/admin/lead-actions'
import { CellLink, Empty, PageHeader, Panel, Stat, StatGrid, Table, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'
import { BarList } from '@/components/portal/admin/BarList'
import { SERIES } from '@/components/portal/admin/series'
import { StatusSelect } from '@/components/portal/admin/controls'

export const metadata: Metadata = { title: 'Dealer applications' }

export default async function AdminApplicationsPage() {
  await requirePortalAdmin()
  const { rows, summary, types } = await getApplications()

  return (
    <>
      <PageHeader
        title="Dealer applications"
        description={<>“Become a dealer” submissions from crazyseal.com. They also appear under <CellLink href="/portal/admin/leads/?type=business">Leads</CellLink> with the rest of the site&apos;s inquiries.</>}
      >
        <StatGrid className="xl:grid-cols-4">
          <Stat label="Applications" value={num(summary.total)} tone="dealers" />
          <Stat label="Last 30 days" value={num(summary.last30)} />
          <Stat label="Waiting for review" value={num(summary.open)} sub="status: new" tone="dealers" />
          <Stat label="Most common type" value={<span className="text-[15px]">{types[0]?.label ?? '—'}</span>} sub={types[0] ? `${types[0].count} applicants` : undefined} tone="info" />
        </StatGrid>
      </PageHeader>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel tone="dealers">
          {rows.length ? (
            <Table>
              <THead>
                <Th>Applicant</Th>
                <Th className="hidden @2xl:table-cell">Business type</Th>
                <Th className="hidden @3xl:table-cell">Location</Th>
                <Th className="hidden @4xl:table-cell">Heard via</Th>
                <Th className="hidden @3xl:table-cell">Message</Th>
                <Th>Status</Th>
                <Th>Received</Th>
              </THead>
              <TBody>
                {rows.map((r) => (
                  <Tr key={r.id}>
                    <Td className="max-w-[15rem]">
                      <CellLink href={`/portal/admin/leads/${r.id}/`} className="block truncate">{r.business_name || r.name || 'Unnamed'}</CellLink>
                      <span className="block truncate text-[11px] text-adm-muted">
                        {[r.business_name ? r.name : null, r.email, r.phone].filter(Boolean).join(' · ')}
                      </span>
                    </Td>
                    <Td muted className="hidden @2xl:table-cell">
                      {r.business_type ?? '—'}
                    </Td>
                    <Td muted className="hidden @3xl:table-cell">
                      {r.location ?? '—'}
                    </Td>
                    <Td muted className="hidden @4xl:table-cell">
                      {r.how_heard ?? r.first_utm_source ?? '—'}
                    </Td>
                    <Td muted className="hidden max-w-[18rem] truncate @3xl:table-cell" title={r.message ?? undefined}>
                      {r.message ?? '—'}
                    </Td>
                    <Td>
                      <StatusSelect value={leadStatus(r)} options={LEAD_STATUSES} action={setLeadStatus.bind(null, r.id)} label={`Status for ${r.business_name || r.name || 'applicant'}`} />
                    </Td>
                    <Td muted>{dateShort(r.created_at)}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <Empty>No applications yet.</Empty>
          )}
        </Panel>
        <Panel title="By business type" className="self-start">
          <BarList rows={types.map((t) => ({ key: t.key, label: t.label, value: t.count }))} format="int" color={SERIES.volume} />
        </Panel>
      </div>
    </>
  )
}
