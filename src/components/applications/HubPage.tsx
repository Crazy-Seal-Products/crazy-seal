import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  Droplets,
  Layers,
  PackageCheck,
  PaintRoller,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react'
import { Container, SectionHeading, TestimonialCard, LinkButton } from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { FamilyApplicationsBand } from '@/components/applications/FamilyApplicationsBand'
import {} from '@/components/applications/applicationIcons'
import { ProductCard } from '@/components/store/ProductCard'
import { Stars } from '@/components/store/Stars'
import { RealProjectsSection, pickStrongProjects } from '@/components/RealProjectsSection'
import { GlowOrb } from '@/components/motion'
import { FAMILIES, type ApplicationFamily } from '@/lib/applications/config'
import { getStoreProducts, type StoreProduct } from '@/lib/store/products'
import { getPublishedProjects } from '@/lib/projects'
import {
  testimonialsFor,
  whyItWorksFor,
  WHY_CRAZY_SEAL_VIDEOS,
  REASONS_PDF_URL,
} from '@/lib/store/social-proof'

export interface HubPageConfig {
  family: ApplicationFamily
  /** H1, e.g. "RV Roofing" */
  h1: string
  /** Highlight line under the stars, e.g. "The last roof your RV will ever need." */
  tagline: string
  /** Line next to the stars, e.g. "Thousands of successful RV installations" */
  installsLine: string
  /** Direct pitch paragraphs — "Crazy Seal is awesome, here's the deal" */
  pitch: string[]
  /** Audience-specific sentence in the "sized & priced to your roof" box */
  priceNote: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  video: { type: 'youtube' | 'vimeo'; id: string; thumbnail: string; caption: string }
  /** Swap the "4 installments" assurance for something audience-appropriate */
  stagedAssurance?: boolean
  kitsHeading: string
  kitsNote: string
  projectsHeading: string
  sourcePage: string
  leadHeading: string
  leadSubheading: string
}

const INSTALL_STEPS = [
  {
    icon: Droplets,
    title: 'Clean',
    desc: 'Wash the roof with Crazy Clean so the membrane bonds to the roof — not the dirt.',
  },
  {
    icon: Wrench,
    title: 'Seal',
    desc: 'Caulk and patch every seam, screw, and penetration with Crazy Caulk and Crazy Patch.',
  },
  {
    icon: PaintRoller,
    title: 'Coat',
    desc: 'Roll on the seamless Crazy Seal membrane and never worry about that roof again.',
  },
]

// CSS entrance (runs before hydration, so the hero never flashes empty)
const enter = (delayMs: number) => ({
  className: 'animate-fade-up',
  style: { animationDelay: `${delayMs}ms` },
})

/**
 * PDP-style application hub page: offer panel up top (video, stars, pitch,
 * live price, contact / kit-builder CTAs), then the same proof sections the
 * store product pages use.
 */
