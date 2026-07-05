import type { Metadata } from 'next'
import {
  ArrowRight,
  Phone,
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
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Crazy Seal Advantages',
  description:
    'The Crazy Seal roofing system has many advantages over traditional roofing methods.',
}

const TOP_ADVANTAGES = [
  {
    icon: <DollarSign className="w-6 h-6 text-accent" />,
    title: 'Save Money',
    eyebrow: 'Do It Yourself & Save Big',
    desc: 'Much of the cost of a typical roofing installation comes with labor. Do it yourself and save big with raw materials factory direct from Crazy Seal!',
    href: '/pricing',
    cta: 'Pricing',
  },
  {
    icon: <Timer className="w-6 h-6 text-accent" />,
    title: 'Quick Install',
    eyebrow: 'Get the Job Done Fast',
    desc: 'Hiring a roofing technician can take several weeks or even months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit.',
    href: '/installation',
    cta: 'Installation',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-accent" />,
    title: 'Permanent',
    eyebrow: '50 Year Product Warranty',
    desc: "If it's worth doing, it's worth doing right. Rather than putting a bandaid on a problem, do it right and do it once with the Crazy Seal roofing system.",
    href: '/warranty',
    cta: 'Warranty',
  },
]

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

const COLORS = [
  { name: 'White', swatch: '#FFFFFF', border: true },
  { name: 'Gray', swatch: '#9CA3AF', border: false },
  { name: 'Tan', swatch: '#D2B48C', border: false },
]

const ALL_ADVANTAGES = [
  { icon: BadgeCheck, title: 'Guaranteed', desc: 'We offer a fully transferrable 50 year product warranty.' },
  { icon: Hammer, title: 'DIY', desc: 'For the DIY person looking for a long-term solution to their roofing needs.' },
  { icon: Truck, title: 'We Ship to You', desc: 'We ship anywhere within the United States and Canada.' },
  { icon: PiggyBank, title: 'Affordable', desc: "Our DIY application can save you $1,000's on your roofing needs." },
  { icon: Smile, title: 'Easy', desc: 'Easy application process that sticks to most surfaces without a primer.' },
  { icon: Sun, title: 'Energy Efficient', desc: 'Reflective properties help reduce interior temperature and A/C expense.' },
  { icon: Shuffle, title: 'Versatile', desc: 'Can be used for a variety of applications, not just roofing.' },
  { icon: Dumbbell, title: 'Heavy Duty', desc: 'Fiber-infused, making it scratch resistant, strong, & tough.' },
  { icon: Sparkles, title: 'No Upkeep', desc: "Won't crack, chip, peel, or streak. No need to climb on your roof again." },
  { icon: Feather, title: 'Lightweight', desc: 'Our Crazy Seal system is extremely light. It will not add stress to your roof or chassis.' },
  { icon: Ruler, title: 'Custom Fit', desc: 'Starts out as a liquid, but dries into a seamless, maintenance free roof.' },
  { icon: FlaskConical, title: 'Resistant', desc: 'Resistant to mold penetration, fungus, salt, acids, and overall is chemical resistant.' },
  { icon: Layers, title: 'Direct Application', desc: 'Can be installed directly to decking. No existing roof membrane is required.' },
  { icon: CloudLightning, title: 'Extreme', desc: 'The Crazy Seal system is designed to perform in all kinds of extreme weather conditions.' },
  { icon: Hourglass, title: 'Long Lasting', desc: 'Our system is designed to last a crazy long time.' },
  { icon: Scissors, title: 'Tear Resistant', desc: 'Designed to be puncture and tear resistant. Great for whatever craziness your roof encounters!' },
  { icon: Droplets, title: 'Waterproof', desc: 'Superior waterproofing capabilities.' },
  { icon: SunDim, title: 'UV Protection', desc: 'Offers superior UV protection with high reflectivity.' },
  { icon: Store, title: 'Exclusive', desc: 'Ships direct from manufacturer. Not available in stores.' },
  { icon: Waves, title: 'Flexible', desc: 'The Crazy Seal system is extremely flexible, allowing it to flex without cracking.' },
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

export default function AdvantagesPage() {
  return (
    <>
      {/* ─── HERO + TOP 3 ADVANTAGES ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-center mb-8 lg:mb-12">
              Crazy Seal Advantages
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {TOP_ADVANTAGES.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{item.title}</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-highlight mb-3">
                    {item.eyebrow}
                  </p>
                  <p className="text-white/60 leading-relaxed mb-6">{item.desc}</p>
                  <div className="mt-auto">
                    <LinkButton href={item.href} variant="accent" size="md">
                      {item.cta}
                      <ArrowRight className="w-4 h-4" />
                    </LinkButton>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ROOF TEMPERATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Reduce Your Average Roof Temperature Dramatically"
            subheading="Shot before & after applying the Crazy Seal system at 95 degrees Fahrenheit outdoor temperature."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/TEMP-GAUGES-160.jpg`}
                alt="Roof temperature gauge reading 160 degrees before Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto mb-4"
              />
              <h3 className="text-lg font-bold text-primary">Before Crazy Seal</h3>
            </div>
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/TEMP-GAUGES-104.jpg`}
                alt="Roof temperature gauge reading 104 degrees after Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto mb-4"
              />
              <h3 className="text-lg font-bold text-accent">After Crazy Seal</h3>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal Can Be Applied to All Roof Types"
            variant="dark"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {ROOF_TYPES.map((type) => (
              <div
                key={type}
                className="rounded-2xl bg-white/5 ring-1 ring-white/10 py-6 px-3 text-center"
              >
                <p className="text-white font-bold uppercase tracking-wide">{type}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── COLORS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Available in 3 Colors"
            subheading="You asked for it, and we delivered! Crazy Seal is now available in 3 colors. White provides ultimate reflectivity, while the tan and gray help you to match your style. Choose the color that suits you best! All the Crazy Caulk, Crazy Patch, and Crazy Seal in your kit will be color matching."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 max-w-3xl mx-auto">
            {COLORS.map((color) => (
              <div
                key={color.name}
                className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden text-center"
              >
                <div
                  className={`h-28 ${color.border ? 'border-b border-gray-200' : ''}`}
                  style={{ backgroundColor: color.swatch }}
                />
                <p className="font-bold text-primary uppercase tracking-wide py-4">
                  {color.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── FULL ADVANTAGES GRID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Do It Once. Do It Right."
            heading="Crazy Seal Advantages"
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
            {ALL_ADVANTAGES.map((item) => (
              <FeatureCard
                key={item.title}
                icon={<item.icon className="w-6 h-6 text-accent" />}
                title={item.title}
                description={item.desc}
              />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Works on Just About Any Application" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={app.image}
                  alt={app.title}
                  className="w-full h-auto object-cover"
                />
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{app.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    {app.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
              />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Let&apos;s Get in Touch
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Have any questions? Our Crazy Seal specialists can help!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <LinkButton href="/pricing" variant="white" size="lg">
              Get an Instant Quote
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
      </Container>
    </>
  )
}
