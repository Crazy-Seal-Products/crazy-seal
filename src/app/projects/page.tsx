import type { Metadata } from 'next'
import { Container, SectionHeading } from '@/lib/design-system'
import { CtaSection } from '@/components/CtaSection'
import { ProjectsGallery } from '@/components/ProjectsGallery'
import { getPublishedProjects } from '@/lib/projects'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Customer Projects',
  description:
    'Real Crazy Seal roofing projects from customers across the country. Browse RV, commercial, residential, and transportation installations with progress photos.',
}

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
        <div className="section-bleed bg-primary overflow-hidden px-5 py-10 sm:px-8 md:py-14">
          <SectionHeading
            eyebrow="Real Roofs. Real Results."
            heading="Customer Projects"
            subheading="Every roof tells a story. Browse real Crazy Seal installations from RV owners, businesses, and homeowners across the country - complete with progress photos and their own words."
            level={1}
            variant="dark"
            className="mb-0"
          />
        </div>
      </Container>

      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <ProjectsGallery projects={projects} initialCategory={category} />
        </div>
      </Container>

      <Container size="xl" className="sm:pt-4 md:pt-8 pb-8">
        <CtaSection />
      </Container>
    </>
  )
}
