import type { Metadata } from 'next'
import { ArrowRight, Phone, ShoppingCart } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'

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
      'Crazy Clean is a highly effective concentrated cleaning solution specially formulated to remove surface contaminants such as oils, dirt and oxidation. Crazy Clean is environmentally safe, non-toxic and leaves no contaminating by-products or pollutants to damage the environment.',
  },
  {
    name: 'Crazy Caulk',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    href: '/store/crazy-caulk',
    description:
      'Crazy Caulk is a fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Crazy Caulk is generally used to seal seams, such as the seams along the sides of an RV or seams created where components such as gutter systems attach to the roof.',
  },
  {
    name: 'Crazy Patch',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    href: '/store/crazy-patch',
    description:
      'Crazy Patch is a fiber-infused silicone, moisture-curing mastic with excellent adhesion to most surfaces. Crazy Patch is generally used to seal all existing penetrations. Simply stated, wherever sealant was previously applied to cover penetrations, Crazy Patch will be used to ensure that penetrations are sealed. Crazy Patch can also be used alone as a single component repair product to patch leaks.',
  },
  {
    name: 'Crazy Seal',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-400x586.png`,
    href: '/store/crazy-seal',
    description:
      'Crazy Seal is a weatherproof, fiber-infused silicone, fluid-applied membrane. Applying Crazy Seal to any weathered roof substrate will help ensure it is protected against degradation caused by harsh UV rays, severe weather, mold and mildew. It will not chalk or blister. The unique fiber-infused silicone makeup of Crazy Seal remains permanently flexible yet strong.',
  },
  {
    name: 'Crazy Tape',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    href: '/store/crazy-tape',
    description:
      'Crazy Tape is a special tape created for scenarios where repairs are required. Crazy Tape has a strong adhesive on one side and a fabric material on the other. This gives you the ability to add additional structural integrity to the seam with the adhesive, while the fabric on top is designed to allow the Crazy Seal System to adhere to it. This combination allows you many different possibilities for repair on your roof.',
  },
]

export default function OrderingPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Free Shipping on Orders Over $500
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Ordering
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-6 leading-relaxed">
              All Crazy Seal products are manufactured in the USA and ship
              directly to your door.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/store" variant="accent" size="lg">
                <ShoppingCart className="w-5 h-5" />
                Visit Our Store
              </LinkButton>
              <LinkButton href="/pricing" variant="white" size="lg">
                Get an Instant Quote
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── KITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Pre-Built Kits Or Custom Solutions To Fit Your Application"
            subheading="Pricing is unique to your application. The size and type of roof you have will determine how much of each of our products you need to complete your project! Please click on pre-built kits below and choose your square footage for exact pricing on any kit. These work best on projects up to 500 square feet. For projects above 500 square feet, you can use the build your own kit page to add products to your cart and see a total price. The build your own kit page is also the fastest way to view pricing and coverage rates on each individual product. If you need assistance with choosing or building a kit, reach out to our team and we'll be happy to help!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {KITS.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={kit.image}
                  alt={kit.title}
                  className="h-24 w-auto object-contain mb-4"
                />
                <h3 className="font-bold text-primary mb-1">{kit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{kit.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 md:pt-8">
            <LinkButton
              href="/store#rv-kits"
              variant="primary"
              size="md"
             
            >
              See All Kits On One Page
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── INDIVIDUAL PRODUCTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Individual Product Pages"
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={product.href}
                className="group rounded-2xl bg-white p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-32 w-auto object-contain mb-4"
                />
                <h3 className="font-bold text-primary uppercase mb-2">{product.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-4">
                  {product.description}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  See Product Page <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 md:pt-8">
            <LinkButton
              href="/store#products"
              variant="white"
              size="md"
             
            >
              See All Products On One Page
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 py-10 sm:py-16 px-5 sm:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Let&apos;s Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="primary" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
