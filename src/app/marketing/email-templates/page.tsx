import type { Metadata } from 'next'
import { ArrowRight, Mail } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'

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

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

export default function EmailTemplatesPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                  <Mail className="w-4 h-4 text-highlight" />
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-highlight">
                    Marketing Assets
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
                  Email Templates
                </h1>
                <p className="text-white/70 text-base sm:text-lg leading-relaxed">
                  Pre-built email templates ready for your immediate use.
                  Replace the bracketed placeholders with your business
                  details and send them to your customers.
                </p>
              </div>
              <div>
                <ProVimeoEmbed
                  videoId="937522833"
                  thumbnail={`${MEDIA}/2024/04/12.jpg`}
                  title="Email Templates"
                />
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── EMAIL TEMPLATES ─── */}
      {EMAILS.map((email) => (
        <Container key={email.heading} size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight text-center mb-6">
              {email.heading}
            </h2>
            <div className="max-w-3xl mx-auto rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
              <div className="border-b border-gray-200 bg-white px-5 py-3">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-primary">Subject:</span>{' '}
                  {email.subject}
                </p>
              </div>
              <div className="p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
                {email.intro.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {email.bullets.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1.5">
                    {email.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {email.outro.map((paragraph) => (
                  <p key={paragraph} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      ))}

      {/* ─── CUSTOM EMAIL TEMPLATES CTA ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8 text-center">
          <SectionHeading heading="Want To Create Custom Email Templates?" />
          <LinkButton href="/marketing/ai-prompts" variant="primary" size="lg">
            Click Here for Crazy Seal AI Prompts
            <ArrowRight className="w-4 h-4" />
          </LinkButton>
        </div>
      </Container>

      {/* ─── BACK / CONTINUE ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Back to Marketing Page
              </h2>
              <LinkButton href="/resources/marketing" variant="white" size="md">
                Marketing
              </LinkButton>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                Continue On to Sales
              </h2>
              <LinkButton href="/resources/sales" variant="accent" size="md">
                Sales
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── MODULE QUICK LINKS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Business Accelerator Program"
            heading="Module Quick Links"
          />
          <div className="flex flex-wrap justify-center gap-3">
            {MODULE_LINKS.map((mod) => (
              <a
                key={mod.number}
                href={mod.href}
                className="group flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {mod.number}
                </span>
                <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
                  {mod.label}
                </span>
              </a>
            ))}
          </div>
          <div className="flex justify-center pt-6">
            <LinkButton href="/business-accelerator-program" variant="primary" size="md">
              Business Accelerator Home
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── CONTENT / FEATURE REQUEST ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Content | Feature Request"
            heading="Request Content or a Feature"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage="marketing-email-templates" />
          </div>
        </div>
      </Container>
    </>
  )
}
