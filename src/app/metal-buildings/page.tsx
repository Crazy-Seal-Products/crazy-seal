import type { Metadata } from 'next'
import { ArrowRight, Phone, ShoppingCart } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'DIY Roofing for Metal Buildings',
  description: 'Seal your own metal building roof with the Crazy Seal DIY Roofing System.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp-400x400.jpg`,
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    photo: `${MEDIA}/2019/07/Metal-Closeup-400x400.jpg`,
    text: "I loved the product. I'd recommend it to anybody!",
  },
  {
    name: 'Philip Posey, Tuscumbia, AL',
    photo: `${MEDIA}/2021/11/Philip-Posey-400x400-1.jpg`,
    text: 'We could not be more pleased with the Crazy Seal product.',
  },
  {
    name: 'Douglas Evans, Overton, NV',
    photo: `${MEDIA}/2020/05/Doug-Evans-400x400.jpg`,
    text: 'After viewing the videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

export default function MetalBuildingsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-18 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              The Crazy Seal Roofing System
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Metal Buildings
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-highlight mb-6 max-w-2xl mx-auto">
              Seal your own metal building roof with the Crazy Seal DIY Roofing System.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="lg" external>
                <ShoppingCart className="w-5 h-5" />
                Shop Kits
              </LinkButton>
              <LinkButton href="/pricing" variant="white" size="lg">
                Get an Instant Quote
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── COMMERCIAL LINK ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading
            heading="Facilities of all kinds with flat roofs are using Crazy Seal"
            subheading="Learn more about the Crazy Seal Roofing System for commercial flat roofs."
          />
          <LinkButton href="/commercial-roofing" variant="primary" size="md">
            Commercial Flat Roofs
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Let&apos;s Get In Touch
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="white" size="lg">
              Get an Instant Quote
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
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
