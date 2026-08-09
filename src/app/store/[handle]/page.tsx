import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Phone,
  PackageCheck,
  CreditCard,
  ArrowRight,
  MapPin,
  Quote,
  Droplets,
  Wrench,
  PaintRoller,
  Download,
  CheckCircle2,
} from 'lucide-react'
import { Container, YouTubeEmbed } from '@/lib/design-system'
import { getStoreProducts, getStoreProduct, type StoreProduct } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'
import {
  testimonialsFor,
  projectCategoryFor,
  whyItWorksFor,
  WHY_CRAZY_SEAL_VIDEOS,
  REASONS_PDF_URL,
  COMPANION_REASONS,
  defaultCompanionsFor,
} from '@/lib/store/social-proof'
import { getPublishedProjects, categoryLabel } from '@/lib/projects'
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
  const product = await getStoreProduct(handle)
  if (!product) notFound()

  const category = STORE_CATEGORIES.find((c) => c.id === product.category)
  const isKit = product.category !== 'products' && product.category !== 'extras'
  const allProducts = await getStoreProducts()

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
  const projectCategory = projectCategoryFor(product)
  const projects = projectCategory
    ? (await getPublishedProjects(projectCategory)).slice(0, 3)
    : []

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
    <Container size="xl" className="py-8 sm:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/store" className="hover:text-[#003365] font-medium">
          Store
        </Link>
        {category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/store#${category.id}`} className="hover:text-[#003365] font-medium">
              {category.label}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.displayTitle}</span>
      </nav>

      <ProductDetail product={product}>
        {/* Assurance stack */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSURANCES.map((a) => (
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

        {/* Description */}
        {product.descriptionHtml && (
          <div
            className="prose prose-sm max-w-none mt-8 text-gray-600 [&_h1]:text-lg [&_h2]:text-lg [&_h3]:text-base [&_strong]:text-gray-900"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        )}

        {/* Help */}
        <div className="mt-8 flex items-center gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3.5">
          <Phone className="w-5 h-5 text-[#003365] flex-shrink-0" />
          <p className="text-sm text-gray-700">
            Questions about sizing or installation?{' '}
            <a href="tel:8009630131" className="font-semibold text-[#003365] hover:underline">
              Call (800) 963-0131
            </a>{' '}
            — we&apos;ll make sure you get exactly what your roof needs.
          </p>
        </div>
      </ProductDetail>

      {/* ─── Why it works: transcript details + featured product video ─── */}
      <section className="mt-16">
        <div className="relative rounded-3xl bg-primary overflow-hidden px-6 py-10 sm:p-10 lg:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(18,95,151,0.5),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,rgba(91,164,17,0.18),transparent_45%)]" />
          <div
            className={`relative z-10 grid grid-cols-1 gap-8 lg:gap-12 items-center ${
              heroVideoId ? 'lg:grid-cols-2' : 'max-w-3xl mx-auto'
            }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">
                The Details That Matter
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-6">
                {isKit ? 'Why This Kit Works' : 'Why It Works'}
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
            {heroVideoId && (
              <div className="order-first lg:order-none">
                <YouTubeEmbed
                  videoId={heroVideoId}
                  variant="card"
                  className="shadow-2xl ring-1 ring-white/10"
                />
                <p className="text-center text-white/50 text-sm font-medium mt-3">
                  Watch the {product.displayTitle} overview
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Real customer projects ─── */}
      {projects.length > 0 && (
        <section className="mt-16">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-1">
              Real Roofs. Real Results.
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
              Thousands of Real Projects Completed With Kits Just Like This One
            </h2>
            <p className="mt-1.5 text-gray-500 max-w-2xl">
              These aren&apos;t stock photos — they&apos;re documented customer
              installations, in their own words and pictures.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
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
                  {p.category && (
                    <span className="absolute top-3 left-3 bg-[#003365] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {categoryLabel(p.category)}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-accent mb-1">
                    Project #{p.project_number}
                  </p>
                  <h3 className="text-lg font-bold text-[#003365] leading-snug mb-2 group-hover:underline decoration-2 underline-offset-2">
                    {p.title}
                  </h3>
                  {p.quote && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-3">
                      &ldquo;{p.quote}&rdquo;
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    {p.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.location}
                      </span>
                    ) : (
                      <span />
                    )}
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#5ba411] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href={`/projects?category=${projectCategory}`}
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#003365]/20 px-6 py-3 text-sm font-semibold text-[#003365] hover:border-[#003365] hover:bg-[#003365]/5 transition-colors"
            >
              Browse All Customer Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
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

      {/* Additional product videos beyond the one featured in the band above */}
      {extraVideoIds.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight mb-6">
            See It In Action
          </h2>
          <div
            className={`grid gap-6 ${
              extraVideoIds.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl'
            }`}
          >
            {extraVideoIds.map((id) => (
              <YouTubeEmbed key={id} videoId={id} variant="card" />
            ))}
          </div>
        </section>
      )}

      {/* ─── Why Crazy Seal videos ─── */}
      {brandVideos.length > 0 && (
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
          <div
            className={`grid grid-cols-1 gap-6 ${
              brandVideos.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
            }`}
          >
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
      )}

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
            href={installGuideHref(product)}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[#003365]/20 px-6 py-3 text-sm font-semibold text-[#003365] hover:border-[#003365] hover:bg-[#003365]/5 transition-colors"
          >
            Watch the Full Installation Guide
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ─── Complete Your System (replaces "You Might Also Need") ─── */}
      <CompanionProducts items={companions} />
    </Container>
  )
}
