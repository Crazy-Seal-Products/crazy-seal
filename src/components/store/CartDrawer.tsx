'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2, ShoppingCart, Lock, MessageSquare, Truck } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { formatPrice } from '@/lib/store/products'

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart()
  const { openQuoteModal } = useQuoteModal()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSpecialistAssist() {
    const cartSummary = items
      .map((i) => `- ${i.productTitle}${i.variantTitle !== 'Default Title' ? ` (${i.variantTitle})` : ''} x${i.quantity}`)
      .join('\n')
    closeCart()
    openQuoteModal({
      sourcePage: 'cart-assist',
      initialMessage: `I have these items in my cart and would like a specialist to double-check my kit before I order:\n${cartSummary}`,
    })
  }

  async function handleCheckout() {
    setCheckingOut(true)
    setError(null)
    try {
      const res = await fetch('/api/store/checkout/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      })
      if (!res.ok) throw new Error('Checkout failed')
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setError('Something went wrong starting checkout. Please try again or call (800) 963-0131.')
      setCheckingOut(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-primary-dark/45 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] sm:rounded-l-[1.75rem] sm:overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between border-b border-primary/[0.06] bg-gradient-to-b from-slate-50 to-white px-5 py-4">
          <h2 className="flex items-center gap-2.5 text-lg font-extrabold text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary-light to-primary text-white shadow-glow-primary">
              <ShoppingCart className="h-4 w-4" />
            </span>
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="grid h-9 w-9 place-items-center rounded-full text-gray-500 ring-1 ring-gray-200 transition-all duration-300 hover:rotate-90 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-slate-50 to-accent/10 ring-1 ring-primary/[0.08]">
              <ShoppingCart className="h-9 w-9 text-primary/30" />
            </span>
            <p className="text-gray-500">Your cart is empty.</p>
            <Link
              href="/kit-builder"
              onClick={closeCart}
              className="btn-sheen rounded-full bg-gradient-to-b from-accent-light to-accent px-6 py-2.5 text-sm font-bold text-white shadow-[0_6px_18px_-6px_rgb(91_164_17/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow-accent"
            >
              Browse the Store
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3 rounded-2xl bg-white p-2.5 shadow-sm ring-1 ring-primary/[0.07]"
                >
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-50 via-white to-accent/10 ring-1 ring-primary/[0.06] overflow-hidden flex-shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.productTitle}
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/${item.productHandle}`}
                      onClick={closeCart}
                      className="text-sm font-bold text-primary hover:text-secondary line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center rounded-full bg-slate-50 ring-1 ring-gray-200">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-primary hover:shadow-sm cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold tabular-nums text-primary">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded-full text-gray-600 transition-colors hover:bg-white hover:text-primary hover:shadow-sm cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="grid h-7 w-7 place-items-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-primary/[0.06] bg-gradient-to-b from-white to-slate-50 px-5 py-4 space-y-3">
              <div className="rounded-xl bg-white px-3.5 py-3 ring-1 ring-primary/[0.07]">
                {subtotal < 500 ? (
                  <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
                    <Truck className="h-3.5 w-3.5 text-accent" />
                    Add {formatPrice(500 - subtotal)} more for free shipping
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-1.5 text-xs font-semibold text-accent-dark">
                    <Truck className="h-3.5 w-3.5" />
                    Your order qualifies for free shipping
                  </p>
                )}
                {/* Visual progress toward the free-shipping threshold */}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-accent-light to-accent transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.min(100, (subtotal / 500) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">Subtotal</span>
                <span className="text-xl font-extrabold text-primary font-[family-name:var(--font-display)]">{formatPrice(subtotal)}</span>
              </div>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-sheen w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-light to-accent px-6 py-3.5 text-base font-bold text-white shadow-[0_8px_22px_-8px_rgb(91_164_17/0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-10px_rgb(91_164_17/0.7)] active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {checkingOut ? 'Starting Checkout…' : 'Secure Checkout'}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                Taxes and shipping calculated at checkout
              </p>
              <button
                type="button"
                onClick={handleSpecialistAssist}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition-all duration-300 hover:ring-primary/50 hover:shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Prefer a specialist? We&apos;ll build your kit with you
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
