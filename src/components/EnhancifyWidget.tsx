'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function EnhancifyWidget() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(800)

  const syncHeight = useCallback(() => {
    try {
      const body = iframeRef.current?.contentDocument?.body
      if (!body) return
      const h = body.scrollHeight
      if (h > 0) setHeight(h)
    } catch {
      // cross-origin access blocked, keep default height
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(syncHeight, 500)
    return () => clearInterval(interval)
  }, [syncHeight])

  return (
    <iframe
      ref={iframeRef}
      src="/enhancify-widget.html"
      scrolling="no"
      style={{ width: '100%', height, border: 'none', display: 'block', overflow: 'hidden' }}
      title="Financing Application"
    />
  )
}
