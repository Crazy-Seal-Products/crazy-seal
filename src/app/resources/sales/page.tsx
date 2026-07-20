import type { Metadata } from 'next'
import { ArrowRight, Bot, Presentation } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Sales',
  description:
    'Module 3 of the Crazy Seal Business Accelerator Program. Digital and physical assets for your arsenal to close deals, including digital presentation pages, PDFs, and more.',
}

const ASSET_SECTIONS = [
  {
    heading: 'RV Assets',
    image: `${MEDIA}/2022/01/Sections_RVs.png`,
    alt: 'RV sales assets',
    href: '/resources/sales/rv/',
    linkText: 'See RV Assets',
  },
  {
    heading: 'Facilities Assets',
    image: `${MEDIA}/2022/01/Sections_Commercial.png`,
    alt: 'Facilities sales assets',
    href: '/resources/sales/facilities/',
    linkText: 'See Facilities Assets',
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

export default function ResourcesSalesPage() {
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
                  <Presentation className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 3
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Sales
                </h1>
                <p className="text-xl font-semibold text-white uppercase tracking-wide mb-3">
                  Digital and Physical Assets
                </p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Check out these digital and physical assets for arsenal to
                  close deals. These include digital presentation pages,
                  pdf&apos;s and more.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517448"
                  thumbnail={`${MEDIA}/2024/04/Module-3-Thumbnail.jpg`}
                  title="Module 3: Sales"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 3: Sales
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ASSET SECTIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Assets to Close Deals"
            heading="Sales Assets by Application"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {ASSET_SECTIONS.map((section) => (
              <a
                key={section.heading}
                href={section.href}
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={section.image}
                  alt={section.alt}
                  className="w-full h-auto object-cover"
                />
                <div className="p-5 text-center">
                  <h2 className="text-lg font-bold text-primary uppercase tracking-wide mb-2">
                    {section.heading}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                    {section.linkText}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── AI PROMPTS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-accent" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  AI Prompts
                </p>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">
                AI Prompts for your Crazy Seal Business
              </h2>
              <p className="text-gray-600 leading-relaxed mb-5">
                Use these prompts with any Artificial Intelligence platform to
                teach it what you are doing as a professional with Crazy Seal
                and create custom assets!
              </p>
              <LinkButton href="/resources/sales/ai-prompts/" variant="primary" size="md">
                See AI Prompts for Sales
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2024/04/1690998192chatgpt-logo-png.png`}
                alt="ChatGPT logo"
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            Continue to Next Module
          </h2>
          <LinkButton href="/resources/building-a-kit" variant="accent" size="lg">
            Building a Kit
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
            <ContentRequestForm sourcePage="resources-sales" />
          </div>
        </div>
      </Container>
    </>
  )
}
