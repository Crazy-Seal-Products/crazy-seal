import type { Metadata } from 'next'
import {
  ArrowRight,
  Boxes,
  Flag,
  Headset,
  Phone,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Order Crazy Seal',
  description: 'Order your Crazy Seal Roofing Kit, do it yourself, and save!',
}

const KITS = [
  {
    title: 'Double Layer Kits',
    desc: 'Our most popular kit with double layer protection.',
    href: '/store/double-layer-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Direct to Deck Kits',
    desc: 'A special kit for sealing directly over wood decking.',
    href: '/store/direct-to-deck-kit',
    image: `${MEDIA}/2021/12/Direct-to-Deck-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own custom kit from our lineup of roofing products.',
    href: '/build-your-own-kit',
    image: `${MEDIA}/2021/12/Build-Your-Own-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Crazy Good Repair Kit',
    desc: 'Kit for small repairs or adding a fixture to a Crazy Seal roof.',
    href: '/store/crazy-good-repair-kit',
    image: `${MEDIA}/2021/12/Repair-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Work With A Specialist',
    desc: 'Need help building a kit? Our team of experts would love to help!',
    href: '/contact',
    image: `${MEDIA}/2022/01/Crazy-Seal-Specialist-Image-768x768.png`,
  },
]

const PRODUCTS = [
  {
    name: 'Crazy Clean',
    image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`,
    href: '/store/crazy-clean',
    description:
      'A concentrated cleaner that removes oils, dirt and oxidation. Environmentally safe, non-toxic, and leaves no contaminating by-products.',
  },
  {
    name: 'Crazy Caulk',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    href: '/store/crazy-caulk',
    description:
      'Fiber-infused silicone, moisture-curing sealant with excellent adhesion. Seals seams — like RV side seams or where gutters attach to the roof.',
  },
  {
    name: 'Crazy Patch',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    href: '/store/crazy-patch',
    description:
      'Fiber-infused silicone, moisture-curing mastic that seals every existing penetration. Also works alone as a single-component leak repair.',
  },
  {
    name: 'Crazy Seal',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`,
    href: '/store/crazy-seal',
    description:
      'Weatherproof, fiber-infused silicone, fluid-applied membrane. Shields against UV, severe weather, mold and mildew — won’t chalk or blister, and stays permanently flexible yet strong.',
  },
  {
    name: 'Crazy Tape',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    href: '/store/crazy-tape',
    description:
      'Strong adhesive on one side, fabric on the other — adds structural integrity to a seam while giving the Crazy Seal System a surface to bond to. Built for repairs.',
  },
]

const PRICING_GUIDE = [
  {
    icon: Ruler,
    title: 'Up to 500 sq ft',
    desc: 'Pick a pre-built kit below and choose your square footage for exact pricing.',
  },
  {
    icon: Boxes,
    title: 'Over 500 sq ft',
    desc: 'Use Build Your Own Kit to add products, see a total, and check coverage rates.',
  },
  {
    icon: Headset,
    title: 'Need a hand?',
    desc: "Reach out and our team will gladly help you choose or build a kit.",
  },
]

const HERO_TRUST = [
  { icon: Flag, label: 'Manufactured in the USA' },
  { icon: Truck, label: 'Ships directly to your door' },
  { icon: ShieldCheck, label: '50 Year Warranty' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

export default function OrderingPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-0 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1
              {...enter(80)}
              className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4"
            >
              <span className="text-shimmer-highlight">Ordering</span>
            </h1>
            <p
              {...enter(160)}
              className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto mb-7 leading-relaxed"
            >
              All Crazy Seal products are manufactured in the USA and ship
              directly to your door.
            </p>
            <div {...enter(240)} className="animate-fade-up flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/kit-builder" variant="accent" size="lg">
                <ShoppingCart className="w-5 h-5" />
                Visit Our Store
              </LinkButton>
              <LinkButton href="/kit-builder" variant="white" size="lg">
                Build My Kit
              </LinkButton>
            </div>
            <ul
              {...enter(320)}
              className="animate-fade-up mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── KITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Kits & Custom Builds"
            heading="Pre-Built Kits Or Custom Solutions To Fit Your Application"
            subheading="Pricing is unique to your application — the size and type of your roof determine how much of each product you need."
          />

          {/* How pricing works */}
          <div className="mb-8 md:mb-10 grid grid-cols-1 gap-3 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-3 ring-1 ring-primary/[0.06] md:grid-cols-3">
            {PRICING_GUIDE.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-primary/[0.06] transition-all duration-300 hover:shadow-md"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-primary">{title}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {KITS.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white p-2 text-center shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative grid h-32 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10">
                  <div aria-hidden="true" className="absolute inset-x-8 bottom-3 h-6 rounded-full bg-primary/10 blur-xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.image}
                    alt={kit.title}
                    className="relative h-24 w-auto max-w-[90%] object-contain transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-4">
                  <h3 className="font-extrabold text-primary mb-1">{kit.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{kit.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
                    Shop Now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8 md:pt-10">
            <LinkButton href="/kit-builder#rv-kits" variant="primary" size="md">
              See All Kits On One Page
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── INDIVIDUAL PRODUCTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="The 3-Part System & Extras"
            heading="Individual Product Pages"
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-2 text-center shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]"
              >
                <div className="relative grid h-40 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10">
                  <div aria-hidden="true" className="absolute inset-x-10 bottom-3 h-6 rounded-full bg-primary/10 blur-xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="relative h-32 w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
                  />
                </div>
                <div className="flex flex-1 flex-col items-center px-3 pb-3 pt-4">
                  <h3 className="font-extrabold text-primary uppercase tracking-wide mb-2">{product.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    {product.description}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
                    See Product Page
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8 md:pt-10">
            <LinkButton href="/kit-builder#products" variant="white" size="md">
              See All Products On One Page
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 py-10 sm:py-16 px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mb-6 tracking-tight text-balance">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/kit-builder" variant="primary" size="lg">
              Build My Kit
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 text-accent" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
