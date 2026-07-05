import {
  ArrowRight,
  DollarSign,
  Presentation,
  ShieldCheck,
  Wrench,
  Package,
  Timer,
  Download,
} from 'lucide-react'
import { Grid, SectionHeading, TestimonialCard, LinkButton } from '@/lib/design-system'

export const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

/* ── Testimonials shown on all professional pages ── */

const PRO_TESTIMONIALS = [
  {
    name: 'David Vincent, Key Largo, FL',
    text: 'Thank you for a great and reassuring experience! I have already referred this system to 3 family and friends.',
  },
  {
    name: 'Dan Horning, Sarasota, FL',
    photo: `${MEDIA}/2021/04/Van-Dusseldorp-400x400.jpg`,
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

export function ProTestimonials({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  return (
    <>
      <SectionHeading
        eyebrow="Crazy Reviews"
        heading="Photos & Reviews"
        variant={variant}
      />
      <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
        {PRO_TESTIMONIALS.map((t) => (
          <TestimonialCard
            key={t.name}
            name={t.name}
            photo={t.photo}
            text={t.text}
            variant={variant}
          />
        ))}
      </Grid>
      <div className="flex justify-center pt-6 md:pt-10">
        <LinkButton
          href="/reviews"
          variant={variant === 'dark' ? 'white' : 'accent'}
          size="md"
        >
          See More Photos & Reviews
          <ArrowRight className="w-4 h-4" />
        </LinkButton>
      </div>
    </>
  )
}

/* ── Application types grid (professionals + rv professionals) ── */

const APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches.",
    linkText: 'RV Roofs',
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
    linkText: 'Commercial Flat Roofs',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential, sunrooms, storage buildings.',
    linkText: 'Residential Flat Roofs',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    linkText: 'Transportation Roofs',
    href: '/transportation',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
]

const MORE_APPLICATION_TYPES = [
  'Pop Up Campers',
  'Tractor Trailers',
  'Truck Campers',
  'Self Storage',
  'Barns',
  'Boat Houses',
  'Industrial',
  'Metal Buildings',
  'Sheds',
  'Porch Roofs',
  'Outdoor Rooms',
  'Shipping Containers',
  'Tiny Homes',
  'Sunrooms',
  'Box Trucks',
  'Other Applications',
]

export function ProApplications() {
  return (
    <>
      <SectionHeading
        eyebrow="Every Flat Roof"
        heading="Learn More About Different Application Types"
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
                {app.linkText} <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="pt-8 md:pt-10">
        <h3 className="text-xl font-bold text-primary text-center mb-5">
          See More Application Types
        </h3>
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 max-w-4xl mx-auto">
          {MORE_APPLICATION_TYPES.map((type) => (
            <li
              key={type}
              className="text-sm font-semibold uppercase tracking-wide text-gray-600 text-center py-1.5 rounded-lg bg-gray-50 border border-gray-200/60"
            >
              {type}
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/* ── Quick links grid (professionals + rv professionals) ── */

const QUICK_LINKS = [
  {
    icon: DollarSign,
    heading: 'Make Money',
    subheading: 'INSTALL & EARN BIG',
    desc: 'Install seamless roofs and earn big with raw materials factory direct from Crazy Seal!',
    linkText: 'Ways to Earn',
    href: '/ways-to-earn',
  },
  {
    icon: Presentation,
    heading: 'Customer Presentation',
    subheading: 'JUST PRESS PLAY',
    desc: 'Just press play! Show this page to potential customers to help earn their business.',
    linkText: 'See Customer Pages',
    href: '/rv-roofing',
  },
  {
    icon: ShieldCheck,
    heading: 'Completed Job',
    subheading: 'FILE THE WARRANTY',
    desc: "File your customer's warranty and send an automatic confirmation email and PDF.",
    linkText: 'File the Warranty',
    href: '/warranty',
  },
  {
    icon: Wrench,
    heading: 'Professional Tools',
    subheading: 'OUR TOOLS / YOUR PROFIT',
    desc: 'Use these downloadable tools to help you grow your Crazy Seal Installation Business.',
    linkText: 'Professional Tools',
    href: '/professional-tools',
  },
  {
    icon: Package,
    heading: 'Kits & Pricing',
    subheading: 'PRE-BUILT ROOFING KITS',
    desc: 'We have pre-built kits for many jobs, or you can build your own kit from scratch!',
    linkText: 'Kits & Pricing',
    href: '/pricing',
  },
  {
    icon: Timer,
    heading: 'Quick Install',
    subheading: 'GET THE JOB DONE FAST',
    desc: 'With Crazy Seal, you can have a brand new roof installed within hours.',
    linkText: 'Installation',
    href: '/installation',
  },
]

export function ProQuickLinks() {
  return (
    <>
      <SectionHeading heading="Quick Links" variant="dark" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </>
  )
}

/* ── New leads / chat examples (professionals + rv professionals) ── */

const CHAT_EXAMPLES = [1, 2, 3, 4, 5, 6].map(
  (n) => `${MEDIA}/2022/07/Pro-Chat-Example-${n}.jpg`
)

export function ProNewLeads() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center mb-8 md:mb-12">
        <div>
          <SectionHeading
            eyebrow="Demand Creates Opportunity"
            heading="New Leads For Your Business"
            align="left"
            className="mb-4"
          />
          <p className="text-gray-600 leading-relaxed">
            Demand from our customers creates opportunity for you! We are simply
            a manufacturer that ships products direct. Many of our customers ask
            for an installer near them, and we love sending business to our
            Professional Partners.
          </p>
        </div>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2022/07/US-Map-Gold-Professionals-1024x663.png`}
            alt="Map of Crazy Seal professional partners across the United States"
            className="w-full h-auto"
          />
        </div>
      </div>
      <h3 className="text-xl font-bold text-primary text-center mb-6">
        Example Chats of Customers Asking for Pro Installation
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CHAT_EXAMPLES.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={src}
            src={src}
            alt={`Customer chat example ${i + 1} asking for professional Crazy Seal installation`}
            className="w-full h-auto rounded-xl border border-gray-200 shadow-sm"
          />
        ))}
      </div>
    </>
  )
}

/* ── Trailer Life feature (professionals + rv professionals + tools) ── */

export function ProTrailerLife() {
  return (
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
          Download our featured article from Trailer Life Magazine explaining
          our revolutionary Crazy Seal roofing system.
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
  )
}
