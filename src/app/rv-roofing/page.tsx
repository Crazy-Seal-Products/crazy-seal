import type { Metadata } from 'next'
import {
  Check,
  Download,
  Layers,
  Phone,
  PiggyBank,
  ShieldCheck,
  Thermometer,
  Wrench,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { CountUp, GlowOrb, Stagger, StaggerItem } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'RV Roofing',
  description:
    'The Crazy Seal RV Roof System, professionally installed. A seamless, fiber-infused silicone roofing membrane backed by a 50 year product warranty.',
}

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp-400x400.jpg`,
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    photo: `${MEDIA}/2019/07/Metal-Closeup-400x400.jpg`,
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
    text: 'After viewing the DIY videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

const THREE_PART_SYSTEM = [
  { label: 'Crazy Caulk', image: `${MEDIA}/2019/06/045-Caulk-Seams.jpg` },
  { label: 'Crazy Patch', image: `${MEDIA}/2019/06/049-Patch-After.jpg` },
  { label: 'Crazy Seal', image: `${MEDIA}/2019/06/100-Roller.jpg` },
]

const TRADITIONAL_ROOF_IMAGES = [
  `${MEDIA}/2020/03/Traditional-Roof-1-1024x576.jpg`,
  `${MEDIA}/2020/03/Traditional-Roof-2-1024x576.jpg`,
  `${MEDIA}/2020/03/Traditional-Roof-3-960.jpg`,
]

const WATER_DAMAGE = [
  `${MEDIA}/2020/07/Roof-Water-Damage-3-1024x576.jpg`,
  `${MEDIA}/2020/07/Roof-Water-Damage-1-1024x576.jpg`,
  `${MEDIA}/2020/07/Roof-Water-Damage-4-1024x576.jpg`,
]

const TRANSFORMATIONS = [
  {
    label: 'Skylight & Solar',
    before: `${MEDIA}/2019/07/Skylight-Solar-Before-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Skylight-Solar-After-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Antenna & Penetrations',
    before: `${MEDIA}/2019/07/Antennae-Before-2-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Antennae-After-2-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Termination Bar',
    before: `${MEDIA}/2019/07/Termination-Bar-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Termination-Bar-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
  {
    label: 'Roof Vent',
    before: `${MEDIA}/2019/07/Vent-Before-1-1024x683.jpg`,
    after: `${MEDIA}/2019/07/Vent-After-1-1024x683.jpg`,
    aspect: '3/2',
  },
]

