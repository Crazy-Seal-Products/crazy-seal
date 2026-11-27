import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { requirePortal } from '@/lib/contractor/guard'
import { loadContractorPricing } from '@/lib/contractor/product-pricing'
import { can } from '@/lib/contractor/roles'
import { sampleProposal } from '@/lib/contractor/sample-proposal'
import { brandColors, isHex, isThemeKey, THEMES } from '@/lib/contractors/theme'
import { CustomerView } from '@/components/contractor/customer-view/CustomerView'
import { ViewHeader } from '@/components/portal/ui'

export const metadata: Metadata = { title: 'Customer view' }

/**
 * What the contractor's customers see (/portal/customer-view/): their public
 * Crazy Seal page (/contractor/<slug>/) framed as visitors get it when Crazy
 * Seal lists it, or a preview of its top in their brand when it isn't
 * listed yet; a sample of the proposal they hand customers (ProposalSheet,
 * priced by the quote engine); and their brand, with the way into Brand
 * studio.
 */
export default async function CustomerViewPage() {
  const viewer = await requirePortal('catalog.view')
  const c = viewer.contractor
  const [data, h] = await Promise.all([loadContractorPricing(viewer), headers()])
  const colors = brandColors({ theme: c.theme, primary: c.color_primary, accent: c.color_accent })
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'crazyseal.com'

  return (
    <>
      <ViewHeader
        kicker="Customer view"
        title="What your customers see"
        description="Your Crazy Seal page and the proposal you hand customers, in your brand. Change your logo, colors and tagline in Brand studio."
      />
      <CustomerView
        name={viewer.contractorName}
        segment={c.segment}
        page={{ path: `/contractor/${encodeURIComponent(c.slug)}/`, host, listed: c.is_listed }}
        brand={{
          theme: c.theme,
          themeLabel: THEMES[isThemeKey(c.theme) ? c.theme : 'seal'].label,
          primary: colors.primary,
          accent: colors.accent,
          logoUrl: c.logo_url,
          tagline: c.tagline,
          custom: isHex(c.color_primary) || isHex(c.color_accent),
        }}
        phone={c.phone}
        place={[c.city, c.state].filter(Boolean).join(', ')}
        proposal={sampleProposal(c.segment, data.pricing)}
        canBrand={can(viewer.role, 'brand.manage')}
        canQuote={can(viewer.role, 'quotes.view')}
      />
    </>
  )
}
