import type { Metadata } from 'next'
import { Check, Phone } from 'lucide-react'
import { Container, SectionHeading, LinkButton, YouTubeEmbed } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'
import { CtaSection } from '@/components/CtaSection'
import {
  ProTestimonials,
  ProApplications,
  ProQuickLinks,
  ProNewLeads,
  ProTrailerLife,
} from '@/components/pro/ProSections'

export const metadata: Metadata = {
  title: 'RV Professionals',
  description:
    'RV Professionals: increase profits with Crazy Seal. Join our network for professional perks including no franchise fees, no inventory requirements, free on-demand shipping, new leads, and discounts for high volume users.',
}

const PERKS = [
  'No Franchise Fees',
  'No Inventory Requirements',
  'Fast, Free On-Demand Shipping',
  '50 Year Warranty on All Kits and Products',
  'New Leads for Your Business',
  'Discounts for High Volume Users',
]

export default function RvProfessionalsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              RV <span className="text-highlight">Professionals</span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Increase profits with Crazy Seal
            </p>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-6">
              More and more people are asking for a professionally installed
              Crazy Seal roofing system every single day! We&apos;d love to have a
              conversation about your business to see how we can work together
              to increase your profits.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="#pro-contact" variant="accent" size="lg">
                Start a Conversation
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
        </div>
      </Container>

      {/* ─── VIDEO + PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <YouTubeEmbed videoId="PRhpGHn-J3s" variant="card" />
              <p className="text-center text-sm font-semibold text-gray-500 mt-3">
                Watch our Professional Opportunities video (4:00)
              </p>
            </div>
            <div>
              <SectionHeading
                eyebrow="The Crazy Seal Pro Network"
                heading="Join Our Network for Professional Perks"
                align="left"
                className="mb-5"
              />
              <ul className="space-y-3 mb-6">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-accent" />
                    </span>
                    <span className="font-semibold text-gray-800">{perk}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="#pro-contact" variant="primary" size="lg">
                Start a Conversation
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <YouTubeEmbed videoId="C5FvTulPDaY" variant="card" />
              <p className="text-center text-sm font-semibold text-gray-500 mt-3">
                Watch our video for a full overview!
              </p>
            </div>
            <div>
              <SectionHeading
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                The Crazy Seal Roofing System is a revolutionary, fluid
                applied, seamless roofing system designed to permanently seal
                flat / low slope roofing applications like rv&apos;s,
                transportation vehicles and trailers, residential flat roofs,
                commercial flat roofs, and more! Crazy Seal takes the complex
                world of roofing and simplifies it so that it can be installed
                by just about anyone.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our chemical strategists and product testing teams spent years
                developing what may well be the strongest fluid-applied
                roofing membrane ever brought to market. Now our system is
                here and available to help you complete your seamless roofing
                project, backed by our 50 year warranty.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProQuickLinks />
        </div>
      </Container>

      {/* ─── NEW LEADS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProNewLeads />
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProApplications />
        </div>
      </Container>

      {/* ─── TRAILER LIFE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProTrailerLife />
        </div>
      </Container>

      {/* ─── PROFIT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Let&apos;s talk about increasing your profits!
          </h2>
          <LinkButton href="#pro-contact" variant="accent" size="lg">
            Start a Conversation
          </LinkButton>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProTestimonials />
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="pro-contact"
          className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Let's Get in Touch"
            heading="Have Any Questions? Our Crazy Seal Specialists Can Help!"
            subheading="Fill out the form below and one of our Crazy Seal specialists will be in touch with you shortly. We promise to be fun, informative, and will do our very best to help you!"
          />
          <div className="max-w-2xl mx-auto">
            <ContactForm sourcePage="professionals-rv" />
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
