import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, LayoutGrid } from 'lucide-react'
import { requirePortal } from '@/lib/contractor/guard'
import { loadContractorPricing } from '@/lib/contractor/product-pricing'
import { can } from '@/lib/contractor/roles'
import { ROOF_SYSTEMS } from '@/lib/contractor/systems'
import { discountLabel } from '@/lib/pricing/types'
import { SystemsView } from '@/components/contractor/systems/SystemsView'
import { ViewHeader } from '@/components/portal/ui'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'

export const metadata: Metadata = { title: 'Systems' }

/**
 * Crazy Seal's roof systems (/portal/systems/), Thermo's system master: each
 * way the system goes on, its components and the coverage quotes use
 * (pricing_settings.coverage), where it fits, install guides, and a sample
 * job's cost per square foot at this contractor's prices, worked out in the
 * browser by the quote engine (no costs leave the server).
 */
export default async function SystemsPage() {
  const viewer = await requirePortal('catalog.view')
  const data = await loadContractorPricing(viewer)
  const canQuote = !viewer.readOnly && can(viewer.role, 'quotes.create')

  return (
    <>
      <ViewHeader
        kicker="Roof systems"
        title={`${ROOF_SYSTEMS.length} ways to install Crazy Seal`}
        description="One system, installed over the existing roof or straight onto a wood deck, on RVs and buildings. Each shows its components in order, the coverage your quotes use and what a job costs at your prices."
      >
        <Link href="/portal/catalog/" className={portalGhostButton}>
          <LayoutGrid className="h-4 w-4" /> Catalog
        </Link>
        {canQuote && (
          <Link href="/portal/quotes/new/" className={portalButton}>
            <Calculator className="h-4 w-4" /> Build a quote
          </Link>
        )}
      </ViewHeader>
      <SystemsView
        pricing={data.pricing}
        coverage={data.coverage}
        discount={data.discount ? `${discountLabel(data.discount.name, data.discount.pct)} off` : null}
        canQuote={canQuote}
      />
    </>
  )
}
