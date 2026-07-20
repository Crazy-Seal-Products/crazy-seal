import { Code, Download, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
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
 * Shared layout for the six video package pages. Apart from the asset video,
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
                    Marketing Assets
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Video Package {number}
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  A pre-built video advertisement ready for your immediate
                  use. Download the video file below or embed it directly on
                  your website, then pair it with the ad copy examples.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937522804"
                  thumbnail={`${MEDIA}/2024/04/10.jpg`}
                  title="How to use the Crazy Seal video packages"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── VIDEO ASSET ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading heading={`Video Asset ${number}`} />
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-gray-900">
              <iframe
                src={`https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`}
                title={`Video Asset ${number}`}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
                loading="lazy"
              />
            </div>
            <div className="flex justify-center pt-6">
              <LinkButton href={downloadUrl} variant="primary" size="md" external>
                <Download className="w-4 h-4" />
                Click to Download Video File (1080P)
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EMBED CODE ─── */}
      {embedCode && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <SectionHeading
              heading="Embed Code to Place On Website"
              subheading="Copy this HTML snippet to embed the video on your own website."
            />
            <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wide text-primary">
                  Embed Code (HTML)
                </span>
              </div>
              <pre className="p-4 text-xs text-gray-700 whitespace-pre-wrap break-all leading-relaxed">
                {embedCode}
              </pre>
            </div>
          </div>
        </Container>
      )}

      {/* ─── AD COPY EXAMPLES + CUSTOM AD COPY CTA ─── */}
      <AdCopyExamples />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
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
