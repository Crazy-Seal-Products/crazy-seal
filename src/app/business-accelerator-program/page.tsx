import type { Metadata } from 'next'
import {
  ArrowRight,
  ArrowUpRight,
  FileCheck,
  LayoutDashboard,
  Megaphone,
  Package,
  Phone,
  PlayCircle,
  Presentation,
  Wrench,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { ContentRequestSection, ModuleNav } from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Business Accelerator Program',
  description:
    'Launch your new Crazy Seal Roofing Business like a boss. Training modules, pre-built marketing campaigns, sales resources, and installation guides for Crazy Seal Professional Partners.',
}

const MODULES = [
  {
    number: 1,
    eyebrow: 'Welcome',
    title: 'Welcome to Crazy Seal!',
    desc: 'Videos and resources to get up to speed with the benefits of our system.',
    cta: 'Welcome',
    href: '#welcome-video',
    icon: PlayCircle,
  },
  {
    number: 2,
    eyebrow: 'Marketing',
    title: 'Pre-Built Marketing Campaigns',
    desc: 'Just press play! Pre-built campaigns to launch your business.',
    cta: 'Marketing',
    href: '#request-content',
    icon: Megaphone,
  },
  {
    number: 3,
    eyebrow: 'Sales',
    title: 'Assets to Sell and Close Deals',
    desc: 'Pre-built digital sales pages and other resources to close more deals.',
    cta: 'Sales',
    href: '#request-content',
    icon: Presentation,
  },
  {
    number: 4,
    eyebrow: 'Building a Kit',
    title: 'Get the Products You Need',
    desc: 'Pre-built kits for many jobs, or build your own kit from scratch!',
    cta: 'Building a Kit',
    href: '/kit-builder#products',
    icon: Package,
  },
  {
    number: 5,
    eyebrow: 'Installation',
    title: 'Installing Our System',
    desc: 'Learn to professionally install our products with videos and PDFs.',
    cta: 'Installation',
    href: '/installation',
    icon: Wrench,
  },
  {
    number: 6,
    eyebrow: 'Warranty',
    title: 'File Your Customer’s Warranty',
    desc: 'Learn how to file the 50 year warranty form on behalf of your customers.',
    cta: 'Warranty',
    href: '/warranty',
    icon: FileCheck,
  },
]

export default function BusinessAcceleratorProgramPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-6 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-14 lg:px-12 lg:py-16">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <div className="text-center lg:text-left">
                <h1
                  className="animate-fade-up mb-4 text-3xl font-extrabold leading-[1.08] tracking-tight text-white text-balance sm:text-4xl lg:text-5xl"
                  style={{ animationDelay: '80ms' }}
                >
                  Launch Your New Crazy Seal Roofing Business{' '}
                  <span className="text-shimmer-highlight">Like a Boss</span>
                </h1>
                <p
                  className="animate-fade-up text-base leading-relaxed text-white/70 text-pretty sm:text-lg"
                  style={{ animationDelay: '160ms' }}
                >
                  We&apos;ve invested heavily in figuring out what works in marketing and selling the
                  Crazy Seal Roofing System. Professionals like you are the backbone of our business
                  &mdash; so we built this training program to give you a head start.
                </p>
                <div
                  className="animate-fade-up mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  style={{ animationDelay: '240ms' }}
                >
                  <LinkButton href="#welcome-video" variant="accent" size="lg">
                    Get Started With the First Module
                    <ArrowRight className="h-4 w-4" />
                  </LinkButton>
                </div>

                {/* Six-module roadmap */}
                <ol className="mx-auto mt-8 flex max-w-md items-center lg:mx-0" aria-label="Six program modules">
                  {MODULES.map((mod, i) => (
                    <li
                      key={mod.number}
                      className="animate-fade-up flex flex-1 items-center last:flex-none"
                      style={{ animationDelay: `${320 + i * 70}ms` }}
                    >
                      <span
                        title={`Module ${mod.number}: ${mod.eyebrow}`}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20"
                      >
                        <mod.icon className="h-4 w-4 text-highlight" />
                      </span>
                      {i < MODULES.length - 1 && (
                        <span aria-hidden="true" className="mx-1 h-px flex-1 bg-gradient-to-r from-white/30 to-white/10" />
                      )}
                    </li>
                  ))}
                </ol>
                <p
                  className="animate-fade-up mt-3 text-xs font-bold uppercase tracking-[0.16em] text-white/50"
                  style={{ animationDelay: '760ms' }}
                >
                  6 modules &middot; Welcome to Warranty
                </p>
              </div>

              <div
                id="welcome-video"
                className="animate-fade-up relative scroll-mt-24"
                style={{ animationDelay: '200ms' }}
              >
                <ProVimeoEmbed
                  videoId="937517340"
                  thumbnail={`${MEDIA}/2024/04/Business-Accelerator-Program-Thumbnail.jpg`}
                  title="Welcome to Crazy Seal"
                />
                <p className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-white/60">
                  <PlayCircle className="h-4 w-4 text-highlight" />
                  Module 1: Welcome to Crazy Seal
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PRO PORTAL BANNER ─── */}
      <Container size="xl" className="pt-4 md:pt-6">
        <div className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-card ring-1 ring-primary/[0.08] sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-10 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-highlight/40 to-accent/20 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-5 sm:text-left">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-light to-primary text-white shadow-glow-primary transition-transform duration-500 group-hover:-rotate-6">
              <LayoutDashboard className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h2 className="text-lg font-extrabold tracking-tight text-primary sm:text-xl">
                This program now also lives inside the Pro Portal
              </h2>
              <p className="text-sm text-gray-500">Work through every module with built-in progress tracking.</p>
            </div>
            <LinkButton href="/portal/login/" variant="primary" size="md">
              Open in the Pro Portal
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      <ModuleNav />

      {/* ─── PROGRAM MODULES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Your Head Start"
            heading="Program Modules"
            subheading="Work through these six modules to get your Crazy Seal Roofing Business up and running."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {MODULES.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl md:p-7"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-4 text-8xl font-extrabold leading-none text-primary/[0.05] transition-colors duration-500 group-hover:text-accent/10 font-[family-name:var(--font-display)]"
                >
                  {String(mod.number).padStart(2, '0')}
                </span>
                <div className="relative mb-5 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                    <mod.icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                    Module {mod.number}
                  </span>
                </div>
                <p className="relative mb-1 text-xs font-bold uppercase tracking-[0.18em] text-accent-dark">{mod.eyebrow}</p>
                <h3 className="relative mb-2 text-lg font-extrabold text-primary">{mod.title}</h3>
                <p className="relative mb-6 text-sm leading-relaxed text-gray-500">{mod.desc}</p>
                <span className="relative mt-auto flex items-center justify-between gap-3 border-t border-primary/[0.07] pt-4 text-sm font-bold text-primary">
                  {mod.cta}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/[0.06] transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="#welcome-video" variant="primary" size="lg">
              Get Started With the First Module
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection
        id="request-content"
        sourcePage="business-accelerator-program"
        eyebrow="Request Content or a Feature"
        heading="What Would Support Your Business?"
      />

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-10 text-center sm:px-6 md:p-10 lg:p-14">
          <GlowOrb className="-right-24 -top-24 h-72 w-72" color="rgb(249 234 28 / 0.18)" />
          <div className="relative">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Not a Professional Partner <span className="text-shimmer-highlight">Yet?</span>
            </h2>
            <p className="mx-auto mb-7 max-w-xl text-base text-white/70 sm:text-lg">
              Join our network of Professional Partners and start increasing your profits with the
              Crazy Seal system.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/professionals" variant="accent" size="lg">
                Become a Professional Partner
              </LinkButton>
              <LinkButton href="/contact" variant="white" size="lg">
                Contact Us
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 font-semibold text-white/80 transition-colors hover:text-white"
              >
                <Phone className="h-5 w-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}
