'use client'

import React from 'react'
import { Flag, Truck } from 'lucide-react'

// Top announcement bar. Swap content seasonally or for promos.
export function HolidayBanner() {
  return (
    <div className="relative overflow-hidden bg-primary-dark text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(91,164,17,0.18),transparent)] bg-[length:200%_100%] animate-shimmer"
      />
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-0.5 py-2 text-center text-xs sm:text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold">
            <Flag className="h-3.5 w-3.5 text-highlight" />
            Manufactured in the USA
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:block" />
          <span className="inline-flex items-center gap-1.5 text-blue-100/85">
            <Truck className="h-3.5 w-3.5 text-accent-light" />
            Free shipping on orders over $500
          </span>
        </div>
      </div>
    </div>
  )
}
