import type { Metadata } from 'next'
import Link from 'next/link'
import { Calculator, Layers } from 'lucide-react'
import { requirePortal } from '@/lib/contractor/guard'
import { loadContractorPricing } from '@/lib/contractor/product-pricing'
import { can } from '@/lib/contractor/roles'
import { discountLabel } from '@/lib/pricing/types'
import { CatalogTabs } from '@/components/contractor/catalog/CatalogTabs'
import { CatalogView } from '@/components/contractor/catalog/CatalogView'
import { PriceList } from '@/components/contractor/catalog/PriceList'
import { ViewHeader } from '@/components/portal/ui'
import { portalButton, portalGhostButton } from '@/components/portal/portal-styles'

export const metadata: Metadata = { title: 'Catalog' }

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * Crazy Seal's products at this contractor's prices (/portal/catalog/), in
 * two tabs: the Catalog (Thermo's product cards by category: packshot, what
 * it does, coverage, the store's sizes and colors priced for them, data
 * sheets) and the Price list (retail and project bands, their discount and
 * orders to the next level). ?tab=prices opens the price list. Prices are
 * the quote builder's: pricing_settings.price_list less the contractor's
 * best discount.
 */
export default async function PortalCatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const viewer = await requirePortal('catalog.view')
  const sp = await searchParams
  const data = await loadContractorPricing(viewer)
  const canQuote = !viewer.readOnly && can(viewer.role, 'quotes.create')
  const discount = data.discount ? { pct: data.discount.pct, label: `${discountLabel(data.discount.name, data.discount.pct)} off` } : null

  return (
    <>
      <ViewHeader
        kicker="Crazy Seal products"
        title="Catalog"
        description="Every product in the Crazy Seal system at your price, with how far it goes and its data sheets. Your discount comes off the full price on every quote."
      >
        <Link href="/portal/systems/" className={portalGhostButton}>
          <Layers className="h-4 w-4" /> Roof systems
        </Link>
        {canQuote && (
          <Link href="/portal/quotes/new/" className={portalButton}>
            <Calculator className="h-4 w-4" /> Build a quote
          </Link>
        )}
      </ViewHeader>
      <CatalogTabs
        initial={sp.tab === 'prices' ? 'prices' : 'catalog'}
        catalog={<CatalogView pricing={data.pricing} priceList={data.priceList} coverage={data.coverage} discount={discount} canQuote={canQuote} />}
        prices={<PriceList settings={data.settings} orders={data.orderCount} discount={data.discount} canQuote={canQuote} />}
      />
    </>
  )
}
