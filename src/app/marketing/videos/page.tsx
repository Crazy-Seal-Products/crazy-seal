import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock, Play, PlayCircle } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'

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
  {
    heading: 'Video Package 7',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-7/',
  },
  {
    heading: 'Video Package 8',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-8/',
  },
  {
    heading: 'Video Package 9',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-9/',
  },
  {
    heading: 'Video Package 10',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-10/',
  },
  {
    heading: 'Video Package 11',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-11/',
  },
  {
    heading: 'Video Package 12',
    tags: ['30 Seconds', 'Generic Assets'],
    href: '/marketing/videos/video-package-12/',
  },
  {
    heading: 'Video Package 13',
    tags: ['15 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-13/',
  },
  {
    heading: 'Video Package 14',
    tags: ['15 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-14/',
  },
  {
    heading: 'Video Package 15',
    tags: ['15 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-15/',
  },
  {
    heading: 'Video Package 16',
    tags: ['15 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-16/',
  },
  {
    heading: 'Video Package 17',
    tags: ['30 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-17/',
  },
  {
    heading: 'Video Package 18',
    tags: ['30 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-18/',
  },
  {
    heading: 'Video Package 19',
    tags: ['30 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-19/',
  },
  {
    heading: 'Video Package 20',
    tags: ['30 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-20/',
  },
  {
    heading: 'Video Package 21',
    tags: ['15 Seconds', 'Commercial Assets'],
    href: '/marketing/videos/video-package-21/',
  },
]

export default function MarketingVideosPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={2}
        kicker="Marketing Assets"
        icon={PlayCircle}
        title={
          <>
            Video <span className="text-shimmer-highlight">Packages</span>
          </>
        }
        intro={`${VIDEO_PACKAGES.length} pre-built video ads ready for your immediate use.`}
        chips={['15 & 30 second ads', 'Generic, RV & commercial assets', '1080p downloads']}
      />

      <ModuleNav current={2} />

      {/* ─── VIDEO PACKAGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Pick a Package" heading="Video Ads, Ready to Run" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {VIDEO_PACKAGES.map((pkg, i) => {
              const [duration, ...assets] = pkg.tags
              return (
                <Link
                  key={pkg.heading}
                  href={pkg.href}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-3 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="relative grid aspect-video place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-light to-secondary">
                    <div aria-hidden="true" className="hairline-grid absolute inset-0 opacity-60" />
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-accent/40 blur-2xl transition-transform duration-700 group-hover:scale-150"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-3 top-1 text-6xl font-extrabold text-white/15 font-[family-name:var(--font-display)]"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5 fill-primary/10" />
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-highlight px-2.5 py-1 text-[11px] font-extrabold text-primary shadow-sm">
                      <Clock className="h-3 w-3" />
                      {duration}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                    <h2 className="text-lg font-extrabold text-primary">{pkg.heading}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {assets.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/[0.06] px-2.5 py-1 text-xs font-semibold text-primary/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="mt-4 flex items-center justify-between gap-3 border-t border-primary/[0.07] pt-3 text-sm font-bold text-primary">
                      View Marketing Asset
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/[0.06] transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </Container>

      {/* ─── BACK / CONTINUE + QUICK LINKS + CONTENT REQUEST ─── */}
      <AssetPageFooter
        module={2}
        sourcePage="marketing-videos"
        back={{
          heading: 'Back to Main Marketing Page',
          label: 'Marketing',
          href: '/resources/marketing',
        }}
        next={{
          heading: 'Continue On to Sales',
          label: 'Sales',
          href: '/resources/sales',
        }}
      />
    </>
  )
}
