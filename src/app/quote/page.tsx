import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ShieldCheck, Truck } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { PublicQuoteBuilder } from '@/components/quotes/PublicQuoteBuilder'
import { getPortalAdmin } from '@/lib/portal/admin/auth'
import { clientPricing, loadPricing } from '@/lib/pricing/load'
import { getPricingSettings } from '@/lib/pricing/settings'
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from '@/lib/pro/config'
import { FREE_SHIPPING_OVER_TEXT } from '@/lib/shipping'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Roof Quote: Price Your Crazy Seal Materials',
  description: `Answer a few questions about your roof and get the Crazy Seal materials and price for it, with free shipping over ${FREE_SHIPPING_OVER_TEXT}.`,
}

/**
 * The public roof-only quote builder. Live only when
 * pricing_settings.public_builder_live is on; until then signed-in Crazy Seal
 * staff can open it as a preview and everyone else gets a 404.
 */
export default async function QuotePage() {
  const settings = await getPricingSettings()
  const preview = !settings.public_builder_live
  if (preview && !(await getPortalAdmin())) notFound()
  // The live catalog comes from Shopify; if it can't be read, say so rather than fail the page.
  const ctx = await loadPricing().catch((err) => {
    console.error('[quote builder] pricing load failed', err)
    return null
  })
  const pricing = ctx ? clientPricing(ctx, { audience: 'public' }) : null

  return (
    <Container size="xl">
      <div className="relative section-bleed overflow-hidden bg-primary">
        <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
        <GlowOrb className="-right-24 top-1/3 h-80 w-80" color="rgb(245 197 66 / 0.16)" />
        <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mb-6 text-center">
            <h1 className="text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl">Price your roof</h1>
            <p className="mx-auto mt-2 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base">
              Tell us the size and what it goes over. We work out every gallon and tube, and price it on the spot.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-white/65">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-accent-light" /> 50 year warranty
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-accent-light" /> Free shipping over ${settings.free_shipping_over.toLocaleString('en-US')}
              </span>
            </div>
          </div>
          <div className="mx-auto max-w-6xl">
            {pricing ? (
              <PublicQuoteBuilder pricing={pricing} preview={preview} />
            ) : (
              <p className="rounded-3xl bg-white p-8 text-center text-sm text-gray-600">
                Prices aren’t available right now. Call us at{' '}
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold text-primary underline">
                  {SUPPORT_PHONE}
                </a>{' '}
                and a specialist will quote your roof.
              </p>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
