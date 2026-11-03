import type { Metadata } from 'next'
import { ArrowRight, Blend, FileText, PlayCircle, ShieldCheck } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import {
  ContactCta,
  HERO_H1,
  HeroChips,
  HeroShell,
  IconTile,
  MEDIA,
  PdfCards,
  SECTION_NAVY,
  SECTION_WHITE,
  WarrantySubmitBand,
  fadeDelay,
} from '@/components/system-pages/blocks'

export const metadata: Metadata = {
  title: 'Direct To Deck Installation',
  description:
    'Direct to deck installation instructions for the Crazy Seal roofing system, including downloadable PDFs and a full installation video for sealing directly over wood decking.',
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
    desc: 'The complete direct to deck installation instructions in PDF form.',
    href: `${MEDIA}/2023/06/Crazy-Seal-Direct-To-Deck-Installation.pdf`,
    image: `${MEDIA}/2019/06/Crazy-Seal-Installation-Cover-Small.jpg`,
  },
  {
    title: 'Tools PDF',
    desc: 'The full list of tools you will need to complete your installation.',
    href: `${MEDIA}/2020/03/Crazy-Seal-Tool-List.pdf`,
    image: `${MEDIA}/2020/03/Crazy-Seal-Tools-Full-scaled.jpg`,
  },
]

export default function DirectToDeckPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <HeroShell innerClassName="text-center">
          <h1 className={HERO_H1} style={fadeDelay(80)}>
            Direct to Deck <span className="text-shimmer-highlight">Installation</span>
          </h1>
          <p
            className="animate-fade-up text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed"
            style={fadeDelay(160)}
          >
            Everything you need to seal directly over wood decking: downloadable PDFs and a full
            installation video.
          </p>
          <HeroChips
            delay={260}
            className="mt-7 justify-center"
            items={[
              { icon: FileText, label: 'Downloadable PDFs' },
              { icon: PlayCircle, label: 'Full installation video' },
              { icon: ShieldCheck, label: '50 year warranty' },
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
            subheading="Watch this full installation video that will take you through the entire installation process."
            variant="dark"
          />
          <div className="relative max-w-4xl mx-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
            />
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/15 bg-primary-dark">
              <iframe
                src="https://player.vimeo.com/video/379082202?title=0&portrait=0&byline=0"
                title="Crazy Seal direct to deck full installation video"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </Container>

      {/* ─── HYBRID INSTALLATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className={SECTION_WHITE}>
          <div className="group flex flex-col md:flex-row items-center gap-6 lg:gap-10 text-center md:text-left">
            <IconTile icon={Blend} className="h-16 w-16 rounded-2xl" iconClassName="h-7 w-7" />
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-2">
                &ldquo;Hybrid&rdquo; Installations
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-3xl">
                Performing a hybrid installation with partial wood decking and partial in-tact
                rubber/EPDM/TPO membrane? Visit the membrane installation page for details on how to install
                directly to an existing membrane.
              </p>
            </div>
            <LinkButton href="/installation/membrane-roof" variant="primary" size="lg">
              Membrane Installation
              <ArrowRight className="w-5 h-5" />
            </LinkButton>
          </div>
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
