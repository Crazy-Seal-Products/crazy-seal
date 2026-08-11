import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { Container, Grid, SectionHeading } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { KitBuilder } from '@/components/KitBuilder'
import { Stars } from '@/components/store/Stars'
import { StoreCatalog } from '@/components/store/StoreCatalog'
import { getKitBuilderCatalog } from '@/lib/store/kit-builder-data'
import { getStoreProducts, formatPrice, type StoreProduct } from '@/lib/store/products'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Crazy Seal Kit Builder & Shop',
  description:
    'Build your custom Crazy Seal roofing kit in seconds, or shop complete kits and individual products. Live pricing, free shipping over $500, 50 year warranty.',
}

/** Example projects mapped to real variants for live pricing and kit images. */
const EXAMPLE_PROJECTS = [
  {
    title: "24' RV Over Existing Membrane",
    handle: 'rv-roofing-kit',
    size: '100 - 200 SQ FT',
    note: 'Double layer system',
  },
  {
    title: "37' RV Over Existing Membrane",
    handle: 'rv-roofing-kit',
    size: '200 - 300 SQ FT',
    note: 'Double layer system',
  },
  {
    title: "45' RV Over Existing Membrane",
    handle: 'rv-roofing-kit',
    size: '300 - 400 SQ FT',
    note: 'Double layer system',
  },
  {
    title: "10' x 28' Over Existing Metal",
    handle: 'double-layer-kit',
    size: '200-300 SQ FT',
    note: 'Double layer system',
  },
  {
    title: "18' Direct To Deck",
    handle: 'direct-to-deck-kit',
    size: '75-150 SQ FT',
    note: 'Direct to deck system',
  },
  {
    title: "36' Direct To Deck",
    handle: 'direct-to-deck-kit',
    size: '225-300 SQ FT',
    note: 'Direct to deck system',
  },
]

/** Resolve an example's live white-color variant price and image. */
function exampleKitDetails(products: StoreProduct[], handle: string, size: string) {
  const product = products.find((p) => p.handle === handle)
  if (!product) return null
  const variant = product.variants.find(
    (v) =>
      v.selectedOptions.some(
        (o) => /size/i.test(o.name) && o.value.trim().toLowerCase() === size.toLowerCase()
      ) &&
      v.selectedOptions.some(
        (o) => /color/i.test(o.name) && o.value.trim().toLowerCase() === 'white'
      )
  )
  return {
    title: product.displayTitle,
    price: variant ? parseFloat(variant.price) : null,
    image: variant?.image ?? product.featuredImage,
  }
}

const APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches.",
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential, sunrooms, storage buildings.',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    href: '/transportation',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
]

export default async function KitBuilderPage() {
  const [catalog, storeProducts] = await Promise.all([
    getKitBuilderCatalog(),
    getStoreProducts(),
  ])

  return (
    <>
      {/* ─── HERO + KIT BUILDER ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Sized to Your Exact Roof
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
                Build Your Kit in 60 Seconds
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
                Answer a few questions and get a complete kit with live pricing —
                everything your roof needs in one box, nothing it doesn&apos;t.
              </p>

              {/* Stats strip */}
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                <div className="flex flex-col items-center">
                  <Stars />
                  <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                    rated by DIYers
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none">1,000s</span>
                  <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                    of roofs sealed
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none">Live</span>
                  <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                    pricing on your kit
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none">50 yr</span>
                  <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                    warranty
                  </span>
                </div>
              </div>
            </div>
            <div className="max-w-5xl mx-auto">
              <KitBuilder catalog={catalog} />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── STORE CATALOG ─── */}
      <StoreCatalog products={storeProducts} />

      {/* ─── OR BROWSE BY APPLICATION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="See It On Roofs Like Yours"
            heading="Or Browse by Application"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.image} alt={app.title} className="w-full h-auto object-cover" />
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── EXAMPLE PROJECTS / PRICING ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="pricing"
          className="section-bleed scroll-mt-24 bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8"
        >
          <SectionHeading
            eyebrow="Real Numbers"
            heading="Example Projects & What They Cost"
            subheading="These examples will provide a precise idea on cost based on the application."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {EXAMPLE_PROJECTS.map((project) => {
              const kit = exampleKitDetails(storeProducts, project.handle, project.size)
              return (
                <a
                  key={project.title}
                  href={`/store/${project.handle}`}
                  className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#003365]/30"
                >
                  {kit?.image && (
                    <div className="bg-gray-50 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={kit.image}
                        alt={kit.title}
                        className="w-full h-auto object-contain px-2 pt-2 pb-1 group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="font-bold text-gray-900 group-hover:text-[#003365] transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-accent">
                      {kit?.title ?? 'Crazy Seal Kit'} — {project.size} Kit
                    </p>
                    <div className="mt-3 flex items-end justify-between flex-1">
                      <div>
                        {kit?.price != null && (
                          <span className="text-lg font-bold text-[#003365]">
                            {formatPrice(kit.price)}
                          </span>
                        )}
                        <p className="text-[13px] text-gray-500">{project.note}</p>
                      </div>
                      <span className="flex items-center gap-1 text-sm font-semibold text-[#5BA411] group-hover:gap-2 transition-all">
                        Shop This Kit
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </a>
              )
            })}
          </Grid>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
