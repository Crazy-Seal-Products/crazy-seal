import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowUpRight,
  Download,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  PlayCircle,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import {
  AiPromptsBand,
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

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
    desc: '15 and 30 second video ads.',
    href: '/marketing/videos',
    linkText: 'See Video Packages',
  },
  {
    icon: ImageIcon,
    heading: 'Image Packages',
    desc: 'RV, commercial and residential photos.',
    href: '/marketing/images',
    linkText: 'See Image Packages',
  },
  {
    icon: Mail,
    heading: 'Email Packages',
    desc: 'Announcement, benefits and call-to-action emails.',
    href: '/marketing/email-templates',
    linkText: 'See Email Packages',
  },
]

const BRAND_KIT_FULL = `${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-×-11-in.jpg`
const LOGO_PNG = `${MEDIA}/2019/03/CRAZY-SEAL-LOGO-1000x800.png`

export default function ResourcesMarketingPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={2}
        title={
          <>
            <span className="text-shimmer-highlight">Marketing</span>
          </>
        }
        tagline="Pre-built Advertising Packages ready for your immediate use!"
        intro="Video, image and email packages are ready to go. Just pick a package below to get started."
        media={
          <ProVimeoEmbed
            videoId="937517463"
            thumbnail={`${MEDIA}/2024/04/Module-2-Thumbnail.jpg`}
            title="Module 2: Marketing"
          />
        }
        mediaCaption="Module 2: Marketing"
      />

      <ModuleNav current={2} />

      {/* ─── ADVERTISING PACKAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Pre-Built Campaigns" heading="Advertising Packages" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
            {PACKAGES.map((pkg) => (
              <Link
                key={pkg.heading}
                href={pkg.href}
                className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl md:p-8"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0"
                />
                <span className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <pkg.icon className="h-6 w-6" />
                </span>
                <h2 className="relative mb-1 text-xl font-extrabold text-primary">{pkg.heading}</h2>
                <p className="relative mb-6 text-sm text-gray-500">{pkg.desc}</p>
                <span className="relative mt-auto flex items-center justify-between gap-3 border-t border-primary/[0.07] pt-4 text-sm font-bold text-primary">
                  {pkg.linkText}
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/[0.06] transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── AI PROMPTS ─── */}
      <AiPromptsBand href="/marketing/ai-prompts" label="See AI Prompts for Marketing" />

      {/* ─── RESOURCES: LOGO FILES + BRAND KIT ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Brand Assets" heading="Resources" />
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            <div className="group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
              <div className="relative grid h-64 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-accent/10 p-6">
                <div aria-hidden="true" className="absolute inset-x-12 bottom-6 h-6 rounded-full bg-primary/10 blur-xl" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={LOGO_PNG}
                  alt="Crazy Seal logo"
                  className="relative max-h-44 w-auto object-contain transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
                <h3 className="text-lg font-extrabold text-primary">Logo Files</h3>
                <LinkButton href={LOGO_PNG} variant="primary" size="md" external>
                  <Download className="h-4 w-4" />
                  Download Our Logo (PNG)
                </LinkButton>
                <a
                  href="https://drive.google.com/drive/folders/1HrdC6Bg4LMuej0X_qQBmi2bV6mn-hAiK?usp=drive_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-accent"
                >
                  Google Drive File (High Res and Vector Files)
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl">
              <a
                href={BRAND_KIT_FULL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative grid h-64 place-items-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-secondary/10 p-6"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${MEDIA}/2024/04/Crazy-Seal-Brand-Kit-8.5-×-11-in-791x1024.jpg`}
                  alt="Crazy Seal Brand Kit (8.5 x 11 in)"
                  className="max-h-52 w-auto rotate-2 rounded-lg object-contain shadow-xl ring-1 ring-primary/10 transition-transform duration-700 ease-out group-hover:rotate-0 group-hover:scale-[1.06]"
                />
              </a>
              <div className="flex flex-1 flex-col items-center gap-3 p-6 text-center">
                <h3 className="text-lg font-extrabold text-primary">Brand Kit</h3>
                <LinkButton href={BRAND_KIT_FULL} variant="primary" size="md" external>
                  <Download className="h-4 w-4" />
                  Download Brand Kit
                </LinkButton>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── CONTINUE TO NEXT MODULE + QUICK LINKS ─── */}
      <ModuleNext current={2} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-marketing" />
    </>
  )
}
