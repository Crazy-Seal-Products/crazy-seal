import type { Metadata } from 'next'
import { ArrowRight, Phone } from 'lucide-react'
import { Container, Grid, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { InstantQuoteCalculator } from '@/components/InstantQuoteCalculator'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Crazy Seal Pricing',
  description:
    'Get an instant quote for your Crazy Seal roofing kit. On average, the Crazy Seal Roofing System ranges between $3.00-$5.00 per square foot of coverage depending on your application.',
}

const EXAMPLE_PROJECTS = [
  {
    title: "24' Over Existing Membrane",
    kit: '100 - 200 SQ FT Kit',
    pricing: '$745 single layer / $1,195 double layer',
  },
  {
    title: "37' Over Existing Membrane",
    kit: '200 - 300 SQ FT Kit',
    pricing: '$970 single layer / $1,645 double layer',
  },
  {
    title: "45' Over Existing Membrane",
    kit: '300 - 400 SQ FT Kit',
    pricing: '$1,220 single layer / $2,120 double layer',
  },
  {
    title: "10' x 28' Over Existing Metal",
    kit: '200 - 300 SQ FT Kit',
    pricing: '$970 single layer / $1,645 double layer',
  },
  {
    title: "18' Direct To Deck",
    kit: '75 - 150 SQ FT Kit',
    pricing: '$1,552 direct to deck system',
  },
  {
    title: "36' Direct To Deck",
    kit: '225 - 300 SQ FT Kit',
    pricing: '$2,991 direct to deck system',
  },
]

const KIT_TYPES = [
  {
    title: 'Double Layer Kits',
    desc: 'Our most popular kit with double layer protection.',
    href: '/store/double-layer-kit',
  },
  {
    title: 'Direct to Deck Kits',
    desc: 'A special kit for sealing directly over wood decking.',
    href: '/store/direct-to-deck-kit',
  },
  {
    title: 'Commercial Kits',
    desc: 'Custom kits for any size commercial or residential project.',
    href: '/store#commercial-kits',
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own custom kit from our lineup of roofing products.',
    href: '/store#products',
  },
  {
    title: 'Crazy Good Repair Kit',
    desc: 'Kit for small repairs or adding a fixture to a Crazy Seal roof.',
    href: '/store/crazy-good-repair-kit',
  },
  {
    title: 'Work With a Specialist',
    desc: 'Need help building a kit? Our team of experts would love to help!',
    href: '/contact',
  },
]

const APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches.",
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential, sunrooms, storage buildings.',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    href: '/transportation',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
]

export default function PricingPage() {
  return (
    <>
      {/* ─── HERO + CALCULATOR ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
                Pricing
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                On average, the Crazy Seal Roofing System ranges between
                $3.00-$5.00 per square foot of coverage depending on your
                application and coverage rate.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <InstantQuoteCalculator />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EXAMPLE PROJECTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Real Numbers"
            heading="Example Projects & What They Cost"
            subheading="These examples will provide a precise idea on cost based on the application."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {EXAMPLE_PROJECTS.map((project) => (
              <div
                key={project.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-bold text-primary mb-1">{project.title}</h3>
                <p className="text-sm font-semibold text-accent mb-2">{project.kit}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{project.pricing}</p>
              </div>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── KIT TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Choose a Kit Type"
            variant="dark"
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {KIT_TYPES.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
              >
                <h3 className="font-bold text-white mb-2">{kit.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-3">{kit.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                  {kit.href.startsWith('http') ? 'Shop Now' : 'Get in Touch'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </Grid>
          <div className="flex items-center justify-center pt-6 md:pt-8">
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Want to discuss your project? Call (800) 963-0131 — M-F 9AM-6PM EST
            </a>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Choose a Section That Matches Your Application"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.image} alt={app.title} className="w-full h-auto object-cover" />
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
