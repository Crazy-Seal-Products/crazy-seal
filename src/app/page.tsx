'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  Download,
  Phone,
  ShoppingCart,
  DollarSign,
  Timer,
  ShieldCheck,
  Hammer,
  Building2,
  Check,
  Flag,
  Truck,
  Droplets,
  Sun,
  Shield,
  Waves,
  Sparkles,
  Layers,
  Home,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { CoatingReveal } from '@/components/CoatingReveal'
import { QuoteButton } from '@/components/QuoteButton'
import { CountUp, GlowOrb, Marquee, Reveal, Stagger, StaggerItem } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const KIT_TYPES = [
  {
    title: 'RV Roofing Kit',
    desc: 'Everything to seal an RV roof for good, sized to your rig.',
    href: '/store/rv-roofing-kit',
    image: `${MEDIA}/2019/05/Double-White-100-300-Crazy-Seal-Flat-Roofing-Project-Kit-1024x336.png`,
    tag: 'Most popular',
  },
  {
    title: 'Build Your Kit',
    desc: 'Answer a few questions for a custom kit at live prices.',
    href: '/kit-builder#build',
    image: `${MEDIA}/2021/12/Build-Your-Own-Kit-Featured-Image-768x384.png`,
  },
  {
    title: 'Build It With a Rep',
    desc: 'A Crazy Seal rep sizes your roof and builds the kit with you.',
    href: '/kit-builder#rep',
    image: `${MEDIA}/2022/01/Crazy-Seal-Specialist-Image-768x768.png`,
  },
  {
    title: 'Individual Products',
    desc: 'Pick exactly the products you need.',
    href: '/kit-builder#products',
    image: `${MEDIA}/2020/03/Single-Layer-Kit-1-e1637944173532.png`,
  },
]

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

const ROOF_TYPES = [
  { label: 'RVs', href: '/rv-roofs' },
  { label: 'Box Trucks', href: '/box-trucks' },
  { label: 'Barns', href: '/barns' },
  { label: 'Sheds', href: '/sheds' },
  { label: 'Shipping Containers', href: '/shipping-containers' },
  { label: 'Metal Buildings', href: '/metal-buildings' },
  { label: 'Porch Roofs', href: '/porch-roofs' },
  { label: 'Sunrooms', href: '/sunrooms' },
  { label: 'Tiny Homes', href: '/tiny-homes' },
  { label: 'Commercial Flat Roofs', href: '/commercial-roofing' },
  { label: 'Tractor Trailers', href: '/tractor-trailers' },
  { label: 'Boat Houses', href: '/boat-houses' },
  { label: 'Self Storage', href: '/self-storage' },
  { label: 'Truck Campers', href: '/truck-campers' },
  { label: 'Outdoor Rooms', href: '/outdoor-rooms' },
]

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
    text: 'After viewing the installation videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Flag, label: 'Made in the USA' },
  { icon: Truck, label: 'Ships to your door' },
]

