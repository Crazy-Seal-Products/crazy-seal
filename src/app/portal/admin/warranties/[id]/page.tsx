import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Star } from 'lucide-react'
import { requirePortalAdmin } from '@/lib/portal/admin/auth'
import { getRegistration, REGISTRATION_STATUSES } from '@/lib/portal/admin/warranty'
import { resendWarrantyEmails, saveInstaller } from '@/lib/portal/admin/warranty-actions'
import { customerName } from '@/lib/portal/admin/sales'
import { certificateUrl } from '@/lib/warranty/certificate'
import { dateTime, money0, num } from '@/lib/portal/admin/format'
import { BackLink, Badge, CellLink, ExternalButton, KV, PageHeader, Panel } from '@/components/portal/admin/ui'
import { ActionButton } from '@/components/portal/admin/controls'
import { ClassifyForm, InstallerForm, ReviewLauncher } from '@/components/portal/admin/warranty-client'

type Params = Promise<{ id: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const found = await getRegistration((await params).id)
  return { title: found ? `Warranty · ${found.reg.name}` : 'Warranty' }
}

function Photos({ title, urls, favorites }: { title: string; urls: string[] | null; favorites: Set<string> }) {
  if (!urls?.length) return null
  return (
    <div className="px-3 py-2">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-adm-muted">
        {title} · {urls.length}
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5 lg:grid-cols-6">
        {urls.map((src) => (
          <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="relative block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" loading="lazy" className="aspect-square w-full rounded-md border border-adm-line object-cover" />
            {favorites.has(src) && (
              <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-adm-gold text-adm-gold-ink" title="Favorite">
                <Star className="h-3 w-3 fill-current" />
              </span>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

export default async function AdminWarrantyPage({ params }: { params: Params }) {
  await requirePortalAdmin()
  const found = await getRegistration((await params).id)
  if (!found) notFound()
  const { reg: r, order, customer } = found
  const favorites = new Set(r.favorite_photo_urls ?? [])
  const hasPhotos = !!(r.before_photo_urls?.length || r.after_photo_urls?.length || r.photo_urls?.length)

  return (
    <>
      <BackLink href="/portal/admin/warranties/">Warranties</BackLink>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {r.name}
            <Badge tone={r.status === 'approved' ? 'good' : r.status === 'flagged' ? 'bad' : 'warn'}>{REGISTRATION_STATUSES.find((s) => s.key === r.status)?.label ?? r.status}</Badge>
            {r.reviews_for_marketing && <Badge tone="gold">{r.reviews_for_marketing}</Badge>}
          </span>
        }
        description={`Registered ${dateTime(r.created_at)}${r.source === 'pro_hub' ? ' through the Pro Hub' : r.gf_entry_id ? ' · imported from WordPress' : ''}`}
        actions={
          <>
            {hasPhotos && <ReviewLauncher registrations={[r]}>Open photo review</ReviewLauncher>}
            <ExternalButton href={certificateUrl(r.id)}>Certificate</ExternalButton>
          </>
        }
      />

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-2">
          <Panel title="Photos" meta={r.photo_display_consent ? 'customer allows display' : 'no display consent'} tone="sales">
            {hasPhotos || r.edited_photo_urls?.length ? (
              <div className="divide-y divide-adm-line-soft">
                <Photos title="Before" urls={r.before_photo_urls} favorites={favorites} />
                <Photos title="After" urls={r.after_photo_urls} favorites={favorites} />
                <Photos title="Photos" urls={r.photo_urls} favorites={favorites} />
                <Photos title="Edited" urls={r.edited_photo_urls} favorites={favorites} />
              </div>
            ) : (
              <p className="px-3 py-4 text-center text-[12.5px] text-adm-muted">No photos uploaded.</p>
            )}
          </Panel>

          <Panel title="What they said">
            <KV
              rows={[
                [
                  'Rating',
                  r.rating ? (
                    <span key="r" className="inline-flex items-center gap-0.5 text-adm-gold-text">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating! ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </span>
                  ) : (
                    '—'
                  ),
                ],
                ['Job details', r.customer_details || '—'],
              ]}
            />
            {r.experience_notes && <p className="whitespace-pre-line border-t border-adm-line-soft px-3 py-2 text-[12.5px] leading-relaxed text-adm-text">{r.experience_notes}</p>}
            {r.contractor_notes && (
              <p className="whitespace-pre-line border-t border-adm-line-soft px-3 py-2 text-[12.5px] leading-relaxed text-adm-text">
                <span className="font-semibold text-adm-ink">Installer notes: </span>
                {r.contractor_notes}
              </p>
            )}
          </Panel>

          <Panel title="Installation">
            <InstallerForm
              action={saveInstaller.bind(null, r.id)}
              initial={{ install_type: r.install_type, installer_name: r.installer_name, installer_phone: r.installer_phone, installer_email: r.installer_email }}
            />
          </Panel>
        </div>

        <div className="grid content-start gap-2">
          <Panel title="Marketing review" tone="dealers">
            <ClassifyForm
              id={r.id}
              statuses={REGISTRATION_STATUSES}
              initial={{ image_type: r.image_type, reviews_for_marketing: r.reviews_for_marketing, status: r.status, lucid_link: r.lucid_link }}
            />
          </Panel>
          <Panel title="Customer" tone="info">
            <KV
              rows={[
                ['Email', <a key="e" href={`mailto:${r.email}`} className="text-adm-blue-bright hover:underline">{r.email}</a>],
                ['Phone', r.phone || '—'],
                ['Order', order ? <CellLink key="o" href={`/portal/admin/orders/${order.legacyId}/`}>{order.name}</CellLink> : r.order_number ? `#${r.order_number.replace(/^#/, '')}` : '—'],
                ...(customer
                  ? ([
                      ['Shopify customer', <CellLink key="c" href={`/portal/admin/customers/${customer.legacy_resource_id}/`}>{customerName(customer)}</CellLink>],
                      ['Orders · lifetime', `${num(customer.number_of_orders)} · ${money0(customer.amount_spent)}`],
                    ] as [string, ReactNode][])
                  : []),
              ]}
            />
          </Panel>
          <Panel title="Confirmation emails">
            <div className="grid gap-2 px-3 py-2.5 text-[12.5px] text-adm-muted">
              <p>Re-sends the registration confirmation (with the certificate link) to the customer, and to the installer if they gave a different email.</p>
              <ActionButton action={resendWarrantyEmails.bind(null, r.id)} confirm={`Send the confirmation emails to ${r.email} again?`}>
                Resend confirmation emails
              </ActionButton>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
