import type { Metadata } from 'next'
import {
  ArrowRight,
  CreditCard,
  Gift,
  PackageCheck,
  Phone,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { VideoPlayer } from './VideoPlayer'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const SHOP_BYOK = '/store#products'

export const metadata: Metadata = {
  title: 'Build Your Own Kit',
  description:
    'Build your own Crazy Seal roofing kit from our lineup of roofing products. View coverage rates for Crazy Seal, Crazy Patch, Crazy Caulk, Crazy Clean, and Crazy Tape. In-stock and ready to ship with free shipping on orders over $500.',
}

const PRODUCTS = [
  {
    name: 'Crazy Caulk',
    coverageLabel: 'Coverage Rate:',
    coverage: '~40 FT / Tube',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    youtubeId: 'pk-958WYDA8',
    videoLabel: 'Product Video (0:49)',
    href: '/store/crazy-caulk',
    paragraphs: [
      'Crazy Caulk is a fiber infused, moisture-curing sealant with excellent adhesion to most roof surfaces. Crazy Caulk is a component of the Crazy Seal monolithic system.',
      'Coverage Rates: This depends on the size of the bead you run. On average, you can expect approximately 40 ft per tube. We also offer this in gallon form. A gallon is the equivalent of about 8 tubes of caulk.',
      'Colors: Available in White, Gray, or Tan',
      'Net Contents (2 Size Options): 11 Ounce Tube or 1 US GAL / 3.8 L',
    ],
  },
  {
    name: 'Crazy Patch',
    coverageLabel: 'Coverage Rate:',
    coverage: '~75 Linear FT / Gallon',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    youtubeId: 'DW4FxoRinWg',
    videoLabel: 'Product Video (0:35)',
    href: '/store/crazy-patch',
    paragraphs: [
      'Crazy Patch is a fiber infused moisture-curing mastic with excellent adhesion to most roof surfaces. Crazy Patch is a component of the Crazy Seal monolithic silicone system. Crazy Patch can also be used alone as a single component repair product to patch leaks.',
      'Net Contents: 1 US GAL / 3.8 L',
      'Coverage: You can expect to cover about 75 linear ft with a 3\u2033 brush. Actual cover rates vary depending on application thickness.',
      'Colors: Available in White, Gray, or Tan',
    ],
  },
  {
    name: 'Crazy Seal',
    coverageLabel: 'Coverage Rate:',
    coverage: '~75-100 SQ FT / Gal',
    image: `${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-400x558.png`,
    youtubeId: '7UdhprChv1Q',
    videoLabel: 'Product Video (0:44)',
    href: '/store/crazy-seal',
    paragraphs: [
      'When properly applied, Crazy Seal provides a weatherproof monolithic silicone roof coating. Applying Crazy Seal to any weathered roof substrate will help ensure it is protected against degradation caused by harsh UV rays, severe weather, mold and mildew. It will not chalk or blister. The unique fiber-infused silicone makeup of Crazy Seal remains permanently flexible yet strong.',
      'Color Options: Available in White, Gray, or Tan',
      'Coverage Rates: 100 SQ FT / Gallon on standard surface like rubber. 75 SQ FT / Gallon when applied directly to wood decking.',
      'Net Contents (3 Size Options): 5 US GAL / 18.9 L, 3 US GAL / 11.4 L, or 1 US GAL / 3.8 L',
    ],
  },
  {
    name: 'Crazy Clean',
    coverageLabel: 'Coverage Rate:',
    coverage: '~1,000 SQ FT / Gallon',
    image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`,
    youtubeId: 'mDrHEUH0K4I',
    videoLabel: 'Product Video (0:26)',
    href: '/store/crazy-clean',
    paragraphs: [
      'Crazy Clean is a highly effective concentrated cleaning solution specially formulated to remove surface contaminates such as oils, dirt and oxidation. Crazy Clean is environmentally safe, non-toxic and leaves no contaminating by-products or pollutants to damage the environment.',
      'Net Contents: 1 US GAL / 3.8 L',
      'Coverage Rates: Because this is a concentrated solution, you can expect to clean up to 1,000 SQ FT with 1 gallon of Crazy Clean mixed with 3 gallons of water.',
    ],
  },
  {
    name: 'Crazy Tape',
    coverageLabel: 'Dimensions:',
    coverage: '25 FT Rolls, 4 IN Wide',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    youtubeId: 'zvmb4TqDXtI',
    videoLabel: 'Product Video (0:44)',
    href: '/store/crazy-tape',
    paragraphs: [
      'You will see Crazy Tape in our Direct to Deck Kits. If you are going directly to wood decking, Crazy Tape will help you permanently seal your seams.',
      'Crazy Tape is a special tape created for scenarios where repairs are required. Crazy Tape has a strong adhesive on one side and a fabric material on the other. This gives you the ability to add additional structural integrity to the seam with the adhesive, while the fabric on top is designed to allow the Crazy Seal System to adhere to it. This combination allows you many different possibilities for repair on your roof. Dimensions are 4\u2033 x 25\u2032.',
      'Color Options: Charcoal Gray',
      'Net Contents: 25 Foot Rolls, 4 Inches Wide',
    ],
  },
]

const INSTALLATION_EXAMPLES = [
  {
    label: 'Winnebago RV Roof',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Monaco RV Roof',
    before: `${MEDIA}/2019/05/Monaco-Arial-Before-Crazy-Seal-1024x512.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Arial-After-Crazy-Seal-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Roof Vent',
    before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Skylight & Solar',
    before: `${MEDIA}/2019/07/Skylight-Solar-Before-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
    aspect: '3/2',
  },
]

const COLORS = [
  { name: 'White', className: 'bg-white border-2 border-gray-200' },
  { name: 'Gray', className: 'bg-gray-400' },
  { name: 'Tan', className: 'bg-[#d2b48c]' },
]

const OTHER_KITS = [
  {
    title: 'Double Layer Kit',
    desc: 'Our most popular kit with double layer protection.',
    href: '/store/double-layer-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Single Layer Kit',
    desc: 'A budget friendly option with single layer coverage.',
    href: '/store/single-layer-kit',
    image: `${MEDIA}/2020/03/Single-Layer-Kit-1-e1637944173532.png`,
  },
  {
    title: 'Direct To Deck Kit',
    desc: 'A special kit for sealing directly over wood decking.',
    href: '/store/direct-to-deck-kit',
    image: `${MEDIA}/2021/12/Direct-to-Deck-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Crazy Good Repair Kit',
    desc: 'Kit for small repairs or adding a fixture to a Crazy Seal roof.',
    href: '/store/crazy-good-repair-kit',
    image: `${MEDIA}/2021/12/Repair-Kit-Featured-Image-768x384.png`,
  },
]

export default function BuildYourOwnKitPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                  Custom Kits
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Build Your Own Kit
                </h1>
                <p className="text-base sm:text-lg text-white/70 font-semibold mb-3">
                  If you want to build your own kit, this is the section for you.
                </p>
                <p className="text-white/60 leading-relaxed mb-6">
                  If you click on the product details for any of the products
                  below, you will see average coverage rates that will help you
                  figure out what you will need for your project. If you need
                  assistance,{' '}
                  <a href="/contact" className="text-highlight hover:underline font-semibold">
                    click here
                  </a>{' '}
                  to get in touch with one of our roof specialists.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={SHOP_BYOK} variant="accent" size="lg" external>
                    <ShoppingCart className="w-5 h-5" />
                    Build Your Kit Now
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="lg">
                    Get an Instant Quote
                  </LinkButton>
                </div>
              </div>
              <VideoPlayer
                youtubeId="TP60Zd2GDPo"
                title="Build Your Own Kit product video"
                caption="Click to Watch Product Video (0:24)"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ORDER PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <PackageCheck className="w-6 h-6 text-accent" />,
                text: 'In-stock & Ready to Ship',
              },
              {
                icon: <CreditCard className="w-6 h-6 text-accent" />,
                text: 'Orders between $100 - $1,000 can be broken into 4 installments during checkout',
              },
              {
                icon: <Truck className="w-6 h-6 text-accent" />,
                text: 'Free Shipping on Orders Over $500',
              },
            ].map((perk) => (
              <div
                key={perk.text}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4"
              >
                <div className="flex-shrink-0">{perk.icon}</div>
                <p className="text-sm font-semibold text-primary">{perk.text}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── PRODUCTS ─── */}
      {PRODUCTS.map((product, i) => (
        <Container key={product.name} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <VideoPlayer
                  youtubeId={product.youtubeId}
                  title={`${product.name} product video`}
                  caption={product.videoLabel}
                />
              </div>
              <div className={`text-center md:text-left ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="flex items-center justify-center md:justify-start gap-5 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-28 w-auto object-contain"
                  />
                  <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase">
                      {product.name}
                    </h2>
                    <p className="text-sm font-semibold text-gray-500 mt-1">
                      {product.coverageLabel}{' '}
                      <span className="text-accent">{product.coverage}</span>
                    </p>
                  </div>
                </div>
                {product.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-gray-600 leading-relaxed mb-3">
                    {paragraph}
                  </p>
                ))}
                <LinkButton href={product.href} variant="accent" size="md" external className="mt-2">
                  Visit {product.name} Product Page
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
              </div>
            </div>
          </div>
        </Container>
      ))}

      {/* ─── NEED ASSISTANCE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading
            heading="Need Assistance?"
            subheading="Contact us through this form and one of our specialists will get back to you as soon as possible."
            variant="dark"
            className="mb-4"
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Or call us Mon-Fri, 9:00am - 6pm EST: (800) 963-0131
            </a>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Before & After"
            heading="Installation Examples"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INSTALLATION_EXAMPLES.map((example) => (
              <div key={example.label}>
                <BeforeAfterSlider
                  beforeSrc={example.before}
                  afterSrc={example.after}
                  aspectRatio={example.aspect}
                />
                <p className="text-center font-semibold text-primary mt-3">{example.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── SWAG PACK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/Swag-Pack-Image-1024x474.png`}
                alt="Free Crazy Seal swag pack: shirt, hat, and tote bag"
                className="rounded-2xl w-full h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                <Gift className="w-4 h-4 inline mr-1 -mt-0.5" />
                Free Gear
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Free Swag Pack on Orders Over $700!
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Want some FREE gear? If your order totals over $700, simply
                click the &ldquo;Add to Cart&rdquo; button below with your other
                items already in the cart. This will add a Swag Pack and
                automatically apply a coupon to include it free with your order.
                Swag Pack includes one XL shirt (super soft &amp; comfy), one
                hat, and one tote bag. A $50 value!
              </p>
              <LinkButton
                href="/store/free-crazy-seal-swag-pack"
                variant="white"
                size="lg"
               
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Available in 3 Colors"
            subheading="You asked for it, and we delivered! Crazy Seal is now available in 3 colors. White provides ultimate reflectivity, while the tan and gray help you to match your style. Choose the color that suits you best! All the Crazy Caulk, Crazy Patch, and Crazy Seal in your kit will be color matching."
          />
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-3xl mx-auto">
            {COLORS.map((color) => (
              <div key={color.name} className="text-center">
                <div
                  className={`aspect-square rounded-2xl shadow-sm ${color.className}`}
                />
                <p className="text-lg font-bold text-primary uppercase mt-4">{color.name}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── OTHER KIT OPTIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Other Kit Options" variant="dark" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OTHER_KITS.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group rounded-2xl bg-white p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 shadow-lg"
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
                  Shop This Kit <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
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
