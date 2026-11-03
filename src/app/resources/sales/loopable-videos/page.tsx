import type { Metadata } from 'next'
import { Download, Repeat } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { HaloFrame } from '@/components/pro/VideoFrame'
import { EmbedAndThumbnailSection } from '@/components/pro/SalesAssetBlocks'

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/946025866/rendition/1080p/crazy_seal_looping_video%20%281080p%29.mp4?loc=external&signature=39f565f19b3e1edd654ddc83d09fbc10659848ee28ea9031bb6c6b1c68cd5386'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/946025866?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal Looping Video"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'Loopable Videos',
  description:
    'Looping Crazy Seal videos for Professional Partners to play at trade shows or on office monitors, with 1080p download and website embed code.',
}

const LOOP_PARTS = ['RV', '21½ Reasons', "Let's Get Crazy", 'Why is Crazy Seal More Expensive?']

export default function LoopableVideosPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={3}
        kicker="Sales Assets"
        icon={Repeat}
        title={
          <>
            Loopable <span className="text-shimmer-highlight">Videos</span>
          </>
        }
        intro="Looping videos to play at trade shows or on a monitor in your office."
      />

      <ModuleNav current={3} />

      {/* ─── LARGE LOOP ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Trade Show Ready" heading="Large Loop" variant="dark" className="mb-5 md:mb-6" />
          {/* Large Loop = (RV) + (21 1/2 Reasons) + (Let's Get Crazy) + (Why is Crazy Seal More Expensive?) */}
          <ol className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            {LOOP_PARTS.map((part, i) => (
              <li key={part} className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-highlight text-[10px] font-black text-primary">
                    {i + 1}
                  </span>
                  {part}
                </span>
                {i < LOOP_PARTS.length - 1 && <span className="font-bold text-highlight">+</span>}
              </li>
            ))}
          </ol>
          <div className="mx-auto max-w-3xl">
            <HaloFrame>
              <iframe
                src="https://player.vimeo.com/video/946025866?badge=0&autopause=0&player_id=0&app_id=58479"
                title="Crazy Seal Looping Video"
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </HaloFrame>
            <div className="flex justify-center pt-8">
              <LinkButton href={VIDEO_DOWNLOAD_URL} variant="white" size="md" external>
                <Download className="h-4 w-4" />
                Click to Download Video File (1080P)
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EMBED CODE ─── */}
      <EmbedAndThumbnailSection
        embedCode={EMBED_CODE}
        embedText="Embed the looping video on your own website."
      />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        module={3}
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
