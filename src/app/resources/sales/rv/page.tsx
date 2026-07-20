import type { Metadata } from 'next'
import {
  ArrowRight,
  Caravan,
  Code,
  Download,
  FileText,
  PlayCircle,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const TRAILER_LIFE_PDF = `${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/418309408/rendition/1080p/crazy_seal_rv_roof%20%281080p%29.mp4?loc=external&signature=5146d903c46fb7f62f73ec037ceb37b8ed85f907f9596e7387cb0cc6fd4304b8'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/418309408?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal RV Roof"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'RV Sales Assets',
  description:
    'RV sales assets for Crazy Seal Professional Partners: digital presentation page, savings PDF, Crazy Seal brochure, Trailer Life magazine feature, loopable videos, and video presentation download with embed code.',
}

export default function RvSalesAssetsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Caravan className="w-4 h-4 text-highlight" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                Sales Assets
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              RV Sales Assets
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
            <LinkButton href="/rv-roofing" variant="accent" size="lg">
              Visit Digital Presentation Page
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── HOW MUCH COULD YOU SAVE? ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="How Much Could You Save?"
            subheading="Check out this PDF to show customers how they can save an RV load of cash by having the Crazy Seal System professionally installed."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            {[
              `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`,
              `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final2-791x1024-1.jpg`,
            ].map((image) => (
              <a
                key={image}
                href={`${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Crazy Seal dealer savings sheet"
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <LinkButton
              href={`${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`}
              variant="primary"
              size="md"
              external
            >
              <FileText className="w-4 h-4" />
              See Savings PDF
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
              `${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-4-15-24.jpg`,
              `${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-4-15-242.jpg`,
            ].map((image) => (
              <a
                key={image}
                href={`${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-Final.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Crazy Seal RV brochure"
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <LinkButton
              href={`${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-Final.pdf`}
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

      {/* ─── TRAILER LIFE MAGAZINE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Featured in Trailer Life Magazine"
            subheading="Download our featured article from Trailer Life Magazine explaining our revolutionary Crazy Seal roofing system. This is nice edification for the system."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
            {[
              `${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-768x1024.jpg`,
              `${MEDIA}/2020/04/Trailer-Life-May-2020-Page-1-Small.jpg`,
            ].map((image) => (
              <a
                key={image}
                href={TRAILER_LIFE_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Trailer Life Magazine feature"
                  className="w-full h-auto object-cover"
                />
              </a>
            ))}
          </div>
          <div className="flex justify-center">
            <LinkButton href={TRAILER_LIFE_PDF} variant="primary" size="md" external>
              <FileText className="w-4 h-4" />
              See Feature PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── LOOPABLE VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Loopable Videos"
            subheading="Visit this link for looping videos you can play at trade shows or on a monitor in your office."
          />
          <div className="flex justify-center">
            <LinkButton href="/resources/sales/loopable-videos/" variant="primary" size="md">
              <PlayCircle className="w-4 h-4" />
              See Loopable Videos
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── VIDEO PRESENTATION DOWNLOAD ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading="Video Presentation Download" variant="dark" />
          <div className="max-w-3xl mx-auto">
            <ProVimeoEmbed
              videoId="418309408"
              thumbnail={`${MEDIA}/2021/11/Pro-Installation-Video-Cover-1024x576.jpg`}
              title="Crazy Seal RV roof video presentation"
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
            subheading="Copy this HTML snippet to embed the RV presentation video on your own website."
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
              src={`${MEDIA}/2021/11/Pro-Installation-Video-Cover-1024x576.jpg`}
              alt="Crazy Seal RV video thumbnail"
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

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        sourcePage="resources-sales-rv"
        back={{
          heading: 'Back to Main Sales Page',
          label: 'Sales',
          href: '/resources/sales',
        }}
        next={{
          heading: 'Continue On to Build a Kit',
          label: 'Build a Kit',
          href: '/resources/building-a-kit',
        }}
      />
    </>
  )
}
