import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  Download,
  Headset,
  Layers,
  Leaf,
  PaintRoller,
  Phone,
  PiggyBank,
  Recycle,
  Sun,
  Truck,
  Wrench,
  RefreshCw,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  LinkButton,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { GlowOrb } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Facilities Overview',
  description:
    'No one stretches your budget like Crazy Seal. Install our seamless roofing system in stages and stretch your facility roofing budget.',
}

const PHASES = [
  {
    number: 1,
    title: 'Start With Any Size',
    desc: 'Start with a repair or install of any size. No job is too big or small.',
    caption: 'For example, Phase 1:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-1-1024x576.jpg`,
  },
  {
    number: 2,
    title: 'Expand From There',
    desc: 'All repairs or installations become a part of your full Crazy Seal seamless roof!',
    caption: 'For example, Phase 2:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-2-1024x576.jpg`,
  },
  {
    number: 3,
    title: 'Standardize Process',
    desc: 'Use Crazy Seal to standardize your roofing & repair process across one or many facilities.',
    caption: 'For example, Phase 3:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-3-1024x576.jpg`,
  },
  {
    number: 4,
    title: 'Completed Permanent Roof',
    desc: 'Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!',
    caption: 'Phase 4 - Completed Roof:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-4-Complete-1024x576.jpg`,
  },
]

const COMMERCIAL_TRANSFORMATIONS = [
  {
    label: 'Right Section',
    before: `${MEDIA}/2022/01/Right-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Right-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Left Section',
    before: `${MEDIA}/2022/01/Left-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Left-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Center Section',
    before: `${MEDIA}/2022/01/Center-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Center-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const COMMERCIAL_TRANSFORMATIONS_WIDE = [
  {
    label: 'Full Roof View 1',
    before: `${MEDIA}/2022/01/Center-Full-2-Before-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Center-Full-2-After-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Full Roof View 2',
    before: `${MEDIA}/2022/01/Full-1-Before-1-Line-0-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Full-1-After-Line-0-1024x576.jpg`,
    aspect: '16/9',
  },
]

const ADVANTAGES = [
  {
    icon: PiggyBank,
    title: 'Budget Friendly',
    desc: 'Stretch your annual budgets by applying Crazy Seal in stages.',
  },
  {
    icon: Building2,
    title: 'Standardized Approach',
    desc: 'A repair process that is also a long-term solution for all of your facilities.',
  },
  {
    icon: Sun,
    title: 'Energy Efficient',
    desc: 'Reduce energy costs with our highly reflective and energy efficient system.',
  },
  {
    icon: Recycle,
    title: 'Sustainable & Renewable',
    desc: 'No tear off required. Keep your existing roof intact with Crazy Seal.',
  },
  {
    icon: Leaf,
    title: 'Environmentally Friendly',
    desc: 'No hydrocarbon solvents are used, only VOC exempt silicon based solvents.',
  },
  {
    icon: PaintRoller,
    title: 'Simple Installation',
    desc: 'Our detailed videos & PDFs show you step-by-step how to get the job done.',
  },
  {
    icon: Truck,
    title: 'Fast On-Demand Shipping',
    desc: 'We ship anywhere within the United States and Canada.',
  },
  {
    icon: CalendarCheck,
    title: '50-Year Product Warranty',
    desc: 'We offer a fully transferrable 50 year product warranty.',
  },
  {
    icon: Headset,
    title: 'In-House Support Team',
    desc: 'Our specialists are here to help Monday-Friday, 9am-6pm by phone or email.',
  },
]

const HERO_TRUST = [
  { icon: Layers, label: 'Apply in stages' },
  { icon: CalendarCheck, label: '50-Year Product Warranty' },
  { icon: Headset, label: 'In-house support team' },
]