const FULL_ROOF_TRANSFORMATIONS = [
  {
    label: 'Winnebago Front',
    before: `${MEDIA}/2019/07/Winnebago-Before-1-1024x1024.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-After-1-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Winnebago Aerial',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Winnebago Rear',
    before: `${MEDIA}/2019/07/Winnebago-Before-2-1024x1024.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-After-2-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const DOUBLE_LAYER_TRANSFORMATIONS = [
  {
    label: 'Monaco Coach 1',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-2-Crazy-Seal.jpg`,
  },
  {
    label: 'Monaco Coach 2',
    before: `${MEDIA}/2019/05/Monaco-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Monaco-Vertical-After-1-Crazy-Seal.jpg`,
  },
  {
    label: 'Aruba Trailer 1',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-1-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-1-Crazy-Seal.jpg`,
  },
  {
    label: 'Aruba Trailer 2',
    before: `${MEDIA}/2019/05/Aruba-Vertical-Before-2-Crazy-Seal.jpg`,
    after: `${MEDIA}/2019/05/Aruba-Vertical-After-2-Crazy-Seal.jpg`,
  },
]

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Product Warranty' },
  { icon: Layers, label: 'Seamless silicone membrane' },
  { icon: Wrench, label: 'Professionally installed' },
]

const TRADITIONAL_STEPS = [
  'A substrate like rubber or EPDM is laid down first with adhesive.',
  'Components are screwed, tacked and nailed on top — creating hundreds of potential leak points.',
  'Only a layer of sealant protects those penetrations, and over time it can rot or deteriorate.',
]

const CRAZY_SEAL_STEPS = [
  'Our specially formulated caulk and mastic seal every seam and penetration first.',
  'A final membrane is applied on top of the sealed penetrations.',
  'Every component shares the same base formula, merging into one seamless, chemically bonded membrane over every square inch.',
]

const HYBRID_TRAITS = [
  'Waterproof',
  'Highly reflective',
  'Scratch resistant',
  'Flexible',
  'Tough',
  'Maintenance free',
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

const SLIDER_CARD =
  'rounded-3xl bg-gradient-to-b from-slate-50 to-white p-2 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl'

export default function RvRoofingPage() {
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
                  RV Roofing
                </h1>
                <p
                  {...enter(160)}
                  className="animate-fade-up text-xl sm:text-2xl font-extrabold mb-4"
                >
                  <span className="text-shimmer-highlight">The Crazy Seal RV Roof System</span>
                </p>
                <p
                  {...enter(240)}
                  className="animate-fade-up text-white/70 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0"
                >
                  Professionally installed, it permanently seals your RV roof with a
                  seamless, fiber-infused silicone membrane. Watch how.
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
                  videoId="418309408"
                  thumbnail={`${MEDIA}/2021/11/Pro-Installation-Video-Cover.jpg`}
                  title="The Crazy Seal RV Roof System professional installation"
                />
                <p className="text-center text-white/60 text-sm font-medium mt-3">
                  Click to watch the professional installation video
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── TRAILER LIFE FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <SectionHeading
                eyebrow="Featured in Trailer Life Magazine"
                heading="See Our Feature Article"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 md:mb-8">
                Download our Trailer Life Magazine feature explaining the
                revolutionary Crazy Seal roofing system.
              </p>
              <LinkButton
                href={`${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See Feature PDF
              </LinkButton>
            </div>
            <div className="relative grid grid-cols-2 gap-4 sm:gap-6">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
                alt="Trailer Life Magazine May 2020 cover"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Page-1-Small.jpg`}
                alt="Trailer Life Magazine article about Crazy Seal"
                className="relative mt-6 rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── IMAGES & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Crazy Reviews" heading="Images & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── HOW MUCH COULD YOU SAVE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-right-24 -top-24 h-80 w-80" color="rgb(91 164 17 / 0.22)" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center md:text-left">
              <span className="mx-auto md:mx-0 mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <PiggyBank className="h-7 w-7 text-highlight" />
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                How Much Could You Save?
              </h2>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                See how much you can save by having the Crazy Seal System
                professionally installed.
              </p>
              <LinkButton
                href={`${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See Savings PDF
              </LinkButton>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`}
                alt="Crazy Seal savings sheet page 1"
                className="rounded-2xl shadow-2xl ring-1 ring-white/15 w-full h-auto -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final2-791x1024-1.jpg`}
                alt="Crazy Seal savings sheet page 2"
                className="mt-6 rounded-2xl shadow-2xl ring-1 ring-white/15 w-full h-auto rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY CRAZY SEAL FOR YOUR ROOF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="3 Part Sealing System"
            heading="Why Crazy Seal For Your Roof?"
            subheading="Our multi-component system flips the roofing equation upside down."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
            {THREE_PART_SYSTEM.map((part, i) => (
              <div
                key={part.label}
                className="group overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={part.image}
                    alt={`${part.label} being applied`}
                    className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-primary shadow-lg">
                    {i + 1}
                  </span>
                </div>
                <p className="px-5 py-4 text-center font-extrabold uppercase tracking-wide text-primary">
                  {part.label}
                </p>
              </div>
            ))}
          </Grid>

          {/* Traditional roofing */}
          <div className="pt-10 md:pt-14">
            <div className="mx-auto max-w-3xl text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-primary mb-2">
                Traditional Roofing
              </h3>
              <p className="text-gray-500">Here&apos;s how a typical roof is put together:</p>
            </div>
            <ol className="mx-auto mb-8 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3">
              {TRADITIONAL_STEPS.map((step, i) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-4 ring-1 ring-primary/[0.06]"
                >
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-primary/[0.08] text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-gray-600">{step}</span>
                </li>
              ))}
            </ol>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {TRADITIONAL_ROOF_IMAGES.map((src, i) => (
                <div key={src} className="group overflow-hidden rounded-2xl shadow-md ring-1 ring-primary/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Traditional roofing penetrations example ${i + 1}`}
                    className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
              ))}
            </Grid>
          </div>

          {/* Water intrusion */}
          <div className="pt-10 md:pt-14">
            <div className="mx-auto max-w-2xl text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-primary mb-2">
                Water Intrusion Examples
              </h3>
              <p className="text-gray-500">
                That deterioration lets water in — and it can be incredibly destructive to
                your RV and everything inside.
              </p>
            </div>
            <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="md">
              {WATER_DAMAGE.map((src, i) => (
                <div key={src} className="group overflow-hidden rounded-2xl shadow-md ring-1 ring-primary/[0.08]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Roof water damage example ${i + 1}`}
                    className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
              ))}
            </Grid>
          </div>

          {/* The Crazy Seal system */}
          <div className="pt-10 md:pt-14">
            <div className="mx-auto max-w-3xl text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-extrabold text-primary mb-2">
                The Crazy Seal System
              </h3>
              <p className="text-gray-500">Crazy Seal does exactly the opposite:</p>
            </div>
            <ol className="mx-auto mb-4 grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3">
              {CRAZY_SEAL_STEPS.map((step) => (
                <li
                  key={step}
                  className="flex items-start gap-3 rounded-2xl bg-accent/[0.06] p-4 ring-1 ring-accent/20"
                >
                  <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-center text-sm font-semibold text-gray-500">
              Drag the sliders below to see the seamless membrane on every inch of the roof.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 pt-6">
            {TRANSFORMATIONS.map((t) => (
              <div key={t.label} className={SLIDER_CARD}>
                <div className="overflow-hidden rounded-2xl">
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio={t.aspect}
                  />
                </div>
                <p className="py-3 text-center text-sm font-bold text-primary">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 pt-4 lg:pt-6 items-end">
            {FULL_ROOF_TRANSFORMATIONS.map((t) => (
              <div key={t.label} className={SLIDER_CARD}>
                <div className="overflow-hidden rounded-2xl">
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio={t.aspect}
                  />
                </div>
                <p className="py-3 text-center text-sm font-bold text-primary">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── DOUBLE LAYER KIT INSTALLATION EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Before & After"
            heading="Double Layer Kit Installation Examples"
            subheading="Slide the center bar back and forth to see the transformations!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOUBLE_LAYER_TRANSFORMATIONS.map((t) => (
              <div key={t.label} className={SLIDER_CARD}>
                <div className="overflow-hidden rounded-2xl">
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio="1/1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ROOF TEMPERATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <div className="relative">
            <SectionHeading
              eyebrow="Highly Reflective"
              heading="Reduce Your Average Roof Temperature Dramatically"
              subheading="Shot before & after applying the Crazy Seal system at 95 degrees Fahrenheit outdoor temperature."
              variant="dark"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  src: `${MEDIA}/2019/07/TEMP-GAUGES-160-1024x582.jpg`,
                  alt: 'Roof temperature gauge reading 160 degrees before Crazy Seal',
                  label: 'Before Crazy Seal',
                  temp: 160,
                  chip: 'bg-white text-primary',
                },
                {
                  src: `${MEDIA}/2019/07/TEMP-GAUGES-104-1024x582.jpg`,
                  alt: 'Roof temperature gauge reading 104 degrees after Crazy Seal',
                  label: 'After Crazy Seal',
                  temp: 104,
                  chip: 'bg-accent text-white',
                },
              ].map((g) => (
                <div
                  key={g.label}
                  className="group rounded-3xl bg-white/[0.06] p-2 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.src}
                      alt={g.alt}
                      className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <span className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-extrabold shadow-xl ${g.chip}`}>
                      <Thermometer className="h-4 w-4" />
                      <CountUp value={g.temp} suffix="°F" />
                    </span>
                  </div>
                  <p className="py-3 text-center font-extrabold uppercase tracking-wide text-white">
                    {g.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Every Substrate" heading="Crazy Seal Can Be Applied to All Roof Types" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ROOF_TYPES.map((type) => (
              <div
                key={type}
                className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-slate-50 to-white py-5 text-center font-extrabold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/[0.08] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-accent/40"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15 text-accent-dark transition-transform duration-300 group-hover:scale-110">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {type}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── HYBRID ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <SectionHeading
                eyebrow="Advanced Technology"
                heading="The Crazy Seal Hybrid Roof System"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                The most advanced system ever developed. Originally built for RV&apos;s, it
                had to hold up on vehicles twisting, turning, starting, stopping, and
                screaming down the highway at 70 miles per hour in all types of
                environments.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Roofing fabric infused with the highest grade silicone money can buy. As
                each piece cures, fiber strands bond into a complex interstitial network —
                the strength of roofing fabric with the durability, flexibility and
                longevity of silicone. The result is a seamless, fiber reinforced membrane
                that is:
              </p>
              <Stagger className="flex flex-wrap gap-2" stagger={0.07}>
                {HYBRID_TRAITS.map((trait) => (
                  <StaggerItem key={trait}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3.5 py-2 text-sm font-semibold text-accent-dark ring-1 ring-accent/20">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      {trait}
                    </span>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-full bg-gradient-to-br from-secondary/20 via-transparent to-accent/25 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`}
                alt="Crazy Seal hybrid roof system product lineup"
                className="relative w-full h-auto animate-float-slow drop-shadow-[0_24px_30px_rgba(0,32,67,0.25)]"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── DUAL CLOSE: TALK TO US / BECOME A DEALER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <GlowOrb className="-left-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <GlowOrb className="-right-20 -bottom-24 h-72 w-72" color="rgb(91 164 17 / 0.22)" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Want This Roof on Your RV?
            </h2>
            <p className="text-white/70 text-base sm:text-lg mb-7 max-w-xl mx-auto">
              Talk to Crazy Seal directly and we&apos;ll connect you with the right kit or
              installer. Installers: this system was built for your business too.
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
        sourcePage="rv-roofing"
        defaultProjectType="RV Roof"
        heading="Talk to Crazy Seal About Your RV Roof"
      />
    </>
  )
}
