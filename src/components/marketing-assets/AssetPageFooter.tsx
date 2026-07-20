import { ArrowRight } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ContentRequestForm } from '@/components/forms/ContentRequestForm'

const MODULE_LINKS = [
  { number: 1, label: 'Welcome', href: '/resources/welcome-to-crazy-seal' },
  { number: 2, label: 'Marketing', href: '/resources/marketing' },
  { number: 3, label: 'Sales', href: '/resources/sales' },
  { number: 4, label: 'Build a Kit', href: '/resources/building-a-kit' },
  { number: 5, label: 'Installation', href: '/resources/installation' },
  { number: 6, label: 'Warranty', href: '/resources/warranty' },
]

interface FooterLink {
  heading: string
  label: string
  href: string
}

interface AssetPageFooterProps {
  sourcePage: string
  back?: FooterLink
  next?: FooterLink
}

/**
 * Shared footer for Business Accelerator asset sub-pages: optional
 * back/continue navigation, the Module Quick Links strip, and the
 * content/feature request form.
 */
export function AssetPageFooter({ sourcePage, back, next }: AssetPageFooterProps) {
  return (
    <>
      {(back || next) && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-6 md:p-10 text-center">
            <div
              className={`grid grid-cols-1 gap-8 max-w-2xl mx-auto ${
                back && next ? 'sm:grid-cols-2' : ''
              }`}
            >
              {back && (
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                    {back.heading}
                  </h2>
                  <LinkButton href={back.href} variant="white" size="md">
                    {back.label}
                  </LinkButton>
                </div>
              )}
              {next && (
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                    {next.heading}
                  </h2>
                  <LinkButton href={next.href} variant="accent" size="md">
                    {next.label}
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                </div>
              )}
            </div>
          </div>
        </Container>
      )}

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

      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Content | Feature Request"
            heading="Request Content or a Feature"
            subheading="Have a request for marketing materials, sales resources, or something else that would support you in your business? Drop it in this form and the request will go directly to our asset creation team!"
          />
          <div className="max-w-2xl mx-auto">
            <ContentRequestForm sourcePage={sourcePage} />
          </div>
        </div>
      </Container>
    </>
  )
}
