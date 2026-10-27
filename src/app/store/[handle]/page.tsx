import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Phone,
  PackageCheck,
  CreditCard,
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Quote,
  Droplets,
  Wrench,
  PaintRoller,
  Download,
  Check,
} from 'lucide-react'
import { Container, YouTubeEmbed } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { getShopProducts, getStoreProduct, type StoreProduct } from '@/lib/store/products'
import { RETIRED_HANDLES, STORE_CATEGORIES } from '@/lib/store/config'
import {
  testimonialsFor,
  projectCategoryFor,
  whyItWorksFor,
  WHY_CRAZY_SEAL_VIDEOS,
  REASONS_PDF_URL,
  COMPANION_REASONS,
  defaultCompanionsFor,
} from '@/lib/store/social-proof'
import { getPublishedProjects, categoryLabel, type Project } from '@/lib/projects'
import { ProductDetail } from '@/components/store/ProductDetail'
import { ProYouTubeEmbed } from '@/components/pro/ProYouTubeEmbed'
import { Stars } from '@/components/store/Stars'
import {
  CompanionProducts,
  type CompanionItem,
} from '@/components/store/CompanionProducts'

export const revalidate = 300

interface PageProps {
  params: Promise<{ handle: string }>
}

const ASSURANCES = [
  { icon: PackageCheck, strong: 'In-stock & ready to ship', rest: 'from our USA facility' },
  { icon: CreditCard, strong: 'Split into 4 installments', rest: 'on $100–$1,000 orders' },
  { icon: Truck, strong: 'Free shipping', rest: 'on orders over $500' },
  { icon: ShieldCheck, strong: '50 year warranty', rest: 'when registered' },
]

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

