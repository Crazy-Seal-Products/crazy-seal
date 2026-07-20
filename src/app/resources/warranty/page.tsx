import type { Metadata } from 'next'
import { ArrowRight, Download, FileCheck } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Warranty',
  description:
    'Module 6 of the Crazy Seal Business Accelerator Program. Learn how to file the 50 year product warranty form on behalf of your customers on completed projects.',
}

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function ResourcesWarrantyPage() {
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
                  <FileCheck className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 6
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Warranty
                </h1>
                <p className="text-xl font-semibold text-white mb-3">
                  We offer a 50 year Product Warranty on Completed Projects
                </p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed mb-6">
                  We stand behind our products with a 50 year product warranty.
                  Once you&apos;ve installed a kit, simply fill out our
                  warranty form with before and after pictures of the project.
                  Your customer will receive a confirmation pdf via email, and
                  so will you! Warranties are also transferrable on the same
                  page.
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href="/warranty" variant="accent" size="lg">
                    Submit Warranty Form
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                </div>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517390"
                  thumbnail={`${MEDIA}/2024/04/Module-6-Thumbnail.jpg`}
                  title="Module 6: Warranty"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 6: Warranty
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WARRANTY PDF ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading heading="View or Download Our Warranty PDF Below" />
          <LinkButton
            href={`${MEDIA}/2019/06/Crazy-Seal-Warranty-Certificate-Download.pdf`}
            variant="primary"
            size="lg"
            external
          >
            <Download className="w-5 h-5" />
            Warranty PDF
          </LinkButton>
        </div>
      </Container>

      {/* ─── LAST MODULE CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            This is the last module! Contact us if you&apos;re ready to get
            started!
          </h2>
          <LinkButton href="/contact" variant="accent" size="lg">
            Contact Us
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
            <ContentRequestForm sourcePage="resources-warranty" />
          </div>
        </div>
      </Container>
    </>
  )
}
