import {
  Phone,
  Download,
  ShoppingCart,
  Check,
  X,
  ArrowRight,
  ArrowUpRight,
  PiggyBank,
  ClipboardList,
  Zap,
  Recycle,
  Leaf,
  Wrench,
  Truck,
  ShieldCheck,
  Headset,
  DollarSign,
  Timer,
  Users,
  HardHat,
  Award,
  Quote,
  Layers,
} from 'lucide-react'
import { Container, Grid, SectionHeading, LinkButton, FeatureCard } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { CountUp, GlowOrb, Stagger, StaggerItem } from '@/components/motion'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { MEDIA, ProTestimonials } from '@/components/pro/ProSections'
import { ProContactSection } from '@/components/pro/ProContactSection'

const PHASES = [
  {
    phase: 'PHASE 1',
    heading: 'Start With Any Size',
    desc: 'Start with a repair or install of any size. No job is too big or small.',
    image: `${MEDIA}/2024/02/Restaurant-Phase-1-1024x576.jpg`,
  },
  {
    phase: 'PHASE 2',
    heading: 'Expand From There',
    desc: 'All repairs or installations become a part of your full Crazy Seal seamless roof!',
    image: `${MEDIA}/2024/02/Restaurant-Phase-2-1024x576.jpg`,
  },
  {
    phase: 'PHASE 3',
    heading: 'Standardize Process',
    desc: 'Use Crazy Seal to standardize your roofing & repair process across one or many facilities.',
    image: `${MEDIA}/2024/02/Restaurant-Phase-3-1024x576.jpg`,
  },
  {
    phase: 'PHASE 4',
    heading: 'Completed Permanent Roof',
    desc: 'Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!',
    image: `${MEDIA}/2024/02/Restaurant-Phase-4-Complete-1024x576.jpg`,
  },
]

