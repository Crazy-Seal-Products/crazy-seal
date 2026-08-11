import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { Container, SectionHeading } from '@/lib/design-system'
import { categoryLabel, type Project } from '@/lib/projects'

/** Grid of documented customer-project cards (no wrapper section). */
export function ProjectCardsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p) => (
        <Link
          key={p.slug}
          href={`/project/${p.slug}/`}
          className="group rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-[#003365]/30 hover:shadow-lg transition-all duration-300"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {p.cover_photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.cover_photo}
                alt={`Project #${p.project_number}: ${p.title}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            {p.category && (
              <span className="absolute top-3 left-3 bg-[#003365] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                {categoryLabel(p.category)}
              </span>
            )}
          </div>
          <div className="p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
              Project #{p.project_number}
            </p>
            <h3 className="text-lg font-bold text-[#003365] leading-snug mb-2 group-hover:underline decoration-2 underline-offset-2">
              {p.title}
            </h3>
            {p.quote && (
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                &ldquo;{p.quote}&rdquo;
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-gray-500">
              {p.location ? (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {p.location}
                </span>
              ) : (
                <span />
              )}
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5ba411] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

/** Round pill link to the filtered projects gallery. */
export function BrowseProjectsLink({ category }: { category: string }) {
  return (
    <Link
      href={`/projects?category=${category}`}
      className="inline-flex items-center gap-2 rounded-full border-2 border-[#003365]/20 px-6 py-3 text-sm font-semibold text-[#003365] hover:border-[#003365] hover:bg-[#003365]/5 transition-colors"
    >
      Browse All Customer Projects
      <ArrowRight className="w-4 h-4" />
    </Link>
  )
}

interface RealProjectsSectionProps {
  projects: Project[]
  /** Category slug for the "Browse All" link, e.g. 'rv' */
  browseCategory: string
  heading?: string
  subheading?: string
}

/**
 * White section with documented customer-project cards and a browse-all link.
 * Shared by the application template and the pro-facing pages.
 */
export function RealProjectsSection({
  projects,
  browseCategory,
  heading = 'Thousands of Real Projects Completed With This System',
  subheading = "These aren't stock photos — they're documented customer installations, in their own words and pictures.",
}: RealProjectsSectionProps) {
  if (projects.length === 0) return null

  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
        <SectionHeading
          eyebrow="Real Roofs. Real Results."
          heading={heading}
          subheading={subheading}
        />
        <ProjectCardsGrid projects={projects} />
        <div className="pt-6 text-center">
          <BrowseProjectsLink category={browseCategory} />
        </div>
      </div>
    </Container>
  )
}

/** Pick the strongest projects: photo + real quote first, newest first. */
export function pickStrongProjects(pool: Project[], count = 3): Project[] {
  const isStrong = (p: Project) =>
    Boolean(p.cover_photo && p.quote && p.quote.trim().length > 20)
  return [...pool.filter(isStrong), ...pool.filter((p) => !isStrong(p))].slice(0, count)
}
