import type { Metadata } from 'next'
import { CalendarClock, Mail, MapPin, Percent, Phone, Truck } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'

export const metadata: Metadata = {
  title: '90 Day Return Policy',
  description:
    'Crazy Seal 90 day return policy. Products must be returned within 90 days of purchase. Learn how to return products and report shipping damage.',
}

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

const HERO_FACTS = [
  { icon: CalendarClock, label: '90 days to return' },
  { icon: Percent, label: '20% restocking fee' },
  { icon: Truck, label: 'Report damage within 24 hrs' },
]

export default function ReturnPolicyPage() {
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
              <span className="text-shimmer-highlight">90 Day</span> Return Policy
            </h1>
            <ul
              {...enter(160)}
              className="animate-fade-up mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2"
            >
              {HERO_FACTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── POLICY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight mb-8 md:mb-10 text-center text-balance">
            Our 90 Day Return Policy is as follows:
          </h2>

          <div className="max-w-3xl mx-auto grid grid-cols-1 gap-4">
            <div className="group flex items-start gap-4 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:shadow-lg">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-primary mb-2">
                  Products must be returned within 90 days of purchase. The
                  customer is responsible for all shipping costs incurred with
                  returns.
                </h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Please return your products with your order information to:
                </p>
                <p className="inline-block rounded-2xl bg-white px-4 py-3 font-semibold leading-relaxed text-gray-800 shadow-sm ring-1 ring-primary/10">
                  Crazy Seal Products, Inc. Shipping Facility
                  <br />
                  301 Walnut Springs Rd.
                  <br />
                  Lindale, TX 75771
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:shadow-lg">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                <Percent className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  There is a 20% restocking fee on all returned orders.
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Once your return is received to the facility, we will process
                  a refund after subtracting 20% for the restocking fee.
                </p>
              </div>
            </div>

            <div className="group flex items-start gap-4 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 sm:p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:shadow-lg">
              <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                <Truck className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Orders Damaged During Shipping
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Any package(s) that are damaged during shipment need to be
                  reported to Crazy Seal support within 24 hours of delivery.
                  Crazy Seal is not responsible for shipping damage reported
                  outside of that time frame. We ship with Fedex and have
                  protocols in place to get you fresh product quickly, but they
                  are only valid with our shipping company if notified of
                  damage in a certain time window. Please email us with photos
                  of the damaged shipment at{' '}
                  <a
                    href="mailto:support@crazyseal.com"
                    className="text-primary font-semibold hover:underline"
                  >
                    support@crazyseal.com
                  </a>{' '}
                  within 24 hours of delivery.
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3">
            <a
              href="tel:8009630131"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-primary shadow-sm ring-1 ring-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
            >
              <Phone className="h-4 w-4 text-accent" />
              (800) 963-0131
            </a>
            <a
              href="mailto:support@crazyseal.com"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-semibold text-primary shadow-sm ring-1 ring-primary/15 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
            >
              <Mail className="h-4 w-4 text-accent" />
              support@crazyseal.com
            </a>
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
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
