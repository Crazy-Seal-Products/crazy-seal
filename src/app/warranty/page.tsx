import type { Metadata } from 'next'
import { Camera, FileText, ShieldCheck, Download, Check, X } from 'lucide-react'
import { Container, Grid, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { WarrantyRegistrationForm } from '@/components/forms/WarrantyRegistrationForm'
import { WarrantyTransferForm } from '@/components/forms/WarrantyTransferForm'
import { WarrantyClaimForm } from '@/components/forms/WarrantyClaimForm'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Crazy Seal Warranty',
  description:
    'The Crazy Seal Roofing System is backed by a 50 year warranty. Register your warranty, transfer an existing warranty, or file a claim.',
}

const STEPS = [
  {
    step: 'STEP 1',
    icon: Camera,
    text: 'Take before and after photos of your application.',
    linkText: 'See Photo Guidelines',
    linkHref: `${MEDIA}/2020/05/Photo-Guidelines.pdf`,
  },
  {
    step: 'STEP 2',
    icon: FileText,
    text: 'Submit our simple warranty form with your before & after photos.',
    linkText: 'Warranty Form',
    linkHref: '#warranty-form',
  },
  {
    step: 'STEP 3',
    icon: ShieldCheck,
    text: 'Congratulations! Your application is covered for 50 years!',
    linkText: 'Warranty PDF',
    linkHref: `${MEDIA}/2021/04/Warranty-Certificate-2021.pdf`,
  },
]

const COMPARISON = {
  crazySeal: [
    '50 Year Warranty',
    'We Ship to You',
    'Install Anywhere',
    'No Upkeep',
  ],
  otherGuys: [
    'Pro-Rated or No Warranty',
    'You Wait for Them',
    'Specific Locations',
    'Maintenance Required',
  ],
}

export default function WarrantyPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Crazy Seal <span className="text-highlight">Warranty</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-6">
              Do it once. Do it right. The Crazy Seal Roofing System is backed
              by a 50 year warranty — the strongest in the business.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="#warranty-form" variant="accent" size="lg">
                Register Your Warranty
              </LinkButton>
              <LinkButton
                href={`${MEDIA}/2021/04/Warranty-Certificate-2021.pdf`}
                variant="outline-white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                View Warranty PDF
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HOW TO RECEIVE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="How to Receive Your Warranty"
            subheading="Three simple steps to 50 years of coverage."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {STEPS.map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-6 h-6 text-accent" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">{s.step}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{s.text}</p>
                <a
                  href={s.linkHref}
                  target={s.linkHref.startsWith('http') ? '_blank' : undefined}
                  rel={s.linkHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                  {s.linkText}
                </a>
              </div>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── REGISTRATION FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div id="warranty-form" className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24">
          <SectionHeading
            eyebrow="50 Years of Coverage"
            heading="Fill Out Your Warranty Form"
            subheading="Submit your registration with before & after photos and your application is covered."
          />
          <div className="max-w-2xl mx-auto">
            <WarrantyRegistrationForm />
          </div>
        </div>
      </Container>

      {/* ─── COMPARISON ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="How the Crazy Seal Warranty Compares"
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl bg-white p-6 lg:p-8">
              <h3 className="text-xl font-bold text-primary mb-4 text-center">Crazy Seal</h3>
              <ul className="space-y-3">
                {COMPARISON.crazySeal.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-accent" />
                    </span>
                    <span className="font-semibold text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8">
              <h3 className="text-xl font-bold text-white/70 mb-4 text-center">The Other Guys</h3>
              <ul className="space-y-3">
                {COMPARISON.otherGuys.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-red-400" />
                    </span>
                    <span className="font-semibold text-white/60">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── TRANSFER FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div id="warranty-transfer" className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24">
          <SectionHeading
            eyebrow="Bought a Rig With a Crazy Seal Roof?"
            heading="Need to Transfer an Existing Warranty?"
            subheading="Fill out our simple form and we'll move the coverage into your name."
          />
          <div className="max-w-2xl mx-auto">
            <WarrantyTransferForm />
          </div>
        </div>
      </Container>

      {/* ─── CLAIM FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div id="warranty-claim" className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24">
          <SectionHeading
            eyebrow="We've Got You Covered"
            heading="In the Unlikely Event You Need to File a Claim..."
            subheading="Tell us what's going on and our team will make it right."
          />
          <div className="max-w-2xl mx-auto">
            <WarrantyClaimForm />
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
