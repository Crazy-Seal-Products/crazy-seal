import type { Metadata } from 'next'
import {
  ArrowRight,
  CreditCard,
  PackageCheck,
  Phone,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { VideoPlayer } from '../../build-your-own-kit/VideoPlayer'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const SHOP_URL = 'https://buy.crazyseal.com/products/crazy-seal'

export const metadata: Metadata = {
  title: 'Crazy Seal Roof Membrane',
  description:
    'Crazy Seal is a weatherproof, fiber-infused silicone, fluid-applied membrane that protects any weathered roof substrate against harsh UV rays, severe weather, mold and mildew. Available in White, Gray, or Tan in 1, 3, and 5 gallon sizes.',
}

const SIZES = [
  {
    label: '1 US GAL / 3.8 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-1-Gal-White-1000x1395-768x1071.png`,
  },
  {
    label: '3 US GAL / 11.4 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-3-Gal-White-1000x1395-768x1071.png`,
  },
  {
    label: '5 US GAL / 18.9 L',
    image: `${MEDIA}/2019/04/Crazy-Seal-5-Gal-White-1000x1395-768x1071.png`,
  },
]

export default function CrazySealRoofMembranePage() {
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
                  Crazy Seal Products
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Crazy Seal
                </h1>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6">
                  A weatherproof, fiber-infused silicone, fluid-applied
                  membrane that protects any weathered roof substrate against
                  harsh UV rays, severe weather, mold and mildew.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={SHOP_URL} variant="accent" size="lg" external>
                    <ShoppingCart className="w-5 h-5" />
                    Shop Crazy Seal
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="lg">
                    Get an Instant Quote
                  </LinkButton>
                </div>
              </div>
              <VideoPlayer
                youtubeId="7UdhprChv1Q"
                title="Crazy Seal product video"
                caption="Click to Watch Product Video (0:44)"
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

      {/* ─── PRODUCT DETAILS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
              Crazy Seal
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Crazy Seal is a weatherproof, fiber-infused silicone,
              fluid-applied membrane. Applying Crazy Seal to any weathered roof
              substrate will help ensure it is protected against degradation
              caused by harsh UV rays, severe weather, mold and mildew. It will
              not chalk or blister. The unique fiber-infused silicone makeup of
              Crazy Seal remains permanently flexible yet strong.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              When properly applied, Crazy Seal&trade; provides a weatherproof
              monolithic silicone roof coating.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              <span className="font-semibold text-primary">Color Options:</span>{' '}
              Available in White, Gray, or Tan
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              <span className="font-semibold text-primary">Coverage Rates:</span>{' '}
              100 SQ FT / Gallon on standard surface like rubber. 75 SQ FT /
              Gallon when applied directly to wood decking.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              <span className="font-semibold text-primary">
                Net Contents (3 Size Options):
              </span>{' '}
              5 US GAL / 18.9 L, 3 US GAL / 11.4 L, or 1 US GAL / 3.8 L
            </p>
            <LinkButton href={SHOP_URL} variant="accent" size="md" external>
              Shop Crazy Seal
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── SIZES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {SIZES.map((size) => (
              <div key={size.label} className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={size.image}
                  alt={`Crazy Seal ${size.label} bucket`}
                  className="h-56 w-auto object-contain mx-auto mb-4"
                />
                <p className="font-bold text-primary">{size.label}</p>
              </div>
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
