import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getLead, LEAD_STATUSES, leadInterest, leadStatus, leadType } from '@/lib/portal/admin/leads'
import { setLeadStatus } from '@/lib/portal/admin/lead-actions'
import { customerName } from '@/lib/portal/admin/sales'
import { dateTime, money0, num } from '@/lib/portal/admin/format'
import { BackLink, Badge, CellLink, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { StatusSelect } from '@/components/portal/admin/controls'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await getLead((await params).id)
  return { title: found?.lead.name ?? 'Lead' }
}

const TYPE_LABEL = { quote: 'Purchase quote', business: 'Dealer / partner inquiry', contact: 'Contact message' } as const

export default async function AdminLeadPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const found = await getLead((await params).id)
  if (!found) notFound()
  const { lead: r, customer } = found
  const t = leadType(r)

  return (
    <>
      <BackLink href="/portal/admin/leads/">Leads</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {r.name || r.email || 'Unnamed lead'}
            <Badge tone={t === 'business' ? 'gold' : t === 'quote' ? 'good' : 'neutral'}>{TYPE_LABEL[t]}</Badge>
          </span>
        }
        description={`Received ${dateTime(r.created_at)}${r.source_page ? ` from /${r.source_page.replace(/^\//, '')}` : ''}`}
        actions={<StatusSelect value={leadStatus(r)} options={LEAD_STATUSES} action={setLeadStatus.bind(null, r.id)} label="Lead status" />}
      />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="What they asked" tone="sales">
            <KV
              rows={[
                ['Interested in', leadInterest(r)],
                ...(r.project_type ? ([['Project type', r.project_type]] as [string, string][]) : []),
                ...(r.square_footage ? ([['Square footage', `${r.square_footage}`]] as [string, string][]) : []),
                ...(r.business_type ? ([['Business type', r.business_type]] as [string, string][]) : []),
                ...(r.how_heard ? ([['Heard about us', r.how_heard]] as [string, string][]) : []),
              ]}
            />
            {r.message && <p className="whitespace-pre-line border-t border-adm-line-soft px-3 py-2 text-[12.5px] leading-relaxed text-adm-text">{r.message}</p>}
          </Panel>

          {(r.photo_urls?.length ?? 0) > 0 && (
            <Panel title="Photos" meta={`${r.photo_urls!.length}`}>
              <div className="grid grid-cols-3 gap-1.5 p-2 sm:grid-cols-5">
                {r.photo_urls!.map((src) => (
                  <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" className="aspect-square w-full rounded-md border border-adm-line object-cover" />
                  </a>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Contact" tone="info">
            <KV
              rows={[
                ['Email', r.email ? <a href={`mailto:${r.email}`} className="text-adm-blue-bright hover:underline">{r.email}</a> : '—'],
                ['Phone', r.phone ? <a href={`tel:${r.phone}`} className="text-adm-blue-bright hover:underline">{r.phone}</a> : '—'],
                ['Location', r.location || '—'],
                ['Texting OK', r.texting_consent ? 'Yes' : 'No'],
                ...(r.website ? ([['Website', r.website]] as [string, string][]) : []),
              ]}
            />
          </Panel>
          <Panel title="Shopify customer" tone="sales">
            {customer ? (
              <KV
                rows={[
                  ['Customer', <CellLink key="c" href={`/portal/admin/customers/${customer.legacy_resource_id}/`}>{customerName(customer)}</CellLink>],
                  ['Orders', num(customer.number_of_orders)],
                  ['Lifetime spend', money0(customer.amount_spent)],
                ]}
              />
            ) : (
              <p className="px-3 py-2.5 text-[12.5px] text-adm-muted">No Shopify customer with this email yet.</p>
            )}
          </Panel>
          <Panel title="Where they came from">
            <KV
              rows={[
                ['First source', [r.first_utm_source, r.first_utm_medium].filter(Boolean).join(' / ') || 'Direct'],
                ['Campaign', r.first_utm_campaign || '—'],
                ['Landing page', r.first_landing_page || '—'],
                ['Referrer', r.first_referrer || '—'],
              ]}
            />
          </Panel>
          <Panel title="Zoho CRM">
            <KV
              rows={[
                ['Lead in Zoho', r.zoho_lead_id ? 'Yes' : 'Not synced'],
                ['Synced', r.zoho_synced_at ? dateTime(r.zoho_synced_at) : '—'],
              ]}
            />
          </Panel>
        </div>
      </div>
    </>
  )
}
