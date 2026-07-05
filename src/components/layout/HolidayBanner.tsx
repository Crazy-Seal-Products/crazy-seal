'use client'

import React from 'react'

// Top announcement bar. Swap content seasonally or for promos.
export function HolidayBanner() {
  return (
    <div className="bg-[#003365] text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-x-2 py-2 text-center text-xs sm:flex-row sm:text-sm">
          <span className="font-semibold">Manufactured in the USA!</span>
          <span className="text-blue-200">Free shipping on orders over $500.</span>
        </div>
      </div>
    </div>
  )
}
