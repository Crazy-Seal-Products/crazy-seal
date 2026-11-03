'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Plus, ShoppingCart, Zap, Headset, ChevronRight, Check } from 'lucide-react'
import { EASE_OUT_EXPO } from '@/components/motion'
import { useCart } from '@/contexts/CartContext'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { REP_GOLD } from '@/components/store/SpeakToRep'
import { formatPrice, type StoreProduct } from '@/lib/store/products'
import type { ShopifyVariant } from '@/lib/shopify/catalog'

interface ProductPurchasePanelProps {
  product: StoreProduct
  selected: Record<string, string>
  onSelectedChange: (next: Record<string, string>) => void
  selectedVariant: ShopifyVariant
}

export function ProductPurchasePanel({
  product,
  selected,
  onSelectedChange,
  selectedVariant,
}: ProductPurchasePanelProps) {
  const { addItem } = useCart()
  const { openQuoteModal } = useQuoteModal()
  const [quantity, setQuantity] = useState(1)
  const [buyingNow, setBuyingNow] = useState(false)
  const reduce = useReducedMotion()

  // Animate the price only when a variant change actually moves it (never on load)
  const price = formatPrice(parseFloat(selectedVariant.price))
  const [initialPrice] = useState(price)
  const [priceChanged, setPriceChanged] = useState(false)
  if (!priceChanged && price !== initialPrice) setPriceChanged(true)

  const hasOptions = product.options.some((o) => o.values.length > 1)

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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-baseline gap-3">
          {/* Re-keyed on change so a new variant price lifts into place */}
          <motion.span
            key={price}
            initial={reduce || !priceChanged ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
            className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl font-[family-name:var(--font-display)]"
          >
            {price}
          </motion.span>
          {selectedVariant.compareAtPrice && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(parseFloat(selectedVariant.compareAtPrice))}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-dark ring-1 ring-accent/20">
          <span className="h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-accent/25" />
          In stock &middot; ready to ship
        </span>
      </div>

      {/* Option pickers */}
      {hasOptions &&
        product.options.map((option) => (
          <div key={option.name}>
            <p className="mb-2.5 text-sm font-semibold text-gray-900">
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
                    onClick={() => onSelectedChange({ ...selected, [option.name]: value })}
                    disabled={!available}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 cursor-pointer ${
                      active
                        ? 'bg-gradient-to-b from-primary-light to-primary text-white shadow-[0_6px_16px_-6px_rgb(0_51_101/0.55)] ring-1 ring-primary'
                        : available
                          ? 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:-translate-y-0.5 hover:text-primary hover:ring-primary/40 hover:shadow-md'
                          : 'cursor-not-allowed bg-gray-50 text-gray-300 line-through ring-1 ring-gray-100'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

      {/* Quantity + actions */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-900">Qty</span>
        <div className="flex items-center rounded-full bg-slate-50 shadow-[inset_0_1px_2px_rgb(0_32_67/0.06)] ring-1 ring-gray-200">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="grid h-10 w-10 place-items-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-primary hover:shadow-sm cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-bold tabular-nums text-primary">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(999, q + 1))}
            className="grid h-10 w-10 place-items-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-primary hover:shadow-sm cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => addItem(cartItem(), quantity)}
          className="btn-sheen flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(91_164_17/0.7)] active:translate-y-0 active:scale-[0.98] cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          disabled={buyingNow}
          className="btn-sheen flex-1 flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-primary-light to-primary px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_22px_-8px_rgb(0_51_101/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(0_51_101/0.6)] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
        >
          <Zap className="w-5 h-5" />
          {buyingNow ? 'One Moment…' : 'Buy Now'}
        </button>
      </div>

      {/* Speak to a rep (gold across the shop) — converts hesitant shoppers into sales leads */}
      <button
        type="button"
        onClick={() =>
          openQuoteModal({
            sourcePage: `store/${product.handle}`,
            initialMessage: `I'm looking at the ${product.displayTitle} (${selectedVariant.title}) and would like help making sure it's the right kit for my roof.`,
          })
        }
        className="group w-full flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fff3c4] to-[#fff8dc] px-4 py-3.5 sm:px-5 text-left shadow-[0_8px_22px_-12px_rgb(227_180_42/0.9)] ring-1 ring-[#f5c542] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-12px_rgb(227_180_42/0.95)] active:scale-[0.99] cursor-pointer"
      >
        <span className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105 ${REP_GOLD}`}>
          <Headset className="w-5 h-5" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-sm font-bold text-primary-dark">
            Not sure which kit? Speak to a rep, free
          </span>
          <span className="block text-xs text-primary-dark/70 mt-0.5 leading-relaxed">
            A rep sizes the kit to your exact roof and gets right back to you.
          </span>
        </span>
        <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#f5c542] text-primary-dark transition-all duration-300 group-hover:bg-[#e3b42a]">
          <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </button>

      {/* Per-variant contents (from Shopify Variant Description app) */}
      {selectedVariant.descriptionHtml && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-accent/[0.07] to-white px-5 py-4 ring-1 ring-accent/25">
          <p className="mb-2.5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/15">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            What&apos;s Included
          </p>
          <div
            className="max-w-none text-sm leading-relaxed text-gray-700 [&_strong]:text-gray-900 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ul]:marker:text-accent [&_ol]:list-decimal [&_ol]:pl-5"
            dangerouslySetInnerHTML={{ __html: selectedVariant.descriptionHtml }}
          />
        </div>
      )}
    </div>
  )
}
