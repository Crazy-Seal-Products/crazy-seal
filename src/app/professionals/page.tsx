import type { Metadata } from 'next'
import {
  ArrowRight,
  BadgeDollarSign,
  CheckCircle2,
  Download,
  FileCheck,
  MonitorPlay,
  Phone,
  ShoppingCart,
  Timer,
  Wrench,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
  YouTubeEmbed,
} from '@/lib/design-system'
import { ProfessionalContactForm } from '@/components/forms/ProfessionalContactForm'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Professionals',
  description:
    'Increase profits with our seamless roof system. Join the Crazy Seal Professional network — no franchise fees, no inventory requirements, free on-demand shipping, and new leads for your business.',
}

const PERKS = [
  'No Franchise Fees',
  'No Inventory Requirements',
  'Fast, Free On-Demand Shipping',
  '50 Year Warranty on All Kits and Products',
  'New Leads for Your Business',
  'Rebates for High Volume Users',
]

const QUICK_LINKS = [
  {
    eyebrow: 'Make Money',
    title: 'Install & Earn Big',
    desc: 'Install seamless roofs and earn big with raw materials factory direct from Crazy Seal!',
    cta: 'Ways to Earn',
    href: '/ways-to-earn',
    icon: BadgeDollarSign,
  },
  {
    eyebrow: 'Customer Presentation',
    title: 'Earn Their Business',
    desc: 'Just press play! Show this page to potential customers to help earn their business.',
    cta: 'See Customer Pages',
    href: '/crazy-seal',
    icon: MonitorPlay,
  },
  {
    eyebrow: 'Completed Job',
    title: 'File the Warranty',
    desc: 'File your customer\u2019s warranty and send an automatic confirmation email and PDF.',
    cta: 'File the Warranty',
    href: '/warranty',
    icon: FileCheck,
  },
  {
    eyebrow: 'Professional Tools',
    title: 'Our Tools / Your Profit',
    desc: 'Use these downloadable tools to help you grow your Crazy Seal Installation Business.',
    cta: 'Professional Tools',
    href: '/professional-tools',
    icon: Wrench,
  },
  {
    eyebrow: 'Kits & Pricing',
    title: 'Pre-Built Roofing Kits',
    desc: 'We have pre-built kits for many jobs, or you can build your own kit from scratch!',
    cta: 'Kits & Pricing',
    href: '/pricing',
    icon: ShoppingCart,
  },
  {
    eyebrow: 'Quick Install',
    title: 'Get the Job Done Fast',
    desc: 'With Crazy Seal, you can have a brand new roof installed within hours.',
    cta: 'Installation',
    href: '/installation',
    icon: Timer,
  },
]

const CHAT_EXAMPLES = [1, 2, 3, 4, 5, 6].map(
  (n) => `${MEDIA}/2022/07/Pro-Chat-Example-${n}.jpg`
)

const TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    text: 'I loved the product. I\u2019d recommend it to anybody!',
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

