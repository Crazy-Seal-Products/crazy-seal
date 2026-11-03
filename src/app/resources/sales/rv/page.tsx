import type { Metadata } from 'next'
import { Caravan, PlayCircle, Repeat } from 'lucide-react'
import { Container, LinkButton } from '@/lib/design-system'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import {
  AssetJumpLinks,
  EmbedAndThumbnailSection,
  PdfPreviewSection,
  PresentationPageBand,
  VideoDownloadSection,
} from '@/components/pro/SalesAssetBlocks'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const TRAILER_LIFE_PDF = `${MEDIA}/2020/07/Crazy-Seal-Trailer-Life.pdf`

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/418309408/rendition/1080p/crazy_seal_rv_roof%20%281080p%29.mp4?loc=external&signature=5146d903c46fb7f62f73ec037ceb37b8ed85f907f9596e7387cb0cc6fd4304b8'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/418309408?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal RV Roof"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'RV Sales Assets',
  description:
    'RV sales assets for Crazy Seal Professional Partners: digital presentation page, savings PDF, Crazy Seal brochure, Trailer Life magazine feature, loopable videos, and video presentation download with embed code.',
}

const JUMP_LINKS = [
  { id: 'presentation', label: 'Presentation Page' },
  { id: 'savings', label: 'Savings PDF' },
  { id: 'brochure', label: 'Brochure' },
  { id: 'trailer-life', label: 'Trailer Life' },
  { id: 'loopable', label: 'Loopable Videos' },
  { id: 'video', label: 'Video Download' },
]

export default function RvSalesAssetsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={3}
        kicker="Sales Assets"
        icon={Caravan}
        title={
          <>
            RV <span className="text-shimmer-highlight">Sales Assets</span>
          </>
        }
        intro="Presentation pages, PDFs and videos to help you close more RV roof jobs."
        actions={<AssetJumpLinks items={JUMP_LINKS} />}
      />

      <ModuleNav current={3} />

      {/* ─── DIGITAL PRESENTATION PAGE ─── */}
      <PresentationPageBand
        id="presentation"
        href="/rv-roofing"
        text="A presentation page with no external links showing the benefits of a professionally installed Crazy Seal System. Have your own site? Download the video or embed code below."
      />

      {/* ─── HOW MUCH COULD YOU SAVE? ─── */}
      <PdfPreviewSection
        id="savings"
        eyebrow="Savings PDF"
        heading="How Much Could You Save?"
        text="Show customers how they can save an RV load of cash by having the Crazy Seal System professionally installed."
        images={[
          `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final-791x1024-1.jpg`,
          `${MEDIA}/2021/12/Crazy-Seal-Dealer-F-I-Two-Sheet-Final2-791x1024-1.jpg`,
        ]}
        alt="Crazy Seal dealer savings sheet"
        pdfHref={`${MEDIA}/2022/09/Crazy-Seal-Dealer-F-I-Two-Sheet-Final.pdf`}
        buttonLabel="See Savings PDF"
      />

      {/* ─── CRAZY SEAL BROCHURE ─── */}
      <PdfPreviewSection
        id="brochure"
        eyebrow="Brochure"
        heading="Crazy Seal Brochure"
        text="A brief overview of the Crazy Seal System, professionally installed."
        images={[
          `${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-4-15-24.jpg`,
          `${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-4-15-242.jpg`,
        ]}
        alt="Crazy Seal RV brochure"
        pdfHref={`${MEDIA}/2024/04/RV-Crazy-Seal-Brochure-for-Download-Final.pdf`}
        buttonLabel="See Brochure PDF"
        flip
      />

      {/* ─── TRAILER LIFE MAGAZINE ─── */}
      <PdfPreviewSection
        id="trailer-life"
        eyebrow="As Featured In"
        heading="Featured in Trailer Life Magazine"
        text="Our featured Trailer Life article explaining the revolutionary Crazy Seal roofing system. Nice edification for the system."
        images={[
          `${MEDIA}/2020/04/Trailer-Life-May-2020-Cover-Large-768x1024.jpg`,
          `${MEDIA}/2020/04/Trailer-Life-May-2020-Page-1-Small.jpg`,
        ]}
        alt="Trailer Life Magazine feature"
        pdfHref={TRAILER_LIFE_PDF}
        buttonLabel="See Feature PDF"
      />

      {/* ─── LOOPABLE VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div
          id="loopable"
          className="section-bleed scroll-mt-36 bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12"
        >
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-highlight shadow-glow-primary">
              <Repeat className="h-8 w-8" />
            </span>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">Loopable Videos</h2>
              <p className="mt-2 leading-relaxed text-gray-600">
                Looping videos to play at trade shows or on a monitor in your office.
              </p>
            </div>
            <LinkButton href="/resources/sales/loopable-videos/" variant="primary" size="md">
              <PlayCircle className="h-4 w-4" />
              See Loopable Videos
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── VIDEO PRESENTATION DOWNLOAD ─── */}
      <VideoDownloadSection
        id="video"
        heading="Video Presentation Download"
        videoId="418309408"
        thumbnail={`${MEDIA}/2021/11/Pro-Installation-Video-Cover-1024x576.jpg`}
        title="Crazy Seal RV roof video presentation"
        downloadUrl={VIDEO_DOWNLOAD_URL}
      />

      {/* ─── EMBED CODE + VIDEO THUMBNAIL ─── */}
      <EmbedAndThumbnailSection
        embedCode={EMBED_CODE}
        embedText="Embed the RV presentation video on your own website."
        thumbnail={`${MEDIA}/2021/11/Pro-Installation-Video-Cover-1024x576.jpg`}
        thumbnailAlt="Crazy Seal RV video thumbnail"
        thumbnailDownload={`${MEDIA}/2020/07/Dealer-Video-Cover.jpg`}
      />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        module={3}
        sourcePage="resources-sales-rv"
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
