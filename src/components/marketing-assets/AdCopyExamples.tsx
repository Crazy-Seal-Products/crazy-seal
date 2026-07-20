import { ArrowRight } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'

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
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            heading="Ad Copy Examples"
            subheading="Replace the bracketed placeholders with your business details and pair this copy with the assets above."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {AD_COPY.map((block) => (
              <div
                key={block.heading}
                className="rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex flex-col"
              >
                <div className="border-b border-gray-200 bg-white px-5 py-3">
                  <h3 className="font-bold text-primary">{block.heading}</h3>
                </div>
                <div className="p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
                  {block.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {block.bulletLabel && (
                    <p className="font-semibold">{block.bulletLabel}</p>
                  )}
                  {block.bullets.length > 0 && (
                    <ul className="list-disc pl-5 space-y-1.5">
                      {block.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                  {block.outro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading heading="Want To Create Custom Ad Copy?" />
          <LinkButton href="/marketing/ai-prompts" variant="primary" size="lg">
            Click Here for Crazy Seal AI Prompts
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </Container>
    </>
  )
}
