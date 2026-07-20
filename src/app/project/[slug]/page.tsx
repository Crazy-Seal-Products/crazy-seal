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
} from 'lucide-react'
import { Container, SectionHeading, LinkButton } from '@/lib/design-system'
import { ProcessGallery } from '@/components/ProcessGallery'
import { CtaSection } from '@/components/CtaSection'
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
  },
  {
    href: '/direct-to-deck-kit/',
    title: 'Direct to Deck Kits',
    blurb: 'A special kit for sealing directly over wood decking.',
  },
  {
    href: '/build-your-own-kit/',
    title: 'Build Your Own Kit',
    blurb: 'Build a custom kit from our lineup of roofing products.',
  },
]

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

  return (
    <>
      {/* Hero */}
      <Container size="xl">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-8 md:py-14">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              {categoryLabel(project.category)} Project
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              Project #{project.project_number}: {project.title}
            </h1>
            <Link
              href="/projects/"
              className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Projects
            </Link>
          </div>
        </div>
      </Container>

      {/* Details + photos */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            <div>
              <h2 className="text-xl font-bold text-[#003365] mb-4 uppercase tracking-wide">
                Project Details
              </h2>
              <dl className="space-y-4">
                {details.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#003365]/5 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-[#003365]" />
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {label}
                      </dt>
                      <dd className="text-gray-800 font-medium">{value}</dd>
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
              <h2 className="text-xl font-bold text-[#003365] mb-1 uppercase tracking-wide">
                Project Photos
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Click on images to scroll through progress photos.
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
                <SectionHeading heading={project.spotlight_title} className="mb-8" />
              )}
              {project.story.map((section, i) => (
                <div key={i} className="mb-8 last:mb-0">
                  {section.heading && (
                    <h3 className="text-xl md:text-2xl font-bold text-[#003365] mb-3">
                      {section.heading}
                    </h3>
                  )}
                  {section.body.split('\n\n').map((para, j) => (
                    <p key={j} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                      {para}
                    </p>
                  ))}
                </div>
              ))}
              {project.quote && (
                <blockquote className="relative bg-[#003365]/[0.03] border-l-4 border-[#5ba411] rounded-r-2xl px-6 py-5 my-8">
                  <Quote className="w-6 h-6 text-[#5ba411] mb-2" />
                  <p className="text-lg md:text-xl text-[#003365] font-medium leading-relaxed italic">
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
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-10">
          <SectionHeading
            heading="Inspired to Start Your Own Project?"
            subheading="Choose a roofing kit below to get started, or talk to a Crazy Seal specialist about your application."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {KIT_LINKS.map((kit) => (
              <Link
                key={kit.href}
                href={kit.href}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 hover:ring-white/30 p-6 text-center transition-all"
              >
                <h3 className="text-lg font-bold text-white mb-2">{kit.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{kit.blurb}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f9ea1c]">
                  Learn More
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>

      {/* Related projects */}
      {related.length > 0 && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <SectionHeading
              heading={`More ${categoryLabel(project.category)} Projects`}
              className="mb-6"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              {related.map((p) => (
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
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                      Project #{p.project_number}
                    </p>
                    <h3 className="font-bold text-[#003365] leading-snug group-hover:underline decoration-2 underline-offset-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
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
