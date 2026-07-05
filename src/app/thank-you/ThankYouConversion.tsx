'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export function ThankYouConversion() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'thank_you_page_view',
        conversion_type: 'lead',
        page_path: '/thank-you',
      })
    }
  }, [])

  return null
}
