import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Download,
  Phone,
  ShoppingCart,
} from 'lucide-react'
import {
  Container,
  Grid,
  SectionHeading,
  TestimonialCard,
  LinkButton,
} from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { RealProjectsSection, pickStrongProjects } from '@/components/RealProjectsSection'
import { ProductCard } from '@/components/store/ProductCard'
import {
  FAMILIES,
  relatedApplications,
  type ApplicationConfig,
} from '@/lib/applications/config'
import { getStoreProducts, type StoreProduct } from '@/lib/store/products'
import { getPublishedProjects } from '@/lib/projects'
import {
  testimonialsFor,
  WHY_CRAZY_SEAL_VIDEOS,
  REASONS_PDF_URL,
} from '@/lib/store/social-proof'

const MEDIA = 'https://media.crazyseal.com/site-assets/wp-media'

const BADGES = [
  { image: `${MEDIA}/2019/05/Warranty.png`, label: '50 Year Warranty' },
  { image: `${MEDIA}/2019/05/DIY.png`, label: 'Do It Yourself' },
  { image: `${MEDIA}/2019/05/RED-FLAG-1000.png`, label: 'Made in America' },
  { image: `${MEDIA}/2019/05/Satisfaction.png`, label: 'Guarantee' },
  { image: `${MEDIA}/2019/05/Quality.png`, label: 'Unmatched Quality' },
]

const ROOF_TYPES = ['TPO', 'EPDM', 'Rubber', 'Vinyl', 'Aluminum', 'Fiberglass']

/**
 * Shared template for the niche application pages (barns, box trucks, ...).
 * Renders a consistent skeleton driven by one ApplicationConfig entry:
 * hero video, application-specific problem copy, live kit cards, real
 * customer projects, before/afters, testimonials, sibling links, and a
 * lead-capture close.
 */
