'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Download,
  Phone,
  Play,
  ShoppingCart,
  Mail,
  Headset,
  Layers,
  Gem,
  PiggyBank,
  ClipboardList,
  Zap,
  Recycle,
  Leaf,
  Wrench,
  Truck,
  ShieldCheck,
  Users,
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

function ClickToPlayVideo({
  videoId,
  thumbnail,
  title,
  caption,
}: {
  videoId: string
  thumbnail?: string
  title: string
  caption?: string
}) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label={`Play video: ${title}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
              <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
            </div>
          </div>
          {caption && (
            <p className="absolute bottom-3 left-0 right-0 text-center text-white text-sm font-medium">
              {caption}
            </p>
          )}
        </button>
      ) : (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      )}
    </div>
  )
}

const PHASES = [
  {
    title: 'Start With Any Size',
    desc: 'Start with a repair or install of any size. No job is too big or small. For example, Phase 1:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-1.jpg`,
  },
  {
    title: 'Expand From There',
    desc: 'All repairs or installations become a part of your full Crazy Seal seamless roof! For example, Phase 2:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-2.jpg`,
  },
  {
    title: 'Standardize Process',
    desc: 'Use Crazy Seal to standardize your roofing & repair process across one or many facilities. For example, Phase 3:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-3.jpg`,
  },
  {
    title: 'Completed Permanent Roof',
    desc: 'Every Crazy Seal repair puts you one step closer to having a permanent seamless roof! Phase 4 — completed roof:',
    image: `${MEDIA}/2024/02/Restaurant-Phase-4-Complete.jpg`,
  },
]

