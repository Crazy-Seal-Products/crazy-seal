import type { Metadata } from 'next'
import { Download, ExternalLink, ArrowRight, Phone } from 'lucide-react'
import { Container, SectionHeading, LinkButton, YouTubeEmbed } from '@/lib/design-system'
import { ContactForm } from '@/components/forms/ContactForm'
import { CtaSection } from '@/components/CtaSection'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { MEDIA, ProTestimonials, ProTrailerLife } from '@/components/pro/ProSections'

export const metadata: Metadata = {
  title: 'Professional Tools',
  description:
    'Our tools - your profit! Downloadable videos, PDFs, brochures, and sales resources to help you grow your Crazy Seal Installation Business and close more deals.',
}

const OVERVIEW_VIDEOS = [
  {
    videoId: 'C5FvTulPDaY',
    thumbnail: `${MEDIA}/2024/01/21-Reason-Thumbnail-2.jpg`,
    caption: 'Click to Watch Full Overview Video (10:24)',
    directHref: 'https://youtu.be/ji0GvXRUams',
    directLabel: '21 Reasons Direct Youtube Link',
  },
  {
    videoId: 'VoPjXn8YCk4',
    thumbnail: `${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`,
    caption: 'Click to Watch Our Crazy Tests (5:24)',
    directHref: 'https://youtu.be/VoPjXn8YCk4',
    directLabel: "Let's Get Crazy Direct Youtube Link",
  },
]

const APPLICATION_VIDEOS = [
  {
    heading: "RV's",
    videoId: 'OsJCUv3s2Is',
    caption: 'Click to Watch Video (5:15)',
    directHref: 'https://www.youtube.com/watch?v=OsJCUv3s2Is',
    directLabel: 'RV Direct Youtube Link',
  },
  {
    heading: 'Commercial',
    videoId: 'hwxZkjNLzXg',
    caption: 'Click to Watch Facilities Video (5:52)',
    directHref: 'https://www.youtube.com/watch?v=hwxZkjNLzXg',
    directLabel: 'Commercial Direct Youtube Link',
  },
]

const DOWNLOADS = [
  {
    heading: 'How Much Could You Save?',
    desc: 'Check out this PDF to see how you can save an RV load of cash by having the Crazy Seal System professionally installed.',
    image: `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`,
    href: `${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`,
    linkText: 'See Savings PDF',
  },
  {
    heading: 'Crazy Seal System',
    desc: 'Download a brochure explaining our Crazy Seal system.',
    image: `${MEDIA}/2019/06/Crazy-Seal-Brochure-for-Download-2-1024x791.jpg`,
    href: `${MEDIA}/2019/07/Crazy-Seal-Brochure-for-Download.pdf`,
    linkText: 'Download PDF',
  },
  {
    heading: 'Warranty PDF',
    desc: 'View or download our 50 year warranty PDF.',
    image: `${MEDIA}/2021/04/Warranty-Certificate-2021-1-1024x791.jpg`,
    href: `${MEDIA}/2019/06/Crazy-Seal-Warranty-Certificate-Download.pdf`,
    linkText: 'Warranty PDF',
  },
]

const INSTALL_LINKS = [
  {
    image: `${MEDIA}/2020/02/D2D-For-Installation-Page.jpg`,
    alt: 'Direct to Deck installation videos and PDFs',
    href: '/installation/direct-to-deck',
  },
  {
    image: `${MEDIA}/2020/02/Over-Membrane-For-Installation-Page.jpg`,
    alt: 'Membrane roof installation videos and PDFs',
    href: '/installation/membrane-roof',
  },
]

export default function ProfessionalToolsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Professional <span className="text-highlight">Tools</span>
            </h1>
            <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-6">
              Our tools &mdash; your profit! At Crazy Seal, we are constantly
              creating resources to help you succeed. Use these tools to help
              you close more deals. Feel free to reach out to us if you have an
              idea for another tool we can make that would help you succeed!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LinkButton
                href={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800.png`}
                variant="accent"
                size="lg"
                external
              >
                <Download className="w-5 h-5" />
                Download Our Logo
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
        </div>
      </Container>

      {/* ─── FULL OVERVIEW VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Full Overview Videos"
            subheading={
              'Click the images to watch our "21\u00BD Reasons Why" and "Let\u2019s Get Crazy" videos to learn more about the Crazy Seal system.'
            }
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {OVERVIEW_VIDEOS.map((v) => (
              <div key={v.videoId}>
                <YouTubeEmbed videoId={v.videoId} variant="card" />
                <p className="text-center text-sm font-semibold text-gray-600 mt-3 mb-2">
                  {v.caption}
                </p>
                <p className="text-center">
                  <a
                    href={v.directHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors"
                  >
                    {v.directLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton
              href={`${MEDIA}/2020/02/21-Reasons.pdf`}
              variant="primary"
              size="md"
              external
            >
              <Download className="w-4 h-4" />
              Click to Download Our 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATION VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Application Videos"
            subheading="Sales videos for each application type. Just press play!"
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {APPLICATION_VIDEOS.map((v) => (
              <div key={v.videoId}>
                <h3 className="text-lg font-bold text-white text-center uppercase tracking-wide mb-3">
                  {v.heading}
                </h3>
                <YouTubeEmbed videoId={v.videoId} variant="card" />
                <p className="text-center text-sm font-semibold text-white/70 mt-3 mb-2">
                  {v.caption}
                </p>
                <p className="text-center">
                  <a
                    href={v.directHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-highlight hover:text-white transition-colors"
                  >
                    {v.directLabel} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </p>
              </div>
            ))}
            <div>
              <h3 className="text-lg font-bold text-white text-center uppercase tracking-wide mb-3">
                Tractor Trailers
              </h3>
              <ProVimeoEmbed
                videoId="717595036"
                thumbnail="https://i.vimeocdn.com/video/1445939956-3a69ea8d25a2a5b445f99e98907391c10b1e5163a5f774010657c974fee12df2-d_840"
                title="Crazy Seal transportation and tractor trailer video"
              />
              <p className="text-center text-sm font-semibold text-white/70 mt-3 mb-2">
                Click to Watch Video (4:02)
              </p>
              <p className="text-center">
                <a
                  href="https://www.youtube.com/watch?v=ur7puZ1Gay4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-highlight hover:text-white transition-colors"
                >
                  Transportation Direct Youtube Link{' '}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION VIDEOS AND PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Installation Videos and PDF's"
            subheading="Click the images for even more videos and pdf's explaining the Crazy Seal installation process."
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

      {/* ─── DOWNLOADS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Downloadable Resources"
            heading="PDF Downloads"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {DOWNLOADS.map((d) => (
              <div
                key={d.heading}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={d.heading}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-5 text-center flex flex-col flex-1">
                  <h3 className="font-bold text-primary mb-2">{d.heading}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{d.desc}</p>
                  <div className="mt-auto">
                    <LinkButton href={d.href} variant="outline" size="sm" external className="border-primary text-primary">
                      <Download className="w-4 h-4" />
                      {d.linkText}
                    </LinkButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TRAILER LIFE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProTrailerLife />
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProTestimonials />
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Let's Get in Touch"
            heading="Have Any Questions? Our Crazy Seal Specialists Can Help!"
            subheading="Fill out the form below and one of our Crazy Seal specialists will be in touch with you shortly. We promise to be fun, informative, and will do our very best to help you!"
          />
          <div className="max-w-2xl mx-auto">
            <ContactForm sourcePage="professional-tools" />
          </div>
        </div>
      </Container>

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
