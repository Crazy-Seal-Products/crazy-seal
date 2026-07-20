import type { Metadata } from 'next'
import {
  ArrowRight,
  BadgeDollarSign,
  Link2,
  Phone,
  Repeat,
  UserPlus,
  Wrench,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { VideoPlayer } from '../build-your-own-kit/VideoPlayer'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const AFFILIATE_PANEL = 'https://s2.affiliatly.com/af-1058995/affiliate.panel'

export const metadata: Metadata = {
  title: 'Affiliates',
  description:
    'Earn big referring the Crazy Seal Roofing System. Sign up as an affiliate and earn ongoing 5% commissions as you refer customers to our online store, with recurring commissions on every repeat order.',
}

const STEPS = [
  {
    icon: <UserPlus className="w-8 h-8 text-accent" />,
    step: 'Step 1',
    title: 'Enroll',
    subtitle: 'Become an Affiliate',
    text: 'Becoming an affiliate is as easy as entering your information into our system. Click the button below to begin.',
    cta: 'Sign Up',
  },
  {
    icon: <Link2 className="w-8 h-8 text-accent" />,
    step: 'Step 2',
    title: 'Refer Customers',
    subtitle: 'Share Your Unique Affiliate Link',
    text: 'Once you\u2019re signed up as a Crazy Seal affiliate, you will have your own unique affiliate link to share with the world!',
    cta: 'Sign Up',
  },
  {
    icon: <BadgeDollarSign className="w-8 h-8 text-accent" />,
    step: 'Step 3',
    title: 'Get Paid',
    subtitle: 'Get Paid for Each Referral',
    text: 'Earn commissions on every sale made through your affiliate link and easily track your commissions in your affiliate portal.',
    cta: 'Sign In',
  },
]

export default function AffiliatesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                  Affiliates
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Earn Big Referring the Crazy Seal Roofing System
                </h1>
                <p className="text-white/60 leading-relaxed mb-6">
                  You asked for it and we delivered! You can now sign up as an
                  affiliate and earn ongoing commissions as you refer customers
                  to our online store.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={AFFILIATE_PANEL} variant="accent" size="lg" external>
                    <UserPlus className="w-5 h-5" />
                    Sign Up
                  </LinkButton>
                  <LinkButton href="/contact" variant="white" size="lg">
                    Contact Us
                  </LinkButton>
                </div>
              </div>
              <VideoPlayer
                youtubeId="4MJKPy9_cJs"
                title="Crazy Seal affiliate program video"
                caption="Click to Watch Video (2:23)"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── 3 SIMPLE STEPS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="3 Simple Steps to Make Money With Our Affiliate Program" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  {step.icon}
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">
                  {step.step}
                </p>
                <h3 className="text-xl font-bold text-primary uppercase mb-1">
                  {step.title}
                </h3>
                <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {step.subtitle}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{step.text}</p>
                <LinkButton
                  href={AFFILIATE_PANEL}
                  variant="accent"
                  size="sm"
                  external
                  className="mt-auto"
                >
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
                How It Works
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Every affiliate receives a unique affiliate ID number. Your
                unique affiliate link is generated and tracked using this
                number. You can easily access your link and even generate other
                links in your affiliate portal.
              </p>
              <p className="text-gray-600 leading-relaxed">
                When you enroll as an affiliate, you&apos;ll have immediate
                access to resources to help you promote our system to your
                audience. You&apos;ll also receive access to our affiliate
                portal, where you can see your unique handle, generate referral
                links, track your traffic, and monitor your sales and
                commissions.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/07/Affiliate-Icon-1024x683.png`}
                alt="Crazy Seal affiliate portal"
                className="rounded-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── GETTING PAID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/11/5-Percent-1024x1024.png`}
                alt="Earn 5 percent commission on every referral order"
                className="rounded-2xl w-full max-w-sm mx-auto h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase mb-4">
                Getting Paid
              </h2>
              <p className="text-white/60 leading-relaxed">
                You will receive 5% of every order made through your affiliate
                link. Our affiliate commissions are paid on every new customer
                that you send our way! Just send them to our site with your
                unique affiliate link, and you will get paid when they buy any
                kit or product on our site.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── RECURRING COMMISSIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              <Repeat className="w-4 h-4 inline mr-1 -mt-0.5" />
              Recurring Commissions
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
              Get Paid More With Recurring Commissions
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              But that&apos;s not all! We also do business with professional
              partners. These people install our seamless roofing system
              professionally and buy kit after kit after kit as they complete
              more and more jobs for their clients.
            </p>
            <p className="text-gray-600 leading-relaxed">
              With our affiliate program, you can earn ongoing commissions time
              and time again as the customers that you refer continue to place
              orders. This is tracked by their email address beyond the first
              time you make a sale. In this way, you can earn hundreds or even
              thousands of dollars over time on the purchases of a single
              customer!
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              `${MEDIA}/2022/11/Single-Customer-1-1024x576.jpg`,
              `${MEDIA}/2022/11/Single-Customer-2-1024x576.jpg`,
              `${MEDIA}/2022/11/Single-Customer-3-1024x576.jpg`,
            ].map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                src={src}
                alt={`Recurring commissions from a single customer, example ${i + 1}`}
                className="rounded-2xl w-full h-auto"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── OUR TOOLS, YOUR PROFIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                <Wrench className="w-4 h-4 inline mr-1 -mt-0.5" />
                Resources
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight uppercase mb-4">
                Our Tools, Your Profit!
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                You asked for it and we delivered! You can now sign up as an
                affiliate and earn ongoing commissions as you refer customers
                to our online store.
              </p>
              <LinkButton href="/professional-tools" variant="accent" size="md">
                Click Here For Access to Professional Tools
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/05/Crazy-Seal-RV-1024x512.png`}
                alt="Crazy Seal applied to an RV roof"
                className="rounded-2xl w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HYBRID ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`}
                alt="Crazy Seal Hybrid Roof System kit"
                className="rounded-2xl w-full h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase mb-4">
                The Crazy Seal Hybrid Roof System
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Crazy Seal&apos;s hybrid roof is the most advanced system ever
                developed! Originally developed for RV&apos;s, it had to be
                better for vehicles that were twisting, turning, starting,
                stopping, &amp; screaming down the highway at 70 miles per hour
                in all types of environments.
              </p>
              <p className="text-white/60 leading-relaxed mb-6">
                Imagine taking roofing fabric and infusing it with the highest
                grade silicone money can buy. As each piece of the Crazy Seal
                System cures, fiber strands bond to each other in a complex
                interstitial network that delivers the strength of roofing
                fabric with the durability, flexibility, and longevity of
                silicone. The result is a seamless, fiber reinforced roofing
                membrane that is waterproof, highly reflective, scratch
                resistant, flexible, tough, and maintenance free.
              </p>
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 py-10 sm:py-16 px-5 sm:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Get Started Today
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4 tracking-tight max-w-3xl mx-auto">
            Thousands of people are already solving their roofing problems with
            Crazy Seal. Get started today getting paid when they buy through
            your affiliate link.
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href={AFFILIATE_PANEL} variant="accent" size="lg" external>
              <UserPlus className="w-5 h-5" />
              Sign Up
            </LinkButton>
            <LinkButton href="/contact" variant="primary" size="lg">
              Contact Us
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
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
