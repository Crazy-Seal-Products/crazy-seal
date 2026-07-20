import type { Metadata } from 'next'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton, Badge } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'

export const metadata: Metadata = {
  title: 'Video Packages',
  description:
    'Pre-built Crazy Seal video advertising packages ready for your immediate use. Fifteen-second video ads with generic and RV-specific assets for your Crazy Seal business.',
}

const VIDEO_PACKAGES = [
  {
    heading: 'Video Package 1',
    tags: ['15 Seconds', 'Generic Assets', 'RV Assets'],
    href: '/marketing/videos/video-package-1/',
  },
  {
    heading: 'Video Package 2',
    tags: ['15 Seconds', 'Generic Assets', 'RV Assets'],
    href: '/marketing/videos/video-package-2/',
  },
  {
    heading: 'Video Package 3',
    tags: ['15 Seconds', 'Generic Assets', 'RV Assets'],
    href: '/marketing/videos/video-package-3/',
  },
  {
    heading: 'Video Package 4',
    tags: ['15 Seconds', 'Generic Assets', 'RV Assets'],
    href: '/marketing/videos/video-package-4/',
  },
  {
    heading: 'Video Package 5',
    tags: ['15 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-5/',
  },
  {
    heading: 'Video Package 6',
    tags: ['15 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-6/',
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

export default function MarketingVideosPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PlayCircle className="w-4 h-4 text-highlight" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                Marketing Assets
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Video <span className="text-highlight">Packages</span>
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── VIDEO PACKAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {VIDEO_PACKAGES.map((pkg) => (
              <a
                key={pkg.heading}
                href={pkg.href}
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col items-center"
              >
                <PlayCircle className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-lg font-bold text-primary mb-3">
                  {pkg.heading}
                </h2>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {pkg.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
                  View Marketing Asset
                  <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── BACK / CONTINUE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Back to Main Marketing Page
              </h2>
              <LinkButton href="/resources/marketing" variant="white" size="md">
                Marketing
              </LinkButton>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Continue On to Sales
              </h2>
              <LinkButton href="/resources/sales" variant="accent" size="md">
                Sales
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
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
            <ContentRequestForm sourcePage="marketing-videos" />
          </div>
        </div>
      </Container>
    </>
  )
}
