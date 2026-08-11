import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone } from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
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
    desc: 'Facilities of all kinds with flat roofs are using Crazy Seal!',
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

export default function ApplicationsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-18 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Every Flat Roof
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Applications
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto leading-relaxed">
              The Crazy Seal Roofing System permanently seals flat and low-slope
              roofs of every kind. Choose a section that matches your
              application.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── MAIN APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Choose a Section That Matches Your Application" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {MAIN_APPLICATIONS.map((app) => (
              <a
                key={app.title}
                href={app.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={app.image} alt={app.title} className="w-full h-auto object-cover" />
                <div className="p-5 text-center">
                  <h3 className="font-bold text-primary mb-1">{app.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{app.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    {app.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── SPECIFIC APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Get Specific"
            heading="Or Choose Your Exact Application"
            subheading="Every roof fails differently. Each guide below covers the failure points, the right kit, and real installs for that exact application."
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FAMILY_ORDER.map((familyId) => {
              const family = FAMILIES[familyId]
              const apps = APPLICATIONS.filter((a) => a.family === familyId)
              return (
                <div
                  key={familyId}
                  className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5"
                >
                  <Link
                    href={family.hubHref}
                    className="group flex items-center justify-between gap-2 mb-3"
                  >
                    <h3 className="font-bold text-highlight uppercase tracking-wide text-sm">
                      {family.label}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-highlight group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <ul className="space-y-1.5">
                    {apps.map((app) => (
                      <li key={app.slug}>
                        <Link
                          href={`/${app.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {app.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        href={family.hubHref}
                        className="block rounded-lg px-3 py-2 text-sm font-semibold text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        All {family.hubLabel} &rarr;
                      </Link>
                    </li>
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 md:pt-8">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-highlight hover:gap-2.5 transition-all"
            >
              Another Application? Talk to Us
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
            >
              <Phone className="w-5 h-5" />
              Not sure where to start? Call (800) 963-0131
            </a>
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
            <LinkButton href="/kit-builder" variant="white" size="lg">
              Build My Kit
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
