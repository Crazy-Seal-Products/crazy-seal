import type { Metadata } from 'next'
import {
  Building2,
  CalendarCheck,
  Download,
  Headset,
  Leaf,
  PaintRoller,
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

export default function FacilitiesOverviewPage() {
  return (
    <>
      {/* ─── HERO / PRESENTATION VIDEO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-14 lg:px-8 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
                  The Crazy Seal Roofing System
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                  Facilities
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-highlight mb-4">
                  No one stretches your budget like Crazy Seal!
                </p>
                <p className="text-white/60 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Facility owners and operators choose Crazy Seal to stretch
                  their roofing budgets. Our one and done system can be applied
                  in stages, ultimately resulting in a full seamless roof.
                  We&apos;d love to have a conversation to see how we can help
                  stretch your budget!
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="935230279"
                  thumbnail={`${MEDIA}/2024/03/IFMA-Cover.jpg`}
                  title="Crazy Seal professional facilities installation"
                />
                <p className="text-center text-white/70 text-sm font-medium mt-3">
                  Click to watch the facilities video
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALL IN STAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Install Crazy Seal in stages to stretch your budget:" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((phase) => (
              <div
                key={phase.number}
                className="rounded-2xl border border-gray-200/80 p-5 flex flex-col text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {phase.number}
                </div>
                <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">
                  {phase.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {phase.desc}
                </p>
                <div className="mt-auto">
                  <p className="text-xs font-semibold text-gray-500 mb-2">
                    {phase.caption}
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={phase.image}
                    alt={`Crazy Seal facility installation phase ${phase.number}`}
                    className="rounded-xl shadow-md w-full h-auto"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in RFMA Facilitator Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                Read the Article
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download an article on roofing from Crazy Seal&apos;s President
                in Restaurant Facility Managers Association magazine.
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
            <div className="grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine article page 1"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-2.jpg`}
                alt="RFMA Facilitator Magazine article page 2"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── COMMERCIAL INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Commercial Roof Installation Examples"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {COMMERCIAL_TRANSFORMATIONS.map((t) => (
              <BeforeAfterSlider
                key={t.label}
                beforeSrc={t.before}
                afterSrc={t.after}
                aspectRatio={t.aspect}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            {COMMERCIAL_TRANSFORMATIONS_WIDE.map((t) => (
              <BeforeAfterSlider
                key={t.label}
                beforeSrc={t.before}
                afterSrc={t.after}
                aspectRatio={t.aspect}
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TWO PURPOSES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal serves two purposes. It's a roof repair system and a full roofing system!"
            variant="dark"
          />
          <p className="text-white/60 leading-relaxed max-w-3xl mx-auto text-center mb-8">
            Nothing is more frustrating than doing the same thing over and over
            again to the same end result. Spot patching problem areas with
            sealants only kicks the can down the road to a future more expensive
            problem. Ultimately, patch jobs have to be removed, creating even
            more expense when the roof is replaced. This expensive cycle has
            gone on way too long for millions of facilities all over the world.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <Wrench className="w-12 h-12 text-highlight mx-auto mb-3" />
              <p className="font-bold uppercase tracking-wide text-white">Repair</p>
            </div>
            <div className="text-center">
              <Wrench className="w-12 h-12 text-highlight mx-auto mb-3" />
              <p className="font-bold uppercase tracking-wide text-white">Repair</p>
            </div>
            <div className="text-center">
              <RefreshCw className="w-12 h-12 text-highlight mx-auto mb-3" />
              <p className="font-bold uppercase tracking-wide text-white">Replace</p>
            </div>
          </div>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/60 leading-relaxed mb-4">
              It&apos;s time to take back control of your roof! With Crazy Seal,
              a patch doesn&apos;t just have to be a patch. You can now
              professionally handle problem areas on your roof, know the system
              that was used to solve the problem, and expand on it until you
              have a full seamless roofing system installed that will stand the
              test of time! Gone are the days of feeling out of control, at the
              mercy of the endless stream of insanely expensive commercial
              roofing quotes.
            </p>
            <p className="text-white/60 leading-relaxed">
              Instead of continually putting band-aids on problems and hoping
              they stick, begin with the Crazy Seal Roofing System on a small
              area of your roof. As you continue to do repairs on small areas,
              they bond to each other until you ultimately end up with a
              completed seamless roof.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Advantages" />
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

      {/* ─── DEALER CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Contact your dealer for more information!
          </h2>
        </div>
      </Container>
    </>
  )
}
