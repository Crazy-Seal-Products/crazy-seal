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
const SHOP_URL = 'https://buy.crazyseal.com/products/crazy-tape'

export const metadata: Metadata = {
  title: 'Crazy Tape',
  description:
    'Crazy Tape is a special repair tape with a strong adhesive on one side and a fabric material on the other, designed to allow the Crazy Seal System to adhere to it. Sold in 25 foot rolls, 4 inches wide, in Charcoal Gray.',
}

export default function CrazyTapePage() {
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
                  Crazy Tape
                </h1>
                <p className="text-base sm:text-lg text-white/70 leading-relaxed mb-6">
                  A special tape created for scenarios where repairs are
                  required, with a strong adhesive on one side and a fabric
                  material on the other.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={SHOP_URL} variant="accent" size="lg" external>
                    <ShoppingCart className="w-5 h-5" />
                    Shop Crazy Tape
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="lg">
                    Get an Instant Quote
                  </LinkButton>
                </div>
              </div>
              <VideoPlayer
                youtubeId="zvmb4TqDXtI"
                title="Crazy Tape product video"
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 lg:gap-10 items-center">
            <div className="flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/12/Crazy-Tape-1395x1395-1.png`}
                alt="Crazy Tape 25 foot roll"
                className="max-h-80 w-auto object-contain"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
                Crazy Tape
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Crazy Tape is a special tape created for scenarios where
                repairs are required. Crazy Tape has a strong adhesive on one
                side and a fabric material on the other. This gives you the
                ability to add additional structural integrity to the seam with
                the adhesive, while the fabric on top is designed to allow the
                Crazy Seal System to adhere to it. This combination allows you
                many different possibilities for repair on your roof.
                Dimensions are 4&Prime; x 25&prime;.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                You will see Crazy Tape in our{' '}
                <a
                  href="/direct-to-deck-kit"
                  className="text-accent font-semibold hover:underline"
                >
                  Direct to Deck Kits
                </a>
                . If you are going directly to wood decking, Crazy Tape will
                help you permanently seal your seams.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                <span className="font-semibold text-primary">Color Options:</span>{' '}
                Charcoal Gray
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                <span className="font-semibold text-primary">Net Contents:</span>{' '}
                25 Foot Rolls, 4 Inches Wide
              </p>
              <LinkButton href={SHOP_URL} variant="accent" size="md" external>
                Shop Crazy Tape
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
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
