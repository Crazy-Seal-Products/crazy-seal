import type { Metadata } from 'next'
import {
  ArrowRight,
  ArrowUpRight,
  DollarSign,
  Timer,
  ShieldCheck,
  BadgeCheck,
  Hammer,
  Truck,
  PiggyBank,
  Smile,
  Sun,
  Shuffle,
  Dumbbell,
  Sparkles,
  Feather,
  Ruler,
  FlaskConical,
  Layers,
  CloudLightning,
  Hourglass,
  Scissors,
  Droplets,
  SunDim,
  Store,
  Waves,
  Check,
  Thermometer,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { CountUp } from '@/components/motion'
import {
  ColorSwatches,
  ContactCta,
  DARK_CARD,
  HERO_H1,
  HeroShell,
  IconTile,
  MEDIA,
  SECTION_NAVY,
  SECTION_WHITE,
  fadeDelay,
} from '@/components/system-pages/blocks'

export const metadata: Metadata = {
  title: 'Crazy Seal Advantages',
  description:
    'The Crazy Seal roofing system has many advantages over traditional roofing methods.',
}

const TOP_ADVANTAGES = [
  {
    icon: DollarSign,
    title: 'Save Money',
    eyebrow: 'Do It Yourself & Save Big',
    desc: 'Much of the cost of a typical roofing installation is labor. Do it yourself and save big with raw materials factory direct from Crazy Seal!',
    href: '/kit-builder',
    cta: 'Build My Kit',
  },
  {
    icon: Timer,
    title: 'Quick Install',
    eyebrow: 'Get the Job Done Fast',
    desc: 'Hiring a roofing technician can take weeks or even months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit.',
    href: '/installation',
    cta: 'Installation',
  },
  {
    icon: ShieldCheck,
    title: 'Permanent',
    eyebrow: '50 Year Product Warranty',
    desc: "If it's worth doing, it's worth doing right. Skip the bandaid — do it right and do it once with the Crazy Seal roofing system.",
    href: '/warranty',
    cta: 'Warranty',
  },
]

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

const ALL_ADVANTAGES = [
  { icon: BadgeCheck, title: 'Guaranteed', desc: 'A fully transferrable 50 year product warranty.' },
  { icon: Hammer, title: 'DIY', desc: 'For the DIY person looking for a long-term roofing solution.' },
  { icon: Truck, title: 'We Ship to You', desc: 'We ship anywhere within the United States and Canada.' },
  { icon: PiggyBank, title: 'Affordable', desc: "Our DIY application can save you $1,000's on your roofing needs." },
  { icon: Smile, title: 'Easy', desc: 'Easy application that sticks to most surfaces without a primer.' },
  { icon: Sun, title: 'Energy Efficient', desc: 'Reflective properties help reduce interior temperature and A/C expense.' },
  { icon: Shuffle, title: 'Versatile', desc: 'Works for a variety of applications, not just roofing.' },
  { icon: Dumbbell, title: 'Heavy Duty', desc: 'Fiber-infused, making it scratch resistant, strong & tough.' },
  { icon: Sparkles, title: 'No Upkeep', desc: "Won't crack, chip, peel, or streak. No need to climb on your roof again." },
  { icon: Feather, title: 'Lightweight', desc: "Extremely light. It won't add stress to your roof or chassis." },
  { icon: Ruler, title: 'Custom Fit', desc: 'Starts out as a liquid, then dries into a seamless, maintenance free roof.' },
  { icon: FlaskConical, title: 'Resistant', desc: 'Resists mold penetration, fungus, salt and acids. Chemical resistant overall.' },
  { icon: Layers, title: 'Direct Application', desc: 'Installs directly to decking. No existing roof membrane is required.' },
  { icon: CloudLightning, title: 'Extreme', desc: 'Designed to perform in all kinds of extreme weather conditions.' },
  { icon: Hourglass, title: 'Long Lasting', desc: 'Our system is designed to last a crazy long time.' },
  { icon: Scissors, title: 'Tear Resistant', desc: 'Puncture and tear resistant, for whatever craziness your roof encounters!' },
  { icon: Droplets, title: 'Waterproof', desc: 'Superior waterproofing capabilities.' },
  { icon: SunDim, title: 'UV Protection', desc: 'Superior UV protection with high reflectivity.' },
  { icon: Store, title: 'Exclusive', desc: 'Ships direct from manufacturer. Not available in stores.' },
  { icon: Waves, title: 'Flexible', desc: 'Extremely flexible, allowing it to flex without cracking.' },
]

const APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches, and more.",
    href: '/rv-roofs',
    cta: 'RV Roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
    href: '/commercial-roofing',
    cta: 'Commercial Flat Roofs',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential roofs, sunrooms, storage buildings, and more.',
    href: '/residential',
    cta: 'Residential Flat Roofs',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    href: '/transportation',
    cta: 'Transportation Roofs',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
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
    text: 'After viewing the videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

const TEMPS = [
  {
    label: 'Before Crazy Seal',
    value: 160,
    image: `${MEDIA}/2019/07/TEMP-GAUGES-160.jpg`,
    alt: 'Roof temperature gauge reading 160 degrees before Crazy Seal',
    tone: 'bg-primary text-white',
  },
  {
    label: 'After Crazy Seal',
    value: 104,
    image: `${MEDIA}/2019/07/TEMP-GAUGES-104.jpg`,
    alt: 'Roof temperature gauge reading 104 degrees after Crazy Seal',
    tone: 'bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent',
  },
]

export default function AdvantagesPage() {
  return (
    <>
      {/* ─── HERO + TOP 3 ADVANTAGES ─── */}
      <Container size="xl">
        <HeroShell>
          <div className="text-center mb-8 lg:mb-12">
            <h1 className={HERO_H1} style={fadeDelay(80)}>
              Crazy Seal <span className="text-shimmer-highlight">Advantages</span>
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {TOP_ADVANTAGES.map(({ icon: Icon, ...item }, i) => (
              <div
                key={item.title}
                className={`animate-fade-up group relative overflow-hidden p-6 lg:p-8 text-center flex flex-col items-center ${DARK_CARD} hover:-translate-y-1`}
                style={fadeDelay(180 + i * 100)}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/30 to-transparent blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="relative mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="h-7 w-7 text-highlight" />
                </span>
                <h2 className="relative text-xl lg:text-2xl font-extrabold text-white mb-1">{item.title}</h2>
                <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-highlight mb-3">
                  {item.eyebrow}
                </p>
                <p className="relative text-white/70 leading-relaxed mb-6">{item.desc}</p>
                <div className="relative mt-auto">
                  <LinkButton href={item.href} variant="accent" size="md">
                    {item.cta}
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                </div>
              </div>
            ))}
          </div>
        </HeroShell>
      </Container>

      {/* ─── ROOF TEMPERATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Energy Efficient"
            heading="Reduce Your Average Roof Temperature Dramatically"
            subheading="Shot before & after applying the Crazy Seal system at 95 degrees Fahrenheit outdoor temperature."
          />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TEMPS.map((t) => (
              <div key={t.label} className="group text-center">
                <div className="relative overflow-hidden rounded-3xl shadow-xl ring-1 ring-primary/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.alt}
                    className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-2xl sm:text-3xl font-extrabold font-[family-name:var(--font-display)] leading-none ${t.tone}`}
                  >
                    <Thermometer className="h-5 w-5" />
                    <CountUp value={t.value} suffix="°F" duration={1.8} />
                  </div>
                </div>
                <h3 className={`mt-4 text-lg font-extrabold ${t.value > 150 ? 'text-primary' : 'text-accent-dark'}`}>
                  {t.label}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <SectionHeading
            eyebrow="Bonds to Just About Anything"
            heading="Crazy Seal Can Be Applied to All Roof Types"
            variant="dark"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {ROOF_TYPES.map((type) => (
              <div
                key={type}
                className={`group flex items-center justify-center gap-2.5 py-5 px-3 hover:-translate-y-1 ${DARK_CARD}`}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/25 ring-1 ring-accent/40 transition-transform duration-500 group-hover:rotate-[360deg]">
                  <Check className="h-4 w-4 text-accent-light" strokeWidth={3} />
                </span>
                <p className="text-white font-extrabold uppercase tracking-wide">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ColorSwatches />
      </Container>

      {/* ─── FULL ADVANTAGES GRID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Do It Once. Do It Right."
            heading="Crazy Seal Advantages"
            subheading={`${ALL_ADVANTAGES.length} advantages over traditional roofing methods.`}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
            {ALL_ADVANTAGES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="group flex items-start gap-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:ring-accent/30"
              >
                <IconTile icon={icon} className="h-11 w-11" />
                <div>
                  <h3 className="font-extrabold text-primary leading-snug">{title}</h3>
                  <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Every Flat Roof" heading="Crazy Seal Works on Just About Any Application" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full aspect-[9/7] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold text-primary">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-sm font-bold text-accent-dark">{app.cta}</span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
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
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta variant="dark" />
      </Container>
    </>
  )
}
