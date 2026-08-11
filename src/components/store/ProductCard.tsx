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
