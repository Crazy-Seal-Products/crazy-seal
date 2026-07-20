import type { Metadata } from 'next'
import { Phone, Truck } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'

export const metadata: Metadata = {
  title: 'Shipping',
  description:
    'Crazy Seal shipping policy. Our free shipping policy applies to the continental USA only. Orders shipped outside this area will be charged normal shipping rates.',
}

export default function ShippingPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Shipping
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── SHIPPING POLICY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-14 md:p-10 lg:p-14">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <Truck className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-4">
              Shipping Policy
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our free shipping policy applies to the continental USA only.
              Orders shipped outside this area will be charged normal shipping
              rates.
            </p>
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
