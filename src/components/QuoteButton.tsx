'use client'

import { MessageSquare, Phone } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

interface QuoteButtonProps {
  children?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
  /** Attribution label sent with the lead (defaults to current pathname via context). */
  sourcePage?: string
  /** Prefills the contact form message, e.g. product or page context. */
  initialMessage?: string
}

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
  lg: 'px-6 py-3 text-base',
}

export function QuoteButton({
  children = 'Talk to a Specialist',
  className,
  size = 'md',
  sourcePage,
  initialMessage,
}: QuoteButtonProps) {
  const { openQuoteModal } = useQuoteModal()

  return (
    <button
      onClick={() => openQuoteModal({ sourcePage, initialMessage })}
      className={
        className ??
        `btn-sheen inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 bg-gradient-to-b from-accent-light to-accent text-white shadow-[0_6px_18px_-6px_rgba(91,164,17,0.6)] hover:shadow-[0_14px_30px_-10px_rgba(91,164,17,0.65)] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${SIZE_CLASSES[size]}`
      }
    >
      {children}
      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  )
}

const PHONE_NUMBER = '8009630131'
const PHONE_DISPLAY = '(800) 963-0131'

interface QuoteCtaProps {
  quoteText?: string
  showPhone?: boolean
  phoneVariant?: 'outline' | 'outline-white'
  className?: string
  sourcePage?: string
}

export function QuoteCta({
  quoteText,
  showPhone = true,
  phoneVariant = 'outline',
  className,
  sourcePage,
}: QuoteCtaProps) {
  return (
    <div className={`flex flex-row flex-wrap items-center justify-center gap-3 ${className ?? ''}`}>
      <QuoteButton size="md" sourcePage={sourcePage}>{quoteText}</QuoteButton>
      {showPhone && (
        <LinkButton href={`tel:${PHONE_NUMBER}`} variant={phoneVariant} size="md" className="sm:px-6 sm:py-3 sm:text-base">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          {PHONE_DISPLAY}
        </LinkButton>
      )}
    </div>
  )
}
