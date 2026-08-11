import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Download,
  Droplets,
  Layers,
  PackageCheck,
  PaintRoller,
  Phone,
  Quote,
  ShieldCheck,
  Truck,
  Wrench,
} from 'lucide-react'
import { Container } from '@/lib/design-system'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { ProVimeoEmbed } from '@/components/pro/ProVimeoEmbed'
import { LeadCaptureSection } from '@/components/LeadCaptureSection'
import { FamilyApplicationsBand } from '@/components/applications/FamilyApplicationsBand'
import { ProductCard } from '@/components/store/ProductCard'
import { Stars } from '@/components/store/Stars'
import {
  ProjectCardsGrid,
  BrowseProjectsLink,
  pickStrongProjects,
} from '@/components/RealProjectsSection'
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
    title: '1. Clean',
    desc: 'Wash the roof with Crazy Clean so the membrane bonds to the roof — not the dirt.',
  },
  {
    icon: Wrench,
    title: '2. Seal',
    desc: 'Caulk and patch every seam, screw, and penetration with Crazy Caulk and Crazy Patch.',
  },
  {
    icon: PaintRoller,
    title: '3. Coat',
    desc: 'Roll on the seamless Crazy Seal membrane and never worry about that roof again.',
  },
]

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
      : { icon: CreditCard, strong: 'Split into 4 installments', rest: 'on $100\u2013$1,000 orders' },
    { icon: Truck, strong: 'Free shipping', rest: 'on orders over $500' },
    { icon: ShieldCheck, strong: '50 year warranty', rest: 'when registered' },
  ]

  return (
    <>
      <Container size="xl" className="py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
          <Link href="/applications" className="hover:text-[#003365] font-medium">
            Applications
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{family.hubLabel}</span>
        </nav>

        {/* ─── Offer panel (PDP-style two column) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: video + before/after evidence */}
          <div>
            {config.video.type === 'vimeo' ? (
              <ProVimeoEmbed
                videoId={config.video.id}
                thumbnail={config.video.thumbnail}
                title={`${config.h1} overview video`}
              />
            ) : (
              <ProYouTubeEmbed
                videoId={config.video.id}
                thumbnail={config.video.thumbnail}
                title={`${config.h1} overview video`}
              />
            )}
            <p className="text-center text-gray-500 text-sm font-medium mt-2 mb-4">
              {config.video.caption}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {family.transformations.slice(0, 2).map((t) => (
                <div key={t.label}>
                  <BeforeAfterSlider
                    beforeSrc={t.before}
                    afterSrc={t.after}
                    aspectRatio={t.aspect ?? '16/9'}
                  />
                  <p className="text-center text-xs font-semibold text-gray-500 mt-1.5">
                    {t.label} — slide to compare
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: the offer */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-2">
              The Crazy Seal Roofing System
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#003365] tracking-tight mb-3">
              {config.h1}
            </h1>
            <div className="flex items-center gap-2 mb-3">
              <Stars />
              <span className="text-sm font-medium text-gray-600">{config.installsLine}</span>
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-4">{config.tagline}</p>
            {config.pitch.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="text-gray-600 leading-relaxed mb-3">
                {paragraph}
              </p>
            ))}

            {/* Price */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
              <p className="text-xl font-bold text-[#003365]">
                Sized &amp; priced to your exact roof
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Kits scale from a single tube of caulk to a complete system for
                thousands of square feet. {config.priceNote}
              </p>
            </div>

            {/* CTAs */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href={config.primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5BA411] px-6 py-3.5 text-base font-bold text-white hover:bg-[#4c8a0e] transition-colors"
              >
                {config.primaryCta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={config.secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#003365] px-6 py-3.5 text-base font-bold text-[#003365] hover:bg-[#003365]/5 transition-colors"
              >
                {config.secondaryCta.label}
              </Link>
            </div>

            {/* Assurances */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {assurances.map((a) => (
                <div
                  key={a.strong}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3"
                >
                  <a.icon className="w-5 h-5 text-[#5BA411] flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-900">{a.strong}</span> {a.rest}
                  </p>
                </div>
              ))}
            </div>

            {/* Help */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
              <Phone className="w-5 h-5 text-[#003365] flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Questions about sizing or fit?{' '}
                <a href="tel:8009630131" className="font-semibold text-[#003365] hover:underline">
                  Call (800) 963-0131
                </a>{' '}
                — we&apos;ll make sure you get exactly what your roof needs.
              </p>
            </div>
          </div>
        </div>

        {/* ─── Why it works: transcript details + 21½ Reasons video ─── */}
        {whyPoints.length > 0 && (
          <section className="mt-16">
            <div className="relative rounded-3xl bg-primary overflow-hidden px-6 py-10 sm:p-10 lg:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(18,95,151,0.5),transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">
                    The Details That Matter
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6">
                    Why the System Works
                  </h2>
                  <ul className="space-y-4">
                    {whyPoints.map((point) => (
                      <li key={point.lead} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#5BA411] mt-0.5 flex-shrink-0" />
                        <p className="text-sm sm:text-base text-white/70 leading-relaxed">
                          <span className="font-bold text-[#F9EA1C]">{point.lead}</span>{' '}
                          {point.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="order-first lg:order-none">
                  <ProYouTubeEmbed
                    videoId={reasonsVideo.videoId}
                    thumbnail={reasonsVideo.thumbnail}
                    title={reasonsVideo.title}
                  />
                  <p className="text-center text-white/50 text-sm font-medium mt-3">
                    {reasonsVideo.caption}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── Kits ─── */}
        {kits.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-1">
                Ships Direct To Your Door
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
                {config.kitsHeading}
              </h2>
              <p className="mt-1.5 text-gray-500 max-w-2xl">{config.kitsNote}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {kits.map((kit) => (
                <ProductCard key={kit.handle} product={kit} />
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/kit-builder"
                className="inline-flex items-center gap-2 rounded-full bg-[#003365] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00274d] transition-colors"
              >
                Build a Custom Kit in 60 Seconds
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:8009630131"
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#003365] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Or call (800) 963-0131 — M-F 9AM-6PM EST
              </a>
            </div>
          </section>
        )}

        {/* ─── Real customer projects ─── */}
        {projects.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-1">
                Real Roofs. Real Results.
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
                {config.projectsHeading}
              </h2>
              <p className="mt-1.5 text-gray-500 max-w-2xl">
                These aren&apos;t stock photos — they&apos;re documented customer
                installations, in their own words and pictures.
              </p>
            </div>
            <ProjectCardsGrid projects={projects} />
            <div className="mt-6 text-center">
              <BrowseProjectsLink category={projectsCategory} />
            </div>
          </section>
        )}

        {/* ─── Reviews ─── */}
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
                Straight From the Roof
              </h2>
              <p className="mt-1.5 text-gray-500">
                Real reviews from customers who installed it themselves.
              </p>
            </div>
            <Link
              href="/reviews"
              className="flex items-center gap-1 text-sm font-semibold text-[#5BA411] hover:gap-2 transition-all"
            >
              See More Photos &amp; Reviews
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5"
              >
                <Quote className="w-5 h-5 text-[#5BA411] mb-3" />
                <p className="text-sm text-gray-600 leading-relaxed flex-1 mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  {t.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-9 h-9 rounded-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <Stars className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Why Crazy Seal videos ─── */}
        <section className="mt-16">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-1">
              Do Your Homework
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
              Why Crazy Seal?
            </h2>
            <p className="mt-1.5 text-gray-500 max-w-2xl">
              This isn&apos;t box-store roof coating. Watch what makes the system
              different — and why it costs more.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {brandVideos.map((video) => (
              <div key={video.videoId}>
                <ProYouTubeEmbed
                  videoId={video.videoId}
                  thumbnail={video.thumbnail}
                  title={video.title}
                />
                <p className="text-center text-gray-600 text-sm font-medium mt-2">
                  {video.caption}
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <a
              href={REASONS_PDF_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#003365] px-6 py-3 text-sm font-semibold text-white hover:bg-[#00274d] transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Our 21&frac12; Reasons PDF
            </a>
          </div>
        </section>

        {/* ─── How it goes down ─── */}
        <section className="mt-16">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
              How It Goes Down
            </h2>
            <p className="mt-1.5 text-gray-500 max-w-2xl">
              No torches, no tear-off, no special tools. Three steps, guided by
              step-by-step videos.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {INSTALL_STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="inline-flex rounded-full bg-[#5BA411]/10 p-3 mb-4">
                  <step.icon className="w-6 h-6 text-[#5BA411]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/installation/membrane-roof"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#003365]/20 px-6 py-3 text-sm font-semibold text-[#003365] hover:border-[#003365] hover:bg-[#003365]/5 transition-colors"
            >
              Watch the Full Installation Guide
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </Container>

      {/* ─── Specific applications + lead capture ─── */}
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
