import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowUpRight, CircleCheck } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { resendQuote } from '@/lib/portal/admin/contractor-actions'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { ago, dateShort } from '@/lib/portal/admin/format'
import { one, type SearchParams } from '@/lib/portal/admin/params'
import { getAdminContractor, listContractorLeads } from '@/lib/contractors/data'
import { placeLabel, SEGMENT_LABEL } from '@/lib/contractors/types'
import { ContractorEditor } from '@/components/portal/admin/ContractorEditor'
import { BUTTON } from '@/components/portal/admin/styles'
import { BackLink, Badge, CellLink, Empty, PageHeader, Panel, Table, TBody, Td, Th, THead, Tr } from '@/components/portal/admin/ui'

export const metadata: Metadata = { title: 'Contractor' }

export default async function AdminContractorPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requirePortalAdmin('contractors')
  const c = await getAdminContractor((await params).id)
  if (!c) notFound()
  const [leads, sp] = await Promise.all([listContractorLeads(c.id), searchParams])

  return (
    <>
      <BackLink href="/portal/admin/dealers/contractors/">Contractors</BackLink>
      <PageHeader
        title={c.name}
        description={[SEGMENT_LABEL[c.segment], placeLabel(c), c.contact].filter(Boolean).join(' · ')}
        actions={
          c.isListed && (
            <a href={`/contractor/${c.slug}/`} target="_blank" rel="noopener noreferrer" className={BUTTON.default}>
              Open their page <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </a>
          )
        }
      />
      {one(sp.added) && (
        <p className="mb-2 flex items-center gap-2 rounded-md border border-adm-line bg-adm-blue-bright/10 px-3 py-2 text-[12.5px] text-adm-ink">
          <CircleCheck className="h-4 w-4 text-adm-blue-bright" />
          {c.isListed ? `Added. Their page is live at /contractor/${c.slug}.` : 'Added. Their page stays hidden until you tick Listed publicly.'}
        </p>
      )}
      <ContractorEditor key={c.updatedAt} contractor={c} />

      <Panel title="Quote requests" meta="from the form on their page" tone="dealers" className="mt-2">
        {leads.length ? (
          <Table>
            <THead>
              <Th>Customer</Th>
              <Th className="hidden @lg:table-cell">ZIP</Th>
              <Th className="hidden @2xl:table-cell">{c.segment === 'commercial' ? 'Roof sq ft' : 'RV length'}</Th>
              <Th>Sent to them</Th>
              <Th>Received</Th>
            </THead>
            <TBody>
              {leads.map((l) => (
                <Tr key={l.id}>
                  <Td className="max-w-[16rem]">
                    <CellLink href={`/portal/admin/leads/${l.id}/`} className="block truncate">
                      {l.name}
                    </CellLink>
                    <span className="block truncate text-[11px] text-adm-muted">{[l.email, l.phone].filter(Boolean).join(' · ')}</span>
                  </Td>
                  <Td muted className="hidden @lg:table-cell">
                    {l.location || '—'}
                  </Td>
                  <Td muted className="hidden @2xl:table-cell">
                    {(c.segment === 'commercial' ? l.square_footage : l.rv_length) || '—'}
                  </Td>
                  <Td>
                    {l.contractor_notified_at ? (
                      <Badge tone="good">Emailed</Badge>
                    ) : l.quote_team_notified_at ? (
                      <Badge tone="warn" dot={false}>
                        Team told to pass it on
                      </Badge>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Badge tone="bad" dot={false}>
                          Not sent
                        </Badge>
                        <form action={resendQuote.bind(null, l.id)}>
                          <button type="submit" className={twMerge(BUTTON.default, 'h-6 px-2 text-[11px]')} title="Email it to the contractor and Crazy Seal again">
                            Send again
                          </button>
                        </form>
                      </span>
                    )}
                  </Td>
                  <Td muted title={l.created_at}>
                    {`${dateShort(l.created_at)} · ${ago(l.created_at)}`}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        ) : (
          <Empty>No quote requests yet.</Empty>
        )}
      </Panel>
    </>
  )
}
