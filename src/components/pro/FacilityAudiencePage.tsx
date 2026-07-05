import {
  Phone,
  Download,
  ShoppingCart,
  Check,
  ArrowRight,
  PiggyBank,
  ClipboardList,
  Zap,
  Recycle,
  Leaf,
  Wrench,
  Truck,
  ShieldCheck,
  Headset,
  DollarSign,
  Timer,
} from 'lucide-react'
import { Container, Grid, SectionHeading, LinkButton, YouTubeEmbed, FeatureCard } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'
import { CtaSection } from '@/components/CtaSection'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { MEDIA, ProTestimonials } from '@/components/pro/ProSections'

const PHASES = [
  {
    phase: 'PHASE 1',
    heading: 'Start With Any Size',
    desc: 'Start with a repair or install of any size. No job is too big or small.',
    image: `${MEDIA}/2024/02/Restaurant-Phase-1-1024x576.jpg`,
  },
  {
    phase: 'PHASE 2',
    heading: 'Expand From There',
    desc: 'All repairs or installations become a part of your full Crazy Seal seamless roof!',
    image: `${MEDIA}/2024/02/Restaurant-Phase-2-1024x576.jpg`,
  },
  {
    phase: 'PHASE 3',
    heading: 'Standardize Process',
    desc: 'Use Crazy Seal to standardize your roofing & repair process across one or many facilities.',
    image: `${MEDIA}/2024/02/Restaurant-Phase-3-1024x576.jpg`,
  },
  {
    phase: 'PHASE 4',
    heading: 'Completed Permanent Roof',
    desc: 'Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!',
    image: `${MEDIA}/2024/02/Restaurant-Phase-4-Complete-1024x576.jpg`,
  },
]

