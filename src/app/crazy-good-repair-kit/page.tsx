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
import { VideoPlayer } from '../build-your-own-kit/VideoPlayer'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const SHOP_KIT = 'https://buy.crazyseal.com/products/crazy-good-repair-kit'

export const metadata: Metadata = {
  title: 'Crazy Good Repair Kit',
  description:
    'The Crazy Good Repair Kit gives you everything you need to repair a small area of your roof or add a new roof component to an existing Crazy Seal System. Best for small repair applications under 25 SQ FT. In-stock and ready to ship.',
}

const KIT_OPTIONS = [
  {
    label: 'Repair Kit (No Crazy Tape)',
    image: `${MEDIA}/2020/05/Repair-Kit-1024x683.png`,
    contents: [
      '(1) Tube of Crazy Caulk',
      '(1) Quart of Crazy Patch',
      '(1) Quart of Crazy Seal',
    ],
  },
  {
    label: 'Repair Kit (With Crazy Tape)',
    image: `${MEDIA}/2020/05/Repair-Kit-White-With-Tape-1024x512.png`,
    contents: [
      '(1) 25 FT Roll of Crazy Tape',
      '(1) Tube of Crazy Caulk',
      '(1) Quart of Crazy Patch',
      '(1) Quart of Crazy Seal',
    ],
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
    href: '/double-layer-kit',
    image: `${MEDIA}/2021/12/Double-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Single Layer Kit',
    desc: 'A budget friendly option with single layer coverage.',
    href: '/single-layer-kit',
    image: `${MEDIA}/2020/03/Single-Layer-Kit-1-e1637944173532.png`,
  },
  {
    title: 'Direct To Deck Kit',
    desc: 'A special kit for sealing directly over wood decking.',
    href: '/direct-to-deck-kit',
    image: `${MEDIA}/2021/12/Direct-to-Deck-Layer-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own custom kit from our lineup of roofing products.',
    href: '/build-your-own-kit',
    image: `${MEDIA}/2021/12/Build-Your-Own-Kit-Featured-Image-768x384.png`,
  },
]

export default function CrazyGoodRepairKitPage() {
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
                  Crazy Seal Roofing Kits
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Crazy Good Repair Kit
                </h1>
                <p className="text-base sm:text-lg text-white/70 font-semibold mb-3">
                  Our &ldquo;Crazy Good Repair Kit&rdquo; gives you everything
                  you need to repair a small area of your roof or add a new
                  roof component to an existing Crazy Seal System.
                </p>
                <p className="text-white/60 leading-relaxed mb-6">
                  These kits include quart sized pails of Crazy Patch and Crazy
                  Seal and are best for small repair applications under 25 SQ
                  FT.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={SHOP_KIT} variant="accent" size="lg" external>
                    <ShoppingCart className="w-5 h-5" />
                    Shop This Kit
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="lg">
                    Get an Instant Quote
                  </LinkButton>
                </div>
              </div>
              <VideoPlayer
                youtubeId="lRWZTz5utbU"
                title="Crazy Good Repair Kit product video"
                caption="Click to Watch Product Video (0:37)"
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
                text: 'Free Shipping on Orders Over $700',
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

      {/* ─── KIT DETAILS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Kit Details"
            subheading="Choose the repair kit that fits your project, with or without Crazy Tape."
          />
          <div className="space-y-6">
            {KIT_OPTIONS.map((kit) => (
              <div
                key={kit.label}
                className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6 items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.image}
                    alt={`${kit.label} contents`}
                    className="w-full h-auto object-contain"
                  />
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-bold text-primary mb-2">{kit.label}</h3>
                    <p className="text-sm font-semibold text-gray-500 mb-2">
                      This kit includes:
                    </p>
                    <ul className="text-sm text-gray-600 leading-relaxed mb-3">
                      {kit.contents.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Comes in White, Gray, or Tan. All of the products in the
                      kit will be the color that you choose.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ABOUT THIS KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
              Crazy Good Repair Kit
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our &ldquo;Crazy Good Repair Kit&rdquo; gives you everything you
              need to repair a small area of your roof or add a new roof
              component to an existing Crazy Seal System.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Repair Kits come with enough Crazy Caulk and Crazy Patch to seal
              your penetrations, as well as enough Crazy Seal to apply a small
              layer of the Crazy Seal Roof Membrane. These kits include quart
              sized pails of Crazy Patch and Crazy Seal and are best for small
              repair applications under 25 SQ FT.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We understand people are trying to save money where they can! A
              repair kit can help you do that. However, we recommend our{' '}
              <a
                href="/ordering"
                className="text-accent font-semibold hover:underline"
              >
                Full Roofing Kits
              </a>{' '}
              in most instances. A full roof membrane layer will be best in the
              long term to ensure your roof is fully protected over time.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              If you already have a full Crazy Seal kit installed, this is a
              perfect add-on to blend a new roof component into your existing
              system!
            </p>
            <LinkButton href={SHOP_KIT} variant="accent" size="md" external>
              <ShoppingCart className="w-4 h-4" />
              Shop the Crazy Good Repair Kit
            </LinkButton>
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
                href="https://buy.crazyseal.com/products/free-crazy-seal-swag-pack"
                variant="white"
                size="lg"
                external
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
