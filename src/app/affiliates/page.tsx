import type { Metadata } from 'next'
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  Link2,
  Phone,
  UserPlus,
  Percent,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CountUp, GlowOrb, Stagger, StaggerItem } from '@/components/motion'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { ProContactSection } from '@/components/pro/ProContactSection'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const AFFILIATE_PANEL = 'https://s2.affiliatly.com/af-1058995/affiliate.panel'

export const metadata: Metadata = {
  title: 'Affiliates',
  description:
    'Earn big referring the Crazy Seal Roofing System. Sign up as an affiliate and earn ongoing 5% commissions as you refer customers to our online store, with recurring commissions on every repeat order.',
}

const STEPS = [
  {
    icon: UserPlus,
    step: 'Step 1',
    title: 'Enroll',
    subtitle: 'Become an Affiliate',
    text: 'Becoming an affiliate is as easy as entering your information into our system.',
    cta: 'Sign Up',
  },
  {
    icon: Link2,
    step: 'Step 2',
    title: 'Refer Customers',
    subtitle: 'Share Your Unique Affiliate Link',
    text: 'Once you’re signed up, you’ll have your own unique affiliate link to share with the world!',
    cta: 'Sign Up',
  },
  {
    icon: BadgeDollarSign,
    step: 'Step 3',
    title: 'Get Paid',
    subtitle: 'Get Paid for Each Referral',
    text: 'Earn commissions on every sale made through your link and track them in your affiliate portal.',
    cta: 'Sign In',
  },
]

const HERO_CHIPS = ['5% of every order', 'Recurring commissions', 'Your own affiliate portal']

const PORTAL_FEATURES = [
  'Immediate access to resources to promote our system',
  'See your unique handle and generate referral links',
  'Track your traffic and monitor your sales and commissions',
]

const MEMBRANE_TRAITS = ['Waterproof', 'Highly reflective', 'Scratch resistant', 'Flexible', 'Tough', 'Maintenance free']

