import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
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
      <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
        <SectionHeading
          eyebrow="Get Specific"
          heading={`Guides for Specific ${familyConfig.label} Applications`}
          subheading="Every roof has its own failure points. Pick your exact application for a guide written for it."
          variant="dark"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={`/${app.slug}`}
              className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
            >
              <h3 className="font-bold text-white mb-1.5">{app.label}</h3>
              <p className="text-sm text-white/60 leading-relaxed mb-3">{app.cardBlurb}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                Read the Guide
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
        <div className="flex justify-center pt-6 md:pt-8">
          <Link
            href="/applications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
          >
            See Every Application
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Container>
  )
}
