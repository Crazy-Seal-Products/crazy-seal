'use client'

import Script from 'next/script'

/**
 * ClickCease click-fraud protection tag.
 *
 * ClickCease identifies the account by domain, so no per-account id is
 * embedded in the script. Gated on NEXT_PUBLIC_CLICKCEASE_ID (set to any
 * value, e.g. "1", to enable) so it stays inert until configured.
 */
export function ClickCease() {
  if (!process.env.NEXT_PUBLIC_CLICKCEASE_ID) return null

  return (
    <>
      <Script
        id="clickcease"
        src="https://www.clickcease.com/monitor/stat.js"
        strategy="afterInteractive"
      />
      <noscript>
        <a href="https://www.clickcease.com" rel="nofollow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://monitor.clickcease.com/stats/stats.aspx" alt="ClickCease" />
        </a>
      </noscript>
    </>
  )
}
