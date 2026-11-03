import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Flag, Phone, ShieldCheck, Truck } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { GlowOrb, Marquee } from '@/components/motion'
import { ApplicationIcon, FamilyIcon } from '@/components/applications/applicationIcons'
import { APPLICATIONS, FAMILIES, type ApplicationFamily } from '@/lib/applications/config'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'DIY Roofing for All Applications',
  description:
    "Seal your own application's roof for less with the DIY Crazy Seal Roofing System.",
}

const MAIN_APPLICATIONS = [
  {
    title: 'RV',
    desc: "RV's, travel trailers, fifth wheels, motor coaches, and more.",
    cta: 'RV Roofs',
    href: '/rv-roofs',
    image: `${MEDIA}/2022/01/Areas_RVs.png`,
  },
  {
    title: 'Commercial',
    desc: 'Flat-roof facilities of every kind.',
    cta: 'Commercial Flat Roofs',
    href: '/commercial-roofing',
    image: `${MEDIA}/2022/01/Areas_Commercial.png`,
  },
  {
    title: 'Residential',
    desc: 'Flat residential roofs, sunrooms, storage buildings, and more.',
    cta: 'Residential Flat Roofs',
    href: '/residential',
    image: `${MEDIA}/2022/01/Areas_Residential.png`,
  },
  {
    title: 'Transportation',
    desc: 'Tractor trailers, box trucks, delivery vehicles, fleets.',
    cta: 'Transportation Roofs',
    href: '/transportation',
    image: `${MEDIA}/2022/01/Areas_Fleets.png`,
  },
]

const FAMILY_ORDER: ApplicationFamily[] = ['rv', 'residential', 'commercial', 'transportation']

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Flag, label: 'Made in America' },
  { icon: Truck, label: 'Ships to your door' },
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

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

export default function ApplicationsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-0 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-12 lg:py-20 text-center">
            <h1
              {...enter(100)}
              className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06] mb-5"
            >
              Crazy Seal <span className="text-shimmer-highlight">Applications</span>
            </h1>
            <p
              {...enter(180)}
              className="animate-fade-up text-white/70 text-lg max-w-xl mx-auto leading-relaxed"
            >
              One seamless system for flat and low-slope roofs of every kind. Pick the one that
              matches yours.
            </p>
            <ul
              {...enter(260)}
              className="animate-fade-up mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3"
            >
              {HERO_TRUST.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── EVERY APPLICATION (marquee) ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <Marquee duration={60}>
          {APPLICATIONS.map((app) => (
            <Link
              key={app.slug}
              href={`/${app.slug}`}
              className="mx-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08] transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
            >
              <ApplicationIcon slug={app.slug} className="h-3.5 w-3.5 text-accent" />
              {app.label}
            </Link>
          ))}
        </Marquee>
      </Container>

      {/* ─── MAIN APPLICATIONS ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Start Here" heading="Choose a Section That Matches Your Application" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MAIN_APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full aspect-[9/7] object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-extrabold text-primary">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{app.desc}</p>
                  <div className="mt-auto flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-accent-dark">{app.cta}</span>
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── SPECIFIC APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Get Specific"
            heading="Or Choose Your Exact Application"
            subheading="Every roof fails differently. Each guide covers the failure points, the right kit, and real installs."
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {FAMILY_ORDER.map((familyId) => {
              const family = FAMILIES[familyId]
              const apps = APPLICATIONS.filter((a) => a.family === familyId)
              return (
                <div
                  key={familyId}
                  className="relative overflow-hidden rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25"
                >
                  <Link
                    href={family.hubHref}
                    className="group mb-4 flex items-center justify-between gap-3"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:-rotate-6">
                        <FamilyIcon family={familyId} className="h-5 w-5 text-highlight" />
                      </span>
                      <span className="font-extrabold text-white uppercase tracking-wide text-sm">
                        {family.label}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-highlight transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <ul className="space-y-1">
                    {apps.map((app) => (
                      <li key={app.slug}>
                        <Link
                          href={`/${app.slug}`}
                          className="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <ApplicationIcon
                            slug={app.slug}
                            className="h-4 w-4 shrink-0 text-accent-light transition-transform duration-300 group-hover:scale-110"
                          />
                          {app.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={family.hubHref}
                        className="block rounded-xl px-3 py-2 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        All {family.hubLabel} &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-highlight"
            >
              Another Application? Talk to Us
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-white/80 hover:text-white text-sm font-semibold ring-1 ring-white/10 hover:bg-white/10 transition-colors"
            >
              <Phone className="w-4 h-4 text-accent-light" />
              Not sure where to start? Call (800) 963-0131
            </a>
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Crazy Reviews" heading="Photos & Reviews" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {TESTIMONIALS.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-12 sm:px-6 md:p-12 lg:p-16 text-center">
          <GlowOrb className="left-1/2 -top-40 h-80 w-[36rem] -translate-x-1/2" color="rgb(26 123 196 / 0.4)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
          />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-7">
              Let&apos;s Get In Touch
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/contact" variant="accent" size="lg">
                Contact Us
              </LinkButton>
              <LinkButton href="/kit-builder" variant="white" size="lg">
                Build My Kit
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 px-2 text-white/80 hover:text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
