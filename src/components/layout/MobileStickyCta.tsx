'use client'

import { Phone, MessageSquare } from 'lucide-react'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

/**
 * Sticky bottom bar on mobile: Call + Talk to a Specialist.
 * Rendered on marketing pages only (see GlobalLayout).
 */
export function MobileStickyCta() {
  const { openQuoteModal } = useQuoteModal()

  return (
    <>
      {/* Spacer so fixed bar doesn't cover page content */}
      <div className="h-14 md:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-2">
          <a
            href="tel:8009630131"
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-[#003365]"
          >
            <Phone className="w-4 h-4" />
            Call Us
          </a>
          <button
            type="button"
            onClick={() => openQuoteModal({ sourcePage: 'mobile-sticky' })}
            className="flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white bg-[#5BA411] cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            Talk to a Specialist
          </button>
        </div>
      </div>
    </>
  )
}
