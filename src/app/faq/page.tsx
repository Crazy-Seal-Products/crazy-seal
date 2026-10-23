import type { Metadata } from 'next'
import {
  ArrowRight,
  Download,
  Flag,
  Headset,
  MessageCircleQuestion,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
  YouTubeEmbed,
} from '@/lib/design-system'
import { CrazySealFAQ } from './CrazySealFAQ'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { QuoteButton } from '@/components/QuoteButton'
import { GlowOrb } from '@/components/motion'

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

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Flag, label: 'Made in the USA' },
  { icon: Headset, label: 'Real specialists, M–F 9AM–6PM EST' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

export default function FAQPage() {
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
              className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance"
            >
              Frequently Asked <span className="text-shimmer-highlight">Questions</span>
            </h1>
            <p
              {...enter(160)}
              className="animate-fade-up text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Browse the answers below. Still have a question? Contact us and a
              representative will be with you shortly.
            </p>
            <ul
              {...enter(240)}
              className="animate-fade-up mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2"
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

      {/* ─── FAQ ACCORDION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Quick Answers" heading="Browse by Topic" />
          <div className="max-w-3xl mx-auto">
            <CrazySealFAQ />
          </div>
        </div>
      </Container>

      {/* ─── TIME-LAPSE VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-right-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <div className="relative">
            <SectionHeading
              eyebrow="See It in Action"
              heading="Watch a Full Crazy Seal Installation Time-Lapse"
              subheading="The entire Crazy Seal System, applied to an RV roof."
              variant="dark"
            />
            <div className="relative max-w-3xl mx-auto">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
              />
              <YouTubeEmbed
                videoId="d1AG8cfgqQc"
                variant="card"
                className="relative shadow-2xl ring-1 ring-white/15"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BROCHURE DOWNLOAD ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-10 lg:gap-14 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-secondary/20 via-transparent to-accent/25 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download-1-Small.jpg`}
                alt="Crazy Seal system brochure cover"
                className="relative rounded-2xl shadow-2xl ring-1 ring-primary/10 h-auto md:max-h-[400px] object-contain -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <SectionHeading
                eyebrow="Free Download"
                heading="Crazy Seal System"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 md:mb-8">
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
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
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── STILL HAVE QUESTIONS / INSTALLER TEASER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <GlowOrb className="-right-20 -bottom-24 h-72 w-72" color="rgb(91 164 17 / 0.22)" />
          <div className="relative">
            <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 animate-float">
              <MessageCircleQuestion className="h-7 w-7 text-highlight" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Still Have Questions?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-7 max-w-xl mx-auto">
              A Crazy Seal specialist can answer anything about your roof — or help you
              find an installer, or become one.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <QuoteButton size="lg" sourcePage="faq" />
              <LinkButton href="/professionals" variant="outline-white" size="lg">
                Become a Dealer
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

      {/* ─── LEAD CAPTURE ─── */}
      <LeadCaptureSection
        sourcePage="faq"
        heading="Planning a Roof Project?"
        subheading="Tell us what you're working on and a specialist will answer your questions and build the right kit with you."
      />
    </>
  )
}
