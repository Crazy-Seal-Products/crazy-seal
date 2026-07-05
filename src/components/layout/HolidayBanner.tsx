'use client'

import React from 'react'

export function HolidayBanner() {
  return (
    <div className="bg-[#B22234] text-white">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-x-2 py-2 text-center text-xs sm:flex-row sm:text-sm">
          <span className="text-base leading-none">🇺🇸</span>
          <span className="font-semibold">Happy Fourth of July!</span>
          <span className="text-red-50">
            Our team is on holiday through the weekend and will return Monday.
          </span>
        </div>
      </div>
    </div>
  )
}
