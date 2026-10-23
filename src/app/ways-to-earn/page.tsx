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
  Sparkles,
  Check,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { CountUp, GlowOrb } from '@/components/motion'
import { ProTestimonials } from '@/components/pro/ProSections'
import { ProContactSection } from '@/components/pro/ProContactSection'

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
    desc: "Video, PDF's, positive reviews and other reinforcing materials to help your customers reach a decision.",
    linkText: 'See the Presentation',
    href: '/rv-roofing',
  },
  {
    icon: Calculator,
    step: 'Price It Out',
    subheading: 'GIVE THE CUSTOMER AN IDEA ON COST',
    desc: 'Quote a quick idea on cost using your own shop rates or your version of our recommended pricing model.',
    linkText: 'See Pricing Model',
    href: '#pricing-model',
  },
  {
    icon: Repeat,
    step: 'Install & Repeat',
    subheading: 'FINISH WITH A SIMPLE INSTALLATION',
    desc: "The Crazy Seal Roofing System is a breeze to install, with a full suite of installation videos and PDF's.",
    linkText: 'See Installation',
    href: '/installation',
  },
]

const EARNING_AVENUES = [
  {
    icon: Wrench,
    title: 'Consumer Roof Repair',
    desc: "Grow your repair business with seamless roofing. Stop customers from leaving your shop for a competitor who offers a seamless roof.",
  },
  {
    icon: FileCheck,
    title: 'Insurance Claim Roof Repair',
    desc: 'Many insurance companies now prefer seamless roofing for its low cost and longevity. Win this business with a competitive seamless roofing bid from your shop.',
  },
  {
    icon: TrendingUp,
    title: 'Upsell During Resealing & UV Treatments',
    desc: 'Turn a couple hundred dollars in profit into a couple thousand with a maintenance-free seamless roof, so they never need UV treatments or resealing again.',
  },
  {
    icon: RefreshCw,
    title: 'Flip An RV Taken In On Trade',
    desc: 'Trade-ins with tired roofs sit longer, and many buyers check the roof. Install a seamless roof and show that value to move used units faster.',
  },
  {
    icon: Recycle,
    title: 'Salvage An RV & Resell',
    desc: 'Replace wood damage and install a seamless roof direct to deck, or as a hybrid that adheres partially to wood decking and partially to the existing membrane.',
  },
  {
    icon: Building2,
    title: "Not Just For RV's",
    desc: 'A perfect fit for small to medium flat roofing projects of all types, and for contractors who want to offer the best flat roofing system money can buy.',
  },
]

