import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Package,
  User,
  Wrench,
  ArrowRight,
  ArrowLeft,
  Quote,
  Images,
  Layers,
  Hammer,
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProcessGallery } from '@/components/ProcessGallery'
import { CtaSection } from '@/components/CtaSection'
import { ProjectCard } from '@/components/RealProjectsSection'
import { GlowOrb } from '@/components/motion'
import { getProjectBySlug, getPublishedProjects, categoryLabel } from '@/lib/projects'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return { title: 'Project Not Found' }
  return {
    title: `Project #${project.project_number}: ${project.title}`,
    description: `${project.project_type || 'Crazy Seal roofing project'}${project.location ? ` in ${project.location}` : ''}. See progress photos and results from this real customer installation.`,
  }
}

const KIT_LINKS = [
  {
    href: '/double-layer-kit/',
    title: 'Double Layer Kits',
    blurb: 'Our most popular kit with double layer protection.',
    icon: Layers,
  },
  {
    href: '/direct-to-deck-kit/',
    title: 'Direct to Deck Kits',
    blurb: 'A special kit for sealing directly over wood decking.',
    icon: Package,
  },
  {
    href: '/build-your-own-kit/',
    title: 'Build Your Own Kit',
    blurb: 'Build a custom kit from our lineup of roofing products.',
    icon: Hammer,
  },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  // Related: latest other projects in same category
  const related = (await getPublishedProjects(project.category || undefined))
    .filter((p) => p.slug !== project.slug)
    .slice(0, 3)

  const details = [
    { icon: Wrench, label: 'Project Type', value: project.project_type },
    { icon: Package, label: 'Products Used', value: project.products_used },
    { icon: User, label: 'Customer Type', value: project.customer_type },
    { icon: MapPin, label: 'Location', value: project.location },
  ].filter((d) => d.value)

  const heroChips = [
    project.location && { icon: MapPin, label: project.location },
    project.photo_urls.length > 0 && {
      icon: Images,
      label: `${project.photo_urls.length} progress photo${project.photo_urls.length === 1 ? '' : 's'}`,
    },
  ].filter((c): c is { icon: typeof MapPin; label: string } => Boolean(c))

  return (
    <>
      {/* Hero */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 -top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-28 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          {project.cover_photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.cover_photo}
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12] mix-blend-luminosity [mask-image:linear-gradient(to_bottom,black,transparent)]"
            />
          )}
          <div className="relative z-10 px-5 py-12 sm:px-8 md:py-16 lg:py-20">
            <div className="max-w-3xl mx-auto text-center">
              <h1
                {...enter(100)}
                className="animate-fade-up text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 text-balance"
              >
                <span className="text-shimmer-highlight">Project #{project.project_number}:</span>{' '}
                {project.title}
              </h1>
              {heroChips.length > 0 && (
                <ul
                  {...enter(180)}
                  className="animate-fade-up mb-6 flex flex-wrap justify-center gap-x-6 gap-y-3"
                >
                  {heroChips.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                        <Icon className="h-3.5 w-3.5 text-accent-light" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              )}
              <div {...enter(240)} className="animate-fade-up">
                <Link
                  href="/projects/"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/70 ring-1 ring-white/10 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                  Back to All Projects
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Details + photos */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            <div>
              <h2 className="text-xl font-extrabold text-primary mb-5 tracking-tight">
                Project Details
              </h2>
              <dl className="space-y-3">
                {details.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="group flex items-start gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 ring-1 ring-primary/[0.08] shadow-sm"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-gray-400">
                        {label}
                      </dt>
                      <dd className="text-gray-800 font-semibold">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <div className="mt-6">
                <LinkButton href="/ordering/" variant="primary" size="md">
                  How to Buy a Kit
                  <ArrowRight className="w-4 h-4" />
                </LinkButton>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h2 className="text-xl font-extrabold text-primary mb-1 tracking-tight">
                Project Photos
              </h2>
              <p className="text-sm text-gray-500 mb-5">
                Click any image to scroll through the progress photos.
              </p>
              <ProcessGallery
                images={project.photo_urls.map((src, i) => ({
                  src,
                  alt: `Project #${project.project_number} photo ${i + 1}`,
                }))}
                cols={3}
              />
            </div>
          </div>
        </div>
      </Container>

      {/* Story */}
      {(project.spotlight_title || project.story.length > 0) && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-10 lg:p-12">
            <div className="max-w-3xl mx-auto">
              {project.spotlight_title && (
                <SectionHeading
                  eyebrow="Customer Spotlight"
                  heading={project.spotlight_title}
                  className="mb-8"
                />
              )}
              {project.story.map((section, i) => (
                <div key={i} className="mb-8 last:mb-0">
                  {section.heading && (
                    <h3 className="flex items-center gap-3 text-xl md:text-2xl font-extrabold text-primary mb-3">
                      <span className="h-6 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-accent-light to-accent-dark" />
                      {section.heading}
                    </h3>
                  )}
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} className="text-gray-600 text-base md:text-lg leading-relaxed mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              ))}
              {project.quote && (
                <blockquote className="relative my-10 overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary px-6 py-8 sm:px-10 sm:py-10 shadow-xl">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-highlight/20 blur-3xl"
                  />
                  <Quote className="relative w-9 h-9 text-highlight mb-3 rotate-180" />
                  <p className="relative text-lg md:text-xl text-white font-medium leading-relaxed italic">
                    &ldquo;{project.quote}&rdquo;
                  </p>
                </blockquote>
              )}
            </div>
          </div>
        </Container>
      )}

      {/* Kit chooser */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-10 lg:p-12">
          <SectionHeading
            eyebrow="Your Turn"
            heading="Inspired to Start Your Own Project?"
            subheading="Pick a kit to get started, or talk to a Crazy Seal specialist about your application."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {KIT_LINKS.map((kit) => (
              <Link
                key={kit.href}
                href={kit.href}
                className="group relative overflow-hidden rounded-3xl bg-white/[0.06] p-6 lg:p-8 text-center ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-gradient-to-b from-accent/30 to-transparent blur-2xl opacity-50 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="relative mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                  <kit.icon className="h-7 w-7 text-highlight" />
                </span>
                <h3 className="relative text-lg font-extrabold text-white mb-2">{kit.title}</h3>
                <p className="relative text-white/65 text-sm leading-relaxed mb-5">{kit.blurb}</p>
                <span className="relative inline-flex items-center gap-1.5 text-sm font-bold text-highlight">
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* Related projects */}
      {related.length > 0 && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
            <SectionHeading
              eyebrow="Keep Browsing"
              heading={`More ${categoryLabel(project.category)} Projects`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={{ ...p, quote: null }} showCategory={false} />
              ))}
            </div>
          </div>
        </Container>
      )}

      <Container size="xl" className="sm:pt-4 md:pt-8 pb-8">
        <CtaSection />
      </Container>
    </>
  )
}
