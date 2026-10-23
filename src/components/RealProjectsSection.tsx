import Link from 'next/link'
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { categoryLabel, type Project } from '@/lib/projects'

export type ProjectCardData = Pick<
  Project,
  'slug' | 'project_number' | 'title' | 'category' | 'location' | 'cover_photo'
> & { quote?: string | null }

/** One documented customer-project card (photo, number, title, quote, location). */
export function ProjectCard({
  project: p,
  showCategory = true,
  className = '',
}: {
  project: ProjectCardData
  showCategory?: boolean
  className?: string
}) {
  return (
    <Link
      href={`/project/${p.slug}/`}
      className={`group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {p.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.cover_photo}
            alt={`Project #${p.project_number}: ${p.title}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            No photo
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-dark/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {showCategory && p.category && (
          <span className="absolute top-3 left-3 rounded-full bg-primary/85 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm">
            {categoryLabel(p.category)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-dark mb-1.5">
          Project #{p.project_number}
        </p>
        <h3 className="text-lg font-extrabold text-primary leading-snug mb-2">{p.title}</h3>
        {p.quote && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-3">
            &ldquo;{p.quote}&rdquo;
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2 text-sm text-gray-500">
          {p.location ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" />
              {p.location}
            </span>
          ) : (
            <span />
          )}
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Grid of documented customer-project cards (no wrapper section). */
export function ProjectCardsGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
    </div>
  )
}

/** Round pill link to the filtered projects gallery. */
export function BrowseProjectsLink({ category }: { category: string }) {
  return (
    <LinkButton
      href={`/projects?category=${category}`}
      variant="outline"
      size="md"
      className="border-primary/25 text-primary"
    >
      Browse All Customer Projects
      <ArrowRight className="w-4 h-4" />
    </LinkButton>
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
  subheading = "Not stock photos — documented customer installs, in their own words and pictures.",
}: RealProjectsSectionProps) {
  if (projects.length === 0) return null

  return (
    <Container size="xl" className="sm:pt-4 md:pt-8">
      <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
        <SectionHeading
          eyebrow="Real Roofs. Real Results."
          heading={heading}
          subheading={subheading}
        />
        <ProjectCardsGrid projects={projects} />
        <div className="pt-8 text-center">
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
