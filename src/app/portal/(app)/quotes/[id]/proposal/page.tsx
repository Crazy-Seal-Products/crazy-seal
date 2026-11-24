import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { requirePortal } from '@/lib/contractor/guard'
import { roofSummary, round2 } from '@/lib/pricing/engine'
import { usd } from '@/lib/pricing/types'
import { getPortalQuote } from '@/lib/quotes/portal'
import { PrintButton } from '@/components/quotes/PrintButton'

export const metadata: Metadata = { title: 'Proposal', robots: { index: false, follow: false } }

const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'America/New_York' })

/**
 * The contractor's printable proposal to their customer, built on a quote
 * (quotes.proposal) and branded with the contractor's logo and colors. It
 * covers the portal frame on screen, and printing shows only the sheet.
 * Crazy Seal's own prices never appear: materials show at the contractor's
 * marked-up price.
 */
export default async function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePortal('quotes.view')
  const quote = await getPortalQuote(viewer, (await params).id)
  if (!quote || !quote.proposal) notFound()
  const p = quote.proposal
  const c = viewer.contractor
  const brand = c.color_primary || '#003365'
  const accent = c.color_accent || '#5BA411'
  // From the saved proposal, so the sheet adds up even if the quote was repriced since.
  const shipping = quote.shipping_total ?? 0
  const materials = round2(p.total - p.labor - shipping)
  const place = [c.city, c.state].filter(Boolean).join(', ')

  return (
    <div className="cs-proposal fixed inset-0 z-[70] overflow-y-auto bg-slate-100 text-slate-900 print:static print:bg-white">
      <style>{`@media print { body * { visibility: hidden !important; } .cs-proposal, .cs-proposal * { visibility: visible !important; } .cs-proposal { position: absolute !important; inset: 0 !important; } .cs-proposal .no-print { display: none !important; } @page { margin: 14mm; } }`}</style>
      <div className="no-print mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <Link href={`/portal/quotes/${quote.id}/`} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to {quote.number}
        </Link>
        <PrintButton className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700" />
      </div>
      <article className="mx-auto mb-10 max-w-3xl bg-white p-8 shadow-xl print:mb-0 print:max-w-none print:p-0 print:shadow-none sm:p-12">
        <header className="flex items-start justify-between gap-6 border-b-4 pb-6" style={{ borderColor: brand }}>
          <div className="flex items-center gap-4">
            {c.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={c.logo_url} alt="" className="h-16 w-auto max-w-[180px] object-contain" />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-lg text-xl font-bold text-white" style={{ background: brand }}>
                {viewer.contractorName.slice(0, 1)}
              </span>
            )}
            <div>
              <p className="text-xl font-extrabold" style={{ color: brand }}>
                {viewer.contractorName}
              </p>
              <p className="text-sm text-slate-500">{[c.phone, c.email, place].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p className="text-lg font-bold uppercase tracking-widest" style={{ color: accent }}>
              Proposal
            </p>
            <p>{dateFmt.format(new Date(p.updatedAt))}</p>
            <p>Ref. {quote.number}</p>
          </div>
        </header>

        <section className="mt-6">
          {p.customerName && (
            <p className="text-sm text-slate-500">
              Prepared for <span className="font-semibold text-slate-900">{p.customerName}</span>
            </p>
          )}
          <h1 className="mt-2 text-2xl font-extrabold">Seamless silicone roof coating</h1>
          <p className="mt-1 text-slate-600">{roofSummary(quote.inputs)}, with the Crazy Seal roof system.</p>
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Materials</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {quote.lines.map((l, i) => (
              <li key={`${l.variant_id}-${i}`} className="flex justify-between gap-4 py-2">
                <span>
                  {l.product_title} <span className="text-slate-500">· {l.variant_title}</span>
                </span>
                <span className="tabular-nums text-slate-600">× {l.quantity}</span>
              </li>
            ))}
          </ul>
        </section>

        {p.notes && (
          <section className="mt-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Scope and terms</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{p.notes}</p>
          </section>
        )}

        <section className="mt-8 ml-auto max-w-xs text-sm">
          <dl className="space-y-1.5 tabular-nums">
            <div className="flex justify-between">
              <dt className="text-slate-500">Materials</dt>
              <dd>{usd(materials)}</dd>
            </div>
            {shipping > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-500">Freight</dt>
                <dd>{usd(shipping)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-500">Labor</dt>
              <dd>{usd(p.labor)}</dd>
            </div>
            <div className="flex justify-between border-t-2 pt-2 text-lg font-extrabold" style={{ borderColor: brand, color: brand }}>
              <dt>Total</dt>
              <dd>{usd(p.total)}</dd>
            </div>
          </dl>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-400">
          {viewer.contractorName} · Installed with the Crazy Seal roof system
        </footer>
      </article>
    </div>
  )
}
