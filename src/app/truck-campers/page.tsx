import type { Metadata } from 'next'
import {
  ArrowRight,
  Download,
  Phone,
  Mail,
  ShoppingCart,
  Headset,
  Layers,
  Gem,
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
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'DIY Roofing for Truck Campers',
  description: 'Seal your own truck camper roof for less with the DIY Crazy Seal Roofing System.',
}

const BADGES = [
  { image: `${MEDIA}/2019/05/Warranty.png`, label: '50 Year Warranty' },
  { image: `${MEDIA}/2019/05/DIY.png`, label: 'Do It Yourself' },
  { image: `${MEDIA}/2019/05/RED-FLAG-1000.png`, label: 'Made in America' },
  { image: `${MEDIA}/2019/05/Satisfaction.png`, label: 'Guarantee' },
  { image: `${MEDIA}/2019/05/Quality.png`, label: 'Unmatched Quality' },
]

const KIT_TYPES = [
  {
    title: 'Double Layer Kits',
    desc: 'Our most popular kit with double layer protection.',
    href: 'https://buy.crazyseal.com/products/double-layer-kit',
    image: `${MEDIA}/2019/05/Double-White-100-300-Crazy-Seal-Flat-Roofing-Project-Kit-1024x336.png`,
  },
  {
    title: 'Single Layer Kits',
    desc: 'A budget-friendly option with single layer coverage.',
    href: 'https://buy.crazyseal.com/products/single-layer-kit',
    image: `${MEDIA}/2020/03/Single-Layer-Kit-1-e1637944173532.png`,
  },
  {
    title: 'Direct to Deck Kits',
    desc: 'A special kit for sealing directly over wood decking.',
    href: 'https://buy.crazyseal.com/products/direct-to-deck-kit',
    image: `${MEDIA}/2019/10/02_Direct-150-225-White-1024x416.png`,
  },
  {
    title: 'Build Your Own Kit',
    desc: 'Build your own kit from our lineup of roofing products.',
    href: 'https://buy.crazyseal.com/pages/build-your-own-kit',
    image: `${MEDIA}/2019/10/03_Direct-225-300-White-1024x503.png`,
  },
]

