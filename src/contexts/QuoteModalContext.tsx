'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ContactModal } from '@/components/ContactModal'

interface QuoteModalContextValue {
  openQuoteModal: () => void
}

const QuoteModalContext = createContext<QuoteModalContextValue | null>(null)

export function useQuoteModal() {
  const ctx = useContext(QuoteModalContext)
  if (!ctx) throw new Error('useQuoteModal must be used within QuoteModalProvider')
  return ctx
}

export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const openQuoteModal = useCallback(() => setOpen(true), [])
  const closeQuoteModal = useCallback(() => setOpen(false), [])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <QuoteModalContext.Provider value={{ openQuoteModal }}>
      {children}
      <ContactModal open={open} onClose={closeQuoteModal} />
    </QuoteModalContext.Provider>
  )
}
