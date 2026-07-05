'use client'

import { useState } from 'react'
import {
  ArrowRight,
  Download,
  ExternalLink,
  Phone,
  Play,
} from 'lucide-react'
import {
  Container,
  SectionHeading,
  LinkButton,
} from '@/lib/design-system'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/935230279/rendition/1080p/crazy_seal_professional_facilities_installation%20%281080p%29.mp4?loc=external&signature=8c4382109b36c631eb8128318c5a492e85e2c3e2499e8b23e7f5431957e282c7'

export default function FacilitiesPage() {
  const [videoPlaying, setVideoPlaying] = useState(false)

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-18 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Resources for Facility Owners & Operators
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
              Facilities
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
              Everything you need to present the benefits of having the Crazy
              Seal System professionally installed — a digital presentation
              page, brochure, magazine feature, and full video explainer.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2024/04/Facilities-Presentation-Page-1024x683.jpg`}
                alt="Crazy Seal digital presentation page preview"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="Share With Decision Makers"
                heading="Digital Presentation Page"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-6">
                Check out this digital presentation page with no external links
                showing the benefits of having the Crazy Seal System
                professionally installed. If you have your own site, you can
                download the video or embed code below.
              </p>
              <LinkButton
                href="https://crazyseal.com/facilities-overview/"
                variant="primary"
                size="lg"
                external
              >
                <ExternalLink className="w-5 h-5" />
                Visit Digital Presentation Page
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── RFMA FEATURE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_3fr] gap-6 md:gap-4 lg:gap-6 items-center">
            <div className="order-2 md:order-1 relative flex items-center justify-center md:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`}
                alt="RFMA Facilitator Magazine cover"
                className="rounded-2xl shadow-xl h-auto md:max-h-[400px] object-contain"
              />
            </div>
            <div className="order-1 md:order-2 text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Featured in RFMA Facilitator Magazine
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
                Read the Article
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4 md:mb-8">
                Download an article on roofing from Crazy Seal&apos;s President
                in Restaurant Facility Managers Association magazine.
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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div className="order-2 md:order-1">
              <SectionHeading
                eyebrow="Quick Overview"
                heading="Crazy Seal Brochure"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 leading-relaxed mb-6">
                Check out this PDF for a brief overview of the Crazy Seal
                System professionally installed.
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
            <div className="order-1 md:order-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-1024x791.jpg`}
                alt="Crazy Seal facilities brochure preview"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── FULL VIDEO EXPLAINER ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Watch or Share"
            heading="Full Video Explainer"
            subheading="Watch the Crazy Seal professional facilities installation video, or download the file to use on your own site."
            variant="dark"
          />
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
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
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 text-primary ml-1" />
                    </div>
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
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
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
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-10 sm:px-6 md:p-10 lg:p-14 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Have a Question or a Request?
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight mb-4">
            Our Team Is Here to Support Your Business
          </h2>
          <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Have a request for something that would support you in your
            business? Get in touch and it will go directly to our team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/contact" variant="accent" size="lg">
              Contact Us
            </LinkButton>
            <a
              href="tel:8009630131"
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-semibold transition-colors"
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