const INSTALL_EXAMPLES = [
  {
    label: 'Commercial Roof — Full View',
    before: `${MEDIA}/2022/01/Full-1-Before-1-Line-0-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Full-1-After-Line-0-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Commercial Roof — Center Section',
    before: `${MEDIA}/2022/01/Center-Full-2-Before-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Center-Full-2-After-1024x576.jpg`,
    aspect: '16/9',
  },
  {
    label: 'Roof Detail — Center',
    before: `${MEDIA}/2022/01/Center-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Center-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    label: 'Roof Detail — Edge',
    before: `${MEDIA}/2022/01/Left-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Left-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const KIT_INCLUDES = [
  'A custom suite of products uniquely designed to permanently seal every square millimeter of your roofing application.',
  '50 Year Product Warranty.',
  'Support from our team of roofing experts by phone, email, chat, or text message M-F 9:00am-6:00pm EST.',
  '24/7 access to our video instruction series to show you step by step exactly how to install your system.',
  'PDF instructions to accompany the video series.',
  'Additional resource pages to guide you through installation.',
  'Free shipping on orders over $500.00.',
]

const ADVANTAGES = [
  { icon: PiggyBank, title: 'Budget Friendly', desc: 'Stretch your annual budgets by applying Crazy Seal in stages.' },
  { icon: ClipboardList, title: 'Standardized Approach', desc: 'A repair process that is also a long-term solution for all of your facilities.' },
  { icon: Zap, title: 'Energy Efficient', desc: 'Reduce energy costs with our highly reflective and energy efficient system.' },
  { icon: Recycle, title: 'Sustainable & Renewable', desc: 'No tear off required. Keep your existing roof intact with Crazy Seal.' },
  { icon: Leaf, title: 'Environmentally Friendly', desc: 'No hydrocarbon solvents are used, only VOC exempt silicone based solvents.' },
  { icon: Wrench, title: 'Simple Installation', desc: 'Our detailed videos & PDFs show you step-by-step how to get the job done.' },
  { icon: Truck, title: 'Fast On-Demand Shipping', desc: 'We ship anywhere within the United States and Canada.' },
  { icon: ShieldCheck, title: '50-Year Product Warranty', desc: 'We offer a fully transferrable 50 year product warranty.' },
  { icon: Users, title: 'In-House Support Team', desc: 'Our specialists are here to help Monday-Friday, 9am-6pm by phone or email.' },
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

export default function CommercialRoofingPage() {
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
                  Facilities
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                  Commercial Roofing
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-highlight mb-4">
                  No one stretches your budget like Crazy Seal!
                </p>
                <p className="text-white/60 leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0">
                  Facility owners and operators choose Crazy Seal to stretch
                  their roofing budgets. Our one and done system can be applied
                  in stages, ultimately resulting in a full seamless roof.
                  We&apos;d love to have a conversation to see how we can help
                  stretch your budget!
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="/contact" variant="accent" size="lg">
                    Start a Conversation
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
              <ClickToPlayVideo
                videoId="XZrXvweEo-U"
                title="Benefits to Facility Owners and Operators"
                caption="Click to watch our facilities video"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALL IN STAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="A Roofing System That Is Not All or Nothing"
            heading="Install Crazy Seal in Stages to Stretch Your Budget"
            subheading="Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((phase, i) => (
              <FeatureCard
                key={phase.title}
                image={phase.image}
                title={phase.title}
                description={phase.desc}
                stepNumber={i + 1}
              />
            ))}
          </div>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/contact" variant="primary" size="md">
              Start a Conversation
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine cover"
                className="rounded-2xl shadow-xl h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
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
              <LinkButton
                href="https://crazy-seal.myshopify.com/pages/commercial-roofing-kits"
                variant="accent"
                size="md"
                external
              >
                Commercial Kits
              </LinkButton>
            </div>
          </Grid>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/5-Facilities-Attributes.jpg`}
                alt="Crazy Seal facilities attributes"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Finally! A Roofing System That Is Not All or Nothing."
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                With Crazy Seal, you can truly begin with a repair and go from
                there. Our system was designed specifically to allow you to
                solve immediate problems with a powerful long term solution in
                mind. Because it is fluid applied, you can use our system on a
                small application of a few square feet all the way up to
                completing a full commercial roof that is thousands of square
                feet! This means you can solve a problem now without sacrificing
                longevity in the process.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Better by design, our high grade fiber-infused silicone based
                system is waterproof, highly reflective, scratch resistant,
                flexible, tough, and backed by our 50 year warranty.
              </p>
              <LinkButton href="/crazy-seal" variant="primary" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALL EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Before & After"
            heading="Commercial Roof Installation Examples"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {INSTALL_EXAMPLES.map((t) => (
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

      {/* ─── IN-HOUSE OR PRO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Two Ways to Get the Job Done" variant="dark" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2024/03/In-House-Team-1024x576.jpg`}
                alt="In-house staff installing Crazy Seal"
                className="rounded-xl w-full h-auto mb-5"
              />
              <h3 className="text-xl font-bold text-white mb-3">Install In-House</h3>
              <p className="text-white/60 leading-relaxed">
                Install the system in-house using your own staff. We have a full
                suite of installation videos and PDFs to walk them through every
                step of the process.
              </p>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/18-Installation-1024x576.jpg`}
                alt="Professional installer applying Crazy Seal"
                className="rounded-xl w-full h-auto mb-5"
              />
              <h3 className="text-xl font-bold text-white mb-3">Hire a Professional Installer</h3>
              <p className="text-white/60 leading-relaxed">
                Any local painter, roofer or handyman can easily get the job
                done, especially with the help of our step-by-step installation
                videos and PDFs.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── REPAIR SYSTEM + FULL SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal serves two purposes. It's a roof repair system and a full roofing system!"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
            <div>
              <div className="flex items-center justify-center gap-4 mb-6">
                {['Repair', 'Repair', 'Replace'].map((label, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        label === 'Replace'
                          ? `${MEDIA}/2022/01/Replace-Icon.png`
                          : `${MEDIA}/2022/01/Bandaid.png`
                      }
                      alt={label}
                      className="h-16 w-auto object-contain"
                    />
                    <p className="text-sm font-bold uppercase tracking-wide text-primary">{label}</p>
                  </div>
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed">
                Nothing is more frustrating than doing the same thing over and
                over again to the same end result. Spot patching problem areas
                with sealants only kicks the can down the road to a future, more
                expensive problem. Ultimately, patch jobs have to be removed,
                creating even more expense when the roof is replaced. This
                expensive cycle has gone on way too long for millions of
                facilities all over the world.
              </p>
            </div>
            <div>
              <p className="text-gray-600 leading-relaxed mb-4">
                It&apos;s time to take back control of your roof! With Crazy
                Seal, a patch doesn&apos;t just have to be a patch. You can now
                professionally handle problem areas on your roof, know the
                system that was used to solve the problem, and expand on it
                until you have a full seamless roofing system installed that
                will stand the test of time! Gone are the days of feeling out of
                control, at the mercy of the endless stream of insanely
                expensive commercial roofing quotes.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Instead of continually putting band-aids on problems and hoping
                they stick, begin with the Crazy Seal Roofing System on a small
                area of your roof. As you continue to do repairs on small areas,
                they bond to each other until you ultimately end up with a
                completed seamless roof.
              </p>
            </div>
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
                src={`${MEDIA}/2025/01/Crazy-Seal-U.S.-Patent-1024x1024.png`}
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

      {/* ─── FIRE DEPARTMENT STORY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/Fire-Dept-Emerald-Isles.jpg`}
                alt="Emerald Isle Fire Department rescue trailer sealed with Crazy Seal"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full h-auto"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Fire Department Saves $39,000. Their review says it all.
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                &ldquo;The Town of Emerald Isle Fire Department recently sealed
                the roof of a 24&apos; emergency response rescue trailer. The
                EIFD staff completed the repairs using Crazy Seal products.
                Instead of spending $40,000 and waiting 12 months for a
                replacement trailer, town staff spent $1,000 on product. Two
                days later, the trailer was dry and ready to save lives along
                the weather impacted coast of North Carolina. Thank you to Crazy
                Seal and the fantastic folks that make such a wonderful
                product!&rdquo;
              </p>
              <p className="text-highlight font-semibold">
                Matt Zapp — Town Manager
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
              description="No other manufacturer offers a consumer direct model on an e-commerce platform, with tons of support, and the absolute best product available today. The end result, support, and product quality will ultimately be your best long term value."
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

      {/* ─── ADVANTAGES GRID ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Advantages" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            {ADVANTAGES.map((item) => {
              const Icon = item.icon
              return (
                <FeatureCard
                  key={item.title}
                  icon={<Icon className="w-6 h-6 text-accent" />}
                  title={item.title}
                  description={item.desc}
                />
              )
            })}
          </Grid>
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 pt-6 md:pt-10">
            <LinkButton href="/pricing" variant="primary" size="md">
              Pricing
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
            Ready to Get Started?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Every Crazy Seal repair puts you one step closer to a permanent seamless roof!
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <LinkButton href="/contact" variant="accent" size="lg">
              Start a Conversation
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
