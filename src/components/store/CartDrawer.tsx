'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, Minus, Plus, Trash2, ShoppingCart, Lock } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/store/products'

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart()
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[61] h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#003365] flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart
          </h2>
          <button
            onClick={closeCart}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300" />
            <p className="text-gray-500">Your cart is empty.</p>
            <Link
              href="/store"
              onClick={closeCart}
              className="rounded-full bg-[#5BA411] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4A870E] transition-colors"
            >
              Browse the Store
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.productTitle}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/store/${item.productHandle}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-gray-900 hover:text-[#003365] line-clamp-2"
                    >
                      {item.productTitle}
                    </Link>
                    {item.variantTitle !== 'Default Title' && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.variantTitle}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-300 rounded-full">
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-gray-600 hover:text-[#003365] cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          className="p-1.5 text-gray-600 hover:text-[#003365] cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
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

            <div className="border-t border-gray-200 px-5 py-4 space-y-3">
              {subtotal < 500 ? (
                <p className="text-xs text-gray-500 text-center">
                  Add {formatPrice(500 - subtotal)} more for free shipping
                </p>
              ) : (
                <p className="text-xs font-semibold text-[#5BA411] text-center">
                  Your order qualifies for free shipping
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-700">Subtotal</span>
                <span className="text-xl font-bold text-[#003365]">{formatPrice(subtotal)}</span>
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-[#5BA411] px-6 py-3.5 text-base font-semibold text-white hover:bg-[#4A870E] transition-colors disabled:opacity-60 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                {checkingOut ? 'Starting Checkout…' : 'Secure Checkout'}
              </button>
              <p className="text-[11px] text-gray-400 text-center">
                Taxes and shipping calculated at checkout
              </p>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
