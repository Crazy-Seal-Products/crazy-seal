import type { Metadata } from 'next'
import {
  ArrowRight,
  Bot,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  Megaphone,
  PlayCircle,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Marketing',
  description:
    'Module 2 of the Crazy Seal Business Accelerator Program. Pre-built video, image, and email advertising packages ready for your immediate use, plus logo files and brand kit.',
}

const PACKAGES = [
  {
    icon: PlayCircle,
    heading: 'Video Packages',
    href: '/marketing/videos',
    linkText: 'See Video Packages',
  },
  {
    icon: ImageIcon,
    heading: 'Image Packages',
    href: '/marketing/images',
    linkText: 'See Image Packages',
  },
  {
    icon: Mail,
    heading: 'Email Packages',
    href: '/marketing/email-templates',
    linkText: 'See Email Packages',
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

export default function ResourcesMarketingPage() {
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
                  <Megaphone className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 2
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Marketing
                </h1>
                <p className="text-xl font-semibold text-white mb-3">
                  Pre-built Advertising Packages ready for your immediate use!
                </p>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  We have pre-built a bunch of video and image Advertising
                  Packages ready for your immediate use! Just click the links
                  below to get started.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517463"
                  thumbnail={`${MEDIA}/2024/04/Module-2-Thumbnail.jpg`}
                  title="Module 2: Marketing"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 2: Marketing
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── ADVERTISING PACKAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Pre-Built Campaigns"
            heading="Advertising Packages"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PACKAGES.map((pkg) => (
              <a
                key={pkg.heading}
                href={pkg.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <pkg.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-lg font-bold text-primary uppercase tracking-wide mb-3">
                  {pkg.heading}
                </h2>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  {pkg.linkText}
                  <ArrowRight className="w-4 h-4" />
                </span>
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
              <LinkButton href="/marketing/ai-prompts" variant="primary" size="md">
                See AI Prompts for Marketing
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

      {/* ─── RESOURCES: LOGO FILES + BRAND KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Resources" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center flex flex-col">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-4">
                Logo Files
              </h3>
              <div className="flex-1 flex items-center justify-center mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800.png`}
                  alt="Crazy Seal logo"
                  className="max-h-48 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col items-center gap-3">
                <LinkButton
                  href={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800.png`}
                  variant="primary"
                  size="md"
                  external
                >
                  <Download className="w-4 h-4" />
                  Download Our Logo (PNG)
                </LinkButton>
                <a
                  href="https://drive.google.com/drive/folders/1HrdC6Bg4LMuej0X_qQBmi2bV6mn-hAiK?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors"
                >
                  Google Drive File (High Res and Vector Files)
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center flex flex-col">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wide mb-4">
                Brand Kit
              </h3>
              <div className="flex-1 flex items-center justify-center mb-5">
                <a
                  href={`${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-\u00D7-11-in.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-\u00D7-11-in-791x1024.jpg`}
                    alt="Crazy Seal Brand Kit (8.5 x 11 in)"
                    className="max-h-72 w-auto object-contain rounded-lg border border-gray-100"
                  />
                </a>
              </div>
              <div>
                <LinkButton
                  href={`${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-\u00D7-11-in.jpg`}
                  variant="primary"
                  size="md"
                  external
                >
                  <Download className="w-4 h-4" />
                  Download Brand Kit
                </LinkButton>
              </div>
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
          <LinkButton href="/resources/sales" variant="accent" size="lg">
            Sales
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
            <ContentRequestForm sourcePage="resources-marketing" />
          </div>
        </div>
      </Container>
    </>
  )
}
