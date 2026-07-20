import type { Metadata } from 'next'
import {
  ArrowRight,
  Building2,
  Code,
  Download,
  FileText,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const RFMA_PDF = `${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/935230279/rendition/1080p/crazy_seal_professional_facilities_installation%20%281080p%29.mp4?loc=external&signature=8c4382109b36c631eb8128318c5a492e85e2c3e2499e8b23e7f5431957e282c7'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/935230279?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal Professional Facilities Installation"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'Facilities Sales Assets',
  description:
    'Facilities sales assets for Crazy Seal Professional Partners: digital presentation page, RFMA Facilitator magazine feature, Crazy Seal brochure, full video explainer with download and embed code.',
}

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function FacilitiesSalesAssetsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-highlight" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                Sales Assets
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Facilities
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── DIGITAL PRESENTATION PAGE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Digital Presentation Page"
            subheading="Check out this digital presentation page with no external links showing the benefits of having the Crazy Seal System professionally installed. If you have your own site, you can download the video or embed code below."
          />
          <div className="flex justify-center">
            <LinkButton href="/facilities-overview" variant="accent" size="lg">
              Visit Digital Presentation Page
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FACILITATOR MAGAZINE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Featured in RFMA Facilitator Magazine"
            subheading="Download an article on roofing from Crazy Seal's President in Restaurant Facility Managers Association magazine."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            {[
              `${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`,
              `${MEDIA}/2022/01/RFMA-Facilitator-2.jpg`,
            ].map((image) => (
              <a
                key={image}
                href={RFMA_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="RFMA Facilitator magazine feature"
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <LinkButton href={RFMA_PDF} variant="primary" size="md" external>
              <FileText className="w-4 h-4" />
              See PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CRAZY SEAL BROCHURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Crazy Seal Brochure"
            subheading="Check out this PDF for a brief overview of the Crazy Seal System professionally installed."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            {[
              `${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-4-15-24-scaled.jpg`,
              `${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-scaled.jpg`,
            ].map((image) => (
              <a
                key={image}
                href={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Crazy Seal facilities brochure"
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <LinkButton
              href={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download.pdf`}
              variant="primary"
              size="md"
              external
            >
              <FileText className="w-4 h-4" />
              See Brochure PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── FULL VIDEO EXPLAINER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Full Video Explainer" variant="dark" />
          <div className="max-w-3xl mx-auto">
            <ProVimeoEmbed
              videoId="935230279"
              thumbnail={`${MEDIA}/2024/03/IFMA-Cover-1024x576.jpg`}
              title="Crazy Seal Professional Facilities Installation"
            />
            <div className="flex justify-center pt-6">
              <LinkButton href={VIDEO_DOWNLOAD_URL} variant="white" size="md" external>
                <Download className="w-4 h-4" />
                Click to Download Video File (1080P)
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EMBED CODE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Embed Code to Place On Website"
            subheading="Copy this HTML snippet to embed the facilities explainer video on your own website."
          />
          <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wide text-primary">
                Embed Code (HTML)
              </span>
            </div>
            <pre className="p-4 text-xs text-gray-700 whitespace-pre-wrap break-all leading-relaxed">
              {EMBED_CODE}
            </pre>
          </div>
        </div>
      </Container>

      {/* ─── VIDEO THUMBNAIL ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Video Thumbnail" />
          <div className="max-w-2xl mx-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${MEDIA}/2024/03/IFMA-Cover-1024x576.jpg`}
              alt="Crazy Seal facilities video thumbnail"
              className="w-full h-auto rounded-2xl border border-gray-200"
            />
            <div className="flex justify-center pt-6">
              <LinkButton
                href={`${MEDIA}/2020/07/Dealer-Video-Cover.jpg`}
                variant="primary"
                size="md"
                external
              >
                <Download className="w-4 h-4" />
                Click to Download Thumbnail File (1080P)
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BACK / CONTINUE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Back to Main Sales Page
              </h2>
              <LinkButton href="/resources/sales" variant="white" size="md">
                Sales
              </LinkButton>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Continue On to Build a Kit
              </h2>
              <LinkButton href="/resources/building-a-kit" variant="accent" size="md">
                Build a Kit
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
            <ContentRequestForm sourcePage="resources-sales-facilities" />
          </div>
        </div>
      </Container>
    </>
  )
}