const BEFORE_AFTERS = [
  {
    before: `${MEDIA}/2022/01/Left-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Left-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    before: `${MEDIA}/2022/01/Center-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Center-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    before: `${MEDIA}/2022/01/Right-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Right-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const FULL_BEFORE_AFTERS = [
  {
    before: `${MEDIA}/2022/01/Full-1-Before-1-Line-0-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Full-1-After-Line-0-1024x576.jpg`,
  },
  {
    before: `${MEDIA}/2022/01/Center-Full-2-Before-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Center-Full-2-After-1024x576.jpg`,
  },
]

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Layers, label: 'Apply in stages' },
  { icon: Truck, label: 'Ships to US & Canada' },
]

const MEMBRANE_TRAITS = ['Waterproof', 'Highly reflective', 'Scratch resistant', 'Flexible', 'Tough']

const OLD_WAY = [
  'Spot patching with sealants just kicks the can down the road',
  'Patch jobs have to be removed when the roof is replaced, adding even more expense',
  'An expensive cycle for millions of facilities all over the world',
]

const CRAZY_SEAL_WAY = [
  "A patch doesn't have to be just a patch: you know the system used to solve the problem",
  'Each small repair bonds to the next as you keep going',
  'Expand until you have a full seamless roof that stands the test of time',
  'No more being at the mercy of insanely expensive commercial roofing quotes',
]

const KIT_INCLUDES = [
  'A custom suite of products uniquely designed to permanently seal every square millimeter of your roofing application.',
  '50 Year Product Warranty.',
  'Support from our team of roofing experts by phone, email, chat, or text message M-F 9:00am-6:00pm EST.',
  '24/7 Access to our video instruction series to show you step by step exactly how to install your system.',
  'PDF instructions to accompany the video series.',
  'Additional resource pages to guide you through installation.',
  'Free shipping on orders over $500.00',
]

const ADVANTAGES = [
  { icon: PiggyBank, title: 'Budget Friendly', desc: 'Stretch your annual budgets by applying Crazy Seal in stages.' },
  { icon: ClipboardList, title: 'Standardized Approach', desc: 'A repair process that is also a long-term solution for all of your facilities.' },
  { icon: Zap, title: 'Energy Efficient', desc: 'Reduce energy costs with our highly reflective and energy efficient system.' },
  { icon: Recycle, title: 'Sustainable & Renewable', desc: 'No tear off required. Keep your existing roof intact with Crazy Seal.' },
  { icon: Leaf, title: 'Environmentally Friendly', desc: 'No hydrocarbon solvents, only VOC exempt silicon based solvents.' },
  { icon: Wrench, title: 'Simple Installation', desc: 'Detailed videos & PDFs show you step-by-step how to get the job done.' },
  { icon: Truck, title: 'Fast On-Demand Shipping', desc: 'We ship anywhere within the United States and Canada.' },
  { icon: ShieldCheck, title: '50-Year Product Warranty', desc: 'A fully transferrable 50 year product warranty.' },
  { icon: Headset, title: 'In-House Support Team', desc: 'Specialists here to help Monday-Friday, 9am-6pm by phone or email.' },
]

const QUICK_LINKS = [
  {
    icon: DollarSign,
    heading: 'Save Money',
    subheading: 'INSTALL YOURSELF & SAVE BIG',
    desc: 'Much of the cost of a typical roofing install is labor. Do it yourself and save big with raw materials factory direct from Crazy Seal!',
    linkText: 'Build My Kit',
    href: '/kit-builder',
  },
  {
    icon: Timer,
    heading: 'Quick Install',
    subheading: 'GET THE JOB DONE FAST',
    desc: 'Hiring a roofer can take weeks or even months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit.',
    linkText: 'Installation',
    href: '/installation',
  },
  {
    icon: ShieldCheck,
    heading: 'Permanent',
    subheading: '50 YEAR PRODUCT WARRANTY',
    desc: "If it's worth doing, it's worth doing right. Skip the band-aid: do it right and do it once with the Crazy Seal roofing system.",
    linkText: 'Warranty',
    href: '/warranty',
  },
]

const GET_A_KIT = [
  { icon: Phone, title: 'Give Us a Call', href: 'tel:8009630131', label: '(800) 963-0131', variant: 'outline-white' as const },
  { icon: Headset, title: 'Get in Touch', href: '/contact', label: 'Contact Us', variant: 'outline-white' as const },
  { icon: ShoppingCart, title: 'Visit Our Online Store', href: '/kit-builder', label: 'Shop Kits', variant: 'accent' as const },
]

interface FacilityAudiencePageProps {
  audienceHeading: string
  audienceIntro: string
  sourcePage: string
}

export function FacilityAudiencePage({
  audienceHeading,
  audienceIntro,
  sourcePage,
}: FacilityAudiencePageProps) {
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
                  className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4"
                  style={{ animationDelay: '80ms' }}
                >
                  <span className="text-shimmer-highlight">{audienceHeading}</span>
                </h1>
                <p
                  className="animate-fade-up text-xl sm:text-2xl font-bold text-white mb-3 text-balance"
                  style={{ animationDelay: '160ms' }}
                >
                  No one stretches your budget like Crazy Seal!
                </p>
                <p
                  className="animate-fade-up text-base sm:text-lg text-white/70 leading-relaxed mb-7 text-pretty"
                  style={{ animationDelay: '220ms' }}
                >
                  {audienceIntro}
                </p>
                <div
                  className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-4"
                  style={{ animationDelay: '300ms' }}
                >
                  <LinkButton href="#facility-contact" variant="accent" size="lg">
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
                  className="animate-fade-up flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 mt-8"
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
              <div className="animate-fade-up relative" style={{ animationDelay: '200ms' }}>
                <ProYouTubeEmbed videoId="XZrXvweEo-U" title="Crazy Seal Facilities video" />
                <p className="mt-4 text-center text-sm font-medium text-white/60">
                  Watch our Facilities video (5:52)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PHASES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="One and Done, In Stages"
            heading="Install Crazy Seal in stages to stretch your budget"
            subheading="Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((p, i) => (
              <div
                key={p.phase}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.image}
                    alt={`${p.phase}: ${p.heading}`}
                    className="w-full aspect-video object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-md ${
                      i === PHASES.length - 1 ? 'bg-highlight text-primary' : 'bg-white/95 text-primary'
                    }`}
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[9px] text-white">
                      {i + 1}
                    </span>
                    {p.phase}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-primary text-lg mb-1">{p.heading}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
                {/* progress bar showing how far along the roof is */}
                <div className="mx-5 mb-5 h-1.5 overflow-hidden rounded-full bg-primary/[0.07]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-light to-accent"
                    style={{ width: `${((i + 1) / PHASES.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="#facility-contact" variant="primary" size="lg">
              Start a Conversation
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/15 blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine feature on Crazy Seal"
                className="h-64 md:h-80 w-auto rounded-xl shadow-2xl ring-1 ring-white/20 -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                See Our Feature Article
              </h2>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-7 max-w-xl mx-auto md:mx-0">
                An article on roofing from Crazy Seal&apos;s President in Restaurant Facility Managers
                Association magazine.
              </p>
              <LinkButton
                href={`${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See PDF
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HOW TO GET A KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Three Easy Ways" heading="How to Get a Crazy Seal Roofing Kit" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {GET_A_KIT.map(({ icon: Icon, title, href, label, variant }) => (
              <div
                key={title}
                className="group flex flex-col items-center rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 lg:p-8 text-center ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-extrabold text-primary mb-4">{title}</h3>
                <LinkButton
                  href={href}
                  variant={variant === 'accent' ? 'accent' : 'primary'}
                  size="md"
                  className="mt-auto"
                >
                  {label}
                </LinkButton>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="Crazy Seal full overview video"
                caption="Click to watch our full overview video"
              />
            </div>
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Better by Design"
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-lg font-bold text-primary mb-3">
                Finally! A roofing system that is not all or nothing.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6 md:text-lg">
                Begin with a repair and go from there. Because it&apos;s fluid applied, Crazy Seal works
                on anything from a few square feet to a full commercial roof thousands of square feet in
                size &mdash; so you can solve a problem now without sacrificing longevity.
              </p>
              <Stagger className="flex flex-wrap justify-center md:justify-start gap-2" stagger={0.06}>
                {MEMBRANE_TRAITS.map((trait) => (
                  <StaggerItem key={trait}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08]">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-accent/15 text-accent-dark">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {trait}
                    </span>
                  </StaggerItem>
                ))}
                <StaggerItem>
                  <span className="inline-flex items-center gap-2 rounded-full bg-highlight px-3.5 py-1.5 text-sm font-bold text-primary shadow-glow-highlight">
                    <ShieldCheck className="h-4 w-4" />
                    50 year warranty
                  </span>
                </StaggerItem>
              </Stagger>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BEFORE / AFTER EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Before & After"
            heading="Commercial Roof Installation Examples"
            subheading="Slide the center bar back and forth to see each transformation!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {BEFORE_AFTERS.map((ba) => (
              <BeforeAfterSlider
                key={ba.before}
                beforeSrc={ba.before}
                afterSrc={ba.after}
                aspectRatio={ba.aspect}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FULL_BEFORE_AFTERS.map((ba) => (
              <BeforeAfterSlider
                key={ba.before}
                beforeSrc={ba.before}
                afterSrc={ba.after}
                aspectRatio="16/9"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── INSTALL IN-HOUSE OR HIRE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-stretch">
            {[
              {
                icon: Users,
                title: 'Install In-House',
                desc: 'Use your own staff. Our full suite of installation videos and PDFs walks them through every step of the process.',
              },
              {
                icon: HardHat,
                title: 'Hire A Professional Installer',
                desc: 'Any local painter, roofer or handyman can easily get the job done with our step-by-step installation videos and PDFs.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-3xl bg-white/[0.06] p-6 lg:p-10 text-center ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="h-7 w-7 text-highlight" />
                </span>
                <h3 className="text-xl lg:text-2xl font-extrabold text-white mb-3">{title}</h3>
                <p className="text-white/70 leading-relaxed max-w-md mx-auto">{desc}</p>
              </div>
            ))}
            <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-highlight text-lg font-black text-primary shadow-glow-highlight ring-4 ring-primary">
              OR
            </span>
          </div>
        </div>
      </Container>

      {/* ─── REPAIR + FULL ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Take Back Control of Your Roof"
            heading="Crazy Seal serves two purposes. It's a roof repair system and a full roofing system!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-slate-50 p-6 lg:p-8 ring-1 ring-primary/[0.06]">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">The endless patch cycle</p>
              <ul className="space-y-3">
                {OLD_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gray-200 text-gray-500">
                      <X className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-accent/[0.06] p-6 lg:p-8 shadow-lg ring-1 ring-accent/25">
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
              <p className="relative mb-4 text-xs font-bold uppercase tracking-[0.18em] text-accent-dark">The Crazy Seal way</p>
              <ul className="relative space-y-3">
                {CRAZY_SEAL_WAY.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── MODERN TECH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Patented Technology"
                heading="Modern Tech Taking On An Old Challenge"
                variant="dark"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-4">
                Crazy Seal is an engineering marvel. Our chemical strategists and product testing teams
                spent years developing what may well be the strongest fluid-applied membrane ever
                brought to market &mdash; now patented and backed by a fifty year warranty.
              </p>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                For decades, options ranged from low-grade coatings that are temporary at best to
                inferior membranes that often fail within 3-5 years, and high quality materials were
                only available to large roofing contractors. Crazy Seal brings an affordable, high-grade
                system to the small and mid-size project.
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-md">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2025/01/Crazy-Seal-U.S.-Patent-1024x1024.png`}
                alt="Crazy Seal U.S. Patent"
                className="relative rounded-3xl shadow-2xl ring-1 ring-white/15 w-full h-auto object-cover bg-white"
              />
              <span className="absolute -bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float">
                <Award className="h-4 w-4" />
                U.S. Patent #12,146,061
              </span>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── FIRE DEPARTMENT STORY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/Fire-Dept-Emerald-Isles.jpg`}
                alt="Town of Emerald Isle Fire Department rescue trailer sealed with Crazy Seal"
                className="relative rounded-3xl shadow-xl ring-1 ring-primary/10 w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Real Results"
                heading="Fire Department Saves $39,000. Their review says it all."
                align="left"
                className="mb-6 text-center md:text-left"
              />
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { value: 39000, prefix: '$', suffix: '', label: 'Saved' },
                  { value: 1000, prefix: '$', suffix: '', label: 'On product' },
                  { value: 2, prefix: '', suffix: ' days', label: 'Back in service' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-gradient-to-b from-slate-50 to-white px-2 py-4 text-center ring-1 ring-primary/[0.08]"
                  >
                    <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary font-[family-name:var(--font-display)]">
                      <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <figure className="relative rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 ring-1 ring-primary/[0.08]">
                <Quote className="absolute -top-3 left-5 h-7 w-7 rounded-full bg-accent p-1.5 text-white shadow-glow-accent" />
                <blockquote className="text-gray-600 leading-relaxed">
                  The Town of Emerald Isle Fire Department recently sealed the roof of a 24&prime;
                  emergency response rescue trailer. The EIFD staff completed the repairs using Crazy
                  Seal products. Instead of spending $40,000 and waiting 12-months for a replacement
                  trailer, town staff spent $1,000 on product. Two days later, the trailer was dry and
                  ready to save lives along the weather impacted coast of North Carolina. Thank you to
                  Crazy Seal and the fantastic folks that make such a wonderful product!
                </blockquote>
                <figcaption className="mt-4 text-gray-800 font-semibold">
                  Thank you,
                  <br />
                  Matt Zapp &ndash; Town Manager
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY CRAZY SEAL SUCCEEDS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Why It Works" heading="Why does Crazy Seal succeed where others fail?" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              icon={<Headset className="w-6 h-6 text-accent" />}
              title="We Support & Care About Our Customers"
              description="Crazy Seal is designed to actually solve your roofing problems. We ship direct, provide a full suite of instructional materials, and have experts on hand to make your project a success."
            />
            <FeatureCard
              icon={<Wrench className="w-6 h-6 text-accent" />}
              title="3 Part Sealing System"
              description="Our 3-part system actually stops leaks: eliminate problem areas first, then finish with our final membrane. Every component merges into one seamless membrane over every square inch."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-accent" />}
              title="We Are One of a Kind"
              description="We're not aware of another manufacturer offering a consumer-direct e-commerce model, tons of support, and the absolute best product available today. That adds up to your best long-term value."
            />
          </Grid>
          <div className="mt-8 md:mt-12 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-6 lg:p-10 ring-1 ring-primary/[0.06]">
            <h3 className="text-xl font-extrabold text-primary text-center mb-6">
              That&apos;s why every kit comes with:
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 max-w-4xl mx-auto">
              {KIT_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── READY TO GET STARTED ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-12 text-center">
          <GlowOrb className="-right-24 -top-24 h-72 w-72" color="rgb(249 234 28 / 0.18)" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Ready to get <span className="text-shimmer-highlight">started?</span>
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-7">
              Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!
            </p>
            <LinkButton href="#facility-contact" variant="accent" size="lg">
              Start a Conversation
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="The Full Package" heading="Crazy Seal Advantages" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-start gap-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-extrabold text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Keep Exploring" heading="Quick Links to Other Pages" variant="dark" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.heading}
                href={link.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                    <link.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-highlight ring-1 ring-white/10 text-right">
                    {link.subheading}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white mb-1.5">{link.heading}</h3>
                <p className="text-sm text-white/65 leading-relaxed mb-5">{link.desc}</p>
                <span className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-bold text-white">
                  {link.linkText}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </a>
            ))}
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
      <ProContactSection
        id="facility-contact"
        form="contact"
        sourcePage={sourcePage}
        buttonLabel="Talk to a Specialist"
      />

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
