import type { Metadata } from 'next'
import Link from 'next/link'
import { Truck, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react'
import { Container } from '@/lib/design-system'
import { getStoreProducts, formatPrice, type StoreProduct } from '@/lib/store/products'
import { STORE_CATEGORIES } from '@/lib/store/config'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'Store',
  description:
    'Shop the Crazy Seal Roofing System. Complete kits for RV, residential, and commercial flat roofs, plus every individual product. Free shipping on orders over $500.',
}

const PERKS = [
  { icon: Truck, title: 'Free Shipping Over $500', desc: 'Shipped straight to your door from our USA facility.' },
  { icon: ShieldCheck, title: '50 Year Warranty', desc: 'The strongest warranty in the roofing industry.' },
  { icon: CreditCard, title: 'Secure Checkout', desc: 'Pay with card, or split payments with Affirm.' },
]

function ProductCard({ product }: { product: StoreProduct }) {
  const priceLabel =
    product.priceMin === product.priceMax
      ? formatPrice(product.priceMin)
      : `From ${formatPrice(product.priceMin)}`

  return (
    <Link
      href={`/store/${product.handle}`}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-square bg-gray-50 overflow-hidden">
        {product.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.displayTitle}
            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[#003365] transition-colors">
          {product.displayTitle}
        </h3>
        <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {product.blurb}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-[#003365]">{priceLabel}</span>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#5BA411] group-hover:gap-2 transition-all">
            Shop
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function StorePage() {
  const products = await getStoreProducts()

  const sections = STORE_CATEGORIES.map((cat) => ({
    ...cat,
    products: products.filter((p) => p.category === cat.id),
  })).filter((s) => s.products.length > 0)

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
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
              Complete roofing kits and individual products, shipped straight to
              your door. Backed by a 50 year warranty.
            </p>
          </div>
        </div>
      </Container>

      {/* ─── PERKS ─── */}
      <Container size="xl" className="py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* ─── CATEGORY SECTIONS ─── */}
      <Container size="xl" className="pb-16 space-y-14">
        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
                {section.label}
              </h2>
              <p className="mt-1.5 text-gray-500 max-w-2xl">{section.blurb}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {section.products.map((product) => (
                <ProductCard key={product.handle} product={product} />
              ))}
            </div>
          </section>
        ))}

        {/* Help CTA */}
        <div className="rounded-2xl bg-primary px-6 py-10 sm:px-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Not Sure What You Need?</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-6">
            Get an instant quote sized to your exact roof, or talk to a Crazy
            Seal specialist and we&apos;ll build your kit for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="rounded-full bg-[#5BA411] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4A870E] transition-colors"
            >
              Get an Instant Quote
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
