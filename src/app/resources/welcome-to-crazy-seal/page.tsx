import type { Metadata } from 'next'
import { ArrowRight, Download, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Welcome to Crazy Seal',
  description:
    'Module 1 of the Crazy Seal Business Accelerator Program. Watch these videos and resources to get up to speed with the benefits of the Crazy Seal Roofing System.',
}

const VIDEOS = [
  {
    heading: '21 1/2 Reasons Why',
    desc: "This video is a comprehensive look at the Crazy Seal Roofing System and its benefits. Watch it and you'll be up to speed in no time!",
    videoId: 'C5FvTulPDaY',
    thumbnail: `${MEDIA}/2021/11/21-Reasons-Video-Cover-No-Icon.jpg`,
    download: {
      href: `${MEDIA}/2024/04/21-Reasons-4-16-24-Final-Edit.pdf`,
      label: 'Click to Download Our 21\u00BD Reasons PDF',
    },
  },
  {
    heading: "Let's Get Crazy",
    desc: 'This video contains a bit of fun where we put Crazy Seal to the test with some weird stuff. Give it a watch for information and some mild entertainment.',
    videoId: 'VoPjXn8YCk4',
    thumbnail: `${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`,
  },
  {
    heading: 'Why is Crazy Seal More Expensive?',
    desc: 'This video is another comprehensive look at the Crazy Seal Roofing System like 21 1/2 Reasons, but with a focus on why The Crazy Seal System costs more than box store coatings.',
    videoId: 'AJpCXi3hqOI',
    thumbnail: `${MEDIA}/2023/07/Why-is-Crazy-Seal-More-Expensive-Thumbnail.jpg`,
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

export default function WelcomeToCrazySealPage() {
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
                  <PlayCircle className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Module 1
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Welcome to Crazy Seal
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Check out these videos and resources to get up to speed with
                  the benefits of our system.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937517485"
                  thumbnail={`${MEDIA}/2024/04/Module-1-Thumbnail.jpg`}
                  title="Module 1: Welcome to Crazy Seal"
                />
                <p className="text-center text-white/50 text-sm mt-3">
                  Module 1: Welcome to Crazy Seal
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── OVERVIEW VIDEOS ─── */}
      {VIDEOS.map((video, i) => (
        <Container key={video.videoId} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-3">
                  {video.heading}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-5">{video.desc}</p>
                {video.download && (
                  <LinkButton
                    href={video.download.href}
                    variant="primary"
                    size="md"
                    external
                  >
                    <Download className="w-4 h-4" />
                    {video.download.label}
                  </LinkButton>
                )}
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <ProYouTubeEmbed
                  videoId={video.videoId}
                  thumbnail={video.thumbnail}
                  title={video.heading}
                />
              </div>
            </div>
          </div>
        </Container>
      ))}

      {/* ─── CONTINUE TO NEXT MODULE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-5">
            Continue to Next Module
          </h2>
          <LinkButton href="/resources/marketing" variant="accent" size="lg">
            Marketing
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
            <ContentRequestForm sourcePage="resources-welcome-to-crazy-seal" />
          </div>
        </div>
      </Container>
    </>
  )
}
