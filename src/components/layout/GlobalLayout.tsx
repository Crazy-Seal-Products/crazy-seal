'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { PageLayout } from '@/lib/design-system'
import { Header } from '@/components/layout/Header'
import { HolidayBanner } from '@/components/layout/HolidayBanner'
import { Footer } from '@/components/layout/Footer'
import { getLayoutConfig } from '@/lib/layout-config'
import { QuoteModalProvider } from '@/contexts/QuoteModalContext'

interface GlobalLayoutProps {
  children: React.ReactNode
}

export function GlobalLayout({ children }: GlobalLayoutProps) {
  const pathname = usePathname()
  const layout = getLayoutConfig(pathname || '/')

  if (!layout.header && !layout.footer && !layout.pageWrapper) {
    return <QuoteModalProvider>{children}</QuoteModalProvider>
  }

  return (
    <QuoteModalProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <HolidayBanner />
        {layout.header && <Header />}
        {layout.pageWrapper ? (
          <PageLayout className="pb-0 sm:pt-4 sm:pb-8 md:py-8">{children}</PageLayout>
        ) : (
          children
        )}
        {layout.footer && <Footer />}
      </div>
    </QuoteModalProvider>
  )
}