export default function WaysToEarnPage() {
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
              className="animate-fade-up text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance"
              style={{ animationDelay: '80ms' }}
            >
              Making Money With Our <span className="text-shimmer-highlight">Dealer Program</span>
            </h1>
            <p
              className="animate-fade-up text-xl sm:text-2xl font-bold text-white mb-4"
              style={{ animationDelay: '160ms' }}
            >
              Seamlessly Integrate Crazy Seal Into Your Sales Cycle
            </p>
            <p
              className="animate-fade-up max-w-2xl mx-auto text-lg text-white/70 leading-relaxed mb-8 text-pretty"
              style={{ animationDelay: '220ms' }}
            >
              Seamless roofing is on the rise, and especially in the RV industry people love a
              &ldquo;one-and-done&rdquo; system. With our pre-built digital presentation pages, you can
              start increasing your profitability in 3 simple steps.
            </p>
            <div
              className="animate-fade-up flex flex-wrap items-center justify-center gap-4"
              style={{ animationDelay: '300ms' }}
            >
              <LinkButton href="/contact" variant="accent" size="lg">
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
          </div>
        </div>
      </Container>

      {/* ─── 3 SIMPLE STEPS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Presentation → Price → Install" heading="3 Simple Steps to Make Money With Our Dealer Program" />
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0 md:block"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {STEPS.map((s, i) => (
                <a
                  key={s.step}
                  href={s.href}
                  className="group relative flex flex-col items-center rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 md:p-8 text-center ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <span className="relative mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                    <s.icon className="h-7 w-7" />
                    <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-extrabold text-white ring-4 ring-white">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="text-xl font-extrabold text-primary mb-1">{s.step}</h3>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-dark mb-3">
                    {s.subheading}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">{s.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-primary transition-colors group-hover:text-accent-dark">
                    {s.linkText}
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PRICING MODEL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="pricing-model"
          className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Recommended Pricing"
            heading="Pricing Model"
            subheading="We recommend a standard pricing model based on the linear foot of the RV. It typically looks something like this:"
            variant="dark"
          />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-6 lg:gap-10 items-center max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="group rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25">
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.16em] mb-2">
                  24&prime; or smaller
                </p>
                <p className="text-4xl sm:text-5xl font-extrabold text-highlight font-[family-name:var(--font-display)]">
                  <CountUp value={3600} prefix="$" />
                </p>
              </div>
              <div className="group rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25">
                <p className="text-white/60 text-xs font-bold uppercase tracking-[0.16em] mb-2">
                  25&prime; or longer
                </p>
                <p className="text-4xl sm:text-5xl font-extrabold text-highlight font-[family-name:var(--font-display)]">
                  <CountUp value={150} prefix="$" />{' '}
                  <span className="text-lg font-semibold text-white/80">/ Linear Foot</span>
                </p>
              </div>
            </div>

            {/* Earnings receipt */}
            <div className="relative rounded-3xl bg-white p-6 lg:p-8 shadow-2xl">
              <span className="absolute -top-3 right-6 inline-flex items-center gap-1.5 rounded-full bg-highlight px-3 py-1 text-xs font-extrabold text-primary shadow-glow-highlight">
                <Sparkles className="h-3.5 w-3.5" />
                Example job
              </span>
              <h3 className="text-lg font-extrabold text-primary mb-5">
                Here&apos;s an example of how much you could earn now:
              </h3>
              <ul className="space-y-3 text-gray-700 mb-5">
                <li className="flex justify-between gap-4 border-b border-dashed border-gray-200 pb-3">
                  <span>Retail Pricing: 35&prime; roof &times; $150 per linear foot</span>
                  <span className="font-bold text-primary whitespace-nowrap">$5,250</span>
                </li>
                <li className="flex justify-between gap-4 border-b border-dashed border-gray-200 pb-3">
                  <span>Product Required: 200-300 SQ FT Double Layer Kit</span>
                  <span className="font-bold text-primary whitespace-nowrap">$1,645</span>
                </li>
                <li className="flex flex-wrap items-end justify-between gap-2 rounded-2xl bg-accent/10 px-4 py-3 ring-1 ring-accent/20">
                  <span className="font-semibold text-gray-800">Estimated Profit: $5,250 &minus; $1,645</span>
                  <span className="text-2xl font-extrabold text-accent-dark whitespace-nowrap font-[family-name:var(--font-display)]">
                    <CountUp value={3605} prefix="$" />
                    <span className="text-sm font-bold"> per installation!</span>
                  </span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 leading-relaxed">
                This pricing model is extremely effective because it keeps things simple for the
                customer. Vary your numbers as necessary to fit your unique situation.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EXAMPLE EARNING AVENUES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="More Ways to Profit" heading="Example Earning Avenues" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {EARNING_AVENUES.map((a) => (
              <div
                key={a.title}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 md:p-7 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <a.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-extrabold text-primary mb-2">{a.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-5 ring-1 ring-primary/[0.06] sm:flex-row sm:justify-between md:mt-10 md:p-6">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-start">
              {['No franchise fees', 'No inventory requirements', 'Factory direct'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <LinkButton href="/kit-builder" variant="accent" size="lg">
              <ShoppingCart className="w-5 h-5" />
              Shop Product Kits
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
      <ProContactSection id="pro-contact" sourcePage="ways-to-earn" />

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
