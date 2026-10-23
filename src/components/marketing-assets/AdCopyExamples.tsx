import { ArrowRight, Bot } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { CopyCodeBlock } from '@/components/pro/CopyCodeBlock'
import { highlightPlaceholders } from '@/components/pro/SalesAssetBlocks'

interface AdCopyBlock {
  heading: string
  intro: string[]
  bulletLabel?: string
  bullets: string[]
  outro: string[]
}

const AD_COPY: AdCopyBlock[] = [
  {
    heading: 'Facebook Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type]!',
      'Say goodbye to water leaks and fading with our seamless, fluid-applied roofing solution. [Business Name] now offers Crazy Seal installations, providing you with long-lasting protection and peace of mind.',
    ],
    bulletLabel: 'Key Features:',
    bullets: [
      'Maintenance free: One and done for a lifetime of fun.',
      'Waterproof: Seamless membrane keeps you dry and safe.',
      'Durable: High-grade silicone infused with fibers ensures strength and longevity.',
      'UV Resistance: Prevents fading and chalking over time.',
      'Energy Efficiency: Reflectivity helps reduce roof and internal temperatures.',
    ],
    outro: [
      'Choose quality, durability, and superior performance for your roof. Call us today at [Phone Number] to learn more or schedule your installation!',
    ],
  },
  {
    heading: 'Instagram Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type]!',
      'At [Business Name], we now provide Crazy Seal installations, bringing you a seamless, watertight solution for your roof. Say goodbye to leaks and hello to the ultimate roofing system.',
    ],
    bulletLabel: 'Benefits:',
    bullets: [
      'Seamless, chemically bonded membrane',
      'Waterproof, scratch-resistant, and flexible',
      'Superior resistance to UV rays, chalking, and fading',
      'No maintenance with stain-resistant properties',
      'Energy efficiency for lower roof temperatures',
    ],
    outro: [
      'Contact us today at [Phone Number] to schedule your installation!',
    ],
  },
  {
    heading: 'YouTube Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type]!',
      '[Business Name] is proud to introduce the Crazy Seal system, providing unparalleled protection and long-lasting performance for your roof. Watch to learn how our seamless, fluid-applied roofing solution can safeguard you against leaks, UV rays, and other harsh conditions.',
    ],
    bulletLabel: 'Key Features:',
    bullets: [
      'Seamless, chemically bonded membrane',
      'Waterproof and flexible to prevent water intrusion',
      'UV resistance to protect against fading and chalking',
      'Energy efficiency for reduced temperatures',
    ],
    outro: [
      'If you want the ultimate protection for your roof, contact us today at [Phone Number] to learn more and schedule your installation!',
    ],
  },
  {
    heading: 'LinkedIn Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type] at [Business Name]!',
      "This seamless, fluid-applied roofing system provides unparalleled protection and long-lasting performance. Crazy Seal's key benefits include:",
    ],
    bullets: [
      'Waterproof, flexible membrane',
      'UV resistance to prevent fading and chalking',
      'Energy efficiency for reduced roof and internal temperatures',
      'Easy maintenance with stain-resistant properties',
    ],
    outro: [
      'Contact us at [Phone Number] to learn more and schedule your installation.',
    ],
  },
  {
    heading: 'Google My Business Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type] at [Business Name]!',
      'Enjoy a seamless, fluid-applied roofing system that offers long-lasting protection and peace of mind. Crazy Seal installations provide a watertight barrier for your roof, with key features including:',
    ],
    bullets: [
      'Waterproof and flexible membrane',
      'UV resistance to prevent fading and chalking',
      'Energy efficiency for cooler temperatures',
      'No maintenance with stain-resistant properties',
    ],
    outro: [
      'Contact us today at [Phone Number] to learn more and schedule your installation!',
    ],
  },
  {
    heading: 'Twitter Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for your [Application Type] at [Business Name]!',
      'Enjoy seamless, durable protection with UV resistance and energy efficiency. Contact us at [Phone Number] to learn more and schedule your installation.',
    ],
    bullets: [],
    outro: [],
  },
  {
    heading: 'Pinterest Ad Copy',
    intro: [
      'Now offering the Crazy Seal Roofing System for [Application Type] at [Business Name]!',
      'Experience seamless, long-lasting protection with Crazy Seal installations. Key features include waterproof and flexible membrane, UV resistance, and energy efficiency.',
      'Contact us at [Phone Number] to learn more and schedule your installation.',
    ],
    bullets: [],
    outro: [],
  },
]

/** Plain-text version of a block for the clipboard. */
function toPlainText(block: AdCopyBlock) {
  return [
    ...block.intro,
    ...(block.bulletLabel ? [block.bulletLabel] : []),
    ...(block.bullets.length ? [block.bullets.map((b) => `• ${b}`).join('\n')] : []),
    ...block.outro,
  ].join('\n\n')
}

/**
 * The seven ad copy examples (Facebook, Instagram, YouTube, LinkedIn, Google
 * My Business, Twitter, Pinterest) shared verbatim by every video package and
 * image package page on the live site, followed by the "Want To Create Custom
 * Ad Copy?" CTA.
 */
export function AdCopyExamples() {
  return (
    <>
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Copy, Paste, Post"
            heading="Ad Copy Examples"
            subheading="Swap the highlighted placeholders for your business details and pair this copy with the assets above."
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
            {AD_COPY.map((block) => (
              <CopyCodeBlock
                key={block.heading}
                label={block.heading}
                text={toPlainText(block)}
                icon="megaphone"
                className="flex flex-col"
              >
                <div className="space-y-3">
                  {block.intro.map((paragraph) => (
                    <p key={paragraph}>{highlightPlaceholders(paragraph)}</p>
                  ))}
                  {block.bulletLabel && <p className="font-semibold text-primary">{block.bulletLabel}</p>}
                  {block.bullets.length > 0 && (
                    <ul className="space-y-1.5">
                      {block.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5">
                          <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {block.outro.map((paragraph) => (
                    <p key={paragraph}>{highlightPlaceholders(paragraph)}</p>
                  ))}
                </div>
              </CopyCodeBlock>
            ))}
          </div>
        </div>
      </Container>

      <CustomCopyCta heading="Want To Create Custom Ad Copy?" />
    </>
  )
}

/** Gradient band pointing to the AI prompts page ("Want To Create Custom …?"). */
export function CustomCopyCta({ heading }: { heading: string }) {
  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div
        data-reveal
        className="relative -mx-5 overflow-hidden bg-gradient-to-r from-primary to-secondary px-5 py-8 shadow-xl sm:mx-0 sm:rounded-[1.75rem] sm:p-8 md:p-10"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl"
        />
        <div className="relative flex flex-col items-center gap-5 text-center lg:flex-row lg:gap-8 lg:text-left">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 animate-float">
            <Bot className="h-8 w-8 text-highlight" />
          </span>
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{heading}</h2>
            <p className="mt-2 text-white/70">Use our AI prompts to write copy tailored to your business.</p>
          </div>
          <LinkButton href="/marketing/ai-prompts" variant="white" size="lg">
            Click Here for Crazy Seal AI Prompts
            <ArrowRight className="h-4 w-4" />
          </LinkButton>
        </div>
      </div>
    </Container>
  )
}
