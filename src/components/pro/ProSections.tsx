import {
  ArrowRight,
  ArrowUpRight,
  DollarSign,
  Presentation,
  ShieldCheck,
  Wrench,
  Package,
  Timer,
  Download,
  MapPin,
  MessageCircle,
} from 'lucide-react'
import { Grid, SectionHeading, TestimonialCard, LinkButton } from '@/lib/design-system'
import { Stagger, StaggerItem } from '@/components/motion'

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
      <div className="flex justify-center pt-8 md:pt-10">
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
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
          >
            <div className="overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={app.image}
                alt={app.title}
                className="w-full aspect-[9/7] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <h3 className="text-lg font-extrabold text-primary">{app.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{app.desc}</p>
                <span className="mt-2 inline-block text-sm font-bold text-accent-dark">{app.linkText}</span>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-8 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-5 ring-1 ring-primary/[0.06] md:mt-10 md:p-8">
        <h3 className="text-center text-xs font-bold uppercase tracking-[0.18em] text-primary/60 mb-5">
          See More Application Types
        </h3>
        <Stagger className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto" stagger={0.035}>
          {MORE_APPLICATION_TYPES.map((type) => (
            <StaggerItem key={type}>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08]">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {type}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
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
    desc: 'Show this page to potential customers to help earn their business.',
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
    desc: 'Downloadable tools to help you grow your Crazy Seal installation business.',
    linkText: 'Professional Tools',
    href: '/professional-tools',
  },
  {
    icon: Package,
    heading: 'Kits & Pricing',
    subheading: 'PRE-BUILT ROOFING KITS',
    desc: 'Pre-built kits for many jobs, or build your own kit from scratch!',
    linkText: 'Build My Kit',
    href: '/kit-builder',
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
      <SectionHeading eyebrow="Jump To" heading="Quick Links" variant="dark" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_LINKS.map((link) => (
          <a
            key={link.heading}
            href={link.href}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                <link.icon className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-highlight ring-1 ring-white/10">
                {link.subheading}
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1.5">{link.heading}</h3>
            <p className="text-sm text-white/65 leading-relaxed mb-5">{link.desc}</p>
            <span className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm font-bold text-white">
              {link.linkText}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent">
                <ArrowUpRight className="h-4 w-4" />
              </span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center mb-10 md:mb-14">
        <div className="text-center md:text-left">
          <SectionHeading
            eyebrow="Demand Creates Opportunity"
            heading="New Leads For Your Business"
            align="left"
            className="mb-4 text-center md:text-left"
          />
          <p className="text-gray-600 leading-relaxed md:text-lg">
            We&apos;re simply a manufacturer that ships products direct &mdash; and many of our
            customers ask for an installer near them. We love sending that business to our
            Professional Partners.
          </p>
        </div>
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-highlight/20 via-transparent to-accent/20 blur-2xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2022/07/US-Map-Gold-Professionals-1024x663.png`}
            alt="Map of Crazy Seal professional partners across the United States"
            className="relative w-full h-auto"
          />
          <span className="absolute -bottom-3 left-4 hidden sm:inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-bold text-primary shadow-2xl ring-1 ring-primary/10 animate-float">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
              <MapPin className="h-4 w-4" />
            </span>
            Customers asking for installers
          </span>
        </div>
      </div>
      <h3 className="flex items-center justify-center gap-2 text-center text-xl font-extrabold text-primary mb-6">
        <MessageCircle className="h-5 w-5 text-accent" />
        Example Chats of Customers Asking for Pro Installation
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        {CHAT_EXAMPLES.map((src, i) => (
          <div
            key={src}
            className="group overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Customer chat example ${i + 1} asking for professional Crazy Seal installation`}
              className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Trailer Life feature (professionals + rv professionals + tools) ── */

export function ProTrailerLife() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 md:p-10 shadow-xl">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl" />
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_right,black,transparent_70%)]" />
      <div className="relative grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-12 items-center">
        <div className="order-2 md:order-1 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-600x800.jpg`}
            alt="Trailer Life Magazine May 2020 cover"
            className="h-64 md:h-80 w-auto rounded-xl shadow-2xl ring-1 ring-white/20 -rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
          />
        </div>
        <div className="order-1 md:order-2 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            See Our Feature Article
          </h2>
          <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-7 max-w-xl mx-auto md:mx-0">
            Download our Trailer Life Magazine feature explaining the revolutionary Crazy Seal
            roofing system.
          </p>
          <LinkButton
            href={`${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`}
            variant="white"
            size="lg"
            external
          >
            <Download className="w-5 h-5" />
            See Feature PDF
          </LinkButton>
        </div>
      </div>
    </div>
  )
}