const MEMBRANE_TRAITS = [
  { icon: Droplets, label: 'Waterproof' },
  { icon: Sun, label: 'Highly reflective' },
  { icon: Shield, label: 'Scratch resistant' },
  { icon: Waves, label: 'Flexible' },
  { icon: Sparkles, label: 'Maintenance free' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

export default function HomePage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-12 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-8 lg:gap-12 items-center">
              {/* Left: Logo + Headline + Subtext + CTA */}
              <div className="text-center lg:text-left order-1">
                <div {...enter(0)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png`}
                    alt="Crazy Seal"
                    className="h-24 sm:h-28 lg:h-32 w-auto mx-auto lg:mx-0 mb-5 drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                  />
                </div>
                <h1
                  {...enter(160)}
                  className="animate-fade-up text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4 text-balance"
                >
                  The Crazy Seal Roofing System.{' '}
                  <span className="text-shimmer-highlight">So Good It&apos;s Patented!</span>
                </h1>

                <p
                  {...enter(240)}
                  className="animate-fade-up hidden lg:block text-lg text-white/70 max-w-xl mb-7 leading-relaxed"
                >
                  A seamless, fluid-applied roof backed by a 50 year warranty. A specialist builds your
                  kit with you — or price it and shop on your own.
                </p>
                <div {...enter(320)} className="animate-fade-up hidden lg:flex flex-wrap items-center gap-3">
                  <QuoteButton size="lg" sourcePage="home-hero" />
                  <LinkButton href="/kit-builder" variant="white" size="lg">
                    See Kit Pricing
                  </LinkButton>
                  <LinkButton href="/kit-builder" variant="outline-white" size="lg">
                    <ShoppingCart className="w-5 h-5" />
                    Shop Kits
                  </LinkButton>
                </div>
                <ul {...enter(400)} className="animate-fade-up hidden lg:flex flex-wrap gap-x-6 gap-y-2 mt-8">
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

              {/* Right: Video with floating badges */}
              <div {...enter(200)} className="animate-fade-up relative order-2">
                <div className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl" aria-hidden="true" />
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
                        alt="Crazy Seal Roofing System overview video"
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
                        Watch the full overview
                      </p>
                    </button>
                  ) : (
                    <iframe
                      src="https://www.youtube.com/embed/C5FvTulPDaY?autoplay=1&rel=0"
                      title="Crazy Seal Overview Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>

                {/* Floating badges (desktop) */}
                <div className="hidden md:flex absolute -left-6 -bottom-6 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-1 ring-primary/10 animate-float">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div className="text-left leading-tight">
                    <p className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">50 Years</p>
                    <p className="text-xs font-medium text-gray-500">Warranty coverage</p>
                  </div>
                </div>
                <div
                  className="hidden md:flex absolute -right-4 -top-5 items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float"
                  style={{ animationDelay: '-3.5s' }}
                >
                  <Layers className="h-4 w-4" />
                  Fiber-infused silicone
                </div>
              </div>

              {/* Subtext + CTA — mobile only, below video */}
              <div className="text-center lg:hidden order-3">
                <p className="text-base sm:text-lg text-white/70 max-w-lg mx-auto mb-5 leading-relaxed">
                  A seamless, fluid-applied roof backed by a 50 year warranty. A specialist builds your kit
                  with you.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <QuoteButton size="md" sourcePage="home-hero" />
                  <LinkButton href="/kit-builder" variant="white" size="md">
                    See Kit Pricing
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EVERY FLAT ROOF (ticker) ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <div className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-primary/[0.07] md:flex-row md:items-stretch">
          <div className="relative flex shrink-0 items-center justify-center gap-3 bg-primary px-5 py-3 text-white md:w-60 md:justify-start md:py-0">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-highlight text-primary shadow-glow-highlight">
              <Home className="h-4.5 w-4.5" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] font-semibold text-white/60">Crazy Seal seals</span>
              <span className="block text-base font-extrabold font-[family-name:var(--font-display)]">Every Flat Roof</span>
            </span>
            {/* angled edge into the ticker (desktop) */}
            <span aria-hidden="true" className="absolute -right-4 top-0 hidden h-full w-8 skew-x-[-12deg] bg-primary md:block" />
          </div>
          <Marquee duration={60} className="flex-1 py-3.5 md:py-4">
            {ROOF_TYPES.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group mx-5 inline-flex items-center gap-5 whitespace-nowrap text-base font-extrabold tracking-tight text-primary/80 transition-colors hover:text-accent-dark md:text-lg font-[family-name:var(--font-display)]"
              >
                <span className="relative">
                  {r.label}
                  <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full" />
                </span>
                <svg aria-hidden="true" viewBox="0 0 20 12" className="h-3 w-5 text-highlight-dark">
                  <path d="M1 11 10 2l9 9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </Marquee>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative">
              <div aria-hidden="true" className="absolute -inset-4 -z-0 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/09-3-Pieces-System-1024x576.jpg`}
                alt="The Crazy Seal 3 part sealing system"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="DIY Roofing Done Right"
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-5">
                A patented, fluid-applied, seamless roofing system that permanently seals flat and
                low-slope roofs — and simplifies roofing so just about anyone can install it.
              </p>
              <ul className="space-y-2.5 mb-7">
                {[
                  'RVs, trailers, fleets, homes and commercial roofs',
                  'Fiber-reinforced silicone — no cheap fillers',
                  'Backed by our 50 year warranty',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-3 gap-3 mb-7">
                {[
                  { value: 50, suffix: ' yr', label: 'Warranty' },
                  { value: 3, suffix: '-part', label: 'Sealing system' },
                  { value: 0, suffix: '', label: 'Seams' },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-gradient-to-b from-slate-50 to-white px-3 py-4 text-center ring-1 ring-primary/[0.08]">
                    <p className="text-2xl md:text-3xl font-extrabold text-primary font-[family-name:var(--font-display)]">
                      <CountUp value={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
              <LinkButton href="/crazy-seal" variant="primary" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PATH PICKER: BUYER OR DEALER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            heading="Which Best Describes You?"
            subheading="Need a roof, or want to build a business installing them? We've got you."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {[
              {
                icon: Hammer,
                title: 'I Need to Fix a Roof',
                desc: 'RV, home, commercial or fleet — a specialist sizes your roof and builds the perfect kit with you.',
                glow: 'from-highlight/25',
                actions: (
                  <>
                    <QuoteButton size="md" sourcePage="home-path-picker" />
                    <LinkButton href="/kit-builder" variant="outline-white" size="md">
                      See Kit Pricing
                    </LinkButton>
                  </>
                ),
              },
              {
                icon: Building2,
                title: 'I Want to Sell & Install',
                desc: 'Join the dealer network. No franchise fees, no inventory requirements — plus a full training portal.',
                glow: 'from-accent/30',
                actions: (
                  <>
                    <LinkButton href="/professionals" variant="accent" size="md">
                      Become a Dealer
                    </LinkButton>
                    <LinkButton href="/ways-to-earn" variant="outline-white" size="md">
                      See Ways to Earn
                    </LinkButton>
                  </>
                ),
              },
            ].map(({ icon: Icon, title, desc, glow, actions }) => (
              <div
                key={title}
                className="group relative overflow-hidden rounded-3xl bg-white/[0.06] p-6 lg:p-10 text-center ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b ${glow} to-transparent blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`}
                />
                <span className="relative mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="h-8 w-8 text-highlight" />
                </span>
                <h3 className="relative text-xl lg:text-2xl font-extrabold text-white mb-3">{title}</h3>
                <p className="relative text-white/70 leading-relaxed mb-7 max-w-md mx-auto">{desc}</p>
                <div className="relative flex flex-wrap justify-center gap-3">{actions}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── WHY IS IT BETTER + ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="You Can Buy Cheaper. You Can't Buy Better."
            heading="Why is Crazy Seal Better?"
            subheading="Built from thousands of flat roof installs — and designed with you in mind."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              image={`${MEDIA}/2022/03/09-Rebar-768x432.jpg`}
              title="Fiber Infusion"
              description="Polyethylene fibers work like rebar in concrete — more strength, durability and scratch resistance."
            />
            <FeatureCard
              image={`${MEDIA}/2022/03/10-35-vs-94-768x432.jpg`}
              title="More Actual Silicone"
              description="No cheap fillers. Pharmaceutical-grade silicone and silica — more of the good stuff in every bucket."
            />
            <FeatureCard
              image={`${MEDIA}/2022/03/18-Installation-1024x576.jpg`}
              title="3 Part Sealing System"
              description="Eliminate problem areas first, then finish with a seamless membrane over every square inch."
            />
          </Grid>

          {/* Advantages strip */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-3 ring-1 ring-primary/[0.06]">
            {[
              { icon: DollarSign, title: 'Save Money', desc: 'Factory-direct, no routine maintenance.' },
              { icon: Timer, title: 'Quick Install', desc: 'A new roof within hours of delivery.' },
              { icon: ShieldCheck, title: '50 Year Warranty', desc: 'Do it right. Do it once.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-primary/[0.06] transition-all duration-300 hover:shadow-md">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-primary">{title}</p>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-8 md:pt-10">
            <LinkButton href="/crazy-seal" variant="primary" size="md">
              See 21½ Reasons Why
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
            <LinkButton
              href={`${MEDIA}/2020/02/21-Reasons.pdf`}
              variant="outline"
              size="md"
              className="border-primary text-primary"
              external
            >
              <Download className="w-4 h-4" />
              Download the PDF
            </LinkButton>
            <LinkButton href="/advantages" variant="outline" size="md" className="border-primary/30 text-primary">
              More Advantages
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── KIT TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Want a Quick Price?"
            heading="Choose a Kit Type to Get Started"
            subheading="Every kit is sized and priced to your exact roof — and ships straight to your door."
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KIT_TYPES.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-2 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-24px_rgba(0,0,0,0.6)]"
              >
                <div className="relative grid h-36 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10">
                  <div aria-hidden="true" className="absolute inset-x-8 bottom-4 h-6 rounded-full bg-primary/10 blur-xl" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={kit.image}
                    alt={kit.title}
                    className="relative max-h-24 w-auto max-w-[85%] object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:-rotate-1"
                  />
                  {kit.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-highlight px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm">
                      {kit.tag}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-4 pb-4 pt-4 text-left">
                  <h3 className="font-extrabold text-primary text-lg">{kit.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{kit.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent-dark">
                    Shop Now
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
            <LinkButton href="/kit-builder" variant="white" size="md">
              See Kit Pricing Online
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 text-accent-light" />
              (800) 963-0131 · M–F 9AM–6PM EST
            </a>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Every Flat Roof" heading="Find Your Application" />
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
        </div>
      </Container>

      {/* ─── HYBRID SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Advanced Technology"
                heading="The Crazy Seal Hybrid Roof System"
                variant="dark"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                Roofing fabric infused with the highest grade silicone money can buy. As it cures, the
                fibers bond into one seamless, reinforced membrane.
              </p>
              <Stagger className="flex flex-wrap justify-center md:justify-start gap-2 mb-8" stagger={0.07}>
                {MEMBRANE_TRAITS.map(({ icon: Icon, label }) => (
                  <StaggerItem key={label}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15">
                      <Icon className="h-4 w-4 text-highlight" />
                      {label}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
              <LinkButton href="/crazy-seal" variant="white" size="lg">
                Learn More About Our System
                <ArrowRight className="w-5 h-5" />
              </LinkButton>
            </div>

            {/* Before/after: a roller "coats" the roof on first view, then it's draggable */}
            <CoatingReveal
              className="mx-auto w-full max-w-md"
              beforeSrc="/home/hybrid-before.webp"
              afterSrc="/home/hybrid-after.webp"
              beforeAlt="Weathered standing-seam metal roof before Crazy Seal"
              afterAlt="The same metal roof sealed with the white Crazy Seal membrane"
            />
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS + PRESS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Crazy Reviews" heading="What Customers Are Saying" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
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

          {/* Trailer Life press band */}
          <Reveal className="mt-10 md:mt-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-5 sm:p-6 md:p-8 shadow-xl">
              <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl" />
              <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
                  alt="Trailer Life Magazine May 2020 cover"
                  className="h-40 sm:h-44 w-auto rounded-xl shadow-2xl ring-1 ring-white/20 -rotate-3 transition-transform duration-500 hover:rotate-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-highlight mb-2">As featured in Trailer Life Magazine</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Read the feature article
                  </h2>
                  <p className="mt-2 text-white/70">How the Crazy Seal system is changing RV roofing.</p>
                </div>
                <LinkButton href={`${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`} variant="white" size="md" external>
                  <Download className="w-4 h-4" />
                  Feature PDF
                </LinkButton>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
