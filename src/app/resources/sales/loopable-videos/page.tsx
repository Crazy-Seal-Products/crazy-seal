import type { Metadata } from 'next'
import { Code, Download, PlayCircle } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/946025866/rendition/1080p/crazy_seal_looping_video%20%281080p%29.mp4?loc=external&signature=39f565f19b3e1edd654ddc83d09fbc10659848ee28ea9031bb6c6b1c68cd5386'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/946025866?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal Looping Video"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'Loopable Videos',
  description:
    'Looping Crazy Seal videos for Professional Partners to play at trade shows or on office monitors, with 1080p download and website embed code.',
}

export default function LoopableVideosPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-16 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <PlayCircle className="w-4 h-4 text-highlight" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                Sales Assets
              </p>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Loopable Videos
            </h1>
          </div>
        </div>
      </Container>

      {/* ─── LARGE LOOP ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Large Loop"
            subheading="Large Loop = (RV) + (21 1/2 Reasons) + (Let's Get Crazy) + (Why is Crazy Seal More Expensive?)"
            variant="dark"
          />
          <div className="max-w-3xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/10">
              <iframe
                src="https://player.vimeo.com/video/946025866?badge=0&autopause=0&player_id=0&app_id=58479"
                title="Crazy Seal Looping Video"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="flex justify-center pt-6">
              <LinkButton href={VIDEO_DOWNLOAD_URL} variant="white" size="md" external>
                <Download className="w-4 h-4" />
                Click to Download Video File (1080P)
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EMBED CODE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Embed Code to Place On Website"
            subheading="Copy this HTML snippet to embed the looping video on your own website."
          />
          <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wide text-primary">
                Embed Code (HTML)
              </span>
            </div>
            <pre className="p-4 text-xs text-gray-700 whitespace-pre-wrap break-all leading-relaxed">
              {EMBED_CODE}
            </pre>
          </div>
        </div>
      </Container>

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        sourcePage="resources-sales-loopable-videos"
        back={{
          heading: 'Back to Main Sales Page',
          label: 'Sales',
          href: '/resources/sales',
        }}
        next={{
          heading: 'Continue On to Build a Kit',
          label: 'Build a Kit',
          href: '/resources/building-a-kit',
        }}
      />
    </>
  )
}
