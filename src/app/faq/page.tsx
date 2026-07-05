import type { Metadata } from 'next'
import { ArrowRight, Download, Phone } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
  YouTubeEmbed,
} from '@/lib/design-system'
import { CrazySealFAQ } from './CrazySealFAQ'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'You have questions and we want to answer them. The Crazy Seal system is 100% guaranteed. Find out how we can be so confident in our products.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
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

export default function FAQPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              FAQ&apos;s
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Please browse the question and answer dropdowns below to see if
              your specific question is in writing. If you still have
              questions, please feel free to contact us and one of our
              representatives will be with you shortly.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── FAQ ACCORDION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Frequently Asked Questions" />
          <div className="max-w-3xl mx-auto">
            <CrazySealFAQ />
          </div>
        </div>
      </Container>

      {/* ─── TIME-LAPSE VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="See It in Action"
            heading="Watch a Full Crazy Seal Installation Time-Lapse"
            subheading="See the entire Crazy Seal System being applied to an RV roof."
            variant="dark"
          />
          <div className="max-w-3xl mx-auto">
            <YouTubeEmbed videoId="d1AG8cfgqQc" variant="card" />
          </div>
        </div>
      </Container>

      {/* ─── BROCHURE DOWNLOAD ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download-1-Small.jpg`}
                alt="Crazy Seal system brochure cover"
                className="rounded-2xl shadow-xl h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Free Download
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                Crazy Seal System
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download a brochure explaining our Crazy Seal system.
              </p>
              <LinkButton
                href={`${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Download
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
              />
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Still Have Questions?
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
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
