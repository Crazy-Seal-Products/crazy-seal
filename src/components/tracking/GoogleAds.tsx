'use client'

import { useEffect } from 'react'
import Script from 'next/script'
import { GOOGLE_ADS_ID, rememberGoogleClickFromUrl } from '@/lib/tracking/google-ads'

/**
 * Google tag for Ads account AW-750784920. Loaded on every page so the click
 * id is captured on the landing URL, the same job RV Armor's GTM container does
 * before its lead conversion fires.
 */
export function GoogleAds() {
  useEffect(() => {
    rememberGoogleClickFromUrl()
  }, [])

  if (!GOOGLE_ADS_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=window.gtag||gtag;
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');`}
      </Script>
    </>
  )
}
