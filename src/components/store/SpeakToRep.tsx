'use client'

import { Headset, Phone } from 'lucide-react'
import { twMerge } from 'tailwind-merge'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

/**
 * "Speak to a rep" is always gold across the shop (kit builder, cart, product
 * pages, mobile bar) so it reads as the one help action, apart from the green
 * buy buttons.
 */

export const REP_PHONE = '(800) 963-0131'
export const REP_TEL = 'tel:8009630131'
export const REP_HOURS = 'Mon–Fri, 9am–6pm'

export const REP_GOLD =
  'bg-gradient-to-b from-[#ffe27a] to-[#f5c542] text-primary-dark ring-1 ring-inset ring-[#e3b42a] shadow-[0_8px_22px_-10px_rgb(227_180_42/0.9)] hover:from-[#ffe68e] hover:to-[#f7cb52] hover:shadow-[0_12px_28px_-10px_rgb(227_180_42/0.95)]'

const SIZE = {
  sm: 'h-9 px-3.5 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
} as const

export function SpeakToRepButton({
  sourcePage,
  message,
  label = 'Speak to a rep',
  size = 'md',
  className,
  onOpen,
}: {
  sourcePage: string
  /** Prefills the form, e.g. the kit being built or the cart contents. */
  message?: string | (() => string)
  label?: string
  size?: keyof typeof SIZE
  className?: string
  /** Runs before the form opens, e.g. to close the cart. */
  onOpen?: () => void
}) {
  const { openQuoteModal } = useQuoteModal()
  return (
    <button
      type="button"
      onClick={() => {
        onOpen?.()
        openQuoteModal({ sourcePage, initialMessage: typeof message === 'function' ? message() : message })
      }}
      className={twMerge(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-bold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
        REP_GOLD,
        SIZE[size],
        className,
      )}
    >
      <Headset className={size === 'sm' ? 'h-4 w-4' : 'h-[18px] w-[18px]'} />
      {label}
    </button>
  )
}

export function CallRepLink({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <a
      href={REP_TEL}
      className={twMerge(
        'inline-flex items-center gap-1.5 text-sm font-semibold transition-colors',
        light ? 'text-white/85 hover:text-white' : 'text-primary hover:text-secondary',
        className,
      )}
    >
      <Phone className="h-4 w-4" />
      {REP_PHONE}
    </a>
  )
}
