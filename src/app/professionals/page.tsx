import type { Metadata } from 'next'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  Check,
  Download,
  FileCheck,
  MessageSquareQuote,
  MonitorPlay,
  Palette,
  Phone,
  Repeat,
  ShoppingCart,
  Sparkles,
  Timer,
  TrendingUp,
  Wrench,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  LinkButton,
  YouTubeEmbed,
} from '@/lib/design-system'
import { FormModalButton } from '@/components/forms/FormModalButton'
import { ProContactSection } from '@/components/pro/ProContactSection'
import { DealerNetworkIntro } from '@/components/professionals/DealerNetworkIntro'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { GlowOrb } from '@/components/motion'
import { PortalShowcase } from '@/components/portal/showcase/PortalShowcase'
import { ModuleRoadmap } from '@/components/portal/showcase/ModuleRoadmap'
import { WhiteLabelShowcase } from '@/components/portal/showcase/WhiteLabelShowcase'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'
const PORTAL_TOUR = '/portal/demo/summit/'

export const metadata: Metadata = {
  title: 'Professionals',
  description:
    'Increase profits with our seamless roof system. Join the Crazy Seal Professional network — no franchise fees, no inventory requirements, free on-demand shipping, new leads, and a Pro Portal with training and white-label materials.',
}

const PERKS = [
  'No franchise fees',
  'No inventory',
  'Free on-demand shipping',
  '50 year warranty',
  'New leads',
  'High-volume rebates',
]

const QUICK_LINKS = [
  {
    eyebrow: 'Make Money',
    title: 'Install & Earn Big',
    desc: 'Raw materials factory direct — you keep the margin.',
    cta: 'Ways to Earn',
    href: '/ways-to-earn',
    icon: BadgeDollarSign,
  },
  {
    eyebrow: 'Customer Presentation',
    title: 'Earn Their Business',
    desc: 'Just press play on a page built to close.',
    cta: 'See Customer Pages',
    href: '/crazy-seal',
    icon: MonitorPlay,
  },
  {
    eyebrow: 'Completed Job',
    title: 'File the Warranty',
    desc: 'Automatic confirmation email and PDF for your customer.',
    cta: 'File the Warranty',
    href: '/warranty',
    icon: FileCheck,
  },
  {
    eyebrow: 'Professional Tools',
    title: 'Our Tools / Your Profit',
    desc: 'Downloadable tools to grow your installation business.',
    cta: 'Professional Tools',
    href: '/professional-tools',
    icon: Wrench,
  },
  {
    eyebrow: 'Kits & Pricing',
    title: 'Pre-Built Roofing Kits',
    desc: 'Pre-built kits for most jobs, or build your own.',
    cta: 'Build My Kit',
    href: '/kit-builder',
    icon: ShoppingCart,
  },
  {
    eyebrow: 'Quick Install',
    title: 'Get the Job Done Fast',
    desc: 'A brand new roof installed within hours.',
    cta: 'Installation',
    href: '/installation',
    icon: Timer,
  },
]

const CHAT_EXAMPLES = [1, 2, 3, 4, 5, 6].map((n) => `${MEDIA}/2022/07/Pro-Chat-Example-${n}.jpg`)


