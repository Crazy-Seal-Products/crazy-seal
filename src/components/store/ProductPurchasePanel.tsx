'use client'

import { useState, useMemo, useEffect } from 'react'
import { Minus, Plus, ShoppingCart, Zap } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice, type StoreProduct } from '@/lib/store/products'

interface ProductPurchasePanelProps {
  product: StoreProduct
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [buyingNow, setBuyingNow] = useState(false)

  const hasOptions = product.options.some((o) => o.values.length > 1)

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

  /** Option values that produce a valid variant given the other selections. */
  function isValueAvailable(optionName: string, value: string): boolean {
    return product.variants.some((v) =>
      v.selectedOptions.every((opt) =>
        opt.name === optionName ? opt.value === value : selected[opt.name] === opt.value
      )
    )
  }

  function cartItem() {
    return {
      variantId: selectedVariant.id,
      productHandle: product.handle,
      productTitle: product.displayTitle,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price),
      image: selectedVariant.image ?? product.featuredImage,
    }
  }

  async function handleBuyNow() {
    setBuyingNow(true)
    try {
      const res = await fetch('/api/store/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ variantId: selectedVariant.id, quantity }] }),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      // fall back to adding to cart so the sale isn't lost
      addItem(cartItem(), quantity)
      setBuyingNow(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-[#003365]">
          {formatPrice(parseFloat(selectedVariant.price))}
        </span>
        {selectedVariant.compareAtPrice && (
          <span className="text-lg text-gray-400 line-through">
            {formatPrice(parseFloat(selectedVariant.compareAtPrice))}
          </span>
        )}
      </div>

      {/* Option pickers */}
      {hasOptions &&
        product.options.map((option) => (
          <div key={option.name}>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {option.name}:{' '}
              <span className="font-normal text-gray-600">{selected[option.name]}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const active = selected[option.name] === value
                const available = isValueAvailable(option.name, value)
                return (
                  <button
                    key={value}
                    onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                    disabled={!available}
                    className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-[#003365] bg-[#003365] text-white'
                        : available
                          ? 'border-gray-300 text-gray-700 hover:border-[#003365]'
                          : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

      {/* Quantity + actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border-2 border-gray-300 rounded-full">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="p-2.5 text-gray-600 hover:text-[#003365] cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(999, q + 1))}
            className="p-2.5 text-gray-600 hover:text-[#003365] cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => addItem(cartItem(), quantity)}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#5BA411] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#4A870E] transition-colors shadow-sm hover:shadow-md cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={buyingNow}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#003365] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#00274d] transition-colors shadow-sm hover:shadow-md disabled:opacity-60 cursor-pointer"
        >
          <Zap className="w-5 h-5" />
          {buyingNow ? 'One Moment…' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}
