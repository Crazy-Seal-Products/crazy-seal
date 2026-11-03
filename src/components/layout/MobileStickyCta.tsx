'use client'

import { Phone, Headset } from 'lucide-react'
import { useQuoteModal } from '@/contexts/QuoteModalContext'
import { REP_GOLD } from '@/components/store/SpeakToRep'

/**
 * Sticky bottom bar on mobile: Call + Speak to a rep (gold, like every rep
 * button on the site).
 * Rendered on marketing pages only (see GlobalLayout).
 */
export function MobileStickyCta() {
  const { openQuoteModal } = useQuoteModal()

  return (
    <>
      {/* Spacer so fixed bar doesn't cover page content */}
      <div className="h-14 md:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/90 backdrop-blur-xl border-t border-primary/[0.08] shadow-[0_-10px_30px_-12px_rgba(0,32,67,0.25)] pb-[env(safe-area-inset-bottom)]">
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
            className={`flex items-center justify-center gap-2 py-3.5 text-sm font-bold cursor-pointer ${REP_GOLD}`}
          >
            <Headset className="w-4 h-4" />
            Speak to a Rep
          </button>
        </div>
      </div>
    </>
  )
}