const APPLICATIONS = [
  {
    title: 'RV',
    desc: 'Travel trailers, fifth wheels, motor coaches.',
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Flat-roof facilities of every kind.',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat roofs, sunrooms, storage buildings.',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, fleets.',
    href: '/transportation',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
]

const PROFIT_POINTS = [
  {
    icon: Repeat,
    title: 'Customers want one-and-done',
    desc: 'RV’ers and owners are done with yearly resealing — a seamless roof with a 50 year warranty sells itself.',
  },
  {
    icon: MessageSquareQuote,
    title: 'We send you leads',
    desc: 'We’re a manufacturer that ships direct. When customers ask for an installer near them, we send them to you.',
  },
  {
    icon: TrendingUp,
    title: 'Rebates as you grow',
    desc: 'Start earning immediately — high volume dealers unlock additional rebates.',
  },
]

const WHITE_LABEL_STEPS = [
  'Upload your logo and pick your colors',
  'Choose a template for your customer pages',
  'Our asset team reviews and publishes',
  'Co-branded page, brochure and emails go live',
]

export default function ProfessionalsPage() {
  return (
    <>
      {/* ─── HERO: animated dealer network intro ─── */}
      <Container size="xl">
        <DealerNetworkIntro />
      </Container>

      {/* ─── PROFESSIONAL PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-white border-y sm:border border-gray-200/80 overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:px-12 lg:py-14">
          {/* Highlight: warm glow + gold hairline across the top */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-highlight to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-highlight/25 via-accent/15 to-secondary/20 blur-3xl" />
          <div className="relative mx-auto max-w-4xl text-center">
            <SectionHeading
              eyebrow="Professional Program"
              heading="Join Our Professional Network for Professional Perks"
              subheading="Everything you need to sell and install the Crazy Seal system — without the franchise fees."
              className="mb-7 md:mb-8"
            />
            <div className="relative mx-auto max-w-3xl">
              <div aria-hidden="true" className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/40 via-secondary/20 to-accent/40 blur-2xl" />
              <div className="relative rounded-[1.4rem] bg-gradient-to-br from-highlight via-accent-light to-secondary p-[3px] shadow-2xl">
                <div className="overflow-hidden rounded-[1.25rem] bg-primary">
                  <YouTubeEmbed videoId="PRhpGHn-J3s" variant="card" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Watch the Professional Opportunities video (4:00)</p>
            <ul className="mx-auto mt-5 flex max-w-3xl flex-wrap justify-center gap-2">
              {PERKS.map((perk) => (
                <li
                  key={perk}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08] sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="lg">
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
              <LinkButton href={PORTAL_TOUR} variant="outline" size="lg" className="border-primary/25 text-primary">
                <Sparkles className="w-4 h-4" />
                Tour the Pro Portal
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PRO PORTAL SHOWCASE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div id="pro-portal" className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 scroll-mt-24">
          <GlowOrb className="-right-32 -top-32 h-[28rem] w-[28rem]" color="rgb(91 164 17 / 0.22)" />
          <div className="relative">
            <SectionHeading
              eyebrow="New · The Pro Portal"
              heading="Everything you need to launch — in one login"
              subheading="Training modules, leads, orders, warranties and white-label materials, built for Crazy Seal partners."
              variant="dark"
            />
            <PortalShowcase />
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <LinkButton href={PORTAL_TOUR} variant="accent" size="lg">
                <Sparkles className="w-4 h-4" />
                Take the interactive tour
              </LinkButton>
              <FormModalButton form="professional" sourcePage="professionals" variant="outline-white" size="lg">
                Get partner access
              </FormModalButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PROGRAM MODULES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 md:p-10 lg:p-12">
          <SectionHeading
            heading="Six modules from first call to finished roof"
            subheading="The Business Accelerator Program walks you through marketing, sales, kits, installation and warranty — inside the Pro Portal, with progress that saves as you go."
            className="mb-8 md:mb-12"
          />
          <div data-no-reveal>
            <ModuleRoadmap />
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3 border-t border-primary/[0.06] pt-8 md:mt-14 md:pt-10">
            <LinkButton href={PORTAL_TOUR} variant="accent" size="lg">
              <Sparkles className="w-4 h-4" />
              Start Module 1 in the Portal
            </LinkButton>
            <LinkButton href="/business-accelerator-program" variant="outline" size="lg" className="border-primary/25 text-primary">
              See the Program
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
            <FormModalButton form="professional" sourcePage="professionals" variant="primary" size="lg">
                Become a Dealer
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
          </div>
        </div>
      </Container>

      {/* ─── WHITE LABEL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <SectionHeading
                eyebrow="White Label Studio"
                heading="Your brand. Our 50 year warranty."
                subheading="Put your logo and colors on the customer presentation page, brochure and quote emails — powered by Crazy Seal."
                variant="dark"
                align="left"
                className="mb-6 text-center lg:text-left"
              />
              <ol className="space-y-2.5 text-left max-w-md mx-auto lg:mx-0">
                {WHITE_LABEL_STEPS.map((step, i) => (
                  <li key={step} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-highlight text-sm font-black text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{step}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
                <LinkButton href={`${PORTAL_TOUR}?next=/portal/white-label/`} variant="white" size="md">
                  <Palette className="w-4 h-4" />
                  Try the studio
                </LinkButton>
                <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="md">
                  Become a Dealer
                  <ArrowRight className="w-4 h-4" />
                </FormModalButton>
              </div>
            </div>
            <div data-no-reveal>
              <WhiteLabelShowcase />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="For Partners" heading="Quick Links" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="group relative flex h-full items-start gap-4 rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <link.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-accent-dark">{link.eyebrow}</span>
                  <span className="mt-0.5 block font-extrabold text-primary">{link.title}</span>
                  <span className="mt-1 block text-sm text-gray-500 leading-relaxed">{link.desc}</span>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {link.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </a>
            ))}
          </Grid>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="md">
                Become a Dealer
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
            <LinkButton href="tel:8009630131" variant="outline" size="md" className="border-primary/25 text-primary">
              <Phone className="w-4 h-4" />
              (800) 963-0131
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── LEADS + PROFIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Demand Creates Opportunity"
            heading="New Leads — and Bigger Margins"
            subheading="Seamless roofing is on the rise, and people are asking for pros to install it."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PROFIT_POINTS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 ring-1 ring-primary/[0.08] shadow-sm">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-highlight shadow-glow-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-extrabold text-primary">{title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-semibold text-gray-500 mt-10 mb-5">
            Real chats from customers asking for pro installation:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {CHAT_EXAMPLES.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={src}
                src={src}
                alt={`Customer chat example ${i + 1} asking for professional Crazy Seal installation`}
                className="w-full h-auto rounded-2xl ring-1 ring-primary/10 shadow-md transition-transform duration-500 hover:-translate-y-1 hover:rotate-1"
                loading="lazy"
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="lg">
              Start Getting Leads
              <ArrowRight className="w-4 h-4" />
            </FormModalButton>
            <LinkButton href={`${PORTAL_TOUR}?next=/portal/leads/`} variant="outline" size="lg" className="border-primary/25 text-primary">
              See the Leads Dashboard
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── ADDITIONAL INFORMATION VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Additional Information"
            heading="Learn More About the Crazy Seal System"
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="21 and a half Reasons Why video"
              />
              <p className="text-center text-white/65 text-sm font-semibold mt-3">21&frac12; Reasons Why</p>
            </div>
            <div>
              <YouTubeEmbed videoId="VoPjXn8YCk4" variant="card" />
              <p className="text-center text-white/65 text-sm font-semibold mt-3">Let&rsquo;s Get Crazy</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-8">
            <LinkButton href={`${MEDIA}/2020/02/21-Reasons.pdf`} variant="white" size="md" external>
              <Download className="w-4 h-4" />
              Download Our 21&frac12; Reasons PDF
            </LinkButton>
            <LinkButton href="/crazy-seal" variant="outline-white" size="md">
              How the Hybrid System Works
            </LinkButton>
            <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="md">
                Become a Dealer
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
          </div>
        </div>
      </Container>

      {/* ─── PRESS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed overflow-hidden bg-gradient-to-r from-primary to-secondary px-5 py-8 sm:px-6 md:p-8 lg:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl" />
          <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
              alt="Trailer Life Magazine May 2020 cover featuring Crazy Seal"
              className="h-40 w-auto -rotate-3 rounded-xl shadow-2xl ring-1 ring-white/20 transition-transform duration-500 hover:rotate-0 sm:h-44"
            />
            <div className="flex-1 text-center sm:text-left">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-highlight">Featured in Trailer Life Magazine</p>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">Proof you can show every customer</h2>
              <p className="mt-2 text-white/70">Share the feature article at your next appointment.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <LinkButton href={`${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`} variant="white" size="md" external>
                <Download className="w-4 h-4" />
                Feature PDF
              </LinkButton>
              <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="md">
                Become a Dealer
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATION TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Every Flat Roof" heading="Application Types You Can Sell" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full aspect-[9/7] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-primary">{app.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
            <FormModalButton form="professional" sourcePage="professionals" variant="accent" size="md">
                Become a Dealer
                <ArrowRight className="w-4 h-4" />
              </FormModalButton>
            <LinkButton href="/applications" variant="outline" size="md" className="border-primary/30 text-primary">
              See More Application Types
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT (form opens in a pop-up) ─── */}
      <ProContactSection
        id="start-a-conversation"
        sourcePage="professionals"
        eyebrow="Join the Network"
        heading="Become a Crazy Seal Dealer"
        subheading="Tell us about your business — we’ll reach out about partnership, ways to earn, and Pro Portal access."
        points={['No franchise fees', 'No inventory requirements', 'Pro Portal access']}
      />
    </>
  )
}
