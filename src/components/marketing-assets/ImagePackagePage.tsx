import { Download, Image as ImageIcon } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { AdCopyExamples } from './AdCopyExamples'
import { AssetPageFooter } from './AssetPageFooter'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export interface ImageGallerySection {
  /** Optional gallery heading, e.g. "Landscape Images". */
  heading?: string
  images: {
    /** Full-size image path relative to the wp-media root, e.g. "2019/07/Foo.jpg". */
    full: string
    /** Thumbnail path relative to the wp-media root. */
    thumb: string
    alt: string
  }[]
}

interface ImagePackagePageProps {
  title: string
  sourcePage: string
  sections: ImageGallerySection[]
}

/**
 * Shared layout for the RV/Commercial/Residential image package pages: a
 * shared explainer video, one or more click-to-open image galleries, and the
 * shared ad copy examples.
 */
export function ImagePackagePage({ title, sourcePage, sections }: ImagePackagePageProps) {
  const total = sections.reduce((sum, s) => sum + s.images.length, 0)

  return (
    <>
      {/* ─── HERO / EXPLAINER VIDEO ─── */}
      <ModuleHero
        module={2}
        kicker="Marketing Assets"
        icon={ImageIcon}
        title={title}
        intro="Pre-built image assets ready for immediate use. Click any image to open the full-size file, save it, and pair it with the ad copy below."
        chips={[`${total} images`, 'Full-size files', 'Ready-made ad copy']}
        media={
          <ProVimeoEmbed
            videoId="937522575"
            thumbnail={`${MEDIA}/2024/04/11.jpg`}
            title="How to use the Crazy Seal image packages"
          />
        }
        mediaCaption="How to use the image packages"
      />

      <ModuleNav current={2} />

      {/* ─── IMAGE GALLERIES ─── */}
      {sections.map((section, i) => (
        <Container key={section.heading ?? i} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
            <SectionHeading
              eyebrow={`${section.images.length} images · click to open full size`}
              heading={section.heading ?? title}
            />
            <div data-reveal-stagger className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
              {section.images.map((image) => (
                <a
                  key={image.full}
                  href={`${MEDIA}/${image.full}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl lg:mb-4"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/${image.thumb}`}
                    alt={image.alt}
                    loading="lazy"
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <span className="absolute bottom-2 right-2 inline-flex translate-y-1 items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-primary opacity-0 shadow-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
                    <Download className="h-3 w-3" />
                    Full size
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Container>
      ))}

      {/* ─── AD COPY EXAMPLES + CUSTOM AD COPY CTA ─── */}
      <AdCopyExamples />

      {/* ─── FOOTER ─── */}
      <AssetPageFooter
        module={2}
        sourcePage={sourcePage}
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
