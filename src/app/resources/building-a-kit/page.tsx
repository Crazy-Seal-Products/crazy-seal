import type { Metadata } from 'next'
import { ArrowRight, ArrowUpRight, Check, ShoppingCart } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import {
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Building a Kit',
  description:
    'Module 4 of the Crazy Seal Business Accelerator Program. Pre-built kits or custom solutions to fit your application, plus individual product pages for Crazy Clean, Crazy Caulk, Crazy Patch, Crazy Seal, Crazy Tape, and Crazy Cloth.',
}

const PRODUCTS = [
  {
    heading: 'Crazy Clean',
    image: `${MEDIA}/2019/05/Crazy-Clean-731x1024.png`,
    desc: 'A concentrated cleaner that removes oils, dirt and oxidation. Environmentally safe and non-toxic, it leaves no contaminating by-products or pollutants.',
    href: '/store/crazy-clean',
  },
  {
    heading: 'Crazy Caulk',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png`,
    desc: 'Fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Seals seams, like the sides of an RV or where gutter systems attach to the roof.',
    href: '/store/crazy-caulk',
  },
  {
    heading: 'Crazy Patch',
    image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png`,
    desc: 'Fiber-infused silicone, moisture-curing mastic with excellent adhesion. Seals every existing penetration (anywhere sealant was used before) and works alone as a single-component leak repair.',
    href: '/store/crazy-patch',
  },
  {
    heading: 'Crazy Seal',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png`,
    desc: "Weatherproof, fiber-infused silicone, fluid-applied membrane. Protects weathered roofs from harsh UV, severe weather, mold and mildew. Won't chalk or blister; stays permanently flexible yet strong.",
    href: '/store/crazy-seal',
  },
  {
    heading: 'Crazy Tape',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-1024x1024.png`,
    desc: 'Strong adhesive on one side, fabric on the other. Adds structural integrity to a seam while giving the Crazy Seal System a surface to adhere to, for many repair possibilities.',
    href: '/store/crazy-tape',
  },
  {
    heading: 'Crazy Cloth',
    image: `${MEDIA}/2021/12/Crazy-Cloth-1000x1395-1-734x1024.png`,
    desc: 'Special roofing fabric used to seal large seams. Combine it with the fluid-applied products for many different repair possibilities.',
    href: '/store/crazy-cloth',
  },
]

const KIT_TIPS = [
  'Click any project kit for exact pricing',
  'Build your own kit to see totals, pricing and coverage rates per product',
  'Need help choosing? Our team is happy to help',
]

export default function BuildingAKitPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={4}
        title={
          <>
            Building a <span className="text-shimmer-highlight">Kit</span>
          </>
        }
        tagline="Pre-Built Kits Or Custom Solutions To Fit Your Application"
        intro={
          <>
            <p>The size and type of roof determine how much of each product you need.</p>
            <ul className="mx-auto mt-4 w-fit space-y-2 text-left text-base lg:mx-0">
              {KIT_TIPS.map((tip) => (
                <li key={tip} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Check className="h-3 w-3 text-accent-light" strokeWidth={3} />
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </>
        }
        media={
          <ProVimeoEmbed
            videoId="937517426"
            thumbnail={`${MEDIA}/2024/04/Module-4-Thumbnail.jpg`}
            title="Module 4: Building a Kit"
          />
        }
        mediaCaption="Module 4: Building a Kit"
      />

      <ModuleNav current={4} />

      {/* ─── ALL KITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/[0.04] via-accent/[0.07] to-primary/[0.04] p-6 ring-1 ring-primary/[0.06] sm:p-8 lg:p-10">
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent animate-float">
                <ShoppingCart className="h-8 w-8" />
              </span>
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">
                  See All Kits On One Page
                </h2>
                <p className="mt-1 text-gray-600">Double layer, direct to deck, commercial and build-your-own kits.</p>
              </div>
              <LinkButton href="/kit-builder" variant="accent" size="lg">
                <ShoppingCart className="h-5 w-5" />
                All Project Kits
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INDIVIDUAL PRODUCT PAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="The Crazy Seal Lineup" heading="Individual Product Pages" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {PRODUCTS.map((product) => (
              <a
                key={product.heading}
                href={product.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-accent/10 p-6">
                  <div aria-hidden="true" className="absolute inset-x-12 bottom-6 h-6 rounded-full bg-primary/10 blur-xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.heading}
                    className="relative h-full w-auto object-contain transition-transform duration-700 ease-out group-hover:-rotate-2 group-hover:scale-[1.08]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="mb-2 text-lg font-extrabold text-primary">{product.heading}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-gray-500">{product.desc}</p>
                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-primary/[0.07] pt-4 text-sm font-bold text-primary">
                    See Product Page
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/[0.06] transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 text-center md:mt-10">
            <h3 className="text-lg font-extrabold text-primary">See All Products On One Page</h3>
            <LinkButton href="/kit-builder#products" variant="primary" size="lg">
              See All Products
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE + QUICK LINKS ─── */}
      <ModuleNext current={4} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-building-a-kit" />
    </>
  )
}
