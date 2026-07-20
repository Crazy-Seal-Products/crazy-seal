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
          <span className="ml-auto rounded-full bg-[#5BA411] px-2 py-0.5 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-700 hover:text-[#003365] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      aria-label={`Cart, ${count} items`}
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-[#5BA411] px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  )
}
