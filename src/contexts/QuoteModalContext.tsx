'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ContactModal } from '@/components/ContactModal'

export interface QuoteModalOptions {
  /** Where the lead came from, e.g. 'header', 'mobile-sticky', 'store/rv-roof-kit'. Defaults to the current pathname. */
  sourcePage?: string
  /** Prefills the message field, e.g. product or cart context. */
  initialMessage?: string
}

interface QuoteModalContextValue {
  openQuoteModal: (options?: QuoteModalOptions) => void
}

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null)

export function useQuoteModal() {
  const ctx = useContext(QuoteModalContext)
  if (!ctx) throw new Error('useQuoteModal must be used within QuoteModalProvider')
  return ctx
}

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<QuoteModalOptions>({})
  const pathname = usePathname()

  const openQuoteModal = useCallback((opts?: QuoteModalOptions) => {
    setOptions(opts ?? {})
    setOpen(true)
  }, [])
  const closeQuoteModal = useCallback(() => setOpen(false), [])

  // Close the modal when the route changes (render-time state adjustment,
  // see react.dev "You Might Not Need an Effect")
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  const fallbackSource = pathname === '/' ? 'home' : pathname.replace(/^\//, '')

  return (
    <QuoteModalContext.Provider value={{ openQuoteModal }}>
      {children}
      <ContactModal
        open={open}
        onClose={closeQuoteModal}
        sourcePage={options.sourcePage ?? `quote-modal:${fallbackSource}`}
        initialMessage={options.initialMessage}
      />
    </QuoteModalContext.Provider>
  )
}
