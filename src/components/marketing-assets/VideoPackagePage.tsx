import { Download, MonitorPlay, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { HaloFrame } from '@/components/pro/VideoFrame'
import { CopyCodeBlock } from '@/components/pro/CopyCodeBlock'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { AdCopyExamples } from './AdCopyExamples'
import { AssetPageFooter } from './AssetPageFooter'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

interface VideoPackagePageProps {
  number: number
  /** Vimeo ID of the downloadable/embeddable video asset. */
  videoId: string
  /** Vimeo progressive 1080p download URL from the live site. */
  downloadUrl: string
  /**
   * Embed snippet shown on the live page. Package 2's live page omits the
   * embed code section, so pass null to skip it.
   */
  embedCode: string | null
}

/**
 * Shared layout for the video package pages. Apart from the asset video,
 * download link, and embed code, the live pages are identical: a shared
 * explainer video followed by the shared ad copy examples.
 */
export function VideoPackagePage({
  number,
  videoId,
  downloadUrl,
  embedCode,
}: VideoPackagePageProps) {
  return (
    <>
      {/* ─── HERO / EXPLAINER VIDEO ─── */}
      <ModuleHero
        module={2}
        kicker="Marketing Assets"
        icon={PlayCircle}
        title={
          <>
            Video Package <span className="text-shimmer-highlight">{number}</span>
          </>
        }
        intro="A pre-built video ad ready for immediate use. Download it or embed it on your website, then pair it with the ad copy below."
        chips={['1080p download', ...(embedCode ? ['Website embed code'] : []), 'Ready-made ad copy']}
        media={
          <ProVimeoEmbed
            videoId="937522804"
            thumbnail={`${MEDIA}/2024/04/10.jpg`}
            title="How to use the Crazy Seal video packages"
          />
        }
        mediaCaption="How to use the video packages"
      />

      <ModuleNav current={2} />

      {/* ─── VIDEO ASSET + EMBED CODE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Your Asset" heading={`Video Asset ${number}`} />
          <div
            className={
              embedCode
                ? 'grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10'
                : 'mx-auto max-w-3xl'
            }
          >
            <div>
              <HaloFrame>
                <iframe
                  src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                  title={`Video Asset ${number}`}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                />
              </HaloFrame>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <LinkButton href={downloadUrl} variant="accent" size="md" external>
                  <Download className="h-4 w-4" />
                  Click to Download Video File (1080P)
                </LinkButton>
              </div>
            </div>

            {embedCode && (
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                    <MonitorPlay className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-primary">Embed Code to Place On Website</h3>
                    <p className="text-sm text-gray-500">Paste this HTML snippet into your own site.</p>
                  </div>
                </div>
                <CopyCodeBlock label="Embed Code (HTML)" text={embedCode} />
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* ─── AD COPY EXAMPLES + CUSTOM AD COPY CTA ─── */}
      <AdCopyExamples />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        module={2}
        sourcePage={`marketing-videos-video-package-${number}`}
        back={{
          heading: 'Back to Marketing Page',
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
