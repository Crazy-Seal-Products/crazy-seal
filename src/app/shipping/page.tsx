import type { Metadata } from 'next'
import { MapPin, Phone, Truck, PackageCheck, Flag } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'

export const metadata: Metadata = {
  title: 'Shipping',
  description:
    'Crazy Seal shipping policy. Our free shipping policy applies to the continental USA only. Orders shipped outside this area will be charged normal shipping rates.',
}

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

export default function ShippingPage() {
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
              className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
            >
              Shipping
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── SHIPPING POLICY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 sm:py-14 md:p-10 lg:p-14">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative mx-auto mb-6 grid h-20 w-20 place-items-center">
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-accent/15 animate-pulse-ring" />
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent animate-float">
                <Truck className="h-8 w-8" />
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight mb-4">
              Shipping Policy
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Our free shipping policy applies to the continental USA only.
              Orders shipped outside this area will be charged normal shipping
              rates.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-3 ring-1 ring-primary/[0.06] sm:grid-cols-3">
            {[
              { icon: MapPin, title: 'Continental USA', desc: 'Covered by our free shipping policy' },
              { icon: PackageCheck, title: 'Outside that area', desc: 'Normal shipping rates apply' },
              { icon: Flag, title: 'Made in the USA', desc: 'Ships direct to your door' },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-center gap-3.5 rounded-2xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-primary/[0.06] transition-all duration-300 hover:shadow-md"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-primary">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden py-10 sm:py-16 px-5 sm:px-8 text-center">
          <GlowOrb className="-right-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 tracking-tight text-balance">
              Have Any Questions? Our Crazy Seal Specialists Can Help!
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <LinkButton href="/contact" variant="accent" size="lg">
                Contact Us
              </LinkButton>
              <LinkButton href="/kit-builder" variant="white" size="lg">
                Build My Kit
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
