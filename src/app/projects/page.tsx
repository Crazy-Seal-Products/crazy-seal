import type { Metadata } from 'next'
import { Camera, MapPin, MessageSquareQuote } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { ProjectsGallery } from '@/components/ProjectsGallery'
import { CountUp, GlowOrb } from '@/components/motion'
import { getPublishedProjects } from '@/lib/projects'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Customer Projects',
  description:
    'Real Crazy Seal roofing projects from customers across the country. Browse RV, commercial, residential, and transportation installations with progress photos.',
}

const HERO_CHIPS = [
  { icon: Camera, label: 'Progress photos' },
  { icon: MessageSquareQuote, label: 'In their own words' },
  { icon: MapPin, label: 'Across the country' },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const projects = await getPublishedProjects()

  return (
    <>
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 -top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-28 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-12 sm:px-8 md:py-16 lg:py-20 text-center">
            <h1
              {...enter(100)}
              className="animate-fade-up text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.06] mb-5"
            >
              Customer <span className="text-shimmer-highlight">Projects</span>
            </h1>
            <p
              {...enter(180)}
              className="animate-fade-up text-white/70 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-pretty"
            >
              Every roof tells a story. Browse real installs from RV owners, businesses, and
              homeowners — with progress photos and their own words.
            </p>
            <div
              {...enter(260)}
              className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
            >
              {projects.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-primary shadow-glow-highlight">
                  <CountUp value={projects.length} className="font-extrabold" />
                  documented projects
                </span>
              )}
              {HERO_CHIPS.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                    <Icon className="h-3.5 w-3.5 text-accent-light" />
                  </span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <ProjectsGallery projects={projects} initialCategory={category} />
        </div>
      </Container>

      <Container size="xl" className="sm:pt-4 md:pt-8 pb-8">
        <CtaSection />
      </Container>
    </>
  )
}
