import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatPrice, type StoreProduct } from '@/lib/store/products'
import { Stars } from '@/components/store/Stars'

const KIT_CATEGORIES = new Set(['rv-kits', 'roof-kits', 'commercial-kits'])

/** Store-style product card: image, badge, stars, stock, price, Affirm note. */
export function ProductCard({ product }: { product: StoreProduct }) {
  const isKit = KIT_CATEGORIES.has(product.category)
  const priceLabel =
    product.priceMin === product.priceMax
      ? formatPrice(product.priceMin)
      : `From ${formatPrice(product.priceMin)}`

  return (
    <Link
      href={`/store/${product.handle}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-white p-2 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:ring-primary/15"
    >
      <div
        className={`relative grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-accent/10 ${
          isKit ? '' : 'aspect-square'
        }`}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 bottom-3 h-6 rounded-full bg-primary/10 blur-xl transition-opacity duration-500 group-hover:opacity-70"
        />
        {product.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.featuredImage}
            alt={product.displayTitle}
            className={`relative w-full transition-transform duration-700 ease-out group-hover:scale-[1.06] ${
              isKit
                ? 'h-auto object-contain px-2 pt-2 pb-1'
                : 'h-full object-contain p-6'
            }`}
            loading="lazy"
          />
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-highlight px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Stars className="h-3.5 w-3.5" />
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-accent/25" />
            In Stock
          </span>
        </div>
        <h3 className="text-base font-extrabold leading-snug text-primary">
          {product.displayTitle}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
          {product.blurb}
        </p>
        <div className="mt-4 flex items-end justify-between gap-3 border-t border-primary/[0.06] pt-4">
          <div>
            <span className="text-lg font-extrabold text-primary font-[family-name:var(--font-display)]">
              {priceLabel}
            </span>
            {isKit && product.priceMin >= 100 && (
              <p className="text-[11px] text-gray-400">or 4 payments with Affirm</p>
            )}
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-b from-accent-light to-accent px-4 py-2 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgb(91_164_17/0.6)] transition-shadow duration-300 group-hover:shadow-glow-accent">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-[130%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[130%]"
            />
            Shop
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
