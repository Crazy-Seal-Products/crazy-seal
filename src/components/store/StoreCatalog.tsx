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
import { formatPrice, type StoreProduct } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'
import { STORE_PAGE_TESTIMONIALS } from '@/lib/store/social-proof'
import { Stars } from '@/components/store/Stars'
import { ProductCard } from '@/components/store/ProductCard'

const PERKS = [
  { icon: PackageCheck, title: 'In-Stock & Ready to Ship', desc: 'Shipped straight to your door from our USA facility.' },
  { icon: Truck, title: 'Free Shipping Over $500', desc: 'Most kits ship free — no surprise freight charges.' },
  { icon: ShieldCheck, title: '50 Year Warranty', desc: 'The strongest warranty in the roofing industry.' },
  { icon: CreditCard, title: 'Split Into 4 Payments', desc: 'Orders of $100–$1,000 can be split with Affirm at checkout.' },
]

const FEATURED_HANDLE = 'rv-roofing-kit'

const KIT_CATEGORIES = new Set(['rv-kits', 'roof-kits', 'commercial-kits'])

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

/** Full store catalog: category chips, perks, featured kit, category grids + social proof. */
export function StoreCatalog({ products }: { products: StoreProduct[] }) {
  const sections = STORE_CATEGORIES.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.category === cat.id),
  })).filter((s) => s.products.length > 0)

  const featured = products.find((p) => p.handle === FEATURED_HANDLE)

  const lastKitIndex = sections.reduce(
    (acc, s, i) => (KIT_CATEGORIES.has(s.id) ? i : acc),
    -1
  )

  return (
    <>
      {/* Category quick-nav */}
      <Container size="xl" className="pt-8 pb-2">
        <div className="flex flex-wrap justify-center gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#003365] hover:border-[#003365]/40 hover:bg-blue-50 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>
      </Container>

      {/* Perks */}
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

      {/* Featured kit */}
      {featured && (
        <Container size="xl" className="pb-4">
          <FeaturedKit product={featured} />
        </Container>
      )}

      {/* Category sections */}
      <Container size="xl" className="py-10 pb-8 space-y-14">
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
      </Container>
    </>
  )
}
