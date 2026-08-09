import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Truck,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  PackageCheck,
  Quote,
} from 'lucide-react'
import { Container } from '@/lib/design-system'
import { getStoreProducts, formatPrice, type StoreProduct } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'
import { STORE_PAGE_TESTIMONIALS } from '@/lib/store/social-proof'
import { Stars } from '@/components/store/Stars'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Store',
  description:
    'Shop the Crazy Seal Roofing System. Complete kits for RV, residential, and commercial flat roofs, plus every individual product. Free shipping on orders over $500.',
}

const PERKS = [
  { icon: PackageCheck, title: 'In-Stock & Ready to Ship', desc: 'Shipped straight to your door from our USA facility.' },
  { icon: Truck, title: 'Free Shipping Over $500', desc: 'Most kits ship free — no surprise freight charges.' },
  { icon: ShieldCheck, title: '50 Year Warranty', desc: 'The strongest warranty in the roofing industry.' },
  { icon: CreditCard, title: 'Split Into 4 Payments', desc: 'Orders of $100–$1,000 can be split with Affirm at checkout.' },
]

const HERO_STATS = [
  { value: '1,000s', label: 'of roofs sealed' },
  { value: '50 yr', label: 'warranty' },
  { value: 'USA', label: 'manufactured' },
]

const FEATURED_HANDLE = 'rv-roofing-kit'

const KIT_CATEGORIES = new Set(['rv-kits', 'roof-kits', 'commercial-kits'])

function ProductCard({ product }: { product: StoreProduct }) {
  const isKit = KIT_CATEGORIES.has(product.category)
  const priceLabel =
    product.priceMin === product.priceMax
      ? formatPrice(product.priceMin)
      : `From ${formatPrice(product.priceMin)}`

  return (
    <Link
      href={`/store/${product.handle}`}
      className="group relative flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-[#003365]/30 transition-all duration-300"
    >
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-[#5BA411] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
          {product.badge}
        </span>
      )}
      <div
        className={`bg-gray-50 overflow-hidden ${
          isKit ? '' : 'aspect-square'
        }`}
      >
        {product.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.displayTitle}
            className={`w-full group-hover:scale-105 transition-transform duration-300 ${
              isKit
                ? 'h-auto object-contain px-2 pt-2 pb-1'
                : 'h-full object-contain p-6'
            }`}
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <Stars className="w-3.5 h-3.5" />
          <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5BA411]" />
            In Stock
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#003365] transition-colors">
          {product.displayTitle}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {product.blurb}
        </p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <span className="text-lg font-bold text-[#003365]">{priceLabel}</span>
            {isKit && product.priceMin >= 100 && (
              <p className="text-[11px] text-gray-400">or 4 payments with Affirm</p>
            )}
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#5BA411] group-hover:gap-2 transition-all">
            Shop
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function FeaturedKit({ product }: { product: StoreProduct }) {
  const priceLabel =
    product.priceMin === product.priceMax
      ? formatPrice(product.priceMin)
      : `From ${formatPrice(product.priceMin)}`

  return (
    <Link
      href={`/store/${product.handle}`}
      className="group relative block rounded-3xl bg-primary overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(18,95,151,0.6),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(91,164,17,0.2),transparent_45%)]" />
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-6 p-6 sm:p-10">
        <div>
          <span className="inline-block rounded-full bg-[#F9EA1C] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#003365] mb-4">
            {product.badge ?? 'Featured Kit'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
            {product.displayTitle}
          </h2>
          <div className="flex items-center gap-2 mb-4">
            <Stars />
            <span className="text-sm text-white/70">
              Thousands of successful installations
            </span>
          </div>
          <p className="text-white/70 leading-relaxed mb-6 max-w-lg">
            Everything you need to seal your roof for good in one box — cleaner,
            caulk, patch, and a seamless double-layer membrane, sized to your
            roof and backed by a 50 year warranty.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5BA411] px-6 py-3 text-base font-semibold text-white group-hover:bg-[#4A870E] transition-colors">
              Shop This Kit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div>
              <p className="text-xl font-bold text-white">{priceLabel}</p>
              <p className="text-xs text-white/50">or 4 payments with Affirm</p>
            </div>
          </div>
        </div>
        <div className="order-first lg:order-none">
          {product.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.featuredImage}
              alt={product.displayTitle}
              className="w-full max-w-md mx-auto drop-shadow-2xl group-hover:scale-[1.03] transition-transform duration-500"
              loading="lazy"
            />
          )}
        </div>
      </div>
    </Link>
  )
}

