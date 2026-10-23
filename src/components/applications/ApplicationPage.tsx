import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  Flag,
  Layers,
  Phone,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Wrench,
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
import { GlowOrb, Marquee } from '@/components/motion'
import { ProblemToFix } from '@/components/applications/ProblemToFix'
import { ApplicationIcon } from '@/components/applications/applicationIcons'
import {
  APPLICATIONS,
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

const HERO_TRUST = [
  { icon: ShieldCheck, label: '50 Year Warranty' },
  { icon: Flag, label: 'Made in America' },
  { icon: Truck, label: 'Ships to your door' },
]

const SYSTEM_POINTS = [
  '3-part system: problem areas sealed first, then one seamless membrane',
  'Simple enough for just about anyone to install',
  'Backed by our 50 year warranty',
  'A support team that answers the phone',
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

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
  const others = APPLICATIONS.filter((a) => a.family !== config.family)
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
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-80 w-80" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-12 md:px-8 md:py-14 lg:px-12 lg:py-18">
            <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <nav
                  {...enter(0)}
                  aria-label="Breadcrumb"
                  className="animate-fade-up mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/60"
                >
                  <ApplicationIcon slug={config.slug} className="h-3.5 w-3.5 text-highlight" />
                  <Link href="/applications" className="hover:text-highlight transition-colors">
                    Applications
                  </Link>
                  <ChevronRight className="w-3 h-3 text-white/40" />
                  <Link href={family.hubHref} className="hover:text-highlight transition-colors">
                    {family.hubLabel}
                  </Link>
                </nav>
                <h1
                  {...enter(100)}
                  className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.06] mb-4 text-balance"
                >
                  {config.h1}
                </h1>
                <p
                  {...enter(180)}
                  className="animate-fade-up text-xl sm:text-2xl font-bold leading-snug mb-7 text-balance"
                >
                  <span className="text-shimmer-highlight">{config.tagline}</span>
                </p>
                <div
                  {...enter(260)}
                  className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-3"
                >
                  <LinkButton href={`/kit-builder#${family.storeAnchor}`} variant="accent" size="lg">
                    <ShoppingCart className="w-5 h-5" />
                    Shop Kits
                  </LinkButton>
                  <LinkButton href="/kit-builder" variant="white" size="lg">
                    Build My Kit
                  </LinkButton>
                </div>
                <ul
                  {...enter(340)}
                  className="animate-fade-up mt-8 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3"
                >
                  {HERO_TRUST.map(({ icon: Icon, label }) => (
                    <li key={label} className="flex items-center gap-2 text-sm font-medium text-white/75">
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                        <Icon className="h-3.5 w-3.5 text-accent-light" />
                      </span>
                      {label}
                    </li>
                  ))}
                </ul>
              </div>

              <div {...enter(200)} className="animate-fade-up relative">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
                />
                <div className="relative rounded-2xl shadow-2xl ring-1 ring-white/15">
                  <ProYouTubeEmbed halo={false}
                    videoId={family.heroVideoId}
                    thumbnail={family.heroVideoThumbnail}
                    title="The Crazy Seal Roofing System"
                  />
                </div>
                <p className="relative text-center text-white/70 text-sm font-medium mt-3">
                  {family.heroVideoCaption}
                </p>
                <div
                  className="hidden md:flex absolute -right-4 -top-5 items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-bold text-primary shadow-glow-highlight animate-float"
                  style={{ animationDelay: '-3.5s' }}
                >
                  <Layers className="h-4 w-4" />
                  Fiber-infused silicone
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── APPLICATION-SPECIFIC PROBLEM ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
              />
              <div className="group relative overflow-hidden rounded-2xl shadow-xl ring-1 ring-primary/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={family.problemImage}
                  alt={`${config.h1} sealed with Crazy Seal`}
                  className="w-full h-auto transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
              <div className="hidden sm:flex absolute -left-4 -bottom-5 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-2xl ring-1 ring-primary/10 animate-float">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div className="text-left leading-tight">
                  <p className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">50 Years</p>
                  <p className="text-xs font-medium text-gray-500">Warranty coverage</p>
                </div>
              </div>
            </div>
            <div>
              <SectionHeading heading={config.problemHeading} align="left" className="mb-5 md:mb-6" />
              <ProblemToFix paragraphs={config.problemParagraphs} />
            </div>
          </div>
          <div className="mt-10 md:mt-12 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-4 sm:p-5 md:p-6 ring-1 ring-primary/[0.06]">
            <h3 className="flex items-center gap-2 font-extrabold text-primary mb-4 px-1">
              <Wrench className="h-4 w-4 text-accent" />
              Crazy Seal is perfect for:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.whoBullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 text-gray-700 leading-relaxed shadow-sm ring-1 ring-primary/[0.06] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      {/* ─── WHAT IS CRAZY SEAL + BADGES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="relative md:order-2">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/15 via-transparent to-secondary/20 blur-xl"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${MEDIA}/2022/03/09-3-Pieces-System-1024x576.jpg`}
                alt="The Crazy Seal 3 part sealing system"
                className="relative rounded-2xl shadow-xl ring-1 ring-primary/10 w-full h-auto"
              />
            </div>
            <div className="md:order-1">
              <SectionHeading
                eyebrow="DIY Roofing Done Right"
                heading="What is Crazy Seal?"
                align="left"
                className="mb-4"
              />
              <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-5">
                A fluid-applied, seamless roofing system that permanently seals flat and low-slope
                roofs — the only membrane on the market strengthened with polyethylene fibers, like
                rebar in concrete.
              </p>
              <ul className="space-y-2.5 mb-7">
                {SYSTEM_POINTS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-accent-dark">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <LinkButton href="/crazy-seal" variant="primary" size="md">
                Learn More About Our System
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 pt-10 md:pt-12">
            {BADGES.map((badge) => (
              <div
                key={badge.label}
                className="group flex flex-col items-center text-center gap-3 rounded-3xl bg-gradient-to-b from-slate-50 to-white px-3 py-5 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg last:col-span-2 sm:last:col-span-1"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={badge.image}
                  alt={badge.label}
                  className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3"
                />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
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
          <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
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
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8">
              <LinkButton href="/kit-builder" variant="white" size="md">
                Build My Kit in 60 Seconds
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-white/80 hover:text-white text-sm font-semibold ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <Phone className="w-4 h-4 text-accent-light" />
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
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="You Can Buy Cheaper. You Can't Buy Better."
            heading="Why Crazy Seal?"
            subheading="Forged from thousands of flat roof installs. See why fiber-infused silicone succeeds where cheap coatings fail."
            variant="dark"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {WHY_CRAZY_SEAL_VIDEOS.slice(0, 2).map((v) => (
              <div
                key={v.videoId}
                className="rounded-3xl bg-white/[0.06] p-2.5 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <ProYouTubeEmbed halo={false} videoId={v.videoId} thumbnail={v.thumbnail} title={v.title} />
                <p className="px-2 pt-3 pb-1 text-center text-white/75 text-sm font-semibold">{v.caption}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-8">
            <LinkButton href={REASONS_PDF_URL} variant="white" size="md" external>
              <Download className="w-4 h-4" />
              Download the 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── BEFORE / AFTER + ROOF TYPES ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Multiple Components — One Seamless System"
            heading="See the Seamless Membrane in Action"
            subheading="Drag the bar to see every penetration sealed and every inch covered by one custom-fit membrane."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {family.transformations.map((t) => (
              <figure key={t.label}>
                <BeforeAfterSlider
                  beforeSrc={t.before}
                  afterSrc={t.after}
                  aspectRatio={t.aspect ?? '16/9'}
                />
                <figcaption className="text-center text-sm font-bold text-primary mt-3">{t.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] px-4 py-4 ring-1 ring-primary/[0.06]">
            <span className="text-sm font-semibold text-gray-500 mr-1">
              Applies over all roof types:
            </span>
            {ROOF_TYPES.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-primary shadow-sm ring-1 ring-primary/[0.08]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {type}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* ─── TESTIMONIALS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Crazy Reviews" heading="Straight From the Roof" />
          <Grid responsiveCols={{ mobile: 1, tablet: 2, desktop: 4 }} gap="lg">
            {testimonials.map((t) => (
              <TestimonialCard key={t.name} name={t.name} photo={t.photo} text={t.text} />
            ))}
          </Grid>
          <div className="flex justify-center pt-8 md:pt-10">
            <LinkButton href="/reviews" variant="accent" size="md">
              See More Photos & Reviews
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── RELATED APPLICATIONS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading eyebrow="Explore More" heading={`More ${family.label} Applications`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href={family.hubHref}
              className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-lg ring-1 ring-primary/20 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-highlight/25 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-70"
              />
              <span className="relative mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 transition-transform duration-500 group-hover:-rotate-6">
                <Layers className="h-5 w-5 text-highlight" />
              </span>
              <h3 className="relative text-lg font-extrabold mb-1.5">All {family.hubLabel}</h3>
              <p className="relative text-sm text-white/70 leading-relaxed mb-5">
                The complete {family.label} roof guide — cost, install, and kits.
              </p>
              <span className="relative mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-highlight">
                Visit the Hub
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}`}
                  className="group relative flex flex-col rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                      <ApplicationIcon slug={s.slug} className="h-5 w-5" />
                    </span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:rotate-45">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-primary mb-1.5">{s.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.cardBlurb}</p>
                </Link>
            ))}
          </div>

          {others.length > 0 && (
            <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <p className="shrink-0 text-center md:text-left text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                Other applications
              </p>
              <Marquee duration={50} className="flex-1">
                {others.map((a) => (
                    <Link
                      key={a.slug}
                      href={`/${a.slug}`}
                      className="mx-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08] transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
                    >
                      <ApplicationIcon slug={a.slug} className="h-3.5 w-3.5 text-accent" />
                      {a.label}
                    </Link>
                ))}
              </Marquee>
            </div>
          )}

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

      {/* ─── LEAD CAPTURE ─── */}
      <LeadCaptureSection
        sourcePage={config.slug}
        defaultProjectType={family.leadProjectType}
        heading={`Talk to a Specialist About Your ${singular}`}
      />
    </>
  )
}
