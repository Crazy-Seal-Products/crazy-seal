import type { Metadata } from 'next'
import {
  ArrowRight,
  Presentation,
  Calculator,
  Repeat,
  Wrench,
  FileCheck,
  TrendingUp,
  RefreshCw,
  Recycle,
  Building2,
  ShoppingCart,
  Phone,
} from 'lucide-react'
import { Container, Grid, SectionHeading, LinkButton, FeatureCard } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'
import { CtaSection } from '@/components/CtaSection'
import { ProTestimonials } from '@/components/pro/ProSections'

export const metadata: Metadata = {
  title: 'Ways To Earn',
  description:
    'Making money with the Crazy Seal Dealer Program. Seamlessly integrate Crazy Seal into your sales cycle with pre-built digital presentation pages, a simple pricing model, and an easy installation.',
}

const STEPS = [
  {
    icon: Presentation,
    step: 'Presentation',
    subheading: 'CUSTOMER PRESENTATION PAGE',
    desc: "Our digital presentation page includes video, pdf's, positive reviews, and other reinforcing materials to help your customers reach a decision.",
    linkText: 'See the Presentation',
    href: '/rv-roofing',
  },
  {
    icon: Calculator,
    step: 'Price It Out',
    subheading: 'GIVE THE CUSTOMER AN IDEA ON COST',
    desc: 'Give your customers a quick idea on cost using your own shop rates or with your own version of our recommended pricing model.',
    linkText: 'See Pricing Model',
    href: '#pricing-model',
  },
  {
    icon: Repeat,
    step: 'Install & Repeat',
    subheading: 'FINISH WITH A SIMPLE INSTALLATION',
    desc: "The Crazy Seal Roofing System is a breeze to install. Visit our installation page to see our suite of installation videos and pdf's.",
    linkText: 'See Installation',
    href: '/installation',
  },
]

const EARNING_AVENUES = [
  {
    icon: Wrench,
    title: 'Consumer Roof Repair',
    desc: "Now that you've entered seamless roofing, you can use this system to increase your repair business. Stop customers from leaving your shop to go to a competitor who offers a seamless roof by offering them Crazy Seal.",
  },
  {
    icon: FileCheck,
    title: 'Insurance Claim Roof Repair',
    desc: 'Insurance companies have caught on to the idea of seamless roofing. Many insurance companies are even starting to prefer this type of roof due to its low cost and longevity. Get this insurance business with a competitive seamless roofing bid directly from your shop.',
  },
  {
    icon: TrendingUp,
    title: 'Upsell During Resealing & UV Treatments',
    desc: 'RV owners often come in requesting UV treatments and resealing. With their treatments scheduled, upsell a job from a couple hundred dollars in profit to a couple thousand dollars in profit by offering a seamless roofing system that is maintenance free so they will never have to come in for UV treatment or resealing again.',
  },
  {
    icon: RefreshCw,
    title: 'Flip An RV Taken In On Trade',
    desc: "Sometimes RV's taken in on trade have less than desirable roofs and many people check this before buying. Get your used units to move faster by installing a seamless roofing system and showing that value to potential buyers.",
  },
  {
    icon: Recycle,
    title: 'Salvage An RV & Resell',
    desc: 'Ever taken in an RV with roof damage? Now you can easily replace wood damage and install a seamless roofing system direct to deck or as a hybrid installation that adheres partially to wood decking and partially to the existing membrane.',
  },
  {
    icon: Building2,
    title: "Not Just For RV's",
    desc: 'Crazy Seal is a perfect fit for all types of small to medium sized flat roofing projects! It is great for roofing contractors who simply want to offer their customers the best flat roofing system money can buy.',
  },
]

export default function WaysToEarnPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Making Money With Our{' '}
              <span className="text-highlight">Dealer Program</span>
            </h1>
            <p className="text-xl sm:text-2xl font-semibold text-white mb-6">
              Seamlessly Integrate Crazy Seal Into Your Sales Cycle
            </p>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-white/60 leading-relaxed mb-6 text-left sm:text-center">
              <p>
                The word is out! With seamless roofing systems on the rise all
                over the roofing industry, people are naturally gravitating
                toward this new, maintenance free option. Especially in the RV
                industry, people love the idea of a &ldquo;one-and-done&rdquo; system.
              </p>
              <p>
                We make it easy to integrate Crazy Seal into your existing
                sales cycle! With our pre-built digital presentation pages, you
                can begin increasing your profitability with ease in 3 simple
                steps.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/contact" variant="accent" size="lg">
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

      {/* ─── 3 SIMPLE STEPS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="3 Simple Steps to Make Money With Our Dealer Program" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <s.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-1">
                  {s.step}
                </h3>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-3">
                  {s.subheading}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.desc}</p>
                <a
                  href={s.href}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                  {s.linkText} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── PRICING MODEL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="pricing-model"
          className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24"
        >
          <SectionHeading
            heading="Pricing Model"
            subheading="We recommend a standard pricing model based on the linear foot of the RV. It typically looks something like this:"
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-wide mb-2">
                24&prime; or smaller
              </p>
              <p className="text-3xl font-bold text-highlight">$3,600</p>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
              <p className="text-white/60 text-sm font-semibold uppercase tracking-wide mb-2">
                25&prime; or longer
              </p>
              <p className="text-3xl font-bold text-highlight">
                $150 <span className="text-lg font-semibold">/ Linear Foot</span>
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 lg:p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-primary mb-4 text-center">
              Here&apos;s an example of how much you could earn now:
            </h3>
            <ul className="space-y-3 text-gray-700 mb-5">
              <li className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                <span>
                  Retail Pricing: 35&prime; roof &times; $150 per linear foot
                </span>
                <span className="font-bold text-primary whitespace-nowrap">$5,250</span>
              </li>
              <li className="flex justify-between gap-4 border-b border-gray-100 pb-3">
                <span>Product Required: 200-300 SQ FT Double Layer Kit</span>
                <span className="font-bold text-primary whitespace-nowrap">$1,645</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="font-semibold">
                  Estimated Profit: $5,250 &minus; $1,645
                </span>
                <span className="font-bold text-accent whitespace-nowrap">
                  $3,605 per installation!
                </span>
              </li>
            </ul>
            <p className="text-sm text-gray-500 leading-relaxed">
              We have found this pricing model to be extremely effective, as it
              simplifies the process for the customer. Vary your numbers as
              necessary to fit your unique situation.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── EXAMPLE EARNING AVENUES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Example Earning Avenues" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {EARNING_AVENUES.map((a) => (
              <FeatureCard
                key={a.title}
                icon={<a.icon className="w-6 h-6 text-accent" />}
                title={a.title}
                description={a.desc}
              />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton
              href="/store"
              variant="accent"
              size="lg"
             
            >
              <ShoppingCart className="w-5 h-5" />
              Shop Product Kits
            </LinkButton>
          </div>
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Let's Get in Touch"
            heading="Have Any Questions? Our Crazy Seal Specialists Can Help!"
            subheading="Fill out the form below and one of our Crazy Seal specialists will be in touch with you shortly. We promise to be fun, informative, and will do our very best to help you!"
          />
          <div className="max-w-2xl mx-auto">
            <ContactForm sourcePage="ways-to-earn" />
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
