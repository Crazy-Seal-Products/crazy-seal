import type { Metadata } from 'next'
import { ArrowRight, Wrench } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Installation',
  description:
    'Module 5 of the Crazy Seal Business Accelerator Program. Videos and PDFs explaining the Crazy Seal installation process for membrane roofs and direct to deck applications.',
}

const INSTALL_LINKS = [
  {
    image: `${MEDIA}/2020/02/Over-Membrane-For-Installation-Page.jpg`,
    alt: 'Membrane roof installation videos and PDFs',
    href: '/installation/membrane-roof',
  },
  {
    image: `${MEDIA}/2020/02/D2D-For-Installation-Page.jpg`,
    alt: 'Direct to Deck installation videos and PDFs',
    href: '/installation/direct-to-deck',
  },
]

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function ResourcesInstallationPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Wrench className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 5
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Installation
                </h1>
                <p className="text-xl font-semibold text-white uppercase tracking-wide mb-3">
                  Installation Videos and PDF&apos;s
                </p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Videos and pdf&apos;s explaining the Crazy Seal installation
                  process.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517369"
                  thumbnail={`${MEDIA}/2024/04/Module-5-Thumbnail.jpg`}
                  title="Module 5: Installation"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 5: Installation
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION VIDEOS AND PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Installation Videos and PDF's"
            subheading="Click the images for videos and pdf's explaining the Crazy Seal installation process."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {INSTALL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={link.image}
                  alt={link.alt}
                  className="w-full h-auto object-cover"
                />
                <p className="p-4 text-center text-sm font-semibold text-primary inline-flex items-center justify-center gap-1 w-full group-hover:text-accent transition-colors">
                  Click Here To See Installation Videos &amp; PDF&apos;s
                  <ArrowRight className="w-4 h-4" />
                </p>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            Continue to Next Module
          </h2>
          <LinkButton href="/resources/warranty" variant="accent" size="lg">
            Warranty
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </Container>

      {/* ─── MODULE QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Business Accelerator Program"
            heading="Module Quick Links"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {MODULE_LINKS.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {mod.number}
                </span>
                <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {mod.label}
                </span>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-6">
            <LinkButton href="/business-accelerator-program" variant="primary" size="md">
              Business Accelerator Home
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Content | Feature Request"
            heading="Request Content or a Feature"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage="resources-installation" />
          </div>
        </div>
      </Container>
    </>
  )
}
