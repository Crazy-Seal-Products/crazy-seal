import { Image as ImageIcon } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
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
                  <ImageIcon className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Marketing Assets
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  {title}
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Pre-built image assets ready for your immediate use. Click
                  any image to open the full-size file, then save it and pair
                  it with the ad copy examples below.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937522575"
                  thumbnail={`${MEDIA}/2024/04/11.jpg`}
                  title="How to use the Crazy Seal image packages"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── IMAGE GALLERIES ─── */}
      {sections.map((section, i) => (
        <Container key={section.heading ?? i} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <SectionHeading heading={section.heading ?? title} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
              {section.images.map((image) => (
                <a
                  key={image.full}
                  href={`${MEDIA}/${image.full}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${MEDIA}/${image.thumb}`}
                    alt={image.alt}
                    loading="lazy"
                    className="w-full h-auto object-cover"
                  />
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
