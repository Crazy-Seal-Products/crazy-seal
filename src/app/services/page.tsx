import type { Metadata } from 'next'
import { Wrench, Shield, MapPin, CheckCircle } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
} from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { QuoteCta } from '@/components/QuoteButton'

export const metadata: Metadata = {
  title: 'Services | RV ARMOR',
  description: 'RV Armor provides permanent roofing for all RV types. Custom-manufactured on-site with lifetime warranty.',
}

const ROOF_TYPES = [
  'Aluminum',
  'EPDM Rubber',
  'Fiberglass',
  'TPO',
  'Vinyl',
  'Wood',
  'Metal',
]

export default function ServicesPage() {
  return (
    <>
      {/* ─── HERO (card, dark) ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="relative z-10 py-12 sm:py-16 md:py-20 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              What We Do
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              Our Services
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-3">
              Imagine never having to get up on the roof of your RV ever again!
            </p>
            <p className="text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
              The RV Armor Roofing System is a seamless, permanent RV roof with a lifetime
              guarantee that can be installed anywhere in the continental US at your location. Our convenient,
              affordable, and attractive roofing system is the last RV roof you will ever need, guaranteed!
            </p>
          </div>
        </div>
      </Container>

      {/* ─── SERVICES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Core Services" heading="Everything You Need" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              icon={<Wrench className="w-6 h-6 text-primary" />}
              title="Permanent Roof Installation"
              description="Our proprietary multi-layer membrane is custom-manufactured directly on your RV. Seamless, leak-free, maintenance-free protection."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-primary" />}
              title="Lifetime Warranty Included"
              description="Every installation includes our lifetime warranty covering materials and labor. Fully transferable to the next owner."
            />
            <FeatureCard
              icon={<MapPin className="w-6 h-6 text-primary" />}
              title="Nationwide Mobile Service"
              description="We come to you. Driveway, campground, storage facility, or wherever your RV is located in the continental US."
            />
          </Grid>
        </div>
      </Container>

      {/* ─── ROOF TYPES (card, dark) ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Universal Compatibility
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Works on All Roof Types
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-3">
                We work on all makes and models, and all roof types. RV Armor can be applied to
                virtually any RV roof. Our certified technicians assess your specific roof during
                the quote process and tailor the installation to your needs.
              </p>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed">
                We will come to you anywhere in the US you are! All of our technicians are certified,
                so you know you&apos;ll be getting the best roofing system no matter where you are.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ROOF_TYPES.map((type) => (
                <div key={type} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm font-medium text-white">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── READY TO START ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading
            eyebrow="Let's Go"
            heading="Ready to Get Started?"
            subheading="Call us today or fill out our contact form for a free, no-obligation quote."
          />
          <QuoteCta />
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