export async function HubPage({ config }: { config: HubPageConfig }) {
  const family = FAMILIES[config.family]

  const [storeProducts, ownProjects] = await Promise.all([
    getStoreProducts(),
    getPublishedProjects(family.projectCategory),
  ])
  const kits = family.kitHandles
    .map((h) => storeProducts.find((p) => p.handle === h))
    .filter((p): p is StoreProduct => Boolean(p))

  let projectPool = ownProjects
  let projectsCategory = family.projectCategory
  if (ownProjects.length < 3 && family.projectCategoryFallback) {
    projectPool = await getPublishedProjects(family.projectCategoryFallback)
    projectsCategory = family.projectCategoryFallback
  }
  const projects = pickStrongProjects(projectPool)

  const flagship = kits[0]
  const whyPoints = flagship ? whyItWorksFor(flagship) : []
  const testimonials = testimonialsFor(family.storeCategory).slice(0, 4)

  // 21½ Reasons is featured in the "Why It Works" band; the rest go below.
  const [reasonsVideo, ...brandVideos] = WHY_CRAZY_SEAL_VIDEOS

  const assurances = [
    { icon: PackageCheck, strong: 'In-stock & ready to ship', rest: 'from our USA facility' },
    config.stagedAssurance
      ? { icon: Layers, strong: 'Install in stages', rest: 'as your budget allows' }
      : { icon: CreditCard, strong: 'Split into 4 installments', rest: 'on $100–$1,000 orders' },
    { icon: Truck, strong: 'Free shipping', rest: 'on orders over $500' },
    { icon: ShieldCheck, strong: '50 year warranty', rest: 'when registered' },
  ]

  return (
    <>
      {/* ─── HERO / OFFER PANEL ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <GlowOrb className="-left-32 top-10 h-96 w-96" color="rgb(26 123 196 / 0.45)" />
          <GlowOrb className="-right-24 -bottom-24 h-96 w-96" color="rgb(91 164 17 / 0.25)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />

          <div className="relative z-10 px-5 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:px-12 lg:py-14">
            {/* Breadcrumb */}
            <nav
              {...enter(0)}
              aria-label="Breadcrumb"
              className="animate-fade-up mb-6 flex flex-wrap items-center justify-center lg:justify-start gap-1.5 text-sm text-white/60"
            >
              <Link href="/applications" className="hover:text-white font-medium transition-colors">
                Applications
              </Link>
              <ChevronRight className="w-4 h-4 text-white/35" />
              <span className="text-white font-semibold">{family.hubLabel}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 items-start">
              {/* Headline */}
              <div className="text-center lg:text-left lg:col-start-1 lg:row-start-1">
                <h1
                  {...enter(120)}
                  className="animate-fade-up text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold text-white tracking-tight leading-[1.06] mb-4 text-balance"
                >
                  {config.h1}
                </h1>
                <div
                  {...enter(180)}
                  className="animate-fade-up flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4"
                >
                  <Stars />
                  <span className="text-sm font-medium text-white/70">{config.installsLine}</span>
                </div>
                <p
                  {...enter(240)}
                  className="animate-fade-up text-xl sm:text-2xl font-bold leading-snug text-balance"
                >
                  <span className="text-shimmer-highlight">{config.tagline}</span>
                </p>
              </div>

              {/* Media: video + before/after evidence */}
              <div {...enter(200)} className="animate-fade-up relative lg:col-start-2 lg:row-start-1 lg:row-span-2">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/30 via-secondary/20 to-accent/30 blur-2xl"
                />
                <div className="relative rounded-2xl shadow-2xl ring-1 ring-white/15">
                  {config.video.type === 'vimeo' ? (
                    <ProVimeoEmbed halo={false}
                      videoId={config.video.id}
                      thumbnail={config.video.thumbnail}
                      title={`${config.h1} overview video`}
                    />
                  ) : (
                    <ProYouTubeEmbed halo={false}
                      videoId={config.video.id}
                      thumbnail={config.video.thumbnail}
                      title={`${config.h1} overview video`}
                    />
                  )}
                </div>
                <p className="relative text-center text-white/70 text-sm font-medium mt-3 mb-5">
                  {config.video.caption}
                </p>
                <div className="relative grid grid-cols-2 gap-3">
                  {family.transformations.slice(0, 2).map((t) => (
                    <figure
                      key={t.label}
                      className="rounded-2xl bg-white/[0.06] p-1.5 ring-1 ring-white/10 backdrop-blur-sm"
                    >
                      <BeforeAfterSlider
                        beforeSrc={t.before}
                        afterSrc={t.after}
                        aspectRatio={t.aspect ?? '16/9'}
                      />
                      <figcaption className="text-center text-[11px] sm:text-xs font-semibold text-white/65 mt-1.5 mb-0.5">
                        {t.label} — slide to compare
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>

              {/* The offer */}
              <div className="lg:col-start-1 lg:row-start-2">
                {config.pitch.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-white/75 text-base sm:text-lg leading-relaxed mb-3 text-center lg:text-left"
                  >
                    {paragraph}
                  </p>
                ))}

                {/* Price */}
                <div className="mt-5 flex items-start gap-4 rounded-2xl bg-white/[0.07] px-5 py-4 ring-1 ring-white/15 backdrop-blur-sm">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-highlight to-highlight-dark text-primary shadow-glow-highlight">
                    <Ruler className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-lg sm:text-xl font-extrabold text-white">
                      Sized &amp; priced to your exact roof
                    </p>
                    <p className="text-sm text-white/65 mt-1 leading-relaxed">
                      From a single tube of caulk to a complete system for thousands of square
                      feet. {config.priceNote}
                    </p>
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LinkButton href={config.primaryCta.href} variant="accent" size="lg" className="w-full py-3.5">
                    {config.primaryCta.label}
                    <ArrowRight className="w-4 h-4" />
                  </LinkButton>
                  <LinkButton href={config.secondaryCta.href} variant="outline-white" size="lg" className="w-full py-3.5">
                    {config.secondaryCta.label}
                  </LinkButton>
                </div>

                {/* Assurances */}
                <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                  {assurances.map((a) => (
                    <li key={a.strong} className="flex items-center gap-3 text-sm text-white/65">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/20 ring-1 ring-accent/40">
                        <a.icon className="h-4 w-4 text-accent-light" />
                      </span>
                      <span>
                        <span className="font-semibold text-white">{a.strong}</span> {a.rest}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Help */}
                <a
                  href="tel:8009630131"
                  className="group mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.05] px-4 py-3.5 ring-1 ring-white/10 transition-all duration-300 hover:bg-white/[0.09] hover:ring-white/25"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                    <Phone className="h-4 w-4 text-highlight" />
                  </span>
                  <span className="text-sm text-white/70">
                    Questions about sizing or fit?{' '}
                    <span className="font-bold text-white group-hover:text-highlight transition-colors">
                      Call (800) 963-0131
                    </span>{' '}
                    — we&apos;ll make sure you get exactly what your roof needs.
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ─── WHY IT WORKS: transcript details + 21½ Reasons video ─── */}
      {whyPoints.length > 0 && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
              <div>
                <SectionHeading
                  eyebrow="The Details That Matter"
                  heading="Why the System Works"
                  align="left"
                  className="mb-6"
                />
                <ul className="space-y-3">
                  {whyPoints.map((point) => (
                    <li
                      key={point.lead}
                      className="group flex gap-4 rounded-2xl bg-gradient-to-b from-slate-50 to-white p-4 ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                        <Check className="h-5 w-5" strokeWidth={3} />
                      </span>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        <span className="font-extrabold text-primary">{point.lead}</span>{' '}
                        {point.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative order-first lg:order-none">
                <div
                  aria-hidden="true"
                  className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-secondary/15 via-transparent to-accent/20 blur-xl"
                />
                <div className="relative rounded-2xl shadow-xl ring-1 ring-primary/10">
                  <ProYouTubeEmbed halo={false}
                    videoId={reasonsVideo.videoId}
                    thumbnail={reasonsVideo.thumbnail}
                    title={reasonsVideo.title}
                  />
                </div>
                <p className="relative text-center text-gray-500 text-sm font-semibold mt-3">
                  {reasonsVideo.caption}
                </p>
              </div>
            </div>
          </div>
        </Container>
      )}

      {/* ─── KITS ─── */}
      {kits.length > 0 && (
        <Container size="xl" className="sm:pt-4 md:pt-8">
          <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
            <SectionHeading
              eyebrow="Ships Direct To Your Door"
              heading={config.kitsHeading}
              subheading={config.kitsNote}
              variant="dark"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {kits.map((kit) => (
                <ProductCard key={kit.handle} product={kit} />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <LinkButton href="/kit-builder" variant="white" size="md">
                Build a Custom Kit in 60 Seconds
                <ArrowRight className="w-4 h-4" />
              </LinkButton>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 ring-1 ring-white/10 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-accent-light" />
                Or call (800) 963-0131 — M-F 9AM-6PM EST
              </a>
            </div>
          </div>
        </Container>
      )}

      {/* ─── REAL CUSTOMER PROJECTS ─── */}
      <RealProjectsSection
        projects={projects}
        browseCategory={projectsCategory}
        heading={config.projectsHeading}
      />

      {/* ─── REVIEWS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6 md:mb-10">
            <SectionHeading
              eyebrow="Crazy Reviews"
              heading="Straight From the Roof"
              subheading="Real reviews from customers who installed it themselves."
              align="left"
              className="mb-0 md:mb-0"
            />
            <Link
              href="/reviews"
              className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-accent-dark hover:text-accent transition-colors"
            >
              See More Photos &amp; Reviews
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <TestimonialCard
                key={t.name}
                name={t.name}
                photo={t.photo}
                text={t.text}
                className="p-5 md:p-6"
              />
            ))}
          </div>
        </div>
      </Container>

      {/* ─── WHY CRAZY SEAL VIDEOS ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="Do Your Homework"
            heading="Why Crazy Seal?"
            subheading="This isn't box-store roof coating. See what makes the system different — and why it costs more."
            variant="dark"
          />
          <div className="grid grid-cols-1 gap-4 lg:gap-6 md:grid-cols-2">
            {brandVideos.map((video) => (
              <div
                key={video.videoId}
                className="rounded-3xl bg-white/[0.06] p-2.5 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:bg-white/[0.09] hover:ring-white/25"
              >
                <ProYouTubeEmbed halo={false}
                  videoId={video.videoId}
                  thumbnail={video.thumbnail}
                  title={video.title}
                />
                <p className="px-2 pt-3 pb-1 text-center text-white/75 text-sm font-semibold">
                  {video.caption}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <LinkButton href={REASONS_PDF_URL} variant="white" size="md" external>
              <Download className="w-4 h-4" />
              Download Our 21&frac12; Reasons PDF
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── HOW IT GOES DOWN ─── */}
      <Container size="xl" className="sm:pt-4 md:pt-8">
        <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <SectionHeading
            eyebrow="No Torches. No Tear-Off."
            heading="How It Goes Down"
            subheading="No special tools. Three steps, guided by step-by-step videos."
          />
          <div className="relative">
            <div
              aria-hidden="true"
              className="hidden sm:block absolute left-[16%] right-[16%] top-12 h-0.5 rounded-full bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0"
            />
            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              {INSTALL_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 text-center ring-1 ring-primary/[0.08] shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 text-[5.5rem] font-black leading-none text-primary/[0.04] font-[family-name:var(--font-display)]"
                  >
                    0{i + 1}
                  </span>
                  <span className="relative mx-auto mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="relative text-lg font-extrabold text-primary mb-1.5">
                    {i + 1}. {step.title}
                  </h3>
                  <p className="relative text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/installation/membrane-roof" variant="outline" size="md" className="border-primary/25 text-primary">
              <Sparkles className="w-4 h-4 text-accent" />
              Watch the Full Installation Guide
              <ArrowRight className="w-4 h-4" />
            </LinkButton>
          </div>
        </div>
      </Container>

      {/* ─── SPECIFIC APPLICATIONS + LEAD CAPTURE ─── */}
      <FamilyApplicationsBand family={config.family} />
      <LeadCaptureSection
        sourcePage={config.sourcePage}
        defaultProjectType={family.leadProjectType}
        heading={config.leadHeading}
        subheading={config.leadSubheading}
      />
    </>
  )
}