const BEFORE_AFTERS = [
  {
    before: `${MEDIA}/2022/01/Left-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Left-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    before: `${MEDIA}/2022/01/Center-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Center-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
  {
    before: `${MEDIA}/2022/01/Right-1-Before-Square-1024x1024.jpg`,
    after: `${MEDIA}/2022/01/Right-1-After-Square-1024x1024.jpg`,
    aspect: '1/1',
  },
]

const FULL_BEFORE_AFTERS = [
  {
    before: `${MEDIA}/2022/01/Full-1-Before-1-Line-0-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Full-1-After-Line-0-1024x576.jpg`,
  },
  {
    before: `${MEDIA}/2022/01/Center-Full-2-Before-1024x576.jpg`,
    after: `${MEDIA}/2022/01/Center-Full-2-After-1024x576.jpg`,
  },
]

const KIT_INCLUDES = [
  'A custom suite of products uniquely designed to permanently seal every square millimeter of your roofing application.',
  '50 Year Product Warranty.',
  'Support from our team of roofing experts by phone, email, chat, or text message M-F 9:00am-6:00pm EST.',
  '24/7 Access to our video instruction series to show you step by step exactly how to install your system.',
  'PDF instructions to accompany the video series.',
  'Additional resource pages to guide you through installation.',
  'Free shipping on orders over $500.00',
]

const ADVANTAGES = [
  { icon: PiggyBank, title: 'Budget Friendly', desc: 'Stretch your annual budgets by applying Crazy Seal in Stages.' },
  { icon: ClipboardList, title: 'Standardized Approach', desc: 'A repair process that is also a long-term solution for all of your facilities.' },
  { icon: Zap, title: 'Energy Efficient', desc: 'Reduce energy costs with our highly reflective and energy efficient system.' },
  { icon: Recycle, title: 'Sustainable & Renewable', desc: 'No tear off required. Keep your existing roof intact with Crazy Seal.' },
  { icon: Leaf, title: 'Environmentally Friendly', desc: 'No hydrocarbon solvents are used, only VOC exempt silicon based solvents.' },
  { icon: Wrench, title: 'Simple Installation', desc: 'Our detailed videos & PDFs show you step-by-step how to get the job done.' },
  { icon: Truck, title: 'Fast On-Demand Shipping', desc: 'We ship anywhere within the United States and Canada.' },
  { icon: ShieldCheck, title: '50-Year Product Warranty', desc: 'We offer a fully transferrable 50 year product warranty.' },
  { icon: Headset, title: 'In-House Support Team', desc: 'Our specialists are here to help Monday-Friday, 9am-6pm by phone or email.' },
]

const QUICK_LINKS = [
  {
    icon: DollarSign,
    heading: 'Save Money',
    subheading: 'INSTALL YOURSELF & SAVE BIG',
    desc: 'Much of the cost of a typical roofing installation comes with labor. Do it yourself and save big with raw materials factory direct from Crazy Seal!',
    linkText: 'Pricing',
    href: '/pricing',
  },
  {
    icon: Timer,
    heading: 'Quick Install',
    subheading: 'GET THE JOB DONE FAST',
    desc: 'Hiring a roofing technician can take several weeks or even months. With Crazy Seal, you can have a brand new roof within hours of receiving your kit.',
    linkText: 'Installation',
    href: '/installation',
  },
  {
    icon: ShieldCheck,
    heading: 'Permanent',
    subheading: '50 YEAR PRODUCT WARRANTY',
    desc: "If it's worth doing, it's worth doing right. Rather than putting a bandaid on a problem, do it right and do it once with the Crazy Seal roofing system.",
    linkText: 'Warranty',
    href: '/warranty',
  },
]

interface FacilityAudiencePageProps {
  audienceHeading: string
  audienceIntro: string
  sourcePage: string
}

export function FacilityAudiencePage({
  audienceHeading,
  audienceIntro,
  sourcePage,
}: FacilityAudiencePageProps) {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  <span className="text-highlight">{audienceHeading}</span>
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-white mb-4">
                  No one stretches your budget like Crazy Seal!
                </p>
                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  {audienceIntro}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="#facility-contact" variant="accent" size="lg">
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
              <div>
                <YouTubeEmbed videoId="XZrXvweEo-U" variant="card" />
                <p className="text-center text-sm font-semibold text-white/70 mt-3">
                  Watch our Facilities video (5:52)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PHASES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="One and Done, In Stages"
            heading="Install Crazy Seal in stages to stretch your budget"
            subheading="Every Crazy Seal repair puts you one step closer to having a permanent seamless roof!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PHASES.map((p) => (
              <div
                key={p.phase}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={`${p.phase}: ${p.heading}`}
                  className="w-full h-auto object-cover"
                />
                <div className="p-5 text-center">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-1">
                    {p.phase}
                  </p>
                  <h3 className="font-bold text-primary mb-1">{p.heading}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton href="#facility-contact" variant="primary" size="lg">
              Start a Conversation
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
                alt="RFMA Facilitator Magazine feature on Crazy Seal"
                className="rounded-2xl shadow-xl h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in RFMA Facilitator Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                See Our Feature Article
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download an article on roofing from Crazy Seal&apos;s President in
                Restaurant Facility Managers Association magazine.
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
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="How to Get a Crazy Seal Roofing Kit" variant="dark" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
              <Phone className="w-9 h-9 text-highlight mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-3">Give Us a Call</h3>
              <LinkButton href="tel:8009630131" variant="outline-white" size="md">
                (800) 963-0131
              </LinkButton>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
              <Headset className="w-9 h-9 text-highlight mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-3">Get in Touch</h3>
              <LinkButton href="/contact" variant="outline-white" size="md">
                Contact Us
              </LinkButton>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center">
              <ShoppingCart className="w-9 h-9 text-highlight mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-3">Visit Our Online Store</h3>
              <LinkButton href="https://buy.crazyseal.com/" variant="accent" size="md" external>
                Shop Kits
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="Crazy Seal full overview video"
              />
              <p className="text-center text-sm font-semibold text-gray-500 mt-3">
                Click to watch our full overview video
              </p>
            </div>
            <div>
              <SectionHeading
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-lg font-semibold text-primary mb-3">
                Finally! A roofing system that is not all or nothing.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                With Crazy Seal, you can truly begin with a repair and go from
                there. Our system was designed specifically to allow you to
                solve immediate problems with a powerful long term solution in
                mind. Because it is fluid applied, you can use our system on a
                small application of a few square feet all the way up to
                completing a full commercial roof that is thousands of square
                feet! This means you can solve a problem now without
                sacrificing longevity in the process.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Better by design, our high grade fiber-infused silicone based
                system is waterproof, highly reflective, scratch resistant,
                flexible, tough, and backed by our 50 year warranty.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BEFORE / AFTER EXAMPLES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Commercial Roof Installation Examples"
            subheading="Slide the center bar back and forth to see the before and after transformations!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {BEFORE_AFTERS.map((ba) => (
              <BeforeAfterSlider
                key={ba.before}
                beforeSrc={ba.before}
                afterSrc={ba.after}
                aspectRatio={ba.aspect}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FULL_BEFORE_AFTERS.map((ba) => (
              <BeforeAfterSlider
                key={ba.before}
                beforeSrc={ba.before}
                afterSrc={ba.after}
                aspectRatio="16/9"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── INSTALL IN-HOUSE OR HIRE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 lg:gap-6 items-stretch">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3">Install In-House</h3>
              <p className="text-white/60 leading-relaxed">
                Install the system in-house using your own staff. We have a
                full suite of installation videos and PDF&apos;s to walk them
                through every step of the process.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-bold text-highlight">OR</span>
            </div>
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 lg:p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-3">
                Hire A Professional Installer
              </h3>
              <p className="text-white/60 leading-relaxed">
                Any local painter, roofer or handyman can easily get the job
                done, especially with the help of our step-by-step installation
                videos and PDF&apos;s.
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── REPAIR + FULL ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal serves two purposes. It's a roof repair system and a full roofing system!"
          />
          <div className="max-w-3xl mx-auto space-y-4 text-gray-600 leading-relaxed">
            <p>
              Nothing is more frustrating than doing the same thing over and
              over again to the same end result. Spot patching problem areas
              with sealants only kicks the can down the road to a future more
              expensive problem. Ultimately, patch jobs have to be removed,
              creating even more expense when the roof is replaced. This
              expensive cycle has gone on way too long for millions of
              facilities all over the world.
            </p>
            <p>
              It&apos;s time to take back control of your roof! With Crazy Seal, a
              patch doesn&apos;t just have to be a patch. You can now
              professionally handle problem areas on your roof, know the
              system that was used to solve the problem, and expand on it
              until you have a full seamless roofing system installed that
              will stand the test of time! Gone are the days of feeling out of
              control, at the mercy of the endless stream of insanely
              expensive commercial roofing quotes.
            </p>
            <p>
              Instead of continually putting band-aids on problems and hoping
              they stick, begin with the Crazy Seal Roofing System on a small
              area of your roof. As you continue to do repairs on small areas,
              they bond to each other until you ultimately end up with a
              completed seamless roof.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── MODERN TECH ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                Modern Tech Taking On An Old Challenge
              </h2>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-4">
                Crazy Seal is an engineering marvel. Our chemical strategists
                and product testing teams spent years developing what may well
                be the strongest fluid-applied membrane ever brought to
                market. Now our patented system is here and available to help
                you complete your seamless roofing project, backed by a fifty
                year warranty.
              </p>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed">
                For decades, there has been a huge gap in roofing. Most options
                ranged from low-grade coatings that are temporary at best to
                inferior roof membranes that often fail within 3-5 years.
                Previously, access to high quality materials was only
                available to large roofing contractors. We&apos;ve changed that
                with Crazy Seal! It&apos;s time to take care of the small and
                mid-size project with an affordable, high-grade system that
                can stand the test of time.
              </p>
            </div>
            <div className="relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2025/01/Crazy-Seal-U.S.-Patent-1024x1024.png`}
                alt="Crazy Seal U.S. Patent"
                className="rounded-2xl shadow-2xl ring-1 ring-white/10 w-full max-w-md h-auto object-cover bg-white"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── FIRE DEPARTMENT STORY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/Fire-Dept-Emerald-Isles.jpg`}
                alt="Town of Emerald Isle Fire Department rescue trailer sealed with Crazy Seal"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Real Results"
                heading="Fire Department Saves $39,000. Their review says it all."
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-4">
                The Town of Emerald Isle Fire Department recently sealed the
                roof of a 24&prime; emergency response rescue trailer. The EIFD
                staff completed the repairs using Crazy Seal products. Instead
                of spending $40,000 and waiting 12-months for a replacement
                trailer, town staff spent $1,000 on product. Two days later,
                the trailer was dry and ready to save lives along the weather
                impacted coast of North Carolina. Thank you to Crazy Seal and
                the fantastic folks that make such a wonderful product!
              </p>
              <p className="text-gray-800 font-semibold">
                Thank you,
                <br />
                Matt Zapp &ndash; Town Manager
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY CRAZY SEAL SUCCEEDS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Why does Crazy Seal succeed where others fail?" />
          <Grid responsiveCols={{ mobile: 1, tablet: 3 }} gap="lg">
            <FeatureCard
              icon={<Headset className="w-6 h-6 text-accent" />}
              title="We Support & Care About Our Customers"
              description="The Crazy Seal Roofing System is designed to actually solve your roofing problems! We are hyper-focused on helping you create an outstanding finishing result, and ship our products directly to you. We have a suite of instructional materials, and have experts on hand to help make your project a success."
            />
            <FeatureCard
              icon={<Wrench className="w-6 h-6 text-accent" />}
              title="3 Part Sealing System"
              description="Our 3-part sealing system actually stops leaks! Our system focuses on eliminating your problem areas first, then finalizes the sealing process with our final membrane. All components merge seamlessly together into a single membrane covering every square inch of your roof."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-accent" />}
              title="We Are One of a Kind"
              description="We are not aware of another manufacturer that offers a consumer direct model on an e-commerce platform, with tons of support, and the absolute best product available today. The end result, support, and product quality will ultimately be your best long term value."
            />
          </Grid>
          <div className="max-w-2xl mx-auto pt-8 md:pt-10">
            <h3 className="text-xl font-bold text-primary text-center mb-5">
              That&apos;s why every kit comes with:
            </h3>
            <ul className="space-y-3">
              {KIT_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-accent" />
                  </span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── READY TO GET STARTED ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-6">
            Every Crazy Seal repair puts you one step closer to having a
            permanent seamless roof!
          </p>
          <LinkButton href="#facility-contact" variant="accent" size="lg">
            Start a Conversation
          </LinkButton>
        </div>
      </Container>

      {/* ─── ADVANTAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Crazy Seal Advantages" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {ADVANTAGES.map((a) => (
              <FeatureCard
                key={a.title}
                icon={<a.icon className="w-6 h-6 text-accent" />}
                title={a.title}
                description={a.desc}
              />
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Quick Links to Other Pages" variant="dark" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.heading}
                href={link.href}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <link.icon className="w-9 h-9 text-highlight mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">{link.heading}</h3>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent mb-2">
                  {link.subheading}
                </p>
                <p className="text-sm text-white/60 leading-relaxed mb-4">{link.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                  {link.linkText} <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProTestimonials />
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="facility-contact"
          className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Let's Get in Touch"
            heading="Have Any Questions? Our Crazy Seal Specialists Can Help!"
            subheading="Fill out the form below and one of our Crazy Seal specialists will be in touch with you shortly. We promise to be fun, informative, and will do our very best to help you!"
          />
          <div className="max-w-2xl mx-auto">
            <ContactForm sourcePage={sourcePage} />
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
