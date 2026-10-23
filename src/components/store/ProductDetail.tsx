'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { ProductImageGallery } from '@/components/store/ProductImageGallery'
import { ProductPurchasePanel } from '@/components/store/ProductPurchasePanel'
import { Stars } from '@/components/store/Stars'
import type { StoreProduct } from '@/lib/store/products'

/**
 * Owns variant selection so the gallery and purchase panel stay in sync —
 * when Size/Color changes, the featured image switches to that variant's
 * image (Shopify storefront behavior).
 */
export function ProductDetail({
  product,
  children,
}: {
  product: StoreProduct
  /** Content below the purchase panel (trust strip, description, etc.) */
  children?: ReactNode
}) {
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((o) => [o.name, o.values[0]]))
  )

  // Support ?variant=<numeric id> deep links (e.g. from the quote calculator)
  useEffect(() => {
    const variantId = new URLSearchParams(window.location.search).get('variant')
    if (!variantId) return
    const match = product.variants.find(
      (v) => v.id === variantId || v.id.endsWith(`/${variantId}`)
    )
    if (match) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the ?variant= deep link
      setSelected(Object.fromEntries(match.selectedOptions.map((o) => [o.name, o.value])))
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    return (
      product.variants.find((v) =>
        v.selectedOptions.every((opt) => selected[opt.name] === opt.value)
      ) ?? product.variants[0]
    )
  }, [product.variants, selected])

  // Variant image first, then remaining product images (Shopify-style)
  const galleryImages = useMemo(() => {
    const variantImg = selectedVariant.image
    if (!variantImg) return product.images
    return [variantImg, ...product.images.filter((img) => img !== variantImg)]
  }, [selectedVariant.image, product.images])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
      <ProductImageGallery
        images={galleryImages}
        alt={product.displayTitle}
        featuredImage={selectedVariant.image}
      />
      <div>
        {product.badge && (
          <span
            className="animate-fade-up mb-3 inline-flex items-center rounded-full bg-highlight px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-primary shadow-glow-highlight"
          >
            {product.badge}
          </span>
        )}
        <h1
          className="animate-fade-up mb-3 text-3xl font-extrabold leading-[1.1] tracking-tight text-primary sm:text-4xl lg:text-[2.6rem] text-balance"
          style={{ animationDelay: '80ms' }}
        >
          {product.displayTitle}
        </h1>
        <div
          className="animate-fade-up mb-5 flex flex-wrap items-center gap-x-3 gap-y-1"
          style={{ animationDelay: '160ms' }}
        >
          <Stars />
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-primary">Thousands</span> of
            successful installations
          </p>
        </div>
        <div className="animate-fade-up" style={{ animationDelay: '240ms' }}>
          <ProductPurchasePanel
            product={product}
            selected={selected}
            onSelectedChange={setSelected}
            selectedVariant={selectedVariant}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
