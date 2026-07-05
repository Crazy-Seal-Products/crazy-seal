import type { Metadata } from 'next'
import { Mail, MapPin, Percent, Phone, Truck } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'

export const metadata: Metadata = {
  title: '90 Day Return Policy',
  description:
    'Crazy Seal 90 day return policy. Products must be returned within 90 days of purchase. Learn how to return products and report shipping damage.',
}

export default function ReturnPolicyPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              90 Day Return Policy
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── POLICY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-8 text-center">
            Our 90 Day Return Policy is as follows:
          </h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-primary mb-2">
                  Products must be returned within 90 days of purchase. The
                  customer is responsible for all shipping costs incurred with
                  returns.
                </h3>
                <p className="text-gray-600 leading-relaxed mb-3">
                  Please return your products with your order information to:
                </p>
                <p className="text-gray-800 font-semibold leading-relaxed">
                  Crazy Seal Products, Inc. Shipping Facility
                  <br />
                  301 Walnut Springs Rd.
                  <br />
                  Lindale, TX 75771
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                <Percent className="w-6 h-6 text-primary" />
              </div>
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

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6 text-primary" />
              </div>
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

            <div className="border-t border-gray-200 pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-600">
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 hover:text-primary font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent" />
                (800) 963-0131
              </a>
              <a
                href="mailto:support@crazyseal.com"
                className="flex items-center gap-2 hover:text-primary font-semibold transition-colors"
              >
                <Mail className="w-5 h-5 text-accent" />
                support@crazyseal.com
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden py-10 sm:py-16 px-5 sm:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Let&apos;s Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="white" size="lg">
              Get an Instant Quote
            </LinkButton>
          </div>
        </div>
      </Container>
    </>
  )
}
