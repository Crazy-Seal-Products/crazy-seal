'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import { ProductImageGallery } from '@/components/store/ProductImageGallery'
import { ProductPurchasePanel } from '@/components/store/ProductPurchasePanel'
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <ProductImageGallery
        images={galleryImages}
        alt={product.displayTitle}
        featuredImage={selectedVariant.image}
      />
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
          {product.displayTitle}
        </h1>
        <ProductPurchasePanel
          product={product}
          selected={selected}
          onSelectedChange={setSelected}
          selectedVariant={selectedVariant}
        />
        {children}
      </div>
    </div>
  )
}