const KIT_INCLUDES = [
  'A custom suite of products uniquely designed to permanently seal every square millimeter of your roofing application.',
  '50 Year Product Warranty.',
  'Support from our team of roofing experts by phone, email, chat, or text message M-F 9:00am-6:00pm EST.',
  '24/7 access to our video instruction series to show you step by step exactly how to install your system.',
  'PDF instructions to accompany the video series.',
  'Additional resource pages to guide you through installation.',
  'Free swag pack on orders over $500.00.',
  'Free shipping on orders over $500.00.',
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

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

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
  {
    label: 'Camper Roof — Aerial',
    before: `${MEDIA}/2019/07/Winnebago-Arial-Before-1024x512.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-Arial-After-1024x512.jpg`,
    aspect: '2/1',
  },
  {
    label: 'Camper Roof — Rear',
    before: `${MEDIA}/2019/07/Winnebago-Before-2-1024x1024.jpg`,
    after: `${MEDIA}/2019/07/Winnebago-After-2-1024x1024.jpg`,
    aspect: '1/1',
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

export default function TruckCampersPage() {
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
                  Truck Campers
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-highlight mb-6">
                  Your Truck Camper roof will love you when you protect it with Crazy Seal!
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="lg" external>
                    <ShoppingCart className="w-5 h-5" />
                    Shop Kits
                  </LinkButton>
                  <LinkButton href="/pricing" variant="white" size="lg">
                    Get an Instant Quote
                  </LinkButton>
                </div>
              </div>
              <div>
                <ProYouTubeEmbed
                  videoId="OsJCUv3s2Is"
                  thumbnail="https://img.youtube.com/vi/OsJCUv3s2Is/sddefault.jpg"
                  title="The Crazy Seal Roofing System"
                />
                <p className="text-center text-white/70 text-sm font-medium mt-2">
                  Click to Watch Video (5:15)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HOW TO GET A KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="How to Get a Crazy Seal Roofing Kit" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <div className="rounded-2xl border border-gray-200/80 p-6 md:p-8 text-center">
              <Phone className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-3">Give Us a Call</h3>
              <LinkButton href="tel:8009630131" variant="primary" size="md">
                (800) 963-0131
              </LinkButton>
            </div>
            <div className="rounded-2xl border border-gray-200/80 p-6 md:p-8 text-center">
              <Mail className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-3">Get in Touch</h3>
              <LinkButton href="/contact" variant="primary" size="md">
                Contact Us
              </LinkButton>
            </div>
            <div className="rounded-2xl border border-gray-200/80 p-6 md:p-8 text-center">
              <ShoppingCart className="w-10 h-10 text-accent mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary mb-3">Visit Our Online Store</h3>
              <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="md" external>
                Visit Our Store
              </LinkButton>
            </div>
          </Grid>
        </div>
      </Container>

      {/* ─── NOTHING TAKES A BEATING ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/Winnebago-After-1-1024x1024.jpg`}
                alt="RV roof sealed with Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                heading="Nothing takes a beating like an RV roof."
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                Driving an RV down the road is like setting off a mini
                earthquake. You want a roof on your RV that can handle
                everything you throw at it and stand the test of time. With the
                Crazy Seal Roofing System, it is one and done! Properly apply
                our seamless roofing system and you&apos;ll be cruising with the
                best RV roofing system money can buy.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Imagine applying a roofing system to your RV that would outlast
                the RV itself! The founders of Crazy Seal developed our product
                for the RV&apos;er looking for a permanent, DIY solution to
                their roofing needs. Better by design, our high grade
                fiber-infused silicone based system is waterproof, highly
                reflective, scratch resistant, flexible, and tough.
              </p>
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
              <SectionHeading heading="What is Crazy Seal?" align="left" className="mb-4" />
              <p className="text-gray-600 leading-relaxed mb-4">
                The Crazy Seal Roofing System is a revolutionary, fluid applied,
                seamless roofing system designed to permanently seal flat / low
                slope roofing applications like RVs, transportation vehicles and
                trailers, residential flat roofs, commercial flat roofs, and
                more! Crazy Seal takes the complex world of roofing and
                simplifies it so that it can be installed by just about anyone.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Our chemical strategists and product testing teams spent years
                developing what may well be the strongest fluid-applied roofing
                membrane ever brought to market. Now our system is here and
                available to help you complete your seamless roofing project,
                backed by our 50 year warranty.
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
          <SectionHeading heading="Who is Crazy Seal For?" variant="dark" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/01/Pros-01-1024x683.png`}
                alt="Crazy Seal professionals"
                className="rounded-xl w-full h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-3">Professionals</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Crazy Seal was made by professionals for professionals. Make
                (lots of) money installing our seamless roofing system.
              </p>
              <div className="mt-auto flex flex-wrap justify-center gap-3">
                <LinkButton href="/professionals" variant="accent" size="md">
                  Learn About Our Pro Network
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/01/Pros-03-1024x683.png`}
                alt="Crazy Seal affiliates"
                className="rounded-xl w-full h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-3">Affiliates</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Have a network of people who can benefit from using Crazy Seal?
                Earn money every time someone buys through your affiliate link!
              </p>
              <div className="mt-auto flex flex-wrap justify-center gap-3">
                <LinkButton href="/contact" variant="accent" size="md">
                  Start a Conversation
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/01/Pros-02-1024x683.png`}
                alt="Do it yourself Crazy Seal installation"
                className="rounded-xl w-full h-auto mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-3">Do It Yourself People</h3>
              <p className="text-white/60 leading-relaxed mb-6">
                Use our professional system to do your roof once and do it
                right! Contact us to find a pro in your area or to build a
                custom kit.
              </p>
              <div className="mt-auto flex flex-wrap justify-center gap-3">
                <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="md" external>
                  <ShoppingCart className="w-4 h-4" />
                  Visit Our Store
                </LinkButton>
              </div>
            </div>
          </Grid>
        </div>
      </Container>

      {/* ─── WHY IS IT BETTER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="You Can Buy Cheaper. You Can't Buy Better."
            heading="Why is it Better?"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/09-Rebar-768x432.jpg`}
                alt="Fiber infusion works like rebar in concrete"
                className="rounded-2xl shadow-lg w-full h-auto mb-5"
              />
              <h3 className="text-xl font-bold text-primary mb-3">Fiber Infusion</h3>
              <p className="text-gray-600 leading-relaxed">
                Crazy Seal is the only silicone coating system on the market
                that uses polyethylene fibers in its product. It makes whatever
                it&apos;s applied to stronger — think what rebar does to
                concrete. Scratch resistance has traditionally been a drawback
                of silicone coatings and a major concern for RVers where contact
                with tree branches is commonplace. Fiber infusion adds
                additional strength, durability, and even scratch resistance.
              </p>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/10-35-vs-94-768x432.jpg`}
                alt="Crazy Seal silicone content compared to other coatings"
                className="rounded-2xl shadow-lg w-full h-auto mb-5"
              />
              <h3 className="text-xl font-bold text-primary mb-3">More Actual Silicone Content</h3>
              <p className="text-gray-600 leading-relaxed">
                Many big box brand coatings use cheap fillers to increase their
                solids content and lower their product costs — at the cost of
                reduced performance and longevity. We source our silicone and
                silica based ingredients from the same suppliers that supply the
                pharmaceutical industry, and we put more of the good stuff in
                our products. No cheap fillers.
              </p>
            </div>
          </div>
          <p className="text-center text-gray-600 leading-relaxed max-w-2xl mx-auto pt-8">
            Cheap coatings often are not much more than glorified paint, and at
            best only offer a temporary solution. As Crazy Curtis our mascot
            says,{' '}
            <span className="font-semibold text-primary">
              &ldquo;If you buy the best, you only cry one time!&rdquo;
            </span>
          </p>
        </div>
      </Container>

      {/* ─── 21½ REASONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                21&frac12; Reasons Why
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">
                Forged from the knowledge gained from thousands of flat roofing
                installations, we developed the Crazy Seal system with you in
                mind. A system is only as good as YOUR ability to install it!
                Years of trial and error went into making our system extremely
                strong yet simple to apply.
              </p>
              <p className="text-white/60 leading-relaxed mb-6">
                Watch our 21&frac12; Reasons Why Crazy Seal is a Superior
                Roofing System video and download the free PDF explaining each
                of the concepts one by one.
              </p>
              <LinkButton
                href={`${MEDIA}/2020/02/21-Reasons.pdf`}
                variant="white"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Download the 21&frac12; Reasons PDF
              </LinkButton>
            </div>
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="21 1/2 Reasons Why to Choose Crazy Seal"
              />
              <p className="text-center text-white/70 text-sm font-medium mt-2">
                Click to Watch Why Crazy Seal is Better (10:24)
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY DOES CRAZY SEAL SUCCEED ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Why does Crazy Seal succeed where others fail?" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              icon={<Headset className="w-6 h-6 text-accent" />}
              title="We Support & Care About Our Customers"
              description="We aren't just the manufacturer of the best fluid applied seamless roofing system on the market. We are hyper-focused on helping you create an outstanding finished result, with a suite of instructional materials and experts on hand to make your project a success."
            />
            <FeatureCard
              icon={<Layers className="w-6 h-6 text-accent" />}
              title="3 Part Sealing System"
              description="Our 3-part sealing system actually stops leaks! Our system eliminates your problem areas first, then finalizes the sealing process with our final membrane — a seamless, custom fit membrane covering every square inch of your roof."
            />
            <FeatureCard
              icon={<Gem className="w-6 h-6 text-accent" />}
              title="We Are One of a Kind"
              description="No other manufacturer offers a consumer direct model with tons of support and the absolute best product available today. Crazy Seal may cost more initially, but the end result, support, and product quality will ultimately be your best long term value."
            />
          </Grid>
          <div className="max-w-2xl mx-auto pt-8 md:pt-12">
            <h3 className="text-xl font-bold text-primary text-center mb-5">
              That&apos;s why every kit comes with:
            </h3>
            <ul className="space-y-3">
              {KIT_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                  <span className="mt-1.5 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── COST + QUICK QUOTE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Want a Quick Price Quote?"
            heading="How much does it cost and how do I buy a kit?"
            subheading="All Crazy Seal products ship directly to your door. On average, the system ranges between $3.00-$5.00 per square foot of coverage depending on your application and coverage rate. Use our instant quote tool for a kit recommendation and pricing in under 10 seconds."
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/07/Curtis-Instant-Quote-1024x683.png`}
                alt="Get an instant Crazy Seal quote"
                className="rounded-xl w-full h-auto mb-4"
              />
              <div className="mt-auto">
                <LinkButton href="/pricing" variant="white" size="md">
                  Get an Instant Quote Online
                </LinkButton>
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center flex flex-col">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2023/07/Curtis-Support-1024x683.png`}
                alt="Talk with a Crazy Seal specialist"
                className="rounded-xl w-full h-auto mb-4"
              />
              <div className="mt-auto">
                <LinkButton href="/contact" variant="accent" size="md">
                  Get in Touch with a Specialist
                </LinkButton>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-6 md:pt-8">
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              (800) 963-0131 — M-F 9AM-6PM EST
            </a>
          </div>
        </div>
      </Container>

      {/* ─── KIT TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Choose a Kit Type Below to Get Started" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KIT_TYPES.map((kit) => (
              <a
                key={kit.title}
                href={kit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kit.image} alt={kit.title} className="h-24 w-auto object-contain mb-4" />
                <h3 className="font-bold text-primary mb-1">{kit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{kit.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ADDITIONAL VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Learn More"
            heading="Additional Overview Videos"
            subheading="Watch our 21½ Reasons Why and Let's Get Crazy videos to learn more about the Crazy Seal system."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="21 1/2 Reasons Why to Choose Crazy Seal"
              />
              <p className="text-center text-gray-600 text-sm font-medium mt-2">
                Click to Watch Full Overview Video (10:24)
              </p>
            </div>
            <div>
              <ProYouTubeEmbed
                videoId="VoPjXn8YCk4"
                thumbnail={`${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`}
                title="Let's Get Crazy"
              />
              <p className="text-center text-gray-600 text-sm font-medium mt-2">
                Click to Watch Our Crazy Tests (5:24)
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton
              href={`${MEDIA}/2020/02/21-Reasons.pdf`}
              variant="primary"
              size="md"
              external
            >
              <Download className="w-4 h-4" />
              Click to Download Our 21&frac12; Reasons PDF
            </LinkButton>
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
                explaining our revolutionary DIY Crazy Seal roofing system.
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

      {/* ─── WHY CRAZY SEAL FOR YOUR ROOF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Why Crazy Seal For Your Roof?"
            subheading="Our multi-component system flips the roofing equation upside down."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {THREE_PART_SYSTEM.map((part) => (
              <div key={part.label}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={part.image}
                  alt={part.label}
                  className="rounded-2xl shadow-md w-full h-auto"
                />
                <p className="text-center text-sm font-bold uppercase tracking-wide text-primary mt-2">
                  {part.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            <div>
              <h3 className="text-xl font-bold text-primary mb-3">Traditional Roofing</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                In typical roofing, a substrate like rubber or EPDM is laid down
                first with adhesive. Roof components are then installed on top
                with screws, tacks, and nails — creating hundreds of potential
                leak points. A layer of sealant is applied on top of the
                penetrations, and that sealant is the only protection. Over time
                it can rot or deteriorate, leaving your roof vulnerable to water
                intrusion.
              </p>
              <div className="space-y-4">
                {TRADITIONAL_ROOF_IMAGES.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`Traditional roofing example ${i + 1}`}
                    className="rounded-2xl shadow-md w-full h-auto"
                  />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary mb-3">The Crazy Seal System</h3>
              <p className="text-gray-600 leading-relaxed mb-5">
                Crazy Seal does exactly the opposite! Our system begins first by
                using our specially formulated caulk and mastic to seal all
                seams and penetrations. From there, a final membrane is applied
                on top of the sealed penetrations. The entire roof is now sealed
                under one giant chemically bonded molecule covering every square
                inch of your roof.
              </p>
              <div className="space-y-4">
                {WATER_DAMAGE.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`Roof water damage example ${i + 1}`}
                    className="rounded-2xl shadow-md w-full h-auto"
                  />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-center max-w-2xl mx-auto pt-8">
            Deterioration leading to water intrusion can be incredibly
            destructive to your camper and everything inside. Above are a few
            examples of how much damage water can do.
          </p>
        </div>
      </Container>

      {/* ─── BEFORE / AFTER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Before & After"
            heading="See the Seamless Membrane in Action"
            subheading="Slide the center bar back and forth to see how Crazy Seal creates a seamless membrane on every inch of your roof."
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

      {/* ─── ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal Can Be Applied to All Roof Types"
            variant="dark"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {ROOF_TYPES.map((type) => (
              <div
                key={type}
                className="rounded-xl bg-white/10 ring-1 ring-white/10 py-5 text-center font-bold uppercase tracking-wide text-white"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Advantages" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              title="Save Money"
              description="Do it yourself and save big. Much of the cost of a typical roofing installation comes with labor. Buy raw materials factory direct from Crazy Seal!"
            />
            <FeatureCard
              title="Quick Install"
              description="Get the job done fast. Hiring a roofing technician can take several weeks or even months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit."
            />
            <FeatureCard
              title="Permanent"
              description="50 year product warranty. If it's worth doing, it's worth doing right. Rather than putting a bandaid on a problem, do it right and do it once with the Crazy Seal roofing system."
            />
          </Grid>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
            <LinkButton href="/pricing" variant="primary" size="md">
              Pricing
            </LinkButton>
            <LinkButton href="/installation" variant="outline" size="md" className="border-primary text-primary">
              Installation
            </LinkButton>
            <LinkButton href="/warranty" variant="outline" size="md" className="border-primary text-primary">
              Warranty
            </LinkButton>
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
