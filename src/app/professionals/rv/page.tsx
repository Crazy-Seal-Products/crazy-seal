import type { Metadata } from 'next'
import { ArrowRight, BadgeDollarSign, Check, Phone, ShieldCheck, Truck } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { GlowOrb, Stagger, StaggerItem } from '@/components/motion'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { ProContactSection } from '@/components/pro/ProContactSection'
import {
  MEDIA,
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

const HERO_TRUST = [
  { icon: BadgeDollarSign, label: 'No franchise fees' },
  { icon: Truck, label: 'Free on-demand shipping' },
  { icon: ShieldCheck, label: '50 Year Warranty' },
]

const SYSTEM_TRAITS = ['RVs & trailers', 'Transportation', 'Residential flat roofs', 'Commercial flat roofs']

export default function RvProfessionalsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 text-center">
            <h1
              className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-4"
              style={{ animationDelay: '80ms' }}
            >
              RV <span className="text-shimmer-highlight">Professionals</span>
            </h1>
            <p
              className="animate-fade-up text-xl sm:text-2xl font-bold text-white mb-4"
              style={{ animationDelay: '160ms' }}
            >
              Increase profits with Crazy Seal
            </p>
            <p
              className="animate-fade-up text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8 text-pretty"
              style={{ animationDelay: '220ms' }}
            >
              More people ask for a professionally installed Crazy Seal roof every single day. Let&apos;s
              talk about your business and how we can work together to increase your profits.
            </p>
            <div
              className="animate-fade-up flex flex-wrap items-center justify-center gap-4"
              style={{ animationDelay: '300ms' }}
            >
              <LinkButton href="#pro-contact" variant="accent" size="lg">
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
            <ul
              className="animate-fade-up flex flex-wrap justify-center gap-x-6 gap-y-2 mt-9"
              style={{ animationDelay: '380ms' }}
            >
              {HERO_TRUST.map(({ icon: Icon, label }) => (
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

      {/* ─── VIDEO + PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <ProYouTubeEmbed videoId="PRhpGHn-J3s" title="Crazy Seal Professional Opportunities video" />
              <p className="text-center text-sm font-semibold text-gray-500 mt-4">
                Watch our Professional Opportunities video (4:00)
              </p>
            </div>
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="The Crazy Seal Pro Network"
                heading="Join Our Network for Professional Perks"
                align="left"
                className="mb-6 text-center md:text-left"
              />
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
                {PERKS.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white px-4 py-3 ring-1 ring-primary/[0.08]"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-sm font-semibold text-gray-800">{perk}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="#pro-contact" variant="primary" size="lg">
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="md:order-2">
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="Crazy Seal full overview video"
                caption="Watch our video for a full overview!"
              />
            </div>
            <div className="md:order-1 text-center md:text-left">
              <SectionHeading
                eyebrow="DIY Roofing Done Right"
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 leading-relaxed mb-4 md:text-lg">
                A revolutionary, fluid-applied, seamless roofing system that permanently seals flat and
                low-slope roofs &mdash; simplifying roofing so just about anyone can install it.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our chemical strategists and product testing teams spent years developing what may well be
                the strongest fluid-applied roofing membrane ever brought to market, backed by our 50
                year warranty.
              </p>
              <Stagger className="flex flex-wrap justify-center md:justify-start gap-2" stagger={0.06}>
                {SYSTEM_TRAITS.map((trait) => (
                  <StaggerItem key={trait}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08]">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {trait}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProQuickLinks />
        </div>
      </Container>

      {/* ─── NEW LEADS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProNewLeads />
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProApplications />
        </div>
      </Container>

      {/* ─── TRAILER LIFE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div data-reveal>
          <ProTrailerLife />
        </div>
      </Container>

      {/* ─── PROFIT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <GlowOrb className="-right-24 -top-24 h-72 w-72" color="rgb(249 234 28 / 0.18)" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-7 text-balance">
              Let&apos;s talk about <span className="text-shimmer-highlight">increasing your profits!</span>
            </h2>
            <LinkButton href="#pro-contact" variant="accent" size="lg">
              Start a Conversation
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProTestimonials />
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <ProContactSection id="pro-contact" sourcePage="professionals-rv" />

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