const CONTROL_POINTS = [
  'Professionally handle problem areas — and know exactly which system solved them.',
  'Expand on it over time: repairs on small areas bond to each other.',
  'End up with a full seamless roof that will stand the test of time.',
  'No more endless, insanely expensive commercial roofing quotes.',
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

const SLIDER_CARD =
  'rounded-3xl bg-gradient-to-b from-slate-50 to-white p-2 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl'

export default function FacilitiesOverviewPage() {
  return (
    <>
      {/* ─── HERO / PRESENTATION VIDEO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-12 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <h1
                  {...enter(80)}
                  className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-3"
                >
                  Facilities
                </h1>
                <p
                  {...enter(160)}
                  className="animate-fade-up text-xl sm:text-2xl font-extrabold mb-4"
                >
                  <span className="text-shimmer-highlight">No one stretches your budget like Crazy Seal!</span>
                </p>
                <p
                  {...enter(240)}
                  className="animate-fade-up text-white/70 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0"
                >
                  Our one and done system can be applied in stages, ultimately resulting in
                  a full seamless roof. Let&apos;s talk about stretching your budget.
                </p>
                <ul
                  {...enter(320)}
                  className="animate-fade-up mt-7 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2"
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
              <div {...enter(200)} className="animate-fade-up">
                <ProVimeoEmbed
                  videoId="935230279"
                  thumbnail={`${MEDIA}/2024/03/IFMA-Cover.jpg`}
                  title="Crazy Seal professional facilities installation"
                />
                <p className="text-center text-white/60 text-sm font-medium mt-3">
                  Click to watch the facilities video
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALL IN STAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Budget Friendly"
            heading="Install Crazy Seal in stages to stretch your budget:"
          />
          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-6 hidden h-0.5 bg-gradient-to-r from-accent/10 via-accent/50 to-accent/10 lg:block"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {PHASES.map((phase) => (
                <div
                  key={phase.number}
                  className="group relative flex flex-col rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 text-center shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="relative mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary-light to-primary text-xl font-extrabold text-white shadow-glow-primary ring-4 ring-white transition-transform duration-500 group-hover:scale-110">
                    {phase.number}
                  </div>
                  <h3 className="text-lg font-extrabold text-primary uppercase tracking-wide mb-2">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {phase.desc}
                  </p>
                  <div className="mt-auto">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent-dark mb-2">
                      {phase.caption}
                    </p>
                    <div className="overflow-hidden rounded-xl shadow-md ring-1 ring-primary/[0.08]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={phase.image}
                        alt={`Crazy Seal facility installation phase ${phase.number}`}
                        className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Featured in RFMA Facilitator Magazine"
                heading="Read the Article"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 md:mb-8">
                An article on roofing from Crazy Seal&apos;s President in Restaurant
                Facility Managers Association magazine.
              </p>
              <LinkButton
                href={`${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See PDF
              </LinkButton>
            </div>
            <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine article page 1"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-2.jpg`}
                alt="RFMA Facilitator Magazine article page 2"
                className="relative mt-6 rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── COMMERCIAL INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Before & After"
            heading="Commercial Roof Installation Examples"
            subheading="Slide the center bar back and forth to see the transformations!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COMMERCIAL_TRANSFORMATIONS.map((t) => (
              <div key={t.label} className={SLIDER_CARD}>
                <div className="overflow-hidden rounded-2xl">
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio={t.aspect}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {COMMERCIAL_TRANSFORMATIONS_WIDE.map((t) => (
              <div key={t.label} className={SLIDER_CARD}>
                <div className="overflow-hidden rounded-2xl">
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio={t.aspect}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TWO PURPOSES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <GlowOrb className="-right-20 -bottom-24 h-72 w-72" color="rgb(91 164 17 / 0.22)" />
          <div className="relative">
            <SectionHeading
              eyebrow="Repair System + Full Roof System"
              heading="Crazy Seal serves two purposes. It's a roof repair system and a full roofing system!"
              variant="dark"
            />
            <p className="text-white/70 leading-relaxed max-w-3xl mx-auto text-center mb-8">
              Spot patching problem areas with sealants only kicks the can down the road to
              a more expensive problem — patch jobs eventually have to be removed, adding
              expense when the roof is replaced. Millions of facilities are stuck in this
              cycle:
            </p>
            <div className="mx-auto mb-10 flex max-w-2xl items-center justify-center gap-2 sm:gap-4">
              {[
                { icon: Wrench, label: 'Repair' },
                { icon: Wrench, label: 'Repair' },
                { icon: RefreshCw, label: 'Replace' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={`${label}-${i}`} className="flex items-center gap-2 sm:gap-4">
                  {i > 0 && <ArrowRight className="h-5 w-5 flex-shrink-0 text-white/40" />}
                  <div className="group flex w-20 flex-col items-center rounded-2xl bg-white/[0.06] px-2 py-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25 sm:w-32 sm:py-5">
                    <Icon className="mb-2 h-8 w-8 text-highlight transition-transform duration-500 group-hover:-rotate-12 sm:h-10 sm:w-10" />
                    <p className="text-xs font-extrabold uppercase tracking-wide text-white sm:text-sm">{label}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mx-auto max-w-3xl rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm sm:p-8">
              <p className="mb-5 text-center text-lg font-extrabold text-white sm:text-xl">
                It&apos;s time to take back control of your roof! With Crazy Seal, a patch
                doesn&apos;t just have to be a patch.
              </p>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {CONTROL_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm leading-relaxed text-white/80">
                    <span className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-accent/25 text-accent-light ring-1 ring-accent/40">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Why Facilities Choose Us" heading="Crazy Seal Advantages" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {ADVANTAGES.map((adv) => (
              <FeatureCard
                key={adv.title}
                icon={<adv.icon className="w-6 h-6 text-accent" />}
                title={adv.title}
                description={adv.desc}
              />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── DUAL CLOSE: TALK TO US / BECOME A DEALER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Ready to Take Back Control of Your Roof?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-7 max-w-xl mx-auto">
              Talk to Crazy Seal directly about your facility — or join our dealer network
              and install the system professionally.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/professionals" variant="outline-white" size="lg">
                Become a Dealer
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
              >
                <Phone className="h-5 w-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── LEAD CAPTURE ─── */}
      <LeadCaptureSection
        sourcePage="facilities-overview"
        defaultProjectType="Commercial Flat Roof"
        heading="Talk to a Specialist About Your Facility"
      />
    </>
  )
}