export default function AffiliatesPage() {
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
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-12 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.05fr] gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1
                  className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance"
                  style={{ animationDelay: '80ms' }}
                >
                  Earn Big Referring the{' '}
                  <span className="text-shimmer-highlight">Crazy Seal Roofing System</span>
                </h1>
                <p
                  className="animate-fade-up text-base sm:text-lg text-white/70 leading-relaxed mb-7 text-pretty"
                  style={{ animationDelay: '160ms' }}
                >
                  You asked for it and we delivered! Sign up as an affiliate and earn ongoing commissions
                  as you refer customers to our online store.
                </p>
                <div
                  className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
                  style={{ animationDelay: '240ms' }}
                >
                  <LinkButton href={AFFILIATE_PANEL} variant="accent" size="lg" external>
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </LinkButton>
                  <LinkButton href="/contact" variant="white" size="lg">
                    Contact Us
                  </LinkButton>
                </div>
                <ul
                  className="animate-fade-up flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8"
                  style={{ animationDelay: '320ms' }}
                >
                  {HERO_CHIPS.map((label) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                        <Check className="h-3.5 w-3.5 text-accent-light" strokeWidth={3} />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="animate-fade-up relative" style={{ animationDelay: '200ms' }}>
                <ProYouTubeEmbed
                  videoId="4MJKPy9_cJs"
                  title="Crazy Seal affiliate program video"
                  caption="Click to Watch Video (2:23)"
                />
                <span className="absolute -right-3 -top-4 hidden md:inline-flex items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float">
                  <Percent className="h-4 w-4" />
                  5% on every order
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── 3 SIMPLE STEPS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Enroll → Refer → Get Paid" heading="3 Simple Steps to Make Money With Our Affiliate Program" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.title}
                className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 md:p-8 text-center ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-4 text-8xl font-extrabold leading-none text-primary/[0.05] font-[family-name:var(--font-display)]"
                >
                  {i + 1}
                </span>
                <span className="relative mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <step.icon className="h-7 w-7" />
                </span>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-dark mb-1">{step.step}</p>
                <h3 className="text-xl font-extrabold text-primary mb-1">{step.title}</h3>
                <p className="text-sm font-semibold text-gray-500 mb-3">{step.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{step.text}</p>
                <LinkButton href={AFFILIATE_PANEL} variant="accent" size="sm" external className="mt-auto">
                  {step.cta}
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── HOW IT WORKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Your Affiliate Portal"
                heading="How It Works"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 leading-relaxed mb-6 md:text-lg">
                Every affiliate receives a unique affiliate ID number, which generates and tracks your
                unique affiliate link. Access your link, or generate others, anytime in your portal.
              </p>
              <ul className="mx-auto w-fit space-y-3 text-left md:mx-0">
                {PORTAL_FEATURES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/07/Affiliate-Icon-1024x683.png`}
                alt="Crazy Seal affiliate portal"
                className="relative rounded-3xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── GETTING PAID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative mx-auto w-full max-w-sm">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-full bg-gradient-to-br from-highlight/30 to-accent/30 blur-3xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/11/5-Percent-1024x1024.png`}
                alt="Earn 5 percent commission on every referral order"
                className="relative w-full h-auto rounded-3xl animate-float-slow"
              />
            </div>
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Commission"
                heading="Getting Paid"
                variant="dark"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-6xl sm:text-7xl font-extrabold text-highlight mb-2 font-[family-name:var(--font-display)]">
                <CountUp value={5} suffix="%" />
              </p>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/60 mb-5">
                of every order through your link
              </p>
              <p className="text-white/70 leading-relaxed md:text-lg">
                Commissions are paid on every new customer you send our way. Just send them to our site
                with your unique affiliate link, and you get paid when they buy any kit or product.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── RECURRING COMMISSIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-4 text-balance">
              Get Paid More With Recurring Commissions
            </h2>
            <p className="text-gray-600 leading-relaxed md:text-lg">
              But that&apos;s not all! Our professional partners buy kit after kit as they complete more
              jobs for their clients. You earn ongoing commissions every time the customers you refer
              place another order, tracked by their email address beyond the first sale. That can add up
              to hundreds or even thousands of dollars from a single customer!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              `${MEDIA}/2022/11/Single-Customer-1-1024x576.jpg`,
              `${MEDIA}/2022/11/Single-Customer-2-1024x576.jpg`,
              `${MEDIA}/2022/11/Single-Customer-3-1024x576.jpg`,
            ].map((src, i) => (
              <div
                key={src}
                className="group overflow-hidden rounded-3xl shadow-md ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Recurring commissions from a single customer, example ${i + 1}`}
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── OUR TOOLS, YOUR PROFIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-extrabold text-primary tracking-tight mb-4">
                Our Tools, Your Profit!
              </h2>
              <p className="text-gray-600 leading-relaxed mb-7 md:text-lg">
                Downloadable videos, PDFs and sales resources to help you promote the Crazy Seal system.
              </p>
              <LinkButton href="/professional-tools" variant="accent" size="md">
                Click Here For Access to Professional Tools
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
            <div className="group relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-primary/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/05/Crazy-Seal-RV-1024x512.png`}
                alt="Crazy Seal applied to an RV roof"
                className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HYBRID ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative rounded-3xl bg-white p-4 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`}
                alt="Crazy Seal Hybrid Roof System kit"
                className="w-full h-auto transition-transform duration-700 hover:scale-[1.04]"
              />
            </div>
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Advanced Technology"
                heading="The Crazy Seal Hybrid Roof System"
                variant="dark"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-white/70 leading-relaxed mb-4">
                The most advanced system we&apos;ve ever developed. Originally built for RV&apos;s, it had
                to hold up on vehicles twisting, turning, starting, stopping, &amp; screaming down the
                highway at 70 miles per hour in all types of environments.
              </p>
              <p className="text-white/70 leading-relaxed mb-6">
                Roofing fabric infused with the highest grade silicone money can buy. As it cures, fiber
                strands bond into a seamless, fiber reinforced membrane with the strength of fabric and
                the durability, flexibility and longevity of silicone.
              </p>
              <Stagger className="flex flex-wrap justify-center md:justify-start gap-2 mb-8" stagger={0.06}>
                {MEMBRANE_TRAITS.map((trait) => (
                  <StaggerItem key={trait}>
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15">
                      {trait}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
              <LinkButton href="/" variant="white" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── GET STARTED ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-white border-y sm:border border-gray-200/80 overflow-hidden py-10 sm:py-14 px-5 sm:px-8 text-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/15 to-transparent blur-3xl"
          />
          <h2 className="relative text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-7 tracking-tight max-w-3xl mx-auto text-balance">
            Thousands of people are already solving their roofing problems with Crazy Seal. Get paid
            when they buy through your affiliate link.
          </h2>
          <div className="relative flex flex-wrap items-center justify-center gap-3">
            <LinkButton href={AFFILIATE_PANEL} variant="accent" size="lg" external>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </LinkButton>
            <LinkButton href="#affiliate-inquiry" variant="primary" size="lg">
              Have Questions First?
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 text-accent" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>

      {/* ─── AFFILIATE INQUIRY FORM ─── */}
      <ProContactSection
        id="affiliate-inquiry"
        eyebrow="Not Ready to Sign Up?"
        heading="Talk to Us About Referring Crazy Seal"
        subheading="Tell us about your audience or business and we'll help you pick the best way to earn."
        points={['Affiliate links', 'Dealer program', 'Or both']}
        sourcePage="affiliates"
        buttonLabel="Talk to Us"
      />
    </>
  )
}
