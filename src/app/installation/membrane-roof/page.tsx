import type { Metadata } from 'next'
import { Clock, FileText, Flag, Play, PlayCircle } from 'lucide-react'
import {
  Container,
  SectionHeading,
  YouTubeEmbed,
} from '@/lib/design-system'
import {
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroShell,
  MEDIA,
  PdfCards,
  SECTION_NAVY,
  SECTION_WHITE,
  WarrantySubmitBand,
  fadeDelay,
} from '@/components/system-pages/blocks'
import { ChapterRail } from '@/components/system-pages/motion-blocks'

export const metadata: Metadata = {
  title: 'Membrane Roof Installation',
  description:
    'Step-by-step membrane roof installation instructions for the Crazy Seal roofing system, including downloadable PDFs, a full installation video, and breakout videos for every step.',
}

const PDFS = [
  {
    title: 'Photo Guidelines',
    desc: 'How to photograph your project before and after for your 50 year warranty.',
    href: `${MEDIA}/2020/05/Photo-Guidelines.pdf`,
    image: `${MEDIA}/2020/05/Submit-Photos-for-Warranty.jpg`,
  },
  {
    title: 'Installation PDF',
    desc: 'The complete over-membrane installation instructions in PDF form.',
    href: `${MEDIA}/2020/05/Crazy-Seal-Over-Membrane-Installation-Instructions.pdf`,
    image: `${MEDIA}/2019/06/Crazy-Seal-Installation-Cover-Small.jpg`,
  },
  {
    title: 'Tools PDF',
    desc: 'The full list of tools you will need to complete your installation.',
    href: `${MEDIA}/2020/03/Crazy-Seal-Tool-List.pdf`,
    image: `${MEDIA}/2020/03/Crazy-Seal-Tools-Full-scaled.jpg`,
  },
]

const BREAKOUT_VIDEOS = [
  { id: '1YRViSrC5Fs', title: 'Getting Started' },
  { id: 'Wxhkt6VD9GY', title: 'Step 1: Inspection' },
  { id: 'VYLiauwV0DM', title: 'Step 2: Clean & Prep' },
  { id: 'JfnINcNwuvQ', title: 'Wash and Scrub' },
  { id: 'inlKNOnHy0k', title: 'Cleaning Sealants' },
  { id: 'WycL8mTKWBw', title: 'Tape Off Fixtures' },
  { id: 'DD93T08npso', title: 'Step 3: Seal the Roof' },
  { id: '5yZNFn1jJSQ', title: 'Apply Crazy Caulk' },
  { id: 'lmMd6CEhWbU', title: 'Apply Crazy Patch' },
  { id: 'TOe6s4ub_18', title: 'Apply Crazy Seal' },
  { id: 'hm2f-AyLhs4', title: 'Additional Coats' },
  { id: 'd4pSSqrQ55s', title: 'Finalizing the Installation' },
]

/** Groups the breakout videos (by index) into the installation's chapters. */
const CHAPTERS = [
  { node: <Play className="h-4 w-4 md:h-5 md:w-5" />, eyebrow: 'Before You Begin', title: 'Getting Started', range: [0, 1] },
  { node: '1', eyebrow: 'Step 1', title: 'Inspection', range: [1, 2] },
  { node: '2', eyebrow: 'Step 2', title: 'Clean & Prep', range: [2, 6] },
  { node: '3', eyebrow: 'Step 3', title: 'Seal the Roof', range: [6, 11] },
  { node: <Flag className="h-4 w-4 md:h-5 md:w-5" />, eyebrow: 'Wrap Up', title: 'Finalizing the Installation', range: [11, 12] },
] as const

function VideoCard({ index }: { index: number }) {
  const video = BREAKOUT_VIDEOS[index]
  return (
    <div className="group overflow-hidden rounded-2xl bg-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <YouTubeEmbed videoId={video.id} />
      <div className="flex items-center gap-3 p-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-xs font-extrabold text-accent-dark tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Video {index + 1}</p>
          <p className="font-bold text-primary leading-snug">{video.title}</p>
        </div>
      </div>
    </div>
  )
}

export default function MembraneRoofPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell innerClassName="text-center">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            Membrane Roof <span className="text-shimmer-highlight">Installation Instructions</span>
          </h1>
          <p
            className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            style={fadeDelay(160)}
          >
            Downloadable PDFs, a full installation video, and breakout videos you can watch as you get to
            each step.
          </p>
          <HeroChips
            delay={260}
            className="mt-7 justify-center"
            items={[
              { icon: FileText, label: 'Downloadable PDFs' },
              { icon: Clock, label: 'Full video under 23½ minutes' },
              { icon: PlayCircle, label: `${BREAKOUT_VIDEOS.length} breakout videos` },
            ]}
          />
        </HeroShell>
      </Container>

      {/* ─── DOWNLOADABLE PDFS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading eyebrow="Free Downloads" heading="Downloadable PDF's" />
          <PdfCards pdfs={PDFS} />
        </div>
      </Container>

      {/* ─── FULL INSTALLATION VIDEO ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_NAVY}>
          <SectionHeading
            eyebrow="Installation Videos"
            heading="Full Installation Video"
            subheading="One full video takes you through the entire installation process, plus breakout videos below for each step."
            variant="dark"
          />
          <div className="relative max-w-4xl mx-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15">
              <YouTubeEmbed videoId="ttfgscV2Dzw" variant="card" />
            </div>
            <p className="relative mt-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/15">
                <Clock className="h-4 w-4 text-highlight" />
                Click to watch the full video (less than 23&frac12; minutes)
              </span>
            </p>
          </div>
        </div>
      </Container>

      {/* ─── BREAKOUT VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <SectionHeading
            eyebrow="Step by Step"
            heading="Breakout Videos"
            subheading="Watch each one as you get to that step."
          />
          <ChapterRail
            className="max-w-6xl mx-auto"
            chapters={CHAPTERS.map((chapter) => ({
              node: chapter.node,
              eyebrow: chapter.eyebrow,
              title: chapter.title,
              children: (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: chapter.range[1] - chapter.range[0] }, (_, k) => (
                    <VideoCard key={chapter.range[0] + k} index={chapter.range[0] + k} />
                  ))}
                </div>
              ),
            }))}
          />
        </div>
      </Container>

      {/* ─── WARRANTY ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <WarrantySubmitBand />
      </Container>

      {/* ─── CONTACT CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <ContactCta />
      </Container>
    </>
  )
}
