'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Clicks on these go to the control itself, not the row. */
const INTERACTIVE = 'a, button, input, select, textarea, label, summary, details, [role="button"], [contenteditable="true"]'

/**
 * Makes a whole row open its record: a click anywhere on a table row (or any
 * element marked `data-row`) follows the row's main link, the first
 * `a[data-row-link]` inside it (CellLink adds that). Links, buttons and form
 * controls in the row keep working as before, selecting text doesn't
 * navigate, and Ctrl/Cmd-click or a middle click opens a new tab like a link.
 */
export function RowLinks({ root }: { root: string }) {
  const router = useRouter()
  useEffect(() => {
    const el = document.querySelector(root)
    if (!el) return
    const linkFor = (e: MouseEvent): HTMLAnchorElement | null => {
      const target = e.target as Element | null
      if (!target || target.closest(INTERACTIVE)) return null
      if (window.getSelection()?.toString()) return null
      const row = target.closest('tr, [data-row]')
      return row?.querySelector<HTMLAnchorElement>('a[data-row-link]') ?? null
    }
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0) return
      const link = linkFor(e)
      if (!link) return
      if (e.metaKey || e.ctrlKey || link.target === '_blank') window.open(link.href, '_blank', 'noopener')
      else router.push(link.getAttribute('href') ?? link.href)
    }
    const onAux = (e: MouseEvent) => {
      if (e.button !== 1) return
      const link = linkFor(e)
      if (!link) return
      e.preventDefault()
      window.open(link.href, '_blank', 'noopener')
    }
    el.addEventListener('click', onClick as EventListener)
    el.addEventListener('auxclick', onAux as EventListener)
    return () => {
      el.removeEventListener('click', onClick as EventListener)
      el.removeEventListener('auxclick', onAux as EventListener)
    }
  }, [root, router])
  return null
}