export async function ApplicationPage({ config }: { config: ApplicationConfig }) {
  const family = FAMILIES[config.family]
  const siblings = relatedApplications(config)
  const testimonials = testimonialsFor(family.storeCategory).slice(0, 4)

  const [storeProducts, primaryPool] = await Promise.all([
    getStoreProducts(),
    getPublishedProjects(family.projectCategory),
  ])
  let projectPool = primaryPool
  let projectsCategory = family.projectCategory
  if (projectPool.length === 0 && family.projectCategoryFallback) {
    projectPool = await getPublishedProjects(family.projectCategoryFallback)
    projectsCategory = family.projectCategoryFallback
  }
  const kits = family.kitHandles
    .map((h) => storeProducts.find((p) => p.handle === h))
    .filter((p): p is StoreProduct => Boolean(p))
  const projects = pickStrongProjects(projectPool)

  // "Barn Roofs" -> "Barn Roof" for the lead-capture heading.
  const singular = config.h1.replace(/s$/, '')

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-6 md:py-14 lg:px-8 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div className="text-center lg:text-left">
                <nav className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
                  <Link href="/applications" className="hover:text-highlight transition-colors">
                    Applications
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <Link href={family.hubHref} className="hover:text-highlight transition-colors">
                    {family.hubLabel}
                  </Link>
                </nav>
                <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                  {config.h1}
                </h1>
                <p className="text-xl sm:text-2xl font-semibold text-highlight mb-6">
                  {config.tagline}
                </p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <LinkButton href={`/kit-builder#${family.storeAnchor}`} variant="accent" size="lg">
                    <ShoppingCart className="w-5 h-5" />
                    Shop Kits
                  </LinkButton>
                  <LinkButton href="/kit-builder" variant="white" size="lg">
                    Build My Kit
                  </LinkButton>
                </div>
              </div>
              <div>
                <ProYouTubeEmbed
                  videoId={family.heroVideoId}
                  thumbnail={family.heroVideoThumbnail}
                  title="The Crazy Seal Roofing System"
                />
                <p className="text-center text-white/70 text-sm font-medium mt-2">
                  {family.heroVideoCaption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATION-SPECIFIC PROBLEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={family.problemImage}
                alt={`${config.h1} sealed with Crazy Seal`}
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading heading={config.problemHeading} align="left" className="mb-4" />
              {config.problemParagraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-gray-600 leading-relaxed mb-4">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="mt-6 md:mt-8 rounded-2xl bg-gray-50 border border-gray-200/80 p-5 md:p-6">
            <h3 className="font-bold text-primary mb-4">
              Crazy Seal is perfect for:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {config.whoBullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-gray-600 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL + BADGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-center">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/09-3-Pieces-System-1024x576.jpg`}
                alt="The Crazy Seal 3 part sealing system"
                className="rounded-2xl shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <SectionHeading heading="What is Crazy Seal?" align="left" className="mb-4" />
              <p className="text-gray-600 leading-relaxed mb-4">
                The Crazy Seal Roofing System is a fluid applied, seamless
                roofing system designed to permanently seal flat and low-slope
                roofs. Our 3-part system eliminates your problem areas first,
                then locks the entire roof under a seamless, fiber-infused
                silicone membrane — the only one on the market strengthened
                with polyethylene fibers, like rebar in concrete.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                Crazy Seal takes the complex world of roofing and simplifies it
                so it can be installed by just about anyone, backed by our 50
                year warranty and a support team that answers the phone.
              </p>
              <LinkButton href="/crazy-seal" variant="primary" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-start pt-8 md:pt-10">
            {BADGES.map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={badge.image} alt={badge.label} className="h-16 w-auto object-contain" />
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  {badge.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── RECOMMENDED KITS ─── */}
      {kits.length > 0 && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
            <SectionHeading
              eyebrow="Everything Ships to Your Door"
              heading={`Kits Sized for ${config.h1}`}
              subheading={family.kitIntro}
              variant="dark"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {kits.map((kit) => (
                <ProductCard key={kit.handle} product={kit} />
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-6 md:pt-8">
              <LinkButton href="/kit-builder" variant="white" size="md">
                Build My Kit in 60 Seconds
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                Not sure on size? Call (800) 963-0131
              </a>
            </div>
          </div>
        </Container>
      )}

      {/* ─── REAL CUSTOMER PROJECTS ─── */}
      <RealProjectsSection
        projects={projects}
        browseCategory={projectsCategory}
        heading="Thousands of Real Projects Completed With Kits Like These"
      />

      {/* ─── WHY CRAZY SEAL VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="You Can Buy Cheaper. You Can't Buy Better."
            heading="Why Crazy Seal?"
            subheading="Forged from thousands of flat roofing installations. Watch why our fiber-infused system succeeds where cheap coatings fail."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {WHY_CRAZY_SEAL_VIDEOS.slice(0, 2).map((v) => (
              <div key={v.videoId}>
                <ProYouTubeEmbed videoId={v.videoId} thumbnail={v.thumbnail} title={v.title} />
                <p className="text-center text-white/70 text-sm font-medium mt-2">{v.caption}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-6 md:pt-8">
            <LinkButton href={REASONS_PDF_URL} variant="white" size="md" external>
              <Download className="w-4 h-4" />
              Download the 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── BEFORE / AFTER + ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Multiple Components — One Seamless System"
            heading="See the Seamless Membrane in Action"
            subheading="Slide the center bar back and forth to see how Crazy Seal seals every penetration and covers every inch with one custom fit membrane."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {family.transformations.map((t) => (
              <div key={t.label}>
                <BeforeAfterSlider
                  beforeSrc={t.before}
                  afterSrc={t.after}
                  aspectRatio={t.aspect ?? '16/9'}
                />
                <p className="text-center text-sm font-semibold text-gray-600 mt-2">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 md:pt-8">
            <span className="text-sm font-semibold text-gray-500 mr-1">
              Applies over all roof types:
            </span>
            {ROOF_TYPES.map((type) => (
              <span
                key={type}
                className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading eyebrow="Crazy Reviews" heading="Straight From the Roof" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
          <div className="flex justify-center pt-6 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── RELATED APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-6 sm:px-6 md:p-6 lg:p-8">
          <SectionHeading
            eyebrow="Explore More"
            heading={`More ${family.label} Applications`}
            variant="dark"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={family.hubHref}
              className="group rounded-2xl bg-accent/20 ring-1 ring-accent/40 p-5 transition-all duration-300 hover:bg-accent/30 hover:-translate-y-1"
            >
              <h3 className="font-bold text-white mb-1.5">All {family.hubLabel}</h3>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                The complete guide for {family.label.toLowerCase()} roofs — cost, install, and kits.
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                Visit the Hub
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            {siblings.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="group rounded-2xl bg-white/5 ring-1 ring-white/10 p-5 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
              >
                <h3 className="font-bold text-white mb-1.5">{s.label}</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-3">{s.cardBlurb}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-highlight group-hover:gap-2 transition-all">
                  Learn More
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

      {/* ─── LEAD CAPTURE ─── */}
      <LeadCaptureSection
        sourcePage={config.slug}
        defaultProjectType={family.leadProjectType}
        heading={`Talk to a Specialist About Your ${singular}`}
      />
    </>
  )
}
