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
    <section className="sm:mt-4 md:mt-8">
      <div className="section-bleed bg-white border-y sm:border border-gray-200/80 px-5 py-8 sm:px-6 md:p-8 lg:p-12">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-primary sm:text-3xl lg:text-4xl">
            Complete Your System
          </h2>
          <p className="mt-2 max-w-2xl text-gray-500">
            What experienced installers add to the same order — so the job never stalls
            waiting on a second shipment.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const priceLabel =
              item.price === item.priceMax
                ? formatPrice(item.price)
                : `From ${formatPrice(item.price)}`
            return (
              <div
                key={item.handle}
                className="group flex flex-col overflow-hidden rounded-3xl bg-gradient-to-b from-slate-50 to-white p-2 shadow-sm ring-1 ring-primary/[0.08] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl"
              >
                <Link
                  href={`/store/${item.handle}`}
                  className="relative block aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-accent/10 ring-1 ring-primary/[0.05]"
                >
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-10 bottom-4 h-6 rounded-full bg-primary/10 blur-xl"
                  />
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="relative h-full w-full object-contain p-5 transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      loading="lazy"
                    />
                  )}
                </Link>
                <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                  <Link href={`/store/${item.handle}`}>
                    <h3 className="text-sm font-extrabold text-primary transition-colors hover:text-secondary">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-gray-500">
                    {item.reason}
                  </p>
                  <p className="mt-3 text-base font-extrabold text-primary font-[family-name:var(--font-display)]">
                    {priceLabel}
                  </p>
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
                      className="btn-sheen mt-3 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-4 py-2.5 text-sm font-bold text-white shadow-[0_6px_16px_-6px_rgb(91_164_17/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-accent active:translate-y-0 active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </button>
                  ) : (
                    <Link
                      href={`/store/${item.handle}`}
                      className="group/opt mt-3 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:ring-primary/50"
                    >
                      Choose Options
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/opt:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
