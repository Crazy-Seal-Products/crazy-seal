'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Download,
  FileText,
  Film,
  Headset,
  Newspaper,
  Phone,
  Play,
  Presentation,
} from 'lucide-react'
import {
  Container,
  SectionHeading,
  LinkButton,
} from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/935230279/rendition/1080p/crazy_seal_professional_facilities_installation%20%281080p%29.mp4?loc=external&signature=8c4382109b36c631eb8128318c5a492e85e2c3e2499e8b23e7f5431957e282c7'

const RESOURCES = [
  { icon: Presentation, label: 'Digital presentation page' },
  { icon: FileText, label: 'Brochure' },
  { icon: Newspaper, label: 'Magazine feature' },
  { icon: Film, label: 'Full video explainer' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({ style: { animationDelay: `${delayMs}ms` } })

export default function FacilitiesPage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-0 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-18 text-center">
            <h1
              {...enter(80)}
              className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.08] mb-4"
            >
              <span className="text-shimmer-highlight">Facilities</span>
            </h1>
            <p
              {...enter(160)}
              className="animate-fade-up text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-6"
            >
              Everything you need to present the benefits of a professionally installed
              Crazy Seal System:
            </p>
            <ul
              {...enter(240)}
              className="animate-fade-up mb-8 flex flex-wrap justify-center gap-2"
            >
              {RESOURCES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-semibold text-white ring-1 ring-white/15"
                >
                  <Icon className="h-4 w-4 text-highlight" />
                  {label}
                </li>
              ))}
            </ul>
            <div {...enter(320)} className="animate-fade-up flex flex-wrap items-center justify-center gap-3">
              <LinkButton href="/commercial-roofing" variant="accent" size="lg">
                Explore Commercial Roofing
                <ArrowRight className="w-5 h-5" />
              </LinkButton>
              <LinkButton href="/contact" variant="white" size="lg">
                Start a Conversation
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── DIGITAL PRESENTATION ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="group relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-primary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2024/04/Facilities-Presentation-Page-1024x683.jpg`}
                  alt="Crazy Seal digital presentation page preview"
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
            </div>
            <div>
              <SectionHeading
                eyebrow="Share With Decision Makers"
                heading="Digital Presentation Page"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                A presentation page with no external links, showing the benefits of a
                professionally installed Crazy Seal System. Have your own site? Download
                the video or embed code below.
              </p>
              <LinkButton
                href="/facilities-overview"
                variant="primary"
                size="lg"
              >
                <ArrowRight className="w-5 h-5" />
                Visit Digital Presentation Page
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-10 lg:gap-14 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-secondary/20 via-transparent to-accent/25 blur-2xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine cover"
                className="relative rounded-2xl shadow-2xl ring-1 ring-primary/10 h-auto md:max-h-[400px] object-contain -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <SectionHeading
                eyebrow="Featured in RFMA Facilitator Magazine"
                heading="Read the Article"
                align="left"
                className="mb-4 text-center md:text-left"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6 md:mb-8">
                An article on roofing from Crazy Seal&apos;s President in Restaurant
                Facility Managers Association magazine.
              </p>
              <LinkButton
                href={`${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See PDF
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── BROCHURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="order-2 md:order-1">
              <SectionHeading
                eyebrow="Quick Overview"
                heading="Crazy Seal Brochure"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-6">
                A brief PDF overview of the professionally installed Crazy Seal System.
              </p>
              <LinkButton
                href={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download.pdf`}
                variant="primary"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                See Brochure PDF
              </LinkButton>
            </div>
            <div className="group relative order-1 md:order-2">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/15 via-transparent to-secondary/20 blur-xl"
              />
              <div className="relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-primary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-1024x791.jpg`}
                  alt="Crazy Seal facilities brochure preview"
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── FULL VIDEO EXPLAINER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-right-24 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.4)" />
          <div className="relative">
            <SectionHeading
              eyebrow="Watch or Share"
              heading="Full Video Explainer"
              subheading="Watch the professional facilities installation video, or download the file for your own site."
              variant="dark"
            />
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
                />
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15">
                  {!videoPlaying ? (
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="absolute inset-0 w-full h-full group cursor-pointer"
                      aria-label="Play the Crazy Seal facilities video"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${MEDIA}/2020/07/Dealer-Video-Cover.jpg`}
                        alt="Crazy Seal professional facilities installation video"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 via-black/20 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="relative grid place-items-center">
                          <span className="absolute h-20 w-20 rounded-full bg-white/40 animate-pulse-ring sm:h-24 sm:w-24" />
                          <span className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1 fill-primary/10" />
                          </span>
                        </span>
                      </div>
                    </button>
                  ) : (
                    <iframe
                      src="https://player.vimeo.com/video/935230279?autoplay=1"
                      title="Crazy Seal Professional Facilities Installation"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-8">
                <LinkButton href={VIDEO_DOWNLOAD_URL} variant="white" size="md" external>
                  <Download className="w-4 h-4" />
                  Download Video File (1080P)
                </LinkButton>
                <LinkButton
                  href={`${MEDIA}/2020/07/Dealer-Video-Cover.jpg`}
                  variant="outline-white"
                  size="md"
                  external
                >
                  <Download className="w-4 h-4" />
                  Download Thumbnail File
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent animate-float">
            <Headset className="h-7 w-7" />
          </span>
          <SectionHeading
            eyebrow="Have a Question or a Request?"
            heading="Our Team Is Here to Support Your Business"
            subheading="Have a request for something that would support your business? Get in touch and it goes directly to our team."
            className="mb-8"
          />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
            >
              <Phone className="w-5 h-5 text-accent" />
              (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
