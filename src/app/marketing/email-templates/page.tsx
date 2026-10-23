import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { CopyCodeBlock } from '@/components/pro/CopyCodeBlock'
import { AssetPageFooter } from '@/components/marketing-assets/AssetPageFooter'
import { CustomCopyCta } from '@/components/marketing-assets/AdCopyExamples'
import { ModuleHero, ModuleNav } from '@/components/pro/ProgramModule'
import { highlightPlaceholders } from '@/components/pro/SalesAssetBlocks'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

export const metadata: Metadata = {
  title: 'Email Templates',
  description:
    'Pre-built Crazy Seal email templates ready for your immediate use. Announcement, benefits, and call-to-action emails to inform your customers that you now offer the Crazy Seal Roofing System.',
}

const EMAILS = [
  {
    heading: 'Email 1: Announcement',
    subject: 'Exciting News! Now Offering the Crazy Seal Roofing System!',
    intro: [
      "Dear [Customer's Name],",
      'We have some exciting news to share with you! [Business Name] is now offering the revolutionary Crazy Seal Roofing System. This seamless, fluid-applied system offers unparalleled protection for your RV roof, helping you stay dry and safe on the road.',
      'With Crazy Seal, you can enjoy:',
    ],
    bullets: [
      'Waterproof, scratch-resistant, and flexible protection',
      'Superior resistance to UV rays, chalking, and fading',
      'Easy maintenance with stain-resistant properties',
      'Energy efficiency for lower roof temperatures',
    ],
    outro: [
      "Stay tuned for more details on how the Crazy Seal system can transform your RV's roof. In the meantime, feel free to contact us at [Phone Number] for more information.",
      'Best,\n[Your Name]\n[Business Name]',
    ],
  },
  {
    heading: 'Email 2: Benefits of Crazy Seal',
    subject: 'Discover the Benefits of Crazy Seal for Your RV Roof!',
    intro: [
      "Dear [Customer's Name],",
      "We recently announced that we now offer the Crazy Seal Roofing System, and we're excited to share more about its unique benefits for your RV roof:",
    ],
    bullets: [
      'Unmatched Protection: The seamless membrane keeps your RV dry and secure.',
      'Durable and Flexible: High-grade silicone infused with fibers provides strength and longevity.',
      'UV Resistance: Prevents fading and chalking over time.',
      'Energy Efficiency: Reflectivity helps reduce roof and internal temperatures.',
    ],
    outro: [
      "Crazy Seal is an investment in the longevity and performance of your RV's roof. If you have any questions or want to schedule your installation, reach out to us at [Phone Number].",
      'Best regards,\n[Your Name]\n[Business Name]',
    ],
  },
  {
    heading: 'Email 3: Call to Action',
    subject: "Don't Wait! Schedule Your Crazy Seal Installation Today!",
    intro: [
      "Dear [Customer's Name],",
      'Are you ready to upgrade your RV roof with the Crazy Seal system? This state-of-the-art roofing solution offers exceptional protection, durability, and energy efficiency.',
      'Contact us today at [Phone Number] to schedule your Crazy Seal installation. Our team is ready to provide you with a seamless, watertight roof that will keep you protected on all your adventures.',
      'As a valued customer, we want to make sure you take advantage of this incredible opportunity. Let us know how we can assist you.',
    ],
    bullets: [],
    outro: ['Looking forward to hearing from you soon!\n[Your Name]\n[Business Name]'],
  },
]

type Email = (typeof EMAILS)[number]

/** Plain-text version of an email for the clipboard. */
function toPlainText(email: Email) {
  return [
    `Subject: ${email.subject}`,
    ...email.intro,
    ...(email.bullets.length ? [email.bullets.map((b) => `• ${b}`).join('\n')] : []),
    ...email.outro,
  ].join('\n\n')
}

export default function EmailTemplatesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <ModuleHero
        module={2}
        kicker="Marketing Assets"
        icon={Mail}
        title={
          <>
            Email <span className="text-shimmer-highlight">Templates</span>
          </>
        }
        intro="Pre-built email templates ready for your immediate use. Replace the bracketed placeholders with your business details and send them to your customers."
        chips={['Announcement', 'Benefits', 'Call to action']}
        media={
          <ProVimeoEmbed videoId="937522833" thumbnail={`${MEDIA}/2024/04/12.jpg`} title="Email Templates" />
        }
      />

      <ModuleNav current={2} />

      {/* ─── EMAIL TEMPLATES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="3-Email Sequence"
            heading="Copy, Personalize, Send"
            subheading="Swap the highlighted placeholders for your details, then send the emails in order."
          />
          <ol className="mx-auto max-w-3xl space-y-10">
            {EMAILS.map((email, i) => (
              <li key={email.heading} className="relative">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-b from-primary-light to-primary text-sm font-extrabold text-white shadow-glow-primary">
                    {i + 1}
                  </span>
                  <h2 className="text-xl font-extrabold tracking-tight text-primary sm:text-2xl">{email.heading}</h2>
                </div>
                <CopyCodeBlock
                  label={email.heading}
                  text={toPlainText(email)}
                  icon="mail"
                  meta={
                    <p>
                      <span className="font-bold text-primary">Subject:</span> {email.subject}
                    </p>
                  }
                >
                  <div className="space-y-4">
                    {email.intro.map((paragraph) => (
                      <p key={paragraph}>{highlightPlaceholders(paragraph)}</p>
                    ))}
                    {email.bullets.length > 0 && (
                      <ul className="space-y-1.5">
                        {email.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5">
                            <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {email.outro.map((paragraph) => (
                      <p key={paragraph} className="whitespace-pre-line">
                        {highlightPlaceholders(paragraph)}
                      </p>
                    ))}
                  </div>
                </CopyCodeBlock>
              </li>
            ))}
          </ol>
        </div>
      </Container>

      {/* ─── CUSTOM EMAIL TEMPLATES CTA ─── */}
      <CustomCopyCta heading="Want To Create Custom Email Templates?" />

      {/* ─── BACK / CONTINUE + QUICK LINKS + CONTENT REQUEST ─── */}
      <AssetPageFooter
        module={2}
        sourcePage="marketing-email-templates"
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