function SocialProofBand() {
  return (
    <div className="relative rounded-3xl bg-primary overflow-hidden px-6 py-10 sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(18,95,151,0.5),transparent_55%)]" />
      <div className="relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Stars className="w-5 h-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Thousands of Real Projects Completed
          </h2>
          <p className="mt-2 text-white/60 max-w-2xl mx-auto">
            RV owners, homeowners, and facility managers across the country have
            sealed their roofs for good with these exact kits.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {STORE_PAGE_TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <Quote className="w-5 h-5 text-[#5BA411] mb-3" />
              <p className="text-sm text-white/80 leading-relaxed mb-4">
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
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <Stars className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
          >
            Browse Real Customer Projects
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function StorePage() {
  const products = await getStoreProducts()

  const sections = STORE_CATEGORIES.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.category === cat.id),
  })).filter((s) => s.products.length > 0)

  const featured = products.find((p) => p.handle === FEATURED_HANDLE)

  // Social proof band sits after the kit categories, before individual products
  const lastKitIndex = sections.reduce(
    (acc, s, i) => (KIT_CATEGORIES.has(s.id) ? i : acc),
    -1
  )

  return (
    <>
      {/* ─── HERO ─── */}
      <Container size="xl">
        <div className="relative section-bleed bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(18,95,151,0.5),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(91,164,17,0.15),transparent_40%)]" />
          <div className="relative z-10 px-5 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Manufactured in the USA
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
              The Crazy Seal Store
            </h1>
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-8">
              Complete roofing kits and individual products, shipped straight to
              your door. Seal it once. Seal it for good.
            </p>

            {/* Stats strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 mb-8">
              <div className="flex flex-col items-center">
                <Stars />
                <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                  rated by DIYers
                </span>
              </div>
              {HERO_STATS.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <span className="text-2xl font-bold text-white leading-none">
                    {stat.value}
                  </span>
                  <span className="mt-1 text-xs text-white/50 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Category quick-nav */}
            <div className="flex flex-wrap justify-center gap-2">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 hover:border-white/40 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      {/* ─── PERKS ─── */}
      <Container size="xl" className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5"
            >
              <div className="rounded-full bg-[#5BA411]/10 p-2.5">
                <perk.icon className="w-5 h-5 text-[#5BA411]" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{perk.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{perk.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* ─── FEATURED KIT ─── */}
      {featured && (
        <Container size="xl" className="pb-4">
          <FeaturedKit product={featured} />
        </Container>
      )}

      {/* ─── CATEGORY SECTIONS ─── */}
      <Container size="xl" className="py-10 pb-16 space-y-14">
        {sections.map((section, i) => (
          <div key={section.id} className="space-y-14">
            <section id={section.id} className="scroll-mt-24">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
                  {section.label}
                </h2>
                <p className="mt-1.5 text-gray-500 max-w-2xl">{section.blurb}</p>
              </div>
              <div
                className={
                  KIT_CATEGORIES.has(section.id)
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                }
              >
                {section.products.map((product) => (
                  <ProductCard key={product.handle} product={product} />
                ))}
              </div>
            </section>
            {i === lastKitIndex && <SocialProofBand />}
          </div>
        ))}

        {/* Help CTA */}
        <div className="rounded-2xl bg-primary px-6 py-10 sm:px-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Not Sure What You Need? Don&apos;t Guess.
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            Answer a few questions and get a kit sized to your exact roof — or
            talk to a Crazy Seal specialist and we&apos;ll build it with you, free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/kit-builder"
              className="rounded-full bg-[#5BA411] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A870E] transition-colors"
            >
              Build My Kit
            </Link>
            <a
              href="tel:8009630131"
              className="rounded-full border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Call (800) 963-0131
            </a>
          </div>
        </div>
      </Container>
    </>
  )
}
