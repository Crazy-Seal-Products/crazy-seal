import type { Metadata } from 'next'
import { ArrowUpRight, Package, ShoppingCart, Truck } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import {
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroShell,
  KitCardGrid,
  MEDIA,
  SECTION_NAVY,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'
import { TiltCard } from '@/components/system-pages/motion-blocks'

export const metadata: Metadata = {
  title: 'Crazy Seal Products',
  description: 'Learn more about Crazy Seal Products.',
}

const PRODUCTS = [
  {
    name: 'Crazy Clean',
    role: 'Prep & clean',
    image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`,
    href: '/store/crazy-clean',
    description:
      'A concentrated cleaning solution that removes oils, dirt and oxidation. Environmentally safe, non-toxic, and leaves no contaminating by-products or pollutants behind.',
  },
  {
    name: 'Crazy Caulk',
    role: 'Seals seams',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    href: '/store/crazy-caulk',
    description:
      'A fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Seals seams — like the sides of an RV, or where gutter systems attach to the roof.',
  },
  {
    name: 'Crazy Patch',
    role: 'Seals penetrations',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    href: '/store/crazy-patch',
    description:
      'A fiber-infused silicone, moisture-curing mastic that seals all existing penetrations wherever sealant was previously applied. Also works alone as a single component repair product to patch leaks.',
  },
  {
    name: 'Crazy Seal',
    role: 'Roof membrane',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`,
    href: '/store/crazy-seal',
    description:
      'A weatherproof, fiber-infused silicone, fluid-applied membrane that protects against harsh UV rays, severe weather, mold and mildew. It will not chalk or blister, and stays permanently flexible yet strong.',
  },
  {
    name: 'Crazy Tape',
    role: 'Repairs & wood seams',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    href: '/store/crazy-tape',
    description:
      'Strong adhesive on one side adds structural integrity to the seam; fabric on the other lets the Crazy Seal System adhere to it — opening up many possibilities for repair on your roof.',
  },
  {
    name: 'Crazy Cloth',
    role: 'Fabric layer',
    image: `${MEDIA}/2019/07/Metal-Closeup-600x600.jpg`,
    href: '/store/crazy-cloth',
    cover: true,
    description:
      'The roofing fabric layer of the system. Sandwiched between coats of Crazy Seal, it delivers the strength of roofing fabric with the durability, flexibility, and longevity of silicone in one seamless, fiber-reinforced membrane.',
  },
]

const KITS = [
  {
    title: 'RV Roofing Kit',
    desc: 'Our most popular kit: everything to seal an RV roof for good, sized to your rig.',
    href: '/store/rv-roofing-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
    tag: 'Most popular',
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own custom kit from our lineup of roofing products.',
    href: '/build-your-own-kit',
    image: `${MEDIA}/2021/12/Build-Your-Own-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Build It With a Rep',
    desc: 'Need help building a kit? A Crazy Seal rep will size your roof and build it with you.',
    href: '/kit-builder#rep',
    image: `${MEDIA}/2022/01/Crazy-Seal-Specialist-Image-768x768.png`,
  },
]

/** Hero "shelf": packshots floating at staggered rhythms. */
const SHELF = [
  { src: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`, className: 'h-24 sm:h-36 lg:h-40', delay: '-1.2s' },
  { src: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`, className: 'h-28 sm:h-44 lg:h-48 -ml-2', delay: '-4.4s' },
  { src: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`, className: 'h-36 sm:h-56 lg:h-64 -mx-1', delay: '0s' },
  { src: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`, className: 'h-24 sm:h-36 lg:h-40 -mr-1', delay: '-2.6s' },
  { src: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`, className: 'h-16 sm:h-24 lg:h-28', delay: '-5.6s' },
]

export default function ProductsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-8 lg:gap-10 items-center">
            <div className="text-center lg:text-left">
              <h1 className={HERO_H1} style={fadeDelay(80)}>
                Our <span className="text-shimmer-highlight">Products</span>
              </h1>
              <p
                className="animate-fade-up text-base sm:text-lg text-white/70 max-w-xl mx-auto lg:mx-0 mb-7 leading-relaxed"
                style={fadeDelay(160)}
              >
                Every component of the Crazy Seal Roofing System, available individually or in pre-built
                kits. Free shipping on orders over $500.
              </p>
              <div
                className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
                style={fadeDelay(240)}
              >
                <LinkButton href="/kit-builder" variant="accent" size="lg">
                  <ShoppingCart className="w-5 h-5" />
                  Visit Our Store
                </LinkButton>
                <LinkButton href="/kit-builder" variant="white" size="lg">
                  Build My Kit
                </LinkButton>
              </div>
              <HeroChips
                className="mt-8 justify-center lg:justify-start"
                items={[
                  { icon: Package, label: 'Individually or in kits' },
                  { icon: Truck, label: 'Free shipping over $500' },
                ]}
              />
            </div>

            {/* Product shelf */}
            <div className="animate-fade-up relative mx-auto w-full max-w-xl pt-4" style={fadeDelay(200)} aria-hidden="true">
              <div className="absolute inset-x-6 bottom-2 h-16 rounded-[50%] bg-gradient-to-r from-secondary/40 via-highlight/30 to-accent/40 blur-2xl" />
              <div className="absolute inset-x-12 bottom-6 h-3 rounded-[50%] bg-black/30 blur-md" />
              <div className="relative flex items-end justify-center">
                {SHELF.map((item) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={item.src}
                    src={item.src}
                    alt=""
                    className={`${item.className} w-auto object-contain animate-float drop-shadow-[0_18px_24px_rgba(0,0,0,0.4)]`}
                    style={{ animationDelay: item.delay }}
                  />
                ))}
              </div>
            </div>
          </div>
        </HeroShell>
      </Container>

      {/* ─── PRODUCT LINEUP ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Every Component" heading="The Crazy Seal Lineup" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {PRODUCTS.map((product) => (
              <TiltCard key={product.name}>
                <a
                  href={product.href}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-shadow duration-500 hover:shadow-xl"
                >
                  <div className="relative grid h-52 place-items-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-accent/10">
                    {product.cover ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    ) : (
                      <>
                        <div aria-hidden="true" className="absolute bottom-6 h-6 w-1/2 rounded-full bg-primary/15 blur-xl" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="relative max-h-40 w-auto max-w-[70%] object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-3"
                        />
                      </>
                    )}
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm ring-1 ring-primary/10 backdrop-blur">
                      {product.role}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-xl font-extrabold text-primary uppercase tracking-wide">{product.name}</h2>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                        <ArrowUpRight className="h-5 w-5" />
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">{product.description}</p>
                    <span className="mt-auto pt-4 text-sm font-bold text-accent-dark">See Product Page</span>
                  </div>
                </a>
              </TiltCard>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── KITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <SectionHeading
            eyebrow="Kits & Custom Solutions"
            heading="Pre-Built Kits Or Custom Solutions To Fit Your Application"
            variant="dark"
          />
          <KitCardGrid kits={KITS} cta="Learn More" />
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <LinkButton href="/kit-builder#rv-kits" variant="white" size="md">
              See All Kits On One Page
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
