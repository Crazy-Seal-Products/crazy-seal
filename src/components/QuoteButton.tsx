'use client'

import { Calculator, Phone } from 'lucide-react'
import { LinkButton } from '@/lib/design-system'
import { useQuoteModal } from '@/contexts/QuoteModalContext'

interface QuoteButtonProps {
  children?: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
  lg: 'px-6 py-3 text-base',
}

export function QuoteButton({
  children = 'Get in Touch',
  className,
  size = 'md',
}: QuoteButtonProps) {
  const { openQuoteModal } = useQuoteModal()

  return (
    <button
      onClick={openQuoteModal}
      className={
        className ??
        `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 bg-accent text-white hover:bg-accent-dark shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(91,164,17,0.3)] hover:-translate-y-0.5 cursor-pointer ${SIZE_CLASSES[size]}`
      }
    >
      {children}
      <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
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
}

export function QuoteCta({
  quoteText,
  showPhone = true,
  phoneVariant = 'outline',
  className,
}: QuoteCtaProps) {
  return (
    <div className={`flex flex-row flex-wrap items-center justify-center gap-3 ${className ?? ''}`}>
      <QuoteButton size="md">{quoteText}</QuoteButton>
      {showPhone && (
        <LinkButton href={`tel:${PHONE_NUMBER}`} variant={phoneVariant} size="md" className="sm:px-6 sm:py-3 sm:text-base">
          <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
          {PHONE_DISPLAY}
        </LinkButton>
      )}
    </div>
  )
}
