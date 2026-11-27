'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { PageLayout } from '@/lib/design-system'
import { Header } from '@/components/layout/Header'
import { HolidayBanner } from '@/components/layout/HolidayBanner'
import { Footer } from '@/components/layout/Footer'
import { getLayoutConfig } from '@/lib/layout-config'
import { QuoteModalProvider } from '@/contexts/QuoteModalContext'
import { CartProvider } from '@/contexts/CartContext'
import { CartDrawer } from '@/components/store/CartDrawer'
import { MobileStickyCta } from '@/components/layout/MobileStickyCta'
import { SiteMotion } from '@/components/layout/SiteMotion'
import { StoreModeProvider } from '@/components/layout/StoreMode'

// Loaded after the page, so the chat never slows the first paint.
const SiteChatGate = dynamic(() => import('@/components/assistant/SiteChatWidget').then((m) => m.SiteChatGate), { ssr: false })

interface GlobalLayoutProps {
  children: React.ReactNode
  /** pricing_settings.public_builder_live: store links become /quote/ (read by the root layout). */
  builderLive?: boolean
}

export function GlobalLayout({ children, builderLive = false }: GlobalLayoutProps) {
  const pathname = usePathname()
  const layout = getLayoutConfig(pathname || '/')

  if (!layout.header && !layout.footer && !layout.pageWrapper) {
    return (
      <StoreModeProvider builderLive={builderLive}>
        <QuoteModalProvider>{children}</QuoteModalProvider>
      </StoreModeProvider>
    )
  }

  return (
    <StoreModeProvider builderLive={builderLive}>
      <QuoteModalProvider>
        <CartProvider>
          <div className="site-canvas min-h-screen text-gray-900">
            <HolidayBanner />
            {layout.header && <Header />}
            {layout.pageWrapper ? (
              <PageLayout id="site-main" className="pb-0 sm:pt-4 sm:pb-8 md:py-8">{children}</PageLayout>
            ) : (
              children
            )}
            {layout.pageWrapper && <SiteMotion rootId="site-main" />}
            {layout.footer && <Footer />}
            {layout.header && <MobileStickyCta />}
            {layout.header && <SiteChatGate />}
          </div>
          <CartDrawer />
        </CartProvider>
      </QuoteModalProvider>
    </StoreModeProvider>
  )
}