export default function ProfessionalsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight mb-3">
                  Professionals
                </p>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Increase Profits With Our Seamless Roof System
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                  More and more people are asking for a professionally
                  installed Crazy Seal roofing system every single day!
                  We&apos;d love to have a conversation about your business to
                  see how we can work together to increase your profits.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="#start-a-conversation" variant="accent" size="lg">
                    Start a Conversation
                    <ArrowRight className="w-4 h-4" />
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
                <YouTubeEmbed videoId="PRhpGHn-J3s" variant="card" />
                <p className="text-center text-white/50 text-sm mt-3">
                  Watch the Professional Opportunities video (4:00)
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PROFESSIONAL PERKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <SectionHeading
                eyebrow="Professional Program"
                heading="Join Our Network for Professional Perks"
                align="left"
                className="mb-6"
              />
              <ul className="space-y-3 mb-8">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-gray-700 font-medium">{perk}</span>
                  </li>
                ))}
              </ul>
              <LinkButton href="#start-a-conversation" variant="primary" size="lg">
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/07/US-Map-Gold-Professionals.png`}
                alt="Map of Crazy Seal professional partners across the United States"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Quick Links" variant="dark" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.title}
                href={link.href}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
              >
                <link.icon className="w-8 h-8 text-highlight mb-4" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 mb-1">
                  {link.eyebrow}
                </p>
                <h3 className="font-bold text-white mb-2">{link.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-3">
                  {link.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                  {link.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </Grid>
        </div>
      </Container>

      {/* ─── NEW LEADS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Demand Creates Opportunity"
            heading="New Leads for Your Business"
            subheading="We are simply a manufacturer that ships products direct. Many of our customers ask for an installer near them, and we love sending business to our Professional Partners."
          />
          <p className="text-center text-sm font-semibold text-gray-500 mb-6">
            Example chats of customers asking for pro installation:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CHAT_EXAMPLES.map((src, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={src}
                src={src}
                alt={`Customer chat example ${i + 1} asking for professional Crazy Seal installation`}
                className="w-full h-auto rounded-xl border border-gray-200 shadow-sm"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── INCREASE PROFITS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto text-center">
            <SectionHeading
              eyebrow="The Word Is Out"
              heading="Increase Your Profits Immediately With Crazy Seal"
            />
            <div className="space-y-4 text-gray-600 text-base sm:text-lg leading-relaxed text-left sm:text-center">
              <p>
                With seamless roofing systems on the rise all over the roofing
                industry, people are naturally gravitating toward this new,
                maintenance free option. Especially in the RV industry, people
                love the idea of a &ldquo;one-and-done&rdquo; system.
              </p>
              <p>
                Traditional roofing systems that require UV treatments and
                resealing annually are no fun for anyone. RV&apos;ers want to
                enjoy their rig with less downtime. That&apos;s exactly what
                the Crazy Seal system offers since they can do their roof once
                with Crazy Seal, do it right, and receive a 50 year product
                warranty.
              </p>
              <p>
                Our Professional Program allows you to immediately begin
                turning more profit in your business. Plus, high volume
                dealers get additional rebates that increase profitability
                even further.
              </p>
            </div>
            <div className="pt-8">
              <LinkButton href="#start-a-conversation" variant="accent" size="lg">
                Start a Conversation
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ADDITIONAL INFORMATION VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Additional Information"
            heading="Learn More About the Crazy Seal System"
            subheading="Watch our &ldquo;21&frac12; Reasons Why&rdquo; and &ldquo;Let&rsquo;s Get Crazy&rdquo; videos to learn more about the Crazy Seal system."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <ProYouTubeEmbed
                videoId="C5FvTulPDaY"
                thumbnail={`${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`}
                title="21 and a half Reasons Why video"
              />
              <p className="text-center text-white/60 text-sm font-semibold mt-3">
                21&frac12; Reasons Why
              </p>
            </div>
            <div>
              <YouTubeEmbed videoId="VoPjXn8YCk4" variant="card" />
              <p className="text-center text-white/60 text-sm font-semibold mt-3">
                Let&rsquo;s Get Crazy
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton
              href={`${MEDIA}/2020/02/21-Reasons.pdf`}
              variant="white"
              size="md"
              external
            >
              <Download className="w-4 h-4" />
              Download Our 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── PHOTOS & REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="DIY Images & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
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

      {/* ─── APPLICATION TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Learn More About Different Application Types" />
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
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {app.desc}
                  </p>
                </div>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton href="/applications" variant="outline" size="md">
              See More Application Types
              <ArrowRight className="w-4 h-4" />
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
                alt="Trailer Life Magazine May 2020 cover featuring Crazy Seal"
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

      {/* ─── HYBRID ROOF SYSTEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2019/07/Metal-Closeup-800x800.jpg`}
                alt="Close-up of the Crazy Seal fiber-infused silicone membrane on a metal roof"
                className="w-full h-auto rounded-2xl shadow-xl"
                loading="lazy"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight mb-3">
                The Crazy Seal Hybrid Roof System
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                The Most Advanced System Ever Developed
              </h2>
              <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                Imagine taking roofing fabric and infusing it with the highest
                grade silicone money can buy. As each piece of the Crazy Seal
                System cures, fiber strands bond to each other in a complex
                interstitial network that delivers the strength of roofing
                fabric with the durability, flexibility, and longevity of
                silicone. The result is a seamless, fiber reinforced roofing
                membrane that is waterproof, highly reflective, scratch
                resistant, flexible, tough, and maintenance free.
              </p>
              <LinkButton href="/crazy-seal" variant="accent" size="lg">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="start-a-conversation"
          className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Let's Get in Touch"
            heading="Start a Conversation"
            subheading="Have any questions? Our Crazy Seal specialists can help!"
          />
          <div className="max-w-2xl mx-auto">
            <ProfessionalContactForm sourcePage="professionals" />
          </div>
        </div>
      </Container>
    </>
  )
}
