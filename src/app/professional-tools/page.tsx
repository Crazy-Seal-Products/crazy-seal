import type { Metadata } from 'next'
import { Download, ExternalLink, ArrowUpRight, Phone, Wrench, FileText, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { GlowOrb } from '@/components/motion'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { ProContactSection } from '@/components/pro/ProContactSection'
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
    desc: 'Show customers how they can save an RV load of cash with a professional install.',
    image: `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`,
    href: `${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`,
    linkText: 'See Savings PDF',
  },
  {
    heading: 'Crazy Seal System',
    desc: 'A brochure explaining our Crazy Seal system.',
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
    title: 'Direct to Deck',
    image: `${MEDIA}/2020/02/D2D-For-Installation-Page.jpg`,
    alt: 'Direct to Deck installation videos and PDFs',
    href: '/installation/direct-to-deck',
  },
  {
    title: 'Membrane Roofs',
    image: `${MEDIA}/2020/02/Over-Membrane-For-Installation-Page.jpg`,
    alt: 'Membrane roof installation videos and PDFs',
    href: '/installation/membrane-roof',
  },
]

function DirectLink({ href, label, dark = false }: { href: string; label: string; dark?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        dark
          ? 'inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-highlight ring-1 ring-white/15 transition-colors hover:bg-white/20 hover:text-white'
          : 'inline-flex items-center gap-1.5 rounded-full bg-primary/[0.06] px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white'
      }
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  )
}

export default function ProfessionalToolsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-12 lg:py-20 text-center">
            <h1
              className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.05] mb-4"
              style={{ animationDelay: '80ms' }}
            >
              Professional <span className="text-shimmer-highlight">Tools</span>
            </h1>
            <p
              className="animate-fade-up text-lg text-white/70 max-w-2xl mx-auto leading-relaxed mb-8 text-pretty"
              style={{ animationDelay: '160ms' }}
            >
              We&apos;re constantly creating resources to help you close more deals. Have an idea for
              another tool that would help you succeed? Reach out and let us know!
            </p>
            <div
              className="animate-fade-up flex flex-wrap items-center justify-center gap-4"
              style={{ animationDelay: '240ms' }}
            >
              <LinkButton href={`${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800.png`} variant="accent" size="lg" external>
                <Download className="w-5 h-5" />
                Download Our Logo
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-white/80 hover:text-white font-semibold transition-colors"
              >
                <Phone className="w-5 h-5 text-accent-light" />
                (800) 963-0131
              </a>
            </div>
            <ul
              className="animate-fade-up flex flex-wrap justify-center gap-x-6 gap-y-2 mt-9"
              style={{ animationDelay: '320ms' }}
            >
              {[
                { icon: PlayCircle, label: 'Sales videos' },
                { icon: FileText, label: 'PDF downloads' },
                { icon: Wrench, label: 'Install guides' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── FULL OVERVIEW VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Watch & Share"
            heading="Full Overview Videos"
            subheading={'Our “21½ Reasons Why” and “Let’s Get Crazy” videos explain the Crazy Seal system.'}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {OVERVIEW_VIDEOS.map((v) => (
              <div key={v.videoId} className="flex flex-col items-center">
                <div className="w-full">
                  <ProYouTubeEmbed videoId={v.videoId} thumbnail={v.thumbnail} title={v.caption} />
                </div>
                <p className="text-center text-sm font-semibold text-gray-600 mt-4 mb-2">{v.caption}</p>
                <DirectLink href={v.directHref} label={v.directLabel} />
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href={`${MEDIA}/2020/02/21-Reasons.pdf`} variant="primary" size="md" external>
              <Download className="w-4 h-4" />
              Click to Download Our 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATION VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Just Press Play"
            heading="Application Videos"
            subheading="Sales videos for each application type."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {APPLICATION_VIDEOS.map((v) => (
              <div key={v.videoId} className="flex flex-col items-center">
                <h3 className="mb-3 text-xl font-extrabold tracking-tight text-white">
                  {v.heading}
                </h3>
                <div className="w-full">
                  <ProYouTubeEmbed videoId={v.videoId} title={`${v.heading} sales video`} />
                </div>
                <p className="text-center text-sm font-semibold text-white/70 mt-4 mb-2">{v.caption}</p>
                <DirectLink href={v.directHref} label={v.directLabel} dark />
              </div>
            ))}
            <div className="flex flex-col items-center">
              <h3 className="mb-3 text-xl font-extrabold tracking-tight text-white">
                Tractor Trailers
              </h3>
              <div className="w-full">
                <ProVimeoEmbed
                  videoId="717595036"
                  thumbnail="https://i.vimeocdn.com/video/1445939956-3a69ea8d25a2a5b445f99e98907391c10b1e5163a5f774010657c974fee12df2-d_840"
                  title="Crazy Seal transportation and tractor trailer video"
                />
              </div>
              <p className="text-center text-sm font-semibold text-white/70 mt-4 mb-2">Click to Watch Video (4:02)</p>
              <DirectLink
                href="https://www.youtube.com/watch?v=ur7puZ1Gay4"
                label="Transportation Direct Youtube Link"
                dark
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── INSTALLATION VIDEOS AND PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Step-by-Step"
            heading="Installation Videos and PDF's"
            subheading="Even more videos and PDFs explaining the Crazy Seal installation process."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
            {INSTALL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={link.image}
                    alt={link.alt}
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="text-lg font-extrabold text-primary">{link.title}</h3>
                    <p className="text-sm font-semibold text-accent-dark">See Installation Videos &amp; PDF&apos;s</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── DOWNLOADS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Downloadable Resources" heading="PDF Downloads" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {DOWNLOADS.map((d) => (
              <a
                key={d.heading}
                href={d.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-secondary/10 p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={d.heading}
                    className="max-h-full w-auto rounded-lg object-contain shadow-lg ring-1 ring-primary/10 transition-transform duration-700 ease-out group-hover:scale-[1.06] group-hover:-rotate-1"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                    <FileText className="h-3 w-3" />
                    PDF
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="text-lg font-extrabold text-primary mb-1">{d.heading}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">{d.desc}</p>
                  <span className="mt-auto flex items-center justify-between gap-3 border-t border-primary/[0.07] pt-4 text-sm font-bold text-primary">
                    {d.linkText}
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/[0.06] transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                      <Download className="h-4 w-4" />
                    </span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TRAILER LIFE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div data-reveal>
          <ProTrailerLife />
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProTestimonials />
        </div>
      </Container>

      {/* ─── CONTACT FORM ─── */}
      <ProContactSection id="pro-contact" sourcePage="professional-tools" />

      {/* ─── CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <CtaSection />
      </Container>
    </>
  )
}
