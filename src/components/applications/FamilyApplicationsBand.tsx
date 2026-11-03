import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { ApplicationIcon } from '@/components/applications/applicationIcons'
import { APPLICATIONS, FAMILIES, type ApplicationFamily } from '@/lib/applications/config'

/**
 * "Browse specific applications" band for the four hub pages — links each
 * hub down to its niche application pages (barns, box trucks, ...).
 */
export function FamilyApplicationsBand({ family }: { family: ApplicationFamily }) {
  const familyConfig = FAMILIES[family]
  const apps = APPLICATIONS.filter((a) => a.family === family)
  if (apps.length === 0) return null

  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
        <SectionHeading
          eyebrow="Get Specific"
          heading={`Guides for Specific ${familyConfig.label} Applications`}
          subheading="Every roof has its own failure points. Pick yours for a guide written for it."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map(({ slug, label, cardBlurb }) => (
            <Link
              key={slug}
              href={`/${slug}`}
              className="group relative flex flex-col rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <ApplicationIcon slug={slug} className="h-5 w-5" />
                </span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-primary mb-1.5">{label}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{cardBlurb}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent-dark">
                Read the Guide
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
        <div className="flex justify-center pt-8">
          <Link
            href="/applications"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-accent-dark transition-colors"
          >
            See Every Application
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </Container>
  )
}
