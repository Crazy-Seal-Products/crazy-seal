'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/store/products'

export interface CompanionItem {
  handle: string
  title: string
  image: string | null
  reason: string
  price: number
  priceMax: number
  /** Set when the product has exactly one variant, enabling inline add-to-cart */
  variantId: string | null
  variantTitle: string
}

/**
 * "Complete Your System" — curated companion products with inline add-to-cart.
 * Single-variant products add straight to the cart; multi-variant products
 * (kits with sizes/colors) link to their page to choose options.
 */
export function CompanionProducts({ items }: { items: CompanionItem[] }) {
  const { addItem } = useCart()

  if (items.length === 0) return null

  return (
    <section className="mt-16">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5BA411] mb-1">
          Don&apos;t Get Caught Short
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#003365] tracking-tight">
          Complete Your System
        </h2>
        <p className="mt-1.5 text-gray-500 max-w-2xl">
          What experienced installers add to the same order — so the job never
          stalls waiting on a second shipment.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map((item) => {
          const priceLabel =
            item.price === item.priceMax
              ? formatPrice(item.price)
              : `From ${formatPrice(item.price)}`
          return (
            <div
              key={item.handle}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-[#003365]/30 transition-all duration-300"
            >
              <Link href={`/store/${item.handle}`} className="block aspect-square bg-gray-50 overflow-hidden">
                {item.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                )}
              </Link>
              <div className="flex flex-col flex-1 p-4">
                <Link href={`/store/${item.handle}`}>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#003365] transition-colors">
                    {item.title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed flex-1">
                  {item.reason}
                </p>
                <p className="mt-3 text-base font-bold text-[#003365]">{priceLabel}</p>
                {item.variantId ? (
                  <button
                    onClick={() =>
                      addItem({
                        variantId: item.variantId!,
                        productHandle: item.handle,
                        productTitle: item.title,
                        variantTitle: item.variantTitle,
                        price: item.price,
                        image: item.image,
                      })
                    }
                    className="mt-3 flex items-center justify-center gap-2 rounded-full bg-[#5BA411] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A870E] transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                ) : (
                  <Link
                    href={`/store/${item.handle}`}
                    className="mt-3 flex items-center justify-center gap-2 rounded-full border-2 border-[#003365]/20 px-4 py-2 text-sm font-semibold text-[#003365] hover:border-[#003365] hover:bg-[#003365]/5 transition-colors"
                  >
                    Choose Options
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
