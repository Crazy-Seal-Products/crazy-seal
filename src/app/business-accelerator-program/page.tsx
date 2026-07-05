import type { Metadata } from 'next'
import {
  ArrowRight,
  FileCheck,
  Megaphone,
  Package,
  Phone,
  PlayCircle,
  Presentation,
  Rocket,
  Wrench,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  LinkButton,
} from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { VimeoEmbed } from './VimeoEmbed'

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
    desc: 'Check out these videos and resources to get up to speed with the benefits of our system.',
    cta: 'Welcome',
    href: '#welcome-video',
    icon: PlayCircle,
  },
  {
    number: 2,
    eyebrow: 'Marketing',
    title: 'Pre-Built Marketing Campaigns',
    desc: 'Just press play! Use these pre-built marketing campaigns to launch your business.',
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
    desc: 'We have pre-built kits for many jobs, or you can build your own kit from scratch!',
    cta: 'Building a Kit',
    href: 'https://buy.crazyseal.com/pages/build-your-own-kit',
    icon: Package,
  },
  {
    number: 5,
    eyebrow: 'Installation',
    title: 'Installing Our System',
    desc: 'Learn how to professionally install our products with videos and PDFs.',
    cta: 'Installation',
    href: '/installation',
    icon: Wrench,
  },
  {
    number: 6,
    eyebrow: 'Warranty',
    title: 'File Your Customer\u2019s Warranty',
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Rocket className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Business Accelerator Program
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Launch Your New Crazy Seal Roofing Business Like a Boss
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                  We&apos;ve allocated a lot of resources to figuring out what
                  works in marketing and selling the Crazy Seal Roofing
                  System. Professionals like you are the backbone of our
                  business, so we created this training program to give you a
                  head start in launching your successful Crazy Seal Roofing
                  Business!
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="#welcome-video" variant="accent" size="lg">
                    Get Started With the First Module
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                </div>
              </div>
              <div id="welcome-video" className="scroll-mt-24">
                <VimeoEmbed
                  videoId="937517340"
                  poster={`${MEDIA}/2024/04/Business-Accelerator-Program-Thumbnail.jpg`}
                  title="Welcome to Crazy Seal"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 1: Welcome to Crazy Seal
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PROGRAM MODULES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Your Head Start"
            heading="Program Modules"
            subheading="Work through these six modules to get your Crazy Seal Roofing Business up and running."
          />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 3 }} gap="lg">
            {MODULES.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <mod.icon className="w-8 h-8 text-primary" />
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {mod.number}
                  </span>
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-1">
                  {mod.eyebrow}
                </p>
                <h3 className="font-bold text-primary mb-2">{mod.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {mod.desc}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  {mod.cta}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="#welcome-video" variant="primary" size="lg">
              Get Started With the First Module
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="request-content"
          className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Request Content or a Feature"
            heading="What Would Support Your Business?"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage="business-accelerator-program" />
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            Not a Professional Partner Yet?
          </h2>
          <p className="text-white/70 text-base sm:text-lg mb-6 max-w-xl mx-auto">
            Join our network of Professional Partners and start increasing
            your profits with the Crazy Seal system.
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
