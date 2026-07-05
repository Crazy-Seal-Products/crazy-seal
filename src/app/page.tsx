'use client'

import { useState } from 'react'
import {
  ArrowRight,
  MapPin,
  Play,
  Download,
  ClipboardCheck,
  HandCoins,
  Users,
  CheckSquare,
  Infinity,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  FeatureCard,
  TestimonialCard,
  PromoBanner,
  LogoStrip,
  LinkButton,
  GoogleReviews,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { CtaSection } from '@/components/CtaSection'
import { HomeGalleryPreview } from '@/components/HomeGalleryPreview'
import { QuoteButton, QuoteCta } from '@/components/QuoteButton'

const MEDIA = 'https://media.rv-armor.com/site-assets/wp-media'

const BEFORE_AFTER = [
  { before: '2019/04/032-Before.jpg', after: '2019/04/032-After.jpg' },
  { before: '2018/12/029-Before-b.jpg', after: '2018/12/029-After-b.jpg' },
  { before: '2018/12/024-Before-b.jpg', after: '2018/12/024-After-b.jpg' },
  { before: '2018/12/008-Before-b.jpg', after: '2018/12/008-After-b.jpg' },
  { before: '2018/12/022-Before.jpg', after: '2018/12/022-After.jpg' },
]

const PUBLICATIONS = [
  { name: 'Florida RV Super Show', src: `${MEDIA}/2018/12/0000_FLORIDA-RV-SUPER-SHOW.jpg` },
  { name: 'Family Motor Coaching', src: `${MEDIA}/2018/12/0001_FAMILY-MOTOR-COACHING.jpg` },
  { name: 'Escapees', src: `${MEDIA}/2018/12/0002_ESCAPEES.jpg` },
  { name: 'Trailer Life', src: `${MEDIA}/2018/12/0003_TRAILER-LIFE.jpg` },
  { name: 'Motor Home', src: `${MEDIA}/2018/12/0004_MOTOR-HOME.jpg` },
  { name: "Hershey's RV Show", src: `${MEDIA}/2018/12/0005_HERSHEYS.jpg` },
]

const TESTIMONIALS = [
  {
    name: 'Robert Vancura',
    photo: `${MEDIA}/2018/12/0003_Robert-Vancura-300x300.jpg`,
    text: 'Very professional and well worth the money! Thank you RV Armor!',
  },
  {
    name: 'Erik Fowler',
    photo: `${MEDIA}/2018/12/0009_Erik-Fowler-300x300.jpg`,
    text: '5 stars for sure. Very professional service and they come to you to do the work. Luis was great and really knew what he was doing!!!',
  },
  {
    name: 'Michael & Charlene Outlaw',
    photo: `${MEDIA}/2018/12/0010_Michael-Charlene-Outlaw-300x300.jpg`,
    text: 'We love our new RV Armor roof! Professional installation and great customer service.',
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.1),transparent_40%)]" />

          <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-10 md:px-6 md:py-14 lg:px-8 lg:py-18">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
            {/* Left: Logo + Headline + Subtext + CTA */}
            <div className="text-center order-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://media.rv-armor.com/site-assets/logo/rv-armor-shield.png"
                alt="RV Armor"
                className="h-28 sm:h-32 lg:h-40 w-auto mx-auto mb-4 lg:mb-6"
              />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-[1.15] mb-4">
                The Last RV Roof You Will Ever Need.{' '}
                <br className="hidden lg:block" />
                <span className="text-highlight">Guaranteed!</span>
              </h1>

              {/* Subtext + CTA — hidden on mobile, shown on desktop below headline */}
              <div className="hidden lg:block">
                <p className="text-lg text-white/60 max-w-lg mx-auto mb-6 leading-relaxed">
                  Permanent, seamless protection installed at your location.
                  Backed by a lifetime guarantee.
                </p>
                <QuoteCta phoneVariant="outline-white" className="justify-center" />
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
                    src="https://img.youtube.com/vi/O8QD7V6Ap8U/maxresdefault.jpg"
                    alt="RV Armor installation video"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
                    </div>
                  </div>
                </button>
              ) : (
                <iframe
                  src="https://www.youtube.com/embed/O8QD7V6Ap8U?autoplay=1&rel=0"
                  title="RV Armor Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              )}
            </div>

            {/* Subtext + CTA — mobile only, below video */}
            <div className="text-center lg:hidden order-3">
              <p className="text-lg text-white/60 max-w-lg mx-auto mb-5 leading-relaxed">
                Permanent, seamless protection installed at your location.
                Backed by a lifetime guarantee.
              </p>
              <QuoteCta phoneVariant="outline-white" className="justify-center" />
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

      {/* ─── THE RV ARMOR EXPERIENCE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Why RV Armor"
            heading="The RV Armor Experience"
            subheading="Imagine never having to get up on the roof of your RV ever again. Our convenient, affordable, and attractive roofing system is the last RV roof you will ever need."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              image={`${MEDIA}/2018/12/RV-ARMOR-FRONT-3.jpg`}
              title="We Come to You"
              description="Your campground. Your driveway. Wherever you are in the US, we come to you."
            />
            <FeatureCard
              image={`${MEDIA}/2018/12/RV-ARMOR-FRONT-2.jpg`}
              title="Certified Techs"
              description="A nationwide network of certified technicians trained to handle all RV roofs."
            />
            <FeatureCard
              image={`${MEDIA}/2018/12/RV-ARMOR-FRONT-1.jpg`}
              title="Lifetime Guarantee"
              description="Our proprietary RV Armor Roofing System is backed by a lifetime guarantee."
            />
          </Grid>
          <QuoteCta className="pt-6 md:pt-10" />
        </div>
      </Container>

      {/* ─── GALLERY PREVIEW ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Before & After"
            subheading="Slide the center bar back and forth to see the transformation on sliders and browse our gallery of work."
            variant="dark"
          />
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {BEFORE_AFTER.map((pair, i) => (
              <div key={i} className={i >= 4 ? 'hidden lg:block' : undefined}>
                <BeforeAfterSlider
                  beforeSrc={`${MEDIA}/${pair.before}`}
                  afterSrc={`${MEDIA}/${pair.after}`}
                  aspectRatio="3/4"
                />
              </div>
            ))}
          </div>
          <HomeGalleryPreview />
        </div>
      </Container>

      {/* ─── AS SEEN IN ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 text-center mb-6 md:mb-10">
            As Seen In
          </p>
          <LogoStrip logos={PUBLICATIONS} />
        </div>
      </Container>

      {/* ─── INSURANCE BANNER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <PromoBanner
          buttonText="Learn About Our Dedicated Insurance Team"
          buttonHref="/insurance"
          variant="primary"
          className="py-8 sm:py-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center sm:text-left">
            <span className="text-highlight">Insurance Claim?</span> We Can Help!
          </h2>
        </PromoBanner>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Permanent Protection"
            heading="RV Armor Advantages"
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {[
              { icon: <ClipboardCheck className="w-6 h-6 text-accent" />, title: 'Guaranteed', desc: 'We offer a fully transferrable lifetime material and labor warranty.' },
              { icon: <HandCoins className="w-6 h-6 text-accent" />, title: 'Affordable', desc: 'RV Armor is generally 30%-50% less than a tear off and replacement.' },
              { icon: <MapPin className="w-6 h-6 text-accent" />, title: 'Convenient', desc: 'We come to you anywhere in the continental US.' },
              { icon: <Users className="w-6 h-6 text-accent" />, title: 'Nationwide', desc: 'A nationwide network of certified technicians.' },
              { icon: <CheckSquare className="w-6 h-6 text-accent" />, title: 'Comprehensive', desc: 'Works on all RV roof types and conditions.' },
              { icon: <Infinity className="w-6 h-6 text-accent" />, title: 'Permanent', desc: 'One application. No resealing, no recoating, no maintenance. Ever.' },
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
            <QuoteButton size="md" />
            <LinkButton href="/advantages" variant="outline" size="md" className="border-primary text-primary">
              More Advantages
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Happy Customers"
            heading="What RV Owners Are Saying"
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
              See More Testimonials
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── TOUGH SKIN ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 pt-6 pb-4 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure-b.jpg`}
                alt="Tough Skin Brochure"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in Trailer Life Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Tough Skin
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download a reprint of our article from Trailer Life Magazine
                explaining the RV Armor process and what makes our proprietary
                roofing system the permanent solution for your RV.
              </p>
              <LinkButton
                href={`${MEDIA}/2018/12/RV-Armor-Tough-Skin-Brochure.jpg`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Download Article
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
