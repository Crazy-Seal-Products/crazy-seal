'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Play,
  Download,
  Phone,
  ShoppingCart,
  DollarSign,
  Timer,
  ShieldCheck,
  Layers,
  Hammer,
  Building2,
  Wrench,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  TestimonialCard,
  LogoStrip,
  LinkButton,
  GoogleReviews,
} from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { QuoteCta } from '@/components/QuoteButton'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const KIT_TYPES = [
  {
    title: 'Double Layer Kits',
    desc: 'Our most popular kit with double layer protection.',
    href: 'https://buy.crazyseal.com/products/double-layer-kit',
    image: `${MEDIA}/2019/05/Double-White-100-300-Crazy-Seal-Flat-Roofing-Project-Kit-1024x336.png`,
  },
  {
    title: 'Direct to Deck Kits',
    desc: 'A special kit for sealing directly over wood decking.',
    href: 'https://buy.crazyseal.com/products/direct-to-deck-kit',
    image: `${MEDIA}/2019/10/02_Direct-150-225-White-1024x416.png`,
  },
  {
    title: 'Commercial Kits',
    desc: 'Custom kits for any size commercial project.',
    href: 'https://crazy-seal.myshopify.com/pages/commercial-roofing-kits',
    image: `${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`,
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own kit from our lineup of roofing products.',
    href: 'https://buy.crazyseal.com/pages/build-your-own-kit',
    image: `${MEDIA}/2020/03/Single-Layer-Kit-1-e1637944173532.png`,
  },
]

const APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches.",
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential, sunrooms, storage buildings.',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    href: '/transportation',
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
    text: 'After viewing the installation videos 4 times, I followed the instructions to the letter. The product went on easily.',
  },
]

