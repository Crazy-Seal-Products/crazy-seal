import type { Metadata } from 'next'
import { ArrowRight, Headset, Palette, Phone, Ruler, SlidersHorizontal } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import {
  BeforeAfterGrid,
  ColorSwatches,
  ContactCta,
  IconTile,
  MEDIA,
  OrderPerks,
  OtherKits,
  SECTION_NAVY,
  SECTION_WHITE,
  ShopHero,
  SpecTable,
  SwagPack,
} from '@/components/system-pages/blocks'
import { VideoPlayer } from './VideoPlayer'

const SHOP_BYOK = '/kit-builder#products'

export const metadata: Metadata = {
  title: 'Build Your Own Kit',
  description:
    'Build your own Crazy Seal roofing kit from our lineup of roofing products. View coverage rates for Crazy Seal, Crazy Patch, Crazy Caulk, Crazy Clean, and Crazy Tape. In-stock and ready to ship with free shipping on orders over $500.',
}

const PRODUCTS = [
  {
    id: 'crazy-caulk',
    name: 'Crazy Caulk',
    coverageLabel: 'Coverage Rate',
    coverage: '~40 FT / Tube',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube.png`,
    youtubeId: 'pk-958WYDA8',
    videoLabel: 'Product Video (0:49)',
    href: '/store/crazy-caulk',
    description:
      'A fiber infused, moisture-curing sealant with excellent adhesion to most roof surfaces. Crazy Caulk is a component of the Crazy Seal monolithic system.',
    specs: [
      {
        label: 'Coverage Rates',
        value:
          'Depends on the size of the bead you run. On average, approximately 40 ft per tube. Also offered in gallon form — a gallon is the equivalent of about 8 tubes of caulk.',
      },
      { label: 'Colors', value: 'Available in White, Gray, or Tan' },
      { label: 'Net Contents (2 Size Options)', value: '11 Ounce Tube or 1 US GAL / 3.8 L' },
    ],
  },
  {
    id: 'crazy-patch',
    name: 'Crazy Patch',
    coverageLabel: 'Coverage Rate',
    coverage: '~75 Linear FT / Gallon',
    image: `${MEDIA}/2019/05/Crazy-Patch-400x560.png`,
    youtubeId: 'DW4FxoRinWg',
    videoLabel: 'Product Video (0:35)',
    href: '/store/crazy-patch',
    description:
      'A fiber infused moisture-curing mastic with excellent adhesion to most roof surfaces, and a component of the Crazy Seal monolithic silicone system. Crazy Patch can also be used alone as a single component repair product to patch leaks.',
    specs: [
      { label: 'Net Contents', value: '1 US GAL / 3.8 L' },
      {
        label: 'Coverage',
        value:
          'You can expect to cover about 75 linear ft with a 3″ brush. Actual cover rates vary depending on application thickness.',
      },
      { label: 'Colors', value: 'Available in White, Gray, or Tan' },
    ],
  },
  {
    id: 'crazy-seal',
    name: 'Crazy Seal',
    coverageLabel: 'Coverage Rate',
    coverage: '~75-100 SQ FT / Gal',
    image: `${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-400x558.png`,
    youtubeId: '7UdhprChv1Q',
    videoLabel: 'Product Video (0:44)',
    href: '/store/crazy-seal',
    description:
      'When properly applied, Crazy Seal provides a weatherproof monolithic silicone roof coating that protects any weathered roof substrate from harsh UV rays, severe weather, mold and mildew. It will not chalk or blister, and its fiber-infused silicone makeup remains permanently flexible yet strong.',
    specs: [
      { label: 'Color Options', value: 'Available in White, Gray, or Tan' },
      {
        label: 'Coverage Rates',
        value:
          '100 SQ FT / Gallon on standard surface like rubber. 75 SQ FT / Gallon when applied directly to wood decking.',
      },
      {
        label: 'Net Contents (3 Size Options)',
        value: '5 US GAL / 18.9 L, 3 US GAL / 11.4 L, or 1 US GAL / 3.8 L',
      },
    ],
  },
  {
    id: 'crazy-clean',
    name: 'Crazy Clean',
    coverageLabel: 'Coverage Rate',
    coverage: '~1,000 SQ FT / Gallon',
    image: `${MEDIA}/2019/05/Crazy-Clean-400x561.png`,
    youtubeId: 'mDrHEUH0K4I',
    videoLabel: 'Product Video (0:26)',
    href: '/store/crazy-clean',
    description:
      'A highly effective concentrated cleaning solution specially formulated to remove surface contaminates such as oils, dirt and oxidation. Environmentally safe, non-toxic, and leaves no contaminating by-products or pollutants to damage the environment.',
    specs: [
      { label: 'Net Contents', value: '1 US GAL / 3.8 L' },
      {
        label: 'Coverage Rates',
        value:
          'Because this is a concentrated solution, you can expect to clean up to 1,000 SQ FT with 1 gallon of Crazy Clean mixed with 3 gallons of water.',
      },
    ],
  },
  {
    id: 'crazy-tape',
    name: 'Crazy Tape',
    coverageLabel: 'Dimensions',
    coverage: '25 FT Rolls, 4 IN Wide',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-768x768.png`,
    youtubeId: 'zvmb4TqDXtI',
    videoLabel: 'Product Video (0:44)',
    href: '/store/crazy-tape',
    description:
      'A special tape for scenarios where repairs are required: strong adhesive on one side adds structural integrity to the seam, while the fabric on top lets the Crazy Seal System adhere to it. You will see Crazy Tape in our Direct to Deck Kits — going directly to wood decking, it helps you permanently seal your seams.',
    specs: [
      { label: 'Dimensions', value: '4″ x 25′' },
      { label: 'Color Options', value: 'Charcoal Gray' },
      { label: 'Net Contents', value: '25 Foot Rolls, 4 Inches Wide' },
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

const OTHER_KITS = [
  {
    title: 'Double Layer Kit',
    desc: 'Our most popular kit with double layer protection.',
    href: '/store/double-layer-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
    tag: 'Most popular',
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
        <ShopHero
          eyebrow="Custom Kits"
          eyebrowIcon={SlidersHorizontal}
          title={
            <>
              Build Your <span className="text-shimmer-highlight">Own Kit</span>
            </>
          }
          lead={
            <>
              <p className="font-semibold text-white/85">
                If you want to build your own kit, this is the section for you.
              </p>
              <p className="mt-2 text-base text-white/65">
                Each product below lists average coverage rates to help you figure out what you&apos;ll
                need. Need assistance?{' '}
                <a href="/contact" className="font-semibold text-highlight underline-offset-4 hover:underline">
                  Click here
                </a>{' '}
                to get in touch with one of our roof specialists.
              </p>
            </>
          }
          shopHref={SHOP_BYOK}
          shopLabel="Build Your Kit Now"
          media={
            <VideoPlayer
              youtubeId="TP60Zd2GDPo"
              title="Build Your Own Kit product video"
              caption="Click to Watch Product Video (0:24)"
            />
          }
          chips={[
            { icon: SlidersHorizontal, label: 'Pick exactly what you need' },
            { icon: Ruler, label: 'Coverage rates for every product' },
            { icon: Palette, label: 'White, Gray or Tan' },
          ]}
        />
      </Container>

      {/* ─── ORDER PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-6">
        <OrderPerks freeShippingOver="$500" />
      </Container>

      {/* ─── PRODUCTS ─── */}
      {PRODUCTS.map((product, i) => (
        <Container key={product.name} size="xl" className="sm:pt-4 md:pt-8">
          <div id={product.id} className={`${SECTION_WHITE} scroll-mt-24`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
              <div className={`relative ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
                />
                <div className="relative">
                  <VideoPlayer
                    youtubeId={product.youtubeId}
                    title={`${product.name} product video`}
                    caption={product.videoLabel}
                  />
                </div>
              </div>
              <div className={`text-center md:text-left ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-5">
                  <div className="group relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10 ring-1 ring-primary/[0.08] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-20 w-auto max-w-[80%] object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                    />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight uppercase">
                      {product.name}
                    </h2>
                    <p className="mt-1.5 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent-dark ring-1 ring-accent/20">
                      {product.coverageLabel}:
                      <span className="text-primary">{product.coverage}</span>
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-5 text-pretty">{product.description}</p>
                <SpecTable rows={product.specs} caption={`${product.name} specifications`} className="mb-6" />
                <LinkButton href={product.href} variant="accent" size="md" external>
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
        <div className={SECTION_NAVY}>
          <div className="group flex flex-col lg:flex-row items-center gap-6 lg:gap-10 text-center lg:text-left">
            <IconTile icon={Headset} className="h-16 w-16 rounded-2xl" iconClassName="h-7 w-7" />
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Need Assistance?
              </h2>
              <p className="mt-2 text-white/70 text-base sm:text-lg">
                Get in touch and one of our specialists will get back to you as soon as possible.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <LinkButton href="/contact" variant="accent" size="lg">
                Contact Us
              </LinkButton>
              <a
                href="tel:8009630131"
                className="group/phone inline-flex items-center gap-3 rounded-full bg-white/10 py-2 pl-2 pr-5 text-left text-white ring-1 ring-white/15 transition-colors hover:bg-white/15"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent/25 ring-1 ring-accent/40 transition-transform duration-300 group-hover/phone:-rotate-12">
                  <Phone className="h-4 w-4 text-accent-light" />
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/60">
                    Or call us Mon-Fri, 9:00am - 6pm EST
                  </span>
                  <span className="block font-bold">(800) 963-0131</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Before & After"
            heading="Installation Examples"
            subheading="Slide the center bar back and forth to see the transformations!"
          />
          <BeforeAfterGrid items={INSTALLATION_EXAMPLES} />
        </div>
      </Container>

      {/* ─── SWAG PACK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <SwagPack />
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ColorSwatches />
      </Container>

      {/* ─── OTHER KIT OPTIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <OtherKits kits={OTHER_KITS} />
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
