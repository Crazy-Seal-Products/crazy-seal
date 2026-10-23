import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Container, Grid, SectionHeading } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { CountUp, GlowOrb } from '@/components/motion'
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

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  style: { animationDelay: `${delayMs}ms` },
})

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
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 top-1/3 h-80 w-80" color="rgb(91 164 17 / 0.22)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8">
            <div className="text-center mb-8 md:mb-10">
              <h1
                {...enter(80)}
                className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance"
              >
                Build Your Kit in{' '}
                <span className="text-shimmer-highlight">60 Seconds</span>
              </h1>
              <p
                {...enter(160)}
                className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8"
              >
                Answer a few questions for a complete kit with live pricing — everything
                your roof needs in one box, nothing it doesn&apos;t.
              </p>

              {/* Stats strip */}
              <div
                {...enter(240)}
                className="animate-fade-up mx-auto grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3"
              >
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.06] px-3 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
                  <Stars />
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    rated by DIYers
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.06] px-3 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="text-2xl font-extrabold leading-none text-white font-[family-name:var(--font-display)]">1,000s</span>
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    of roofs sealed
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.06] px-3 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="inline-flex items-center gap-2 text-2xl font-extrabold leading-none text-white font-[family-name:var(--font-display)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-accent-light opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-light" />
                    </span>
                    Live
                  </span>
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    pricing on your kit
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.06] px-3 py-3.5 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="text-2xl font-extrabold leading-none text-white font-[family-name:var(--font-display)]">
                    <CountUp value={50} suffix=" yr" />
                  </span>
                  <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/55">
                    warranty
                  </span>
                </div>
              </div>
            </div>
            <div {...enter(320)} className="animate-fade-up max-w-5xl mx-auto">
              <KitBuilder catalog={catalog} />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── STORE CATALOG ─── */}
      <StoreCatalog products={storeProducts} />

      {/* ─── OR BROWSE BY APPLICATION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="See It On Roofs Like Yours"
            heading="Or Browse by Application"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-primary">{app.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
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
          className="section-bleed scroll-mt-24 bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12"
        >
          <SectionHeading
            eyebrow="Real Numbers"
            heading="Example Projects & What They Cost"
            subheading="Real kits at live prices — see what projects like yours cost."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {EXAMPLE_PROJECTS.map((project) => {
              const kit = exampleKitDetails(storeProducts, project.handle, project.size)
              return (
                <a
                  key={project.title}
                  href={`/store/${project.handle}`}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/15"
                >
                  {kit?.image && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10">
                      <div aria-hidden="true" className="pointer-events-none absolute inset-x-10 bottom-3 h-6 rounded-full bg-primary/10 blur-xl" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={kit.image}
                        alt={kit.title}
                        className="relative w-full h-auto object-contain px-2 pt-2 pb-1 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 px-3.5 pb-3.5 pt-4">
                    <h3 className="font-extrabold text-primary">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-accent-dark">
                      {kit?.title ?? 'Crazy Seal Kit'} — {project.size} Kit
                    </p>
                    <div className="mt-4 flex flex-1 items-end justify-between gap-3 border-t border-primary/[0.06] pt-4">
                      <div>
                        {kit?.price != null && (
                          <span className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">
                            {formatPrice(kit.price)}
                          </span>
                        )}
                        <p className="text-[13px] text-gray-500">{project.note}</p>
                      </div>
                      <span className="relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-accent-light to-accent px-4 py-2 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgb(91_164_17/0.6)] transition-shadow duration-300 group-hover:shadow-glow-accent">
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
                        />
                        Shop This Kit
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
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
