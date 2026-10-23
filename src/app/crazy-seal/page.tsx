'use client'

import { Fragment, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  Hammer,
  Layers,
  Play,
  PlayCircle,
  ShieldCheck,
  ShoppingCart,
  X,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { CountUp, Stagger, StaggerItem } from '@/components/motion'
import {
  BeforeAfterGrid,
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroMedia,
  HeroShell,
  IconTile,
  MEDIA,
  SECTION_NAVY,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'
import { StepTimeline, TiltCard } from '@/components/system-pages/motion-blocks'

const BADGES = [
  { image: `${MEDIA}/2019/05/Warranty.png`, label: '50 Year Warranty' },
  { image: `${MEDIA}/2019/05/DIY.png`, label: 'Do It Yourself' },
  { image: `${MEDIA}/2019/05/RED-FLAG-1000.png`, label: 'Made in America' },
  { image: `${MEDIA}/2019/05/Satisfaction.png`, label: 'Guarantee' },
  { image: `${MEDIA}/2019/05/Quality.png`, label: 'Unmatched Quality' },
]

const PRODUCTS = [
  {
    name: 'Crazy Caulk',
    role: 'Seams',
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png`,
    desc: 'A fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Seals seams — like the sides of an RV, or where gutter systems attach to the roof.',
  },
  {
    name: 'Crazy Patch',
    role: 'Penetrations',
    image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png`,
    desc: 'A fiber-infused silicone, moisture-curing mastic that ensures penetrations are sealed wherever sealant was previously applied. Also works alone as a single component repair product to patch leaks.',
  },
  {
    name: 'Crazy Seal',
    role: 'Membrane',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png`,
    desc: 'A weatherproof, fiber-infused silicone, fluid-applied membrane that protects any weathered roof against harsh UV rays, severe weather, mold and mildew. Won’t chalk or blister; stays permanently flexible yet strong.',
  },
  {
    name: 'Crazy Tape',
    role: 'Repairs',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-1024x1024.png`,
    desc: 'Strong adhesive on one side adds structural integrity to the seam, while the fabric on top lets the Crazy Seal System adhere to it — opening up many possibilities for repair.',
  },
  {
    name: 'Crazy Clean',
    role: 'Prep',
    image: `${MEDIA}/2019/05/Crazy-Clean.png`,
    desc: 'A concentrated cleaning solution that removes oils, dirt and oxidation. Environmentally safe, non-toxic, and leaves no contaminating by-products or pollutants behind.',
  },
]

const SYSTEM_PARTS = [
  { name: 'Crazy Caulk', image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png` },
  { name: 'Crazy Patch', image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png` },
  { name: 'Crazy Seal', image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png` },
]

const TRANSFORMATIONS = [
  {
    label: 'Winnebago Roof',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Roof Vent',
    before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Skylight & Solar',
    before: `${MEDIA}/2019/07/Skylight-Solar-Before-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Termination Bar',
    before: `${MEDIA}/2019/07/Termination-Bar-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Termination-Bar-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
]

const ACTION_CHIPS = 'mt-3 flex flex-wrap gap-1.5'
const ACTION_CHIP =
  'inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-dark ring-1 ring-accent/20'

function Actions({ items }: { items: string[] }) {
  return (
    <ul className={ACTION_CHIPS}>
      {items.map((item) => (
        <li key={item} className={ACTION_CHIP}>
          <Check className="h-3 w-3" strokeWidth={3} />
          {item}
        </li>
      ))}
    </ul>
  )
}

const INSTALL_STEPS = [
  {
    label: 'Step 1',
    title: 'Roof Inspection',
    image: `${MEDIA}/2019/06/002-Inspect-Walk.jpg`,
    desc: 'Walk the roof and identify any problem areas. Inspect penetrations to see if any areas need fixing.',
  },
  {
    label: 'Step 2',
    title: 'Cleaning & Preparation',
    image: `${MEDIA}/2019/06/015-Pressure-Wash.jpg`,
    desc: <Actions items={['Pressure wash', 'Scrub with Crazy Clean', 'Tape off fixtures']} />,
  },
  {
    label: 'Step 3',
    title: 'Applying the Crazy Seal Products',
    image: `${MEDIA}/2019/06/100-Roller.jpg`,
    desc: <Actions items={['Apply Crazy Caulk', 'Apply Crazy Patch', 'Apply the Crazy Seal Roof Membrane']} />,
  },
]

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    text: "I loved the product. I'd recommend it to anybody!",
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

export default function CrazySealSystemPage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell>
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <h1 className={HERO_H1} style={fadeDelay(80)}>
                Our <span className="text-shimmer-highlight">System</span>
              </h1>
              <p
                className="animate-fade-up text-white/80 text-base sm:text-lg leading-relaxed mb-3 max-w-xl mx-auto lg:mx-0"
                style={fadeDelay(160)}
              >
                A revolutionary seamless roofing system designed to permanently seal flat roofing
                applications like RVs, tractor trailers, commercial flat roofs, residential flat roofs, and
                more.
              </p>
              <p
                className="animate-fade-up text-white/60 leading-relaxed mb-7 max-w-xl mx-auto lg:mx-0"
                style={fadeDelay(220)}
              >
                Liquid-applied, seamless, permanent, and backed by a fifty year product warranty. Crazy Seal
                simplifies roofing so just about anyone can install it, for a fraction of the cost of other
                roofing types. The secret: a 3 part sealing system made of an advanced formulation of
                fiber-infused silicone.
              </p>
              <div
                className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
                style={fadeDelay(300)}
              >
                <LinkButton href="/kit-builder" variant="accent" size="lg">
                  <ShoppingCart className="w-5 h-5" />
                  Shop Kits
                </LinkButton>
                <LinkButton
                  href={`${MEDIA}/2019/07/Crazy-Seal-Brochure-for-Download.pdf`}
                  variant="white"
                  size="lg"
                  external
                >
                  <Download className="w-5 h-5" />
                  Download the Brochure
                </LinkButton>
              </div>
              <HeroChips
                delay={380}
                className="mt-8 justify-center lg:justify-start"
                items={[
                  { icon: ShieldCheck, label: '50 year warranty' },
                  { icon: Hammer, label: 'Do it yourself' },
                  { icon: Layers, label: '3 part sealing system' },
                ]}
              />
            </div>

            <HeroMedia className="mx-auto w-full max-w-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download-1-Small.jpg`}
                alt="The Crazy Seal System brochure"
                className="w-full h-auto rounded-2xl shadow-2xl ring-1 ring-white/15 transition-transform duration-700 hover:-rotate-1 hover:scale-[1.02]"
              />
              <div className="hidden md:flex absolute -left-8 -bottom-6 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-1 ring-primary/10 animate-float">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="text-left leading-tight">
                  <p className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">50 Years</p>
                  <p className="text-xs font-medium text-gray-500">Product warranty</p>
                </div>
              </div>
              <div
                className="hidden md:flex absolute -right-5 -top-5 items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float"
                style={{ animationDelay: '-3.5s' }}
              >
                <Layers className="h-4 w-4" />
                Fiber-infused silicone
              </div>
            </HeroMedia>
          </div>
        </HeroShell>
      </Container>

      {/* ─── BADGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-6">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:px-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-6 items-start">
            {BADGES.map((badge, i) => (
              <div
                key={badge.label}
                className={`group flex flex-col items-center text-center gap-3 ${i === BADGES.length - 1 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <div className="relative grid h-24 w-24 place-items-center">
                  <div
                    aria-hidden="true"
                    className="absolute inset-1 rounded-full bg-gradient-to-br from-secondary/10 via-white to-accent/15 ring-1 ring-primary/[0.06] transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={badge.image}
                    alt={badge.label}
                    className="relative h-20 w-auto object-contain transition-transform duration-500 group-hover:-translate-y-1 group-hover:-rotate-6"
                  />
                </div>
                <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-primary">{badge.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── MODERN TECH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2025/01/U.S.-Patent-Crazy-Seal-1024x819.png`}
                alt="Crazy Seal U.S. Patent"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="An Engineering Marvel"
                heading="Modern Tech Taking On an Old Challenge"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-6">
                Our chemical strategists and product testing teams spent years developing what may well be
                the strongest fluid-applied membrane ever brought to market — now patented and backed by a
                fifty year warranty.
              </p>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/60">
                For decades, there has been a huge gap in roofing
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
                {[
                  { title: 'Low-grade coatings', desc: 'Temporary at best', good: false },
                  { title: 'Inferior membranes', desc: 'Often fail within 3-5 years', good: false },
                  { title: 'Crazy Seal', desc: 'Affordable, high-grade, built to stand the test of time', good: true },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-2xl p-4 ring-1 ${
                      item.good
                        ? 'bg-gradient-to-br from-primary to-secondary text-white ring-primary shadow-glow-primary'
                        : 'bg-slate-50 ring-primary/[0.08]'
                    }`}
                  >
                    <span
                      className={`mb-2 grid h-7 w-7 place-items-center rounded-full ${
                        item.good ? 'bg-highlight text-primary' : 'bg-primary/[0.06] text-gray-400'
                      }`}
                    >
                      {item.good ? <Check className="h-4 w-4" strokeWidth={3} /> : <X className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <p className={`font-extrabold leading-snug ${item.good ? 'text-white' : 'text-primary'}`}>{item.title}</p>
                    <p className={`text-sm leading-snug ${item.good ? 'text-white/75' : 'text-gray-500'}`}>{item.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed">
                High quality materials used to be available only to large roofing contractors. We&apos;ve
                changed that with Crazy Seal! It&apos;s time to take care of the small and mid-size project.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── OUR PRODUCTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="What's In the System" heading="Our Products" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {PRODUCTS.map((product) => (
              <TiltCard key={product.name}>
                <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-shadow duration-500 hover:shadow-xl">
                  <div className="relative grid h-48 place-items-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-accent/10">
                    <div aria-hidden="true" className="absolute bottom-6 h-6 w-1/2 rounded-full bg-primary/15 blur-xl" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.image}
                      alt={product.name}
                      className="relative h-36 w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-3"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm ring-1 ring-primary/10">
                      {product.role}
                    </span>
                  </div>
                  <div className="flex-1 p-5 md:p-6">
                    <h3 className="text-lg font-extrabold text-primary uppercase tracking-wide mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.desc}</p>
                  </div>
                </div>
              </TiltCard>
            ))}
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-center shadow-xl">
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-highlight/20 blur-3xl" />
              <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40" />
              <h3 className="relative text-2xl font-extrabold text-white mb-2">Ready to Get Started?</h3>
              <p className="relative text-white/70 leading-relaxed mb-6">
                All Crazy Seal products ship directly to your door.
              </p>
              <div className="relative flex flex-col gap-3">
                <LinkButton href="/kit-builder" variant="accent" size="md">
                  <ShoppingCart className="w-4 h-4" />
                  Shop Product Kits
                </LinkButton>
                <LinkButton href="/kit-builder" variant="outline-white" size="md">
                  Build My Kit
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ONE SEAMLESS SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <SectionHeading
            eyebrow="3 Part Sealing System"
            heading="Multiple Components — One Seamless System"
            subheading="Every component is derived from the same base formula, so they merge seamlessly into a single membrane — sealing all penetrations and covering every square inch of your roof with a custom fit membrane."
            variant="dark"
          />
          <Stagger className="flex flex-wrap items-center justify-center gap-2 sm:gap-4" stagger={0.18}>
            {SYSTEM_PARTS.map((item, i) => (
              <Fragment key={item.name}>
                <StaggerItem>
                  <div className="group flex w-[5.5rem] flex-col items-center gap-3 rounded-3xl bg-white/[0.06] px-2 py-4 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25 sm:w-36 sm:py-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-20 sm:h-32 w-auto object-contain drop-shadow-[0_14px_20px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-110"
                    />
                    <p className="text-[11px] sm:text-sm font-bold uppercase tracking-wide text-white text-center">
                      {item.name}
                    </p>
                  </div>
                </StaggerItem>
                {i < SYSTEM_PARTS.length - 1 && (
                  <StaggerItem>
                    <span aria-hidden="true" className="text-2xl sm:text-4xl font-extrabold text-highlight">
                      +
                    </span>
                  </StaggerItem>
                )}
              </Fragment>
            ))}
            <StaggerItem>
              <span aria-hidden="true" className="px-1 text-2xl sm:text-4xl font-extrabold text-highlight">
                =
              </span>
            </StaggerItem>
            <StaggerItem>
              <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-br from-accent-light to-accent-dark px-5 py-4 text-left text-white shadow-glow-accent sm:px-6 sm:py-5">
                <Layers className="h-7 w-7 shrink-0" />
                <p className="font-extrabold leading-tight">
                  One seamless,
                  <br />
                  custom fit membrane
                </p>
              </div>
            </StaggerItem>
          </Stagger>
        </div>
      </Container>

      {/* ─── TRANSFORMATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Before & After"
            heading="Transformations"
            subheading="Slide the center bar back and forth to see the transformations!"
          />
          <BeforeAfterGrid items={TRANSFORMATIONS} />
        </div>
      </Container>

      {/* ─── INSTALLATION EXAMPLE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="It Really Is This Simple" heading="Simple Installation Example" />
          <StepTimeline steps={INSTALL_STEPS} />
          <div className="group mt-10 md:mt-12 flex flex-col lg:flex-row items-center gap-5 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-5 sm:p-6 ring-1 ring-primary/[0.06] text-center lg:text-left">
            <IconTile icon={PlayCircle} />
            <p className="flex-1 font-semibold text-primary">
              Every kit includes 24/7 access to detailed installation videos and PDFs for applying our DIY
              system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/kit-builder" variant="primary" size="md">
                <ShoppingCart className="w-4 h-4" />
                Shop Kits
              </LinkButton>
              <LinkButton href="/contact" variant="outline" size="md" className="border-primary/30 text-primary">
                Questions? Contact Us
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── 21½ REASONS VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Why Crazy Seal?"
                heading="21½ Reasons Why"
                variant="dark"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-7">
                Watch our 21&frac12; Reasons Why Crazy Seal is a Superior Roofing System video, and download
                the free PDF explaining each of the concepts one by one.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <LinkButton href={`${MEDIA}/2020/02/21-Reasons.pdf`} variant="white" size="lg" external>
                  <Download className="w-5 h-5" />
                  Download the PDF
                </LinkButton>
                <LinkButton href="/advantages" variant="outline-white" size="lg">
                  More Advantages
                  <ArrowUpRight className="w-5 h-5" />
                </LinkButton>
              </div>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
              />
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15">
                {!videoPlaying ? (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 w-full h-full group cursor-pointer"
                    aria-label="Play video"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                      alt="21 and a half reasons why Crazy Seal video"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="relative grid place-items-center">
                        <span className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring sm:h-24 sm:w-24" />
                        <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1 fill-primary/10" />
                        </span>
                      </span>
                    </div>
                    <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-semibold tracking-wide">
                      Click to watch (10:24)
                    </p>
                  </button>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/C5FvTulPDaY?autoplay=1&rel=0"
                    title="21 1/2 Reasons Why to Choose Crazy Seal"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                )}
              </div>
              {/* Count-up badge */}
              <div
                aria-hidden="true"
                className="absolute -left-3 -top-6 sm:-left-6 flex items-baseline gap-1 rounded-2xl bg-white px-4 py-2.5 shadow-2xl ring-1 ring-primary/10 animate-float"
              >
                <span className="text-3xl sm:text-4xl font-extrabold text-primary font-[family-name:var(--font-display)] leading-none">
                  <CountUp value={21} duration={2} />
                  <span className="text-accent">½</span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">reasons</span>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
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

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta variant="dark" />
      </Container>
    </>
  )
}