function installGuideHref(product: StoreProduct): string {
  if (product.handle.includes('direct-to-deck')) return '/installation/direct-to-deck'
  if (product.category === 'products' || product.category === 'extras') return '/installation'
  return '/installation/membrane-roof'
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const product = await getStoreProduct(handle)
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.displayTitle} | Store`,
    description: product.blurb,
    openGraph: product.featuredImage ? { images: [product.featuredImage] } : undefined,
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { handle } = await params
  // Retired flat-roof / commercial kits: the Kit Builder covers those roofs now.
  if (RETIRED_HANDLES.has(handle)) redirect('/kit-builder/')
  const product = await getStoreProduct(handle)
  if (!product) notFound()

  const category = STORE_CATEGORIES.find((c) => c.id === product.category)
  const isKit = product.category !== 'products' && product.category !== 'extras'
  const allProducts = await getShopProducts()

  // ─── Companion cross-sell ("Complete Your System") ───
  const companionHandles = product.companions ?? defaultCompanionsFor(product)
  const companions: CompanionItem[] = companionHandles
    .map((h) => allProducts.find((p) => p.handle === h))
    .filter((p): p is StoreProduct => Boolean(p))
    .map((p) => ({
      handle: p.handle,
      title: p.displayTitle,
      image: p.featuredImage,
      reason: COMPANION_REASONS[p.handle] ?? p.blurb,
      price: p.priceMin,
      priceMax: p.priceMax,
      variantId: p.variants.length === 1 ? p.variants[0].id : null,
      variantTitle: p.variants.length === 1 ? p.variants[0].title : '',
    }))

  // ─── Real customer projects, matched to this product's audience ───
  // Hand-picked slugs win; otherwise pick the newest projects in the matching
  // category, preferring ones with a photo and a real customer quote.
  const projectCategory = projectCategoryFor(product)
  let projects: Project[] = []
  if (product.featuredProjects?.length) {
    const all = await getPublishedProjects()
    projects = product.featuredProjects
      .map((slug) => all.find((p) => p.slug === slug))
      .filter((p): p is Project => Boolean(p))
      .slice(0, 3)
  } else if (projectCategory) {
    const pool = await getPublishedProjects(projectCategory)
    const isStrong = (p: Project) => Boolean(p.cover_photo && p.quote && p.quote.trim().length > 20)
    projects = [...pool.filter(isStrong), ...pool.filter((p) => !isStrong(p))].slice(0, 3)
  }

  const whyPoints = whyItWorksFor(product)
  // The primary product video is featured in the "Why This Kit Works" band;
  // any remaining videos stay in "See It In Action".
  const heroVideoId: string | undefined = product.youtubeIds[0]
  const extraVideoIds = product.youtubeIds.slice(1)
  const testimonials = testimonialsFor(product.category)
  const brandVideos = WHY_CRAZY_SEAL_VIDEOS.filter(
    (v) => !product.youtubeIds.includes(v.videoId)
  )

  return (
    <Container size="xl" className="pt-4 sm:pt-0">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="animate-fade-up mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-500 md:mb-5"
      >
        <Link href="/kit-builder" className={CRUMB}>
          Store
        </Link>
        {category && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-300" />
            <Link href={`/kit-builder#${category.id}`} className={CRUMB}>
              {category.label}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 text-gray-300" />
        <span className="min-w-0 truncate font-medium text-gray-700">{product.displayTitle}</span>
      </nav>

      {/* Main product card (not a .section-bleed, so the buy box never waits on scroll reveal) */}
      <div className="-mx-5 border-y border-primary/[0.07] bg-white px-5 py-6 sm:mx-0 sm:rounded-[1.75rem] sm:border sm:px-6 sm:shadow-card md:p-8 lg:p-10">
        <ProductDetail product={product}>
          {/* Assurance stack */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ASSURANCES.map((a) => (
              <div
                key={a.strong}
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-b from-slate-50 to-white px-3.5 py-3 ring-1 ring-primary/[0.07] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <a.icon className="h-4 w-4" />
                </span>
                <p className="text-xs leading-snug text-gray-600">
                  <span className="block font-semibold text-gray-900">{a.strong}</span>
                  {a.rest}
                </p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="prose prose-sm mt-8 max-w-none border-t border-primary/[0.06] pt-6 text-sm leading-relaxed text-gray-600 sm:text-[15px] [&_a]:font-semibold [&_a]:text-secondary [&_a:hover]:underline [&_h1]:mb-2 [&_h1]:mt-5 [&_h1]:text-lg [&_h1]:font-extrabold [&_h1]:text-primary [&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-extrabold [&_h2]:text-primary [&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-primary [&_li]:marker:text-accent [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_strong]:text-gray-900 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {/* Help */}
          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/[0.04] via-white to-accent/[0.06] px-4 py-3.5 ring-1 ring-primary/10">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white shadow-glow-primary">
              <Phone className="h-4 w-4" />
            </span>
            <p className="text-sm text-gray-700">
              Questions about sizing or installation?{' '}
              <a href="tel:8009630131" className="font-semibold text-primary hover:underline">
                Call (800) 963-0131
              </a>{' '}
              — we&apos;ll make sure you get exactly what your roof needs.
            </p>
          </div>
        </ProductDetail>
      </div>

      {/* ─── Why it works: transcript details + featured product video ─── */}
      <section className="sm:mt-4 md:mt-8">
        <div className="relative section-bleed bg-primary overflow-hidden px-5 py-8 sm:px-6 md:p-8 lg:p-12">
          <GlowOrb className="-right-24 -top-28 h-96 w-96" color="rgb(26 123 196 / 0.4)" />
          <GlowOrb className="-bottom-24 -left-20 h-72 w-72" color="rgb(91 164 17 / 0.22)" />
          <div
            aria-hidden="true"
            className="hairline-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
          />
          <div
            className={`relative z-10 grid grid-cols-1 gap-8 lg:gap-14 items-center ${
              heroVideoId ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'
            }`}
          >
            <div>
              <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {isKit ? 'Why This Kit Works' : 'Why It Works'}
              </h2>
              <ul className="space-y-4">
                {whyPoints.map((point) => (
                  <li key={point.lead} className="flex gap-3">
                    <span className="mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-accent/20 text-accent-light ring-1 ring-accent/40">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                      <span className="font-bold text-highlight">{point.lead}</span>{' '}
                      {point.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            {heroVideoId && (
              <div className="relative order-first lg:order-none">
                <div
                  aria-hidden="true"
                  className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-highlight/25 via-secondary/20 to-accent/30 blur-2xl"
                />
                <YouTubeEmbed
                  videoId={heroVideoId}
                  variant="card"
                  className="relative shadow-2xl ring-1 ring-white/15"
                />
                <p className="relative mt-3 text-center text-sm font-medium text-white/55">
                  Watch the {product.displayTitle} overview
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Real customer projects ─── */}
      {projects.length > 0 && (
        <section className="sm:mt-4 md:mt-8">
          <div className={WHITE_SECTION}>
            <SectionHead
              eyebrow="Real Roofs. Real Results."
              heading="Thousands of Real Projects Completed With Kits Just Like This One"
              sub="Not stock photos — documented customer installs, in their own words and pictures."
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Link
                  key={p.slug}
                  href={`/project/${p.slug}/`}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    {p.cover_photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.cover_photo}
                        alt={`Project #${p.project_number}: ${p.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-dark/40 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                    {p.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
                        {categoryLabel(p.category)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-accent-dark">
                      Project #{p.project_number}
                    </p>
                    <h3 className="mb-2 text-lg font-extrabold leading-snug text-primary">
                      {p.title}
                    </h3>
                    {p.quote && (
                      <p className="mb-3 text-sm leading-relaxed text-gray-600 line-clamp-3">
                        &ldquo;{p.quote}&rdquo;
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 text-sm text-gray-500">
                      {p.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {p.location}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-primary/[0.06] text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-accent group-hover:text-white">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href={`/projects?category=${projectCategory}`} className={OUTLINE_BTN}>
                Browse All Customer Projects
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Reviews ─── */}
      <section className="sm:mt-4 md:mt-8">
        <div className={WHITE_SECTION}>
          <SectionHead
            heading="Straight From the Roof"
            sub="Real reviews from customers who installed it themselves."
            action={
              <Link
                href="/reviews"
                className="group inline-flex items-center gap-1 text-sm font-bold text-accent-dark"
              >
                See More Photos &amp; Reviews
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            }
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-3xl bg-gradient-to-b from-slate-50 to-white p-5 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-accent/10 ring-1 ring-accent/20">
                  <Quote className="h-4 w-4 text-accent" />
                </span>
                <p className="mb-5 flex-1 text-sm leading-relaxed text-gray-600">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-primary/[0.06] pt-4">
                  {t.photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <Stars className="h-3 w-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional product videos beyond the one featured in the band above */}
      {extraVideoIds.length > 0 && (
        <section className="sm:mt-4 md:mt-8">
          <div className={WHITE_SECTION}>
            <SectionHead heading="See It In Action" />
            <div
              className={`grid gap-6 ${
                extraVideoIds.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl'
              }`}
            >
              {extraVideoIds.map((id) => (
                <YouTubeEmbed
                  key={id}
                  videoId={id}
                  variant="card"
                  className="shadow-xl ring-1 ring-primary/10"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Crazy Seal videos ─── */}
      {brandVideos.length > 0 && (
        <section className="sm:mt-4 md:mt-8">
          <div className={WHITE_SECTION}>
            <SectionHead
              eyebrow="Do Your Homework"
              heading="Why Crazy Seal?"
              sub="This isn't box-store roof coating. Watch what makes the system different — and why it costs more."
            />
            <div
              className={`grid grid-cols-1 gap-6 ${
                brandVideos.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
              }`}
            >
              {brandVideos.map((video) => (
                <div key={video.videoId}>
                  <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-primary/10">
                    <ProYouTubeEmbed halo={false}
                      videoId={video.videoId}
                      thumbnail={video.thumbnail}
                      title={video.title}
                    />
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-gray-600">
                    {video.caption}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <a
                href={REASONS_PDF_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-primary-light to-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_-6px_rgb(0_51_101/0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgb(0_51_101/0.6)]"
              >
                <Download className="h-4 w-4" />
                Download Our 21&frac12; Reasons PDF
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ─── How it goes down ─── */}
      <section className="sm:mt-4 md:mt-8">
        <div className={WHITE_SECTION}>
          <SectionHead
            heading="How It Goes Down"
            sub="No torches, no tear-off, no special tools. Three steps, guided by step-by-step videos."
          />
          <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-3">
            {INSTALL_STEPS.map((step) => (
              <div
                key={step.title}
                className="group relative rounded-3xl bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl"
              >
                <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6">
                  <step.icon className="h-6 w-6" />
                </span>
                <h3 className="mb-1.5 text-lg font-extrabold text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={installGuideHref(product)} className={OUTLINE_BTN}>
              Watch the Full Installation Guide
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Complete Your System (replaces "You Might Also Need") ─── */}
      <CompanionProducts items={companions} />
    </Container>
  )
}

const CRUMB =
  'rounded-full bg-white px-3 py-1 font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:ring-accent/40'

const WHITE_SECTION =
  'section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12'

const OUTLINE_BTN =
  'group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/50'

/** Left-aligned section heading with an optional right-side action. */
function SectionHead({
  heading,
  sub,
  action,
}: {
  eyebrow?: string
  heading: string
  sub?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl lg:text-4xl text-balance">
          {heading}
        </h2>
        {sub && <p className="mt-2 max-w-2xl text-gray-500">{sub}</p>}
      </div>
      {action}
    </div>
  )
}
