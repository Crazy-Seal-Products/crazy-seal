'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Download,
  Phone,
  Play,
  ShoppingCart,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

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
    image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png`,
    desc: 'A fiber-infused silicone, moisture-curing sealant with excellent adhesion to most surfaces. Crazy Caulk is generally used to seal seams, such as the seams along the sides of an RV or seams created where components such as gutter systems attach to the roof.',
  },
  {
    name: 'Crazy Patch',
    image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png`,
    desc: 'A fiber-infused silicone, moisture-curing mastic with excellent adhesion to most surfaces. Wherever sealant was previously applied to cover penetrations, Crazy Patch ensures those penetrations are sealed. It can also be used alone as a single component repair product to patch leaks.',
  },
  {
    name: 'Crazy Seal',
    image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png`,
    desc: 'A weatherproof, fiber-infused silicone, fluid-applied membrane. Applying Crazy Seal to any weathered roof substrate protects it against degradation from harsh UV rays, severe weather, mold and mildew. It will not chalk or blister, and remains permanently flexible yet strong.',
  },
  {
    name: 'Crazy Tape',
    image: `${MEDIA}/2021/12/Crazy-Tape-1395x1395-1-1024x1024.png`,
    desc: 'A special tape created for scenarios where repairs are required. Strong adhesive on one side adds structural integrity to the seam, while the fabric material on top is designed to allow the Crazy Seal System to adhere to it — opening up many possibilities for repair on your roof.',
  },
  {
    name: 'Crazy Clean',
    image: `${MEDIA}/2019/05/Crazy-Clean.png`,
    desc: 'A highly effective concentrated cleaning solution specially formulated to remove surface contaminants such as oils, dirt and oxidation. Crazy Clean is environmentally safe, non-toxic and leaves no contaminating by-products or pollutants to damage the environment.',
  },
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

const INSTALL_STEPS = [
  {
    step: 1,
    title: 'Roof Inspection',
    image: `${MEDIA}/2019/06/002-Inspect-Walk.jpg`,
    desc: 'Walk the roof and identify any problem areas. Inspect penetrations to see if any areas need fixing.',
  },
  {
    step: 2,
    title: 'Cleaning & Preparation',
    image: `${MEDIA}/2019/06/015-Pressure-Wash.jpg`,
    desc: 'Pressure wash. Scrub with Crazy Clean. Tape off fixtures.',
  },
  {
    step: 3,
    title: 'Applying the Crazy Seal Products',
    image: `${MEDIA}/2019/06/100-Roller.jpg`,
    desc: 'Apply Crazy Caulk. Apply Crazy Patch. Apply the Crazy Seal Roof Membrane.',
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
                  Our System
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-4">
                  Crazy Seal is a revolutionary seamless roofing system designed
                  to permanently seal flat roofing applications like RVs,
                  tractor trailers, commercial flat roofs, residential flat
                  roofs, and more.
                </p>
                <p className="text-white/60 leading-relaxed mb-6">
                  Our liquid-applied system is seamless, permanent, and backed
                  by a fifty year product warranty. Crazy Seal takes the complex
                  world of roofing and simplifies it so that it can be installed
                  by just about anyone for a fraction of the cost of other
                  roofing types. The secret to Crazy Seal is its 3 part sealing
                  system comprised of an advanced formulation of fiber-infused
                  silicone.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="/store" variant="accent" size="lg">
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
              </div>
              <div className="relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download-1-Small.jpg`}
                  alt="The Crazy Seal System brochure"
                  className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-md h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BADGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-start">
            {BADGES.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={badge.image} alt={badge.label} className="h-20 w-auto object-contain" />
                <p className="text-sm font-bold uppercase tracking-wide text-primary">
                  {badge.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── MODERN TECH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2025/01/U.S.-Patent-Crazy-Seal-1024x819.png`}
                alt="Crazy Seal U.S. Patent"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="An Engineering Marvel"
                heading="Modern Tech Taking On an Old Challenge"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                Our chemical strategists and product testing teams spent years
                developing what may well be the strongest fluid-applied membrane
                ever brought to market. Now our patented system is here and
                available to help you complete your seamless roofing project,
                backed by a fifty year warranty.
              </p>
              <p className="text-gray-600 leading-relaxed">
                For decades, there has been a huge gap in roofing. Most options
                ranged from low-grade coatings that are temporary at best to
                inferior roof membranes that often fail within 3-5 years.
                Previously, access to high quality materials was only available
                to large roofing contractors. We&apos;ve changed that with Crazy
                Seal! It&apos;s time to take care of the small and mid-size
                project with an affordable, high-grade system that can stand the
                test of time.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── OUR PRODUCTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="What's In the System"
            heading="Our Products"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {PRODUCTS.map((product) => (
              <div
                key={product.name}
                className="rounded-2xl border border-gray-200/80 bg-white p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-40 w-auto object-contain mb-4"
                />
                <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.desc}</p>
              </div>
            ))}
            <div className="rounded-2xl bg-primary p-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold text-white mb-3">
                Ready to Get Started?
              </h3>
              <p className="text-white/60 leading-relaxed mb-5">
                All Crazy Seal products ship directly to your door.
              </p>
              <div className="flex flex-col gap-3">
                <LinkButton href="/store" variant="accent" size="md">
                  <ShoppingCart className="w-4 h-4" />
                  Shop Product Kits
                </LinkButton>
                <LinkButton href="/pricing" variant="outline-white" size="md">
                  Get an Instant Quote
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ONE SEAMLESS SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Multiple Components — One Seamless System"
            subheading="All components are derived from the same base formula and merge seamlessly together into a single membrane. The end result seals all penetrations and fortifies your roof with a seamless, custom fit membrane covering every square inch of your roof."
            variant="dark"
          />
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end">
            {[
              { name: 'Crazy Caulk', image: `${MEDIA}/2019/04/Crazy-Caulk-1-Tube-177x1024.png` },
              { name: 'Crazy Patch', image: `${MEDIA}/2019/05/Crazy-Patch-731x1024.png` },
              { name: 'Crazy Seal', image: `${MEDIA}/2019/05/Crazy-Seal-5-Gal-Gray-Bottom-699x1024.png` },
            ].map((item) => (
              <div key={item.name} className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.name} className="h-28 sm:h-36 w-auto object-contain" />
                <p className="text-sm font-bold uppercase tracking-wide text-white text-center">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TRANSFORMATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Before & After"
            heading="Transformations"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {TRANSFORMATIONS.map((t) => (
              <div key={t.label}>
                <BeforeAfterSlider
                  beforeSrc={t.before}
                  afterSrc={t.after}
                  aspectRatio={t.aspect}
                />
                <p className="text-center text-sm font-semibold text-gray-600 mt-2">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION EXAMPLE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="It Really Is This Simple"
            heading="Simple Installation Example"
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {INSTALL_STEPS.map((step) => (
              <FeatureCard
                key={step.step}
                image={step.image}
                title={`Step ${step.step}: ${step.title}`}
                description={step.desc}
              />
            ))}
          </Grid>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
            <p className="w-full text-center text-gray-600 font-semibold mb-1">
              Every kit includes 24/7 access to detailed installation videos and
              PDFs for applying our DIY system.
            </p>
            <LinkButton href="/store" variant="primary" size="md">
              <ShoppingCart className="w-4 h-4" />
              Shop Kits
            </LinkButton>
            <LinkButton href="/contact" variant="outline" size="md" className="border-primary text-primary">
              Questions? Contact Us
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── 21½ REASONS VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Why Crazy Seal?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                21&frac12; Reasons Why
              </h2>
              <p className="text-white/60 leading-relaxed mb-6">
                Watch our 21&frac12; Reasons Why Crazy Seal is a Superior
                Roofing System video, and download the free PDF explaining each
                of the concepts one by one.
              </p>
              <LinkButton
                href={`${MEDIA}/2020/02/21-Reasons.pdf`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Download the PDF
              </LinkButton>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
                    </div>
                  </div>
                  <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium">
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
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Have Any Questions? Our Crazy Seal Specialists Can Help!
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6">
            Let&apos;s Get In Touch
          </h2>
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
