import Link from 'next/link'
import {
  Truck,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  PackageCheck,
  Quote,
  Check,
} from 'lucide-react'
import { Container } from '@/lib/design-system'
import { GlowOrb } from '@/components/motion'
import { formatPrice, type StoreProduct } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'
import { STORE_PAGE_TESTIMONIALS } from '@/lib/store/social-proof'
import { Stars } from '@/components/store/Stars'
import { ProductCard } from '@/components/store/ProductCard'

const PERKS = [
  { icon: PackageCheck, title: 'In-Stock & Ready to Ship', desc: 'Straight to your door from our USA facility.' },
  { icon: Truck, title: 'Free Shipping Over $500', desc: 'Most kits ship free — no surprise freight.' },
  { icon: ShieldCheck, title: '50 Year Warranty', desc: 'The strongest warranty in roofing.' },
  { icon: CreditCard, title: 'Split Into 4 Payments', desc: 'Affirm on $100–$1,000 orders at checkout.' },
]

const FEATURED_INCLUDES = [
  'Cleaner, caulk & patch',
  'Seamless double-layer membrane',
  'Sized to your roof',
  '50 year warranty',
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
      data-reveal
      className="group relative block overflow-hidden rounded-[1.75rem] bg-primary shadow-[0_30px_60px_-30px_rgb(0_32_67/0.55)]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_0%_0%,rgb(26_123_196/0.42),transparent_55%),linear-gradient(160deg,#013b75_0%,var(--cs-primary)_45%,#00244a_100%)]" />
      <GlowOrb className="-right-20 -top-24 h-80 w-80" color="rgb(26 123 196 / 0.45)" />
      <GlowOrb className="-bottom-28 -left-16 h-72 w-72" color="rgb(91 164 17 / 0.25)" />
      <div
        aria-hidden="true"
        className="hairline-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />
      <div className="relative z-10 grid grid-cols-1 items-center gap-8 p-6 sm:p-10 lg:grid-cols-2 lg:p-12">
        <div>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl text-balance">
            {product.displayTitle}
          </h2>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Stars />
            <span className="text-sm text-white/70">Thousands of successful installations</span>
          </div>
          <p className="mb-4 max-w-lg leading-relaxed text-white/75">
            Everything you need to seal your roof for good — in one box.
          </p>
          <ul className="mb-7 grid max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
            {FEATURED_INCLUDES.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-white/85">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/25 text-accent-light ring-1 ring-accent/40">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-5">
            <span className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-accent-light to-accent px-7 py-3.5 text-base font-bold text-white shadow-[0_10px_28px_-8px_rgb(91_164_17/0.65)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
              />
              Shop This Kit
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div>
              <p className="text-2xl font-extrabold text-white font-[family-name:var(--font-display)]">{priceLabel}</p>
              <p className="text-xs text-white/55">or 4 payments with Affirm</p>
            </div>
          </div>
        </div>
        <div className="relative order-first lg:order-none">
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-gradient-to-br from-highlight/25 via-secondary/25 to-accent/30 blur-3xl"
          />
          {product.featuredImage && (
            <div className="relative animate-float-slow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.featuredImage}
                alt={product.displayTitle}
                className="mx-auto w-full max-w-md drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />
            </div>
          )}
          <div className="absolute -bottom-2 right-2 hidden items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-2xl ring-1 ring-primary/10 sm:flex">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-extrabold text-primary">50 Years</span>
              <span className="block text-[11px] font-medium text-gray-500">Warranty coverage</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function SocialProofBand() {
  return (
    <div
      data-reveal
      className="relative overflow-hidden rounded-[1.75rem] bg-primary px-5 py-10 shadow-[0_30px_60px_-30px_rgb(0_32_67/0.55)] sm:px-10 lg:py-12"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(18_95_151/0.5),transparent_55%),linear-gradient(160deg,#013b75_0%,var(--cs-primary)_45%,#00244a_100%)]" />
      <GlowOrb className="-left-24 -bottom-24 h-72 w-72" color="rgb(91 164 17 / 0.22)" />
      <div className="relative z-10">
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <Stars className="h-4 w-4" />
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
            Thousands of Real Projects Completed
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/65">
            RV owners, homeowners and facility managers nationwide have sealed their roofs
            for good with these exact kits.
          </p>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3" data-reveal-stagger>
          {STORE_PAGE_TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.09] hover:ring-white/25 sm:p-6"
            >
              <span className="mb-4 grid h-9 w-9 place-items-center rounded-xl bg-accent/20 ring-1 ring-accent/40">
                <Quote className="h-4 w-4 text-accent-light" />
              </span>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-white/80">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                {t.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-white/20"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <Stars className="h-3 w-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/15"
          >
            Browse Real Customer Projects
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
      <Container size="xl" className="pt-8 pb-2 md:pt-10">
        <nav aria-label="Store categories" className="flex flex-wrap justify-center gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-primary/[0.08] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-accent/40"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {s.label}
            </a>
          ))}
        </nav>
      </Container>

      {/* Perks */}
      <Container size="xl" className="py-6 md:py-8">
        <div
          data-reveal-stagger
          className="grid grid-cols-1 gap-3 rounded-3xl bg-gradient-to-r from-primary/[0.03] via-accent/[0.06] to-primary/[0.03] p-3 ring-1 ring-primary/[0.06] sm:grid-cols-2 lg:grid-cols-4"
        >
          {PERKS.map((perk) => (
            <div
              key={perk.title}
              className="group flex items-center gap-4 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-primary/[0.06] transition-all duration-300 hover:shadow-md"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent-light to-accent-dark text-white shadow-glow-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105">
                <perk.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-primary">{perk.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{perk.desc}</p>
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
      <Container size="xl" className="space-y-14 py-10 pb-8 md:space-y-16">
        {sections.map((section, i) => (
          <div key={section.id} className="space-y-14 md:space-y-16">
            <section id={section.id} className="scroll-mt-24">
              <div data-reveal className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl lg:text-4xl">
                    {section.label}
                  </h2>
                  <p className="mt-2 max-w-2xl text-gray-500">{section.blurb}</p>
                </div>
              </div>
              <div
                data-reveal-stagger
                className={
                  KIT_CATEGORIES.has(section.id)
                    ? 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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
