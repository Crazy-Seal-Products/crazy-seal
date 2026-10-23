import { ArrowRight, Code, Download, FileText, ImageDown, MonitorPlay } from 'lucide-react'
import { clsx } from 'clsx'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { CopyCodeBlock } from '@/components/pro/CopyCodeBlock'

/*
 * Building blocks for the Sales module asset pages (RV, Facilities, loopable
 * videos): presentation-page band, PDF preview sections, video download, and
 * the embed code + thumbnail pair.
 */

/** In-page jump chips for the hero. */
export function AssetJumpLinks({ items }: { items: { id: string; label: string }[] }) {
  return (
    <>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white ring-1 ring-white/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
          {item.label}
        </a>
      ))}
    </>
  )
}

export function PresentationPageBand({ id, href, text }: { id?: string; href: string; text: string }) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className="section-bleed scroll-mt-36 bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12"
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/[0.04] via-accent/[0.07] to-primary/[0.04] p-6 ring-1 ring-primary/[0.06] sm:p-8 lg:p-10">
          <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:text-left">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent animate-float">
              <MonitorPlay className="h-8 w-8" />
            </span>
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl">Digital Presentation Page</h2>
              <p className="mt-2 max-w-2xl leading-relaxed text-gray-600">{text}</p>
            </div>
            <LinkButton href={href} variant="accent" size="lg">
              Visit Digital Presentation Page
              <ArrowRight className="h-4 w-4" />
            </LinkButton>
          </div>
        </div>
      </div>
    </Container>
  )
}

interface PdfPreviewSectionProps {
  id?: string
  eyebrow?: string
  heading: string
  text: string
  images: string[]
  alt: string
  pdfHref: string
  buttonLabel: string
  /** Put the previews on the left instead of the right (desktop). */
  flip?: boolean
}

export function PdfPreviewSection({
  id,
  eyebrow = 'PDF',
  heading,
  text,
  images,
  alt,
  pdfHref,
  buttonLabel,
  flip = false,
}: PdfPreviewSectionProps) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className="section-bleed scroll-mt-36 bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12"
      >
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <div className={clsx('text-center lg:text-left', flip && 'lg:order-2')}>
            <SectionHeading
              eyebrow={eyebrow}
              heading={heading}
              align="left"
              className="mb-4 text-center lg:text-left"
            />
            <p className="mx-auto mb-7 max-w-xl leading-relaxed text-gray-600 md:text-lg lg:mx-0">{text}</p>
            <LinkButton href={pdfHref} variant="primary" size="md" external>
              <FileText className="h-4 w-4" />
              {buttonLabel}
            </LinkButton>
          </div>
          <div className={clsx('relative', flip && 'lg:order-1')}>
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-2xl"
            />
            <div className="relative mx-auto grid max-w-xl grid-cols-2 gap-4 sm:gap-6">
              {images.map((image, i) => (
                <a
                  key={image}
                  href={pdfHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={clsx(
                    'group relative block overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-primary/10 transition-all duration-500 hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-2xl',
                    i % 2 === 0 ? '-rotate-2' : 'rotate-2 sm:translate-y-6'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={alt}
                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                    <FileText className="h-3 w-3" />
                    PDF
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export function VideoDownloadSection({
  id,
  heading,
  videoId,
  thumbnail,
  title,
  downloadUrl,
}: {
  id?: string
  heading: string
  videoId: string
  thumbnail: string
  title: string
  downloadUrl: string
}) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className="section-bleed scroll-mt-36 bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12"
      >
        <SectionHeading eyebrow="Download & Share" heading={heading} variant="dark" />
        <div className="mx-auto max-w-3xl">
          <ProVimeoEmbed videoId={videoId} thumbnail={thumbnail} title={title} />
          <div className="flex justify-center pt-8">
            <LinkButton href={downloadUrl} variant="white" size="md" external>
              <Download className="h-4 w-4" />
              Click to Download Video File (1080P)
            </LinkButton>
          </div>
        </div>
      </div>
    </Container>
  )
}

/** Embed code (copyable) beside the downloadable video thumbnail. */
export function EmbedAndThumbnailSection({
  id,
  embedCode,
  embedText,
  thumbnail,
  thumbnailAlt,
  thumbnailDownload,
}: {
  id?: string
  embedCode: string
  embedText: string
  thumbnail?: string
  thumbnailAlt?: string
  thumbnailDownload?: string
}) {
  const hasThumb = Boolean(thumbnail && thumbnailDownload)
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        id={id}
        className="section-bleed scroll-mt-36 bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12"
      >
        <div className={clsx('grid grid-cols-1 gap-8 lg:gap-10', hasThumb ? 'lg:grid-cols-2' : 'mx-auto max-w-3xl')}>
          <div>
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                <Code className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">
                  Embed Code to Place On Website
                </h2>
                <p className="text-sm text-gray-500">{embedText}</p>
              </div>
            </div>
            <CopyCodeBlock label="Embed Code (HTML)" text={embedCode} />
          </div>
          {thumbnail && thumbnailDownload && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                  <ImageDown className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">Video Thumbnail</h2>
                  <p className="text-sm text-gray-500">Use it as the cover image on your site.</p>
                </div>
              </div>
              <div className="group overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-primary/[0.08] transition-shadow duration-500 hover:shadow-xl">
                <div className="overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumbnail}
                    alt={thumbnailAlt}
                    className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex justify-center p-4 sm:p-5">
                  <LinkButton href={thumbnailDownload} variant="primary" size="md" external>
                    <Download className="h-4 w-4" />
                    Click to Download Thumbnail File (1080P)
                  </LinkButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  )
}

/** Render [Placeholders] as highlighted marks so they're easy to spot and replace. */
export function highlightPlaceholders(text: string) {
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith('[') && part.endsWith(']') ? (
      <mark key={i} className="rounded bg-highlight/40 px-1 font-semibold text-primary">
        {part}
      </mark>
    ) : (
      part
    )
  )
}

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** AI prompt library: a sticky index beside copyable prompt panels. */
export function PromptLibrary({ prompts }: { prompts: { heading: string; text: string }[] }) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
        <SectionHeading
          eyebrow={`${prompts.length} prompts`}
          heading="Copy a Prompt, Fill In the Brackets"
          subheading="Paste any prompt into your AI platform and replace the highlighted placeholders with your business details."
        />
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[260px_1fr] lg:gap-10">
          <nav aria-label="Prompts" className="lg:sticky lg:top-40">
            <ol className="flex gap-2 overflow-x-auto pb-1 scrollbar-none lg:flex-col lg:overflow-visible">
              {prompts.map((prompt, i) => (
                <li key={prompt.heading} className="shrink-0">
                  <a
                    href={`#${slug(prompt.heading)}`}
                    className="group flex items-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white px-3 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-extrabold text-white transition-colors group-hover:bg-accent">
                      {i + 1}
                    </span>
                    <span className="whitespace-nowrap lg:whitespace-normal">{prompt.heading.replace(/^AI Prompt for /, '')}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="space-y-8">
            {prompts.map((prompt) => (
              <div key={prompt.heading} id={slug(prompt.heading)} className="scroll-mt-40">
                <h2 className="mb-3 text-xl font-extrabold tracking-tight text-primary sm:text-2xl">{prompt.heading}</h2>
                <CopyCodeBlock label={prompt.heading} text={prompt.text} icon="bot" variant="prose">
                  <div className="space-y-3">
                    {prompt.text.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{highlightPlaceholders(paragraph)}</p>
                    ))}
                  </div>
                </CopyCodeBlock>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}
