'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Section cards, opt-in blocks, and the items of any grid inside a section.
const BLOCK_SELECTOR = '.section-bleed, [data-reveal]'
const ITEM_SELECTOR = '.section-bleed .grid > *, [data-reveal-stagger] > *'
const STAGGER_MS = 90
const SETTLE_MS = 1000

/**
 * Site-wide scroll reveal for marketing pages.
 *
 * Runs after hydration, so the server HTML never differs from the client.
 * Only content that starts below the fold is hidden — above-the-fold content
 * renders as-is — and the reveal classes are removed once the transition
 * settles so no transform lingers (fixed-position descendants stay correct).
 */
export function SiteMotion({ rootId }: { rootId: string }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.getElementById(rootId)
    if (!root) return

    const timers: number[] = []

    const settle = (el: HTMLElement) => {
      el.classList.remove('cs-reveal', 'cs-reveal-item', 'cs-in')
      el.style.removeProperty('--cs-delay')
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          observer.unobserve(el)
          el.classList.add('cs-in')
          const delay = parseFloat(el.style.getPropertyValue('--cs-delay')) || 0
          timers.push(window.setTimeout(() => settle(el), SETTLE_MS + delay))
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
    )

    const prepare = (el: HTMLElement, delay: number, item: boolean) => {
      if (el.classList.contains('cs-reveal')) return
      // Leave elements that animate themselves (framer-motion inline styles) or opt out.
      if (el.style.opacity !== '' || el.style.transform !== '' || el.closest('[data-no-reveal]')) return
      const rect = el.getBoundingClientRect()
      if (rect.height === 0) return
      // Leave anything already on screen (or scrolled past) untouched.
      if (rect.top < window.innerHeight * 0.92) return
      el.classList.add('cs-reveal')
      if (item) el.classList.add('cs-reveal-item')
      if (delay) el.style.setProperty('--cs-delay', `${delay}ms`)
      observer.observe(el)
    }

    const frame = requestAnimationFrame(() => {
      root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR).forEach((el) => prepare(el, 0, false))
      root.querySelectorAll<HTMLElement>(ITEM_SELECTOR).forEach((el) => {
        const index = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0
        prepare(el, (index % 4) * STAGGER_MS, true)
      })
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      timers.forEach((t) => window.clearTimeout(t))
      root.querySelectorAll<HTMLElement>('.cs-reveal').forEach(settle)
    }
  }, [pathname, rootId])

  return null
}
