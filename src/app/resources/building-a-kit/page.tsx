import type { Metadata } from 'next'
import { ArrowRight, ExternalLink, Package, ShoppingCart } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

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
    desc: 'Crazy Clean is a highly effective concentrated cleaning solution specially formulated to remove surface contaminants such as oils, dirt and oxidation. Crazy Clean is environmentally safe, non-toxic and leaves no contaminating by-products or pollutants to damage the environment.',
    href: 'https://buy.crazyseal.com/products/crazy-clean/',
  },
  {
    heading: 'Crazy Caulk',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png`,
    desc: 'Crazy Caulk is a fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Crazy Caulk is generally used to seal seams, such as the seams along the sides of an RV or seams created where components such as gutter systems attach to the roof.',
    href: 'https://buy.crazyseal.com/products/crazy-caulk/',
  },
  {
    heading: 'Crazy Patch',
    image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png`,
    desc: 'Crazy Patch is a fiber-infused silicone, moisture-curing mastic with excellent adhesion to most surfaces. Crazy Patch is generally used to seal all existing penetrations. Simply stated, wherever sealant was previously applied to cover penetrations, Crazy Patch will be used to ensure that penetrations are sealed. Crazy Patch can also be used alone as a single component repair product to patch leaks.',
    href: 'https://buy.crazyseal.com/products/crazy-patch/',
  },
  {
    heading: 'Crazy Seal',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png`,
    desc: 'Crazy Seal is a weatherproof, fiber-infused silicone, fluid-applied membrane. Applying Crazy Seal to any weathered roof substrate will help ensure it is protected against degradation caused by harsh UV rays, severe weather, mold and mildew. It will not chalk or blister. The unique fiber-infused silicone makeup of Crazy Seal remains permanently flexible yet strong.',
    href: 'https://buy.crazyseal.com/products/crazy-seal',
  },
  {
    heading: 'Crazy Tape',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-1024x1024.png`,
    desc: 'Crazy Tape is a special tape created for scenarios where repairs are required. Crazy Tape has a strong adhesive on one side and a fabric material on the other. This gives you the ability to add additional structural integrity to the seam with the adhesive, while the fabric on top is designed to allow the Crazy Seal System to adhere to it. This combination allows you many different possibilities for repair on your roof.',
    href: 'https://buy.crazyseal.com/products/crazy-tape/',
  },
  {
    heading: 'Crazy Cloth',
    image: `${MEDIA}/2021/12/Crazy-Cloth-1000x1395-1-734x1024.png`,
    desc: 'Crazy Cloth is a special roofing fabric used to seal large seams. Combining this with the fluid applied products allows you many different possibilities for repair on your roof.',
    href: 'https://buy.crazyseal.com/products/crazy-cloth',
  },
]

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function BuildingAKitPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Package className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 4
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Building a Kit
                </h1>
                <p className="text-xl font-semibold text-white mb-3">
                  Pre-Built Kits Or Custom Solutions To Fit Your Application
                </p>
                <p className="text-white/70 text-base leading-relaxed">
                  The size and type of roof you have will determine how much of
                  each of our products you need to complete your project!
                  Please click on project kits below for exact pricing on any
                  kit. You can also can use the build your own kit page to add
                  products to your cart and see a total price. The build your
                  own kit page is also the fastest way to view pricing and
                  coverage rates on each individual product. If you need
                  assistance with choosing or building a kit, reach out to our
                  team and we&apos;ll be happy to help!
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517426"
                  thumbnail={`${MEDIA}/2024/04/Module-4-Thumbnail.jpg`}
                  title="Module 4: Building a Kit"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 4: Building a Kit
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ALL KITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading heading="See All Kits On One Page" />
          <LinkButton
            href="https://buy.crazyseal.com/pages/kits/"
            variant="accent"
            size="lg"
            external
          >
            <ShoppingCart className="w-5 h-5" />
            All Project Kits
          </LinkButton>
        </div>
      </Container>

      {/* ─── INDIVIDUAL PRODUCT PAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Individual Product Pages" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.heading}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.heading}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="p-5 text-center flex flex-col flex-1">
                  <h3 className="font-bold text-primary uppercase tracking-wide mb-2">
                    {product.heading}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">
                    {product.desc}
                  </p>
                  <div className="mt-auto">
                    <LinkButton
                      href={product.href}
                      variant="outline"
                      size="sm"
                      external
                      className="border-primary text-primary"
                    >
                      See Product Page
                      <ExternalLink className="w-3.5 h-3.5" />
                    </LinkButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center pt-6 md:pt-10">
            <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-4">
              See All Products On One Page
            </h3>
            <LinkButton
              href="https://buy.crazyseal.com/pages/build-your-own-kit/"
              variant="primary"
              size="lg"
              external
            >
              See All Products
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            Continue to Next Module
          </h2>
          <LinkButton href="/resources/installation" variant="accent" size="lg">
            Installation
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </Container>

      {/* ─── MODULE QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Business Accelerator Program"
            heading="Module Quick Links"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {MODULE_LINKS.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {mod.number}
                </span>
                <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {mod.label}
                </span>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-6">
            <LinkButton href="/business-accelerator-program" variant="primary" size="md">
              Business Accelerator Home
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Content | Feature Request"
            heading="Request Content or a Feature"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage="resources-building-a-kit" />
          </div>
        </div>
      </Container>
    </>
  )
}
