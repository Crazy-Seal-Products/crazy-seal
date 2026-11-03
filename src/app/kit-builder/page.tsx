import type { Metadata } from 'next'
import { ShieldCheck, Truck } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { Stars } from '@/components/store/Stars'
import { StoreCatalog } from '@/components/store/StoreCatalog'
import { FloatingRep, ShopChooser } from '@/components/store/ShopChooser'
import { getKitBuilderCatalog } from '@/lib/store/kit-builder-data'
import { getShopProducts } from '@/lib/store/products'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Shop Crazy Seal: Kit Builder, RV Roofing Kits & Products',
  description:
    'Build your Crazy Seal roofing kit in about a minute, or have a rep build it with you. RV roofing kits and individual products with live pricing, free shipping over $500 and a 50 year warranty.',
}

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  style: { animationDelay: `${delayMs}ms` },
})

export default async function ShopPage() {
  const [catalog, products] = await Promise.all([getKitBuilderCatalog(), getShopProducts()])

  return (
    <>
      {/* ─── HERO: choose how to build ─── */}
      <Container size="xl">
        <div className="relative section-bleed overflow-hidden bg-primary">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 top-1/3 h-80 w-80" color="rgb(245 197 66 / 0.16)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mb-5 text-center">
              <h1
                {...enter(60)}
                className="animate-fade-up mb-2 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[2.75rem]"
              >
                Get the Right Kit for Your Roof
              </h1>
              <p {...enter(120)} className="animate-fade-up mx-auto max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base">
                Build it yourself in about a minute, or have a Crazy Seal rep build it with you.
              </p>
              <div
                {...enter(180)}
                className="animate-fade-up mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-white/65"
              >
                <span className="inline-flex items-center gap-1.5">
                  <Stars className="h-3.5 w-3.5" /> Rated by DIYers
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-light" /> 50 year warranty
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 text-accent-light" /> Free shipping over $500
                </span>
              </div>
            </div>
            <div {...enter(240)} className="animate-fade-up mx-auto max-w-5xl">
              <ShopChooser catalog={catalog} />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PRODUCTS: RV kits + individual products ─── */}
      <StoreCatalog products={products} />

      <FloatingRep />
    </>
  )
}
