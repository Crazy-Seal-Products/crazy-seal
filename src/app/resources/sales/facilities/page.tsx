import type { Metadata } from 'next'
import { Building2 } from 'lucide-react'
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

const RFMA_PDF = `${MEDIA}/2022/02/Crazy-Seal-President-in-Facilitator-February_March-2022.pdf`

const VIDEO_DOWNLOAD_URL =
  'https://player.vimeo.com/progressive_redirect/download/935230279/rendition/1080p/crazy_seal_professional_facilities_installation%20%281080p%29.mp4?loc=external&signature=8c4382109b36c631eb8128318c5a492e85e2c3e2499e8b23e7f5431957e282c7'

const EMBED_CODE = `<div style="padding:56.25% 0 0 0;position:relative;"><iframe src="https://player.vimeo.com/video/935230279?badge=0&autopause=0&player_id=0&app_id=58479" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" style="position:absolute;top:0;left:0;width:100%;height:100%;" title="Crazy Seal Professional Facilities Installation"></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`

export const metadata: Metadata = {
  title: 'Facilities Sales Assets',
  description:
    'Facilities sales assets for Crazy Seal Professional Partners: digital presentation page, RFMA Facilitator magazine feature, Crazy Seal brochure, full video explainer with download and embed code.',
}

const JUMP_LINKS = [
  { id: 'presentation', label: 'Presentation Page' },
  { id: 'rfma', label: 'RFMA Feature' },
  { id: 'brochure', label: 'Brochure' },
  { id: 'video', label: 'Video Explainer' },
]

export default function FacilitiesSalesAssetsPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={3}
        kicker="Sales Assets"
        icon={Building2}
        title={<span className="text-shimmer-highlight">Facilities</span>}
        intro="Presentation pages, PDFs and a full video explainer for facility owners and managers."
        actions={<AssetJumpLinks items={JUMP_LINKS} />}
      />

      <ModuleNav current={3} />

      {/* ─── DIGITAL PRESENTATION PAGE ─── */}
      <PresentationPageBand
        id="presentation"
        href="/facilities-overview"
        text="A presentation page with no external links showing the benefits of a professionally installed Crazy Seal System. Have your own site? Download the video or embed code below."
      />

      {/* ─── RFMA FACILITATOR MAGAZINE ─── */}
      <PdfPreviewSection
        id="rfma"
        eyebrow="As Featured In"
        heading="Featured in RFMA Facilitator Magazine"
        text="An article on roofing from Crazy Seal's President in the Restaurant Facility Managers Association magazine."
        images={[`${MEDIA}/2022/01/RFMA-Facilitator-1.jpg`, `${MEDIA}/2022/01/RFMA-Facilitator-2.jpg`]}
        alt="RFMA Facilitator magazine feature"
        pdfHref={RFMA_PDF}
        buttonLabel="See PDF"
      />

      {/* ─── CRAZY SEAL BROCHURE ─── */}
      <PdfPreviewSection
        id="brochure"
        eyebrow="Brochure"
        heading="Crazy Seal Brochure"
        text="A brief overview of the Crazy Seal System, professionally installed."
        images={[
          `${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-4-15-24-scaled.jpg`,
          `${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download-scaled.jpg`,
        ]}
        alt="Crazy Seal facilities brochure"
        pdfHref={`${MEDIA}/2024/04/Facilities-Crazy-Seal-Brochure-for-Download.pdf`}
        buttonLabel="See Brochure PDF"
        flip
      />

      {/* ─── FULL VIDEO EXPLAINER ─── */}
      <VideoDownloadSection
        id="video"
        heading="Full Video Explainer"
        videoId="935230279"
        thumbnail={`${MEDIA}/2024/03/IFMA-Cover-1024x576.jpg`}
        title="Crazy Seal Professional Facilities Installation"
        downloadUrl={VIDEO_DOWNLOAD_URL}
      />

      {/* ─── EMBED CODE + VIDEO THUMBNAIL ─── */}
      <EmbedAndThumbnailSection
        embedCode={EMBED_CODE}
        embedText="Embed the facilities explainer video on your own website."
        thumbnail={`${MEDIA}/2024/03/IFMA-Cover-1024x576.jpg`}
        thumbnailAlt="Crazy Seal facilities video thumbnail"
        thumbnailDownload={`${MEDIA}/2020/07/Dealer-Video-Cover.jpg`}
      />

      {/* ─── BACK / CONTINUE + QUICK LINKS + CONTENT REQUEST ─── */}
      <AssetPageFooter
        module={3}
        sourcePage="resources-sales-facilities"
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
