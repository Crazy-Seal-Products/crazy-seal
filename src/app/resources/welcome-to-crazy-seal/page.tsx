import type { Metadata } from 'next'
import { Download } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import {
  ContentRequestSection,
  ModuleHero,
  ModuleNav,
  ModuleNext,
} from '@/components/pro/ProgramModule'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Welcome to Crazy Seal',
  description:
    'Module 1 of the Crazy Seal Business Accelerator Program. Watch these videos and resources to get up to speed with the benefits of the Crazy Seal Roofing System.',
}

const VIDEOS = [
  {
    heading: '21 1/2 Reasons Why',
    desc: "A comprehensive look at the Crazy Seal Roofing System and its benefits. Watch it and you'll be up to speed in no time!",
    videoId: 'C5FvTulPDaY',
    thumbnail: `${MEDIA}/2021/11/21-Reasons-Video-Cover-No-Icon.jpg`,
    download: {
      href: `${MEDIA}/2024/04/21-Reasons-4-16-24-Final-Edit.pdf`,
      label: 'Click to Download Our 21½ Reasons PDF',
    },
  },
  {
    heading: "Let's Get Crazy",
    desc: 'We put Crazy Seal to the test with some weird stuff. Give it a watch for information and some mild entertainment.',
    videoId: 'VoPjXn8YCk4',
    thumbnail: `${MEDIA}/2021/11/Lets-Get-Crazy-Video-Cover-1024x576.jpg`,
  },
  {
    heading: 'Why is Crazy Seal More Expensive?',
    desc: 'Another comprehensive look at the system, like 21½ Reasons, focused on why Crazy Seal costs more than box store coatings.',
    videoId: 'AJpCXi3hqOI',
    thumbnail: `${MEDIA}/2023/07/Why-is-Crazy-Seal-More-Expensive-Thumbnail.jpg`,
  },
]

export default function WelcomeToCrazySealPage() {
  return (
    <>
      {/* ─── HERO / MODULE VIDEO ─── */}
      <ModuleHero
        module={1}
        title={
          <>
            Welcome to <span className="text-shimmer-highlight">Crazy Seal</span>
          </>
        }
        intro="Check out these videos and resources to get up to speed with the benefits of our system."
        chips={['3 overview videos', '21½ Reasons PDF']}
        media={
          <ProVimeoEmbed
            videoId="937517485"
            thumbnail={`${MEDIA}/2024/04/Module-1-Thumbnail.jpg`}
            title="Module 1: Welcome to Crazy Seal"
          />
        }
        mediaCaption="Module 1: Welcome to Crazy Seal"
      />

      <ModuleNav current={1} />

      {/* ─── OVERVIEW VIDEOS ─── */}
      {VIDEOS.map((video, i) => (
        <Container key={video.videoId} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={i % 2 === 1 ? 'text-center lg:order-2 lg:text-left' : 'text-center lg:text-left'}>
                <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-primary text-balance sm:text-4xl">
                  {video.heading}
                </h2>
                <p className="mx-auto mb-6 max-w-xl leading-relaxed text-gray-600 md:text-lg lg:mx-0">
                  {video.desc}
                </p>
                {video.download && (
                  <LinkButton href={video.download.href} variant="primary" size="md" external>
                    <Download className="h-4 w-4" />
                    {video.download.label}
                  </LinkButton>
                )}
              </div>
              <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                <ProYouTubeEmbed videoId={video.videoId} thumbnail={video.thumbnail} title={video.heading} />
              </div>
            </div>
          </div>
        </Container>
      ))}

      {/* ─── CONTINUE TO NEXT MODULE + QUICK LINKS ─── */}
      <ModuleNext current={1} />

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <ContentRequestSection sourcePage="resources-welcome-to-crazy-seal" />
    </>
  )
}
