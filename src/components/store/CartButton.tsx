'use client'

import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

export function CartButton({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const { count, openCart } = useCart()

  if (variant === 'mobile') {
    return (
      <button
        onClick={openCart}
        className="relative flex items-center gap-2 px-4 py-3 text-base font-medium text-gray-700 cursor-pointer"
        aria-label={`Cart, ${count} items`}
      >
        <ShoppingCart className="w-5 h-5" />
        Cart
        {count > 0 && (
          <span className="ml-auto rounded-full bg-gradient-to-b from-accent-light to-accent px-2 py-0.5 text-xs font-bold text-white shadow-glow-accent">
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={openCart}
      className="group relative rounded-full p-2 text-gray-700 transition-all duration-300 hover:bg-primary/[0.06] hover:text-primary cursor-pointer"
      aria-label={`Cart, ${count} items`}
    >
      <ShoppingCart className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" />
      {count > 0 && (
        <span
          key={count}
          className="animate-in [--cs-enter-scale:0.4] absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-gradient-to-b from-accent-light to-accent px-1 text-[10px] font-bold text-white shadow-[0_4px_10px_-2px_rgb(91_164_17/0.6)] ring-2 ring-white"
        >
          {count}
        </span>
      )}
    </button>
  )
}