export default function HomePage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />

          <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              {/* Left: Logo + Headline + Subtext + CTA */}
              <div className="text-center order-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800-400x320.png`}
                  alt="Crazy Seal"
                  className="h-28 sm:h-32 lg:h-40 w-auto mx-auto mb-4 lg:mb-6"
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.15] mb-2">
                  The Crazy Seal Roofing System.{' '}
                  <br className="hidden lg:block" />
                  <span className="text-highlight">So Good It&apos;s Patented!</span>
                </h1>
                <p className="text-sm font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">
                  U.S. Patent #12,146,061
                </p>

                {/* Subtext + CTA — hidden on mobile, shown on desktop below headline */}
                <div className="hidden lg:block">
                  <p className="text-lg text-white/60 max-w-lg mx-auto mb-6 leading-relaxed">
                    A patented, fluid-applied, seamless roofing system you can
                    install yourself. Backed by a 50 year warranty and shipped
                    straight to your door.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="lg" external>
                      <ShoppingCart className="w-5 h-5" />
                      Shop Kits
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
              </div>

              {/* Right on desktop / Below headline on mobile: Video */}
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 order-2">
                {!videoPlaying ? (
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="absolute inset-0 w-full h-full group cursor-pointer"
                    aria-label="Play video"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://img.youtube.com/vi/C5FvTulPDaY/maxresdefault.jpg"
                      alt="Crazy Seal Roofing System overview video"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
                      </div>
                    </div>
                    <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium">
                      Watch this for a full overview
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

              {/* Subtext + CTA — mobile only, below video */}
              <div className="text-center lg:hidden order-3">
                <p className="text-lg text-white/60 max-w-lg mx-auto mb-5 leading-relaxed">
                  A patented, fluid-applied, seamless roofing system you can
                  install yourself. Backed by a 50 year warranty.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="md" external>
                    <ShoppingCart className="w-4 h-4" />
                    Shop Kits
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="md">
                    Instant Quote
                  </LinkButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── REVIEWS WIDGET ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <GoogleReviews
            featurableId={process.env.NEXT_PUBLIC_FEATURABLE_WIDGET_ID}
            minRating={5}
            maxReviews={9}
            carouselSpeed={8000}
            accentColor="#003365"
          />
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/09-3-Pieces-System-1024x576.jpg`}
                alt="The Crazy Seal 3 part sealing system"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="DIY Roofing Done Right"
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                The Crazy Seal Roofing System is a patented, fluid-applied,
                seamless roofing system designed to permanently seal flat and
                low-slope roofing applications like RVs, transportation
                vehicles and trailers, residential flat roofs, commercial flat
                roofs, and more. Crazy Seal takes the complex world of roofing
                and simplifies it so that it can be installed by just about
                anyone.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our chemical strategists and product testing teams spent years
                developing what may well be the strongest fluid-applied roofing
                membrane ever brought to market — backed by our 50 year
                warranty.
              </p>
              <LinkButton href="/crazy-seal" variant="primary" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHO IS CRAZY SEAL FOR ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Who is Crazy Seal For?"
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              <Building2 className="w-10 h-10 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Professionals</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Crazy Seal was made by professionals for professionals. Make
                (lots of) money installing our seamless roofing system.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <LinkButton href="/professionals" variant="accent" size="md">
                  Learn About Our Pro Network
                </LinkButton>
                <LinkButton href="/contact" variant="outline-white" size="md">
                  Talk to Our Team
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              <Hammer className="w-10 h-10 text-highlight mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Do It Yourself</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Use our professional system to do your roof once and do it
                right! Build a custom kit or contact us to find a pro in your
                area.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="md" external>
                  <ShoppingCart className="w-4 h-4" />
                  Visit Our Store
                </LinkButton>
                <LinkButton href="/pricing" variant="outline-white" size="md">
                  Get an Instant Quote
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY IS IT BETTER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="You Can Buy Cheaper. You Can't Buy Better."
            heading="Why is Crazy Seal Better?"
            subheading="Forged from the knowledge gained from thousands of flat roofing installations, we developed the Crazy Seal system with you in mind."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              image={`${MEDIA}/2022/03/09-Rebar-768x432.jpg`}
              title="Fiber Infusion"
              description="The only silicone coating system on the market that uses polyethylene fibers. Think what rebar does to concrete: added strength, durability, and scratch resistance."
            />
            <FeatureCard
              image={`${MEDIA}/2022/03/10-35-vs-94-768x432.jpg`}
              title="More Actual Silicone"
              description="No cheap fillers. We source pharmaceutical-grade silicone and silica ingredients and put more of the good stuff in every bucket."
            />
            <FeatureCard
              image={`${MEDIA}/2022/03/18-Installation-1024x576.jpg`}
              title="3 Part Sealing System"
              description="Our system eliminates problem areas first, then finalizes with a seamless membrane covering every square inch of your roof."
            />
          </Grid>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
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
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Crazy Seal Advantages"
            heading="Do It Once. Do It Right."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {[
              { icon: <DollarSign className="w-6 h-6 text-accent" />, title: 'Save Money', desc: 'Buy raw materials factory direct and never think about pricey or routine roof maintenance again.' },
              { icon: <Timer className="w-6 h-6 text-accent" />, title: 'Quick Install', desc: 'Hiring a roofer can take weeks or months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit.' },
              { icon: <ShieldCheck className="w-6 h-6 text-accent" />, title: '50 Year Warranty', desc: 'Rather than putting a bandaid on the problem, do it right and do it once with the Crazy Seal roofing system.' },
            ].map((item) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.desc}
              />
            ))}
          </Grid>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
            <LinkButton href="/advantages" variant="outline" size="md" className="border-primary text-primary">
              More Advantages
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── KIT TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Want a Quick Price?"
            heading="Choose a Kit Type to Get Started"
            subheading="All Crazy Seal products ship directly to your door. On average, the system ranges between $3.00-$5.00 per square foot of coverage."
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KIT_TYPES.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                className="group rounded-2xl bg-white p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1 shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={kit.image}
                  alt={kit.title}
                  className="h-24 w-auto object-contain mb-4"
                />
                <h3 className="font-bold text-primary mb-1">{kit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{kit.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 md:pt-8">
            <LinkButton href="/pricing" variant="white" size="md">
              Get an Instant Quote Online
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Or call (800) 963-0131 — M-F 9AM-6PM EST
            </a>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Every Flat Roof"
            heading="Choose a Section That Matches Your Application"
          />
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
                    Learn More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Crazy Reviews"
            heading="What Crazy Seal Customers Are Saying"
          />
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

      {/* ─── HYBRID SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                <Layers className="w-4 h-4 inline mr-1 -mt-0.5" />
                Advanced Technology
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                The Crazy Seal Hybrid Roof System
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4">
                Imagine taking roofing fabric and infusing it with the highest
                grade silicone money can buy. As each piece of the system
                cures, fiber strands bond into a complex interstitial network
                that delivers the strength of roofing fabric with the
                durability, flexibility, and longevity of silicone.
              </p>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-6">
                The result: a seamless, fiber-reinforced membrane that is
                waterproof, highly reflective, scratch resistant, flexible,
                tough, and maintenance free.
              </p>
              <LinkButton href="/crazy-seal" variant="white" size="lg">
                Learn More About Our System
                <ArrowRight className="w-5 h-5" />
              </LinkButton>
            </div>
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/Metal-Closeup-1024x1024.jpg`}
                alt="Crazy Seal fiber-infused membrane closeup"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-md h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── TRAILER LIFE FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
                alt="Trailer Life Magazine May 2020 cover"
                className="rounded-2xl shadow-xl h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in Trailer Life Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                See Our Feature Article
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download our featured article from Trailer Life Magazine
                explaining our revolutionary Crazy Seal roofing system.
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
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
